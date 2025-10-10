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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->onDelete('cascade');
            $table->enum('movement_type', ['stock_in', 'stock_out', 'stock_return']); // 库存进出类型
            $table->integer('quantity'); // 变动数量（正数为入库，负数为出库）
            $table->integer('previous_stock')->default(0); // 变动前库存
            $table->integer('current_stock')->default(0); // 变动后库存
            $table->string('reference_number')->nullable(); // 参考单号
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // 操作用户
            $table->timestamp('movement_date')->useCurrent(); // 变动时间
            $table->timestamps();

            // 添加索引
            $table->index(['product_id', 'movement_date']);
            $table->index(['movement_type', 'movement_date']);
            $table->index(['user_id', 'movement_date']);
            $table->index('reference_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
