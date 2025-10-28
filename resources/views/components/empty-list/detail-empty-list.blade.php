{{-- ==========================================
    Stock Detail空状态组件
    功能：显示Stock Detail的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-box-seam',
    'title' => 'No Stock Details',
    'description' => 'No stock movement details available for this product',
    'buttonText' => 'Go to Stock Management',
    'buttonUrl' => route('staff.stock_management'),
    'buttonIcon' => 'bi bi-arrow-left me-2',
    'buttonSize' => 'btn-lg'
])

