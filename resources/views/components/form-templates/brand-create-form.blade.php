{{-- ==========================================
    Brand创建表单组件
    功能：显示Brand创建表单
    ========================================== --}}

@include('components.form-templates.templates.normal-create-form', [
    'formAction' => route('admin.brand.store'),
    'formId' => 'brandForm',
    'entityName' => 'Brand',
    'entityNameLower' => 'brand',
    'fields' => [
        'icon' => 'tag'
    ],
    'hasImage' => true,
    'hasLocation' => false,
    'hasColorHex' => false
])
