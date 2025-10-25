{{-- ==========================================
    Mapping更新表单组件
    功能：使用通用更新表单模板显示分类映射更新信息
    ========================================== --}}

@include('components.form-templates.templates.group-update-form', [
    'formAction' => route('admin.mapping.update', $mapping->id),
    'formId' => 'updateMappingForm',
    'entityName' => 'Mapping',
    'entityNameLower' => 'mapping',
    'entity' => $mapping,
    'currentInfoTitle' => 'Current Mapping',
    'currentInfoIcon' => 'bi-info-circle-fill',
    'updateTitle' => 'Update Category Mapping',
    'updateIcon' => 'bi-pencil-square',
    'updateDescription' => 'Modify mapping configuration below.',
    'cancelRoute' => 'admin.mapping.index',
    'configFields' => [
        [
            'icon' => 'bi-tag',
            'label' => 'Category',
            'value' => $mapping->category->category_name ?? 'N/A'
        ],
        [
            'icon' => 'bi-tags',
            'label' => 'Subcategory',
            'value' => $mapping->subcategory->subcategory_name ?? 'N/A'
        ],
        [
            'icon' => 'bi-toggle-on',
            'label' => 'Status',
            'value' => $mapping->mapping_status ?? 'N/A'
        ]
    ],
    'formFields' => [
        [
            'type' => 'select',
            'name' => 'category_id',
            'label' => 'Category',
            'icon' => 'bi-tag',
            'placeholder' => 'Select category',
            'required' => true,
            'options' => collect($categories)->map(function($category) use ($mapping) {
                return [
                    'value' => $category->id,
                    'text' => $category->category_name,
                    'selected' => $mapping->category_id == $category->id
                ];
            })->toArray(),
            'help' => 'Choose the category for this mapping'
        ],
        [
            'type' => 'select',
            'name' => 'subcategory_id',
            'label' => 'Subcategory',
            'icon' => 'bi-tags',
            'placeholder' => 'Select subcategory',
            'required' => true,
            'options' => collect($subcategories)->map(function($subcategory) use ($mapping) {
                return [
                    'value' => $subcategory->id,
                    'text' => $subcategory->subcategory_name,
                    'selected' => $mapping->subcategory_id == $subcategory->id
                ];
            })->toArray(),
            'help' => 'Choose the subcategory for this mapping'
        ]
    ],
    'statusField' => [
        'name' => 'mapping_status',
        'label' => 'Mapping Status',
        'currentStatus' => $mapping->mapping_status ?? 'Available',
        'availableText' => 'Mapping is active and can be used',
        'unavailableText' => 'Mapping is inactive and cannot be used',
        'help' => 'Choose whether the mapping can be used for product management'
    ],
    'submitButtonText' => 'Update Mapping Information'
])
