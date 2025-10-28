{{-- ==========================================
    Stock管理表格组件
    功能：显示Stock产品列表表格（根据角色动态显示列）
    ========================================== --}}

@php
    $role = Auth::user()->getAccountRole();

    // 根据角色设置列配置
    if (in_array($role, ['SuperAdmin', 'Admin'])) {
        // Admin 和 SuperAdmin 显示 checkbox
        $columns = [
            [
                'class' => 'ps-4',
                'style' => 'width: 5%',
                'title' => '',
                'content' => '<input type="checkbox" name="select-all" id="select-all" class="form-check-input">'
            ],
            [
                'style' => 'width: 10%',
                'title' => 'IMAGE'
            ],
            [
                'style' => 'width: 35%',
                'title' => 'PRODUCT NAME'
            ],
            [
                'style' => 'width: 20%',
                'title' => 'SKU CODE'
            ],
            [
                'style' => 'width: 10%',
                'title' => 'STOCK'
            ],
            [
                'style' => 'width: 10%',
                'title' => 'STATUS'
            ],
            [
                'class' => 'text-end pe-4',
                'style' => 'width: 10%',
                'title' => 'ACTIONS'
            ]
        ];
    } else {
        // Staff 显示 ID
        $columns = [
            [
                'class' => 'ps-4',
                'style' => 'width: 10%',
                'title' => 'ID'
            ],
            [
                'style' => 'width: 10%',
                'title' => 'IMAGE'
            ],
            [
                'style' => 'width: 35%',
                'title' => 'PRODUCT NAME'
            ],
            [
                'style' => 'width: 20%',
                'title' => 'SKU CODE'
            ],
            [
                'style' => 'width: 10%',
                'title' => 'STOCK'
            ],
            [
                'style' => 'width: 10%',
                'title' => 'STATUS'
            ],
            [
                'class' => 'text-end pe-4',
                'style' => 'width: 10%',
                'title' => 'ACTIONS'
            ]
        ];
    }
@endphp

@include('components.data-tables.templates.data-tables', [
    'title' => 'Products List',
    'badgeText' => '0 products',
    'badgeId' => 'dashboard-results-count',
    'showExport' => in_array(Auth::user()->getAccountRole(), ['SuperAdmin', 'Admin']),
    'exportButtonText' => 'Export Data',
    'exportButtonId' => 'export-products-btn',
    'columns' => $columns,
    'tableBodyId' => 'products-table-body',
    'loadingText' => 'Loading products...'
])

