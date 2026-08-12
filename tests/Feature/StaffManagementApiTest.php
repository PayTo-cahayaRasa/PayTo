<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class StaffManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_crud_and_reset_pin_flow(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
            'password_hash' => Hash::make('Supervisor1!'),
        ]);

        $payload = [
            'name' => 'Staf Baru',
            'username' => 'staf.baru',
            'role' => 'CASHIER',
            'is_active' => true,
            'password' => 'CashierPass1!',
            'pin' => '482951',
        ];

        $createResponse = $this->actingAs($supervisor)->postJson('/api/admin/staff', $payload)
            ->assertCreated()
            ->assertJsonPath('data.username', 'staf.baru');

        $staffId = $createResponse->json('data.id');

        $this->actingAs($supervisor)->getJson('/api/admin/staff')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $staffId,
                'username' => 'staf.baru',
            ]);

        $this->actingAs($supervisor)->getJson("/api/admin/staff/{$staffId}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Staf Baru');

        $this->actingAs($supervisor)->putJson("/api/admin/staff/{$staffId}", [
            'name' => 'Staf Update',
            'is_active' => false,
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Staf Update')
            ->assertJsonPath('data.status', 'INACTIVE');

        $this->actingAs($supervisor)->putJson("/api/admin/staff/{$staffId}", [
            'password' => 'UpdatedPass1!',
            'current_credential' => 'Supervisor1!',
        ])->assertOk();

        $this->actingAs($supervisor)->postJson("/api/admin/staff/{$staffId}/reset-pin", [
            'pin' => '592847',
            'current_credential' => 'Supervisor1!',
        ])
            ->assertOk();

        $user = User::query()->find($staffId);

        $this->assertNotNull($user);
        $this->assertTrue(Hash::check('UpdatedPass1!', $user->password_hash));
        $this->assertTrue(Hash::check('592847', $user->pin_hash));

        $this->actingAs($supervisor)->deleteJson("/api/admin/staff/{$staffId}", [
            'current_credential' => 'Supervisor1!',
        ])
            ->assertOk();

        $this->assertDatabaseMissing('users', [
            'id' => $staffId,
        ]);
    }

    public function test_staff_validation_rejects_duplicate_username_and_invalid_pin(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $user = new User;
        $user->name = 'Existing';
        $user->username = 'dupe.user';
        $user->password_hash = bcrypt('secret');
        $user->role = 'CASHIER';
        $user->is_active = true;
        $user->save();

        $this->actingAs($supervisor)->postJson('/api/admin/staff', [
            'name' => 'Dup',
            'username' => 'dupe.user',
            'role' => 'CASHIER',
            'password' => 'CashierPass1!',
            'pin' => '482951',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['username']);

        $this->actingAs($supervisor)->postJson("/api/admin/staff/{$user->id}/reset-pin", [
            'pin' => '12',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['pin']);
    }

    public function test_staff_credentials_must_follow_password_and_pin_policy(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
        ]);

        $this->actingAs($supervisor)->postJson('/api/admin/staff', [
            'name' => 'Weak Staff',
            'username' => 'weak.staff',
            'role' => 'CASHIER',
            'password' => 'password123',
            'pin' => '123456',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password', 'pin']);
    }

    public function test_sensitive_staff_actions_require_the_supervisors_current_credential(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
            'password_hash' => Hash::make('Supervisor1!'),
        ]);
        $staff = User::factory()->create([
            'role' => 'CASHIER',
            'is_active' => true,
            'password_hash' => Hash::make('OriginalPass1!'),
            'pin_hash' => Hash::make('482951'),
        ]);

        $this->actingAs($supervisor)->putJson("/api/admin/staff/{$staff->id}", [
            'password' => 'ChangedPass1!',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['current_credential']);

        $this->actingAs($supervisor)->postJson("/api/admin/staff/{$staff->id}/reset-pin", [
            'pin' => '592847',
            'current_credential' => 'wrong-credential',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['current_credential']);

        $this->actingAs($supervisor)->postJson("/api/admin/staff/{$staff->id}/reset-pin", [
            'pin' => '592847',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['current_credential']);

        $this->actingAs($supervisor)->deleteJson("/api/admin/staff/{$staff->id}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['current_credential']);

        $staff->refresh();

        $this->assertTrue(Hash::check('OriginalPass1!', $staff->password_hash));
        $this->assertTrue(Hash::check('482951', $staff->pin_hash));
    }

    public function test_sensitive_staff_actions_are_rate_limited(): void
    {
        $supervisor = User::factory()->create([
            'role' => 'SUPERVISOR',
            'is_active' => true,
            'password_hash' => Hash::make('Supervisor1!'),
        ]);
        $staff = User::factory()->create([
            'role' => 'CASHIER',
            'is_active' => true,
            'pin_hash' => Hash::make('482951'),
        ]);

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->actingAs($supervisor)->postJson("/api/admin/staff/{$staff->id}/reset-pin", [
                'pin' => '592847',
                'current_credential' => 'wrong-credential',
            ])->assertUnprocessable();
        }

        $response = $this->actingAs($supervisor)->postJson("/api/admin/staff/{$staff->id}/reset-pin", [
            'pin' => '592847',
            'current_credential' => 'wrong-credential',
        ])->assertTooManyRequests();

        $this->assertGreaterThanOrEqual(299, (int) $response->headers->get('Retry-After'));
    }
}
