{{-- ==========================================
    Location管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update', 'view'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';

    $headerConfig = match($type) {
        'create' => [
            'icon' => 'bi bi-geo-alt-fill',
            'title' => 'Create Location',
            'subtitle' => 'Add single or multiple location combinations to connect zones with racks',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.location.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'update' => [
            'icon' => 'bi bi-pencil-fill',
            'title' => 'Update Location',
            'subtitle' => 'Modify existing location information',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.location.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'view' => [
            'icon' => 'bi bi-geo-alt-fill',
            'title' => isset($zone) ? "View {$zone->zone_name} Locations" : 'View Storage Location',
            'subtitle' => isset($zone) ? "View all storage locations in {$zone->zone_name}" : 'View storage location details',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.location.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        default => [
            'icon' => 'bi bi-geo-alt-fill',
            'title' => 'Location Management',
            'subtitle' => 'Manage and organize storage locations',
            'actionButtonText' => 'Add Location',
            'actionButtonUrl' => route('admin.location.create'),
            'actionButtonIcon' => 'bi bi-plus-circle-fill'
        ]
    };
@endphp

@include('components.dashboard-header.templates.dashboard-header', $headerConfig)

