{{-- ==========================================
    Category管理统计卡片组件
    功能：显示Category管理相关的统计数据
    参数：
    - $totalCategories: 总分类数
    - $activeCategories: 可用分类数
    - $inactiveCategories: 不可用分类数
    - $categoriesWithImage: 有图片的分类数
    ========================================== --}}

@php
    $categoryStats = [
        [
            'id' => 'total-categories',
            'value' => $totalCategories ?? 0,
            'label' => 'Total Categories',
            'icon' => 'bi bi-tags',
            'bg_class' => 'bg-primary'
        ],
        [
            'id' => 'active-categories',
            'value' => $activeCategories ?? 0,
            'label' => 'Available Categories',
            'icon' => 'bi bi-check-circle',
            'bg_class' => 'bg-success'
        ],
        [
            'id' => 'inactive-categories',
            'value' => $inactiveCategories ?? 0,
            'label' => 'Unavailable Categories',
            'icon' => 'bi bi-pause-circle',
            'bg_class' => 'bg-warning'
        ],
        [
            'id' => 'categories-with-image',
            'value' => $categoriesWithImage ?? 0,
            'label' => 'With Images',
            'icon' => 'bi bi-image',
            'bg_class' => 'bg-info'
        ]
    ];
@endphp

@include('components.main-display.stats-cards.templates.stats-cards', ['stats' => $categoryStats, 'columns' => 4])
