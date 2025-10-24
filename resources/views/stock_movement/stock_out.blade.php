@extends("layouts.app")

@section("title", "Stock Out")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

<div class="container-fluid py-4">
    <!-- Page Title -->
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-dash-circle-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Stock Out</h2>
                                <p class="dashboard-subtitle mb-0">Scan products to remove inventory</p>
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

    {{-- Alert Container --}}
    <div id="alertContainer" class="mb-4"></div>

    <!-- Scanner Area -->
    <div class="card shadow-sm border-0 mb-4">
        <div class="card-header bg-danger text-white">
            <h5 class="mb-0">
                <i class="bi bi-upc-scan me-2"></i>
                Barcode Scanner
            </h5>
        </div>
            <div class="card-body">
            <div class="input-group mb-3">
                <span class="input-group-text bg-light">
                    <i class="bi bi-upc-scan text-danger"></i>
                </span>
                <input type="text" class="form-control" id="barcode-scanner"
                       placeholder="Please scan barcode using scanner..." aria-label="Barcode Scanner">
                <span class="input-group-text">
                    <i class="bi bi-check-circle text-danger">Scan Barcode</i>
                </span>
                        </div>
            <div class="form-text mt-2">
                <i class="bi bi-info-circle me-1"></i>
                Please use scanner to scan barcode (manual input disabled)
            </div>
        </div>
    </div>

    <!-- Scanned Products Table -->
    <div class="card shadow-sm border-0 d-none" id="scanned-products-card">
        <div class="card-header bg-transparent border-0 pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="mb-0 fw-semibold">Scanned Products</h5>
                    <span class="badge bg-danger" id="scanned-products-count">0 products</span>
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
                        <!-- Dynamically generated scanned products -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Empty State -->
    <div class="card shadow-sm border-0" id="empty-state-card">
        <div class="card-body text-center py-5">
            <i class="bi bi-upc-scan display-1 text-muted mb-3"></i>
            <h5 class="text-muted mb-2">No Products Scanned Yet</h5>
            <p class="text-muted mb-0">Start scanning product barcodes to add them to the stock out list</p>
                    </div>
                </div>

    <!-- Submit Section -->
    <div class="card shadow-sm border-0 mt-4 d-none" id="submit-section">
        <div class="card-body">
            <div class="mb-3">
                <label for="reference-number" class="form-label fw-medium">
                    <i class="bi bi-tag text-primary me-1"></i>
                    Reference Number <span class="text-danger">*</span>
                        </label>
                <input type="text" class="form-control" id="reference-number" required
                       placeholder="e.g., SO-2024-001, OUT-001">
                <div class="form-text">Required reference number for tracking this stock out batch</div>
                    </div>

            <button class="btn btn-danger w-100" onclick="submitStockOut()" id="submit-btn">
                <i class="bi bi-check-circle me-2"></i>
                Submit Stock Out
            </button>

                    </div>
                </div>

</div>

@endsection

@section("scripts")
<script>
    // Set stock out related URLs
    window.stockOutPageRoute = "{{ route('staff.stock_out_page') }}";
    window.stockOutRoute = "{{ route('staff.stock_out') }}";
    window.stockManagementRoute = "{{ route('staff.stock_management') }}";
</script>

<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/stock-management.js') }}"></script>
@endsection
