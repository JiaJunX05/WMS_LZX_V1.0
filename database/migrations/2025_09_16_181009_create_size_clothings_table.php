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
        Schema::create('size_clothings', function (Blueprint $table) {
            $table->id();
            $table->string('size_value', 20);                                                               // 尺码值：XS, S, M, L, XL, XXL
            $table->foreignId('gender_id')->nullable()->constrained('genders')->onDelete('set null');      // 性别ID
            $table->json('measurements')->nullable();                                                       // 详细尺寸 JSON 格式 (胸围、腰围等)
            $table->enum('size_status', ['Available', 'Unavailable'])->default('Available');
            $table->timestamps();

            $table->unique(['size_value', 'gender_id']);      // 确保同一性别下尺码值唯一
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('size_clothings');
    }
};
