<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorefrontCheckoutRequest;
use App\Models\OnlineOrder;
use App\Models\Product;
use App\Services\OnlineOrderCheckoutService;
use App\Services\RajaOngkirService;
use App\Services\Settings\AppSettingsService;
use App\Services\WhatsAppLinkBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontCheckoutController extends Controller
{
    public function __construct(
        private readonly AppSettingsService $settings,
        private readonly OnlineOrderCheckoutService $checkout,
        private readonly RajaOngkirService $rajaOngkir,
        private readonly WhatsAppLinkBuilder $whatsAppLinks,
    ) {}

    public function index(): Response
    {
        return Inertia::render('storefront/CheckoutPage', [
            'business' => $this->settings->getBusinessProfile(),
            'couriers' => array_values(config('services.rajaongkir.couriers')),
            'products' => Product::query()->with('stockItem')->where('is_active', true)->where('is_public', true)->get()
                ->map(fn (Product $product): array => [
                    'id' => $product->id, 'name' => $product->name, 'price' => (float) $product->price,
                    'finalPrice' => max(0, (float) $product->price * (1 - (float) $product->discount / 100)),
                    'stock' => (float) ($product->stockItem?->on_hand ?? 0), 'sku' => $product->sku,
                    'description' => $product->description ?? '',
                ]),
        ]);
    }

    public function destinations(Request $request): JsonResponse
    {
        $validated = $request->validate(['q' => ['required', 'string', 'min:3', 'max:100']]);

        return response()->json(['data' => $this->rajaOngkir->searchDestinations($validated['q'])]);
    }

    public function quote(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'destination_id' => ['required', 'string', 'max:100'],
            'courier' => ['required', 'string', 'in:'.implode(',', config('services.rajaongkir.couriers'))],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required', 'integer', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $weight = $this->checkout->shippingWeight($validated['items']);

        return response()->json(['data' => $this->rajaOngkir->quote($validated['destination_id'], $weight, $validated['courier'])]);
    }

    public function store(StorefrontCheckoutRequest $request): JsonResponse
    {
        $isReplay = OnlineOrder::query()->where('idempotency_key', $request->validated('idempotency_key'))->exists();
        $order = $this->checkout->create($request->validated());

        return response()->json([
            'order_number' => $order->order_number,
            'success_url' => route('checkout.success', ['orderNumber' => $order->order_number, 'token' => $order->tracking_token]),
            'tracking_url' => route('orders.track', ['orderNumber' => $order->order_number, 'token' => $order->tracking_token]),
        ], $isReplay ? 200 : 201);
    }

    public function success(string $orderNumber, Request $request): Response
    {
        $order = $this->publicOrder($orderNumber, $request);

        return Inertia::render('storefront/CheckoutSuccessPage', [
            'business' => $this->settings->getBusinessProfile(),
            'order' => $order->only(['order_number', 'grand_total', 'payment_method']),
            'payment' => config('services.storefront_payment'),
            'payment_whatsapp_url' => $this->whatsAppLinks->buildPaymentConfirmationLink($order),
            'tracking_url' => route('orders.track', ['orderNumber' => $order->order_number, 'token' => $order->tracking_token]),
        ]);
    }

    public function track(string $orderNumber, Request $request): Response
    {
        $order = $this->publicOrder($orderNumber, $request, true);

        return Inertia::render('storefront/OrderTrackingPage', [
            'business' => $this->settings->getBusinessProfile(),
            'order' => $order->only([
                'order_number', 'customer_name', 'fulfillment_method', 'shipping_courier_name',
                'shipping_service', 'shipping_etd', 'shipping_cost', 'subtotal', 'discount_total',
                'grand_total', 'payment_method', 'status', 'tracking_number', 'created_at', 'updated_at',
            ]) + ['items' => $order->items->map->only(['product_name_snapshot', 'unit_price', 'quantity', 'discount_amount', 'line_total'])],
        ]);
    }

    public function trackingLookup(): Response
    {
        return Inertia::render('storefront/OrderTrackingLookupPage', [
            'business' => $this->settings->getBusinessProfile(),
        ]);
    }

    public function findTracking(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'order_reference' => ['nullable', 'string', 'max:100', 'required_without:tracking_number'],
            'tracking_number' => ['nullable', 'string', 'max:100', 'required_without:order_reference'],
        ]);

        $orderReference = trim((string) ($validated['order_reference'] ?? $validated['tracking_number']));

        $order = OnlineOrder::query()
            ->whereRaw('LOWER(customer_name) = ?', [mb_strtolower(trim($validated['customer_name']))])
            ->where(function ($query) use ($orderReference): void {
                $query
                    ->where('order_number', $orderReference)
                    ->orWhere('tracking_number', $orderReference);
            })
            ->first();

        if (! $order) {
            $errorField = array_key_exists('order_reference', $validated) ? 'order_reference' : 'tracking_number';

            return back()->withErrors([$errorField => 'Pesanan tidak ditemukan. Periksa kembali nama pemesan dan nomor pesanan atau resi.'])->withInput();
        }

        return redirect()->route('orders.track', ['orderNumber' => $order->order_number, 'token' => $order->tracking_token]);
    }

    private function publicOrder(string $orderNumber, Request $request, bool $withItems = false): OnlineOrder
    {
        $order = OnlineOrder::query()
            ->when($withItems, fn ($query) => $query->with('items'))
            ->where('order_number', $orderNumber)
            ->firstOrFail();
        abort_unless(hash_equals($order->tracking_token, (string) $request->query('token')), 404);

        return $order;
    }
}
