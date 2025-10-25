{{-- ==========================================
    Category管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';
@endphp

@if($type === 'dashboard')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-tags-fill',
        'title' => 'Category Management',
        'subtitle' => 'Manage and organize product categories',
        'actionButtonText' => 'Add Category',
        'actionButtonUrl' => route('admin.category.create'),
        'actionButtonIcon' => 'bi bi-plus-circle-fill'
    ])
@elseif($type === 'create')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-tags-fill',
        'title' => 'Create Category',
        'subtitle' => 'Add single or multiple categories to organize and manage product classifications',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.category.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'update')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-tags-fill',
        'title' => 'Update Category',
        'subtitle' => 'Modify category information to better manage product classifications',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.category.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@endif
