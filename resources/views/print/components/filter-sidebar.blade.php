{{-- ==========================================
    打印选项侧边栏
    功能：显示打印范围和设置选项
    ========================================== --}}

{{-- 左侧打印选项 --}}
<div class="col-lg-3 col-md-4">
    <div class="card shadow-sm border-0 h-100">
        <div class="card-header bg-gradient-primary text-white border-0">
            <div class="d-flex align-items-center">
                <div class="me-3">
                    <i class="bi bi-printer-fill fs-4"></i>
                </div>
                <div>
                    <h5 class="mb-0 fw-bold">Print Options</h5>
                    <small class="opacity-75">Configure your print settings</small>
                </div>
            </div>
        </div>
        <div class="card-body d-flex flex-column p-0">
            {{-- 打印範圍選項 --}}
            <div class="border-bottom">
                <div class="p-3 bg-light d-flex justify-content-between align-items-center">
                    <h6 class="mb-0 text-dark fw-semibold">
                        <i class="bi bi-funnel me-2 text-primary"></i>Print Range
                    </h6>
                </div>
                <div class="p-3">
                    <div class="mb-3">
                        <label class="form-label fw-medium text-muted small">Select Products</label>
                        <select class="form-select" id="print-range">
                            <option value="all">All products</option>
                            <option value="selected">Selected products only</option>
                        </select>
                    </div>

                    {{-- 打印設置 --}}
                    <div class="mb-3">
                        <label class="form-label fw-bold">Print Settings</label>
                        <div class="row g-2">
                            <div class="col-12">
                                <div class="card h-100 border status-card" data-setting="include-barcode">
                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                        <input type="checkbox"
                                               id="include-barcode"
                                               class="form-check-input me-3"
                                               checked>
                                        <div>
                                            <h6 class="card-title mb-1">
                                                <i class="bi bi-upc-scan me-2 text-primary"></i>Include Barcode
                                            </h6>
                                            <p class="card-text text-muted small mb-0">Print product barcode on labels</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="card h-100 border status-card" data-setting="include-image">
                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                        <input type="checkbox"
                                               id="include-image"
                                               class="form-check-input me-3"
                                               checked>
                                        <div>
                                            <h6 class="card-title mb-1">
                                                <i class="bi bi-image me-2 text-primary"></i>Include Product Image
                                            </h6>
                                            <p class="card-text text-muted small mb-0">Print product image on labels</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- 快捷操作按鈕 --}}
            <div class="mt-auto p-3 bg-light">
                <div class="d-grid gap-2">
                    <button type="button" class="btn btn-outline-danger w-100" id="generate-pdf">
                        <i class="bi bi-file-earmark-pdf-fill me-2"></i>Generate PDF
                    </button>
                    <button type="button" class="btn btn-primary w-100" id="print-now">
                        <i class="bi bi-printer-fill me-2"></i>Print Now
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

