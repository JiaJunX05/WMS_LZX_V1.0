{{-- ==========================================
    产品预览网格区域
    功能：显示产品预览卡片和选择功能
    ========================================== --}}

{{-- 预览网格 --}}
<div class="card shadow-sm border-0">
    <div class="card-header bg-white border-0 border-bottom">
        <div class="row align-items-center">
            <div class="col">
                <h5 class="mb-0 fw-bold">
                    <i class="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>Product Preview
                </h5>
                <small class="text-muted">Select products to print labels</small>
            </div>
            <div class="col-auto">
                <div class="d-flex align-items-center gap-3">
                    {{-- 選擇摘要 --}}
                    <div class="alert alert-info border-0 bg-white mb-0 py-2 px-3">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-info-circle-fill text-primary me-2"></i>
                            <span class="text-muted small">
                                <span id="selected-count">0</span> selected
                            </span>
                        </div>
                    </div>
                    {{-- Select All 復選框 --}}
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="select-all">
                        <label class="form-check-label fw-medium" for="select-all">
                            <i class="bi bi-check-square me-1"></i>Select All
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="card-body p-4">
        <div id="preview-grid" data-url="{{ route('superadmin.print.index') }}">
            {{-- 內容將通過 JavaScript 動態加載 --}}
        </div>
        <div id="no-results" class="text-center py-5 d-none">
            <div class="text-muted">
                <i class="bi bi-search display-4 text-muted"></i>
                <h4 class="mt-3 text-muted">No products found</h4>
                <p class="mb-0 text-muted">Try adjusting your filter criteria</p>
            </div>
        </div>
    </div>
</div>

