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

    public function test_it_seeds_required_accounts_idempotently(): void
    {
        config()->set($this->validSeederCredentials());

        $this->seed(UserSeeder::class);
        $this->seed(UserSeeder::class);

        $this->assertSame(3, User::query()->count());
        $this->assertTrue(Hash::check('KasirTest#2026', User::query()->where('username', 'kasir-cahayarasa')->value('password_hash')));
        $this->assertTrue(Hash::check('SupervisorTest#2026', User::query()->where('username', 'supervisor-cahayarasa')->value('password_hash')));
        $this->assertTrue(Hash::check('DimasTest#2026', User::query()->where('username', 'dimas')->value('password_hash')));
        $this->assertDatabaseHas('users', ['username' => 'kasir-cahayarasa', 'email' => 'kasir@cahayarasa.test']);
        $this->assertDatabaseHas('users', ['username' => 'supervisor-cahayarasa', 'email' => 'supervisor@cahayarasa.test']);
        $this->assertDatabaseHas('users', [
            'name' => 'Dev Dimas',
            'username' => 'dimas',
            'email' => 'dimas@example.test',
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);
        $this->assertNotNull(User::fetchForPin('111111', 'CASHIER'));
        $this->assertNotNull(User::fetchForPin('222222', 'SUPERVISOR'));
        $this->assertNotNull(User::fetchForPin('333333', 'SUPERVISOR'));
    }

    public function test_it_rejects_missing_cahayarasa_credentials(): void
    {
        $credentials = $this->validSeederCredentials();
        $credentials['seeders.cahayarasa.cashier_password'] = null;
        config()->set($credentials);

        $this->expectException(LogicException::class);
        $this->expectExceptionMessage('Kasir Cahaya Rasa');

        $this->seed(UserSeeder::class);
    }

    public function test_it_rejects_missing_dev_dimas_credentials(): void
    {
        $credentials = $this->validSeederCredentials();
        $credentials['seeders.dimas.password'] = null;
        config()->set($credentials);

        $this->expectException(LogicException::class);
        $this->expectExceptionMessage('Dev Dimas');

        $this->seed(UserSeeder::class);
    }

    /**
     * @return array<string, string>
     */
    private function validSeederCredentials(): array
    {
        return [
            'seeders.cahayarasa.cashier_email' => 'kasir@cahayarasa.test',
            'seeders.cahayarasa.cashier_password' => 'KasirTest#2026',
            'seeders.cahayarasa.cashier_pin' => '111111',
            'seeders.cahayarasa.supervisor_email' => 'supervisor@cahayarasa.test',
            'seeders.cahayarasa.supervisor_password' => 'SupervisorTest#2026',
            'seeders.cahayarasa.supervisor_pin' => '222222',
            'seeders.dimas.email' => 'dimas@example.test',
            'seeders.dimas.password' => 'DimasTest#2026',
            'seeders.dimas.pin' => '333333',
        ];
    }
}
