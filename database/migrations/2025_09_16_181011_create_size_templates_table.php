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
        Schema::create('size_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');                     // 关联类别
            $table->enum('gender', ['Men', 'Women', 'Kids', 'Unisex'])->nullable();                                // 关联性别
            $table->foreignId('size_library_id')->constrained('size_libraries')->onDelete('cascade');            // 关联尺码系统
            $table->enum('template_status', ['Available', 'Unavailable'])->default('Available');               // 模板状态
            $table->timestamps();

            // 确保每个类别下的尺码组合唯一
            $table->unique(['category_id', 'gender', 'size_library_id'], 'size_templates_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('size_templates');
    }
};
