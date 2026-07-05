<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PosPrinterSettingsRequest;
use App\Models\AppSetting;
use Illuminate\Http\JsonResponse;

class PosSettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $printerSetting = AppSetting::query()->where('key', 'printer.default')->first();
        $printerValue = $printerSetting?->value;
        $printerName = is_array($printerValue) ? ($printerValue['name'] ?? null) : $printerValue;

        return response()->json([
            'data' => [
                'printer' => [
                    'name' => $printerName,
                    'status' => $printerName ? 'connected' : 'not_connected',
                ],
            ],
        ]);
    }

    public function updatePrinter(PosPrinterSettingsRequest $request): JsonResponse
    {
        $payload = $request->validated();

        AppSetting::query()->updateOrCreate(
            ['key' => 'printer.default'],
            [
                'value' => ['name' => $payload['name']],
                'type' => 'json',
            ]
        );

        return response()->json([
            'data' => [
                'name' => $payload['name'],
                'status' => 'connected',
            ],
        ]);
    }

    public function testPrinter(): JsonResponse
    {
        $printerSetting = AppSetting::query()->where('key', 'printer.default')->first();
        $printerValue = $printerSetting?->value;
        $printerName = is_array($printerValue) ? ($printerValue['name'] ?? null) : $printerValue;

        if (! $printerName) {
            return response()->json([
                'message' => 'Printer belum terhubung.',
            ], 422);
        }

        return response()->json([
            'message' => 'Test print berhasil dikirim.',
        ]);
    }
}
