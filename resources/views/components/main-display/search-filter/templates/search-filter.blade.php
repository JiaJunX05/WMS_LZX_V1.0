{{-- ==========================================
    搜索筛选组件
    功能：可重用的搜索和筛选功能
    参数：
    - $searchPlaceholder: 搜索框占位符文本
    - $searchLabel: 搜索框标签文本
    - $filters: 筛选选项数组
    - $clearButtonText: 清除按钮文本
    ========================================== --}}

@php
    $searchPlaceholder = $searchPlaceholder ?? 'Search...';
    $searchLabel = $searchLabel ?? 'Search';
    $clearButtonText = $clearButtonText ?? 'Clear Filters';
    $filters = $filters ?? [];
@endphp

<div class="search-filter-section mb-4">
    <div class="card shadow-sm border-0">
        <div class="card-body">
            <div class="row g-3 align-items-end">
                {{-- 搜索输入框 --}}
                <div class="col-lg-5">
                    <label class="form-label fw-medium">{{ $searchLabel }}</label>
                    <div class="search-input-wrapper">
                        <i class="bi bi-search search-icon"></i>
                        <input type="text" class="form-control search-input" id="search-input" placeholder="{{ $searchPlaceholder }}">
                    </div>
                </div>

                {{-- 动态筛选选项 --}}
                @foreach($filters as $index => $filter)
                    <div class="col-lg-2">
                        <label class="form-label fw-medium">{{ $filter['label'] }}</label>
                        <select class="form-select" id="{{ $filter['id'] }}">
                            <option value="">{{ $filter['allText'] ?? 'All' }}</option>
                            @foreach($filter['options'] as $value => $text)
                                <option value="{{ $value }}">{{ $text }}</option>
                            @endforeach
                        </select>
                    </div>
                @endforeach

                {{-- 清除筛选按钮 --}}
                <div class="col-lg-3">
                    <button class="btn btn-outline-secondary w-100" id="clear-filters">
                        <i class="bi bi-x-circle me-2"></i>{{ $clearButtonText }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
