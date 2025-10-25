{{-- ==========================================
    Category管理表格组件
    功能：显示Category列表表格
    ========================================== --}}

@php
    $columns = [
        [
            'class' => 'ps-4',
            'style' => 'width: 5%',
            'title' => '',
            'content' => '<input type="checkbox" class="form-check-input" id="select-all" style="width: 20px; height: 20px;">'
        ],
        [
            'style' => 'width: 10%',
            'title' => 'CATEGORY IMAGE'
        ],
        [
            'style' => 'width: 60%',
            'title' => 'CATEGORY NAME'
        ],
        [
            'style' => 'width: 15%',
            'title' => 'CATEGORY STATUS'
        ],
        [
            'class' => 'text-end pe-4',
            'style' => 'width: 10%',
            'title' => 'ACTIONS'
        ]
    ];
@endphp

@include('components.main-display.data-table.templates.data-table', [
    'title' => 'Category List',
    'badgeText' => 'Loading...',
    'badgeId' => 'results-count',
    'showExport' => true,
    'exportButtonText' => 'Export Data',
    'exportButtonId' => 'export-categories-btn',
    'columns' => $columns,
    'tableBodyId' => 'table-body',
    'loadingText' => 'Loading categories...'
])
