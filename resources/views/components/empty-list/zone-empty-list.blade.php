{{-- ==========================================
    Zone空状态组件
    功能：显示Zone的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-grid-3x3-gap',
    'title' => 'No Zone Data',
    'description' => 'No zones have been created in the system yet',
    'buttonText' => 'Create First Zone',
    'buttonUrl' => route('admin.zone.create'),
    'buttonIcon' => 'bi bi-plus-circle-fill me-2',
    'buttonSize' => 'btn-lg'
])

