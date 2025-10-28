{{-- ==========================================
    Category空状态组件
    功能：显示Category的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-tag',
    'title' => 'No Category Data',
    'description' => 'No categories have been created in the system yet',
    'buttonText' => 'Create First Category',
    'buttonUrl' => route('admin.category.create'),
    'buttonIcon' => 'bi bi-plus-circle-fill me-2',
    'buttonSize' => 'btn-lg'
])

