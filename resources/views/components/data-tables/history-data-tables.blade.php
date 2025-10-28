{{-- ==========================================
    Stock历史表格组件
    功能：显示Stock历史记录表格
    ========================================== --}}

@php
    $columns = [
        ['class' => 'ps-4', 'style' => 'width: 10%', 'title' => 'ID'],
        ['style' => 'width: 10%', 'title' => 'DATE'],
        ['style' => 'width: 10%', 'title' => 'TYPE'],
        ['style' => 'width: 20%', 'title' => 'PRODUCT'],
        ['style' => 'width: 10%', 'title' => 'QUANTITY'],
        ['style' => 'width: 10%', 'title' => 'BEFORE'],
        ['style' => 'width: 10%', 'title' => 'AFTER'],
        ['style' => 'width: 10%', 'title' => 'USER INFO'],
        ['style' => 'width: 10%', 'title' => 'REFERENCE']
    ];
@endphp

@include('components.data-tables.templates.data-tables', [
    'title' => 'Stock Movement History',
    'badgeText' => '0 records',
    'badgeId' => 'history-results-count',
    'showExport' => Auth::user()->getAccountRole() === 'SuperAdmin',
    'exportButtonText' => 'Export Data',
    'exportButtonId' => 'export-history-btn',
    'exportButtonDisabled' => false,
    'columns' => $columns,
    'tableBodyId' => 'history-table-body',
    'loadingText' => 'Loading history...'
])

