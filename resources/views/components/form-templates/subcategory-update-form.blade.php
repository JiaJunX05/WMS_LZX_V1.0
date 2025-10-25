{{-- ==========================================
    Subcategory更新表单组件
    功能：显示Subcategory更新表单
    ========================================== --}}

@include('components.form-templates.templates.normal-update-form', [
    'formAction' => route('admin.subcategory.update', $subcategory->id),
    'formId' => 'updateSubcategoryForm',
    'entityName' => 'Subcategory',
    'entityNameLower' => 'subcategory',
    'entity' => $subcategory,
    'fields' => [
        'icon' => 'collection',
        'nameLabel' => 'Subcategory Name',
        'nameField' => 'subcategory_name',
        'namePlaceholder' => 'Enter subcategory name',
        'nameHelp' => 'Enter a unique subcategory name',
        'statusHelp' => 'Choose whether the subcategory can be used for product organization'
    ],
    'hasImage' => true,
    'hasLocation' => false,
    'hasColorHex' => false,
    'hasCapacity' => false,
    'hasColorRgb' => false
])
