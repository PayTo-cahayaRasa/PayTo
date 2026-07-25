<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class LandingPageTest extends TestCase
{
    public function test_landing_page_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/LandingPage')
            ->url('/')
        );
    }

    public function test_landing_page_hero_product_showcase_assets_are_available(): void
    {
        $heroComponent = file_get_contents(resource_path('js/Pages/storefront/components/HeroSection.tsx'));

        $assets = [
            'pisang-madu.jpg',
            'keripik-singkong.jpg',
            'keripik-pisang.jpg',
            'rempeyek.jpg',
        ];

        foreach ($assets as $asset) {
            $assetPath = public_path("images/hero-products/{$asset}");

            $this->assertFileExists($assetPath);
            $this->assertGreaterThan(0, filesize($assetPath));
            $this->assertStringContainsString("/images/hero-products/{$asset}", $heroComponent);
        }
    }

    public function test_featured_chips_section_is_rendered_between_hero_and_shop(): void
    {
        $landingPage = file_get_contents(resource_path('js/Pages/storefront/LandingPage.tsx'));
        $featuredSection = file_get_contents(resource_path('js/Pages/storefront/components/FeaturedChipsSection.tsx'));

        $heroPosition = strpos($landingPage, '<HeroSection business={business} />');
        $featuredPosition = strpos($landingPage, '<FeaturedChipsSection onExplore={selectChipsCategory} />');
        $shopPosition = strpos($landingPage, '<section id={storefrontShopSectionId}');

        $this->assertIsInt($heroPosition);
        $this->assertIsInt($featuredPosition);
        $this->assertIsInt($shopPosition);
        $this->assertLessThan($featuredPosition, $heroPosition);
        $this->assertLessThan($shopPosition, $featuredPosition);
        $this->assertStringContainsString('href="#shop-products"', $featuredSection);
        $this->assertStringContainsString('Keripik Renyah yang Bikin Sulit Berhenti', $featuredSection);
        $this->assertStringContainsString('className="h-full w-full rounded-[1rem] object-contain"', $featuredSection);
        $this->assertStringContainsString('className="h-full w-full object-cover object-[50%_22%]"', $featuredSection);
    }
}
