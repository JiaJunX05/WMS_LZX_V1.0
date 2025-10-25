{{-- ==========================================
    Template统计卡片组件
    功能：显示Size Template的统计数据
    参数：
    - $totalTemplates: 总模板数
    - $activeTemplates: 可用模板数
    - $inactiveTemplates: 不可用模板数
    - $templateGroups: 模板组数
    ========================================== --}}

@php
    $templateStats = [
        [
            'id' => 'total-templates',
            'value' => $totalTemplates ?? 0,
            'label' => 'Total Templates',
            'icon' => 'bi bi-collection',
            'bg_class' => 'bg-primary'
        ],
        [
            'id' => 'active-templates',
            'value' => $activeTemplates ?? 0,
            'label' => 'Available Templates',
            'icon' => 'bi bi-check-circle',
            'bg_class' => 'bg-success'
        ],
        [
            'id' => 'inactive-templates',
            'value' => $inactiveTemplates ?? 0,
            'label' => 'Unavailable Templates',
            'icon' => 'bi bi-x-circle',
            'bg_class' => 'bg-danger'
        ],
        [
            'id' => 'template-groups',
            'value' => $templateGroups ?? ($sizeTemplates ? count($sizeTemplates->groupBy('category_id')) : 0),
            'label' => 'Total Groups',
            'icon' => 'bi bi-tags',
            'bg_class' => 'bg-info'
        ]
    ];
@endphp

@include('components.main-display.stats-cards.templates.stats-cards', ['stats' => $templateStats, 'columns' => 4])
