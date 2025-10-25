{{-- ==========================================
    Rack管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';
@endphp

@if($type === 'dashboard')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-box-fill',
        'title' => 'Rack Management',
        'subtitle' => 'Manage and organize storage racks',
        'actionButtonText' => 'Add Rack',
        'actionButtonUrl' => route('admin.rack.create'),
        'actionButtonIcon' => 'bi bi-plus-circle-fill'
    ])
@elseif($type === 'create')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-box-fill',
        'title' => 'Create Rack',
        'subtitle' => 'Add single or multiple racks to organize and manage storage locations',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.rack.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'update')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-box-fill',
        'title' => 'Update Rack',
        'subtitle' => 'Modify rack information to better manage storage locations',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.rack.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@endif
