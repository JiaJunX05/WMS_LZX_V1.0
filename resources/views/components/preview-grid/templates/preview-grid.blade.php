{{-- ==========================================
    預覽網格組件模板
    功能：可重用的產品預覽網格顯示
    参数：
    - $title: 標題 (默認 "Product Preview")
    - $subtitle: 副標題 (默認 "Select products to print labels")
    - $icon: 標題圖標 (默認 "bi-grid-3x3-gap-fill")
    - $showSelector: 是否顯示選擇器 (默認 true)
    - $selectedCountId: 選中計數ID (默認 "selected-count")
    - $selectAllId: 全選復選框ID (默認 "select-all")
    - $gridId: 網格容器ID (默認 "preview-grid")
    - $gridUrl: 數據URL
    - $noResultsId: 無結果容器ID (默認 "no-results")
    ========================================== --}}

@php
    $title = $title ?? 'Product Preview';
    $subtitle = $subtitle ?? 'Select products to print labels';
    $icon = $icon ?? 'bi-grid-3x3-gap-fill';
    $showSelector = $showSelector ?? true;
    $selectedCountId = $selectedCountId ?? 'selected-count';
    $selectAllId = $selectAllId ?? 'select-all';
    $gridId = $gridId ?? 'preview-grid';
    $gridUrl = $gridUrl ?? '';
    $noResultsId = $noResultsId ?? 'no-results';
@endphp

<div class="card shadow-sm border-0">
    <div class="card-header bg-white border-0 border-bottom">
        <div class="row align-items-center">
            <div class="col">
                <h5 class="mb-0 fw-bold">
                    <i class="bi {{ $icon }} me-2 text-primary"></i>{{ $title }}
                </h5>
                <small class="text-muted">{{ $subtitle }}</small>
            </div>
            @if($showSelector)
                <div class="col-auto">
                    <div class="d-flex align-items-center gap-3">
                        {{-- 選擇摘要 --}}
                        <div class="alert alert-info border-0 bg-white mb-0 py-2 px-3">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-info-circle-fill text-primary me-2"></i>
                                <span class="text-muted small">
                                    <span id="{{ $selectedCountId }}">0</span> selected
                                </span>
                            </div>
                        </div>
                        {{-- Select All 復選框 --}}
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="{{ $selectAllId }}">
                            <label class="form-check-label fw-medium" for="{{ $selectAllId }}">
                                <i class="bi bi-check-square me-1"></i>Select All
                            </label>
                        </div>
                    </div>
                </div>
            @endif
        </div>
    </div>
    <div class="card-body p-4">
        <div id="{{ $gridId }}" @if($gridUrl) data-url="{{ $gridUrl }}" @endif>
            {{-- 內容將通過 JavaScript 動態加載 --}}
        </div>
        <div id="{{ $noResultsId }}" class="text-center py-5 d-none">
            <div class="text-muted">
                <i class="bi bi-search display-4 text-muted"></i>
                <h4 class="mt-3 text-muted">No products found</h4>
                <p class="mb-0 text-muted">Try adjusting your filter criteria</p>
            </div>
        </div>
    </div>
</div>

