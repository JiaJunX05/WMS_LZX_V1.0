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
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_id')->constrained('zones')->onDelete('cascade');
            $table->foreignId('rack_id')->constrained('racks')->onDelete('cascade');
            $table->unsignedInteger('current_usage')->default(0);
            $table->timestamps();

            $table->unique(['zone_id', 'rack_id']); // 确保同一个 Zone 里的 Rack Number 唯一
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
