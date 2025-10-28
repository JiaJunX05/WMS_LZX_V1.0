{{-- ==========================================
    Brand管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';

    $headerConfig = match($type) {
        'create' => [
            'icon' => 'bi bi-award-fill',
            'title' => 'Create Brand',
            'subtitle' => 'Add single or multiple brands to organize and manage product classifications',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.brand.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'update' => [
            'icon' => 'bi bi-award-fill',
            'title' => 'Update Brand',
            'subtitle' => 'Modify brand information to better manage product classifications',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.brand.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        default => [
            'icon' => 'bi bi-award-fill',
            'title' => 'Brand Management',
            'subtitle' => 'Manage and organize product brands',
            'actionButtonText' => 'Add Brand',
            'actionButtonUrl' => route('admin.brand.create'),
            'actionButtonIcon' => 'bi bi-plus-circle-fill'
        ]
    };
@endphp

@include('components.dashboard-header.templates.dashboard-header', $headerConfig)

