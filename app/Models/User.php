<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Account;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isSuperAdmin() {
        return $this->account && $this->account->account_role === 'SuperAdmin';
    }

    public function isAdmin() {
        return $this->account && $this->account->account_role === 'Admin';
    }

    public function isStaff() {
        return $this->account && $this->account->account_role === 'Staff';
    }

    public function account(): HasOne {
        return $this->hasOne(Account::class, 'user_id');
    }

    // 检测账号是否存在且状态为可用
    public function hasAvailableAccount(): bool {
        return (bool) ($this->account && $this->account->account_status === 'Available');
    }

    // 获取账号角色
    public function getAccountRole(): string {
        return $this->account->account_role ?? '';
    }

    // 根据账号角色返回对应的仪表路由名称
    public function dashboardRole(): string {
        $role = $this->getAccountRole();
        return match($role) {
            'SuperAdmin' => 'superadmin.dashboard',
            'Admin' => 'admin.dashboard',
            'Staff' => 'staff.dashboard',
            default => 'login', // 默认重定向到登录页面
        };
    }

    // 根据账号角色返回对应的仪表路由名称（别名方法）
    public function dashboardRoute(): string {
        return $this->dashboardRole();
    }
}
