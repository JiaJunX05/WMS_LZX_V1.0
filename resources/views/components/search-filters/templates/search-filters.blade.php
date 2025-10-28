{{-- ==========================================
    通用搜索筛选组件
    功能：可重用的搜索和筛选功能（动态适应）
    参数：
    - $searchPlaceholder: 搜索框占位符文本
    - $searchLabel: 搜索框标签文本
    - $filters: 筛选选项数组（可选）
    - $clearButtonText: 清除按钮文本
    ========================================== --}}

@php
    $searchPlaceholder = $searchPlaceholder ?? 'Search...';
    $searchLabel = $searchLabel ?? 'Search';
    $clearButtonText = $clearButtonText ?? 'Clear';
    $filters = $filters ?? [];

    // 判断是否有筛选器
    $hasFilters = !empty($filters);
    $clearButtonId = $hasFilters ? 'clear-filters' : 'clear-search';

    // 计算筛选器数量
    $filterCount = count($filters);

    // 动态计算列宽度以确保占满12列
    if ($hasFilters) {
        // 每个筛选器固定2列，按钮3列，搜索框占剩余空间
        // 例如：3个筛选器(6列) + 按钮(3列) + 搜索框(3列) = 12列
        $searchColumnClass = 'col-lg-' . (12 - ($filterCount * 2) - 3);
        $buttonColumnClass = 'col-lg-3';
    } else {
        // 无筛选器：搜索框9列，按钮3列
        $searchColumnClass = 'col-lg-9';
        $buttonColumnClass = 'col-lg-3';
    }
@endphp

<div class="search-filter-section mb-4">
    <div class="card shadow-sm border-0">
        <div class="card-body">
            <div class="row g-3 align-items-end">
                {{-- 搜索输入框 --}}
                <div class="{{ $searchColumnClass }}">
                    <label class="form-label fw-medium">{{ $searchLabel }}</label>
                    <div class="search-input-wrapper">
                        <i class="bi bi-search search-icon"></i>
                        <input type="text" class="form-control search-input" id="search-input" placeholder="{{ $searchPlaceholder }}">
                    </div>
                </div>

                {{-- 动态筛选选项（如果有筛选器） --}}
                @if($hasFilters)
                    @foreach($filters as $index => $filter)
                        <div class="col-lg-2">
                            <label class="form-label fw-medium">{{ $filter['label'] }}</label>
                            @if(isset($filter['type']) && $filter['type'] === 'date')
                                <input type="date" class="form-control" id="{{ $filter['id'] }}" name="{{ $filter['id'] }}">
                            @else
                                <select class="form-select" id="{{ $filter['id'] }}">
                                    <option value="">{{ $filter['allText'] ?? 'All' }}</option>
                                    @foreach($filter['options'] as $value => $text)
                                        <option value="{{ $value }}">{{ $text }}</option>
                                    @endforeach
                                </select>
                            @endif
                        </div>
                    @endforeach
                @endif

                {{-- 清除按钮 --}}
                <div class="{{ $buttonColumnClass }}">
                    <button class="btn btn-outline-secondary w-100" id="{{ $clearButtonId }}">
                        <i class="bi bi-x-circle me-2"></i>{{ $clearButtonText }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
