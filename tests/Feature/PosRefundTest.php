<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PosRefundTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_request_refund_and_process_approval(): void
    {
        $cashier = User::query()->forceCreate([
            'name' => 'Kasir',
            'username' => 'kasir',
            'password_hash' => Hash::make('secret'),
            'pin_hash' => Hash::make('1111'),
            'role' => 'CASHIER',
            'is_active' => true,
        ]);

        $supervisor = User::query()->forceCreate([
            'name' => 'Supervisor',
            'username' => 'spv',
            'password_hash' => Hash::make('secret'),
            'pin_hash' => Hash::make('2222'),
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'name' => 'Produk Refund',
            'sku' => 'RF-001',
            'barcode' => 'RF-001-BC',
            'price' => 10000,
            'discount' => 0,
            'cost' => 5000,
            'uom' => 'pcs',
            'is_active' => true,
        ]);

        StockItem::query()->create([
            'product_id' => $product->id,
            'on_hand' => 5,
        ]);

        $sale = Sale::query()->create([
            'server_invoice_no' => 'INV-20260203-0001',
            'local_txn_uuid' => (string) \Illuminate\Support\Str::uuid(),
            'status' => 'PAID',
            'cashier_id' => $cashier->id,
            'subtotal' => 20000,
            'discount_total' => 0,
            'tax_total' => 2200,
            'grand_total' => 22200,
            'paid_total' => 22200,
            'change_total' => 0,
            'occurred_at' => now(),
            'synced_at' => now(),
        ]);

        $saleItem = SaleItem::query()->create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'product_name_snapshot' => $product->name,
            'unit_price' => 10000,
            'qty' => 2,
            'discount_amount' => 0,
            'line_total' => 20000,
        ]);

        $payload = [
            'sale_id' => $sale->id,
            'reason' => 'Produk rusak dan dikembalikan.',
            'items' => [
                [
                    'sale_item_id' => $saleItem->id,
                    'qty' => 1,
                ],
            ],
        ];

        $response = $this->actingAs($cashier)->postJson('/api/pos/refunds', $payload);

        $response
            ->assertOk()
            ->assertJsonPath('data.sale_id', $sale->id)
            ->assertJsonPath('data.status', 'PENDING');

        $approvalId = $response->json('data.approval_id');

        $this->assertDatabaseHas('approvals', [
            'id' => $approvalId,
            'sale_id' => $sale->id,
            'requested_by' => $cashier->id,
            'status' => 'PENDING',
        ]);

        $this->actingAs($supervisor)->postJson("/api/admin/approvals/{$approvalId}/approve")
            ->assertOk();

        $this->assertDatabaseHas('approvals', [
            'id' => $approvalId,
            'approved_by' => $supervisor->id,
            'status' => 'APPROVED',
        ]);

        $this->assertDatabaseHas('refunds', [
            'sale_id' => $sale->id,
            'requested_by' => $cashier->id,
            'approved_by' => $supervisor->id,
        ]);

        $this->assertDatabaseHas('refund_items', [
            'sale_item_id' => $saleItem->id,
            'qty' => 1,
        ]);

        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id,
            'type' => 'RETURN_IN',
        ]);

        $this->assertDatabaseHas('stock_items', [
            'product_id' => $product->id,
            'on_hand' => 6,
        ]);
    }

    public function test_refund_rejected_when_window_expired(): void
    {
        $cashier = User::query()->forceCreate([
            'name' => 'Kasir',
            'username' => 'kasir2',
            'password_hash' => Hash::make('secret'),
            'pin_hash' => Hash::make('1111'),
            'role' => 'CASHIER',
            'is_active' => true,
        ]);

        User::query()->forceCreate([
            'name' => 'Supervisor',
            'username' => 'spv2',
            'password_hash' => Hash::make('secret'),
            'pin_hash' => Hash::make('2222'),
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'name' => 'Produk Refund',
            'sku' => 'RF-002',
            'barcode' => 'RF-002-BC',
            'price' => 10000,
            'discount' => 0,
            'cost' => 5000,
            'uom' => 'pcs',
            'is_active' => true,
        ]);

        $sale = Sale::query()->create([
            'server_invoice_no' => 'INV-20260203-0002',
            'local_txn_uuid' => (string) \Illuminate\Support\Str::uuid(),
            'status' => 'PAID',
            'cashier_id' => $cashier->id,
            'subtotal' => 10000,
            'discount_total' => 0,
            'tax_total' => 1100,
            'grand_total' => 11100,
            'paid_total' => 11100,
            'change_total' => 0,
            'occurred_at' => now()->subDays(3),
            'synced_at' => now()->subDays(3),
        ]);

        $saleItem = SaleItem::query()->create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'product_name_snapshot' => $product->name,
            'unit_price' => 10000,
            'qty' => 1,
            'discount_amount' => 0,
            'line_total' => 10000,
        ]);

        $payload = [
            'sale_id' => $sale->id,
            'reason' => 'Produk rusak dan dikembalikan.',
            'items' => [
                [
                    'sale_item_id' => $saleItem->id,
                    'qty' => 1,
                ],
            ],
        ];

        $this->actingAs($cashier)->postJson('/api/pos/refunds', $payload)
            ->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Masa garansi refund sudah berakhir.',
            ]);

        $this->assertDatabaseCount('refunds', 0);
        $this->assertDatabaseCount('approvals', 0);
    }
}
