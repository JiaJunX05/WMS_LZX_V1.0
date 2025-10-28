{{-- ==========================================
    產品篩選側邊欄組件
    功能：產品頁面專用的篩選側邊欄
    参数：
    - $categories: 分類數據
    - $subcategories: 子分類數據
    - $brands: 品牌數據
    - $colors: 顏色數據 (可選)
    - $genders: 性別數據 (可選)
    ========================================== --}}

@php
    $filters = [
        [
            'id' => 'category',
            'title' => 'Categories',
            'icon' => 'bi-tags',
            'type' => 'category',
            'expanded' => true,
            'allOption' => [
                'text' => 'All Categories',
                'icon' => 'bi-grid-3x3-gap-fill',
                'count' => $categories->sum('products_count')
            ],
            'options' => $categories->map(function($category) {
                return [
                    'id' => $category->id,
                    'text' => $category->category_name,
                    'image' => $category->category_image,
                    'icon' => 'bi-tag-fill',
                    'count' => $category->products_count ?? '0'
                ];
            })->toArray()
        ],
        [
            'id' => 'subcategory',
            'title' => 'Subcategories',
            'icon' => 'bi-diagram-3',
            'type' => 'checkbox',
            'expanded' => false,
            'options' => $subcategories->map(function($subcategory) {
                return [
                    'id' => $subcategory->id,
                    'text' => $subcategory->subcategory_name,
                    'count' => $subcategory->products_count ?? '0'
                ];
            })->toArray()
        ],
        [
            'id' => 'brand',
            'title' => 'Brands',
            'icon' => 'bi-award',
            'type' => 'checkbox',
            'expanded' => false,
            'options' => $brands->map(function($brand) {
                return [
                    'id' => $brand->id,
                    'text' => $brand->brand_name,
                    'count' => $brand->products_count ?? '0'
                ];
            })->toArray()
        ]
    ];

    // 如果提供了顏色數據，添加顏色篩選
    if(isset($colors) && $colors->isNotEmpty()) {
        $filters[] = [
            'id' => 'color',
            'title' => 'Colors',
            'icon' => 'bi-palette',
            'type' => 'checkbox',
            'expanded' => false,
            'options' => $colors->map(function($color) {
                return [
                    'id' => $color->id,
                    'text' => $color->color_name,
                    'count' => $color->products_count ?? '0'
                ];
            })->toArray()
        ];
    }

    // 如果提供了性別數據，添加性別篩選
    if(isset($genders) && $genders->isNotEmpty()) {
        $filters[] = [
            'id' => 'gender',
            'title' => 'Genders',
            'icon' => 'bi-gender-ambiguous',
            'type' => 'checkbox',
            'expanded' => false,
            'options' => $genders->map(function($gender) {
                return [
                    'id' => $gender->id,
                    'text' => $gender->gender_name,
                    'count' => $gender->products_count ?? '0'
                ];
            })->toArray()
        ];
    }
@endphp

@include('components.dashboard-sidebar.templates.dashboard-sidebar', [
    'filters' => $filters,
    'clearButtonText' => 'Clear All',
    'clearButtonIcon' => 'bi-arrow-clockwise'
])
