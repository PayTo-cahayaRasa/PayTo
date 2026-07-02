<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_recommendations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('product_id')->constrained('products');
            $table->decimal('avg_daily_sales_7d', 12, 3)->default(0);
            $table->decimal('avg_daily_sales_30d', 12, 3)->default(0);
            $table->integer('lead_time_days')->default(3);
            $table->decimal('safety_stock', 12, 3)->default(0);
            $table->decimal('reorder_point', 12, 3)->default(0);
            $table->decimal('suggested_reorder_qty', 12, 3)->default(0);
            $table->timestamp('computed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_recommendations');
    }
};
