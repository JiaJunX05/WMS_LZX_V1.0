{{-- ==========================================
    Zone创建表单组件
    功能：显示Zone创建表单
    ========================================== --}}

@include('components.form-templates.templates.normal-create-form', [
    'formAction' => route('admin.zone.store'),
    'formId' => 'zoneForm',
    'entityName' => 'Zone',
    'entityNameLower' => 'zone',
    'fields' => [
        'icon' => 'geo-alt'
    ],
    'hasImage' => true,
    'hasLocation' => true,
    'hasColorHex' => false
])
