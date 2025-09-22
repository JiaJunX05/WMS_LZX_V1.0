<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Account;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::withoutEvents(function() {
            // 创建 SuperAdmin 用户和账号
            $superAdmin = User::updateOrCreate(
                ['email' => 'superadmin@example.com'],
                [
                    'name' => 'SuperAdmin',
                    'password' => Hash::make('123qwe'),
                ]
            );

            Account::updateOrCreate(
                ['user_id' => $superAdmin->id],
                [
                    'account_role' => 'SuperAdmin',
                    'account_status' => 'Available',
                ]
            );

            // 创建 Admin 用户和账号
            $admin = User::updateOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name' => 'Admin',
                    'password' => Hash::make('123qwe'),
                ]
            );

            Account::updateOrCreate(
                ['user_id' => $admin->id],
                [
                    'account_role' => 'Admin',
                    'account_status' => 'Available',
                ]
            );

            // 创建 Staff 用户和账号
            $staff = User::updateOrCreate(
                ['email' => 'staff@example.com'],
                [
                    'name' => 'Staff',
                    'password' => Hash::make('123qwe'),
                ]
            );

            Account::updateOrCreate(
                ['user_id' => $staff->id],
                [
                    'account_role' => 'Staff',
                    'account_status' => 'Available',
                ]
            );
        });
    }
}
