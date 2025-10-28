{{-- ==========================================
    分页导航模板组件
    功能：可重用的分页导航和分页信息显示
    参数：
    - $showInfo: 是否显示分页信息 (默认true)
    - $infoPrefix: 分页信息前缀文本 (默认"Showing")
    - $infoSuffix: 分页信息后缀文本 (默认"entries")
    ========================================== --}}

@php
    $showInfo = $showInfo ?? true;
    $infoPrefix = $infoPrefix ?? 'Showing';
    $infoSuffix = $infoSuffix ?? 'entries';
@endphp

<div class="d-flex justify-content-between align-items-center mt-4">
    @if($showInfo)
        {{-- 分页信息 --}}
        <div class="pagination-info text-muted">
            {{ $infoPrefix }} <span class="fw-medium" id="showing-start">0</span>
            to <span class="fw-medium" id="showing-end">0</span>
            of <span class="fw-medium" id="total-count">0</span> {{ $infoSuffix }}
        </div>
    @else
        <div></div>
    @endif

    {{-- 分页控件 --}}
    <nav aria-label="Page navigation">
        <ul id="pagination" class="pagination pagination-sm mb-0">
            <li class="page-item disabled" id="prev-page">
                <a class="page-link" href="#" aria-label="Previous">
                    <i class="bi bi-chevron-left"></i>
                </a>
            </li>
            <li class="page-item active" id="current-page">
                <span class="page-link" id="page-number">1</span>
            </li>
            <li class="page-item disabled" id="next-page">
                <a class="page-link" href="#" aria-label="Next">
                    <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        </ul>
    </nav>
</div>
