<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmOnlineOrderPaymentRequest;
use App\Http\Requests\OnlineOrderStatusRequest;
use App\Models\OnlineOrder;
use App\Services\OnlineOrderManagementService;
use App\Services\Settings\AppSettingsService;
use App\Services\WhatsAppLinkBuilder;
use Illuminate\Http\JsonResponse;

class OnlineOrderController extends Controller
{
    public function __construct(
        private readonly OnlineOrderManagementService $orders,
        private readonly AppSettingsService $settings,
        private readonly WhatsAppLinkBuilder $whatsAppLinks,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => OnlineOrder::query()->latest()->with('items')->paginate(30)]);
    }

    public function show(OnlineOrder $onlineOrder): JsonResponse
    {
        $onlineOrder->load('items');

        return response()->json([
            'data' => $onlineOrder,
            'payment' => $this->settings->getOnlineOrderSettings()['payment'],
            'shipping_whatsapp_url' => $this->whatsAppLinks->buildShippingUpdateLink($onlineOrder),
        ]);
    }

    public function confirmPayment(OnlineOrder $onlineOrder, ConfirmOnlineOrderPaymentRequest $request): JsonResponse
    {
        return response()->json([
            'data' => $this->orders->confirmPayment(
                $onlineOrder,
                $request->user(),
                $request->validated('payment_method'),
            ),
        ]);
    }

    public function updateStatus(OnlineOrderStatusRequest $request, OnlineOrder $onlineOrder): JsonResponse
    {
        if ($request->enum('status', \App\Enums\OnlineOrderStatus::class) === \App\Enums\OnlineOrderStatus::Cancelled) {
            abort_unless($request->user()?->role === 'SUPERVISOR', 403);
        }

        $order = $this->orders->updateStatus(
            $onlineOrder,
            $request->enum('status', \App\Enums\OnlineOrderStatus::class),
            $request->string('tracking_number')->toString() ?: null,
        );

        return response()->json(['data' => $order, 'shipping_whatsapp_url' => $this->whatsAppLinks->buildShippingUpdateLink($order)]);
    }
}
