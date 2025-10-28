{{-- ==========================================
    Gender管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';

    $headerConfig = match($type) {
        'create' => [
            'icon' => 'bi bi-gender-ambiguous',
            'title' => 'Create Gender',
            'subtitle' => 'Add single or multiple genders to organize and manage product classifications',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.gender.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'update' => [
            'icon' => 'bi bi-gender-ambiguous',
            'title' => 'Update Gender',
            'subtitle' => 'Modify gender information to better manage product classifications',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('admin.gender.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        default => [
            'icon' => 'bi bi-gender-ambiguous',
            'title' => 'Gender Management',
            'subtitle' => 'Manage and organize product genders',
            'actionButtonText' => 'Add Gender',
            'actionButtonUrl' => route('admin.gender.create'),
            'actionButtonIcon' => 'bi bi-plus-circle-fill'
        ]
    };
@endphp

@include('components.dashboard-header.templates.dashboard-header', $headerConfig)

