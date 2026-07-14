<?php

namespace App\Services\Settings;

use App\Models\AppSetting;
use Illuminate\Support\Facades\DB;

class AppSettingsService
{
    private const KEY_BUSINESS_PROFILE = 'business.profile';

    private const KEY_CATALOG_SETTINGS = 'catalog.settings';

    private const KEY_RECEIPT_SETTINGS = 'receipt.settings';

    private const KEY_POS_TARGET = 'pos.cashier_target';

    private const KEY_ONLINE_ORDER_SETTINGS = 'online_order.settings';

    private const DEFAULT_BUSINESS_PROFILE = [
        'name' => 'Cahaya Rasa',
        'tagline' => 'Oleh-Oleh Malang',
        'address' => '2P5W+95R, Jl. Sukoanyar, Nongkosongo, Wringinsongo, Kec. Tumpang, Kabupaten Malang, Jawa Timur 65156',
        'whatsapp_number' => '',
        'operating_hours' => 'Senin-Sabtu 08.00-20.00 WIB',
        'instagram_url' => 'https://www.instagram.com/cahayarasamalang/',
        'tiktok_url' => 'https://www.tiktok.com/@cahayarasa_28',
    ];

    private const DEFAULT_CATALOG_SETTINGS = [
        'enabled' => true,
        'whatsapp_enabled' => true,
        'whatsapp_message_template' => 'Halo, saya tertarik dengan {product_name} seharga {price}. Qty: {qty}.',
    ];

    private const DEFAULT_RECEIPT_SETTINGS = [
        'header' => "NAMA TOKO\nAlamat Toko",
        'footer' => "Terima kasih atas kunjungan Anda\nFollow IG: @tokokopi",
    ];

    private const DEFAULT_POS_TARGET = 1000000;

    private const DEFAULT_ONLINE_ORDER_SETTINGS = [
        'shipping' => ['origin' => '', 'packaging_weight_grams' => 0, 'couriers' => ['jne', 'jnt', 'sicepat']],
        'payment' => ['bank_name' => '', 'bank_account_number' => '', 'bank_account_name' => '', 'qris_image_url' => '', 'instructions' => 'Lakukan pembayaran sesuai total pesanan, lalu kirim bukti pembayaran melalui WhatsApp.'],
    ];

    /**
     * Get business profile settings with defaults merged
     */
    public function getBusinessProfile(): array
    {
        $setting = AppSetting::query()->where('key', self::KEY_BUSINESS_PROFILE)->first();
        $stored = is_array($setting?->value) ? $setting->value : [];

        return array_merge(self::DEFAULT_BUSINESS_PROFILE, $stored);
    }

    /**
     * Get catalog settings with defaults merged
     */
    public function getCatalogSettings(): array
    {
        $setting = AppSetting::query()->where('key', self::KEY_CATALOG_SETTINGS)->first();
        $stored = is_array($setting?->value) ? $setting->value : [];

        return array_merge(self::DEFAULT_CATALOG_SETTINGS, $stored);
    }

    /**
     * Get receipt settings with defaults merged
     */
    public function getReceiptSettings(): array
    {
        $setting = AppSetting::query()->where('key', self::KEY_RECEIPT_SETTINGS)->first();
        $stored = is_array($setting?->value) ? $setting->value : [];

        return array_merge(self::DEFAULT_RECEIPT_SETTINGS, $stored);
    }

    /**
     * Get all business settings (business profile + catalog settings)
     */
    public function getAllBusinessSettings(): array
    {
        return [
            'business' => $this->getBusinessProfile(),
            'catalog' => $this->getCatalogSettings(),
            'online_order' => $this->getOnlineOrderSettings(),
        ];
    }

    public function getOnlineOrderSettings(): array
    {
        $stored = AppSetting::query()->where('key', self::KEY_ONLINE_ORDER_SETTINGS)->value('value');
        $stored = is_array($stored) ? $stored : [];

        return [
            'shipping' => array_merge(self::DEFAULT_ONLINE_ORDER_SETTINGS['shipping'], $stored['shipping'] ?? []),
            'payment' => array_merge(self::DEFAULT_ONLINE_ORDER_SETTINGS['payment'], $stored['payment'] ?? []),
        ];
    }

    /**
     * Get cashier daily target
     */
    public function getCashierTarget(): int
    {
        $setting = AppSetting::query()->where('key', self::KEY_POS_TARGET)->first();
        $value = $setting?->value;

        if (is_numeric($value)) {
            return max(0, (int) $value);
        }

        return self::DEFAULT_POS_TARGET;
    }

    /**
     * Update business profile and catalog settings atomically
     */
    public function updateBusinessSettings(array $businessProfile, array $catalogSettings, array $onlineOrderSettings): void
    {
        DB::transaction(function () use ($businessProfile, $catalogSettings, $onlineOrderSettings) {
            AppSetting::query()->updateOrCreate(
                ['key' => self::KEY_BUSINESS_PROFILE],
                ['value' => $businessProfile]
            );

            AppSetting::query()->updateOrCreate(
                ['key' => self::KEY_CATALOG_SETTINGS],
                ['value' => $catalogSettings]
            );

            AppSetting::query()->updateOrCreate(
                ['key' => self::KEY_ONLINE_ORDER_SETTINGS],
                ['value' => $onlineOrderSettings]
            );
        });
    }

    /**
     * Update receipt settings
     */
    public function updateReceiptSettings(array $receiptSettings): void
    {
        AppSetting::query()->updateOrCreate(
            ['key' => self::KEY_RECEIPT_SETTINGS],
            ['value' => $receiptSettings]
        );
    }
}
