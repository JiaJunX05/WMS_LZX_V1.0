{{-- ==========================================
    Stock History空状态组件
    功能：显示Stock History的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-clock-history',
    'title' => 'No Stock History Data',
    'description' => 'No stock movement history has been recorded in the system yet',
    'buttonText' => 'Go to Stock Management',
    'buttonUrl' => route('staff.stock_management'),
    'buttonIcon' => 'bi bi-arrow-left me-2',
    'buttonSize' => 'btn-lg'
])

