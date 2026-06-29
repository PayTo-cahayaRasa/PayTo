<?php

namespace Tests\Feature;

use App\Models\Product;
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
        ]);

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
            ->assertJsonPath('totals.grand_total', 11100);

        $this->assertDatabaseHas('sales', [
            'cashier_id' => $cashier->id,
            'status' => 'PAID',
            'grand_total' => 11100,
        ]);
        $this->assertDatabaseMissing('sales', [
            'local_txn_uuid' => '00000000-0000-0000-0000-000000000000',
        ]);
    }
}
