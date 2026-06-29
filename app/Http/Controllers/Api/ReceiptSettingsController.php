<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReceiptSettingsRequest;
use App\Models\AppSetting;
use Illuminate\Http\JsonResponse;

class ReceiptSettingsController extends Controller
{
    private const SETTING_KEY = 'receipt.settings';

    private const DEFAULT_HEADER = "NAMA TOKO\nAlamat Toko";

    private const DEFAULT_FOOTER = "Terima kasih atas kunjungan Anda\nFollow IG: @tokokopi";

    public function index(): JsonResponse
    {
        $setting = AppSetting::query()->where('key', self::SETTING_KEY)->first();
        $value = is_array($setting?->value) ? $setting->value : [];

        return response()->json([
            'data' => [
                'header' => $value['header'] ?? self::DEFAULT_HEADER,
                'footer' => $value['footer'] ?? self::DEFAULT_FOOTER,
            ],
        ]);
    }

    public function update(ReceiptSettingsRequest $request): JsonResponse
    {
        $payload = $request->validated();

        AppSetting::query()->updateOrCreate(
            ['key' => self::SETTING_KEY],
            ['value' => ['header' => $payload['header'], 'footer' => $payload['footer']]]
        );

        return response()->json([
            'data' => [
                'header' => $payload['header'],
                'footer' => $payload['footer'],
            ],
        ]);
    }
}
