{{-- ==========================================
    Category管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';

    $headerConfig = match($type) {
        'create' => [
            'icon' => 'bi bi-tags-fill',
            'title' => 'Create Category',
            'subtitle' => 'Add single or multiple categories to organize and manage product classifications',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.category.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'update' => [
            'icon' => 'bi bi-tags-fill',
            'title' => 'Update Category',
            'subtitle' => 'Modify category information to better manage product classifications',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.category.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        default => [
            'icon' => 'bi bi-tags-fill',
            'title' => 'Category Management',
            'subtitle' => 'Manage and organize product categories',
            'actionButtonText' => 'Add Category',
            'actionButtonUrl' => route('admin.category.create'),
            'actionButtonIcon' => 'bi bi-plus-circle-fill'
        ]
    };
@endphp

@include('components.dashboard-header.templates.dashboard-header', $headerConfig)

