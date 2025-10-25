{{-- ==========================================
    Category Mapping管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update', 'view'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';
@endphp

@if($type === 'dashboard')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-diagram-2-fill',
        'title' => 'Category Mapping Management',
        'subtitle' => 'Manage and organize category mappings',
        'actionButtonText' => 'Add Mapping',
        'actionButtonUrl' => route('admin.mapping.create'),
        'actionButtonIcon' => 'bi bi-plus-circle-fill'
    ])
@elseif($type === 'create')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-tags-fill',
        'title' => 'Create Category Mapping',
        'subtitle' => 'Add single or multiple mapping combinations to connect categories with subcategories',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.mapping.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'update')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-pencil-fill',
        'title' => 'Update Category Mapping',
        'subtitle' => 'Modify existing mapping information',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.mapping.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'view')
    @php
        $title = isset($category) ? "View {$category->category_name} Mappings" : 'View Category Mapping';
        $subtitle = isset($category) ? "View all subcategory mappings for {$category->category_name}" : 'View category mapping details';
    @endphp
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-diagram-2-fill',
        'title' => $title,
        'subtitle' => $subtitle,
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.mapping.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@endif
