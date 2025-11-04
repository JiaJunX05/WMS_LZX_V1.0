{{-- ==========================================
    Template更新表单组件
    功能：使用通用更新表单模板显示尺码模板更新信息
    ========================================== --}}

@include('components.form-templates.templates.group-update-form', [
    'formAction' => route('admin.template.update', $sizeTemplate->id),
    'formId' => 'updateTemplateForm',
    'entityName' => 'Template',
    'entityNameLower' => 'template',
    'entity' => $sizeTemplate,
    'currentInfoTitle' => 'Current Template',
    'currentInfoIcon' => 'bi-info-circle-fill',
    'updateTitle' => 'Update Template',
    'updateIcon' => 'bi-pencil-square',
    'updateDescription' => 'Modify template configuration below.',
    'cancelRoute' => 'admin.template.index',
    'configFields' => [
        [
            'icon' => 'bi-tag',
            'label' => 'Category',
            'value' => $sizeTemplate->category->category_name ?? 'N/A'
        ],
        [
            'icon' => 'bi-person',
            'label' => 'Gender',
            'value' => $sizeTemplate->gender ?? 'N/A'
        ],
        [
            'icon' => 'bi-rulers',
            'label' => 'Size',
            'value' => $sizeTemplate->sizeLibrary->size_value ?? 'N/A'
        ],
        [
            'icon' => 'bi-toggle-on',
            'label' => 'Status',
            'value' => $sizeTemplate->template_status ?? 'N/A'
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
            'options' => collect($categories)->map(function($category) use ($sizeTemplate) {
                return [
                    'value' => $category->id,
                    'text' => $category->category_name,
                    'selected' => $sizeTemplate->category_id == $category->id
                ];
            })->toArray(),
            'help' => 'Choose the category for this template'
        ],
        [
            'type' => 'select',
            'name' => 'gender',
            'label' => 'Gender',
            'icon' => 'bi-person',
            'placeholder' => 'Select gender',
            'required' => true,
            'options' => [
                ['value' => 'Men', 'text' => 'Men', 'selected' => $sizeTemplate->gender == 'Men'],
                ['value' => 'Women', 'text' => 'Women', 'selected' => $sizeTemplate->gender == 'Women'],
                ['value' => 'Kids', 'text' => 'Kids', 'selected' => $sizeTemplate->gender == 'Kids'],
                ['value' => 'Unisex', 'text' => 'Unisex', 'selected' => $sizeTemplate->gender == 'Unisex']
            ],
            'help' => 'Choose the gender for this template'
        ],
        [
            'type' => 'select',
            'name' => 'size_library_id',
            'label' => 'Size Library',
            'icon' => 'bi-rulers',
            'placeholder' => 'Select size library',
            'required' => true,
            'options' => collect($sizeLibraries)->map(function($sizeLibrary) use ($sizeTemplate) {
                return [
                    'value' => $sizeLibrary->id,
                    'text' => $sizeLibrary->size_value,
                    'selected' => $sizeTemplate->size_library_id == $sizeLibrary->id
                ];
            })->toArray(),
            'help' => 'Select the size library for this template based on category and gender'
        ]
    ],
    'statusField' => [
        'name' => 'template_status',
        'label' => 'Template Status',
        'currentStatus' => $sizeTemplate->template_status ?? 'Available',
        'availableText' => 'Template is active and can be used',
        'unavailableText' => 'Template is inactive and cannot be used',
        'help' => 'Choose whether the template can be used for product management'
    ],
    'submitButtonText' => 'Update Template Information'
])
