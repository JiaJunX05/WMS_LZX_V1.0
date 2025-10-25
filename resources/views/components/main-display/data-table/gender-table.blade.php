{{-- ==========================================
    Gender管理表格组件
    功能：显示Gender列表表格
    ========================================== --}}

@php
    $columns = [
        [
            'class' => 'ps-4',
            'style' => 'width: 5%',
            'title' => '',
            'content' => '<input type="checkbox" name="select-all" id="select-all" style="width: 20px; height: 20px;">'
        ],
        [
            'style' => 'width: 60%',
            'title' => 'GENDER NAME'
        ],
        [
            'style' => 'width: 15%',
            'title' => 'SIZES COUNT'
        ],
        [
            'style' => 'width: 10%',
            'title' => 'GENDER STATUS'
        ],
        [
            'class' => 'text-end pe-4',
            'style' => 'width: 10%',
            'title' => 'ACTIONS'
        ]
    ];
@endphp

@include('components.main-display.data-table.templates.data-table', [
    'title' => 'Gender List',
    'badgeText' => 'Loading...',
    'badgeId' => 'results-count',
    'showExport' => true,
    'exportButtonText' => 'Export Data',
    'exportButtonId' => 'export-genders-btn',
    'columns' => $columns,
    'tableBodyId' => 'table-body',
    'loadingText' => 'Loading genders...'
])
