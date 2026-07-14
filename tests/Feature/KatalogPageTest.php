<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class KatalogPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_landing_page_renders_active_backend_products(): void
    {
        Product::factory()->create([
            'name' => 'Keripik Pisang',
            'slug' => 'keripik-pisang',
            'is_active' => true,
            'is_public' => true,
            'featured' => false,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/LandingPage')
            ->url('/')
            ->where('products.data.0.name', 'Keripik Pisang')
        );
    }

    public function test_public_catalog_page_renders_backend_catalog(): void
    {
        Product::factory()->create([
            'name' => 'Keripik Pisang',
            'slug' => 'keripik-pisang',
            'is_active' => true,
            'is_public' => true,
        ]);

        $response = $this->get('/katalog');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/LandingPage')
            ->url('/katalog')
            ->where('products.data.0.name', 'Keripik Pisang')
        );
    }

    public function test_public_catalog_page_with_query_filters_products(): void
    {
        Product::factory()->create([
            'name' => 'Keripik Pisang',
            'slug' => 'keripik-pisang',
            'is_active' => true,
            'is_public' => true,
        ]);
        Product::factory()->create([
            'name' => 'Stik Talas',
            'slug' => 'stik-talas',
            'is_active' => true,
            'is_public' => true,
        ]);

        $response = $this->get('/katalog?q=pisang');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/LandingPage')
            ->url('/katalog?q=pisang')
            ->where('products.data.0.name', 'Keripik Pisang')
            ->where('products.data', fn ($products): bool => $products->count() === 1)
        );
    }

    public function test_public_catalog_detail_page_returns_a_successful_response(): void
    {
        $product = Product::factory()->create([
            'slug' => 'keripik-pisang',
            'is_active' => true,
            'is_public' => true,
        ]);

        $response = $this->get('/katalog/keripik-pisang');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/KatalogDetailPage')
            ->url('/katalog/keripik-pisang')
            ->where('product.id', $product->id)
        );
    }

    public function test_missing_public_catalog_detail_page_returns_not_found(): void
    {
        $response = $this->get('/katalog/produk-hilang');

        $response->assertNotFound();
    }
}
