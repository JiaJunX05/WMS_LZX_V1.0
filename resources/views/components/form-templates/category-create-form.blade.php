{{-- ==========================================
    Category创建表单组件
    功能：显示Category创建表单
    ========================================== --}}

@include('components.form-templates.templates.normal-create-form', [
    'formAction' => route('admin.category.store'),
    'formId' => 'categoryForm',
    'entityName' => 'Category',
    'entityNameLower' => 'category',
    'fields' => [
        'icon' => 'tags'
    ],
    'hasImage' => true,
    'hasLocation' => false,
    'hasColorHex' => false
])
