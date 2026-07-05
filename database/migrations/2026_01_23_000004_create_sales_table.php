<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('server_invoice_no')->unique()->nullable();
            $table->char('local_txn_uuid', 36)->unique();
            $table->enum('status', ['DRAFT', 'PENDING_PAYMENT', 'PAID', 'VOID', 'SYNC_FAILED'])->default('DRAFT');
            $table->foreignId('cashier_id')->constrained('users');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('tax_total', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->decimal('paid_total', 12, 2)->default(0);
            $table->decimal('change_total', 12, 2)->default(0);
            $table->timestamp('occurred_at')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
