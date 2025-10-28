{{-- ==========================================
    Color管理表格组件
    功能：显示Color列表表格
    ========================================== --}}

@php
    $columns = [
        [
            'class' => 'ps-4',
            'style' => 'width: 5%',
            'title' => '',
            'content' => '<input type="checkbox" name="select-all" id="select-all" class="form-check-input">'
        ],
        [
            'style' => 'width: 10%',
            'title' => 'COLOR'
        ],
        [
            'style' => 'width: 60%',
            'title' => 'COLOR INFORMATION'
        ],
        [
            'style' => 'width: 15%',
            'title' => 'COLOR STATUS'
        ],
        [
            'class' => 'text-end pe-4',
            'style' => 'width: 10%',
            'title' => 'ACTIONS'
        ]
    ];
@endphp

@include('components.data-tables.templates.data-tables', [
    'title' => 'Color List',
    'badgeText' => 'Loading...',
    'badgeId' => 'results-count',
    'showExport' => true,
    'exportButtonText' => 'Export Data',
    'exportButtonId' => 'export-colors-btn',
    'columns' => $columns,
    'tableBodyId' => 'table-body',
    'loadingText' => 'Loading colors...'
])
