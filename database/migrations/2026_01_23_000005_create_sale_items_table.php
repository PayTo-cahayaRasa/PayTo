<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_items', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('sale_id')->constrained('sales')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products');
            $table->string('product_name_snapshot');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('qty', 12, 3)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('line_total', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
