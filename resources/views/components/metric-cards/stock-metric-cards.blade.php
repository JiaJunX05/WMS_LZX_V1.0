{{-- ==========================================
    Stock History统计卡片组件
    功能：显示Stock历史统计信息
    ========================================== --}}

@php
    $stockHistoryStats = [
        [
            'id' => 'totalStockIn',
            'value' => 0,
            'label' => 'Total Stock In',
            'icon' => 'bi bi-arrow-up-circle-fill',
            'bg_class' => 'bg-success'
        ],
        [
            'id' => 'totalStockOut',
            'value' => 0,
            'label' => 'Total Stock Out',
            'icon' => 'bi bi-arrow-down-circle-fill',
            'bg_class' => 'bg-danger'
        ],
        [
            'id' => 'netChange',
            'value' => 0,
            'label' => 'Net Change',
            'icon' => 'bi bi-graph-up',
            'bg_class' => 'bg-primary'
        ],
        [
            'id' => 'totalMovements',
            'value' => 0,
            'label' => 'Total Movements',
            'icon' => 'bi bi-activity',
            'bg_class' => 'bg-info'
        ],
        [
            'id' => 'currentTotalStock',
            'value' => 0,
            'label' => 'Current Stock',
            'icon' => 'bi bi-box-seam',
            'bg_class' => 'bg-secondary'
        ],
        [
            'id' => 'lowStockCount',
            'value' => 0,
            'label' => 'Low Stock Items',
            'icon' => 'bi bi-exclamation-triangle-fill',
            'bg_class' => 'bg-warning'
        ]
    ];
@endphp

@include('components.metric-cards.templates.metric-cards', [
    'stats' => $stockHistoryStats,
    'columns' => 6
])

