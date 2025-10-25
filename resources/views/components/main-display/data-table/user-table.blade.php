{{-- ==========================================
    用户管理表格组件
    功能：显示用户列表表格
    ========================================== --}}

@php
    $columns = [];

    if($globalUserRole === 'SuperAdmin') {
        $columns = [
            [
                'class' => 'ps-4',
                'style' => 'width: 5%',
                'title' => '',
                'content' => '<input type="checkbox" name="select-all" id="select-all" style="width: 20px; height: 20px;">'
            ],
            [
                'style' => 'width: 30%',
                'title' => 'USER INFO'
            ],
            [
                'style' => 'width: 35%',
                'title' => 'EMAIL'
            ],
            [
                'style' => 'width: 10%',
                'title' => 'ACCOUNT ROLE'
            ],
            [
                'style' => 'width: 10%',
                'title' => 'ACCOUNT STATUS'
            ],
            [
                'class' => 'text-end pe-4',
                'style' => 'width: 10%',
                'title' => 'ACTIONS'
            ]
        ];
    } else {
        $columns = [
            [
                'class' => 'ps-4',
                'style' => 'width: 10%',
                'title' => 'ID'
            ],
            [
                'style' => 'width: 20%',
                'title' => 'USER INFO'
            ],
            [
                'style' => 'width: 40%',
                'title' => 'EMAIL'
            ],
            [
                'style' => 'width: 10%',
                'title' => 'ACCOUNT ROLE'
            ],
            [
                'style' => 'width: 10%',
                'title' => 'ACCOUNT STATUS'
            ],
            [
                'class' => 'text-end pe-4',
                'style' => 'width: 10%',
                'title' => 'ACTIONS'
            ]
        ];
    }
@endphp

@include('components.main-display.data-table.templates.data-table', [
    'title' => 'User List',
    'badgeText' => 'Loading...',
    'badgeId' => 'records-count',
    'showExport' => $globalUserRole === 'SuperAdmin',
    'exportButtonText' => 'Export Data',
    'exportButtonId' => 'export-users-btn',
    'columns' => $columns,
    'tableBodyId' => 'table-body',
    'loadingText' => 'Loading users...'
])
