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
            ['name' => 'Kasir Cahaya Rasa', 'username' => 'kasir-cahayarasa', 'email' => config('seeders.cahayarasa.cashier_email'), 'password' => config('seeders.cahayarasa.cashier_password'), 'pin' => config('seeders.cahayarasa.cashier_pin'), 'role' => 'CASHIER'],
            ['name' => 'Supervisor Cahaya Rasa', 'username' => 'supervisor-cahayarasa', 'email' => config('seeders.cahayarasa.supervisor_email'), 'password' => config('seeders.cahayarasa.supervisor_password'), 'pin' => config('seeders.cahayarasa.supervisor_pin'), 'role' => 'SUPERVISOR'],
            ['name' => 'Dev Dimas', 'username' => 'dimas', 'email' => config('seeders.dimas.email'), 'password' => config('seeders.dimas.password'), 'pin' => config('seeders.dimas.pin'), 'role' => 'SUPERVISOR'],
        ];

        foreach ($accounts as $account) {
            if (! is_string($account['email']) || ! filter_var($account['email'], FILTER_VALIDATE_EMAIL) || ! is_string($account['password']) || $account['password'] === '' || ! is_string($account['pin']) || $account['pin'] === '') {
                throw new LogicException('Set all Cahaya Rasa seeder credentials before running the seeder.');
            }
        }

        foreach ($accounts as $account) {
            $user = User::query()->firstOrNew(['username' => $account['username']]);

            $user->forceFill([
                'name' => $account['name'],
                'email' => $account['email'],
                'password_hash' => Hash::make($account['password']),
                'pin_hash' => Hash::make($account['pin']),
                'role' => $account['role'],
                'is_active' => true,
            ])->save();
        }
    }
}
