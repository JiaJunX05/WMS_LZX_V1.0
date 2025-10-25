{{-- ==========================================
    Location管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update', 'view'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';
@endphp

@if($type === 'dashboard')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-geo-alt-fill',
        'title' => 'Location Management',
        'subtitle' => 'Manage and organize storage locations',
        'actionButtonText' => 'Add Location',
        'actionButtonUrl' => route('admin.location.create'),
        'actionButtonIcon' => 'bi bi-plus-circle-fill'
    ])
@elseif($type === 'create')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-geo-alt-fill',
        'title' => 'Create Location',
        'subtitle' => 'Add single or multiple location combinations to connect zones with racks',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.location.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'update')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-pencil-fill',
        'title' => 'Update Location',
        'subtitle' => 'Modify existing location information',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.location.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'view')
    @php
        $title = isset($zone) ? "View {$zone->zone_name} Locations" : 'View Storage Location';
        $subtitle = isset($zone) ? "View all storage locations in {$zone->zone_name}" : 'View storage location details';
    @endphp
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-geo-alt-fill',
        'title' => $title,
        'subtitle' => $subtitle,
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.location.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@endif
