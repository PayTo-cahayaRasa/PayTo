<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sync_batches', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('device_id');
            $table->char('batch_uuid', 36)->unique();
            $table->timestamp('pushed_at')->nullable();
            $table->enum('status', ['RECEIVED', 'PROCESSED', 'FAILED'])->default('RECEIVED');
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_batches');
    }
};
