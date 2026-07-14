<?php

namespace Tests\Feature;

use App\Models\Product;
use Database\Seeders\StorefrontSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StorefrontSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_storefront_products_have_shipping_weights_without_overwriting_admin_values(): void
    {
        $this->seed(StorefrontSeeder::class);

        $this->assertDatabaseHas('products', ['sku' => 'CR-001', 'weight_grams' => 250]);
        $this->assertDatabaseHas('products', ['sku' => 'CR-002', 'weight_grams' => 250]);
        $this->assertDatabaseHas('products', ['sku' => 'CR-003', 'weight_grams' => 200]);

        Product::query()->where('sku', 'CR-001')->update(['weight_grams' => 375]);
        $this->seed(StorefrontSeeder::class);

        $this->assertDatabaseHas('products', ['sku' => 'CR-001', 'weight_grams' => 375]);
    }
}
