<?php

namespace Tests\Unit;

use App\Models\OnlineOrder;
use App\Models\Product;
use App\Services\Settings\AppSettingsService;
use App\Services\WhatsAppLinkBuilder;
use Mockery;
use Mockery\MockInterface;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class WhatsAppLinkBuilderTest extends TestCase
{
    private const WHATSAPP_NUMBER = '6281234567890';

    private AppSettingsService&MockInterface $mockSettings;

    private WhatsAppLinkBuilder $builder;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockSettings = Mockery::mock(AppSettingsService::class);
        $this->builder = new WhatsAppLinkBuilder($this->mockSettings);
    }

    #[Test]
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

        $this->assertStringStartsWith('https://wa.me/'.self::WHATSAPP_NUMBER.'?text=', $link);
        $this->assertStringContainsString('Kopi+Latte', $link);
        $this->assertStringContainsString('Rp25.000', urldecode($link));
    }

    #[Test]
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

    #[Test]
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

    #[Test]
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

    #[Test]
    public function returns_null_when_product_link_number_is_missing_in_settings(): void
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

    #[Test]
    public function builds_shipping_update_with_order_courier_receipt_and_tracking_link(): void
    {
        $order = new OnlineOrder([
            'order_number' => 'WEB-20260714-TEST',
            'tracking_token' => str_repeat('a', 64),
            'customer_name' => 'Dimas',
            'customer_phone' => '6289876543210',
            'shipping_courier_name' => 'JNE',
            'shipping_service' => 'REG',
            'tracking_number' => 'JNE123456',
        ]);

        $link = urldecode((string) $this->builder->buildShippingUpdateLink($order));

        $this->assertStringContainsString('https://wa.me/6289876543210?text=', $link);
        $this->assertStringContainsString('WEB-20260714-TEST', $link);
        $this->assertStringContainsString('JNE REG', $link);
        $this->assertStringContainsString('JNE123456', $link);
        $this->assertStringContainsString('/pesanan/WEB-20260714-TEST?token=', $link);
    }

    #[Test]
    public function returns_null_when_shipping_update_customer_number_is_missing(): void
    {
        $order = new OnlineOrder([
            'order_number' => 'WEB-20260714-TEST',
            'tracking_number' => 'JNE123456',
        ]);

        $this->assertNull($this->builder->buildShippingUpdateLink($order));
    }

    #[Test]
    public function builds_payment_confirmation_link_with_configured_storefront_whatsapp_number(): void
    {
        $this->mockSettings->shouldReceive('getBusinessProfile')->andReturn([
            'name' => 'Cahaya Rasa',
            'whatsapp_number' => '6281234567890',
        ]);

        $order = new OnlineOrder([
            'order_number' => 'WEB-20260714-TEST',
            'grand_total' => 10000,
        ]);

        $link = urldecode((string) $this->builder->buildPaymentConfirmationLink($order));

        $this->assertStringContainsString('https://wa.me/'.self::WHATSAPP_NUMBER.'?text=', $link);
        $this->assertStringContainsString('Cahaya Rasa', $link);
        $this->assertStringContainsString('WEB-20260714-TEST', $link);
        $this->assertStringContainsString('Rp10.000', $link);
    }

    #[Test]
    public function returns_null_when_payment_confirmation_number_is_missing_in_settings(): void
    {
        $this->mockSettings->shouldReceive('getBusinessProfile')->andReturn([
            'name' => 'Cahaya Rasa',
            'whatsapp_number' => '',
        ]);

        $order = new OnlineOrder([
            'order_number' => 'WEB-20260714-TEST',
            'grand_total' => 10000,
        ]);

        $this->assertNull($this->builder->buildPaymentConfirmationLink($order));
    }

    #[Test]
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
