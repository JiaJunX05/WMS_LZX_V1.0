{{-- ==========================================
    Color创建表单组件
    功能：显示Color创建表单
    ========================================== --}}

@include('components.form-templates.templates.normal-create-form', [
    'formAction' => route('admin.color.store'),
    'formId' => 'colorForm',
    'entityName' => 'Color',
    'entityNameLower' => 'color',
    'fields' => [
        'icon' => 'palette'
    ],
    'hasImage' => false,
    'hasLocation' => false,
    'hasColorHex' => true
])
