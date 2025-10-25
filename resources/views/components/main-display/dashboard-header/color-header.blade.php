{{-- ==========================================
    Color管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';
@endphp

@if($type === 'dashboard')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-palette-fill',
        'title' => 'Color Management',
        'subtitle' => 'Manage and organize product colors',
        'actionButtonText' => 'Add Color',
        'actionButtonUrl' => route('admin.color.create'),
        'actionButtonIcon' => 'bi bi-plus-circle-fill'
    ])
@elseif($type === 'create')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-palette-fill',
        'title' => 'Create Color',
        'subtitle' => 'Add single or multiple colors to organize and manage product classifications',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.color.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'update')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-palette-fill',
        'title' => 'Update Color',
        'subtitle' => 'Modify color information to better manage product classifications',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.color.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@endif
