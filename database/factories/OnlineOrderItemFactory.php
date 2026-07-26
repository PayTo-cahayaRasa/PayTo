<?php

namespace Database\Factories;

use App\Models\OnlineOrder;
use App\Models\OnlineOrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OnlineOrderItem>
 */
class OnlineOrderItemFactory extends Factory
{
    protected $model = OnlineOrderItem::class;

    public function definition(): array
    {
        $unitPrice = fake()->numberBetween(5000, 250000);
        $quantity = fake()->numberBetween(1, 5);

        return [
            'online_order_id' => OnlineOrder::factory(),
            'product_id' => Product::factory(),
            'product_name_snapshot' => fake()->words(3, true),
            'unit_price' => $unitPrice,
            'quantity' => $quantity,
            'discount_amount' => 0,
            'line_total' => $unitPrice * $quantity,
            'weight_grams_snapshot' => fake()->numberBetween(50, 2000),
        ];
    }
}
