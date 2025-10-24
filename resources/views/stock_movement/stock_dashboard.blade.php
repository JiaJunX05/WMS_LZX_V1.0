@extends("layouts.app")

@section("title", "Stock Management")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

<div class="container-fluid py-4">
    <!-- Page Title and Add Button -->
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-box-seam-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Stock Management</h2>
                                <p class="dashboard-subtitle mb-0">Manage product inventory movements</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        @if(Auth::user()->getAccountRole() === 'Staff')
                            <a href="{{ route('staff.stock_in_page') }}" class="btn btn-success me-2">
                                <i class="bi bi-plus-circle-fill me-2"></i>
                                Stock In
                            </a>
                            <a href="{{ route('staff.stock_out_page') }}" class="btn btn-danger me-2">
                                <i class="bi bi-dash-circle-fill me-2"></i>
                                Stock Out
                            </a>
                            <a href="{{ route('staff.stock_return_page') }}" class="btn btn-warning">
                                <i class="bi bi-arrow-return-left me-2"></i>
                                Stock Return
                            </a>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Alert Container --}}
    <div id="alertContainer" class="mb-4"></div>

    <!-- Product Search and Filter -->
    <div class="search-filter-section mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row g-3 align-items-end">
                    <div class="col-lg-10">
                        <label class="form-label fw-medium">Search Products</label>
                        <div class="search-input-wrapper">
                            <i class="bi bi-search search-icon"></i>
                            <input type="text" class="form-control search-input" id="search-input"
                                   placeholder="Search by product name, SKU, or barcode...">
                        </div>
                    </div>
                    <div class="col-lg-2">
                        <button class="btn btn-outline-secondary w-100" id="clear-search">
                            <i class="bi bi-x-circle me-2"></i>
                            Clear Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Product List Table -->
    <div class="card shadow-sm border-0">
        <div class="card-header bg-transparent border-0 pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="mb-0 fw-semibold">Products List</h5>
                    <span class="badge bg-light text-dark" id="dashboard-results-count">0 products</span>
                </div>
            </div>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="ps-4" style="width: 10%"><div class="fw-bold text-muted small text-uppercase">ID</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">IMAGE</div></th>
                            <th style="width: 40%"><div class="fw-bold text-muted small text-uppercase">PRODUCT NAME</div></th>
                            <th style="width: 20%"><div class="fw-bold text-muted small text-uppercase">SKU CODE</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">STOCK</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">STATUS</div></th>
                            <th class="text-end pe-4" style="width: 10%"><div class="fw-bold text-muted small text-uppercase">ACTIONS</div></th>
                        </tr>
                    </thead>
                    <tbody id="products-table-body">
                        <!-- Loading State -->
                        <tr>
                            <td colspan="7" class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                        </div>
                                <p class="mt-2 text-muted">Loading products...</p>
                                </td>
                            </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Pagination and Results Statistics -->
    <div class="d-flex justify-content-between align-items-center mt-4">
        <div class="pagination-info text-muted">
            Showing <span class="fw-medium" id="dashboard-showing-start">0</span>
            to <span class="fw-medium" id="dashboard-showing-end">0</span>
            of <span class="fw-medium" id="dashboard-total-count">0</span> entries
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


@endsection

@section("scripts")
<script>
    // Set stock management related URLs
    window.stockManagementRoute = "{{ route('staff.stock_management') }}";
    window.stockInPageRoute = "{{ route('staff.stock_in_page') }}";
    window.stockOutPageRoute = "{{ route('staff.stock_out_page') }}";
    window.stockHistoryRoute = "{{ route('staff.staff.stock_history', ['id' => ':id']) }}";
    window.productImagePath = "{{ asset('assets/images/products') }}";
    window.defaultProductImage = "{{ asset('assets/img/no-image.png') }}";
</script>
<script src="{{ asset('assets/js/stock-management.js') }}"></script>
@endsection
