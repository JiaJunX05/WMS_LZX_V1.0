{{-- ==========================================
    Mapping创建表单组件
    功能：使用通用创建表单模板创建分类映射
    ========================================== --}}

@include('components.form-templates.templates.group-create-form', [
    'formAction' => route('admin.mapping.store'),
    'formId' => 'mappingForm',
    'configFields' => [
        [
            'type' => 'select',
            'id' => 'category_id',
            'name' => 'category_id',
            'label' => 'Category',
            'icon' => 'bi bi-folder',
            'placeholder' => 'Select category',
            'required' => true,
            'options' => collect($categories)->map(function($category) {
                return [
                    'value' => $category->id,
                    'text' => strtoupper($category->category_name),
                    'disabled' => $category->category_status === 'Unavailable',
                    'data_status' => $category->category_status
                ];
            })->toArray()
        ],
        [
            'type' => 'select',
            'id' => 'subcategory_id',
            'name' => 'subcategory_id',
            'label' => 'Subcategory',
            'icon' => 'bi bi-folder-plus',
            'placeholder' => 'Select subcategory',
            'required' => true,
            'options' => collect($subcategories)->map(function($subcategory) {
                return [
                    'value' => $subcategory->id,
                    'text' => strtoupper($subcategory->subcategory_name),
                    'disabled' => $subcategory->subcategory_status === 'Unavailable',
                    'data_status' => $subcategory->subcategory_status
                ];
            })->toArray()
        ]
    ],
    'managementTitle' => 'Mapping Management',
    'managementIcon' => 'bi bi-tags',
    'managementDescription' => 'Manage and organize your mappings below.',
    'initialMessage' => [
        'title' => 'Ready to Configure Mappings',
        'description' => 'Select category and subcategory on the left and click "Add To List"'
    ],
    'submitButtonText' => 'Create All Mappings',
    'addButtonId' => 'addMapping',
    'clearButtonId' => 'clearForm',
    'valuesAreaId' => 'mappingValuesArea',
    'valuesListId' => 'mappingValuesList',
    'countBadgeId' => 'mappingValuesCount',
    'submitSectionId' => 'submitSection',
    'sortButtonId' => 'sortMappings'
])
