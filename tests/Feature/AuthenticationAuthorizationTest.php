<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test guest dapat mengakses halaman publik.
     */
    public function test_guest_can_access_public_routes(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);

        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    /**
     * Test guest tidak dapat mengakses halaman POS kasir.
     */
    public function test_guest_cannot_access_pos_route(): void
    {
        $response = $this->get('/kasir');
        $response->assertRedirect('/login');
    }

    /**
     * Test guest tidak dapat mengakses halaman admin.
     */
    public function test_guest_cannot_access_admin_route(): void
    {
        $response = $this->get('/admin');
        $response->assertRedirect('/login');
    }

    /**
     * Test guest tidak dapat mengakses API POS.
     */
    public function test_guest_cannot_access_pos_api(): void
    {
        $response = $this->getJson('/api/pos/products');
        $response->assertStatus(401);
        $response->assertJson(['message' => 'Unauthenticated.']);
    }

    /**
     * Test guest tidak dapat mengakses API admin.
     */
    public function test_guest_cannot_access_admin_api(): void
    {
        $response = $this->getJson('/api/admin/dashboard');
        $response->assertStatus(401);
        $response->assertJson(['message' => 'Unauthenticated.']);
    }

    /**
     * Test cashier dapat mengakses route POS.
     */
    public function test_cashier_can_access_pos_route(): void
    {
        $cashier = User::factory()->create([
            'role' => 'CASHIER',
            'is_active' => true,
        ]);

        $response = $this->actingAs($cashier)->get('/kasir');
        $response->assertStatus(200);
    }

    /**
     * Test cashier dapat mengakses API POS.
     */
    public function test_cashier_can_access_pos_api(): void
    {
        $cashier = User::factory()->create([
            'role' => 'CASHIER',
            'is_active' => true,
        ]);

        $response = $this->actingAs($cashier)->getJson('/api/pos/products');
        $response->assertStatus(200);
    }

    /**
     * Test cashier tidak dapat mengakses halaman admin.
     */
    public function test_cashier_cannot_access_admin_route(): void
    {
        $cashier = User::factory()->create([
            'role' => 'CASHIER',
            'is_active' => true,
        ]);

        $response = $this->actingAs($cashier)->get('/admin');
        $response->assertStatus(403);
    }

    /**
     * Test cashier tidak dapat mengakses API admin.
     */
    public function test_cashier_cannot_access_admin_api(): void
    {
        $cashier = User::factory()->create([
            'role' => 'CASHIER',
            'is_active' => true,
        ]);

        $response = $this->actingAs($cashier)->getJson('/api/admin/dashboard');
        $response->assertStatus(403);
        $response->assertJson(['message' => 'Forbidden. Insufficient permissions.']);
    }

    /**
     * Test supervisor dapat mengakses halaman admin.
     */
    public function test_supervisor_can_access_admin_route(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $response = $this->actingAs($supervisor)->get('/admin');
        $response->assertStatus(200);
    }

    /**
     * Test supervisor dapat mengakses API admin.
     */
    public function test_supervisor_can_access_admin_api(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $response = $this->actingAs($supervisor)->getJson('/api/admin/profile');
        $response->assertStatus(200);
    }

    /**
     * Test supervisor dapat mengakses halaman POS.
     */
    public function test_supervisor_can_access_pos_route(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $response = $this->actingAs($supervisor)->get('/kasir');
        $response->assertStatus(200);
    }

    /**
     * Test supervisor dapat mengakses API POS.
     */
    public function test_supervisor_can_access_pos_api(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $response = $this->actingAs($supervisor)->getJson('/api/pos/products');
        $response->assertStatus(200);
    }

    /**
     * Test rate limiting pada login.
     */
    public function test_login_rate_limiting(): void
    {
        // Attempt login 6 times (rate limit is 5 per minute)
        for ($i = 0; $i < 6; $i++) {
            $response = $this->postJson('/login', [
                'username' => 'test',
                'password' => 'wrong',
            ]);

            if ($i < 5) {
                $response->assertStatus(422);
            } else {
                $response->assertStatus(429);
            }
        }
    }
}
