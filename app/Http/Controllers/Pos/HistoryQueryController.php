<?php

namespace App\Http\Controllers\Pos;

use App\Models\Approval;
use App\Models\AppSetting;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Carbon;

class HistoryQueryController
{
    /**
     * @param  array{userId?: int|null, startDate?: string|null, endDate?: string|null}  $filters
     */
    public function fetch(int $limit = 10, array $filters = []): array
    {
        return $this->buildQuery($filters)
            ->limit($limit)
            ->get()
            ->map(fn (Sale $sale) => $this->mapSale($sale))
            ->all();
    }

    /**
     * @param  array{userId?: int|null, startDate?: string|null, endDate?: string|null}  $filters
     * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>}
     */
    public function fetchPaginated(int $page, int $perPage, array $filters = []): array
    {
        $paginator = $this->buildQuery($filters)
            ->paginate($perPage, ['*'], 'page', $page);

        $data = $paginator->getCollection()
            ->map(fn (Sale $sale) => $this->mapSale($sale))
            ->values()
            ->all();

        return [
            'data' => $data,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ];
    }

    /**
     * @param  array{userId?: int|null, startDate?: string|null, endDate?: string|null}  $filters
     */
    protected function buildQuery(array $filters = []): Builder|QueryBuilder
    {
        $query = Sale::query()
            ->with(['items', 'payments', 'refunds.items'])
            ->orderByDesc('occurred_at');

        if (! empty($filters['userId'])) {
            $query->where('cashier_id', (int) $filters['userId']);
        }

        if (! empty($filters['startDate']) && ! empty($filters['endDate'])) {
            $start = Carbon::parse((string) $filters['startDate'])->startOfDay();
            $end = Carbon::parse((string) $filters['endDate'])->endOfDay();
            $query->whereBetween('occurred_at', [$start, $end]);
        } elseif (! empty($filters['startDate'])) {
            $start = Carbon::parse((string) $filters['startDate'])->startOfDay();
            $query->where('occurred_at', '>=', $start);
        } elseif (! empty($filters['endDate'])) {
            $end = Carbon::parse((string) $filters['endDate'])->endOfDay();
            $query->where('occurred_at', '<=', $end);
        }

        return $query;
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapSale(Sale $sale): array
    {
        $payment = $sale->payments->first();
        $refundItems = $sale->refunds->flatMap(fn ($refund) => $refund->items);
        $refundedQtyMap = $refundItems
            ->groupBy('sale_item_id')
            ->map(fn ($items) => (float) $items->sum('qty'))
            ->all();
        $refundedTotal = (float) $sale->refunds->sum('total_amount');
        $pendingRefundApprovals = Approval::query()
            ->where('sale_id', $sale->id)
            ->where('action', 'REFUND')
            ->where('status', 'PENDING')
            ->get();
        $pendingRefundTotal = (float) $pendingRefundApprovals->sum(fn (Approval $approval) => (float) data_get($approval->payload_json, 'total', 0));
        $hasPendingRefundApproval = $pendingRefundApprovals->isNotEmpty();
        $windowDays = $this->refundWindowDays();
        $occurredAt = $sale->occurred_at ?? $sale->created_at;
        $refundDeadline = $occurredAt
            ? Carbon::parse($occurredAt)->addDays($windowDays)->endOfDay()
            : null;
        $netTotal = max(0, (float) $sale->subtotal - (float) $sale->discount_total);
        $refundableRemaining = max(0, $netTotal - $refundedTotal - $pendingRefundTotal);
        $canRefund = $sale->status === 'PAID'
            && $refundDeadline
            && now()->lessThanOrEqualTo($refundDeadline)
            && $refundableRemaining > 0
            && ! $hasPendingRefundApproval;

        $itemsDetail = $sale->items->map(fn ($it) => [
            'id' => (string) $it->id,
            'name' => $it->product_name_snapshot,
            'qty' => (float) $it->qty,
            'price' => (float) $it->unit_price,
            'lineTotal' => (float) $it->line_total,
            'refundUnitPrice' => (float) $it->line_total / max((float) $it->qty, 1.0),
            'refundedQty' => (float) ($refundedQtyMap[$it->id] ?? 0),
            'refundableQty' => max(0, (float) $it->qty - (float) ($refundedQtyMap[$it->id] ?? 0)),
        ])->all();

        $time = $sale->occurred_at ? Carbon::parse($sale->occurred_at)->format('H:i') : '';

        return [
            'id' => $sale->local_txn_uuid,
            'saleId' => $sale->id,
            'invoiceNo' => $sale->server_invoice_no ? $sale->server_invoice_no : '#'.$sale->id,
            'time' => $time,
            'items' => $sale->items->count(),
            'totalBeforeDiscount' => (float) $sale->subtotal,
            'discountTotal' => (float) $sale->discount_total,
            'totalAfterDiscount' => (float) max(0, (float) $sale->subtotal - (float) $sale->discount_total),
            'taxTotal' => (float) $sale->tax_total,
            'total' => (float) $sale->grand_total,
            'paymentMethod' => $payment?->method ?? 'CASH',
            'status' => $sale->status,
            'refundedTotal' => $refundedTotal,
            'refundableRemaining' => $refundableRemaining,
            'pendingRefundTotal' => $pendingRefundTotal,
            'hasPendingRefundApproval' => $hasPendingRefundApproval,
            'refundDeadline' => $refundDeadline?->toDateString(),
            'canRefund' => $canRefund,
            'itemsDetail' => $itemsDetail,
        ];
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
