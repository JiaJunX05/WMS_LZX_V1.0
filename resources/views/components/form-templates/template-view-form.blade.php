{{-- ==========================================
    Template查看表单组件
    功能：使用通用查看表单模板显示尺码模板信息
    ========================================== --}}

@include('components.form-templates.templates.group-view-form', [
    'viewTitle' => isset($category) && isset($gender) ? 'Template Values' : 'View Template',
    'viewIcon' => 'bi bi-list-ul',
    'viewDescription' => isset($category) && isset($gender) ? 'View all template values for this category and gender combination.' : 'View template details below.',
    'totalCount' => isset($category) && isset($gender) ? $sizeTemplates->count() : null,
    'availableCount' => isset($category) && isset($gender) ? $sizeTemplates->where('template_status', 'Available')->count() : 0,
    'unavailableCount' => isset($category) && isset($gender) ? $sizeTemplates->where('template_status', 'Unavailable')->count() : 0,
    'itemName' => 'template',
    'itemNamePlural' => 'templates'
])
