<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_reusable_cashier_and_supervisor_accounts(): void
    {
        $this->seed(UserSeeder::class);
        $this->seed(UserSeeder::class);

        $this->assertSame(2, User::query()->count());
        $this->assertTrue(Hash::check('password', User::query()->where('username', 'testuser')->value('password_hash')));
        $this->assertTrue(Hash::check('password', User::query()->where('username', 'supervisor')->value('password_hash')));
        $this->assertNotNull(User::fetchForPin('123456', 'CASHIER'));
        $this->assertNotNull(User::fetchForPin('654321', 'SUPERVISOR'));
    }
}
