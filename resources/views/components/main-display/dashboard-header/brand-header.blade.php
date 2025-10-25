{{-- ==========================================
    Brand管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';
@endphp

@if($type === 'dashboard')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-award-fill',
        'title' => 'Brand Management',
        'subtitle' => 'Manage and organize product brands',
        'actionButtonText' => 'Add Brand',
        'actionButtonUrl' => route('admin.brand.create'),
        'actionButtonIcon' => 'bi bi-plus-circle-fill'
    ])
@elseif($type === 'create')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-award-fill',
        'title' => 'Create Brand',
        'subtitle' => 'Add single or multiple brands to organize and manage product classifications',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.brand.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'update')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-award-fill',
        'title' => 'Update Brand',
        'subtitle' => 'Modify brand information to better manage product classifications',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.brand.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@endif
