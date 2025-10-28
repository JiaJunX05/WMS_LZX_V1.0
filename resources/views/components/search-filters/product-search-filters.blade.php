{{-- ==========================================
    產品搜索組件
    功能：產品頁面專用的搜索功能
    ========================================== --}}

@include('components.search-filters.templates.search-filters', [
    'searchPlaceholder' => 'Search by SKU...',
    'searchLabel' => 'Search Products',
    'clearButtonText' => 'Clear Search'
])
