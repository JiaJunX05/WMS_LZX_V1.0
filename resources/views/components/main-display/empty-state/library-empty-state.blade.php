{{-- ==========================================
    Size Library空状态组件
    功能：显示Size Library的空状态提示
    ========================================== --}}

@include('components.main-display.empty-state.templates.empty-state', [
    'icon' => 'bi bi-collection',
    'title' => 'No Size Library Data',
    'description' => 'No size libraries have been created in the system yet',
    'buttonText' => 'Create First Size Library',
    'buttonUrl' => route('admin.library.create'),
    'buttonIcon' => 'bi bi-plus-circle-fill me-2',
    'buttonSize' => 'btn-lg'
])
