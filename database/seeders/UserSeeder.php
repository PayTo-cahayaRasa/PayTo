<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['name' => 'Test User', 'username' => 'testuser', 'password' => 'password', 'pin' => '123456', 'role' => 'CASHIER'],
            ['name' => 'Supervisor User', 'username' => 'supervisor', 'password' => 'password', 'pin' => '654321', 'role' => 'SUPERVISOR'],
        ] as $account) {
            $user = User::query()->firstOrNew(['username' => $account['username']]);

            $user->forceFill([
                'name' => $account['name'],
                'password_hash' => Hash::make($account['password']),
                'pin_hash' => Hash::make($account['pin']),
                'role' => $account['role'],
                'is_active' => true,
            ])->save();
        }
    }
}
