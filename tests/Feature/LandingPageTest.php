<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class LandingPageTest extends TestCase
{
    public function test_storefront_is_configured_for_inertia_server_side_rendering(): void
    {
        $viteConfig = file_get_contents(base_path('vite.config.js'));
        $clientEntry = file_get_contents(resource_path('js/app.tsx'));
        $serverEntry = file_get_contents(resource_path('js/ssr.tsx'));

        $this->assertStringContainsString("ssr: 'resources/js/ssr.tsx'", $viteConfig);
        $this->assertStringContainsString('hydrateRoot(el, <App {...props} />)', $clientEntry);
        $this->assertStringContainsString('createServer((page) => createInertiaApp({', $serverEntry);
        $this->assertStringContainsString('render: renderToString', $serverEntry);
    }

    public function test_landing_page_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/LandingPage')
            ->url('/')
        );
    }

    public function test_landing_page_uses_the_optimized_product_assets_with_loading_skeletons(): void
    {
        $heroComponent = file_get_contents(resource_path('js/Pages/storefront/components/HeroSection.tsx'));
        $featuredComponent = file_get_contents(resource_path('js/Pages/storefront/components/FeaturedChipsSection.tsx'));
        $productVisual = file_get_contents(resource_path('js/Pages/storefront/components/ProductVisual.tsx'));

        $assets = [
            'pisang.webp',
            'pisangMadu.webp',
            'singkong.webp',
            'rempeyek.webp',
        ];

        foreach ($assets as $asset) {
            $assetPath = public_path("products/{$asset}");

            $this->assertFileExists($assetPath);
            $this->assertGreaterThan(0, filesize($assetPath));
        }

        $this->assertStringContainsString('/products/pisangMadu.webp', $heroComponent);
        $this->assertStringContainsString('fetchPriority={isPriority ? \'high\' : \'auto\'}', $heroComponent);
        $this->assertStringContainsString('animate-pulse', $heroComponent);
        $this->assertStringContainsString('z-10', $heroComponent);
        $this->assertStringContainsString('/products/pisang.webp', $featuredComponent);
        $this->assertStringContainsString('animate-pulse', $featuredComponent);
        $this->assertStringContainsString('z-10', $featuredComponent);
        $this->assertStringContainsString('animate-pulse', $productVisual);
        $this->assertStringContainsString('z-10', $productVisual);
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
        $this->assertStringContainsString("category.id === 'Camilan'", $landingPage);
    }
}
