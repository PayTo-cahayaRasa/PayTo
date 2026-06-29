<?php

namespace Tests\Feature;

use App\Models\InventoryRecommendation;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class InventoryRecommendationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_inventory_recommendation_returns_low_stock_items(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $cashier = new User;
        $cashier->name = 'Kasir';
        $cashier->username = 'kasir.inv';
        $cashier->password_hash = bcrypt('secret');
        $cashier->role = 'CASHIER';
        $cashier->is_active = true;
        $cashier->save();

        $product = Product::query()->create([
            'name' => 'Roti Bakar',
            'sku' => 'FD-001',
            'barcode' => '111222333',
            'price' => 25000,
            'discount' => 0,
            'cost' => 12000,
            'uom' => 'pcs',
            'is_active' => true,
        ]);

        StockItem::query()->create([
            'product_id' => $product->id,
            'on_hand' => 1,
        ]);

        InventoryRecommendation::query()->create([
            'product_id' => $product->id,
            'avg_daily_sales_7d' => 2,
            'avg_daily_sales_30d' => 1,
            'lead_time_days' => 3,
            'safety_stock' => 2,
            'reorder_point' => 8,
            'suggested_reorder_qty' => 7,
            'computed_at' => now(),
        ]);

        $sale = Sale::query()->create([
            'server_invoice_no' => 'INV-REC-1',
            'local_txn_uuid' => (string) Str::uuid(),
            'status' => 'PAID',
            'cashier_id' => $cashier->id,
            'subtotal' => 50000,
            'discount_total' => 0,
            'tax_total' => 0,
            'grand_total' => 50000,
            'paid_total' => 50000,
            'change_total' => 0,
            'occurred_at' => now(),
        ]);

        SaleItem::query()->create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'product_name_snapshot' => $product->name,
            'unit_price' => 25000,
            'qty' => 14,
            'discount_amount' => 0,
            'line_total' => 350000,
        ]);

        $response = $this->actingAs($supervisor)->getJson('/api/admin/inventory/recommendations');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.productName', 'Roti Bakar')
            ->assertJsonPath('data.0.status', 'CRITICAL');
    }
}
