<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductStoreRequest;
use App\Http\Requests\ProductUpdateRequest;
use App\Models\Product;
use App\Models\StockItem;
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

        StockItem::query()->create([
            'product_id' => $product->id,
            'on_hand' => $payload['stock'],
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

        if (array_key_exists('stock', $payload)) {
            StockItem::query()->updateOrCreate(
                ['product_id' => $product->id],
                ['on_hand' => $payload['stock']]
            );
        }

        $product->load('stockItem');

        return response()->json([
            'data' => $this->formatProduct($product),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        StockItem::query()->where('product_id', $product->id)->delete();
        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus.',
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
}
