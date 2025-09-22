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
        Schema::create('genders', function (Blueprint $table) {
            $table->id();
            $table->string('gender_name', 50);                                    // 性别名称：Men, Women, Kids, Unisex
            $table->string('gender_code', 10)->unique();                          // 性别代码：M, W, K, U (用于SKU、条形码等)
            $table->text('gender_description')->nullable();                       // 性别描述：详细说明、尺寸指南等
            $table->enum('gender_status', ['Available', 'Unavailable'])->default('Available');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('genders');
    }
};
