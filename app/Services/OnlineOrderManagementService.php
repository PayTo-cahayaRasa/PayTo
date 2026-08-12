<?php

namespace App\Services;

use App\Enums\OnlineOrderStatus;
use App\Enums\SaleSource;
use App\Models\OnlineOrder;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockItem;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OnlineOrderManagementService
{
    public function confirmPayment(OnlineOrder $order, User $cashier, ?string $selectedPaymentMethod = null): OnlineOrder
    {
        if ($order->sale_id) {
            return $order;
        }

        if (! in_array($order->status, [OnlineOrderStatus::AwaitingPayment, OnlineOrderStatus::PaymentUnderReview], true)) {
            throw ValidationException::withMessages(['status' => 'Pesanan tidak dapat dikonfirmasi.']);
        }

        return DB::transaction(function () use ($order, $cashier, $selectedPaymentMethod): OnlineOrder {
            $order = OnlineOrder::query()->lockForUpdate()->findOrFail($order->id);
            $order->load('items.product');
            if ($order->sale_id) {
                return $order;
            }

            if (! in_array($order->status, [OnlineOrderStatus::AwaitingPayment, OnlineOrderStatus::PaymentUnderReview], true)) {
                throw ValidationException::withMessages(['status' => 'Pesanan tidak dapat dikonfirmasi.']);
            }

            $paymentMethod = $this->resolvePaymentMethod($order, $selectedPaymentMethod);

            $sale = Sale::query()->create([
                'local_txn_uuid' => (string) Str::uuid(),
                'status' => 'PAID',
                'source' => SaleSource::Web,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'cashier_id' => $cashier->id,
                'subtotal' => $order->subtotal,
                'discount_total' => $order->discount_total,
                'tax_total' => 0,
                'grand_total' => $order->grand_total,
                'paid_total' => $order->grand_total,
                'change_total' => 0,
                'occurred_at' => now(),
            ]);
            $sale->update(['server_invoice_no' => 'WEB-'.now()->format('Ymd').'-'.str_pad((string) $sale->id, 6, '0', STR_PAD_LEFT)]);

            foreach ($order->items as $item) {
                $updated = StockItem::query()
                    ->where('product_id', $item->product_id)
                    ->where('on_hand', '>=', $item->quantity)
                    ->decrement('on_hand', $item->quantity);

                if ($updated !== 1) {
                    throw ValidationException::withMessages(['items' => "Stok {$item->product_name_snapshot} tidak mencukupi."]);
                }

                SaleItem::query()->create([
                    'sale_id' => $sale->id,
                    'product_id' => $item->product_id,
                    'product_name_snapshot' => $item->product_name_snapshot,
                    'unit_price' => $item->unit_price,
                    'qty' => $item->quantity,
                    'discount_amount' => $item->discount_amount,
                    'line_total' => $item->line_total,
                ]);

                StockMovement::query()->create([
                    'product_id' => $item->product_id,
                    'type' => 'SALE_OUT',
                    'qty_delta' => -$item->quantity,
                    'ref_type' => 'online_order',
                    'ref_id' => (string) $order->id,
                    'created_by' => $cashier->id,
                ]);
            }

            Payment::query()->create([
                'sale_id' => $sale->id,
                'method' => $paymentMethod,
                'amount' => $order->grand_total,
                'status' => 'CONFIRMED',
            ]);

            $order->update([
                'sale_id' => $sale->id,
                'status' => OnlineOrderStatus::Processing,
                'paid_at' => now(),
            ]);

            return $order->fresh(['items']);
        });
    }

    private function resolvePaymentMethod(OnlineOrder $order, ?string $selectedPaymentMethod): string
    {
        if ($order->fulfillment_method !== 'PICKUP' || $order->payment_method !== 'PAY_AT_STORE') {
            return $order->payment_method;
        }

        if (! in_array($selectedPaymentMethod, ['CASH', 'QRIS_MANUAL', 'BANK_TRANSFER'], true)) {
            throw ValidationException::withMessages([
                'payment_method' => 'Pilih metode pembayaran toko sebelum mengonfirmasi pesanan.',
            ]);
        }

        return $selectedPaymentMethod;
    }

    public function updateStatus(OnlineOrder $order, OnlineOrderStatus $status, ?string $trackingNumber = null): OnlineOrder
    {
        if (! $order->status->canTransitionTo($status)) {
            throw ValidationException::withMessages(['status' => 'Transisi status tidak valid.']);
        }

        if ($status === OnlineOrderStatus::Shipped && ($trackingNumber === null || trim($trackingNumber) === '')) {
            throw ValidationException::withMessages(['tracking_number' => 'Nomor resi wajib diisi sebelum pesanan dikirim.']);
        }

        $attributes = ['status' => $status];
        if ($status === OnlineOrderStatus::Shipped) {
            $attributes['tracking_number'] = trim((string) $trackingNumber);
            $attributes['shipped_at'] = now();
        }
        if ($status === OnlineOrderStatus::Completed) {
            $attributes['completed_at'] = now();
        }

        $order->update($attributes);

        return $order->fresh(['items']);
    }
}
