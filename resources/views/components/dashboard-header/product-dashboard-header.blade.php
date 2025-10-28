{{-- ==========================================
    产品管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'create', 'update', 'view'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';

    $headerConfig = match($type) {
        'create' => [
            'icon' => 'bi bi-plus-circle-fill',
            'title' => 'Create Product',
            'subtitle' => 'Add a new product to your inventory system',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('product.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'update' => [
            'icon' => 'bi bi-pencil-fill',
            'title' => 'Update Product',
            'subtitle' => 'Modify existing product information in your inventory system',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('product.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'view' => [
            'icon' => 'bi bi-eye-fill',
            'title' => 'View Product',
            'subtitle' => 'View detailed product information in your inventory system',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('product.index'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        default => [
            'icon' => 'bi bi-box-seam',
            'title' => 'Product Management',
            'subtitle' => 'Manage products and inventory',
            'actionButtonText' => Auth::user()->getAccountRole() === 'Admin' ? 'Create Product' : null,
            'actionButtonUrl' => route('product.create'),
            'actionButtonIcon' => 'bi bi-plus-circle-fill'
        ]
    };
@endphp

@include('components.dashboard-header.templates.dashboard-header', $headerConfig)

