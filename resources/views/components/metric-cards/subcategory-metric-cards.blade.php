{{-- ==========================================
    Subcategory管理统计卡片组件
    功能：显示Subcategory管理相关的统计数据
    参数：
    - $totalSubcategories: 总子分类数
    - $activeSubcategories: 可用子分类数
    - $inactiveSubcategories: 不可用子分类数
    - $subcategoriesWithImage: 有图片的子分类数
    ========================================== --}}

@php
    $subcategoryStats = [
        [
            'id' => 'total-subcategories',
            'value' => $totalSubcategories ?? 0,
            'label' => 'Total Subcategories',
            'icon' => 'bi bi-tags',
            'bg_class' => 'bg-primary'
        ],
        [
            'id' => 'active-subcategories',
            'value' => $activeSubcategories ?? 0,
            'label' => 'Available Subcategories',
            'icon' => 'bi bi-check-circle',
            'bg_class' => 'bg-success'
        ],
        [
            'id' => 'inactive-subcategories',
            'value' => $inactiveSubcategories ?? 0,
            'label' => 'Unavailable Subcategories',
            'icon' => 'bi bi-pause-circle',
            'bg_class' => 'bg-warning'
        ],
        [
            'id' => 'subcategories-with-image',
            'value' => $subcategoriesWithImage ?? 0,
            'label' => 'With Images',
            'icon' => 'bi bi-image',
            'bg_class' => 'bg-info'
        ]
    ];
@endphp

@include('components.metric-cards.templates.metric-cards', [
    'stats' => $subcategoryStats,
    'columns' => 4
])
