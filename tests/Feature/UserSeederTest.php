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
            'seeders.cahayarasa.cashier_email' => 'kasir@cahayarasa.test',
            'seeders.cahayarasa.cashier_password' => 'KasirTest#2026',
            'seeders.cahayarasa.cashier_pin' => '111111',
            'seeders.cahayarasa.supervisor_email' => 'supervisor@cahayarasa.test',
            'seeders.cahayarasa.supervisor_password' => 'SupervisorTest#2026',
            'seeders.cahayarasa.supervisor_pin' => '222222',
            'seeders.dimas.email' => 'dimassmadapas@gmail.com',
            'seeders.dimas.password' => 'Dimas312@dev',
            'seeders.dimas.pin' => '151508',
        ]);

        $this->seed(UserSeeder::class);
        $this->seed(UserSeeder::class);

        $this->assertSame(3, User::query()->count());
        $this->assertTrue(Hash::check('KasirTest#2026', User::query()->where('username', 'kasir-cahayarasa')->value('password_hash')));
        $this->assertTrue(Hash::check('SupervisorTest#2026', User::query()->where('username', 'supervisor-cahayarasa')->value('password_hash')));
        $this->assertTrue(Hash::check('Dimas312@dev', User::query()->where('username', 'dimas')->value('password_hash')));
        $this->assertDatabaseHas('users', ['username' => 'kasir-cahayarasa', 'email' => 'kasir@cahayarasa.test']);
        $this->assertDatabaseHas('users', ['username' => 'supervisor-cahayarasa', 'email' => 'supervisor@cahayarasa.test']);
        $this->assertDatabaseHas('users', ['username' => 'dimas', 'email' => 'dimassmadapas@gmail.com', 'name' => 'Dev Dimas', 'role' => 'SUPERVISOR']);
        $this->assertNotNull(User::fetchForPin('111111', 'CASHIER'));
        $this->assertNotNull(User::fetchForPin('222222', 'SUPERVISOR'));
        $this->assertNotNull(User::fetchForPin('151508', 'SUPERVISOR'));
    }

    public function test_it_rejects_missing_cahayarasa_credentials(): void
    {
        config()->set('seeders.cahayarasa.cashier_password', null);

        $this->expectException(LogicException::class);

        $this->seed(UserSeeder::class);
    }
}
