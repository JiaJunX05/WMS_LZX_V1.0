{{-- ==========================================
    Stock库存历史表格组件
    功能：显示Stock库存历史
    ========================================== --}}

@php
    $columns = [
        ['class' => 'ps-4', 'style' => 'width: 10%', 'title' => 'ID'],
        ['style' => 'width: 10%', 'title' => 'DATE'],
        ['style' => 'width: 10%', 'title' => 'TYPE'],
        ['style' => 'width: 10%', 'title' => 'QUANTITY'],
        ['style' => 'width: 10%', 'title' => 'BEFORE'],
        ['style' => 'width: 10%', 'title' => 'AFTER'],
        ['style' => 'width: 10%', 'title' => 'USER'],
        ['style' => 'width: 10%', 'title' => 'REFERENCE']
    ];
@endphp

@include('components.data-tables.templates.data-tables', [
    'title' => 'Stock Movement History',
    'badgeText' => '0 records',
    'badgeId' => 'detail-history-count',
    'showExport' => false,
    'columns' => $columns,
    'tableBodyId' => 'history-table-body',
    'loadingText' => 'Loading history...'
])

