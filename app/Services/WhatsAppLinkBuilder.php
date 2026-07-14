<?php

namespace App\Services;

use App\Models\OnlineOrder;
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

    public function buildShippingUpdateLink(OnlineOrder $order): ?string
    {
        $profile = $this->settings->getBusinessProfile();
        $number = preg_replace('/\D/', '', (string) ($profile['whatsapp_number'] ?? ''));
        if (strlen($number) < 8 || ! $order->tracking_number) {
            return null;
        }

        $trackingUrl = route('orders.track', ['orderNumber' => $order->order_number, 'token' => $order->tracking_token]);
        $message = implode("\n", [
            "Halo {$order->customer_name}, pesanan {$order->order_number} sudah dikirim.",
            "Kurir: {$order->shipping_courier_name} {$order->shipping_service}",
            "Nomor resi: {$order->tracking_number}",
            "Lacak pesanan: {$trackingUrl}",
        ]);

        return "https://wa.me/{$number}?text=".urlencode($message);
    }

    public function buildPaymentConfirmationLink(OnlineOrder $order): ?string
    {
        $profile = $this->settings->getBusinessProfile();
        $number = preg_replace('/\D/', '', (string) ($profile['whatsapp_number'] ?? ''));
        if (strlen($number) < 8) {
            return null;
        }

        $total = $this->formatRupiah((float) $order->grand_total);
        $message = "Halo {$profile['name']}, saya sudah membayar pesanan {$order->order_number} sebesar {$total}. Bukti pembayaran saya lampirkan di sini.";

        return "https://wa.me/{$number}?text=".urlencode($message);
    }

    /**
     * Format price to Indonesian Rupiah format
     */
    private function formatRupiah(float $amount): string
    {
        return 'Rp'.number_format($amount, 0, ',', '.');
    }
}
