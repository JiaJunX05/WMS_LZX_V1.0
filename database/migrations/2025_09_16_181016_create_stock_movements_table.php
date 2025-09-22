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
            $table->enum('movement_type', ['stock_in', 'stock_out']); // 库存进出类型
            $table->integer('quantity'); // 变动数量（正数为入库，负数为出库）
            $table->integer('previous_stock')->default(0); // 变动前库存
            $table->integer('current_stock')->default(0); // 变动后库存
            $table->string('reference_number')->nullable(); // 参考单号
            $table->text('notes')->nullable(); // 备注
            $table->enum('movement_reason', [
                'initial_stock', // 初始库存
                'purchase', // 采购入库
                'sale', // 销售出库
                'adjustment', // 库存调整
                'transfer', // 库存转移
                'return', // 退货
                'damage', // 损坏
                'expired', // 过期
                'other' // 其他
            ])->default('other');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // 操作用户
            $table->timestamp('movement_date')->useCurrent(); // 变动时间
            $table->timestamps();

            // 添加索引
            $table->index(['product_id', 'movement_date']);
            $table->index(['movement_type', 'movement_date']);
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
