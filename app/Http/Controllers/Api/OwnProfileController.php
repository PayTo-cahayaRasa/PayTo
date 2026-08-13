<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOwnEmailRequest;
use Illuminate\Http\JsonResponse;

class OwnProfileController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(['data' => ['email' => request()->user()->email]]);
    }

    public function update(UpdateOwnEmailRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->forceFill(['email' => strtolower($request->validated('email'))])->save();

        return response()->json(['message' => 'Email berhasil diperbarui.', 'data' => ['email' => $user->email]]);
    }
}
