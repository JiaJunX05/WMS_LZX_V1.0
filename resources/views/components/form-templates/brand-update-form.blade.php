{{-- ==========================================
    Brand更新表单组件
    功能：显示Brand更新表单
    ========================================== --}}

@include('components.form-templates.templates.normal-update-form', [
    'formAction' => route('admin.brand.update', $brand->id),
    'formId' => 'updateBrandForm',
    'entityName' => 'Brand',
    'entityNameLower' => 'brand',
    'entity' => $brand,
    'fields' => [
        'icon' => 'tag',
        'nameLabel' => 'Brand Name',
        'nameField' => 'brand_name',
        'namePlaceholder' => 'Enter brand name',
        'nameHelp' => 'Enter a unique brand name',
        'statusHelp' => 'Choose whether the brand can be used for product management'
    ],
    'hasImage' => true,
    'hasLocation' => false,
    'hasColorHex' => false,
    'hasCapacity' => false,
    'hasColorRgb' => false
])
