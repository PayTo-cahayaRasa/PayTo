<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $rows = Product::query()
            ->leftJoin('stock_items', 'products.id', '=', 'stock_items.product_id')
            ->select('products.id', 'products.name', 'products.sku', 'products.price', 'products.discount', 'products.uom', DB::raw('COALESCE(stock_items.on_hand, 0) as stock'))
            ->where('products.is_active', true)
            ->orderBy('products.name')
            ->get()
            ->map(function ($r) {
                $discountPercent = (float) ($r->discount ?? 0);
                $discountPercent = max(0, min($discountPercent, 100));
                $discountedPrice = (float) $r->price - ((float) $r->price * $discountPercent / 100);

                return [
                    'id' => $r->id,
                    'name' => $r->name,
                    'sku' => $r->sku,
                    'price' => (float) $r->price,
                    'discount' => $discountPercent,
                    'price_after_discount' => $discountedPrice,
                    'stock' => (int) $r->stock,
                    // Derive a simple category: cup => Minuman, else Makanan
                    'category' => $r->uom === 'cup' ? 'Minuman' : 'Makanan',
                    'isFavorite' => false,
                    'imageColor' => null,
                ];
            });

        // Recent transactions for history panel
        $sales = Sale::with(['items', 'payments'])
            ->orderByDesc('occurred_at')
            ->limit(10)
            ->get()
            ->map(function (Sale $sale) {
                $payment = $sale->payments->first();
                $itemsDetail = $sale->items->map(fn ($it) => [
                    'id' => (string) $it->id,
                    'name' => $it->product_name_snapshot,
                    'qty' => (int) $it->qty,
                    'price' => (float) $it->unit_price,
                ])->all();

                $time = $sale->occurred_at ? Carbon::parse($sale->occurred_at)->format('H:i') : '';

                return [
                    'id' => $sale->local_txn_uuid,
                    'invoiceNo' => $sale->server_invoice_no ? $sale->server_invoice_no : '#'.$sale->id,
                    'time' => $time,
                    'items' => $sale->items->count(),
                    'total' => (float) $sale->grand_total,
                    'paymentMethod' => $payment?->method ?? 'CASH',
                    'status' => $sale->status,
                    'itemsDetail' => $itemsDetail,
                ];
            });

        // Profile / shift summary
        $user = $request->user();

        $today = Carbon::now()->startOfDay();
        $salesQuery = Sale::query()
            ->where('cashier_id', $user?->id ?? null)
            ->whereDate('occurred_at', $today);

        $transactionsToday = $salesQuery->count();
        $totalToday = (float) $salesQuery->sum('grand_total');
        $shiftStartRaw = $salesQuery->min('occurred_at');
        $shiftStart = $shiftStartRaw ? Carbon::parse($shiftStartRaw) : null;

        $durationText = '—';
        if ($shiftStart) {
            $diff = $shiftStart->diff(Carbon::now());
            $hours = $diff->h + ($diff->days * 24);
            $minutes = $diff->i;
            $durationText = sprintf('%dh %02dm', $hours, $minutes);
        }

        $target = 1000000; // default target
        $progress = $target > 0 ? round(($totalToday / $target) * 100) : 0;

        $profile = [
            'id' => $user?->id,
            'displayName' => $user?->name ?? 'Kasir',
            'employeeId' => $user ? sprintf('KSR-%03d', $user->id) : null,
            'role' => $user?->role ?? 'CASHIER',
            'isActive' => (bool) ($user?->is_active ?? false),
            'totalToday' => $totalToday,
            'transactionsToday' => $transactionsToday,
            'shiftStart' => $shiftStart?->format('H:i'),
            'shiftDuration' => $durationText,
            'target' => $target,
            'progressPercent' => $progress,
        ];

        return Inertia::render('kasir', [
            'products' => $rows,
            'history' => $sales,
            'profile' => $profile,
        ]);
    }
}
