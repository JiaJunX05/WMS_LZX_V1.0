{{-- ==========================================
    Stock Detail空状态组件
    功能：显示Stock Detail的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-box-seam',
    'title' => 'No Stock Details',
    'description' => 'No stock movement details available for this product',
    'hideButton' => true
])

