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
        // Load relationships
        $sale->load(['items.product', 'payment', 'cashier']);

        // Get receipt settings
        $receiptSettings = $this->settingsService->getReceiptSettings();
        $businessProfile = $this->settingsService->getBusinessProfile();

        return Inertia::render('receipt', [
            'sale' => [
                'id' => $sale->id,
                'local_txn_uuid' => $sale->local_txn_uuid,
                'total' => $sale->total,
                'discount_amount' => $sale->discount_amount,
                'final_total' => $sale->final_total,
                'created_at' => $sale->created_at->format('d/m/Y H:i:s'),
                'items' => $sale->items->map(fn ($item) => [
                    'product_name' => $item->product->name,
                    'qty' => $item->qty,
                    'price' => $item->price,
                    'discount_amount' => $item->discount_amount,
                    'final_price' => $item->final_price,
                    'subtotal' => $item->subtotal,
                ]),
                'payment' => [
                    'method' => $sale->payment->method,
                    'cash_received' => $sale->payment->cash_received,
                    'change_amount' => $sale->payment->change_amount,
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
