{{-- ==========================================
    Gender管理搜索筛选组件
    功能：显示Gender搜索和筛选功能
    ========================================== --}}

@php
    $genderFilters = [
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
    'searchPlaceholder' => 'Search by gender name...',
    'searchLabel' => 'Search Genders',
    'filters' => $genderFilters,
    'clearButtonText' => 'Clear Filters'
])
