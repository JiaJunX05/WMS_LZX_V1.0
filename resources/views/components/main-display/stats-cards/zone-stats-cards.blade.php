{{-- ==========================================
    Zone管理统计卡片组件
    功能：显示Zone管理相关的统计数据
    参数：
    - $totalZones: 总区域数
    - $activeZones: 可用区域数
    - $inactiveZones: 不可用区域数
    - $zonesWithImage: 有图片的区域数
    ========================================== --}}

@php
    $zoneStats = [
        [
            'id' => 'total-zones',
            'value' => $totalZones ?? 0,
            'label' => 'Total Zones',
            'icon' => 'bi bi-geo-alt',
            'bg_class' => 'bg-primary'
        ],
        [
            'id' => 'active-zones',
            'value' => $activeZones ?? 0,
            'label' => 'Available Zones',
            'icon' => 'bi bi-check-circle',
            'bg_class' => 'bg-success'
        ],
        [
            'id' => 'inactive-zones',
            'value' => $inactiveZones ?? 0,
            'label' => 'Unavailable Zones',
            'icon' => 'bi bi-pause-circle',
            'bg_class' => 'bg-warning'
        ],
        [
            'id' => 'zones-with-image',
            'value' => $zonesWithImage ?? 0,
            'label' => 'With Images',
            'icon' => 'bi bi-image',
            'bg_class' => 'bg-info'
        ]
    ];
@endphp

@include('components.main-display.stats-cards.templates.stats-cards', ['stats' => $zoneStats, 'columns' => 4])
