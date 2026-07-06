<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class KatalogPageTest extends TestCase
{
    public function test_public_catalog_page_redirects_to_landing_shop_section(): void
    {
        $response = $this->get('/katalog');

        $response->assertRedirect('/#shop-products');
    }

    public function test_public_catalog_page_with_query_redirects_to_landing_shop_section(): void
    {
        $response = $this->get('/katalog?focus=search');

        $response->assertRedirect('/#shop-products');
    }

    public function test_public_catalog_detail_page_returns_a_successful_response(): void
    {
        $response = $this->get('/katalog/1');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/KatalogDetailPage')
            ->url('/katalog/1')
            ->where('productId', 1)
        );
    }

    public function test_missing_public_catalog_detail_page_still_renders_the_detail_shell(): void
    {
        $response = $this->get('/katalog/999');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/KatalogDetailPage')
            ->url('/katalog/999')
            ->where('productId', 999)
        );
    }
}
