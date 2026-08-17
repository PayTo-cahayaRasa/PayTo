<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use LogicException;

class DimasSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('seeders.dimas.email');
        $password = config('seeders.dimas.password');
        $pin = config('seeders.dimas.pin');

        if (! is_string($email) || ! filter_var($email, FILTER_VALIDATE_EMAIL) || ! is_string($password) || $password === '' || ! is_string($pin) || $pin === '') {
            throw new LogicException('Set all Dev Dimas seeder credentials before running the seeder.');
        }

        User::query()->firstOrNew(['username' => 'dimas'])
            ->forceFill([
                'name' => 'Dev Dimas',
                'email' => $email,
                'password_hash' => Hash::make($password),
                'pin_hash' => Hash::make($pin),
                'role' => 'SUPERVISOR',
                'is_active' => true,
            ])
            ->save();
    }
}
