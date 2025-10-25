{{-- ==========================================
    Gender管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';
@endphp

@if($type === 'dashboard')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-gender-ambiguous',
        'title' => 'Gender Management',
        'subtitle' => 'Manage and organize product genders',
        'actionButtonText' => 'Add Gender',
        'actionButtonUrl' => route('admin.gender.create'),
        'actionButtonIcon' => 'bi bi-plus-circle-fill'
    ])
@elseif($type === 'create')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-gender-ambiguous',
        'title' => 'Create Gender',
        'subtitle' => 'Add single or multiple genders to organize and manage product classifications',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.gender.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@elseif($type === 'update')
    @include('components.main-display.dashboard-header.templates.dashboard-header', [
        'icon' => 'bi bi-gender-ambiguous',
        'title' => 'Update Gender',
        'subtitle' => 'Modify gender information to better manage product classifications',
        'actionButtonText' => 'Back to List',
        'actionButtonUrl' => route('admin.gender.index'),
        'actionButtonIcon' => 'bi bi-arrow-left'
    ])
@endif
