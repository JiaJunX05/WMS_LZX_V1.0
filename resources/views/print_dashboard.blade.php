@extends("layouts.app")

@section("title", "Print Labels")
@section("content")

<meta name="print-index-url" content="{{ route('superadmin.print.index') }}">
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/print-form.css') }}">

<div class="container-fluid py-4">
    <!-- 页面标题和操作区域 -->
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <!-- 标题区域 -->
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-printer-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Print Management</h2>
                                <p class="dashboard-subtitle mb-0">Preview and print product labels</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- 左侧打印选项 -->
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
                    <!-- 打印范围选项 -->
                    <div class="filter-section">
                        <div class="filter-header bg-light">
                            <h6 class="mb-0 text-dark fw-semibold">
                                <i class="bi bi-funnel me-2 text-primary"></i>Print Range
                            </h6>
                        </div>
                        <div class="filter-list p-3">
                            <div class="mb-3">
                                <label class="form-label fw-medium text-muted small">Select Products</label>
                                <select class="form-select" id="print-range">
                                    <option value="all">All products</option>
                                    <option value="selected">Selected products only</option>
                                </select>
                            </div>

                            <!-- 打印设置 -->
                            <div class="mb-3">
                                <label class="form-label fw-bold">Print Settings</label>
                                <div class="row g-2">
                                    <div class="col-12">
                                        <div class="card h-100 border status-card" data-setting="barcode">
                                            <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                <input type="checkbox" id="include-barcode" class="form-check-input me-3" checked>
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
                                        <div class="card h-100 border status-card" data-setting="image">
                                            <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                <input type="checkbox" id="include-image" class="form-check-input me-3" checked>
                                                <div>
                                                    <h6 class="card-title mb-1">
                                                        <i class="bi bi-image me-2 text-info"></i>Include Product Image
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

                    <!-- 快捷操作按钮 -->
                    <div class="mt-auto p-3 bg-light">
                        <div class="d-grid gap-2">
                            <!-- PDF按钮 -->
                            <button type="button" class="btn btn-outline-danger w-100" id="generate-pdf">
                                <i class="bi bi-file-earmark-pdf-fill me-2"></i>Generate PDF
                            </button>

                            <!-- Print按钮 -->
                            <button type="button" class="btn btn-primary w-100" id="print-now">
                                <i class="bi bi-printer-fill me-2"></i>Print Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 右侧内容区 -->
        <div class="col-lg-9 col-md-8">
            <!-- 预览区域 -->
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
                                <!-- 选择摘要 -->
                                <div class="alert alert-info border-0 bg-white mb-0 py-2 px-3">
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-info-circle-fill text-primary me-2"></i>
                                        <span class="text-muted small">
                                            <span id="selected-count">0</span> selected
                                        </span>
                                    </div>
                                </div>
                                <!-- Select All 复选框 -->
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
                    <div id="preview-grid" class="row g-4"
                         data-url="{{ route('superadmin.print.index') }}">
                        <!-- 内容将通过 JavaScript 动态加载 -->
                    </div>
                    <div id="no-results" class="text-center py-5" style="display: none;">
                        <div class="text-muted">
                            <i class="bi bi-search display-4 text-muted"></i>
                            <h4 class="mt-3 text-muted">No products found</h4>
                            <p class="mb-0 text-muted">Try adjusting your filter criteria</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination and Results Statistics -->
            <div class="d-flex justify-content-between align-items-center mt-4">
                <div class="pagination-info text-muted">
                    Showing <span class="fw-medium" id="showing-start">0</span>
                    to <span class="fw-medium" id="showing-end">0</span>
                    of <span class="fw-medium" id="total-count">0</span> entries
                </div>
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
        </div>
    </div>
</div>
@endsection

@section("scripts")
{{-- Barcode Generation Library --}}
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
{{-- PDF Generation Library --}}
<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>

<script>
    const assetPath = '{{ asset('') }}';
</script>
<script src="{{ asset('assets/js/print-management.js') }}"></script>
@endsection

