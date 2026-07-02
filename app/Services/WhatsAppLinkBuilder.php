<?php

namespace App\Services;

use App\Models\Product;
use App\Services\Settings\AppSettingsService;

class WhatsAppLinkBuilder
{
    public function __construct(
        private readonly AppSettingsService $settings
    ) {}

    /**
     * Build WhatsApp link for a product
     *
     * @param  int  $qty  Initial quantity (default: 1)
     * @return string|null WhatsApp link or null if WhatsApp not enabled/invalid
     */
    public function buildProductLink(Product $product, int $qty = 1): ?string
    {
        $catalogSettings = $this->settings->getCatalogSettings();
        $businessProfile = $this->settings->getBusinessProfile();

        // Check if WhatsApp is enabled
        if (! $catalogSettings['whatsapp_enabled']) {
            return null;
        }

        // Check if WhatsApp number is valid
        $whatsappNumber = $businessProfile['whatsapp_number'] ?? '';
        if (empty($whatsappNumber) || strlen($whatsappNumber) < 8) {
            return null;
        }

        // Get template
        $template = $catalogSettings['whatsapp_message_template'];

        // Calculate price after discount
        $price = (float) $product->price;
        $discountPercent = (float) ($product->discount ?? 0);
        $discountAmount = ($price * $discountPercent) / 100;
        $priceAfterDiscount = $price - $discountAmount;

        // Format price (Indonesian Rupiah format)
        $formattedPrice = $this->formatRupiah($priceAfterDiscount);

        // Replace placeholders
        $message = str_replace(
            ['{product_name}', '{price}', '{qty}'],
            [$product->name, $formattedPrice, $qty],
            $template
        );

        // URL encode the message
        $encodedMessage = urlencode($message);

        // Build wa.me link
        return "https://wa.me/{$whatsappNumber}?text={$encodedMessage}";
    }

    /**
     * Format price to Indonesian Rupiah format
     */
    private function formatRupiah(float $amount): string
    {
        return 'Rp'.number_format($amount, 0, ',', '.');
    }
}
