{{-- ==========================================
    Stock空状态组件
    功能：显示Stock的空状态提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-clipboard-data',
    'title' => 'No Stock Data',
    'description' => 'No stock movements have been recorded in the system yet',
    'buttonText' => 'Create First Stock Movement',
    'buttonUrl' => route('staff.stock_in_page'),
    'buttonIcon' => 'bi bi-plus-circle-fill me-2',
    'buttonSize' => 'btn-lg'
])

