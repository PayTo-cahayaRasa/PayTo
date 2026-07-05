<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('sync_idempotency_keys');
        Schema::dropIfExists('sync_batches');
        Schema::dropIfExists('push_subscriptions');
    }

    public function down(): void
    {
        if (! Schema::hasTable('sync_batches')) {
            Schema::create('sync_batches', function (Blueprint $table): void {
                $table->bigIncrements('id');
                $table->string('device_id');
                $table->char('batch_uuid', 36)->unique();
                $table->timestamp('pushed_at')->nullable();
                $table->enum('status', ['RECEIVED', 'PROCESSED', 'FAILED'])->default('RECEIVED');
                $table->text('error_message')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('sync_idempotency_keys')) {
            Schema::create('sync_idempotency_keys', function (Blueprint $table): void {
                $table->bigIncrements('id');
                $table->string('key')->unique();
                $table->string('ref_type')->nullable();
                $table->unsignedBigInteger('ref_id')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('push_subscriptions')) {
            Schema::create('push_subscriptions', function (Blueprint $table): void {
                $table->bigIncrements('id');
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('endpoint', 512)->unique();
                $table->string('public_key', 255);
                $table->string('auth_token', 255);
                $table->string('content_encoding', 50)->default('aesgcm');
                $table->text('user_agent')->nullable();
                $table->timestamp('last_seen_at')->nullable();
                $table->timestamps();
            });
        }
    }
};
