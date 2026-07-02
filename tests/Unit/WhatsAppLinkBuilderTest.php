<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Services\Settings\AppSettingsService;
use App\Services\WhatsAppLinkBuilder;
use Mockery;
use Tests\TestCase;

class WhatsAppLinkBuilderTest extends TestCase
{
    private AppSettingsService $mockSettings;

    private WhatsAppLinkBuilder $builder;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockSettings = Mockery::mock(AppSettingsService::class);
        $this->builder = new WhatsAppLinkBuilder($this->mockSettings);
    }

    /** @test */
    public function builds_whatsapp_link_with_correct_format(): void
    {
        $this->mockSettings->shouldReceive('getCatalogSettings')
            ->andReturn([
                'whatsapp_enabled' => true,
                'whatsapp_message_template' => 'Halo, saya tertarik dengan {product_name} seharga {price}. Qty: {qty}.',
            ]);

        $this->mockSettings->shouldReceive('getBusinessProfile')
            ->andReturn([
                'whatsapp_number' => '6281234567890',
            ]);

        $product = new Product([
            'name' => 'Kopi Latte',
            'price' => 25000,
            'discount' => 0,
        ]);

        $link = $this->builder->buildProductLink($product, 1);

        $this->assertStringStartsWith('https://wa.me/6281234567890?text=', $link);
        $this->assertStringContainsString('Kopi+Latte', $link);
        $this->assertStringContainsString('Rp25.000', urldecode($link));
    }

    /** @test */
    public function replaces_all_placeholders_correctly(): void
    {
        $this->mockSettings->shouldReceive('getCatalogSettings')
            ->andReturn([
                'whatsapp_enabled' => true,
                'whatsapp_message_template' => 'Produk: {product_name}, Harga: {price}, Jumlah: {qty}',
            ]);

        $this->mockSettings->shouldReceive('getBusinessProfile')
            ->andReturn([
                'whatsapp_number' => '6281234567890',
            ]);

        $product = new Product([
            'name' => 'Teh Manis',
            'price' => 5000,
            'discount' => 0,
        ]);

        $link = $this->builder->buildProductLink($product, 2);

        $decodedLink = urldecode($link);

        $this->assertStringContainsString('Produk: Teh Manis', $decodedLink);
        $this->assertStringContainsString('Harga: Rp5.000', $decodedLink);
        $this->assertStringContainsString('Jumlah: 2', $decodedLink);
    }

    /** @test */
    public function applies_discount_to_price(): void
    {
        $this->mockSettings->shouldReceive('getCatalogSettings')
            ->andReturn([
                'whatsapp_enabled' => true,
                'whatsapp_message_template' => 'Harga: {price}',
            ]);

        $this->mockSettings->shouldReceive('getBusinessProfile')
            ->andReturn([
                'whatsapp_number' => '6281234567890',
            ]);

        $product = new Product([
            'name' => 'Product',
            'price' => 10000,
            'discount' => 10, // 10% discount
        ]);

        $link = $this->builder->buildProductLink($product, 1);

        $decodedLink = urldecode($link);

        // Price after 10% discount: 9000
        $this->assertStringContainsString('Rp9.000', $decodedLink);
        $this->assertStringNotContainsString('Rp10.000', $decodedLink);
    }

    /** @test */
    public function returns_null_when_whatsapp_disabled(): void
    {
        $this->mockSettings->shouldReceive('getCatalogSettings')
            ->andReturn([
                'whatsapp_enabled' => false,
                'whatsapp_message_template' => 'Template',
            ]);

        $this->mockSettings->shouldReceive('getBusinessProfile')
            ->andReturn([
                'whatsapp_number' => '6281234567890',
            ]);

        $product = new Product([
            'name' => 'Product',
            'price' => 10000,
            'discount' => 0,
        ]);

        $link = $this->builder->buildProductLink($product, 1);

        $this->assertNull($link);
    }

    /** @test */
    public function returns_null_when_whatsapp_number_invalid(): void
    {
        $this->mockSettings->shouldReceive('getCatalogSettings')
            ->andReturn([
                'whatsapp_enabled' => true,
                'whatsapp_message_template' => 'Template',
            ]);

        $this->mockSettings->shouldReceive('getBusinessProfile')
            ->andReturn([
                'whatsapp_number' => '', // Empty
            ]);

        $product = new Product([
            'name' => 'Product',
            'price' => 10000,
            'discount' => 0,
        ]);

        $link = $this->builder->buildProductLink($product, 1);

        $this->assertNull($link);
    }

    /** @test */
    public function url_encodes_message_properly(): void
    {
        $this->mockSettings->shouldReceive('getCatalogSettings')
            ->andReturn([
                'whatsapp_enabled' => true,
                'whatsapp_message_template' => 'Halo! Saya ingin {product_name}',
            ]);

        $this->mockSettings->shouldReceive('getBusinessProfile')
            ->andReturn([
                'whatsapp_number' => '6281234567890',
            ]);

        $product = new Product([
            'name' => 'Kopi & Teh',
            'price' => 10000,
            'discount' => 0,
        ]);

        $link = $this->builder->buildProductLink($product, 1);

        // Should be URL encoded
        $this->assertStringContainsString('Halo%21', $link); // ! encoded
        $this->assertStringContainsString('%26', $link); // & encoded
    }
}
