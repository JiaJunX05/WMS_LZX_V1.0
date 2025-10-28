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
            'content' => '<input type="checkbox" name="select-all" id="select-all" class="form-check-input">'
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

@include('components.data-tables.templates.data-tables', [
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
