{{-- ==========================================
    Print空狀態組件
    功能：顯示打印頁面的空狀態提示
    ========================================== --}}

@include('components.empty-list.templates.empty-list', [
    'icon' => 'bi bi-search',
    'title' => 'No products found',
    'description' => 'Try adjusting your filter criteria',
    'buttonText' => null,  // 不使用按鈕
    'buttonUrl' => '#',
    'buttonIcon' => '',
    'buttonSize' => ''
])

