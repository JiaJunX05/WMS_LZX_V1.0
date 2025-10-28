{{-- ==========================================
    Color空状态组件
    功能：显示Color的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-palette',
    'title' => 'No Color Data',
    'description' => 'No colors have been created in the system yet',
    'buttonText' => 'Create First Color',
    'buttonUrl' => route('admin.color.create'),
    'buttonIcon' => 'bi bi-plus-circle-fill me-2',
    'buttonSize' => 'btn-lg'
])

