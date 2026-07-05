<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryRecommendation;
use App\Models\Product;
use App\Models\SaleItem;
use Illuminate\Http\JsonResponse;

class InventoryRecommendationController extends Controller
{
    public function index(): JsonResponse
    {
        $endDate = now()->endOfDay();
        $startDate = now()->subDays(6)->startOfDay();

        $salesByProduct = SaleItem::query()
            ->selectRaw('product_id, SUM(qty) as qty_sum')
            ->whereHas('sale', function ($query) use ($startDate, $endDate) {
                $query->where('status', 'PAID')
                    ->whereBetween('occurred_at', [$startDate, $endDate]);
            })
            ->groupBy('product_id')
            ->get()
            ->keyBy('product_id');

        $products = Product::query()
            ->with('stockItem')
            ->get();

        $productIds = $products->pluck('id');

        $recommendationMeta = InventoryRecommendation::query()
            ->whereIn('product_id', $productIds)
            ->get()
            ->keyBy('product_id');

        $items = $products->map(function (Product $product) use ($salesByProduct, $recommendationMeta) {
            $sales = $salesByProduct->get($product->id);
            $meta = $recommendationMeta->get($product->id);

            $avgSales7d = $sales ? ((float) $sales->qty_sum / 7) : 0.0;
            $leadTime = $meta?->lead_time_days ?? 3;
            $safetyStock = (float) ($meta?->safety_stock ?? 0);
            $reorderPoint = ($avgSales7d * $leadTime) + $safetyStock;
            $currentStock = $product->stockItem?->on_hand !== null ? (float) $product->stockItem->on_hand : 0.0;
            $suggestedQty = max(0, $reorderPoint - $currentStock);

            $status = 'SAFE';
            if ($reorderPoint > 0 && $currentStock <= $reorderPoint) {
                $status = $currentStock <= $safetyStock && $safetyStock > 0 ? 'CRITICAL' : 'WARNING';
            }

            return [
                'id' => $product->id,
                'productName' => $product->name,
                'sku' => $product->sku,
                'stock' => round($currentStock, 3),
                'avgSales7d' => round($avgSales7d, 3),
                'leadTime' => (int) $leadTime,
                'reorderPoint' => round($reorderPoint, 3),
                'suggestedQty' => round($suggestedQty, 3),
                'status' => $status,
            ];
        })
            ->filter(fn (array $item) => $item['status'] !== 'SAFE')
            ->sortBy([
                fn (array $item) => $item['status'] === 'CRITICAL' ? 0 : 1,
                fn (array $item) => $item['stock'],
            ])
            ->values();

        return response()->json([
            'data' => $items,
            'meta' => [
                'window_days' => 7,
                'computed_at' => now()->toDateTimeString(),
            ],
        ]);
    }
}
