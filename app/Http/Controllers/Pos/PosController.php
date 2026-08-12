<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Services\Settings\AppSettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PosController extends Controller
{
    public function __construct(
        private readonly ProductQueryController $productQuery,
        private readonly HistoryQueryController $historyQuery,
        private readonly ProfileQueryController $profileQuery,
        private readonly AppSettingsService $settingsService
    ) {}

    public function index(Request $request)
    {
        $products = $this->productQuery->fetch();
        $userId = $request->user()->id;
        $history = $this->historyQuery->fetch(10, [
            'userId' => $userId,
        ]);
        $profile = $this->profileQuery->fetch();

        return Inertia::render('kasir', [
            'products' => $products,
            'history' => $history,
            'profile' => $profile,
            'payment' => $this->settingsService->getOnlineOrderSettings()['payment'],
        ]);
    }
}
