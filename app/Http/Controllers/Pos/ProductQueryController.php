<?php

namespace App\Http\Controllers\Pos;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductQueryController
{
    public function fetch(): array
    {
        $rows = Product::query()
            ->leftJoin('stock_items', 'products.id', '=', 'stock_items.product_id')
            ->select('products.id', 'products.name', 'products.sku', 'products.price', 'products.discount', 'products.category', 'products.image_path', DB::raw('COALESCE(stock_items.on_hand, 0) as stock'))
            ->where('products.is_active', true)
            ->orderBy('products.name')
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'name' => $r->name,
                    'sku' => $r->sku,
                    'price' => (float) $r->price,
                    'discount' => (float) ($r->discount ?? 0),
                    'stock' => (int) $r->stock,
                    'category' => $r->category,
                    'imageUrl' => $r->image_path ? Storage::disk('public')->url($r->image_path) : null,
                    'isFavorite' => false,
                    'imageColor' => null,
                ];
            })->all();

        return $rows;
    }
}
