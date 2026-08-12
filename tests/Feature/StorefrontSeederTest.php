<?php

namespace Tests\Feature;

use App\Models\Product;
use Database\Seeders\StorefrontSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StorefrontSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_storefront_seeder_creates_the_four_catalog_products_with_their_images(): void
    {
        $storage = Storage::fake('public');

        $this->seed(StorefrontSeeder::class);

        $this->assertDatabaseHas('products', ['sku' => 'CR-001', 'name' => 'Kripik Pisang', 'category' => 'Camilan', 'image_path' => 'products/pisang.webp', 'weight_grams' => 250]);
        $this->assertDatabaseHas('products', ['sku' => 'CR-002', 'name' => 'Kripik Pisang Madu', 'category' => 'Camilan', 'image_path' => 'products/pisangMadu.webp', 'weight_grams' => 250]);
        $this->assertDatabaseHas('products', ['sku' => 'CR-003', 'name' => 'Kripik Singkong', 'category' => 'Camilan', 'image_path' => 'products/singkong.webp', 'weight_grams' => 200]);
        $this->assertDatabaseHas('products', ['sku' => 'CR-004', 'name' => 'Rempeyek', 'category' => 'Camilan', 'image_path' => 'products/rempeyek.webp', 'weight_grams' => 200]);
        $this->assertSame(4, Product::query()->count());
        $storage->assertExists('products/pisang.webp');
        $storage->assertExists('products/pisangMadu.webp');
        $storage->assertExists('products/singkong.webp');
        $storage->assertExists('products/rempeyek.webp');
    }

    public function test_storefront_products_have_shipping_weights_without_overwriting_admin_values(): void
    {
        Storage::fake('public');

        $this->seed(StorefrontSeeder::class);

        Product::query()->where('sku', 'CR-001')->update(['weight_grams' => 375]);
        $this->seed(StorefrontSeeder::class);

        $this->assertDatabaseHas('products', ['sku' => 'CR-001', 'weight_grams' => 375]);
    }
}
