{{-- ==========================================
    Rack更新表单组件
    功能：显示Rack更新表单
    ========================================== --}}

@include('components.form-templates.templates.normal-update-form', [
    'formAction' => route('admin.rack.update', $rack->id),
    'formId' => 'updateRackForm',
    'entityName' => 'Rack',
    'entityNameLower' => 'rack',
    'entity' => $rack,
    'fields' => [
        'icon' => 'hash',
        'nameLabel' => 'Rack Number',
        'nameField' => 'rack_number',
        'namePlaceholder' => 'Enter rack number',
        'nameHelp' => 'Enter a unique rack number',
        'statusHelp' => 'Choose whether the rack can be used for stock management'
    ],
    'hasImage' => true,
    'hasLocation' => false,
    'hasColorHex' => false,
    'hasCapacity' => true,
    'hasColorRgb' => false
])
