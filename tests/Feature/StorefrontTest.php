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

    public function test_guest_can_access_mock_catalog_page(): void
    {
        $this->get('/katalog')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('catalog'));
    }

    public function test_guest_can_access_mock_product_detail_page(): void
    {
        $this->get('/katalog/single-origin-espresso')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('productDetail')
                ->where('slug', 'single-origin-espresso'));
    }
}
