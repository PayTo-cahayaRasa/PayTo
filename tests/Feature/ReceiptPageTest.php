<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ReceiptPageTest extends TestCase
{
    use RefreshDatabase;

    private function createCashier(string $name = 'Test Kasir', string $username = 'kasir'): User
    {
        return User::query()->forceCreate([
            'name' => $name,
            'username' => $username,
            'password_hash' => Hash::make('password'),
            'role' => 'CASHIER',
            'is_active' => true,
        ]);
    }

    private function createSupervisor(string $name = 'Test Supervisor', string $username = 'supervisor'): User
    {
        return User::query()->forceCreate([
            'name' => $name,
            'username' => $username,
            'password_hash' => Hash::make('password'),
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);
    }

    private function createSaleWithItems(User $cashier): Sale
    {
        $product = Product::factory()->create([
            'name' => 'Kopi Latte',
            'price' => 25000,
        ]);

        // Create stock item for product (no factory available)
        StockItem::query()->create([
            'product_id' => $product->id,
            'on_hand' => 100,
        ]);

        $sale = Sale::query()->create([
            'cashier_id' => $cashier->id,
            'local_txn_uuid' => 'test-uuid-123',
            'status' => 'PAID',
            'source' => 'WALK_IN',
            'subtotal' => 50000,
            'discount_total' => 0,
            'tax_total' => 5500,
            'grand_total' => 55500,
            'paid_total' => 100000,
            'change_total' => 44500,
            'occurred_at' => now(),
        ]);

        SaleItem::query()->create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'product_name_snapshot' => 'Kopi Latte',
            'qty' => 2,
            'unit_price' => 25000,
            'discount_amount' => 0,
            'line_total' => 50000,
        ]);

        Payment::query()->create([
            'sale_id' => $sale->id,
            'method' => 'CASH',
            'amount' => 100000,
            'status' => 'CONFIRMED',
        ]);

        return $sale->fresh(['items.product', 'payment', 'cashier']);
    }

    public function test_cashier_can_access_own_receipt_page(): void
    {
        $cashier = $this->createCashier();
        $sale = $this->createSaleWithItems($cashier);

        $response = $this->actingAs($cashier)->get(route('pos.receipt', $sale));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('receipt')
            ->has('sale')
            ->has('business')
        );
    }

    public function test_cashier_can_download_own_receipt_pdf(): void
    {
        $cashier = $this->createCashier();
        $sale = $this->createSaleWithItems($cashier);

        $response = $this->actingAs($cashier)->get(route('pos.receipt.download', $sale));

        $response->assertOk()
            ->assertHeader('content-type', 'application/pdf')
            ->assertHeader('content-disposition', "attachment; filename=struk-{$sale->id}.pdf");

        $this->assertStringStartsWith('%PDF', $response->getContent());
    }

    public function test_cashier_can_download_another_cashiers_receipt_pdf(): void
    {
        $cashier = $this->createCashier();
        $saleOwner = $this->createCashier('Kasir Sebelumnya', 'kasir-sebelumnya');
        $sale = $this->createSaleWithItems($saleOwner);

        $response = $this->actingAs($cashier)->get(route('pos.receipt.download', $sale));

        $response->assertOk()
            ->assertHeader('content-type', 'application/pdf')
            ->assertHeader('content-disposition', "attachment; filename=struk-{$sale->id}.pdf");
    }

    public function test_cashier_can_access_other_cashier_receipt(): void
    {
        $cashier1 = $this->createCashier('Kasir Satu', 'kasir1');
        $cashier2 = $this->createCashier('Kasir Dua', 'kasir2');
        $sale = $this->createSaleWithItems($cashier1);

        $response = $this->actingAs($cashier2)->get(route('pos.receipt', $sale));

        $response->assertOk();
    }

    public function test_supervisor_can_access_any_receipt_page(): void
    {
        $supervisor = $this->createSupervisor();
        $cashier = $this->createCashier();
        $sale = $this->createSaleWithItems($cashier);

        $response = $this->actingAs($supervisor)->get(route('pos.receipt', $sale));

        $response->assertOk();
    }

    public function test_guest_cannot_access_receipt_page(): void
    {
        $cashier = $this->createCashier();
        $sale = $this->createSaleWithItems($cashier);

        $response = $this->get(route('pos.receipt', $sale));

        $response->assertRedirect(route('login'));
    }

    public function test_receipt_contains_sale_data(): void
    {
        $cashier = $this->createCashier();
        $sale = $this->createSaleWithItems($cashier);

        $response = $this->actingAs($cashier)->get(route('pos.receipt', $sale));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('sale.id', $sale->id)
            ->has('sale.total')
            ->has('sale.items', 1)
            ->where('sale.items.0.product_name', 'Kopi Latte')
            ->has('sale.items.0.qty')
            ->where('sale.payment.method', 'CASH')
            ->has('sale.payment.cash_received')
            ->has('sale.payment.change_amount')
        );
    }

    public function test_receipt_contains_business_profile(): void
    {
        $cashier = $this->createCashier();
        $sale = $this->createSaleWithItems($cashier);

        $response = $this->actingAs($cashier)->get(route('pos.receipt', $sale));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('business.name')
            ->has('business.address')
            ->has('business.instagram_username')
            ->has('business.tiktok_username')
        );
    }

    public function test_receipt_uses_business_profile_and_parses_social_usernames(): void
    {
        $cashier = $this->createCashier();
        $sale = $this->createSaleWithItems($cashier);

        AppSetting::query()->updateOrCreate(
            ['key' => 'business.profile'],
            ['value' => [
                'name' => 'Cahaya Rasa',
                'address' => 'Alamat Toko',
                'instagram_url' => 'https://www.instagram.com/cahaya.rasa/?utm_source=qr',
                'tiktok_url' => 'https://www.tiktok.com/@cahayarasa_28/',
            ]]
        );

        $response = $this->actingAs($cashier)->get(route('pos.receipt', $sale));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('business.name', 'Cahaya Rasa')
            ->where('business.address', 'Alamat Toko')
            ->where('business.instagram_username', '@cahaya.rasa')
            ->where('business.tiktok_username', '@cahayarasa_28')
            ->missing('receipt_settings')
        );
    }

    public function test_receipt_omits_social_usernames_from_invalid_urls(): void
    {
        $cashier = $this->createCashier();
        $sale = $this->createSaleWithItems($cashier);

        AppSetting::query()->updateOrCreate(
            ['key' => 'business.profile'],
            ['value' => [
                'name' => 'Cahaya Rasa',
                'address' => 'Alamat Toko',
                'instagram_url' => 'https://bukaninstagram.com/cahaya.rasa',
                'tiktok_url' => '',
            ]]
        );

        $response = $this->actingAs($cashier)->get(route('pos.receipt', $sale));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('business.instagram_username', null)
            ->where('business.tiktok_username', null)
        );
    }

    public function test_checkout_returns_receipt_url(): void
    {
        $cashier = $this->createCashier();

        $product = Product::factory()->create([
            'name' => 'Test Product',
            'price' => 10000,
        ]);

        StockItem::query()->create([
            'product_id' => $product->id,
            'on_hand' => 100,
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
        $this->assertStringContainsString('/receipt/download', $receiptUrl);
    }
}
