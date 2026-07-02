<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BusinessSettingsApiTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function supervisor_can_get_business_settings(): void
    {
        $supervisor = User::factory()->create(['role' => 'SUPERVISOR']);

        $response = $this->actingAs($supervisor)->getJson('/api/admin/business-settings');

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'business' => ['name', 'address', 'whatsapp_number', 'operating_hours'],
                'catalog' => ['enabled', 'whatsapp_enabled', 'whatsapp_message_template'],
            ],
        ]);
    }

    public function test_supervisor_can_update_business_settings(): void
    {
        $supervisor = User::factory()->create(['role' => 'SUPERVISOR']);

        $payload = [
            'business' => [
                'name' => 'Toko Maju Jaya',
                'address' => 'Jl. Merdeka No. 123, Jakarta',
                'whatsapp_number' => '6281234567890',
                'operating_hours' => 'Senin-Minggu 08.00-22.00',
            ],
            'catalog' => [
                'enabled' => true,
                'whatsapp_enabled' => true,
                'whatsapp_message_template' => 'Halo, saya mau pesan {product_name} seharga {price}.',
            ],
        ];

        $response = $this->actingAs($supervisor)->putJson('/api/admin/business-settings', $payload);

        $response->assertOk();
        $response->assertJson([
            'message' => 'Pengaturan toko berhasil disimpan.',
            'data' => $payload,
        ]);

        // Verify data persisted
        $this->assertDatabaseHas('app_settings', [
            'key' => 'business.profile',
        ]);

        $this->assertDatabaseHas('app_settings', [
            'key' => 'catalog.settings',
        ]);
    }

    /** @test */
    public function cashier_cannot_access_business_settings(): void
    {
        $cashier = User::factory()->create(['role' => 'CASHIER']);

        $response = $this->actingAs($cashier)->getJson('/api/admin/business-settings');

        $response->assertForbidden();
    }

    /** @test */
    public function guest_cannot_access_business_settings(): void
    {
        $response = $this->getJson('/api/admin/business-settings');

        $response->assertUnauthorized();
    }

    /** @test */
    public function business_name_is_required(): void
    {
        $supervisor = User::factory()->create(['role' => 'SUPERVISOR']);

        $payload = [
            'business' => [
                'name' => '',
                'address' => 'Jl. Test',
                'whatsapp_number' => '',
                'operating_hours' => 'Test',
            ],
            'catalog' => [
                'enabled' => true,
                'whatsapp_enabled' => false,
                'whatsapp_message_template' => 'Test {product_name}',
            ],
        ];

        $response = $this->actingAs($supervisor)->putJson('/api/admin/business-settings', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('business.name');
    }

    /** @test */
    public function whatsapp_number_must_be_valid_format(): void
    {
        $supervisor = User::factory()->create(['role' => 'SUPERVISOR']);

        // With + sign (invalid)
        $payload = [
            'business' => [
                'name' => 'Test',
                'address' => 'Test',
                'whatsapp_number' => '+6281234567890',
                'operating_hours' => 'Test',
            ],
            'catalog' => [
                'enabled' => true,
                'whatsapp_enabled' => false,
                'whatsapp_message_template' => 'Test',
            ],
        ];

        $response = $this->actingAs($supervisor)->putJson('/api/admin/business-settings', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('business.whatsapp_number');

        // Too short (invalid)
        $payload['business']['whatsapp_number'] = '123456';
        $response = $this->actingAs($supervisor)->putJson('/api/admin/business-settings', $payload);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('business.whatsapp_number');

        // Valid formats
        $payload['business']['whatsapp_number'] = '6281234567890';
        $response = $this->actingAs($supervisor)->putJson('/api/admin/business-settings', $payload);
        $response->assertOk();

        $payload['business']['whatsapp_number'] = '';
        $response = $this->actingAs($supervisor)->putJson('/api/admin/business-settings', $payload);
        $response->assertOk();
    }

    /** @test */
    public function whatsapp_template_only_accepts_allowed_placeholders(): void
    {
        $supervisor = User::factory()->create(['role' => 'SUPERVISOR']);

        // Invalid placeholder
        $payload = [
            'business' => [
                'name' => 'Test',
                'address' => 'Test',
                'whatsapp_number' => '',
                'operating_hours' => 'Test',
            ],
            'catalog' => [
                'enabled' => true,
                'whatsapp_enabled' => true,
                'whatsapp_message_template' => 'Halo {customer_name}, saya mau {product_name}',
            ],
        ];

        $response = $this->actingAs($supervisor)->putJson('/api/admin/business-settings', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('catalog.whatsapp_message_template');

        // Valid placeholders
        $payload['catalog']['whatsapp_message_template'] = 'Saya mau {product_name} qty {qty} seharga {price}';
        $response = $this->actingAs($supervisor)->putJson('/api/admin/business-settings', $payload);
        $response->assertOk();
    }

    /** @test */
    public function settings_are_returned_with_defaults_when_empty(): void
    {
        $supervisor = User::factory()->create(['role' => 'SUPERVISOR']);

        $response = $this->actingAs($supervisor)->getJson('/api/admin/business-settings');

        $response->assertOk();
        $response->assertJson([
            'data' => [
                'business' => [
                    'name' => 'Nama Toko',
                    'address' => 'Alamat Toko',
                ],
                'catalog' => [
                    'enabled' => true,
                    'whatsapp_enabled' => true,
                ],
            ],
        ]);
    }
}
