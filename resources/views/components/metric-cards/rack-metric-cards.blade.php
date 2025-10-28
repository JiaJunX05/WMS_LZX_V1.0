{{-- ==========================================
    Rack管理统计卡片组件
    功能：显示Rack管理相关的统计数据
    参数：
    - $totalRacks: 总货架数
    - $activeRacks: 可用货架数
    - $inactiveRacks: 不可用货架数
    - $racksWithImage: 有图片的货架数
    ========================================== --}}

@php
    $rackStats = [
        [
            'id' => 'total-racks',
            'value' => $totalRacks ?? 0,
            'label' => 'Total Racks',
            'icon' => 'bi bi-box',
            'bg_class' => 'bg-primary'
        ],
        [
            'id' => 'active-racks',
            'value' => $activeRacks ?? 0,
            'label' => 'Available Racks',
            'icon' => 'bi bi-check-circle',
            'bg_class' => 'bg-success'
        ],
        [
            'id' => 'inactive-racks',
            'value' => $inactiveRacks ?? 0,
            'label' => 'Unavailable Racks',
            'icon' => 'bi bi-pause-circle',
            'bg_class' => 'bg-warning'
        ],
        [
            'id' => 'racks-with-image',
            'value' => $racksWithImage ?? 0,
            'label' => 'With Images',
            'icon' => 'bi bi-image',
            'bg_class' => 'bg-info'
        ]
    ];
@endphp

@include('components.metric-cards.templates.metric-cards', [
    'stats' => $rackStats,
    'columns' => 4
])
