<?php

/**
 * Handles refund processing for POS sales with supervisor approval.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PosRefundRequest;
use App\Models\Approval;
use App\Models\AppSetting;
use App\Models\Refund;
use App\Models\RefundItem;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PosRefundController extends Controller
{
    public function store(PosRefundRequest $request): JsonResponse
    {
        $payload = $request->validated();

        $sale = Sale::query()
            ->with(['items'])
            ->find($payload['sale_id']);

        if (! $sale) {
            return response()->json(['message' => 'Transaksi penjualan tidak ditemukan.'], 404);
        }

        if ($sale->status !== 'PAID') {
            return response()->json(['message' => 'Transaksi belum dibayar atau tidak dapat direfund.'], 422);
        }

        $occurredAt = $sale->occurred_at ?? $sale->created_at;
        if (! $occurredAt) {
            return response()->json(['message' => 'Tanggal transaksi tidak valid.'], 422);
        }

        $windowDays = $this->refundWindowDays();
        $refundDeadline = Carbon::parse($occurredAt)->addDays($windowDays)->endOfDay();
        if (now()->greaterThan($refundDeadline)) {
            return response()->json(['message' => 'Masa garansi refund sudah berakhir.'], 422);
        }

        $cashier = $request->user();

        $hasPendingApproval = Approval::query()
            ->where('sale_id', $sale->id)
            ->where('action', 'REFUND')
            ->where('status', 'PENDING')
            ->exists();

        if ($hasPendingApproval) {
            return response()->json(['message' => 'Masih menunggu approval supervisor.'], 422);
        }

        $refundedTotal = (float) Refund::query()
            ->where('sale_id', $sale->id)
            ->sum('total_amount');

        $refundedQtyMap = RefundItem::query()
            ->whereHas('refund', fn ($query) => $query->where('sale_id', $sale->id))
            ->selectRaw('sale_item_id, SUM(qty) as qty_sum')
            ->groupBy('sale_item_id')
            ->pluck('qty_sum', 'sale_item_id')
            ->all();

        $itemsById = $sale->items->keyBy('id');
        $refundItems = [];
        $refundTotal = 0.0;

        foreach ($payload['items'] as $item) {
            $saleItem = $itemsById->get((int) $item['sale_item_id']);
            if (! $saleItem) {
                return response()->json(['message' => 'Item transaksi tidak ditemukan.'], 422);
            }

            $qtyRequested = (float) $item['qty'];
            $qtyRefunded = (float) ($refundedQtyMap[$saleItem->id] ?? 0);
            $maxRefundableQty = max(0, (float) $saleItem->qty - $qtyRefunded);

            if ($qtyRequested <= 0 || $qtyRequested > $maxRefundableQty) {
                return response()->json(['message' => 'Jumlah refund melebihi sisa item yang tersedia.'], 422);
            }

            $perUnit = (float) $saleItem->line_total / max((float) $saleItem->qty, 1.0);
            $lineTotal = $perUnit * $qtyRequested;

            $refundItems[] = [
                'sale_item_id' => $saleItem->id,
                'product_id' => $saleItem->product_id,
                'qty' => $qtyRequested,
                'unit_price' => $perUnit,
                'line_total' => $lineTotal,
                'product_name' => $saleItem->product_name_snapshot,
            ];

            $refundTotal += $lineTotal;
        }

        if ($refundTotal <= 0) {
            return response()->json(['message' => 'Total refund tidak valid.'], 422);
        }

        $netTotal = max(0, (float) $sale->subtotal - (float) $sale->discount_total);
        $remainingRefundable = max(0, $netTotal - $refundedTotal);
        if ($refundTotal > $remainingRefundable) {
            return response()->json(['message' => 'Total refund melebihi batas pembayaran transaksi.'], 422);
        }

        $approval = DB::transaction(function () use ($sale, $cashier, $refundItems, $refundTotal, $payload, $windowDays) {
            return Approval::query()->create([
                'action' => 'REFUND',
                'sale_id' => $sale->id,
                'requested_by' => $cashier->id,
                'approved_by' => null,
                'status' => 'PENDING',
                'reason' => $payload['reason'],
                'payload_json' => [
                    'items' => collect($refundItems)->map(fn ($item) => [
                        'sale_item_id' => $item['sale_item_id'],
                        'product_id' => $item['product_id'],
                        'product_name' => $item['product_name'],
                        'qty' => $item['qty'],
                        'unit_price' => $item['unit_price'],
                        'line_total' => $item['line_total'],
                    ])->values()->all(),
                    'total' => $refundTotal,
                    'window_days' => $windowDays,
                ],
                'occurred_at' => now(),
            ]);
        });

        return response()->json([
            'data' => [
                'approval_id' => $approval->id,
                'sale_id' => $sale->id,
                'total_amount' => $refundTotal,
                'remaining_refundable' => max(0, $netTotal - ($refundedTotal + $refundTotal)),
                'status' => $approval->status,
            ],
            'message' => 'Permintaan refund berhasil dikirim untuk approval supervisor.',
        ]);
    }

    private function refundWindowDays(): int
    {
        $setting = AppSetting::query()->where('key', 'refund.window_days')->first();
        $value = $setting?->value;
        $days = 2;

        if (is_array($value)) {
            $days = (int) ($value['days'] ?? $value['value'] ?? $value[0] ?? $days);
        } elseif (is_numeric($value)) {
            $days = (int) $value;
        }

        return max(0, $days);
    }
}
