{{-- ==========================================
    Product空状态组件
    功能：显示Product的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-box',
    'title' => 'No Product Data',
    'description' => 'No products have been created in the system yet',
    'buttonText' => 'Create First Product',
    'buttonUrl' => route('product.create'),
    'buttonIcon' => 'bi bi-plus-circle-fill me-2',
    'buttonSize' => 'btn-lg'
])

