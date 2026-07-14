<?php

namespace Database\Factories;

use App\Enums\OnlineOrderStatus;
use App\Models\OnlineOrder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<OnlineOrder>
 */
class OnlineOrderFactory extends Factory
{
    protected $model = OnlineOrder::class;

    public function definition(): array
    {
        $subtotal = fake()->numberBetween(10000, 500000);
        $shippingCost = fake()->numberBetween(0, 50000);

        return [
            'order_number' => 'WEB-'.now()->format('Ymd').'-'.strtoupper(Str::random(8)),
            'tracking_token' => Str::random(64),
            'idempotency_key' => fake()->uuid(),
            'customer_name' => fake()->name(),
            'customer_phone' => fake()->numerify('08##########'),
            'fulfillment_method' => 'PICKUP',
            'shipping_cost' => $shippingCost,
            'shipping_weight_grams' => 0,
            'subtotal' => $subtotal,
            'discount_total' => 0,
            'grand_total' => $subtotal + $shippingCost,
            'payment_method' => 'PAY_AT_STORE',
            'status' => OnlineOrderStatus::AwaitingPayment,
        ];
    }
}
