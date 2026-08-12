<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use App\Models\Product;
use App\Models\StockItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

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
                'whatsapp_number' => '6282337079892',
                'operating_hours' => 'Senin-Sabtu 08.00-20.00 WIB',
                'instagram_url' => 'https://www.instagram.com/cahayarasamalang/',
                'tiktok_url' => 'https://www.tiktok.com/@cahayarasa_28?_r=1&_t=ZS-989XRWXa7BR',
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
                'name' => 'Kripik Pisang',
                'slug' => 'kripik-pisang',
                'sku' => 'CR-001',
                'price' => 18000,
                'description' => 'Kripik pisang renyah untuk camilan dan oleh-oleh.',
                'discount' => 0,
                'cost' => 10000,
                'uom' => 'pcs',
                'category' => 'Camilan',
                'is_active' => true,
                'is_public' => true,
                'featured' => true,
                'image_path' => $this->seedProductImage('pisang.webp'),
                'weight_grams' => 250,
                'stock' => 50,
            ],
            [
                'name' => 'Kripik Pisang Madu',
                'slug' => 'kripik-pisang-madu',
                'sku' => 'CR-002',
                'price' => 22000,
                'description' => 'Kripik pisang manis dengan rasa madu.',
                'discount' => 0,
                'cost' => 12000,
                'uom' => 'pcs',
                'category' => 'Camilan',
                'is_active' => true,
                'is_public' => true,
                'featured' => true,
                'image_path' => $this->seedProductImage('pisangMadu.webp'),
                'weight_grams' => 250,
                'stock' => 35,
            ],
            [
                'name' => 'Kripik Singkong',
                'slug' => 'kripik-singkong',
                'sku' => 'CR-003',
                'price' => 16000,
                'description' => 'Kripik singkong renyah dengan rasa gurih.',
                'discount' => 0,
                'cost' => 9000,
                'uom' => 'pcs',
                'category' => 'Camilan',
                'is_active' => true,
                'is_public' => true,
                'featured' => true,
                'image_path' => $this->seedProductImage('singkong.webp'),
                'weight_grams' => 200,
                'stock' => 40,
            ],
            [
                'name' => 'Rempeyek',
                'slug' => 'rempeyek',
                'sku' => 'CR-004',
                'price' => 18000,
                'description' => 'Rempeyek gurih dan renyah untuk camilan serta oleh-oleh.',
                'discount' => 0,
                'cost' => 10000,
                'uom' => 'pcs',
                'category' => 'Camilan',
                'is_active' => true,
                'is_public' => true,
                'featured' => true,
                'image_path' => $this->seedProductImage('rempeyek.webp'),
                'weight_grams' => 200,
                'stock' => 40,
            ],
        ];
    }

    private function seedProductImage(string $filename): string
    {
        $sourcePath = public_path("products/{$filename}");
        $imagePath = "products/{$filename}";

        if (! File::exists($sourcePath)) {
            throw new RuntimeException("Asset foto produk tidak ditemukan: {$sourcePath}");
        }

        Storage::disk('public')->put($imagePath, File::get($sourcePath));

        return $imagePath;
    }
}
