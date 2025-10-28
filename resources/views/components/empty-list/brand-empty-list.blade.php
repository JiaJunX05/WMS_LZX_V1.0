{{-- ==========================================
    Brand空状态组件
    功能：显示Brand的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-award',
    'title' => 'No Brand Data',
    'description' => 'No brands have been created in the system yet',
    'buttonText' => 'Create First Brand',
    'buttonUrl' => route('admin.brand.create'),
    'buttonIcon' => 'bi bi-plus-circle-fill me-2',
    'buttonSize' => 'btn-lg'
])

