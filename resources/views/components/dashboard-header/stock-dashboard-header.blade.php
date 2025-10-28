{{-- ==========================================
    库存管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard', 'stock_in', 'stock_out', 'stock_return', 'history', 'detail'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';

    // 根据类型设置不同的头部配置
    $headerConfig = match($type) {
        'stock_in' => [
            'icon' => 'bi bi-plus-circle-fill',
            'title' => 'Stock In',
            'subtitle' => 'Scan products to add inventory',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('staff.stock_management'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'stock_out' => [
            'icon' => 'bi bi-dash-circle-fill',
            'title' => 'Stock Out',
            'subtitle' => 'Scan products to remove inventory',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('staff.stock_management'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'stock_return' => [
            'icon' => 'bi bi-arrow-return-left',
            'title' => 'Stock Return',
            'subtitle' => 'Scan products to return inventory',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('staff.stock_management'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'history' => [
            'icon' => 'bi bi-clock-history',
            'title' => 'Stock History',
            'subtitle' => Auth::user()->getAccountRole() === 'Staff' ? 'View your stock movement records' : 'View all stock movement records',
            'actionButtonText' => null,
            'actionButtonUrl' => route('staff.stock_management'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        'detail' => [
            'icon' => 'bi bi-box-seam',
            'title' => 'Stock Detail',
            'subtitle' => 'Product stock information and movement history',
            'subtitleId' => 'product-detail-subtitle',
            'actionButtonText' => 'Back to List',
            'actionButtonUrl' => route('staff.stock_management'),
            'actionButtonIcon' => 'bi bi-arrow-left'
        ],
        default => [
            'icon' => 'bi bi-box-seam-fill',
            'title' => 'Stock Management',
            'subtitle' => 'Manage product inventory movements',
            'customButtonHTML' => ''
        ]
    };

    // 如果是 dashboard 类型，需要生成自定义按钮
    if ($type === 'dashboard' && Auth::user()->getAccountRole() === 'Staff') {
        $headerConfig['customButtonHTML'] = '<div class="col-lg-4 text-lg-end">
            <a href="' . route('staff.stock_in_page') . '" class="btn btn-success me-2">
                <i class="bi bi-plus-circle-fill me-2"></i>Stock In
            </a>
            <a href="' . route('staff.stock_out_page') . '" class="btn btn-danger me-2">
                <i class="bi bi-dash-circle-fill me-2"></i>Stock Out
            </a>
            <a href="' . route('staff.stock_return_page') . '" class="btn btn-warning">
                <i class="bi bi-arrow-return-left me-2"></i>Stock Return
            </a>
        </div>';
    }
@endphp

@include('components.dashboard-header.templates.dashboard-header', $headerConfig)

