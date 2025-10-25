{{-- ==========================================
    Color管理统计卡片组件
    功能：显示Zone管理相关的统计数据
    参数：
    - $totalColors: 总颜色数
    - $activeColors: 可用颜色数
    - $inactiveColors: 不可用颜色数
    - $hexColors: 十六进制颜色数
    ========================================== --}}

@php
    $colorStats = [
        [
            'id' => 'total-colors',
            'value' => $totalColors ?? 0,
            'label' => 'Total Colors',
            'icon' => 'bi bi-palette',
            'bg_class' => 'bg-primary'
        ],
        [
            'id' => 'active-colors',
            'value' => $activeColors ?? 0,
            'label' => 'Available Colors',
            'icon' => 'bi bi-check-circle',
            'bg_class' => 'bg-success'
        ],
        [
            'id' => 'inactive-colors',
            'value' => $inactiveColors ?? 0,
            'label' => 'Unavailable Colors',
            'icon' => 'bi bi-pause-circle',
            'bg_class' => 'bg-warning'
        ],
        [
            'id' => 'hex-colors',
            'value' => $hexColors ?? 0,
            'label' => 'Hex Colors',
            'icon' => 'bi bi-hash',
            'bg_class' => 'bg-info'
        ]
    ];
@endphp

@include('components.main-display.stats-cards.templates.stats-cards', ['stats' => $colorStats, 'columns' => 4])
