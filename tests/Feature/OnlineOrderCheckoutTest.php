<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\OnlineOrder;
use App\Models\Product;
use App\Models\StockItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OnlineOrderCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_create_pickup_order_with_server_calculated_discount(): void
    {
        $product = Product::factory()->create([
            'price' => 20000,
            'discount' => 10,
            'is_active' => true,
            'is_public' => true,
        ]);
        StockItem::query()->create(['product_id' => $product->id, 'on_hand' => 3]);

        $response = $this->postJson('/checkout', [
            'idempotency_key' => '550e8400-e29b-41d4-a716-446655440001',
            'customer_name' => 'Pelanggan Web',
            'customer_phone' => '081234567890',
            'fulfillment_method' => 'PICKUP',
            'payment_method' => 'PAY_AT_STORE',
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ]);

        $response->assertCreated()->assertJsonStructure(['order_number', 'success_url', 'tracking_url']);
        $this->assertDatabaseHas('online_orders', [
            'customer_phone' => '081234567890',
            'subtotal' => 40000,
            'discount_total' => 4000,
            'shipping_cost' => 0,
            'grand_total' => 36000,
            'status' => 'MENUNGGU_PEMBAYARAN',
        ]);
        $this->assertDatabaseHas('stock_items', ['product_id' => $product->id, 'on_hand' => 3]);
        $this->assertDatabaseCount('sales', 0);
    }

    public function test_delivery_cannot_use_pay_at_store(): void
    {
        $this->postJson('/checkout', [
            'idempotency_key' => '550e8400-e29b-41d4-a716-446655440002',
            'customer_name' => 'Pelanggan Web',
            'customer_phone' => '081234567890',
            'fulfillment_method' => 'DELIVERY',
            'shipping_address' => 'Jl. Contoh 1',
            'destination_id' => '123',
            'shipping_courier_code' => 'jne',
            'shipping_service' => 'REG',
            'payment_method' => 'PAY_AT_STORE',
            'items' => [['product_id' => 1, 'quantity' => 1]],
        ])->assertUnprocessable()->assertJsonValidationErrors('payment_method');
    }

    public function test_guest_can_create_delivery_order_with_server_verified_quote_snapshot(): void
    {
        config()->set('services.rajaongkir.key', 'test-key');
        config()->set('services.rajaongkir.origin', '100');
        Http::fake(['*/calculate/domestic-cost' => Http::response(['data' => [[
            'code' => 'jne', 'name' => 'JNE', 'service' => 'REG', 'cost' => 15000, 'etd' => '2-3 hari',
        ]]])]);
        $product = Product::factory()->create(['price' => 20000, 'discount' => 10, 'is_active' => true, 'is_public' => true, 'weight_grams' => 250]);
        StockItem::query()->create(['product_id' => $product->id, 'on_hand' => 5]);

        $this->postJson('/checkout', [
            'idempotency_key' => '550e8400-e29b-41d4-a716-446655440003',
            'customer_name' => 'Pelanggan Delivery', 'customer_phone' => '081234567890',
            'fulfillment_method' => 'DELIVERY', 'shipping_address' => 'Jl. Contoh 1',
            'destination_id' => '200', 'destination_label' => 'Tumpang, Malang, Jawa Timur',
            'shipping_courier_code' => 'jne', 'shipping_service' => 'REG',
            'payment_method' => 'BANK_TRANSFER',
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ])->assertCreated();

        $this->assertDatabaseHas('online_orders', [
            'destination_label' => 'Tumpang, Malang, Jawa Timur', 'shipping_courier_name' => 'JNE',
            'shipping_service' => 'REG', 'shipping_etd' => '2-3 hari', 'shipping_cost' => 15000,
            'shipping_weight_grams' => 500, 'subtotal' => 40000, 'discount_total' => 4000, 'grand_total' => 51000,
        ]);
        Http::assertSent(fn ($request) => $request->hasHeader('key', 'test-key')
            && str_contains($request->header('Content-Type')[0], 'application/x-www-form-urlencoded')
            && $request['origin'] === '100'
            && $request['destination'] === '200'
            && $request['weight'] === 600);
    }

    public function test_repeated_checkout_with_same_idempotency_key_returns_existing_order(): void
    {
        $product = Product::factory()->create(['is_active' => true, 'is_public' => true]);
        StockItem::query()->create(['product_id' => $product->id, 'on_hand' => 3]);
        $payload = [
            'idempotency_key' => '550e8400-e29b-41d4-a716-446655440000',
            'customer_name' => 'Pelanggan Web',
            'customer_phone' => '081234567890',
            'fulfillment_method' => 'PICKUP',
            'payment_method' => 'PAY_AT_STORE',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ];

        $first = $this->postJson('/checkout', $payload)->assertCreated();
        $second = $this->postJson('/checkout', $payload)->assertOk();

        $second->assertJsonPath('order_number', $first->json('order_number'));
        $this->assertDatabaseCount('online_orders', 1);
        $this->assertDatabaseCount('online_order_items', 1);
    }

    public function test_tracking_requires_matching_token_and_does_not_expose_token(): void
    {
        $order = OnlineOrder::query()->create([
            'order_number' => 'WEB-TEST-001',
            'tracking_token' => str_repeat('a', 64),
            'customer_name' => 'Pelanggan Web',
            'customer_phone' => '081234567890',
            'fulfillment_method' => 'PICKUP',
            'shipping_cost' => 0,
            'shipping_weight_grams' => 0,
            'subtotal' => 10000,
            'discount_total' => 0,
            'grand_total' => 10000,
            'payment_method' => 'PAY_AT_STORE',
            'status' => 'MENUNGGU_PEMBAYARAN',
        ]);

        $this->get('/pesanan/'.$order->order_number.'?token=wrong')->assertNotFound();
        $this->get('/pesanan/'.$order->order_number.'?token='.$order->tracking_token)
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('storefront/OrderTrackingPage')
                ->missing('order.tracking_token')
                ->where('order.order_number', $order->order_number));
    }

    public function test_guest_can_find_tracking_by_exact_customer_name_and_tracking_number(): void
    {
        [$order] = $this->createPendingOrder(1, 2);
        $order->update(['customer_name' => 'Pelanggan Web', 'tracking_number' => 'JNE123456']);

        $this->get('/lacak-pesanan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('storefront/OrderTrackingLookupPage'));

        $this->post('/lacak-pesanan', [
            'customer_name' => 'pelanggan web',
            'tracking_number' => 'JNE123456',
        ])->assertRedirect(route('orders.track', ['orderNumber' => $order->order_number, 'token' => $order->tracking_token]));
    }

    public function test_tracking_lookup_uses_a_generic_error_for_invalid_credentials(): void
    {
        [$order] = $this->createPendingOrder(1, 2);
        $order->update(['customer_name' => 'Pelanggan Web', 'tracking_number' => 'JNE123456']);

        $this->from('/lacak-pesanan')->post('/lacak-pesanan', [
            'customer_name' => 'Nama Salah',
            'tracking_number' => 'JNE123456',
        ])->assertRedirect('/lacak-pesanan')->assertSessionHasErrors('tracking_number');
    }

    public function test_success_page_exposes_server_payment_instructions_and_payment_whatsapp_link(): void
    {
        config()->set('services.storefront_payment', [
            'bank_name' => 'Bank Test', 'bank_account_number' => '1234567890',
            'bank_account_name' => 'Cahaya Rasa', 'qris_image_url' => 'https://example.test/qris.png',
            'instructions' => 'Bayar sebelum pukul 20.00.',
        ]);
        AppSetting::query()->updateOrCreate(['key' => 'business.profile'], ['value' => ['name' => 'Cahaya Rasa', 'whatsapp_number' => '6281234567890']]);
        [$order] = $this->createPendingOrder(1, 2);
        $order->update(['payment_method' => 'BANK_TRANSFER']);

        $this->get(route('checkout.success', ['orderNumber' => $order->order_number, 'token' => $order->tracking_token]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('storefront/CheckoutSuccessPage')
                ->where('payment.bank_name', 'Bank Test')
                ->where('payment.instructions', 'Bayar sebelum pukul 20.00.')
                ->where('order.order_number', $order->order_number)
                ->where('payment_whatsapp_url', fn ($url) => str_contains($url, $order->order_number) && str_contains($url, 'Rp10.000'))
                ->missing('order.tracking_token'));

        $this->get(route('checkout.success', ['orderNumber' => $order->order_number, 'token' => 'wrong']))->assertNotFound();
    }

    public function test_cashier_confirmation_atomically_creates_web_sale_payment_and_stock_movement(): void
    {
        [$order, $product] = $this->createPendingOrder(2, 3);
        $cashier = User::factory()->create(['role' => 'CASHIER', 'is_active' => true]);

        $this->actingAs($cashier)->postJson("/api/online-orders/{$order->id}/confirm-payment")
            ->assertOk()->assertJsonPath('data.status', 'DIPROSES');

        $order->refresh();
        $this->assertNotNull($order->sale_id);
        $this->assertDatabaseHas('sales', ['id' => $order->sale_id, 'source' => 'WEB', 'status' => 'PAID']);
        $this->assertDatabaseHas('payments', ['sale_id' => $order->sale_id, 'status' => 'CONFIRMED']);
        $this->assertDatabaseHas('stock_items', ['product_id' => $product->id, 'on_hand' => 1]);
        $this->assertDatabaseHas('stock_movements', ['product_id' => $product->id, 'type' => 'SALE_OUT', 'qty_delta' => -2]);
    }

    public function test_repeated_confirmation_does_not_create_duplicates(): void
    {
        [$order] = $this->createPendingOrder(1, 2);
        $cashier = User::factory()->create(['role' => 'CASHIER', 'is_active' => true]);

        $this->actingAs($cashier)->postJson("/api/online-orders/{$order->id}/confirm-payment")->assertOk();
        $this->actingAs($cashier)->postJson("/api/online-orders/{$order->id}/confirm-payment")->assertOk();

        $this->assertDatabaseCount('sales', 1);
        $this->assertDatabaseCount('payments', 1);
        $this->assertDatabaseCount('stock_movements', 1);
    }

    public function test_insufficient_stock_rolls_back_confirmation(): void
    {
        [$order, $product] = $this->createPendingOrder(2, 1);
        $cashier = User::factory()->create(['role' => 'CASHIER', 'is_active' => true]);

        $this->actingAs($cashier)->postJson("/api/online-orders/{$order->id}/confirm-payment")
            ->assertUnprocessable()->assertJsonValidationErrors('items');

        $this->assertDatabaseCount('sales', 0);
        $this->assertDatabaseCount('payments', 0);
        $this->assertDatabaseCount('stock_movements', 0);
        $this->assertDatabaseHas('stock_items', ['product_id' => $product->id, 'on_hand' => 1]);
        $this->assertDatabaseHas('online_orders', ['id' => $order->id, 'sale_id' => null, 'status' => 'MENUNGGU_PEMBAYARAN']);
    }

    public function test_delivery_order_can_be_shipped_and_returns_whatsapp_notification_link(): void
    {
        AppSetting::query()->updateOrCreate(['key' => 'business.profile'], ['value' => ['whatsapp_number' => '6281234567890']]);
        [$order] = $this->createPendingOrder(1, 2);
        $cashier = User::factory()->create(['role' => 'CASHIER', 'is_active' => true]);
        $order->update([
            'fulfillment_method' => 'DELIVERY',
            'shipping_courier_name' => 'JNE',
            'shipping_service' => 'REG',
        ]);

        $this->actingAs($cashier)->postJson("/api/online-orders/{$order->id}/confirm-payment")->assertOk();
        $response = $this->actingAs($cashier)->patchJson("/api/online-orders/{$order->id}/status", [
            'status' => 'DIKIRIM',
            'tracking_number' => 'JNE123456',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'DIKIRIM')
            ->assertJsonPath('data.tracking_number', 'JNE123456')
            ->assertJsonPath('shipping_whatsapp_url', fn ($url) => str_contains($url, 'JNE123456'));
        $this->assertNotNull($order->fresh()->shipped_at);
    }

    public function test_only_supervisor_can_cancel_an_online_order(): void
    {
        [$order] = $this->createPendingOrder(1, 2);
        $cashier = User::factory()->create(['role' => 'CASHIER', 'is_active' => true]);
        $supervisor = User::factory()->create(['role' => 'SUPERVISOR', 'is_active' => true]);

        $this->actingAs($cashier)->patchJson("/api/online-orders/{$order->id}/status", ['status' => 'DIBATALKAN'])->assertForbidden();
        $this->actingAs($supervisor)->patchJson("/api/online-orders/{$order->id}/status", ['status' => 'DIBATALKAN'])->assertOk();
        $this->assertDatabaseHas('online_orders', ['id' => $order->id, 'status' => 'DIBATALKAN']);
    }

    public function test_shipping_and_completion_timestamps_are_persisted(): void
    {
        [$order] = $this->createPendingOrder(1, 2);
        $cashier = User::factory()->create(['role' => 'CASHIER', 'is_active' => true]);
        $order->update(['fulfillment_method' => 'DELIVERY', 'shipping_courier_name' => 'JNE']);

        $this->actingAs($cashier)->postJson("/api/online-orders/{$order->id}/confirm-payment")->assertOk();
        $this->actingAs($cashier)->patchJson("/api/online-orders/{$order->id}/status", ['status' => 'DIKIRIM', 'tracking_number' => 'JNE123'])->assertOk();
        $this->actingAs($cashier)->patchJson("/api/online-orders/{$order->id}/status", ['status' => 'SELESAI'])->assertOk();

        $order->refresh();
        $this->assertNotNull($order->shipped_at);
        $this->assertNotNull($order->completed_at);
    }

    private function createPendingOrder(int $quantity, int $stock): array
    {
        $product = Product::factory()->create(['price' => 10000, 'discount' => 0, 'is_active' => true, 'is_public' => true]);
        StockItem::query()->create(['product_id' => $product->id, 'on_hand' => $stock]);
        $order = OnlineOrder::query()->create([
            'order_number' => 'WEB-TEST-'.fake()->unique()->numerify('######'),
            'tracking_token' => fake()->unique()->regexify('[A-Za-z0-9]{64}'),
            'customer_name' => 'Pelanggan Web', 'customer_phone' => '081234567890',
            'fulfillment_method' => 'PICKUP', 'shipping_cost' => 0, 'shipping_weight_grams' => 0,
            'subtotal' => 10000 * $quantity, 'discount_total' => 0, 'grand_total' => 10000 * $quantity,
            'payment_method' => 'PAY_AT_STORE', 'status' => 'MENUNGGU_PEMBAYARAN',
        ]);
        $order->items()->create([
            'product_id' => $product->id, 'product_name_snapshot' => $product->name,
            'unit_price' => 10000, 'quantity' => $quantity, 'discount_amount' => 0,
            'line_total' => 10000 * $quantity, 'weight_grams_snapshot' => $product->weight_grams,
        ]);

        return [$order, $product];
    }
}
