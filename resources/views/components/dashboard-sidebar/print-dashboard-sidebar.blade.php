{{-- ==========================================
    打印選項側邊欄組件
    功能：打印頁面專用的選項側邊欄
    ========================================== --}}

@php
    // 配置打印範圍選項
    $printRangeOptions = [
        ['value' => 'all', 'text' => 'All products'],
        ['value' => 'selected', 'text' => 'Selected products only']
    ];

    // 配置打印設置選項
    $settings = [
        [
            'id' => 'include-barcode',
            'name' => 'Include Barcode',
            'icon' => 'bi-upc-scan',
            'description' => 'Print product barcode on labels',
            'checked' => true
        ],
        [
            'id' => 'include-image',
            'name' => 'Include Product Image',
            'icon' => 'bi-image',
            'description' => 'Print product image on labels',
            'checked' => true
        ]
    ];

    // 配置操作按鈕
    $actions = [
        [
            'id' => 'generate-pdf',
            'text' => 'Generate PDF',
            'icon' => 'bi-file-earmark-pdf-fill',
            'style' => 'btn-outline-danger'
        ],
        [
            'id' => 'print-now',
            'text' => 'Print Now',
            'icon' => 'bi-printer-fill',
            'style' => 'btn-primary'
        ]
    ];
@endphp

@include('components.dashboard-sidebar.templates.print-dashboard-sidebar', [
    'title' => 'Print Options',
    'subtitle' => 'Configure your print settings',
    'icon' => 'bi-printer-fill',
    'printRangeOptions' => $printRangeOptions,
    'settings' => $settings,
    'actions' => $actions
])

