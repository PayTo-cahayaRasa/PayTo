<?php

namespace App\Services;

use App\Enums\OnlineOrderStatus;
use App\Models\OnlineOrder;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OnlineOrderCheckoutService
{
    public function shippingWeight(array $items): int
    {
        $products = Product::query()->whereIn('id', collect($items)->pluck('product_id'))->get()->keyBy('id');
        $weight = 100;

        foreach ($items as $item) {
            $product = $products->get($item['product_id']);
            if (! $product?->is_active || ! $product->is_public || ! $product->weight_grams) {
                throw ValidationException::withMessages(['items' => 'Produk tidak tersedia atau berat produk belum diatur.']);
            }

            $weight += (int) $product->weight_grams * (int) $item['quantity'];
        }

        return $weight;
    }

    public function create(array $payload): OnlineOrder
    {
        $existingOrder = OnlineOrder::query()->where('idempotency_key', $payload['idempotency_key'])->first();
        if ($existingOrder) {
            return $existingOrder;
        }

        $products = Product::query()
            ->with('stockItem')
            ->whereIn('id', collect($payload['items'])->pluck('product_id'))
            ->where('is_active', true)
            ->where('is_public', true)
            ->get()
            ->keyBy('id');

        $subtotal = 0.0;
        $discountTotal = 0.0;
        $weight = 0;
        $items = [];
        $quote = null;

        foreach ($payload['items'] as $requestedItem) {
            $product = $products->get($requestedItem['product_id']);
            $quantity = (int) $requestedItem['quantity'];

            if (! $product || (float) ($product->stockItem?->on_hand ?? 0) < $quantity) {
                throw ValidationException::withMessages(['items' => 'Produk tidak tersedia atau stok tidak mencukupi.']);
            }

            if ($payload['fulfillment_method'] === 'DELIVERY' && ! $product->weight_grams) {
                throw ValidationException::withMessages(['items' => "Berat produk {$product->name} belum diatur."]);
            }

            $unitPrice = (float) $product->price;
            $discount = $unitPrice * ((float) $product->discount / 100) * $quantity;
            $lineTotal = ($unitPrice * $quantity) - $discount;
            $subtotal += $unitPrice * $quantity;
            $discountTotal += $discount;
            $weight += ((int) $product->weight_grams * $quantity);
            $items[] = compact('product', 'quantity', 'unitPrice', 'discount', 'lineTotal');
        }

        if ($payload['fulfillment_method'] === 'PICKUP' && $payload['payment_method'] === 'PAY_AT_STORE') {
            $shippingCost = 0.0;
        } elseif ($payload['fulfillment_method'] === 'PICKUP') {
            $shippingCost = 0.0;
        } else {
            $quote = $this->shippingQuote($payload, $weight + 100);
            $shippingCost = $quote['cost'];
        }

        try {
            return DB::transaction(function () use ($payload, $items, $subtotal, $discountTotal, $weight, $shippingCost, $quote): OnlineOrder {
                $order = OnlineOrder::query()->create([
                    'order_number' => 'WEB-'.now()->format('Ymd').'-'.strtoupper(Str::random(8)),
                    'tracking_token' => Str::random(64),
                    'idempotency_key' => $payload['idempotency_key'],
                    'customer_name' => $payload['customer_name'],
                    'customer_phone' => $payload['customer_phone'],
                    'fulfillment_method' => $payload['fulfillment_method'],
                    'shipping_address' => $payload['shipping_address'] ?? null,
                    'destination_id' => $payload['destination_id'] ?? null,
                    'destination_label' => $payload['destination_label'] ?? null,
                    'shipping_courier_code' => $payload['shipping_courier_code'] ?? null,
                    'shipping_courier_name' => $quote['courier_name'] ?? null,
                    'shipping_service' => $payload['shipping_service'] ?? null,
                    'shipping_cost' => $shippingCost,
                    'shipping_etd' => $quote['etd'] ?? null,
                    'shipping_weight_grams' => $weight,
                    'shipping_quoted_at' => $payload['fulfillment_method'] === 'DELIVERY' ? now() : null,
                    'subtotal' => $subtotal,
                    'discount_total' => $discountTotal,
                    'grand_total' => $subtotal - $discountTotal + $shippingCost,
                    'payment_method' => $payload['payment_method'],
                    'status' => OnlineOrderStatus::AwaitingPayment,
                    'customer_note' => $payload['customer_note'] ?? null,
                ]);

                foreach ($items as $item) {
                    $order->items()->create([
                        'product_id' => $item['product']->id,
                        'product_name_snapshot' => $item['product']->name,
                        'unit_price' => $item['unitPrice'],
                        'quantity' => $item['quantity'],
                        'discount_amount' => $item['discount'],
                        'line_total' => $item['lineTotal'],
                        'weight_grams_snapshot' => (int) $item['product']->weight_grams,
                    ]);
                }

                return $order;
            });
        } catch (QueryException $exception) {
            $order = OnlineOrder::query()->where('idempotency_key', $payload['idempotency_key'])->first();
            if ($order) {
                return $order;
            }

            throw $exception;
        }
    }

    private function shippingQuote(array $payload, int $weight): array
    {
        $quotes = app(RajaOngkirService::class)->quote(
            $payload['destination_id'],
            $weight,
            $payload['shipping_courier_code'],
        );

        $quote = collect($quotes)->first(fn (array $quote): bool => $quote['service'] === $payload['shipping_service']);
        if (! $quote) {
            throw ValidationException::withMessages(['shipping_service' => 'Layanan pengiriman tidak valid atau telah berubah.']);
        }

        return $quote;
    }
}
