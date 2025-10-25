{{-- ==========================================
    Library创建表单组件
    功能：使用通用创建表单模板创建尺码库
    ========================================== --}}

@include('components.form-templates.templates.group-create-form', [
    'formAction' => route('admin.library.store'),
    'formId' => 'sizeLibraryForm',
    'configFields' => [
        [
            'type' => 'select',
            'id' => 'category_id',
            'name' => 'category_id',
            'label' => 'Category',
            'icon' => 'bi bi-tag',
            'placeholder' => 'Select category',
            'required' => true,
            'options' => collect($categories)->map(function($category) {
                return [
                    'value' => $category->id,
                    'text' => $category->category_name
                ];
            })->toArray()
        ],
        [
            'type' => 'input',
            'id' => 'size_value',
            'name' => 'size_value',
            'label' => 'Size Value',
            'icon' => 'bi bi-rulers',
            'placeholder' => 'Enter size value (e.g., S, M, L, 8, 9, 10)',
            'required' => true,
            'input_type' => 'text'
        ]
    ],
    'quickActions' => [
        [
            'id' => 'addClothingSizes',
            'class' => 'btn-outline-primary',
            'icon' => 'bi bi-shirt',
            'text' => 'Add Clothing Sizes'
        ],
        [
            'id' => 'addShoeSizes',
            'class' => 'btn-outline-warning',
            'icon' => 'bi bi-shoe-prints',
            'text' => 'Add Shoe Sizes'
        ]
    ],
    'managementTitle' => 'Size Library Management',
    'managementIcon' => 'bi bi-rulers',
    'managementDescription' => 'Manage and organize your size values below.',
    'initialMessage' => [
        'title' => 'Ready to Configure Size Library',
        'description' => 'Select category and enter size value on the left and click "Add To List"'
    ],
    'submitButtonText' => 'Create All Size Libraries',
    'addButtonId' => 'addSizeValue',
    'clearButtonId' => 'clearForm',
    'valuesAreaId' => 'sizeValuesArea',
    'valuesListId' => 'sizeValuesList',
    'countBadgeId' => 'sizeValuesCount',
    'submitSectionId' => 'submitSection',
    'sortButtonId' => 'sortSizes'
])
