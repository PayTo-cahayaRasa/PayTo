<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use LogicException;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            ['name' => 'Kasir Cahaya Rasa', 'username' => 'kasir-cahayarasa', 'password' => config('seeders.cahayarasa.cashier_password'), 'pin' => config('seeders.cahayarasa.cashier_pin'), 'role' => 'CASHIER'],
            ['name' => 'Supervisor Cahaya Rasa', 'username' => 'supervisor-cahayarasa', 'password' => config('seeders.cahayarasa.supervisor_password'), 'pin' => config('seeders.cahayarasa.supervisor_pin'), 'role' => 'SUPERVISOR'],
        ];

        foreach ($accounts as $account) {
            if (! is_string($account['password']) || $account['password'] === '' || ! is_string($account['pin']) || $account['pin'] === '') {
                throw new LogicException('Set all Cahaya Rasa seeder credentials before running the seeder.');
            }
        }

        foreach ($accounts as $account) {
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
