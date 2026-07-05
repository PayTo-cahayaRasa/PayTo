<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('product_id')->constrained('products');
            $table->enum('type', ['SALE_OUT', 'RETURN_IN', 'ADJUSTMENT', 'SYNC_CORRECTION']);
            $table->decimal('qty_delta', 12, 3);
            $table->string('ref_type')->nullable();
            $table->string('ref_id')->nullable();
            $table->string('note')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
