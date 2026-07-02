<?php

namespace Tests\Feature;

use App\Models\Product;
use Database\Seeders\ProductReportSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSlugTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_generates_slug_when_it_is_not_provided(): void
    {
        $product = Product::factory()->create([
            'name' => 'Single Origin Espresso',
        ]);

        $this->assertSame('single-origin-espresso', $product->slug);
    }

    public function test_product_generates_a_unique_slug_for_duplicate_names(): void
    {
        $firstProduct = Product::factory()->create([
            'name' => 'Kopi Susu',
        ]);
        $secondProduct = Product::factory()->create([
            'name' => 'Kopi Susu',
        ]);

        $this->assertSame('kopi-susu', $firstProduct->slug);
        $this->assertSame('kopi-susu-2', $secondProduct->slug);
    }

    public function test_product_report_seeder_includes_required_slugs(): void
    {
        $this->seed(ProductReportSeeder::class);

        $this->assertDatabaseHas('products', [
            'sku' => 'COF-ESP-001',
            'slug' => 'single-origin-espresso',
        ]);
    }
}
