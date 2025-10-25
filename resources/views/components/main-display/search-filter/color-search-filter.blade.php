{{-- ==========================================
    Color管理搜索筛选组件
    功能：显示Color搜索和筛选功能
    ========================================== --}}

@php
    $colorFilters = [
        [
            'id' => 'status-filter',
            'label' => 'Filter by Status',
            'allText' => 'All Status',
            'options' => [
                'Available' => 'Available',
                'Unavailable' => 'Unavailable'
            ]
        ]
    ];
@endphp

@include('components.main-display.search-filter.templates.search-filter', [
    'searchPlaceholder' => 'Search by color name, hex, or RGB...',
    'searchLabel' => 'Search Colors',
    'filters' => $colorFilters,
    'clearButtonText' => 'Clear Filters'
])
