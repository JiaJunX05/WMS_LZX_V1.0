{{-- ==========================================
    Subcategory创建表单组件
    功能：显示Subcategory创建表单
    ========================================== --}}

@include('components.form-templates.templates.normal-create-form', [
    'formAction' => route('admin.subcategory.store'),
    'formId' => 'subcategoryForm',
    'entityName' => 'Subcategory',
    'entityNameLower' => 'subcategory',
    'fields' => [
        'icon' => 'collection'
    ],
    'hasImage' => true,
    'hasLocation' => false,
    'hasColorHex' => false
])
