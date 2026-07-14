<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StorefrontTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_access_landing_with_active_products(): void
    {
        $product = Product::factory()->create([
            'name' => 'Keripik Pisang',
            'slug' => 'keripik-pisang',
            'is_active' => true,
            'is_public' => true,
            'featured' => true,
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('storefront/LandingPage')
                ->where('products.data.0.id', $product->id)
                ->missing('products.data.0.cost'));
    }

    public function test_guest_can_open_catalog_with_search(): void
    {
        Product::factory()->create([
            'name' => 'Keripik Pisang',
            'slug' => 'keripik-pisang',
            'is_active' => true,
            'is_public' => true,
        ]);
        Product::factory()->create([
            'name' => 'Produk Internal',
            'slug' => 'produk-internal',
            'is_active' => true,
            'is_public' => false,
        ]);

        $this->get('/katalog?q=pisang')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('storefront/LandingPage')
                ->where('products.data.0.name', 'Keripik Pisang')
                ->missing('products.data.0.cost'));
    }

    public function test_guest_can_access_public_product_detail_by_slug(): void
    {
        $product = Product::factory()->create([
            'name' => 'Stik Talas',
            'slug' => 'stik-talas',
            'is_active' => true,
            'is_public' => true,
        ]);

        $this->get('/katalog/stik-talas')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('storefront/KatalogDetailPage')
                ->where('product.id', $product->id)
                ->missing('product.cost'));
    }

    public function test_guest_cannot_access_non_public_product_detail(): void
    {
        Product::factory()->create([
            'slug' => 'produk-internal',
            'is_active' => true,
            'is_public' => false,
        ]);

        $this->get('/katalog/produk-internal')->assertNotFound();
    }

    public function test_catalog_can_be_disabled_without_exposing_products(): void
    {
        AppSetting::query()->create([
            'key' => 'catalog.settings',
            'value' => [
                'enabled' => false,
                'whatsapp_enabled' => true,
                'whatsapp_message_template' => 'Halo, saya tertarik dengan {product_name} seharga {price}. Qty: {qty}.',
            ],
        ]);

        Product::factory()->create([
            'is_active' => true,
            'is_public' => true,
            'featured' => true,
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('storefront/LandingPage')
                ->where('catalog.enabled', false)
                ->where('products', null));
    }
}
