{{-- ==========================================
    打印管理头部组件
    功能：根据页面类型显示不同的头部导航
    参数：$type - 'dashboard'
    ========================================== --}}

@php
    $type = $type ?? 'dashboard';

    $headerConfig = match($type) {
        default => [
            'icon' => 'bi bi-printer-fill',
            'title' => 'Print Management',
            'subtitle' => 'Preview and print product labels',
            'actionButtonText' => null,
            'actionButtonUrl' => null,
            'actionButtonIcon' => null
        ]
    };
@endphp

@include('components.dashboard-header.templates.dashboard-header', $headerConfig)

