<?php

namespace App\Services\Pos;

use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutProcessor
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function process(array $payload, User $cashier): array
    {
        $items = $payload['items'] ?? [];
        $paymentMethod = (string) ($payload['payment_method'] ?? '');
        $cashReceived = (float) ($payload['cash_received'] ?? 0);
        $localTransactionUuid = isset($payload['local_txn_uuid'])
            ? (string) $payload['local_txn_uuid']
            : (string) Str::uuid();
        $occurredAt = isset($payload['occurred_at'])
            ? Carbon::parse((string) $payload['occurred_at'])
            : now();

        $products = Product::query()
            ->whereIn('id', collect($items)->pluck('product_id'))
            ->get()
            ->keyBy('id');

        $subtotal = 0.0;
        $discountTotal = 0.0;
        $lineItems = [];
        $responseItems = [];

        foreach ($items as $item) {
            $product = $products->get($item['product_id']);
            if (! $product) {
                throw ValidationException::withMessages([
                    'items' => 'Produk tidak ditemukan.',
                ]);
            }

            $qty = (float) $item['qty'];
            $unitPrice = (float) $product->price;
            $lineSubtotal = $unitPrice * $qty;
            $discountPercent = (float) ($product->discount ?? 0);
            $discountPercent = max(0, min($discountPercent, 100));
            $discountPerUnit = ($unitPrice * $discountPercent) / 100;
            $discountAmount = $discountPerUnit * $qty;

            if ($discountAmount > $lineSubtotal) {
                throw ValidationException::withMessages([
                    'items' => 'Diskon melebihi total item.',
                ]);
            }

            $lineTotal = $lineSubtotal - $discountAmount;

            $subtotal += $lineSubtotal;
            $discountTotal += $discountAmount;

            $lineItems[] = [
                'product_id' => $product->id,
                'product_name_snapshot' => $product->name,
                'unit_price' => $unitPrice,
                'qty' => $qty,
                'discount_amount' => $discountAmount,
                'line_total' => $lineTotal,
            ];

            $priceAfterDiscount = $qty > 0 ? ($lineTotal / $qty) : $lineTotal;

            $responseItems[] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'qty' => $qty,
                'unit_price' => $unitPrice,
                'discount_amount' => $discountAmount,
                'price_after_discount' => $priceAfterDiscount,
                'line_total' => $lineTotal,
            ];
        }

        $taxTotal = 0.0;
        foreach ($lineItems as $lineItem) {
            $taxTotal += ((float) $lineItem['line_total']) * 0.11;
        }
        $grandTotal = ($subtotal - $discountTotal) + $taxTotal;

        if ($paymentMethod === 'CASH' && $cashReceived < $grandTotal) {
            throw ValidationException::withMessages([
                'cash_received' => 'Uang diterima tidak mencukupi.',
            ]);
        }

        $paidTotal = $paymentMethod === 'CASH' ? $cashReceived : $grandTotal;
        $changeTotal = $paymentMethod === 'CASH' ? ($cashReceived - $grandTotal) : 0;

        $sale = DB::transaction(function () use ($cashier, $lineItems, $paymentMethod, $paidTotal, $changeTotal, $taxTotal, $subtotal, $discountTotal, $grandTotal, $payload, $localTransactionUuid, $occurredAt) {
            $sale = Sale::query()->create([
                'server_invoice_no' => null,
                'local_txn_uuid' => $localTransactionUuid,
                'status' => 'PAID',
                'cashier_id' => $cashier->id,
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'tax_total' => $taxTotal,
                'grand_total' => $grandTotal,
                'paid_total' => $paidTotal,
                'change_total' => $changeTotal,
                'occurred_at' => $occurredAt,
            ]);

            $invoiceNumber = 'INV-'.now()->format('Ymd').'-'.str_pad((string) $sale->id, 6, '0', STR_PAD_LEFT);
            $sale->update([
                'server_invoice_no' => $invoiceNumber,
            ]);

            foreach ($lineItems as $lineItem) {
                SaleItem::query()->create(array_merge($lineItem, [
                    'sale_id' => $sale->id,
                ]));
            }

            Payment::query()->create([
                'sale_id' => $sale->id,
                'method' => $paymentMethod,
                'amount' => $paidTotal,
                'reference' => $payload['reference'] ?? null,
                'status' => 'CONFIRMED',
            ]);

            return $sale;
        });

        return [
            'sale_id' => $sale->id,
            'invoice_no' => $sale->server_invoice_no,
            'items' => $responseItems,
            'totals' => [
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'tax_total' => $taxTotal,
                'grand_total' => $grandTotal,
                'paid_total' => $paidTotal,
                'change_total' => $changeTotal,
            ],
        ];
    }
}
