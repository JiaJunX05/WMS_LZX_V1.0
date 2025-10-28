{{-- ==========================================
    Mapping统计卡片组件
    功能：显示Category Mapping的统计数据
    参数：
    - $totalMappings: 总映射数
    - $availableCategories: 可用分类数
    - $availableSubcategories: 可用子分类数
    - $mappingGroups: 映射组数
    ========================================== --}}

@php
    $mappingStats = [
        [
            'id' => 'total-mappings',
            'value' => $totalMappings ?? 0,
            'label' => 'Total Mappings',
            'icon' => 'bi bi-diagram-2',
            'bg_class' => 'bg-primary'
        ],
        [
            'id' => 'available-categories',
            'value' => $availableCategories ?? 0,
            'label' => 'Available Categories',
            'icon' => 'bi bi-folder',
            'bg_class' => 'bg-success'
        ],
        [
            'id' => 'available-subcategories',
            'value' => $availableSubcategories ?? 0,
            'label' => 'Available Subcategories',
            'icon' => 'bi bi-folder2',
            'bg_class' => 'bg-info'
        ],
        [
            'id' => 'mapping-groups',
            'value' => $mappingGroups ?? ($mappings ? count($mappings->groupBy('category_id')) : 0),
            'label' => 'Total Groups',
            'icon' => 'bi bi-collection',
            'bg_class' => 'bg-warning'
        ]
    ];
@endphp

@include('components.metric-cards.templates.metric-cards', [
    'stats' => $mappingStats,
    'columns' => 4
])
