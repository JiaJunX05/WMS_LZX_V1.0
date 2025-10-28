{{-- ==========================================
    Subcategory管理表格组件
    功能：显示Subcategory列表表格
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
            'title' => 'SUBCATEGORY IMAGE'
        ],
        [
            'style' => 'width: 60%',
            'title' => 'SUBCATEGORY NAME'
        ],
        [
            'style' => 'width: 15%',
            'title' => 'SUBCATEGORY STATUS'
        ],
        [
            'class' => 'text-end pe-4',
            'style' => 'width: 10%',
            'title' => 'ACTIONS'
        ]
    ];
@endphp

@include('components.data-tables.templates.data-tables', [
    'title' => 'Subcategory List',
    'badgeText' => 'Loading...',
    'badgeId' => 'results-count',
    'showExport' => true,
    'exportButtonText' => 'Export Data',
    'exportButtonId' => 'export-subcategories-btn',
    'columns' => $columns,
    'tableBodyId' => 'table-body',
    'loadingText' => 'Loading subcategories...'
])
