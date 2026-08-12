<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use LogicException;
use Tests\TestCase;

class UserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_reusable_cahayarasa_production_accounts(): void
    {
        config()->set([
            'seeders.cahayarasa.cashier_password' => 'KasirTest#2026',
            'seeders.cahayarasa.cashier_pin' => '111111',
            'seeders.cahayarasa.supervisor_password' => 'SupervisorTest#2026',
            'seeders.cahayarasa.supervisor_pin' => '222222',
        ]);

        $this->seed(UserSeeder::class);
        $this->seed(UserSeeder::class);

        $this->assertSame(2, User::query()->count());
        $this->assertTrue(Hash::check('KasirTest#2026', User::query()->where('username', 'kasir-cahayarasa')->value('password_hash')));
        $this->assertTrue(Hash::check('SupervisorTest#2026', User::query()->where('username', 'supervisor-cahayarasa')->value('password_hash')));
        $this->assertNotNull(User::fetchForPin('111111', 'CASHIER'));
        $this->assertNotNull(User::fetchForPin('222222', 'SUPERVISOR'));
    }

    public function test_it_rejects_missing_cahayarasa_credentials(): void
    {
        config()->set('seeders.cahayarasa.cashier_password', null);

        $this->expectException(LogicException::class);

        $this->seed(UserSeeder::class);
    }
}
