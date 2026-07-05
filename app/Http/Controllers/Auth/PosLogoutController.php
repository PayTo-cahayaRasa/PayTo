<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PosLogoutController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            $today = now()->toDateString();
            $workDate = $user->work_date?->toDateString();
            $workSeconds = $workDate === $today ? (int) $user->work_seconds : 0;

            if ($user->last_login_at && $user->last_login_at->toDateString() === $today) {
                $hasOpenSession = ! $user->last_logout_at || $user->last_logout_at->lessThan($user->last_login_at);

                if ($hasOpenSession) {
                    $sessionSeconds = $user->last_login_at->diffInSeconds(now());
                    $workSeconds += $sessionSeconds;
                }
            }

            $user->forceFill([
                'last_logout_at' => now(),
                'work_date' => $today,
                'work_seconds' => $workSeconds,
            ])->save();
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'status' => 'ok',
        ]);
    }
}
