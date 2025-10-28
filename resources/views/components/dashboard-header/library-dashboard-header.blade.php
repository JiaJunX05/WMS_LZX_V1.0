{{-- ==========================================
    Size Library管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update', 'view'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';

    $headerConfig = match($type) {
        'create' => [
            'icon' => 'bi bi-tag-fill',
            'title' => 'Create Size Library',
            'subtitle' => 'Add single or multiple size values to a specific category',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.library.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'update' => [
            'icon' => 'bi bi-pencil-square',
            'title' => 'Update Size Library',
            'subtitle' => 'Modify existing size library information',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.library.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'view' => [
            'icon' => 'bi bi-rulers',
            'title' => isset($category) ? "View {$category->category_name} Size Library" : 'View Size Library',
            'subtitle' => isset($category) ? "View size library for {$category->category_name} category" : 'View size library configuration and size values',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.library.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        default => [
            'icon' => 'bi bi-collection-fill',
            'title' => 'Size Library Management',
            'subtitle' => 'Manage and organize size values by category',
            'actionButtonText' => 'Add Size Library',
            'actionButtonUrl' => route('admin.library.create'),
            'actionButtonIcon' => 'bi bi-plus-circle-fill'
        ]
    };
@endphp

@include('components.dashboard-header.templates.dashboard-header', $headerConfig)

