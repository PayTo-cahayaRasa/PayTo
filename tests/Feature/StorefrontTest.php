<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
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

    public function test_storefront_catalog_returns_all_active_owner_products(): void
    {
        $product = Product::factory()->create([
            'name' => 'Produk Owner Aktif',
            'slug' => 'produk-owner-aktif',
            'is_active' => true,
            'is_public' => false,
        ]);

        $this->get('/katalog')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('products.data.0.id', $product->id));
    }

    public function test_guest_can_access_public_product_detail_by_slug(): void
    {
        Storage::fake('public');

        $product = Product::factory()->create([
            'name' => 'Stik Talas',
            'slug' => 'stik-talas',
            'is_active' => true,
            'is_public' => true,
            'image_path' => 'products/stik-talas.jpg',
        ]);

        $this->get('/katalog/stik-talas')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('storefront/KatalogDetailPage')
                ->where('product.id', $product->id)
                ->where('product.imageUrl', '/storage/products/stik-talas.jpg')
                ->missing('product.cost'));
    }

    public function test_guest_can_access_active_owner_product_regardless_of_legacy_public_flag(): void
    {
        $product = Product::factory()->create([
            'slug' => 'produk-internal',
            'is_active' => true,
            'is_public' => false,
        ]);

        $this->get('/katalog/produk-internal')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('product.id', $product->id));
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

    public function test_storefront_uses_current_business_whatsapp_number_for_business_profile_and_product_links(): void
    {
        AppSetting::query()->updateOrCreate(
            ['key' => 'business.profile'],
            ['value' => [
                'name' => 'Cahaya Rasa',
                'tagline' => 'Oleh-Oleh Malang',
                'address' => 'Malang',
                'whatsapp_number' => '6285732915325',
                'operating_hours' => 'Senin-Sabtu 08.00-20.00 WIB',
            ]]
        );

        AppSetting::query()->updateOrCreate(
            ['key' => 'catalog.settings'],
            ['value' => [
                'enabled' => true,
                'whatsapp_enabled' => true,
                'whatsapp_message_template' => 'Halo, saya tertarik dengan {product_name} seharga {price}. Qty: {qty}.',
            ]]
        );

        $product = Product::factory()->create([
            'name' => 'Keripik Pisang Original',
            'slug' => 'keripik-pisang-original',
            'price' => 18000,
            'discount' => 0,
            'is_active' => true,
            'is_public' => true,
            'featured' => true,
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('storefront/LandingPage')
                ->where('business.whatsapp_number', '6285732915325')
                ->where('products.data.0.id', $product->id)
                ->where('products.data.0.whatsappUrl', fn (string $url) => str_starts_with($url, 'https://wa.me/6285732915325?text=')));
    }
}
