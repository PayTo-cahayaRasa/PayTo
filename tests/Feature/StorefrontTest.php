<?php

namespace Tests\Feature;

use Tests\TestCase;

class StorefrontTest extends TestCase
{
    public function test_guest_can_access_landing_page_without_product_query(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('landingPage')
                ->missing('featured_products'));
    }

    public function test_guest_is_redirected_to_landing_shop_section_when_opening_catalog_page(): void
    {
        $this->get('/katalog')
            ->assertRedirect('/#shop-products');
    }

    public function test_guest_can_access_public_product_detail_page(): void
    {
        $this->get('/katalog/1')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('katalogDetailPage')
                ->where('productId', 1));
    }
}
