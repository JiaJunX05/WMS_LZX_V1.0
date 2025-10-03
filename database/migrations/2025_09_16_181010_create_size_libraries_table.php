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
        Schema::create('size_libraries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('size_value', 20);
            $table->enum('size_status', ['Available', 'Unavailable'])->default('Available');
            $table->timestamps();

            // 确保每个类别下的尺码组合唯一
            $table->unique(['category_id', 'size_value'], 'size_libraries_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('size_libraries');
    }
};
