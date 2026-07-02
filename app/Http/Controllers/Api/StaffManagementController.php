<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StaffDestroyRequest;
use App\Http\Requests\StaffResetPinRequest;
use App\Http\Requests\StaffStoreRequest;
use App\Http\Requests\StaffUpdateRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class StaffManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $staff = User::query()
            ->whereIn('role', ['CASHIER', 'SUPERVISOR'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $staff->map(fn (User $user) => $this->formatStaff($user)),
        ]);
    }

    public function store(StaffStoreRequest $request): JsonResponse
    {
        $payload = $request->validated();

        $user = new User;
        $user->name = $payload['name'];
        $user->username = $payload['username'];
        $user->role = $payload['role'];
        $user->is_active = $payload['is_active'] ?? true;

        if (! empty($payload['password'])) {
            $user->password_hash = Hash::make($payload['password']);
        }

        if (! empty($payload['pin'])) {
            $user->pin_hash = Hash::make($payload['pin']);
        }

        $user->save();

        return response()->json([
            'data' => $this->formatStaff($user),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'data' => $this->formatStaff($user),
        ]);
    }

    public function update(StaffUpdateRequest $request, User $user): JsonResponse
    {
        $payload = $request->validated();

        if (array_key_exists('name', $payload)) {
            $user->name = $payload['name'];
        }

        if (array_key_exists('username', $payload)) {
            $user->username = $payload['username'];
        }

        if (array_key_exists('role', $payload)) {
            $user->role = $payload['role'];
        }

        if (array_key_exists('is_active', $payload)) {
            $user->is_active = (bool) $payload['is_active'];
        }

        if (! empty($payload['password'])) {
            $user->password_hash = Hash::make($payload['password']);
        }

        if (! empty($payload['pin'])) {
            $user->pin_hash = Hash::make($payload['pin']);
        }

        $user->save();

        return response()->json([
            'data' => $this->formatStaff($user),
        ]);
    }

    public function resetPin(StaffResetPinRequest $request, User $user): JsonResponse
    {
        $payload = $request->validated();

        $user->pin_hash = Hash::make($payload['pin']);
        $user->save();

        return response()->json([
            'data' => $this->formatStaff($user),
        ]);
    }

    public function destroy(StaffDestroyRequest $request, User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'Staf berhasil dihapus.',
        ]);
    }

    private function formatStaff(User $user): array
    {
        $lastLogin = $user->last_login_at
            ? $user->last_login_at->locale('id')->diffForHumans()
            : 'Belum pernah login';

        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'role' => $user->role,
            'status' => $user->is_active ? 'ACTIVE' : 'INACTIVE',
            'is_active' => (bool) $user->is_active,
            'lastLogin' => $lastLogin,
        ];
    }
}
