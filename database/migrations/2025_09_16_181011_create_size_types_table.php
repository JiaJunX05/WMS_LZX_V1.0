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
        Schema::create('size_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clothing_size_id')->nullable()->constrained('size_clothings')->onDelete('cascade');  // 关联衣服尺码
            $table->foreignId('shoe_size_id')->nullable()->constrained('size_shoes')->onDelete('cascade');           // 关联鞋子尺码
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');                        // 关联类别
            $table->enum('size_status', ['Available', 'Unavailable'])->default('Available');
            $table->timestamps();

            // 确保不会同时关联两种尺码类型 (MySQL 8.0.16+ 支持)
            // $table->check('(clothing_size_id IS NOT NULL AND shoe_size_id IS NULL) OR (clothing_size_id IS NULL AND shoe_size_id IS NOT NULL)');

            // 确保每个类别下的尺码组合唯一
            $table->unique(['clothing_size_id', 'category_id'], 'size_types_clothing_category_unique');
            $table->unique(['shoe_size_id', 'category_id'], 'size_types_shoes_category_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('size_types');
    }
};
