{{-- ==========================================
    Location更新表单组件
    功能：使用通用更新表单模板显示位置更新信息
    ========================================== --}}

@include('components.form-templates.templates.group-update-form', [
    'formAction' => route('admin.location.update', $location->id),
    'formId' => 'updateLocationForm',
    'entityName' => 'Location',
    'entityNameLower' => 'location',
    'entity' => $location,
    'currentInfoTitle' => 'Current Location',
    'currentInfoIcon' => 'bi-info-circle-fill',
    'updateTitle' => 'Update Storage Location',
    'updateIcon' => 'bi-pencil-square',
    'updateDescription' => 'Modify location configuration below.',
    'cancelRoute' => 'admin.location.index',
    'configFields' => [
        [
            'icon' => 'bi-geo-alt',
            'label' => 'Zone',
            'value' => $location->zone->zone_name ?? 'N/A'
        ],
        [
            'icon' => 'bi-box-seam',
            'label' => 'Rack',
            'value' => $location->rack->rack_number ?? 'N/A'
        ],
        [
            'icon' => 'bi-toggle-on',
            'label' => 'Status',
            'value' => $location->location_status ?? 'N/A'
        ]
    ],
    'formFields' => [
        [
            'type' => 'select',
            'name' => 'zone_id',
            'label' => 'Zone',
            'icon' => 'bi-geo-alt',
            'placeholder' => 'Select zone',
            'required' => true,
            'options' => collect($zones)->map(function($zone) use ($location) {
                return [
                    'value' => $zone->id,
                    'text' => $zone->zone_name,
                    'selected' => $location->zone_id == $zone->id
                ];
            })->toArray(),
            'help' => 'Choose the zone for this location'
        ],
        [
            'type' => 'select',
            'name' => 'rack_id',
            'label' => 'Rack',
            'icon' => 'bi-box-seam',
            'placeholder' => 'Select rack',
            'required' => true,
            'options' => collect($racks)->map(function($rack) use ($location) {
                return [
                    'value' => $rack->id,
                    'text' => $rack->rack_number,
                    'selected' => $location->rack_id == $rack->id
                ];
            })->toArray(),
            'help' => 'Choose the rack for this location'
        ]
    ],
    'statusField' => [
        'name' => 'location_status',
        'label' => 'Location Status',
        'currentStatus' => $location->location_status ?? 'Available',
        'availableText' => 'Location is active and can be used',
        'unavailableText' => 'Location is inactive and cannot be used',
        'help' => 'Choose whether the location can be used for stock management'
    ],
    'submitButtonText' => 'Update Location Information'
])
