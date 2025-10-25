{{-- ==========================================
    统计卡片组件
    功能：可重用的统计数据显示卡片
    参数：
    - $stats: 统计数据数组
    - $columns: 每行显示的列数 (默认4)
    ========================================== --}}

@php
    $columns = $columns ?? 4;
    $columnClass = match($columns) {
        1 => 'col-12',
        2 => 'col-xl-6 col-md-6',
        3 => 'col-xl-4 col-md-6',
        4 => 'col-xl-3 col-md-6',
        6 => 'col-xl-2 col-md-4 col-sm-6',
        default => 'col-xl-3 col-md-6'
    };
@endphp

<div class="statistics-section mb-4">
    <div class="row g-4">
        @foreach(($stats ?? $cards ?? []) as $stat)
            <div class="{{ $columnClass }}">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="{{ $stat['id'] ?? 'stat-' . $loop->index }}">{{ $stat['value'] ?? $stat['number'] ?? 0 }}</div>
                                <div class="stats-label">{{ $stat['label'] ?? 'Statistic' }}</div>
                            </div>
                            <div class="stats-icon {{ $stat['bg_class'] ?? $stat['bgClass'] ?? 'bg-primary' }}">
                                <i class="{{ $stat['icon'] ?? 'bi bi-bar-chart' }}"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
</div>
