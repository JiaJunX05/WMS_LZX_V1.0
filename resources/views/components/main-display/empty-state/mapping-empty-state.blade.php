{{-- ==========================================
    Mapping空状态组件
    功能：显示Category Mapping的空状态提示
    ========================================== --}}

@include('components.main-display.empty-state.templates.empty-state', [
    'icon' => 'bi bi-diagram-2',
    'title' => 'No Category Mapping Data',
    'description' => 'No category mappings have been created in the system yet',
    'buttonText' => 'Create First Mapping',
    'buttonUrl' => route('admin.mapping.create'),
    'buttonIcon' => 'bi bi-plus-circle me-2',
    'buttonSize' => ''
])
