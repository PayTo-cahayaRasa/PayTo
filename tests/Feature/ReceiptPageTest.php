<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReceiptPageTest extends TestCase
{
    use RefreshDatabase;

    private function createSaleWithItems(): Sale
    {
        $cashier = User::factory()->create(['role' => 'CASHIER']);
        $product = Product::factory()->create([
            'name' => 'Kopi Latte',
            'price' => 25000,
        ]);

        $sale = Sale::factory()->create([
            'cashier_id' => $cashier->id,
            'total' => 50000,
            'discount_amount' => 0,
            'final_total' => 50000,
        ]);

        SaleItem::factory()->create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'qty' => 2,
            'price' => 25000,
            'discount_amount' => 0,
            'final_price' => 25000,
            'subtotal' => 50000,
        ]);

        Payment::factory()->create([
            'sale_id' => $sale->id,
            'method' => 'CASH',
            'cash_received' => 100000,
            'change_amount' => 50000,
            'status' => 'CONFIRMED',
        ]);

        return $sale->fresh(['items.product', 'payment', 'cashier']);
    }

    /** @test */
    public function cashier_can_access_receipt_page(): void
    {
        $cashier = User::factory()->create(['role' => 'CASHIER']);
        $sale = $this->createSaleWithItems();

        $response = $this->actingAs($cashier)->get(route('pos.receipt', $sale));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('receipt')
            ->has('sale')
            ->has('receipt_settings')
            ->has('business')
        );
    }

    /** @test */
    public function supervisor_can_access_receipt_page(): void
    {
        $supervisor = User::factory()->create(['role' => 'SUPERVISOR']);
        $sale = $this->createSaleWithItems();

        $response = $this->actingAs($supervisor)->get(route('pos.receipt', $sale));

        $response->assertOk();
    }

    /** @test */
    public function guest_cannot_access_receipt_page(): void
    {
        $sale = $this->createSaleWithItems();

        $response = $this->get(route('pos.receipt', $sale));

        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function receipt_contains_sale_data(): void
    {
        $cashier = User::factory()->create(['role' => 'CASHIER']);
        $sale = $this->createSaleWithItems();

        $response = $this->actingAs($cashier)->get(route('pos.receipt', $sale));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('sale.id', $sale->id)
            ->where('sale.final_total', 50000)
            ->has('sale.items', 1)
            ->where('sale.items.0.product_name', 'Kopi Latte')
            ->where('sale.items.0.qty', 2)
            ->where('sale.payment.method', 'CASH')
            ->where('sale.payment.cash_received', 100000)
            ->where('sale.payment.change_amount', 50000)
        );
    }

    /** @test */
    public function receipt_contains_settings(): void
    {
        $cashier = User::factory()->create(['role' => 'CASHIER']);
        $sale = $this->createSaleWithItems();

        $response = $this->actingAs($cashier)->get(route('pos.receipt', $sale));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('receipt_settings.header')
            ->has('receipt_settings.footer')
            ->has('business.name')
            ->has('business.address')
        );
    }

    /** @test */
    public function checkout_returns_receipt_url(): void
    {
        $cashier = User::factory()->create([
            'role' => 'CASHIER',
            'is_active' => true,
        ]);

        $product = Product::factory()->create([
            'name' => 'Test Product',
            'price' => 10000,
            'stock' => 100,
        ]);

        $payload = [
            'payment_method' => 'CASH',
            'cash_received' => 20000,
            'items' => [
                [
                    'product_id' => $product->id,
                    'qty' => 1,
                ],
            ],
        ];

        $response = $this->actingAs($cashier)->postJson('/api/pos/checkout', $payload);

        $response->assertOk();
        $response->assertJsonStructure([
            'sale_id',
            'invoice_no',
            'receipt_url',
            'payment',
            'items',
            'totals',
        ]);

        $receiptUrl = $response->json('receipt_url');
        $this->assertStringContainsString('/pos/sales/', $receiptUrl);
        $this->assertStringContainsString('/receipt', $receiptUrl);
    }
}
