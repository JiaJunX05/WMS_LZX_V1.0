{{-- ==========================================
    用户统计卡片组件
    功能：显示用户相关的统计数据
    参数：
    - $totalUsers: 总用户数
    - $activeUsers: 可用用户数
    - $inactiveUsers: 不可用用户数
    - $adminUsers: 管理员用户数
    ========================================== --}}

@php
    $userStats = [
        [
            'id' => 'total-users',
            'value' => $totalUsers ?? 0,
            'label' => 'Total Users',
            'icon' => 'bi bi-people',
            'bg_class' => 'bg-primary'
        ],
        [
            'id' => 'active-users',
            'value' => $activeUsers ?? 0,
            'label' => 'Available Users',
            'icon' => 'bi bi-check-circle',
            'bg_class' => 'bg-success'
        ],
        [
            'id' => 'inactive-users',
            'value' => $inactiveUsers ?? 0,
            'label' => 'Unavailable Users',
            'icon' => 'bi bi-pause-circle',
            'bg_class' => 'bg-warning'
        ],
        [
            'id' => 'admin-users',
            'value' => $adminUsers ?? 0,
            'label' => 'Admin Users',
            'icon' => 'bi bi-shield-check',
            'bg_class' => 'bg-info'
        ]
    ];
@endphp

@include('components.main-display.stats-cards.templates.stats-cards', ['stats' => $userStats, 'columns' => 4])
