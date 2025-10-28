{{-- ==========================================
    Subcategory管理搜索筛选组件
    功能：显示Subcategory搜索和筛选功能
    ========================================== --}}

@php
    $subcategoryFilters = [
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
    'searchPlaceholder' => 'Search by subcategory name...',
    'searchLabel' => 'Search Subcategories',
    'filters' => $subcategoryFilters,
    'clearButtonText' => 'Clear Filters'
])
