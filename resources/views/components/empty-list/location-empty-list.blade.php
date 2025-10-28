{{-- ==========================================
    Location空状态组件
    功能：显示Location的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-geo-alt',
    'title' => 'No Location Data',
    'description' => 'No storage locations have been created in the system yet',
    'buttonText' => 'Create First Location',
    'buttonUrl' => route('admin.location.create'),
    'buttonIcon' => 'bi bi-plus-circle-fill me-2',
    'buttonSize' => 'btn-lg'
])
