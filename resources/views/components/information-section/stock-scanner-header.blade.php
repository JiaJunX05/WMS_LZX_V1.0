{{-- ==========================================
    Stock扫描器头部组件
    功能：根据类型显示不同的扫描器
    参数：$type - 'stock_in', 'stock_out', 'stock_return'
    ========================================== --}}

@php
    $type = $type ?? 'stock_in';

    // 根据类型设置不同的样式
    $styles = match($type) {
        'stock_in' => [
            'bgClass' => 'bg-success',
            'iconColor' => 'text-success',
            'buttonIcon' => 'bi-check-circle text-success'
        ],
        'stock_out' => [
            'bgClass' => 'bg-danger',
            'iconColor' => 'text-danger',
            'buttonIcon' => 'bi-check-circle text-danger'
        ],
        'stock_return' => [
            'bgClass' => 'bg-warning text-dark',
            'iconColor' => 'text-warning',
            'buttonIcon' => 'bi-check-circle text-warning'
        ],
        default => [
            'bgClass' => 'bg-primary',
            'iconColor' => 'text-primary',
            'buttonIcon' => 'bi-check-circle text-primary'
        ]
    };
@endphp

@include('components.information-section.templates.scanner-section', $styles)

