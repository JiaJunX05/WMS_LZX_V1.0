{{-- ==========================================
    Size Template管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update', 'view'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';

    $headerConfig = match($type) {
        'create' => [
            'icon' => 'bi bi-plus-circle-fill',
            'title' => 'Create Size Template',
            'subtitle' => 'Add size template combinations to manage size systems',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.template.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'update' => [
            'icon' => 'bi bi-pencil-square',
            'title' => 'Update Size Template',
            'subtitle' => 'Modify template configuration and manage size values',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.template.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'view' => [
            'icon' => 'bi bi-layout-text-window-reverse',
            'title' => isset($category) && isset($gender) ? "View {$category->category_name} ({$gender}) Size Template" : 'View Size Template',
            'subtitle' => isset($category) && isset($gender) ? "View size templates for {$category->category_name} category and {$gender} gender" : 'View template configuration and size values',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.template.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        default => [
            'icon' => 'bi bi-layout-text-window-reverse',
            'title' => 'Size Template Management',
            'subtitle' => 'Manage and organize size templates',
            'actionButtonText' => 'Add Template',
            'actionButtonUrl' => route('admin.template.create'),
            'actionButtonIcon' => 'bi bi-plus-circle-fill'
        ]
    };
@endphp

@include('components.dashboard-header.templates.dashboard-header', $headerConfig)

