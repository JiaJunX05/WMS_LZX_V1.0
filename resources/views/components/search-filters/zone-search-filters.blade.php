{{-- ==========================================
    Zone管理搜索筛选组件
    功能：显示Zone搜索和筛选功能
    ========================================== --}}

@php
    $zoneFilters = [
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

@include('components.search-filters.templates.search-filters', [
    'searchPlaceholder' => 'Search by zone name or location...',
    'searchLabel' => 'Search Zones',
    'filters' => $zoneFilters,
    'clearButtonText' => 'Clear Filters'
])
