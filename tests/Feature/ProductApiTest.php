<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_product_with_stock(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $payload = [
            'name' => 'Teh Manis',
            'sku' => 'BV-010',
            'barcode' => '9876543210',
            'price' => 15000,
            'discount' => 5,
            'cost' => 8000,
            'uom' => 'pcs',
            'is_active' => true,
            'stock' => 20,
        ];

        $response = $this->actingAs($supervisor)->postJson('/api/admin/products', $payload);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Teh Manis')
            ->assertJsonPath('data.stock', 20)
            ->assertJsonPath('data.status', 'ACTIVE');

        $this->assertDatabaseHas('products', [
            'name' => 'Teh Manis',
            'sku' => 'BV-010',
        ]);

        $this->assertDatabaseHas('stock_items', [
            'on_hand' => 20,
        ]);
    }

    public function test_can_list_and_show_products(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'name' => 'Produk List',
            'sku' => 'LIST-001',
            'barcode' => 'LIST-BC',
            'price' => 10000,
            'discount' => 0,
            'cost' => 4000,
            'uom' => 'pcs',
            'is_active' => true,
        ]);

        StockItem::query()->create([
            'product_id' => $product->id,
            'on_hand' => 7,
        ]);

        $this->actingAs($supervisor)->getJson('/api/admin/products')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $product->id,
                'name' => 'Produk List',
                'stock' => 7,
            ]);

        $this->actingAs($supervisor)->getJson("/api/admin/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Produk List')
            ->assertJsonPath('data.stock', 7);
    }

    public function test_product_create_rejects_invalid_payload(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $payload = [
            'name' => '',
            'price' => -100,
            'discount' => -1,
            'stock' => -5,
        ];

        $this->actingAs($supervisor)->postJson('/api/admin/products', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'price', 'discount', 'stock']);
    }

    public function test_product_create_rejects_duplicate_sku_and_barcode(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        Product::query()->create([
            'name' => 'Produk A',
            'sku' => 'DUP-001',
            'barcode' => 'DUP-BC',
            'price' => 10000,
            'discount' => 0,
            'cost' => 5000,
            'uom' => 'pcs',
            'is_active' => true,
        ]);

        $payload = [
            'name' => 'Produk B',
            'sku' => 'DUP-001',
            'barcode' => 'DUP-BC',
            'price' => 12000,
            'discount' => 0,
            'cost' => 6000,
            'uom' => 'pcs',
            'is_active' => true,
            'stock' => 10,
        ];

        $this->actingAs($supervisor)->postJson('/api/admin/products', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['sku', 'barcode']);
    }

    public function test_can_update_product_and_stock(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'name' => 'Produk Lama',
            'sku' => 'UP-001',
            'barcode' => 'UP-BC',
            'price' => 10000,
            'discount' => 0,
            'cost' => 4000,
            'uom' => 'pcs',
            'is_active' => true,
        ]);

        StockItem::query()->create([
            'product_id' => $product->id,
            'on_hand' => 5,
        ]);

        $payload = [
            'name' => 'Produk Baru',
            'price' => 12000,
            'stock' => 12,
        ];

        $this->actingAs($supervisor)->putJson("/api/admin/products/{$product->id}", $payload)
            ->assertOk()
            ->assertJsonPath('data.name', 'Produk Baru')
            ->assertJsonPath('data.stock', 12);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Produk Baru',
        ]);

        $this->assertDatabaseHas('stock_items', [
            'product_id' => $product->id,
            'on_hand' => 12,
        ]);
    }

    public function test_supervisor_can_upload_product_image_when_creating_and_updating_product(): void
    {
        $storage = Storage::fake('public');
        $supervisor = User::factory()->create(['role' => 'SUPERVISOR', 'is_active' => true]);

        $created = $this->actingAs($supervisor)->post('/api/admin/products', [
            'name' => 'Produk Bergambar',
            'price' => 15000,
            'stock' => 5,
            'image' => UploadedFile::fake()->image('produk-awal.jpg'),
        ])->assertCreated();

        $product = Product::query()->findOrFail($created->json('data.id'));
        $this->assertNotNull($product->image_path);
        $storage->assertExists($product->image_path);
        $created->assertJsonPath('data.image_url', '/storage/'.$product->image_path);

        $oldImagePath = $product->image_path;
        $this->actingAs($supervisor)->post("/api/admin/products/{$product->id}", [
            '_method' => 'PUT',
            'image' => UploadedFile::fake()->image('produk-baru.png'),
        ])->assertOk();

        $product->refresh();
        $this->assertNotSame($oldImagePath, $product->image_path);
        $storage->assertMissing($oldImagePath);
        $storage->assertExists($product->image_path);
    }

    public function test_can_delete_product_and_stock_item(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'name' => 'Produk Hapus',
            'sku' => 'DEL-001',
            'barcode' => 'DEL-BC',
            'price' => 10000,
            'discount' => 0,
            'cost' => 4000,
            'uom' => 'pcs',
            'is_active' => true,
        ]);

        StockItem::query()->create([
            'product_id' => $product->id,
            'on_hand' => 5,
        ]);

        $this->actingAs($supervisor)->deleteJson("/api/admin/products/{$product->id}")
            ->assertOk();

        $this->assertSoftDeleted('products', [
            'id' => $product->id,
        ]);
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'is_active' => false,
            'is_public' => false,
        ]);

        $this->assertDatabaseHas('stock_items', [
            'product_id' => $product->id,
        ]);
    }

    public function test_public_product_image_urls_use_the_current_application_origin(): void
    {
        $this->assertSame(
            '/storage/products/example.jpg',
            Storage::disk('public')->url('products/example.jpg'),
        );
    }
}
