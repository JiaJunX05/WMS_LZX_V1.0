{{-- ==========================================
    Location统计卡片组件
    功能：显示Location的统计数据
    参数：
    - $totalLocations: 总位置数
    - $availableZones: 可用区域数
    - $availableRacks: 可用货架数
    - $locationGroups: 位置组数
    ========================================== --}}

@php
    $locationStats = [
        [
            'id' => 'total-locations',
            'value' => $totalLocations ?? 0,
            'label' => 'Total Locations',
            'icon' => 'bi bi-geo-alt',
            'bg_class' => 'bg-primary'
        ],
        [
            'id' => 'available-zones',
            'value' => $availableZones ?? 0,
            'label' => 'Available Zones',
            'icon' => 'bi bi-check-circle',
            'bg_class' => 'bg-success'
        ],
        [
            'id' => 'available-racks',
            'value' => $availableRacks ?? 0,
            'label' => 'Available Racks',
            'icon' => 'bi bi-box',
            'bg_class' => 'bg-info'
        ],
        [
            'id' => 'location-groups',
            'value' => $locationGroups ?? ($locations ? count($locations->groupBy('zone_id')) : 0),
            'label' => 'Location Groups',
            'icon' => 'bi bi-diagram-2',
            'bg_class' => 'bg-warning'
        ]
    ];
@endphp

@include('components.main-display.stats-cards.templates.stats-cards', ['stats' => $locationStats, 'columns' => 4])
