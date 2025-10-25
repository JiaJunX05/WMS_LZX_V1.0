{{-- ==========================================
    Zone管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';
@endphp

@if($type === 'dashboard')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-geo-alt-fill',
        'title' => 'Zone Management',
        'subtitle' => 'Manage and organize storage zones',
        'actionButtonText' => 'Add Zone',
        'actionButtonUrl' => route('admin.zone.create'),
        'actionButtonIcon' => 'bi bi-plus-circle-fill'
    ])
@elseif($type === 'create')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-geo-alt-fill',
        'title' => 'Create Zone',
        'subtitle' => 'Add single or multiple zones to organize and manage storage locations',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.zone.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'update')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-geo-alt-fill',
        'title' => 'Update Zone',
        'subtitle' => 'Modify zone information to better manage stock locations',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.zone.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@endif
