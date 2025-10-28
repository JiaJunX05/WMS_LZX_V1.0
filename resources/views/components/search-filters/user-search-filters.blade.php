{{-- ==========================================
    用户管理搜索筛选组件
    功能：显示用户搜索和筛选功能
    ========================================== --}}

@php
    $userFilters = [
        [
            'id' => 'role-filter',
            'label' => 'Filter by Role',
            'allText' => 'All Roles',
            'options' => [
                'SuperAdmin' => 'Super Admin',
                'Admin' => 'Admin',
                'Staff' => 'Staff'
            ]
        ],
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
    'searchPlaceholder' => 'Search by name, email...',
    'searchLabel' => 'Search Users',
    'filters' => $userFilters,
    'clearButtonText' => 'Clear Filters'
])
