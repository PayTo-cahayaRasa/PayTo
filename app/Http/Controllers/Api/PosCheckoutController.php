<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PosCheckoutRequest;
use App\Services\Pos\CheckoutProcessor;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class PosCheckoutController extends Controller
{
    public function __construct(private CheckoutProcessor $checkoutProcessor) {}

    public function store(PosCheckoutRequest $request): JsonResponse
    {
        $user = $request->user();

        try {
            $result = $this->checkoutProcessor->process($request->validated(), $user);

            return response()->json([
                'sale_id' => $result['sale_id'],
                'invoice_no' => $result['invoice_no'],
                'payment' => [
                    'status' => 'CONFIRMED',
                ],
                'items' => $result['items'],
                'totals' => $result['totals'],
            ]);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], 422);
        }
    }
}
