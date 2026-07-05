<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
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
        'image_path',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'discount' => 'decimal:2',
            'cost' => 'decimal:2',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
            'featured' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Product $product): void {
            if (blank($product->slug)) {
                $product->slug = static::generateUniqueSlug($product->name);
            }
        });
    }

    private static function generateUniqueSlug(string $name): string
    {
        $baseSlug = Str::slug($name) ?: 'product';
        $slug = $baseSlug;
        $suffix = 2;

        while (static::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    public function stockItem(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(StockItem::class);
    }

    public function saleItems(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SaleItem::class);
    }
}
