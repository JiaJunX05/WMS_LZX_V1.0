{{-- ==========================================
    Gender管理统计卡片组件
    功能：显示Gender管理相关的统计数据
    参数：
    - $totalGenders: 总性别数
    - $activeGenders: 可用性别数
    - $inactiveGenders: 不可用性别数
    - $gendersWithSizes: 有尺码的性别数
    ========================================== --}}

@php
    $genderStats = [
        [
            'id' => 'total-genders',
            'value' => $totalGenders ?? 0,
            'label' => 'Total Genders',
            'icon' => 'bi bi-person',
            'bg_class' => 'bg-primary'
        ],
        [
            'id' => 'active-genders',
            'value' => $activeGenders ?? 0,
            'label' => 'Available Genders',
            'icon' => 'bi bi-check-circle',
            'bg_class' => 'bg-success'
        ],
        [
            'id' => 'inactive-genders',
            'value' => $inactiveGenders ?? 0,
            'label' => 'Unavailable Genders',
            'icon' => 'bi bi-pause-circle',
            'bg_class' => 'bg-warning'
        ],
        [
            'id' => 'genders-with-sizes',
            'value' => $gendersWithSizes ?? 0,
            'label' => 'With Sizes',
            'icon' => 'bi bi-rulers',
            'bg_class' => 'bg-info'
        ]
    ];
@endphp

@include('components.metric-cards.templates.metric-cards', [
    'stats' => $genderStats,
    'columns' => 4
])
