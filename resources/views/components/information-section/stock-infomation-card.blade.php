{{-- ==========================================
    Stock Product信息卡片组件
    功能：显示Stock产品信息
    ========================================== --}}

@include('components.information-section.templates.information-section', [
    'title' => 'Product Information',
    'imageId' => 'product-image',
    'nameId' => 'product-name',
    'stockId' => 'current-stock',
    'statusId' => 'product-status'
])

