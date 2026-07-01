<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class KatalogPageTest extends TestCase
{
    public function test_public_catalog_page_returns_a_successful_response(): void
    {
        $response = $this->get('/katalog');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('katalogPage')
            ->url('/katalog')
        );
    }

    public function test_public_catalog_detail_page_returns_a_successful_response(): void
    {
        $response = $this->get('/katalog/1');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('katalogDetailPage')
            ->url('/katalog/1')
            ->where('productId', 1)
        );
    }
}
