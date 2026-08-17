<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\PasswordResetNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification as NotificationFacade;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetAndProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_request_a_password_reset_link(): void
    {
        $user = User::factory()->create(['email' => 'cashier@gmail.com', 'is_active' => true, 'role' => 'CASHIER']);
        NotificationFacade::fake();

        $this->post('/lupa-password', ['email' => $user->email])
            ->assertRedirect()
            ->assertSessionHas('status', 'Jika email terdaftar, tautan reset telah dikirim.');

        NotificationFacade::assertSentTo($user, PasswordResetNotification::class);
    }

    public function test_unknown_email_has_generic_response_without_notification(): void
    {
        NotificationFacade::fake();

        $this->post('/lupa-password', ['email' => 'unknown@gmail.com'])
            ->assertRedirect()
            ->assertSessionHas('status', 'Jika email terdaftar, tautan reset telah dikirim.');

        NotificationFacade::assertNothingSent();
    }

    public function test_valid_reset_changes_password_and_consumes_token(): void
    {
        $user = User::factory()->create([
            'email' => 'cashier2@gmail.com',
            'role' => 'CASHIER',
            'password_hash' => Hash::make('OldPass1!'),
        ]);
        NotificationFacade::fake();

        $token = Password::broker()->createToken($user);

        $this->post('/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'NewPass1!',
            'password_confirmation' => 'NewPass1!',
        ])->assertRedirect('/login');

        $this->assertTrue(Hash::check('NewPass1!', $user->refresh()->password_hash));
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);
    }

    public function test_user_can_update_only_own_email(): void
    {
        $user = User::factory()->create(['email' => 'old@gmail.com', 'role' => 'CASHIER', 'is_active' => true]);
        $other = User::factory()->create(['email' => 'other@gmail.com', 'role' => 'CASHIER', 'is_active' => true]);

        $this->actingAs($user)->putJson('/api/pos/profile/email', ['email' => 'new@gmail.com'])
            ->assertOk()
            ->assertJsonPath('data.email', 'new@gmail.com');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => 'new@gmail.com']);
        $this->actingAs($user)->putJson('/api/pos/profile/email', ['email' => $other->email])->assertUnprocessable();
    }

    public function test_weak_reset_password_is_rejected(): void
    {
        $user = User::factory()->create(['email' => 'cashier3@gmail.com', 'role' => 'CASHIER']);
        $token = Password::broker()->createToken($user);

        $this->post('/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'weakpass',
            'password_confirmation' => 'weakpass',
        ])->assertSessionHasErrors([
            'password' => 'Kata sandi harus memiliki minimal satu huruf besar dan satu huruf kecil.',
        ]);
    }

    public function test_user_can_reset_pin_without_changing_password(): void
    {
        $user = User::factory()->create([
            'email' => 'pin-user@gmail.com',
            'role' => 'CASHIER',
            'is_active' => true,
            'password_hash' => Hash::make('Password1!'),
            'pin_hash' => Hash::make('123456'),
        ]);
        $passwordHash = $user->password_hash;
        $token = Password::broker('pins')->createToken($user);

        $this->post('/reset-pin', [
            'token' => $token,
            'email' => $user->email,
            'pin' => '654321',
            'pin_confirmation' => '654321',
        ])->assertRedirect('/login');

        $user->refresh();
        $this->assertTrue(Hash::check('654321', $user->pin_hash));
        $this->assertSame($passwordHash, $user->password_hash);
        $this->assertDatabaseMissing('pin_reset_tokens', ['email' => $user->email]);
    }
}
