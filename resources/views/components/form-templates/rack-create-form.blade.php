{{-- ==========================================
    Rack创建表单组件
    功能：显示Rack创建表单
    ========================================== --}}

@include('components.form-templates.templates.normal-create-form', [
    'formAction' => route('admin.rack.store'),
    'formId' => 'rackForm',
    'entityName' => 'Rack',
    'entityNameLower' => 'rack',
    'fields' => [
        'icon' => 'box',
        'nameLabel' => 'Rack Number',
        'nameField' => 'rack_number',
        'namePlaceholder' => 'Enter rack number',
        'extraFields' => [
            [
                'label' => 'Rack Capacity',
                'name' => 'capacity',
                'type' => 'number',
                'placeholder' => 'Enter rack capacity (default: 50)',
                'required' => false
            ]
        ]
    ],
    'hasImage' => true,
    'hasLocation' => false,
    'hasColorHex' => false
])
