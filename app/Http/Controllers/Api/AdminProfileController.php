<?php

/**
 * Provides profile data for the admin profile tab.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class AdminProfileController extends Controller
{
    public function show(): JsonResponse
    {
        $user = request()->user();

        return response()->json([
            'data' => [
                'name' => $user->name ?? 'Admin',
                'role' => $user->role ?? 'UNKNOWN',
                'id' => sprintf('SPV-%03d', $user->id),
                'email' => $user->email ?? '—',
                'phone' => '—',
                'joinDate' => $user->created_at?->locale('id')->translatedFormat('d F Y') ?? '—',
                'lastLogin' => $user->last_login_at?->locale('id')->diffForHumans() ?? '—',
            ],
        ]);
    }
}
