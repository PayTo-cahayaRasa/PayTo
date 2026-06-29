<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PwaRemovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_pwa_routes_and_database_tables_are_removed(): void
    {
        $this->postJson('/api/pos/sync/batches')->assertNotFound();
        $this->postJson('/api/push/subscriptions')->assertNotFound();
        $this->deleteJson('/api/push/subscriptions')->assertNotFound();
        $this->postJson('/api/push/test')->assertNotFound();
        $this->postJson('/api/pos/settings/refresh')->assertNotFound();

        $this->assertFalse(Schema::hasTable('sync_batches'));
        $this->assertFalse(Schema::hasTable('sync_idempotency_keys'));
        $this->assertFalse(Schema::hasTable('push_subscriptions'));
    }

    public function test_pwa_public_assets_are_removed(): void
    {
        $this->assertFileDoesNotExist(public_path('sw.js'));
        $this->assertFileDoesNotExist(public_path('manifest.json'));
        $this->assertFileDoesNotExist(public_path('offline.html'));
    }
}
