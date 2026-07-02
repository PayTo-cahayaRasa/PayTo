<?php

namespace App\Services\Settings;

use App\Models\AppSetting;
use Illuminate\Support\Facades\DB;

class AppSettingsService
{
    private const KEY_BUSINESS_PROFILE = 'business.profile';

    private const KEY_CATALOG_SETTINGS = 'catalog.settings';

    private const KEY_RECEIPT_SETTINGS = 'receipt.settings';

    private const DEFAULT_BUSINESS_PROFILE = [
        'name' => 'Nama Toko',
        'address' => 'Alamat Toko',
        'whatsapp_number' => '',
        'operating_hours' => 'Senin-Sabtu 08.00-20.00 WIB',
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
        ];
    }

    /**
     * Update business profile and catalog settings atomically
     */
    public function updateBusinessSettings(array $businessProfile, array $catalogSettings): void
    {
        DB::transaction(function () use ($businessProfile, $catalogSettings) {
            AppSetting::query()->updateOrCreate(
                ['key' => self::KEY_BUSINESS_PROFILE],
                ['value' => $businessProfile]
            );

            AppSetting::query()->updateOrCreate(
                ['key' => self::KEY_CATALOG_SETTINGS],
                ['value' => $catalogSettings]
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
