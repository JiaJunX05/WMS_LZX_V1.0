{{-- ==========================================
    用户管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'register', 'update'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';

    $headerConfig = match($type) {
        'register' => [
            'icon' => 'bi bi-person-plus-fill',
            'title' => 'Create User Account',
            'subtitle' => 'Add a new user account to manage system access',
            'actionButtonText' => 'Back to Dashboard',
            'actionButtonUrl' => $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'update' => [
            'icon' => 'bi bi-pencil-fill',
            'title' => 'Update User Information',
            'subtitle' => 'Modify user basic information and permission settings',
            'actionButtonText' => 'Back to Dashboard',
            'actionButtonUrl' => $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        default => [
            'icon' => 'bi bi-person-fill',
            'title' => 'Authentication Management',
            'subtitle' => 'Manage user authentication and authorization',
            'actionButtonText' => 'Add User',
            'actionButtonUrl' => route('register'),
            'actionButtonIcon' => 'bi bi-plus-circle-fill'
        ]
    };
@endphp

@include('components.dashboard-header.templates.dashboard-header', $headerConfig)

