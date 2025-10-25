{{-- ==========================================
    Size Template管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update', 'view'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';
@endphp

@if($type === 'dashboard')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-layout-text-window-reverse',
        'title' => 'Size Template Management',
        'subtitle' => 'Manage and organize size templates',
        'actionButtonText' => 'Add Template',
        'actionButtonUrl' => route('admin.template.create'),
        'actionButtonIcon' => 'bi bi-plus-circle-fill'
    ])
@elseif($type === 'create')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-plus-circle-fill',
        'title' => 'Create Size Template',
        'subtitle' => 'Add size template combinations to manage size systems',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.template.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'update')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-pencil-square',
        'title' => 'Update Size Template',
        'subtitle' => 'Modify template configuration and manage size values',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.template.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'view')
    @php
        $title = isset($category) && isset($gender) ? "View {$category->category_name} ({$gender->gender_name}) Size Template" : 'View Size Template';
        $subtitle = isset($category) && isset($gender) ? "View size templates for {$category->category_name} category and {$gender->gender_name} gender" : 'View template configuration and size values';
    @endphp
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-layout-text-window-reverse',
        'title' => $title,
        'subtitle' => $subtitle,
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.template.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@endif
