{{-- ==========================================
    Location查看表单组件
    功能：使用通用查看表单模板显示位置信息
    ========================================== --}}

@include('components.form-templates.templates.group-view-form', [
    'viewTitle' => isset($zone) ? 'Location Values' : 'View Location',
    'viewIcon' => 'bi bi-list-ul',
    'viewDescription' => isset($zone) ? 'View all location values for this zone.' : 'View location details below.',
    'totalCount' => isset($zone) ? $locations->count() : null,
    'availableCount' => isset($zone) ? $locations->where('location_status', 'Available')->count() : 0,
    'unavailableCount' => isset($zone) ? $locations->where('location_status', 'Unavailable')->count() : 0,
    'itemName' => 'location',
    'itemNamePlural' => 'locations'
])
