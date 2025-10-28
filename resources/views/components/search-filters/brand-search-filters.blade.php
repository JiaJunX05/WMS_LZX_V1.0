{{-- ==========================================
    Brand管理搜索筛选组件
    功能：显示Brand搜索和筛选功能
    ========================================== --}}

@php
    $brandFilters = [
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
    'searchPlaceholder' => 'Search by brand name...',
    'searchLabel' => 'Search Brands',
    'filters' => $brandFilters,
    'clearButtonText' => 'Clear Filters'
])
