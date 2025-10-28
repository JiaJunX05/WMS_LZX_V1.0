{{-- ==========================================
    Stock管理搜索筛选组件
    功能：显示Stock产品搜索功能
    ========================================== --}}

@include('components.search-filters.templates.search-filters', [
    'searchPlaceholder' => 'Search by product name, SKU, or barcode...',
    'searchLabel' => 'Search Products',
    'clearButtonText' => 'Clear Search'
])

