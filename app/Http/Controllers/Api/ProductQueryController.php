<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductStoreRequest;
use App\Http\Requests\ProductUpdateRequest;
use App\Models\Product;
use App\Models\ProductHistory;
use App\Models\StockItem;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;

class ProductQueryController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->with('stockItem')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $products->map(fn (Product $product) => $this->formatProduct($product)),
        ]);
    }

    public function store(ProductStoreRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $user = $request->user();

        $product = Product::query()->create(Arr::only($payload, [
            'name',
            'slug',
            'sku',
            'barcode',
            'price',
            'description',
            'discount',
            'cost',
            'uom',
            'is_active',
            'is_public',
            'featured',
        ]));

        // Create initial stock
        StockItem::query()->create([
            'product_id' => $product->id,
            'on_hand' => $payload['stock'],
        ]);

        // Audit: Log product creation
        ProductHistory::logChange(
            productId: $product->id,
            actorId: $user->id,
            event: ProductHistory::EVENT_CREATED,
            oldValues: [],
            newValues: [
                'name' => $product->name,
                'price' => (float) $product->price,
                'cost' => $product->cost ? (float) $product->cost : null,
                'stock' => (float) $payload['stock'],
            ],
            note: 'Produk baru dibuat'
        );

        // Audit: Log initial stock
        StockMovement::query()->create([
            'product_id' => $product->id,
            'type' => 'INITIAL_STOCK',
            'qty_delta' => $payload['stock'],
            'ref_type' => 'product_creation',
            'ref_id' => (string) $product->id,
            'note' => 'Stok awal produk',
            'created_by' => $user->id,
        ]);

        $product->load('stockItem');

        return response()->json([
            'data' => $this->formatProduct($product),
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load('stockItem');

        return response()->json([
            'data' => $this->formatProduct($product),
        ]);
    }

    public function update(ProductUpdateRequest $request, Product $product): JsonResponse
    {
        $payload = $request->validated();
        $user = $request->user();

        // Capture old values before changes
        $oldValues = [
            'name' => $product->name,
            'price' => (float) $product->price,
            'cost' => $product->cost ? (float) $product->cost : null,
            'discount' => (float) ($product->discount ?? 0),
        ];

        // Get current stock before change
        $currentStock = $product->stockItem?->on_hand ?? 0;

        // Update allowed fields
        $product->fill(Arr::only($payload, [
            'name',
            'slug',
            'sku',
            'barcode',
            'price',
            'description',
            'discount',
            'cost',
            'uom',
            'is_active',
            'is_public',
            'featured',
        ]));
        $product->save();

        // Handle stock changes with validation
        $stockChanged = false;
        $oldStock = $currentStock;
        $newStock = $currentStock;

        if (array_key_exists('stock', $payload)) {
            $requestedStock = (float) $payload['stock'];
            $stockDelta = $requestedStock - $currentStock;

            // Only log if stock actually changed
            if (abs($stockDelta) > 0.001) {
                $stockChanged = true;
                $newStock = $requestedStock;

                // Update stock
                StockItem::query()->updateOrCreate(
                    ['product_id' => $product->id],
                    ['on_hand' => $requestedStock]
                );

                // Audit: Log stock movement
                StockMovement::query()->create([
                    'product_id' => $product->id,
                    'type' => $stockDelta > 0 ? 'STOCK_IN' : 'STOCK_OUT',
                    'qty_delta' => abs($stockDelta),
                    'ref_type' => 'manual_adjustment',
                    'ref_id' => (string) $product->id,
                    'note' => "Penyesuaian stok manual: {$currentStock} → {$requestedStock}",
                    'created_by' => $user->id,
                ]);
            }
        }

        // Audit: Log price/cost changes if any
        $newValues = [
            'name' => $product->name,
            'price' => (float) $product->price,
            'cost' => $product->cost ? (float) $product->cost : null,
            'discount' => (float) ($product->discount ?? 0),
        ];

        $priceChanged = abs($oldValues['price'] - $newValues['price']) > 0.001;
        $costChanged = abs(($oldValues['cost'] ?? 0) - ($newValues['cost'] ?? 0)) > 0.001;

        if ($priceChanged || $costChanged || $stockChanged) {
            ProductHistory::logChange(
                productId: $product->id,
                actorId: $user->id,
                event: ProductHistory::EVENT_UPDATED,
                oldValues: array_merge($oldValues, ['stock' => $oldStock]),
                newValues: array_merge($newValues, ['stock' => $newStock]),
                note: $this->buildChangeNote($oldValues, $newValues, $oldStock, $newStock)
            );
        }

        $product->load('stockItem');

        return response()->json([
            'data' => $this->formatProduct($product),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $user = request()->user();
        $productId = $product->id;
        $productName = $product->name;

        // Audit: Log deletion before actually deleting
        ProductHistory::logChange(
            productId: $productId,
            actorId: $user->id,
            event: ProductHistory::EVENT_DELETED,
            oldValues: [
                'name' => $productName,
                'price' => (float) $product->price,
                'cost' => $product->cost ? (float) $product->cost : null,
                'stock' => $product->stockItem?->on_hand ?? 0,
            ],
            newValues: [],
            note: "Produk {$productName} dihapus"
        );

        StockItem::query()->where('product_id', $product->id)->delete();
        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus.',
        ]);
    }

    /**
     * Get product change history
     */
    public function history(Product $product): JsonResponse
    {
        $productHistory = ProductHistory::query()
            ->with('actor:id,name')
            ->where('product_id', $product->id)
            ->orderByDesc('occurred_at')
            ->limit(50)
            ->get();

        $stockMovement = StockMovement::query()
            ->with('creator:id,name')
            ->where('product_id', $product->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return response()->json([
            'data' => [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'changes' => $productHistory->map(fn (ProductHistory $h) => [
                    'id' => $h->id,
                    'event' => $h->event,
                    'actor' => $h->actor?->name ?? 'System',
                    'old_values' => $h->old_values,
                    'new_values' => $h->new_values,
                    'note' => $h->note,
                    'occurred_at' => $h->occurred_at?->format('d/m/Y H:i:s'),
                ]),
                'stock_movements' => $stockMovement->map(fn (StockMovement $m) => [
                    'id' => $m->id,
                    'type' => $m->type,
                    'qty_delta' => (float) $m->qty_delta,
                    'actor' => $m->creator?->name ?? 'System',
                    'note' => $m->note,
                    'occurred_at' => $m->created_at?->format('d/m/Y H:i:s'),
                ]),
            ],
        ]);
    }

    private function formatProduct(Product $product): array
    {
        $product->loadMissing('stockItem');

        $price = (float) $product->price;
        $discount = (float) ($product->discount ?? 0);
        $priceAfterDiscount = max(0, $price - ($price * $discount / 100));

        return [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'barcode' => $product->barcode,
            'price' => $price,
            'discount' => $discount,
            'price_after_discount' => round($priceAfterDiscount, 2),
            'cost' => $product->cost !== null ? (float) $product->cost : null,
            'uom' => $product->uom,
            'stock' => $product->stockItem?->on_hand !== null ? (float) $product->stockItem->on_hand : 0.0,
            'is_active' => (bool) $product->is_active,
            'status' => $product->is_active ? 'ACTIVE' : 'INACTIVE',
        ];
    }

    /**
     * Build human-readable change note
     */
    private function buildChangeNote(array $old, array $new, float $oldStock, float $newStock): string
    {
        $changes = [];

        if (abs(($old['price'] ?? 0) - ($new['price'] ?? 0)) > 0.001) {
            $changes[] = sprintf('Harga: Rp%s → Rp%s', number_format($old['price'], 0, ',', '.'), number_format($new['price'], 0, ',', '.'));
        }

        if (abs(($old['cost'] ?? 0) - ($new['cost'] ?? 0)) > 0.001) {
            $changes[] = sprintf('Cost: Rp%s → Rp%s', number_format($old['cost'] ?? 0, 0, ',', '.'), number_format($new['cost'] ?? 0, 0, ',', '.'));
        }

        if (abs($oldStock - $newStock) > 0.001) {
            $changes[] = sprintf('Stok: %.0f → %.0f', $oldStock, $newStock);
        }

        return implode(' | ', $changes) ?: 'Tidak ada perubahan';
    }
}
