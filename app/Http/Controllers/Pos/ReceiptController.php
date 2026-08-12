<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Services\Settings\AppSettingsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response as HttpResponse;
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
    public function show(Sale $sale): Response
    {
        return Inertia::render('receipt', $this->receiptData($sale));
    }

    public function download(Sale $sale): HttpResponse
    {
        return Pdf::loadView('receipt.pdf', $this->receiptData($sale))
            ->setPaper([0, 0, 226.77, 841.89])
            ->download("struk-{$sale->id}.pdf");
    }

    /**
     * @return array<string, mixed>
     */
    private function receiptData(Sale $sale): array
    {
        $sale->load(['items.product', 'payment', 'cashier']);
        $receiptSettings = $this->settingsService->getReceiptSettings();
        $businessProfile = $this->settingsService->getBusinessProfile();

        return [
            'sale' => [
                'id' => $sale->id,
                'invoice_no' => $sale->server_invoice_no,
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
                    'name' => $sale->cashier?->name ?? '-',
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
        ];
    }
}
