<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Services\Settings\AppSettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReceiptController extends Controller
{
    public function __construct(
        private readonly AppSettingsService $settingsService
    ) {}

    /**
     * Show receipt for a sale
     */
    public function show(Request $request, Sale $sale): Response
    {
        // IDOR protection: only allow cashier who owns the sale or supervisor
        $user = $request->user();
        if ($user->role === 'CASHIER' && $sale->cashier_id !== $user->id) {
            abort(403, 'Unauthorized access to receipt.');
        }

        // Load relationships
        $sale->load(['items.product', 'payment', 'cashier']);

        // Get receipt settings
        $receiptSettings = $this->settingsService->getReceiptSettings();
        $businessProfile = $this->settingsService->getBusinessProfile();

        return Inertia::render('receipt', [
            'sale' => [
                'id' => $sale->id,
                'local_txn_uuid' => $sale->local_txn_uuid,
                'subtotal' => $sale->subtotal,
                'discount_amount' => $sale->discount_total,
                'tax_total' => $sale->tax_total,
                'total' => $sale->grand_total,
                'created_at' => $sale->created_at->format('d/m/Y H:i:s'),
                'items' => $sale->items->map(fn ($item) => [
                    'product_name' => $item->product?->name ?? $item->product_name_snapshot,
                    'qty' => $item->qty,
                    'price' => $item->unit_price,
                    'discount_amount' => $item->discount_amount,
                    'line_total' => $item->line_total,
                ]),
                'payment' => [
                    'method' => $sale->payment->method,
                    'amount' => $sale->payment->amount,
                    'cash_received' => $sale->paid_total,
                    'change_amount' => $sale->change_total,
                ],
                'cashier' => [
                    'name' => $sale->cashier->name,
                ],
            ],
            'receipt_settings' => [
                'header' => $receiptSettings['header'],
                'footer' => $receiptSettings['footer'],
            ],
            'business' => [
                'name' => $businessProfile['name'],
                'address' => $businessProfile['address'],
            ],
        ]);
    }
}
