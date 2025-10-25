{{-- ==========================================
    Library更新表单组件
    功能：使用通用更新表单模板显示尺码库更新信息
    ========================================== --}}

@include('components.form-templates.templates.group-update-form', [
    'formAction' => route('admin.library.update', $sizeLibrary->id),
    'formId' => 'updateSizeLibraryForm',
    'entityName' => 'Size Library',
    'entityNameLower' => 'sizeLibrary',
    'entity' => $sizeLibrary,
    'currentInfoTitle' => 'Current Size Library',
    'currentInfoIcon' => 'bi-info-circle-fill',
    'updateTitle' => 'Update Size Library',
    'updateIcon' => 'bi-pencil-square',
    'updateDescription' => 'Modify size library configuration below.',
    'cancelRoute' => 'admin.library.index',
    'configFields' => [
        [
            'icon' => 'bi-tag',
            'label' => 'Category',
            'value' => $sizeLibrary->category->category_name ?? 'N/A'
        ],
        [
            'icon' => 'bi-rulers',
            'label' => 'Size',
            'value' => $sizeLibrary->size_value
        ],
        [
            'icon' => 'bi-toggle-on',
            'label' => 'Status',
            'value' => $sizeLibrary->size_status
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
            'options' => collect($categories)->map(function($category) use ($sizeLibrary) {
                return [
                    'value' => $category->id,
                    'text' => $category->category_name,
                    'selected' => $sizeLibrary->category_id == $category->id
                ];
            })->toArray(),
            'help' => 'Choose the category for this size library'
        ],
        [
            'type' => 'input',
            'name' => 'size_value',
            'label' => 'Size Value',
            'icon' => 'bi-rulers',
            'input_type' => 'text',
            'value' => $sizeLibrary->size_value,
            'placeholder' => 'Enter size value',
            'required' => true,
            'help' => 'Enter the size value for this library entry'
        ]
    ],
    'statusField' => [
        'name' => 'size_status',
        'label' => 'Size Status',
        'currentStatus' => $sizeLibrary->size_status ?? 'Available',
        'availableText' => 'Size is active and can be used',
        'unavailableText' => 'Size is inactive and cannot be used',
        'help' => 'Choose whether the size can be used for product management'
    ],
    'submitButtonText' => 'Update Size Library Information'
])
