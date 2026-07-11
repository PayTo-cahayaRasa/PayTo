<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryRecommendation;
use App\Models\Refund;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();

        $refundsSubquery = Refund::query()
            ->selectRaw('sale_id, SUM(total_amount) as refund_total')
            ->groupBy('sale_id');

        $todaySalesTotal = (float) Sale::query()
            ->leftJoinSub($refundsSubquery, 'refunds', 'refunds.sale_id', '=', 'sales.id')
            ->where('status', 'PAID')
            ->whereBetween('occurred_at', [$todayStart, $todayEnd])
            ->selectRaw('SUM(grand_total - COALESCE(refunds.refund_total, 0)) as total')
            ->value('total');

        $todayTransactions = (int) Sale::query()
            ->where('status', 'PAID')
            ->whereBetween('occurred_at', [$todayStart, $todayEnd])
            ->count();

        $sourceSummary = Sale::query()
            ->selectRaw('source, COUNT(*) as transactions, SUM(grand_total) as total')
            ->where('status', 'PAID')
            ->groupBy('source')
            ->get()
            ->keyBy('source');

        $trendStart = now()->subDays(6)->startOfDay();
        $trendEnd = now()->endOfDay();

        $trendRows = Sale::query()
            ->leftJoinSub($refundsSubquery, 'refunds', 'refunds.sale_id', '=', 'sales.id')
            ->selectRaw('DATE(occurred_at) as date_key, SUM(grand_total - COALESCE(refunds.refund_total, 0)) as total')
            ->where('status', 'PAID')
            ->whereBetween('occurred_at', [$trendStart, $trendEnd])
            ->groupBy('date_key')
            ->orderBy('date_key')
            ->get()
            ->keyBy('date_key');

        $weeklyTrend = [];
        $cursor = Carbon::parse($trendStart);
        while ($cursor->lte($trendEnd)) {
            $dateKey = $cursor->toDateString();
            $weeklyTrend[] = [
                'date' => $dateKey,
                'total' => $trendRows->has($dateKey) ? (float) $trendRows->get($dateKey)->total : 0.0,
            ];
            $cursor->addDay();
        }

        $lowStockItems = InventoryRecommendation::query()
            ->leftJoin('stock_items', 'stock_items.product_id', '=', 'inventory_recommendations.product_id')
            ->leftJoin('products', 'products.id', '=', 'inventory_recommendations.product_id')
            ->select([
                'inventory_recommendations.product_id',
                'products.name',
                'products.sku',
                'stock_items.on_hand',
                'inventory_recommendations.safety_stock',
                'inventory_recommendations.reorder_point',
            ])
            ->whereNotNull('stock_items.on_hand')
            ->whereRaw('stock_items.on_hand <= CASE WHEN inventory_recommendations.safety_stock > 0 THEN inventory_recommendations.safety_stock ELSE inventory_recommendations.reorder_point END')
            ->orderBy('stock_items.on_hand')
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'id' => (int) $item->product_id,
                'name' => $item->name,
                'sku' => $item->sku,
                'stock' => $item->on_hand !== null ? (float) $item->on_hand : null,
                'safety_stock' => $item->safety_stock !== null ? (float) $item->safety_stock : null,
                'reorder_point' => $item->reorder_point !== null ? (float) $item->reorder_point : null,
            ]);

        $recentSales = Sale::query()
            ->with([
                'cashier:id,name',
                'payments' => fn ($query) => $query->orderBy('created_at'),
            ])
            ->where('status', 'PAID')
            ->orderByDesc('occurred_at')
            ->limit(5)
            ->get();

        $recentActivities = $recentSales->map(function (Sale $sale): array {
            $payment = $sale->payments->first();
            $invoice = $sale->server_invoice_no ?: $sale->local_txn_uuid ?: (string) $sale->id;
            $occurredAt = $sale->occurred_at ?: $sale->created_at;

            return [
                'id' => $sale->id,
                'title' => "Pembayaran #{$invoice}",
                'amount' => (float) ($payment?->amount ?? $sale->paid_total ?? $sale->grand_total ?? 0),
                'method' => $payment?->method ?? 'UNKNOWN',
                'cashier' => $sale->cashier?->name ?? 'Kasir',
                'time' => $occurredAt?->locale('id')->diffForHumans() ?? 'Baru saja',
            ];
        });

        return response()->json([
            'data' => [
                'today_sales_total' => $todaySalesTotal,
                'today_transactions' => $todayTransactions,
                'source_summary' => collect(['WALK_IN', 'WHATSAPP'])->mapWithKeys(fn (string $source): array => [
                    $source => [
                        'transactions' => (int) ($sourceSummary->get($source)->transactions ?? 0),
                        'total' => (float) ($sourceSummary->get($source)->total ?? 0),
                    ],
                ]),
                'low_stock' => [
                    'total' => $lowStockItems->count(),
                    'items' => $lowStockItems->values(),
                ],
                'weekly_sales_trend' => $weeklyTrend,
                'recent_activities' => $recentActivities,
            ],
        ]);
    }
}
