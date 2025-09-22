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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->enum('account_role', ['SuperAdmin', 'Admin', 'Staff'])->default('Staff');
            $table->enum('account_status', ['Available', 'Unavailable'])->default('Available');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 先删除有外键约束的表
        Schema::dropIfExists('accounts');

        // 再删除被引用的表
        Schema::dropIfExists('users');
    }
};
