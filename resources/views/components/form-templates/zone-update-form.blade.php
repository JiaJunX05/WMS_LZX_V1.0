{{-- ==========================================
    Zone更新表单组件
    功能：显示Zone更新表单
    ========================================== --}}

@include('components.form-templates.templates.normal-update-form', [
    'formAction' => route('admin.zone.update', $zone->id),
    'formId' => 'updateZoneForm',
    'entityName' => 'Zone',
    'entityNameLower' => 'zone',
    'entity' => $zone,
    'fields' => [
        'icon' => 'geo-alt',
        'nameLabel' => 'Zone Name',
        'nameField' => 'zone_name',
        'namePlaceholder' => 'Enter zone name',
        'nameHelp' => 'Enter a unique zone name',
        'statusHelp' => 'Choose whether the zone can be used for stock management'
    ],
    'hasImage' => true,
    'hasLocation' => true,
    'hasColorHex' => false,
    'hasCapacity' => false,
    'hasColorRgb' => false
])
