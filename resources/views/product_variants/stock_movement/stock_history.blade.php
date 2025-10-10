@extends("layouts.app")

@section("title", "Stock History")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-table.css')}}">

<div class="container-fluid py-4">
    <!-- 页面标题 -->
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-clock-history"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Stock History</h2>
                                <p class="dashboard-subtitle mb-0">
                                    @if(Auth::user()->getAccountRole() === 'Staff')
                                        View your stock movement records
                                    @else
                                        View all stock movement records
                                    @endif
                                </p>
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

    {{-- 提示信息容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    <!-- 筛选器 -->
    <form id="filter-form" method="GET" action="{{ route('stock_history') }}">
        <div class="search-filter-section mb-4">
            <div class="card shadow-sm border-0">
                <div class="card-body">
                    <div class="row g-3 align-items-end">
                        <div class="col-lg-3">
                            <label class="form-label fw-medium">Movement Type</label>
                            <select class="form-select" id="movement-type-filter" name="movement_type">
                                <option value="">All Types</option>
                                <option value="stock_in" {{ request('movement_type') == 'stock_in' ? 'selected' : '' }}>Stock In</option>
                                <option value="stock_out" {{ request('movement_type') == 'stock_out' ? 'selected' : '' }}>Stock Out</option>
                                <option value="stock_return" {{ request('movement_type') == 'stock_return' ? 'selected' : '' }}>Stock Return</option>
                            </select>
                        </div>
                        <div class="col-lg-3">
                            <label class="form-label fw-medium">Product</label>
                            <input type="text" class="form-control" id="product-search" name="product_search"
                                   value="{{ request('product_search') }}" placeholder="Search by product name or SKU...">
                        </div>
                        <div class="col-lg-2">
                            <label class="form-label fw-medium">Start Date</label>
                            <input type="date" class="form-control" id="start-date-filter" name="start_date"
                                   value="{{ request('start_date') }}">
                        </div>
                        <div class="col-lg-2">
                            <label class="form-label fw-medium">End Date</label>
                            <input type="date" class="form-control" id="end-date-filter" name="end_date"
                                   value="{{ request('end_date') }}">
                        </div>
                        <div class="col-lg-2">
                            <button type="button" class="btn btn-outline-secondary w-100" id="clear-filters">
                                <i class="bi bi-x-circle me-2"></i>
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <!-- 库存历史表格 -->
    <div class="card shadow-sm border-0">
        <div class="card-header bg-transparent border-0 pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="mb-0 fw-semibold">Stock Movement History</h5>
                    <span class="badge bg-light text-dark" id="results-count">0 records</span>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary btn-sm" id="export-btn">
                        <i class="bi bi-download me-1"></i>
                        Export
                    </button>
                </div>
            </div>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table custom-table mb-0">
                    <thead>
                        <tr>
                            <th class="ps-4" style="width: 10%"><div class="table-header">ID</div></th>
                            <th style="width: 10%"><div class="table-header">DATE</div></th>
                            <th style="width: 10%"><div class="table-header">TYPE</div></th>
                            <th style="width: 20%"><div class="table-header">PRODUCT</div></th>
                            <th style="width: 10%"><div class="table-header">QUANTITY</div></th>
                            <th style="width: 10%"><div class="table-header">BEFORE</div></th>
                            <th style="width: 10%"><div class="table-header">AFTER</div></th>
                            <th style="width: 10%"><div class="table-header">USER</div></th>
                            <th style="width: 10%"><div class="table-header">REFERENCE</div></th>
                        </tr>
                    </thead>
                    <tbody id="history-table-body">
                        <!-- 动态加载 -->
                    </tbody>
                </table>
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

@endsection

@section("scripts")
<script>
    // Set stock history related URLs
    window.stockHistoryApiRoute = "{{ route('api.stock_history') }}";
    window.stockManagementRoute = "{{ route('staff.stock_management') }}";
    window.productImagePath = "{{ asset('assets/images/products') }}";
    window.defaultProductImage = "{{ asset('assets/img/no-image.png') }}";
</script>

<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/stock-movement/stock-history.js') }}"></script>
@endsection
