{{-- ==========================================
    Color更新表单组件
    功能：显示Color更新表单
    ========================================== --}}

@include('components.form-templates.templates.normal-update-form', [
    'formAction' => route('admin.color.update', $color->id),
    'formId' => 'updateColorForm',
    'entityName' => 'Color',
    'entityNameLower' => 'color',
    'entity' => $color,
    'fields' => [
        'icon' => 'palette',
        'nameLabel' => 'Color Name',
        'nameField' => 'color_name',
        'namePlaceholder' => 'Enter color name',
        'nameHelp' => 'Enter a unique color name',
        'statusHelp' => 'Choose whether the color can be used for product management'
    ],
    'hasImage' => false,
    'hasLocation' => false,
    'hasColorHex' => true,
    'hasCapacity' => false,
    'hasColorRgb' => true
])
