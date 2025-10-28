{{-- ==========================================
    篩選側邊欄模板組件
    功能：可重用的篩選側邊欄模板
    参数：
    - $filters: 篩選選項數組
    - $clearButtonText: 清除按鈕文字 (默認 "Clear All")
    - $clearButtonIcon: 清除按鈕圖標 (默認 "bi-arrow-clockwise")
    ========================================== --}}

@php
    $clearButtonText = $clearButtonText ?? 'Clear All';
    $clearButtonIcon = $clearButtonIcon ?? 'bi-arrow-clockwise';
    $filters = $filters ?? [];
@endphp

<div class="filter-sidebar">
    {{-- 篩選頭部 --}}
    <div class="filter-header">
        <div class="d-flex align-items-center">
            <div class="filter-icon"><i class="bi bi-funnel"></i></div>
            <h5 class="mb-0">Filters</h5>
        </div>
        <button class="btn btn-sm btn-outline-secondary" id="clear-filters">
            <i class="bi {{ $clearButtonIcon }} me-1"></i>{{ $clearButtonText }}
        </button>
    </div>

    {{-- 動態篩選組 --}}
    @foreach($filters as $filter)
        <div class="filter-group">
            <div class="filter-group-header"
                 data-bs-toggle="collapse"
                 data-bs-target="#filter-{{ $filter['id'] }}Collapse"
                 aria-expanded="{{ $filter['expanded'] ?? false ? 'true' : 'false' }}">
                <div class="d-flex align-items-center">
                    <i class="bi {{ $filter['icon'] ?? 'bi-tag' }} me-2"></i>
                    <span>{{ $filter['title'] }}</span>
                </div>
                <i class="bi bi-chevron-down filter-arrow"></i>
            </div>
            <div class="collapse {{ ($filter['expanded'] ?? false) ? 'show' : '' }}"
                 id="filter-{{ $filter['id'] }}Collapse">
                <div class="filter-group-content">
                    @if($filter['type'] === 'category')
                        {{-- 分類篩選 --}}
                        @if(isset($filter['allOption']))
                            <div class="filter-option active" data-category="">
                                <div class="filter-option-icon">
                                    <i class="bi {{ $filter['allOption']['icon'] ?? 'bi-grid-3x3-gap-fill' }}"></i>
                                </div>
                                <span>{{ $filter['allOption']['text'] ?? 'All Categories' }}</span>
                                <div class="filter-option-count">{{ $filter['allOption']['count'] ?? '0' }}</div>
                            </div>
                        @endif

                        @foreach($filter['options'] as $option)
                            <div class="filter-option" data-category="{{ $option['id'] }}">
                                <div class="filter-option-icon">
                                    @if(isset($option['image']) && $option['image'])
                                        <img src="{{ asset('assets/images/' . $option['image']) }}"
                                             alt="{{ $option['text'] }}"
                                             class="filter-option-image"
                                             onerror="this.onerror=null; this.src='{{ asset('assets/images/placeholder.png') }}';"
                                             title="Image: {{ $option['image'] }}">
                                    @else
                                        <i class="bi {{ $option['icon'] ?? 'bi-tag-fill' }}"
                                           title="No image for {{ $option['text'] }}"></i>
                                    @endif
                                </div>
                                <span>{{ $option['text'] }}</span>
                                <div class="filter-option-count">{{ $option['count'] ?? '0' }}</div>
                            </div>
                        @endforeach

                    @elseif($filter['type'] === 'checkbox')
                        {{-- 複選框篩選 --}}
                        @foreach($filter['options'] as $option)
                            <div class="filter-checkbox">
                                <input type="checkbox"
                                       id="filter-{{ $filter['id'] }}-{{ $option['id'] }}"
                                       data-{{ $filter['id'] }}="{{ $option['id'] }}"
                                       class="filter-checkbox-input">
                                <label for="filter-{{ $filter['id'] }}-{{ $option['id'] }}"
                                       class="filter-checkbox-label">
                                    <span class="filter-checkbox-text">{{ $option['text'] }}</span>
                                    <span class="filter-checkbox-count">{{ $option['count'] ?? '0' }}</span>
                                </label>
                            </div>
                        @endforeach

                    @elseif($filter['type'] === 'custom')
                        {{-- 自定義篩選內容 --}}
                        {!! $filter['content'] ?? '' !!}
                    @endif
                </div>
            </div>
        </div>
    @endforeach
</div>
