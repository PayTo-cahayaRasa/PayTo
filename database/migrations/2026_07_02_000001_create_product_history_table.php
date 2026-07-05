<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event', 50); // CREATED, UPDATED, DELETED, STOCK_ADJUSTED, STOCK_OPNAME
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->dateTime('occurred_at');
            $table->index(['product_id', 'occurred_at']);
            $table->index('event');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_history');
    }
};
