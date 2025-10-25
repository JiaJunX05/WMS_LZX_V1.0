{{-- ==========================================
    Size Library管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update', 'view'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';
@endphp

@if($type === 'dashboard')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-collection-fill',
        'title' => 'Size Library Management',
        'subtitle' => 'Manage and organize size values by category',
        'actionButtonText' => 'Add Size Library',
        'actionButtonUrl' => route('admin.library.create'),
        'actionButtonIcon' => 'bi bi-plus-circle-fill'
    ])
@elseif($type === 'create')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-tag-fill',
        'title' => 'Create Size Library',
        'subtitle' => 'Add single or multiple size values to a specific category',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.library.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'update')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-pencil-square',
        'title' => 'Update Size Library',
        'subtitle' => 'Modify existing size library information',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.library.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'view')
    @php
        $title = isset($category) ? "View {$category->category_name} Size Library" : 'View Size Library';
        $subtitle = isset($category) ? "View size library for {$category->category_name} category" : 'View size library configuration and size values';
    @endphp
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-rulers',
        'title' => $title,
        'subtitle' => $subtitle,
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.library.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@endif
