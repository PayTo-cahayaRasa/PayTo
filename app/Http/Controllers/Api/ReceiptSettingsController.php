<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReceiptSettingsRequest;
use App\Services\Settings\AppSettingsService;
use Illuminate\Http\JsonResponse;

class ReceiptSettingsController extends Controller
{
    public function __construct(
        private readonly AppSettingsService $settingsService
    ) {}

    public function index(): JsonResponse
    {
        $settings = $this->settingsService->getReceiptSettings();

        return response()->json([
            'data' => [
                'header' => $settings['header'],
                'footer' => $settings['footer'],
            ],
        ]);
    }

    public function update(ReceiptSettingsRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $this->settingsService->updateReceiptSettings($validated);

        return response()->json([
            'data' => [
                'header' => $validated['header'],
                'footer' => $validated['footer'],
            ],
        ]);
    }
}
