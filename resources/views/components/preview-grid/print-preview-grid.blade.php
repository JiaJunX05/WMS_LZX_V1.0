{{-- ==========================================
    打印預覽網格組件
    功能：打印頁面專用的產品預覽網格
    ========================================== --}}

@php
    $title = 'Product Preview';
    $subtitle = 'Select products to print labels';
    $icon = 'bi-grid-3x3-gap-fill';
    $gridId = 'preview-grid';
    $gridUrl = route('superadmin.print.index');
    $selectedCountId = 'selected-count';
    $selectAllId = 'select-all';
    $noResultsId = 'no-results';
@endphp

@include('components.preview-grid.templates.preview-grid', [
    'title' => $title,
    'subtitle' => $subtitle,
    'icon' => $icon,
    'showSelector' => true,
    'selectedCountId' => $selectedCountId,
    'selectAllId' => $selectAllId,
    'gridId' => $gridId,
    'gridUrl' => $gridUrl,
    'noResultsId' => $noResultsId
])

