{{-- ==========================================
    数据表格组件
    功能：可重用的数据表格显示
    参数：
    - $title: 表格标题
    - $badgeText: 徽章文本
    - $badgeId: 徽章ID
    - $showExport: 是否显示导出按钮
    - $exportButtonText: 导出按钮文本
    - $exportButtonId: 导出按钮ID
    - $columns: 表格列配置数组
    - $tableBodyId: 表格主体ID
    - $loadingText: 加载文本
    ========================================== --}}

@php
    $title = $title ?? 'Data List';
    $badgeText = $badgeText ?? 'Loading...';
    $badgeId = $badgeId ?? 'records-count';
    $showExport = $showExport ?? false;
    $exportButtonText = $exportButtonText ?? 'Export Data';
    $exportButtonId = $exportButtonId ?? 'export-btn';
    $tableBodyId = $tableBodyId ?? 'table-body';
    $loadingText = $loadingText ?? 'Loading data...';
    $columns = $columns ?? [];
@endphp

<div class="card shadow-sm border-0">
    <div class="card-header bg-transparent border-0 pb-3 mb-3">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-3">
                <h5 class="mb-0 fw-semibold">{{ $title }}</h5>
                <span class="badge bg-light text-dark" id="{{ $badgeId }}">{{ $badgeText }}</span>
            </div>

            @if($showExport)
                <button class="btn btn-outline-success" id="{{ $exportButtonId }}" disabled>
                    <i class="bi bi-download me-2"></i>{{ $exportButtonText }}
                </button>
            @endif
        </div>
    </div>

    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        @foreach($columns as $column)
                            <th class="{{ $column['class'] ?? '' }}" style="{{ $column['style'] ?? '' }}">
                                <div class="fw-bold text-muted small text-uppercase">{{ $column['title'] }}</div>
                                @if(isset($column['content']))
                                    {!! $column['content'] !!}
                                @endif
                            </th>
                        @endforeach
                    </tr>
                </thead>
                <tbody id="{{ $tableBodyId }}">
                    <tr>
                        <td colspan="{{ count($columns) }}" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2 text-muted">{{ $loadingText }}</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
