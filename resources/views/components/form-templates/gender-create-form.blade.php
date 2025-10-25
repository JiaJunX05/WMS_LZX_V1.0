{{-- ==========================================
    Gender创建表单组件
    功能：显示Gender创建表单
    ========================================== --}}

@include('components.form-templates.templates.normal-create-form', [
    'formAction' => route('admin.gender.store'),
    'formId' => 'genderForm',
    'entityName' => 'Gender',
    'entityNameLower' => 'gender',
    'fields' => [
        'icon' => 'person'
    ],
    'hasImage' => false,
    'hasLocation' => false,
    'hasColorHex' => false
])
