<?php

namespace Tests\Feature;

use App\Models\InventoryRecommendation;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_returns_metrics(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $cashier = new User;
        $cashier->name = 'Kasir Test';
        $cashier->username = 'kasir.test';
        $cashier->password_hash = bcrypt('secret');
        $cashier->role = 'CASHIER';
        $cashier->is_active = true;
        $cashier->save();

        $product = Product::query()->create([
            'name' => 'Kopi Susu',
            'sku' => 'BV-001',
            'barcode' => '1234567890',
            'price' => 20000,
            'discount' => 0,
            'cost' => 10000,
            'uom' => 'pcs',
            'is_active' => true,
        ]);

        StockItem::query()->create([
            'product_id' => $product->id,
            'on_hand' => 3,
        ]);

        InventoryRecommendation::query()->create([
            'product_id' => $product->id,
            'avg_daily_sales_7d' => 2,
            'avg_daily_sales_30d' => 1,
            'lead_time_days' => 3,
            'safety_stock' => 5,
            'reorder_point' => 10,
            'suggested_reorder_qty' => 7,
            'computed_at' => now(),
        ]);

        $sale = Sale::query()->create([
            'server_invoice_no' => 'INV-001',
            'local_txn_uuid' => (string) Str::uuid(),
            'status' => 'PAID',
            'cashier_id' => $cashier->id,
            'subtotal' => 100000,
            'discount_total' => 0,
            'tax_total' => 0,
            'grand_total' => 100000,
            'paid_total' => 100000,
            'change_total' => 0,
            'occurred_at' => now(),
        ]);

        Payment::query()->create([
            'sale_id' => $sale->id,
            'method' => 'CASH',
            'amount' => 100000,
            'status' => 'RECORDED',
        ]);

        $response = $this->actingAs($supervisor)->getJson('/api/admin/dashboard');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'today_sales_total',
                    'today_transactions',
                    'low_stock' => ['total', 'items'],
                    'weekly_sales_trend',
                    'recent_activities',
                ],
            ])
            ->assertJsonPath('data.today_transactions', 1)
            ->assertJsonPath('data.low_stock.total', 1)
            ->assertJsonCount(7, 'data.weekly_sales_trend')
            ->assertJsonCount(1, 'data.recent_activities');
    }
}
