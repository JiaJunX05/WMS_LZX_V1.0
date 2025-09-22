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
        Schema::create('colors', function (Blueprint $table) {
            $table->id();
            $table->string('color_name', 100);              // 颜色名称：红色、蓝色
            $table->string('color_hex', 7)->nullable();     // 色值：#FF0000
            $table->string('color_rgb', 255)->nullable();   // RGB色值：255,0,0
            $table->enum('color_status', ['Available', 'Unavailable'])->default('Available');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('colors');
    }
};
