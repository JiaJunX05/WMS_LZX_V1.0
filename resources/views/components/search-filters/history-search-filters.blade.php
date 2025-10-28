{{-- ==========================================
    Stock History搜索筛选组件
    功能：显示Stock历史搜索和筛选功能
    ========================================== --}}

@php
    // 主搜索框配置
    $searchPlaceholder = 'Search by product name or SKU...';
    $searchLabel = 'Product';

    // 筛选器配置（只包含下拉菜单和日期）
    $filters = [
        [
            'id' => 'movement-type-filter',
            'label' => 'Movement Type',
            'allText' => 'All Types',
            'options' => [
                'stock_in' => 'Stock In',
                'stock_out' => 'Stock Out',
                'stock_return' => 'Stock Return'
            ]
        ],
        [
            'id' => 'start-date-filter',
            'label' => 'Start Date',
            'type' => 'date'
        ],
        [
            'id' => 'end-date-filter',
            'label' => 'End Date',
            'type' => 'date'
        ]
    ];
@endphp

@include('components.search-filters.templates.search-filters', [
    'searchPlaceholder' => $searchPlaceholder,
    'searchLabel' => $searchLabel,
    'filters' => $filters,
    'clearButtonText' => 'Clear Filters'
])

