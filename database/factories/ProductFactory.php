<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true),
            'sku' => fake()->unique()->bothify('PRD-###??'),
            'barcode' => fake()->unique()->numerify('############'),
            'price' => fake()->randomFloat(2, 5000, 250000),
            'description' => fake()->sentence(),
            'discount' => 0,
            'cost' => fake()->randomFloat(2, 1000, 100000),
            'uom' => 'pcs',
            'is_active' => true,
            'is_public' => false,
            'featured' => false,
            'image_path' => null,
        ];
    }
}
