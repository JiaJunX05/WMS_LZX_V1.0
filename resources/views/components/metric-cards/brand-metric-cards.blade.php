{{-- ==========================================
    Brand管理统计卡片组件
    功能：显示Brand管理相关的统计数据
    参数：
    - $totalBrands: 总品牌数
    - $activeBrands: 可用品牌数
    - $inactiveBrands: 不可用品牌数
    - $brandsWithImage: 有图片的品牌数
    ========================================== --}}

@php
    $brandStats = [
        [
            'id' => 'total-brands',
            'value' => $totalBrands ?? 0,
            'label' => 'Total Brands',
            'icon' => 'bi bi-tag',
            'bg_class' => 'bg-primary'
        ],
        [
            'id' => 'active-brands',
            'value' => $activeBrands ?? 0,
            'label' => 'Available Brands',
            'icon' => 'bi bi-check-circle',
            'bg_class' => 'bg-success'
        ],
        [
            'id' => 'inactive-brands',
            'value' => $inactiveBrands ?? 0,
            'label' => 'Unavailable Brands',
            'icon' => 'bi bi-pause-circle',
            'bg_class' => 'bg-warning'
        ],
        [
            'id' => 'brands-with-image',
            'value' => $brandsWithImage ?? 0,
            'label' => 'With Images',
            'icon' => 'bi bi-image',
            'bg_class' => 'bg-info'
        ]
    ];
@endphp

@include('components.metric-cards.templates.metric-cards', [
    'stats' => $brandStats,
    'columns' => 4
])
