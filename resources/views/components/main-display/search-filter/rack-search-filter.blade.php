{{-- ==========================================
    Rack管理搜索筛选组件
    功能：显示Rack搜索和筛选功能
    ========================================== --}}

@php
    $rackFilters = [
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
    'searchPlaceholder' => 'Search by rack number...',
    'searchLabel' => 'Search Racks',
    'filters' => $rackFilters,
    'clearButtonText' => 'Clear Filters'
])
