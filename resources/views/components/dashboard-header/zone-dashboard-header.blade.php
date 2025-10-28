{{-- ==========================================
    Zone管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';

    $headerConfig = match($type) {
        'create' => [
            'icon' => 'bi bi-geo-alt-fill',
            'title' => 'Create Zone',
            'subtitle' => 'Add single or multiple zones to organize and manage storage locations',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.zone.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'update' => [
            'icon' => 'bi bi-geo-alt-fill',
            'title' => 'Update Zone',
            'subtitle' => 'Modify zone information to better manage stock locations',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.zone.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        default => [
            'icon' => 'bi bi-geo-alt-fill',
            'title' => 'Zone Management',
            'subtitle' => 'Manage and organize storage zones',
            'actionButtonText' => 'Add Zone',
            'actionButtonUrl' => route('admin.zone.create'),
            'actionButtonIcon' => 'bi bi-plus-circle-fill'
        ]
    };
@endphp

@include('components.dashboard-header.templates.dashboard-header', $headerConfig)

