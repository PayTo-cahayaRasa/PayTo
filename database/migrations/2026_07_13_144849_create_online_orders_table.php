<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('online_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('tracking_token', 64)->unique();
            $table->string('customer_name');
            $table->string('customer_phone', 15);
            $table->enum('fulfillment_method', ['DELIVERY', 'PICKUP']);
            $table->text('shipping_address')->nullable();
            $table->string('destination_id')->nullable();
            $table->string('destination_label')->nullable();
            $table->string('shipping_courier_code')->nullable();
            $table->string('shipping_courier_name')->nullable();
            $table->string('shipping_service')->nullable();
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->string('shipping_etd')->nullable();
            $table->unsignedInteger('shipping_weight_grams')->default(0);
            $table->timestamp('shipping_quoted_at')->nullable();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2);
            $table->enum('payment_method', ['BANK_TRANSFER', 'QRIS_MANUAL', 'PAY_AT_STORE']);
            $table->string('status', 32)->index();
            $table->foreignId('sale_id')->nullable()->constrained('sales')->nullOnDelete();
            $table->string('tracking_number')->nullable();
            $table->text('customer_note')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('online_orders');
    }
};
