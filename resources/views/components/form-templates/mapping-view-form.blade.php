{{-- ==========================================
    Mapping查看表单组件
    功能：使用通用查看表单模板显示分类映射信息
    ========================================== --}}

@include('components.form-templates.templates.group-view-form', [
    'viewTitle' => isset($category) ? 'Mapping Values' : 'View Mapping',
    'viewIcon' => 'bi bi-list-ul',
    'viewDescription' => isset($category) ? 'View all mapping values for this category.' : 'View mapping details below.',
    'totalCount' => isset($category) ? $mappings->count() : null,
    'availableCount' => isset($category) ? $mappings->where('mapping_status', 'Available')->count() : 0,
    'unavailableCount' => isset($category) ? $mappings->where('mapping_status', 'Unavailable')->count() : 0,
    'itemName' => 'mapping',
    'itemNamePlural' => 'mappings'
])
