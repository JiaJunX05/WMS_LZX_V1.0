{{-- ==========================================
    Subcategory空状态组件
    功能：显示Subcategory的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-tags',
    'title' => 'No Subcategory Data',
    'description' => 'No subcategories have been created in the system yet',
    'buttonText' => 'Create First Subcategory',
    'buttonUrl' => route('admin.subcategory.create'),
    'buttonIcon' => 'bi bi-plus-circle-fill me-2',
    'buttonSize' => 'btn-lg'
])

