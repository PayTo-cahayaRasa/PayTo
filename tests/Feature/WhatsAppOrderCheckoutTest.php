<?php

namespace Tests\Feature;

use App\Enums\SaleSource;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WhatsAppOrderCheckoutTest extends TestCase
{
    use RefreshDatabase;

    private User $cashier;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cashier = User::factory()->create([
            'role' => 'CASHIER',
            'is_active' => true,
        ]);

        $this->product = Product::factory()->create([
            'name' => 'Kopi Latte',
            'price' => 25000,
            'stock' => 100,
            'discount' => 0,
        ]);
    }

    /** @test */
    public function checkout_without_source_defaults_to_walk_in(): void
    {
        $response = $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/pos/checkout', [
                'payment_method' => 'CASH',
                'cash_received' => 30000,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'qty' => 1,
                    ],
                ],
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('sales', [
            'source' => 'WALK_IN',
            'customer_name' => null,
            'customer_phone' => null,
        ]);
    }

    /** @test */
    public function checkout_with_walk_in_source_stores_correctly(): void
    {
        $response = $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/pos/checkout', [
                'source' => 'WALK_IN',
                'payment_method' => 'CASH',
                'cash_received' => 30000,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'qty' => 1,
                    ],
                ],
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('sales', [
            'source' => 'WALK_IN',
        ]);
    }

    /** @test */
    public function checkout_with_whatsapp_source_requires_customer_name(): void
    {
        $response = $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/pos/checkout', [
                'source' => 'WHATSAPP',
                'customer_phone' => '6281234567890',
                'payment_method' => 'CASH',
                'cash_received' => 30000,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'qty' => 1,
                    ],
                ],
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['customer_name']);
    }

    /** @test */
    public function checkout_with_whatsapp_source_requires_customer_phone(): void
    {
        $response = $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/pos/checkout', [
                'source' => 'WHATSAPP',
                'customer_name' => 'Budi',
                'payment_method' => 'CASH',
                'cash_received' => 30000,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'qty' => 1,
                    ],
                ],
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['customer_phone']);
    }

    /** @test */
    public function checkout_with_whatsapp_source_validates_phone_format(): void
    {
        $response = $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/pos/checkout', [
                'source' => 'WHATSAPP',
                'customer_name' => 'Budi',
                'customer_phone' => '+62-812-3456-7890', // with + and dash
                'payment_method' => 'CASH',
                'cash_received' => 30000,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'qty' => 1,
                    ],
                ],
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['customer_phone']);
    }

    /** @test */
    public function checkout_with_valid_whatsapp_order_succeeds(): void
    {
        $response = $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/pos/checkout', [
                'source' => 'WHATSAPP',
                'customer_name' => 'Budi Santoso',
                'customer_phone' => '6281234567890',
                'payment_method' => 'CASH',
                'cash_received' => 30000,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'qty' => 2,
                    ],
                ],
            ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'sale_id',
            'invoice_no',
            'receipt_url',
        ]);

        $this->assertDatabaseHas('sales', [
            'source' => 'WHATSAPP',
            'customer_name' => 'Budi Santoso',
            'customer_phone' => '6281234567890',
        ]);
    }

    /** @test */
    public function checkout_rejects_invalid_source(): void
    {
        $response = $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/pos/checkout', [
                'source' => 'ONLINE', // not allowed
                'payment_method' => 'CASH',
                'cash_received' => 30000,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'qty' => 1,
                    ],
                ],
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['source']);
    }

    /** @test */
    public function whatsapp_order_applies_product_discount_correctly(): void
    {
        $productWithDiscount = Product::factory()->create([
            'name' => 'Kopi Espresso',
            'price' => 20000,
            'stock' => 100,
            'discount' => 10, // 10% discount
        ]);

        $response = $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/pos/checkout', [
                'source' => 'WHATSAPP',
                'customer_name' => 'Andi',
                'customer_phone' => '6289876543210',
                'payment_method' => 'CASH',
                'cash_received' => 25000,
                'items' => [
                    [
                        'product_id' => $productWithDiscount->id,
                        'qty' => 1,
                    ],
                ],
            ]);

        $response->assertStatus(200);

        // Verify discount applied (10% of 20000 = 2000)
        $response->assertJson([
            'totals' => [
                'discount_total' => 2000,
            ],
        ]);
    }

    /** @test */
    public function sale_model_casts_source_to_enum(): void
    {
        $this->actingAs($this->cashier, 'sanctum')
            ->postJson('/api/pos/checkout', [
                'source' => 'WHATSAPP',
                'customer_name' => 'Test',
                'customer_phone' => '6281234567890',
                'payment_method' => 'CASH',
                'cash_received' => 30000,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'qty' => 1,
                    ],
                ],
            ]);

        $sale = \App\Models\Sale::query()->latest()->first();

        $this->assertInstanceOf(SaleSource::class, $sale->source);
        $this->assertEquals(SaleSource::WhatsApp, $sale->source);
        $this->assertEquals('WhatsApp', $sale->source->label());
    }
}
