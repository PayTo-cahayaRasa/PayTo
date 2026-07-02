<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginFlowTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function guest_can_access_landing_page(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('landingPage'));
    }

    /** @test */
    public function guest_can_access_login_page(): void
    {
        $response = $this->get('/login');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('login'));
    }

    /** @test */
    public function authenticated_user_cannot_access_login_page(): void
    {
        $user = User::factory()->create(['role' => 'CASHIER']);

        $response = $this->actingAs($user)->get('/login');

        $response->assertRedirect('/');
    }

    /** @test */
    public function cashier_can_login_and_redirected_to_kasir(): void
    {
        $user = User::factory()->create([
            'role' => 'CASHIER',
            'username' => 'kasir01',
            'password_hash' => bcrypt('password123'),
            'is_active' => true,
        ]);

        $response = $this->post('/login', [
            'login_method' => 'CREDENTIALS',
            'username' => 'kasir01',
            'password' => 'password123',
        ]);

        $response->assertJson(['redirect' => '/kasir']);
        $this->assertAuthenticatedAs($user);
    }

    /** @test */
    public function supervisor_can_login_and_redirected_to_admin(): void
    {
        $user = User::factory()->create([
            'role' => 'SUPERVISOR',
            'username' => 'admin01',
            'password_hash' => bcrypt('admin123'),
            'is_active' => true,
        ]);

        $response = $this->post('/login', [
            'login_method' => 'CREDENTIALS',
            'username' => 'admin01',
            'password' => 'admin123',
        ]);

        $response->assertJson(['redirect' => '/admin']);
        $this->assertAuthenticatedAs($user);
    }

    public function test_cashier_can_login_with_pin(): void
    {
        $user = User::factory()->create([
            'role' => 'CASHIER',
            'pin_hash' => bcrypt('123456'),
            'is_active' => true,
        ]);

        $response = $this->post('/login', [
            'login_method' => 'PIN',
            'pin' => '123456',
        ]);

        $response->assertJson(['redirect' => '/kasir']);
        $this->assertAuthenticatedAs($user);
    }

    public function test_pin_login_is_limited_to_five_attempts_per_five_minutes(): void
    {
        User::factory()->create([
            'role' => 'CASHIER',
            'pin_hash' => bcrypt('482951'),
            'is_active' => true,
        ]);

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->postJson('/login', [
                'login_method' => 'PIN',
                'pin' => '592847',
            ])->assertUnprocessable();
        }

        $response = $this->postJson('/login', [
            'login_method' => 'PIN',
            'pin' => '592847',
        ])->assertTooManyRequests();

        $this->assertGreaterThanOrEqual(299, (int) $response->headers->get('Retry-After'));
    }

    /** @test */
    public function invalid_credentials_returns_error(): void
    {
        User::factory()->create([
            'username' => 'kasir01',
            'password_hash' => bcrypt('password123'),
        ]);

        $response = $this->post('/login', [
            'login_method' => 'CREDENTIALS',
            'username' => 'kasir01',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422);
        $response->assertJson(['message' => 'Kredensial tidak valid.']);
        $this->assertGuest();
    }

    /** @test */
    public function inactive_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'username' => 'kasir01',
            'password_hash' => bcrypt('password123'),
            'is_active' => false,
        ]);

        $response = $this->post('/login', [
            'login_method' => 'CREDENTIALS',
            'username' => 'kasir01',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
        $this->assertGuest();
    }

    /** @test */
    public function cashier_can_access_kasir_page_after_login(): void
    {
        $user = User::factory()->create(['role' => 'CASHIER']);

        $response = $this->actingAs($user)->get('/kasir');

        $response->assertOk();
    }

    /** @test */
    public function supervisor_can_access_admin_page_after_login(): void
    {
        $user = User::factory()->create(['role' => 'SUPERVISOR']);

        $response = $this->actingAs($user)->get('/admin');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('admin'));
    }

    /** @test */
    public function cashier_cannot_access_admin_page(): void
    {
        $user = User::factory()->create(['role' => 'CASHIER']);

        $response = $this->actingAs($user)->get('/admin');

        $response->assertStatus(403);
    }

    /** @test */
    public function supervisor_can_access_kasir_page(): void
    {
        $user = User::factory()->create(['role' => 'SUPERVISOR']);

        $response = $this->actingAs($user)->get('/kasir');

        $response->assertOk();
    }

    /** @test */
    public function guest_cannot_access_kasir_page(): void
    {
        $response = $this->get('/kasir');

        $response->assertRedirect('/login');
    }

    /** @test */
    public function guest_cannot_access_admin_page(): void
    {
        $response = $this->get('/admin');

        $response->assertRedirect('/login');
    }

    public function test_user_can_login_again_after_logout_invalidates_the_session(): void
    {
        $user = User::factory()->create([
            'role' => 'CASHIER',
            'username' => 'kasir-session',
            'password_hash' => bcrypt('password123'),
            'is_active' => true,
        ]);

        $this->post('/login', [
            'login_method' => 'CREDENTIALS',
            'username' => 'kasir-session',
            'password' => 'password123',
        ])->assertOk();

        $this->assertAuthenticatedAs($user);

        $sessionIdBeforeLogout = session()->getId();
        $csrfTokenBeforeLogout = session()->token();

        $this->post('/logout')
            ->assertOk()
            ->assertJson(['status' => 'ok']);

        $this->assertGuest();
        $this->assertNotSame($sessionIdBeforeLogout, session()->getId());
        $this->assertNotSame($csrfTokenBeforeLogout, session()->token());

        $this->get('/login')->assertOk();

        $this->post('/login', [
            'login_method' => 'CREDENTIALS',
            'username' => 'kasir-session',
            'password' => 'password123',
        ])->assertOk();

        $this->assertAuthenticatedAs($user);
    }
}
