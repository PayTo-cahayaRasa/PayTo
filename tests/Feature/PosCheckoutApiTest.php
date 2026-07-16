<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosCheckoutApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_cashier_can_process_online_checkout(): void
    {
        $cashier = User::factory()->create([
            'role' => 'CASHIER',
            'is_active' => true,
        ]);
        $otherCashier = User::factory()->create([
            'role' => 'CASHIER',
            'is_active' => true,
        ]);
        $product = Product::query()->create([
            'name' => 'Kopi Online',
            'sku' => 'ONLINE-001',
            'price' => 10000,
            'discount' => 0,
            'uom' => 'cup',
            'is_active' => true,
            'is_public' => true,
        ]);
        StockItem::query()->create(['product_id' => $product->id, 'on_hand' => 2]);

        $response = $this->actingAs($cashier)->postJson('/api/pos/checkout', [
            'cashier_id' => $otherCashier->id,
            'local_txn_uuid' => '00000000-0000-0000-0000-000000000000',
            'payment_method' => 'CASH',
            'cash_received' => 20000,
            'items' => [
                [
                    'product_id' => $product->id,
                    'qty' => 1,
                ],
            ],
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('payment.status', 'CONFIRMED')
            ->assertJsonPath('totals.tax_total', 0)
            ->assertJsonPath('totals.grand_total', 10000);

        $this->assertDatabaseHas('sales', [
            'cashier_id' => $cashier->id,
            'status' => 'PAID',
            'tax_total' => 0,
            'grand_total' => 10000,
        ]);
        $this->assertDatabaseMissing('sales', [
            'local_txn_uuid' => '00000000-0000-0000-0000-000000000000',
        ]);
        $this->assertDatabaseHas('stock_items', ['product_id' => $product->id, 'on_hand' => 1]);
        $this->assertDatabaseHas('stock_movements', ['product_id' => $product->id, 'type' => 'SALE_OUT']);
    }

    public function test_pos_catalog_returns_all_active_owner_products(): void
    {
        $cashier = User::factory()->create(['role' => 'CASHIER', 'is_active' => true]);
        $publicProduct = Product::factory()->create(['name' => 'Produk Publik', 'is_active' => true, 'is_public' => true]);
        $privateProduct = Product::factory()->create(['name' => 'Produk Internal', 'is_active' => true, 'is_public' => false]);
        StockItem::query()->create(['product_id' => $publicProduct->id, 'on_hand' => 2]);
        StockItem::query()->create(['product_id' => $privateProduct->id, 'on_hand' => 2]);

        $this->actingAs($cashier)->getJson('/api/pos/products')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Produk Publik'])
            ->assertJsonFragment(['name' => 'Produk Internal']);
    }
}
