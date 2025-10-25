{{-- ==========================================
    Template空状态组件
    功能：显示Size Template的空状态提示
    ========================================== --}}

@include('components.main-display.empty-state.templates.empty-state', [
    'icon' => 'bi bi-collection',
    'title' => 'No Size Template Data',
    'description' => 'No size templates have been created in the system yet',
    'buttonText' => 'Create First Size Template',
    'buttonUrl' => route('admin.template.create'),
    'buttonIcon' => 'bi bi-plus-circle-fill me-2',
    'buttonSize' => 'btn-lg'
])
