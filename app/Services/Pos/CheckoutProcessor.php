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
    private const MIN_PHONE_DIGITS = 10;
    private const MAX_PHONE_DIGITS = 15;

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function process(array $payload, User $cashier): array
    {
        $items = $payload['items'] ?? [];
        $paymentMethod = (string) ($payload['payment_method'] ?? '');
        $cashReceived = (float) ($payload['cash_received'] ?? 0);
        $source = ($payload['source'] ?? 'WALK_IN');
        $customerName = $payload['customer_name'] ?? null;
        $customerPhone = $payload['customer_phone'] ?? null;

        // ✅ Validate and normalize phone
        $customerPhone = $this->normalizePhone($customerPhone);

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

        $sale = DB::transaction(function () use ($cashier, $lineItems, $paymentMethod, $paidTotal, $changeTotal, $taxTotal, $subtotal, $discountTotal, $grandTotal, $payload, $localTransactionUuid, $occurredAt, $source, $customerName, $customerPhone) {
            $sale = Sale::query()->create([
                'server_invoice_no' => null,
                'local_txn_uuid' => $localTransactionUuid,
                'status' => 'PAID',
                'source' => $source,
                'customer_name' => $customerName,
                'customer_phone' => $customerPhone,
                'cashier_id' => $cashier->id,
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'tax_total' => $taxTotal,
                'grand_total' => $grandTotal,
                'paid_total' => $paidTotal,
                'change_total' => $changeTotal,
                'occurred_at' => $occurredAt,
            ]);

            // ✅ Generate unpredictable invoice number
            $invoiceNumber = $this->generateInvoiceNumber($sale->id, $occurredAt);
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

    /**
     * Normalize and validate phone number
     */
    private function normalizePhone(?string $phone): ?string
    {
        if (empty($phone)) {
            return null;
        }

        // Remove all non-digit characters
        $digits = preg_replace('/[^0-9]/', '', $phone);

        // Validate digit count (Indonesian numbers: 10-15 digits)
        $length = strlen($digits);
        if ($length < self::MIN_PHONE_DIGITS || $length > self::MAX_PHONE_DIGITS) {
            throw ValidationException::withMessages([
                'customer_phone' => 'Nomor WhatsApp harus 10-15 digit.',
            ]);
        }

        // Reject obviously fake numbers (all same digit, sequential, etc.)
        if ($this->isFakePhoneNumber($digits)) {
            throw ValidationException::withMessages([
                'customer_phone' => 'Nomor WhatsApp tidak valid.',
            ]);
        }

        // Ensure Indonesian format (starts with 0 or 62)
        // If starts with 0, convert to 62
        if (str_starts_with($digits, '0')) {
            $digits = '62' . substr($digits, 1);
        }

        return $digits;
    }

    /**
     * Check if phone number appears to be fake/random
     */
    private function isFakePhoneNumber(string $digits): bool
    {
        // Check for all same digits (0000000000, 1111111111, etc.)
        if (preg_match('/^(\d)\1+$/', $digits)) {
            return true;
        }

        // Check for sequential numbers (1234567890, 0987654321)
        $sequential = '0123456789';
        $sequentialReverse = '9876543210';
        if (str_contains($sequential, $digits) || str_contains($sequentialReverse, $digits)) {
            return true;
        }

        // Check if number is too repetitive (>80% same digit)
        $counts = count_chars($digits, 1);
        $maxCount = max($counts);
        if ($maxCount / strlen($digits) > 0.8) {
            return true;
        }

        return false;
    }

    /**
     * Generate secure, unpredictable invoice number
     *
     * Format: INV-YYYYMMDD-XXXXXX-XXXX (random suffix)
     * - YYYYMMDD = date
     * - XXXXXX = zero-padded sale ID
     * - XXXX = random alphanumeric for unpredictability
     */
    private function generateInvoiceNumber(int $saleId, Carbon $occurredAt): string
    {
        $date = $occurredAt->format('Ymd');
        $id = str_pad((string) $saleId, 6, '0', STR_PAD_LEFT);
        // Add random suffix for unpredictability
        $random = strtoupper(Str::random(4));

        return "INV-{$date}-{$id}-{$random}";
    }
}
