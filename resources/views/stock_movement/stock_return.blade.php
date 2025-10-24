{{-- ==========================================
    库存退货页面 - 扫描产品并退回库存
    ========================================== --}}

@extends("layouts.app")

@section("title", "Stock Return")
@section("content")

{{-- CSS 文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 主容器 --}}
<div class="container-fluid py-4">
    {{-- 页面标题区域 --}}
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-arrow-return-left"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Stock Return</h2>
                                <p class="dashboard-subtitle mb-0">Scan products to return inventory</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('staff.stock_management') }}" class="btn btn-primary">
                            <i class="bi bi-arrow-left me-2"></i>
                            Back to List
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- 警告信息容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 扫描器区域 --}}
    <div class="card shadow-sm border-0 mb-4">
        <div class="card-header bg-warning text-dark">
            <h5 class="mb-0">
                <i class="bi bi-upc-scan me-2"></i>
                Barcode Scanner
            </h5>
        </div>
        <div class="card-body">
            <div class="input-group mb-3">
                <span class="input-group-text bg-light">
                    <i class="bi bi-upc-scan text-warning"></i>
                </span>
                <input type="text" class="form-control" id="barcode-scanner"
                       placeholder="Please scan barcode using scanner..." aria-label="Barcode Scanner">
                <span class="input-group-text">
                    <i class="bi bi-check-circle text-warning">Scan Barcode</i>
                </span>
            </div>
            <div class="form-text mt-2">
                <i class="bi bi-info-circle me-1"></i>
                Please use scanner to scan barcode (manual input disabled)
            </div>
        </div>
    </div>

    {{-- 已扫描产品表格 --}}
    <div class="card shadow-sm border-0 d-none" id="scanned-products-card">
        <div class="card-header bg-transparent border-0 pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="mb-0 fw-semibold">Scanned Products</h5>
                    <span class="badge bg-warning text-dark" id="scanned-products-count">0 products</span>
                </div>
                <div class="d-flex gap-2">
                    <span class="badge bg-primary fs-6 me-2" id="scanned-count">0 items scanned</span>
                    <button class="btn btn-outline-danger btn-sm" id="clear-all-btn" disabled>
                        <i class="bi bi-trash me-1"></i>
                        Clear All
                    </button>
                </div>
            </div>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="ps-4" style="width: 10%"><div class="fw-bold text-muted small text-uppercase">#</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">IMAGE</div></th>
                            <th style="width: 30%"><div class="fw-bold text-muted small text-uppercase">PRODUCT NAME</div></th>
                            <th style="width: 20%"><div class="fw-bold text-muted small text-uppercase">SKU CODE</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">CURRENT STOCK</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">QUANTITY</div></th>
                            <th class="text-end pe-4" style="width: 10%"><div class="fw-bold text-muted small text-uppercase">ACTION</div></th>
                        </tr>
                    </thead>
                    <tbody id="scanned-products-table-body">
                        {{-- 动态生成已扫描产品 --}}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    {{-- 空状态 --}}
    <div class="card shadow-sm border-0" id="empty-state-card">
        <div class="card-body text-center py-5">
            <i class="bi bi-upc-scan display-1 text-muted mb-3"></i>
            <h5 class="text-muted mb-2">No Products Scanned Yet</h5>
            <p class="text-muted mb-0">Start scanning product barcodes to add them to the stock return list</p>
        </div>
    </div>

    {{-- 提交区域 --}}
    <div class="card shadow-sm border-0 mt-4 d-none" id="submit-section">
        <div class="card-body">
            <div class="mb-3">
                <label for="reference-number" class="form-label fw-medium">
                    <i class="bi bi-tag text-primary me-1"></i>
                    Reference Number <span class="text-danger">*</span>
                </label>
                <input type="text" class="form-control" id="reference-number" required
                       placeholder="e.g., RT-2024-001, RET-001">
                <div class="form-text">Required reference number for tracking this stock return batch</div>
            </div>

            <button class="btn btn-warning w-100" onclick="submitStockReturn()" id="submit-btn">
                <i class="bi bi-check-circle me-2"></i>
                Submit Stock Return
            </button>
        </div>
    </div>
</div>

@endsection

@section("scripts")
{{-- ==========================================
    页面脚本区域
    ========================================== --}}
<script>
    {{-- 设置退货相关 URL --}}
    window.stockReturnPageRoute = "{{ route('staff.stock_return_page') }}";
    window.stockReturnRoute = "{{ route('staff.stock_return') }}";
    window.stockManagementRoute = "{{ route('staff.stock_management') }}";
</script>

{{-- 通用 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/stock-management.js') }}"></script>
@endsection
