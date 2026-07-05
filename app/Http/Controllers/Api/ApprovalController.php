<?php

/**
 * Handles supervisor approvals for sensitive POS actions such as refunds.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApprovalApproveRequest;
use App\Http\Requests\ApprovalRejectRequest;
use App\Models\Approval;
use App\Models\AppSetting;
use App\Models\AuditLog;
use App\Models\Refund;
use App\Models\RefundItem;
use App\Models\Sale;
use App\Models\StockItem;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ApprovalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');
        $user = $request->user();

        $approvals = Approval::query()
            ->with(['requester', 'approver', 'sale'])
            ->when($status, fn ($query) => $query->where('status', strtoupper((string) $status)))
            ->when(
                $user->role !== 'SUPERVISOR',
                fn ($query) => $query->where('requested_by', $user->id)
            )
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $approvals->map(fn (Approval $approval) => $this->formatApproval($approval))->values()->all(),
        ]);
    }

    /**
     * Get pending approvals (supervisor only)
     */
    public function pending(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only supervisors can view all pending approvals
        if ($user->role !== 'SUPERVISOR') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $approvals = Approval::query()
            ->with(['requester', 'sale'])
            ->where('status', 'PENDING')
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'data' => $approvals->map(fn (Approval $approval) => $this->formatApproval($approval))->values()->all(),
        ]);
    }

    public function approve(ApprovalApproveRequest $request, Approval $approval): JsonResponse
    {
        if ($approval->status !== 'PENDING') {
            return response()->json(['message' => 'Approval sudah diproses.'], 422);
        }

        $approver = $this->resolveApprover($request);
        if (! $approver) {
            return response()->json(['message' => 'Supervisor tidak ditemukan.'], 422);
        }

        if ($approval->action === 'REFUND') {
            $result = $this->processRefundApproval($approval, $approver);
            if ($result['status'] !== 'ok') {
                return response()->json(['message' => $result['message']], 422);
            }
        }

        $approval->update([
            'status' => 'APPROVED',
            'approved_by' => $approver->id,
        ]);

        return response()->json([
            'data' => $this->formatApproval($approval->fresh(['requester', 'approver', 'sale'])),
            'message' => 'Approval berhasil disetujui.',
        ]);
    }

    public function reject(ApprovalRejectRequest $request, Approval $approval): JsonResponse
    {
        if ($approval->status !== 'PENDING') {
            return response()->json(['message' => 'Approval sudah diproses.'], 422);
        }

        $approver = $this->resolveApprover($request);
        if (! $approver) {
            return response()->json(['message' => 'Supervisor tidak ditemukan.'], 422);
        }

        $payload = is_array($approval->payload_json) ? $approval->payload_json : [];
        $payload['rejection_reason'] = $request->validated()['reason'];
        $payload['rejected_at'] = now()->toDateTimeString();

        $approval->update([
            'status' => 'REJECTED',
            'approved_by' => $approver->id,
            'payload_json' => $payload,
        ]);

        return response()->json([
            'data' => $this->formatApproval($approval->fresh(['requester', 'approver', 'sale'])),
            'message' => 'Approval berhasil ditolak.',
        ]);
    }

    private function formatApproval(Approval $approval): array
    {
        $payload = is_array($approval->payload_json) ? $approval->payload_json : [];
        $items = $payload['items'] ?? [];
        $itemsCount = is_array($items) ? count($items) : 0;
        $total = (float) ($payload['total'] ?? 0);
        $time = $approval->occurred_at
            ? $approval->occurred_at->locale('id')->diffForHumans()
            : $approval->created_at?->locale('id')->diffForHumans();

        // ✅ Enhanced requester visibility
        $requester = $approval->requester;
        $sale = $approval->sale;

        return [
            'id' => $approval->id,
            'action' => $approval->action,
            'status' => $approval->status ?? 'PENDING',
            // Basic info
            'cashier' => $requester?->name ?? 'Kasir',
            'approver' => $approval->approver?->name,
            'reason' => $approval->reason,
            'time' => $time,
            // ✅ Enhanced: Full requester details for supervisor visibility
            'requester' => [
                'id' => $requester?->id,
                'name' => $requester?->name ?? 'Unknown',
                'role' => $requester?->role ?? 'UNKNOWN',
                'employee_id' => $requester ? sprintf('KSR-%03d', $requester->id) : null,
            ],
            // ✅ Enhanced: Sale details for cross-verification
            'sale' => $sale ? [
                'id' => $sale->id,
                'invoice_no' => $sale->server_invoice_no ?: '#'.$sale->id,
                'cashier_id' => $sale->cashier_id,
                'total' => (float) $sale->grand_total,
                'occurred_at' => $sale->occurred_at?->format('d/m/Y H:i'),
            ] : null,
            // Transaction details
            'total' => $total,
            'items_count' => $itemsCount,
            // ✅ Flag if requester is different from sale cashier (for audit)
            'is_cross_cashier_request' => $sale && $requester && $sale->cashier_id !== $requester->id,
        ];
    }

    private function resolveApprover(Request $request): ?User
    {
        return $request->user();
    }

    /**
     * @return array{status: string, message: string}
     */
    private function processRefundApproval(Approval $approval, User $approver): array
    {
        $sale = Sale::query()->with(['items'])->find((int) $approval->sale_id);
        if (! $sale) {
            return ['status' => 'error', 'message' => 'Transaksi penjualan tidak ditemukan.'];
        }

        if ($sale->status !== 'PAID') {
            return ['status' => 'error', 'message' => 'Transaksi belum dibayar atau tidak dapat direfund.'];
        }

        $occurredAt = $sale->occurred_at ?? $sale->created_at;
        if (! $occurredAt) {
            return ['status' => 'error', 'message' => 'Tanggal transaksi tidak valid.'];
        }

        $windowDays = $this->refundWindowDays();
        $refundDeadline = Carbon::parse($occurredAt)->addDays($windowDays)->endOfDay();
        if (now()->greaterThan($refundDeadline)) {
            return ['status' => 'error', 'message' => 'Masa garansi refund sudah berakhir.'];
        }

        $payload = is_array($approval->payload_json) ? $approval->payload_json : [];
        $requestedItems = is_array($payload['items'] ?? null) ? $payload['items'] : [];

        if (count($requestedItems) === 0) {
            return ['status' => 'error', 'message' => 'Item refund tidak ditemukan.'];
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

        foreach ($requestedItems as $item) {
            $saleItemId = (int) ($item['sale_item_id'] ?? 0);
            $qtyRequested = (float) ($item['qty'] ?? 0);

            $saleItem = $itemsById->get($saleItemId);
            if (! $saleItem) {
                return ['status' => 'error', 'message' => 'Item transaksi tidak ditemukan.'];
            }

            $qtyRefunded = (float) ($refundedQtyMap[$saleItem->id] ?? 0);
            $maxRefundableQty = max(0, (float) $saleItem->qty - $qtyRefunded);

            if ($qtyRequested <= 0 || $qtyRequested > $maxRefundableQty) {
                return ['status' => 'error', 'message' => 'Jumlah refund melebihi sisa item yang tersedia.'];
            }

            $perUnit = (float) $saleItem->line_total / max((float) $saleItem->qty, 1.0);
            $lineTotal = $perUnit * $qtyRequested;

            $refundItems[] = [
                'sale_item_id' => $saleItem->id,
                'product_id' => $saleItem->product_id,
                'qty' => $qtyRequested,
                'unit_price' => $perUnit,
                'line_total' => $lineTotal,
            ];

            $refundTotal += $lineTotal;
        }

        if ($refundTotal <= 0) {
            return ['status' => 'error', 'message' => 'Total refund tidak valid.'];
        }

        $netTotal = max(0, (float) $sale->subtotal - (float) $sale->discount_total);
        $remainingRefundable = max(0, $netTotal - $refundedTotal);
        if ($refundTotal > $remainingRefundable) {
            return ['status' => 'error', 'message' => 'Total refund melebihi batas pembayaran transaksi.'];
        }

        DB::transaction(function () use ($approval, $approver, $refundItems, $refundTotal, $sale) {
            $refund = Refund::query()->create([
                'sale_id' => $sale->id,
                'requested_by' => $approval->requested_by,
                'approved_by' => $approver->id,
                'total_amount' => $refundTotal,
                'reason' => $approval->reason,
                'occurred_at' => now(),
            ]);

            foreach ($refundItems as $item) {
                RefundItem::query()->create([
                    'refund_id' => $refund->id,
                    'sale_item_id' => $item['sale_item_id'],
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'unit_price' => $item['unit_price'],
                    'line_total' => $item['line_total'],
                ]);

                StockMovement::query()->create([
                    'product_id' => $item['product_id'],
                    'type' => 'RETURN_IN',
                    'qty_delta' => $item['qty'],
                    'ref_type' => 'refund',
                    'ref_id' => (string) $refund->id,
                    'note' => $approval->reason,
                    'created_by' => $approver->id,
                ]);

                $stockItem = StockItem::query()->firstOrNew(['product_id' => $item['product_id']]);
                $stockItem->on_hand = (float) ($stockItem->on_hand ?? 0) + (float) $item['qty'];
                $stockItem->save();
            }

            AuditLog::query()->create([
                'actor_id' => $approver->id,
                'event' => 'REFUND',
                'entity_type' => 'sale',
                'entity_id' => (string) $sale->id,
                'meta_json' => [
                    'refund_id' => $refund->id,
                    'total' => $refundTotal,
                    'requested_by' => $approval->requested_by,
                ],
                'occurred_at' => now(),
            ]);
        });

        return ['status' => 'ok', 'message' => 'ok'];
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
