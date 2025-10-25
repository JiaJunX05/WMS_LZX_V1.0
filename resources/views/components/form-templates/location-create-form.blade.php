{{-- ==========================================
    Location创建表单组件
    功能：使用通用创建表单模板创建位置
    ========================================== --}}

@include('components.form-templates.templates.group-create-form', [
    'formAction' => route('admin.location.store'),
    'formId' => 'locationForm',
    'configFields' => [
        [
            'type' => 'select',
            'id' => 'zone_id',
            'name' => 'zone_id',
            'label' => 'Zone',
            'icon' => 'bi bi-diagram-3',
            'placeholder' => 'Select zone',
            'required' => true,
            'options' => collect($zones)->map(function($zone) {
                return [
                    'value' => $zone->id,
                    'text' => strtoupper($zone->zone_name),
                    'disabled' => $zone->zone_status === 'Unavailable',
                    'data_status' => $zone->zone_status
                ];
            })->toArray()
        ],
        [
            'type' => 'select',
            'id' => 'rack_id',
            'name' => 'rack_id',
            'label' => 'Rack',
            'icon' => 'bi bi-box-seam',
            'placeholder' => 'Select rack',
            'required' => true,
            'options' => collect($racks)->map(function($rack) {
                return [
                    'value' => $rack->id,
                    'text' => strtoupper($rack->rack_number),
                    'disabled' => $rack->rack_status === 'Unavailable',
                    'data_status' => $rack->rack_status
                ];
            })->toArray()
        ]
    ],
    'managementTitle' => 'Location Management',
    'managementIcon' => 'bi bi-geo-alt',
    'managementDescription' => 'Manage and organize your locations below.',
    'initialMessage' => [
        'title' => 'Ready to Configure Locations',
        'description' => 'Select zone and rack on the left and click "Add To List"'
    ],
    'submitButtonText' => 'Create All Locations',
    'addButtonId' => 'addLocation',
    'clearButtonId' => 'clearForm',
    'valuesAreaId' => 'locationValuesArea',
    'valuesListId' => 'locationValuesList',
    'countBadgeId' => 'locationValuesCount',
    'submitSectionId' => 'submitSection',
    'sortButtonId' => 'sortLocations'
])
