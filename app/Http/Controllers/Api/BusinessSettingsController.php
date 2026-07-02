<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BusinessSettingsRequest;
use App\Services\Settings\AppSettingsService;
use Illuminate\Http\JsonResponse;

class BusinessSettingsController extends Controller
{
    public function __construct(
        private readonly AppSettingsService $settingsService
    ) {}

    /**
     * Get business settings (business profile + catalog settings)
     */
    public function index(): JsonResponse
    {
        $settings = $this->settingsService->getAllBusinessSettings();

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Update business settings (business profile + catalog settings)
     */
    public function update(BusinessSettingsRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $this->settingsService->updateBusinessSettings(
            businessProfile: $validated['business'],
            catalogSettings: $validated['catalog']
        );

        return response()->json([
            'message' => 'Pengaturan toko berhasil disimpan.',
            'data' => $this->settingsService->getAllBusinessSettings(),
        ]);
    }
}
