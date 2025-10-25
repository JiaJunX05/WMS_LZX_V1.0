{{-- ==========================================
    Library查看表单组件
    功能：使用通用查看表单模板显示尺码库信息
    ========================================== --}}

@include('components.form-templates.templates.group-view-form', [
    'viewTitle' => isset($category) ? 'Size Values' : 'View Size Library',
    'viewIcon' => 'bi bi-list-ul',
    'viewDescription' => isset($category) ? 'View all size values for this category.' : 'View size library details below.',
    'totalCount' => isset($category) ? $sizeLibraries->count() : null,
    'availableCount' => isset($category) ? $sizeLibraries->where('size_status', 'Available')->count() : 0,
    'unavailableCount' => isset($category) ? $sizeLibraries->where('size_status', 'Unavailable')->count() : 0,
    'itemName' => 'size',
    'itemNamePlural' => 'sizes'
])
