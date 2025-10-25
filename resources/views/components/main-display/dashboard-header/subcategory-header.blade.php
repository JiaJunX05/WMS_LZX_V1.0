{{-- ==========================================
    Subcategory管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';
@endphp

@if($type === 'dashboard')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-tag-fill',
        'title' => 'Subcategory Management',
        'subtitle' => 'Manage and organize product subcategories',
        'actionButtonText' => 'Add Subcategory',
        'actionButtonUrl' => route('admin.subcategory.create'),
        'actionButtonIcon' => 'bi bi-plus-circle-fill'
    ])
@elseif($type === 'create')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-tag-fill',
        'title' => 'Create Subcategory',
        'subtitle' => 'Add single or multiple subcategories to organize and manage product classifications',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.subcategory.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'update')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-tag-fill',
        'title' => 'Update Subcategory',
        'subtitle' => 'Modify subcategory information to better manage product classifications',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.subcategory.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@endif
