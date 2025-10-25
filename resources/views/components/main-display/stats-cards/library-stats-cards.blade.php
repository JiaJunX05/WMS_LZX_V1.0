{{-- ==========================================
    Size Library统计卡片组件
    功能：显示Size Library的统计数据
    参数：
    - $totalLibraries: 总库数
    - $activeLibraries: 可用库数
    - $inactiveLibraries: 不可用库数
    - $libraryGroups: 库组数
    ========================================== --}}

@php
    $libraryStats = [
        [
            'id' => 'total-libraries',
            'value' => $totalLibraries ?? 0,
            'label' => 'Total Libraries',
            'icon' => 'bi bi-collection',
            'bg_class' => 'bg-primary'
        ],
        [
            'id' => 'active-libraries',
            'value' => $activeLibraries ?? 0,
            'label' => 'Available Libraries',
            'icon' => 'bi bi-check-circle',
            'bg_class' => 'bg-success'
        ],
        [
            'id' => 'inactive-libraries',
            'value' => $inactiveLibraries ?? 0,
            'label' => 'Unavailable Libraries',
            'icon' => 'bi bi-x-circle',
            'bg_class' => 'bg-danger'
        ],
        [
            'id' => 'library-groups',
            'value' => $libraryGroups ?? ($sizeLibraries ? count($sizeLibraries->groupBy('category_id')) : 0),
            'label' => 'Total Groups',
            'icon' => 'bi bi-tags',
            'bg_class' => 'bg-info'
        ]
    ];
@endphp

@include('components.main-display.stats-cards.templates.stats-cards', ['stats' => $libraryStats, 'columns' => 4])
