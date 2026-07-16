<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use App\Models\Product;
use App\Models\StockItem;
use Illuminate\Database\Seeder;

class StorefrontSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AppSetting::query()->updateOrCreate(
            ['key' => 'business.profile'],
            ['value' => [
                'name' => 'Cahaya Rasa',
                'tagline' => 'Oleh-Oleh Malang',
                'address' => '2P5W+95R, Jl. Sukoanyar, Nongkosongo, Wringinsongo, Kec. Tumpang, Kabupaten Malang, Jawa Timur 65156',
                'whatsapp_number' => '6285732915325',
                'operating_hours' => 'Senin-Sabtu 08.00-20.00 WIB',
                'instagram_url' => 'https://www.instagram.com/cahayarasamalang/',
                'tiktok_url' => 'https://www.tiktok.com/@cahayarasa_28',
            ]]
        );

        AppSetting::query()->updateOrCreate(
            ['key' => 'catalog.settings'],
            ['value' => [
                'enabled' => true,
                'whatsapp_enabled' => true,
                'whatsapp_message_template' => 'Halo, saya tertarik dengan {product_name} seharga {price}. Qty: {qty}.',
            ]]
        );

        foreach ($this->products() as $productData) {
            $stock = $productData['stock'];
            $weight = $productData['weight_grams'];
            unset($productData['stock'], $productData['weight_grams']);

            $product = Product::query()->updateOrCreate(
                ['sku' => $productData['sku']],
                $productData
            );

            if ($product->weight_grams === null) {
                $product->update(['weight_grams' => $weight]);
            }

            StockItem::query()->updateOrCreate(
                ['product_id' => $product->id],
                ['on_hand' => $stock]
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function products(): array
    {
        return [
            [
                'name' => 'Keripik Pisang Original',
                'slug' => 'keripik-pisang-original',
                'sku' => 'CR-001',
                'barcode' => '899700000001',
                'price' => 18000,
                'description' => 'Keripik pisang renyah dengan rasa original gurih manis khas Cahaya Rasa.',
                'discount' => 0,
                'cost' => 10000,
                'uom' => 'pcs',
                'is_active' => true,
                'is_public' => true,
                'featured' => true,
                'image_path' => null,
                'weight_grams' => 250,
                'stock' => 50,
            ],
            [
                'name' => 'Keripik Pisang Coklat',
                'slug' => 'keripik-pisang-coklat',
                'sku' => 'CR-002',
                'barcode' => '899700000002',
                'price' => 22000,
                'description' => 'Keripik pisang berbalut rasa coklat untuk camilan keluarga dan oleh-oleh.',
                'discount' => 10,
                'cost' => 12000,
                'uom' => 'pcs',
                'is_active' => true,
                'is_public' => true,
                'featured' => true,
                'image_path' => null,
                'weight_grams' => 250,
                'stock' => 35,
            ],
            [
                'name' => 'Stik Talas Balado',
                'slug' => 'stik-talas-balado',
                'sku' => 'CR-003',
                'barcode' => '899700000003',
                'price' => 16000,
                'description' => 'Stik talas renyah dengan bumbu balado pedas ringan.',
                'discount' => 0,
                'cost' => 9000,
                'uom' => 'pcs',
                'is_active' => true,
                'is_public' => true,
                'featured' => true,
                'image_path' => null,
                'weight_grams' => 200,
                'stock' => 40,
            ],
        ];
    }
}
