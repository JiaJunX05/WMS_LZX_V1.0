{{-- ==========================================
    Rack管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';

    $headerConfig = match($type) {
        'create' => [
            'icon' => 'bi bi-box-fill',
            'title' => 'Create Rack',
            'subtitle' => 'Add single or multiple racks to organize and manage storage locations',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.rack.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'update' => [
            'icon' => 'bi bi-box-fill',
            'title' => 'Update Rack',
            'subtitle' => 'Modify rack information to better manage storage locations',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.rack.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        default => [
            'icon' => 'bi bi-box-fill',
            'title' => 'Rack Management',
            'subtitle' => 'Manage and organize storage racks',
            'actionButtonText' => 'Add Rack',
            'actionButtonUrl' => route('admin.rack.create'),
            'actionButtonIcon' => 'bi bi-plus-circle-fill'
        ]
    };
@endphp

@include('components.dashboard-header.templates.dashboard-header', $headerConfig)

