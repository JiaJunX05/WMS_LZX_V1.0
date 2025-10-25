{{-- ==========================================
    Category管理搜索筛选组件
    功能：显示Category搜索和筛选功能
    ========================================== --}}

@php
    $categoryFilters = [
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
    'searchPlaceholder' => 'Search by category name...',
    'searchLabel' => 'Search Categories',
    'filters' => $categoryFilters,
    'clearButtonText' => 'Clear Filters'
])
