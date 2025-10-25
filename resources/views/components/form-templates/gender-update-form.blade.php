{{-- ==========================================
    Gender更新表单组件
    功能：显示Gender更新表单
    ========================================== --}}

@include('components.form-templates.templates.normal-update-form', [
    'formAction' => route('admin.gender.update', $gender->id),
    'formId' => 'updateGenderForm',
    'entityName' => 'Gender',
    'entityNameLower' => 'gender',
    'entity' => $gender,
    'fields' => [
        'icon' => 'person',
        'nameLabel' => 'Gender Name',
        'nameField' => 'gender_name',
        'namePlaceholder' => 'Enter gender name',
        'nameHelp' => 'Enter a unique gender name',
        'statusHelp' => 'Choose whether the gender can be used for product management'
    ],
    'hasImage' => false,
    'hasLocation' => false,
    'hasColorHex' => false,
    'hasCapacity' => false,
    'hasColorRgb' => false
])
