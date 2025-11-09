{{-- ==========================================
    库存历史页面 - 查看库存变动记录
    ========================================== --}}

@extends("layouts.app")

@section("title", "Stock History")
@section("content")


{{-- CSS 文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 主容器 --}}
<div class="container-fluid py-4">
    {{-- 页面标题区域 --}}
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-12">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper d-flex align-items-center justify-content-center me-4">
                                <i class="bi bi-clock-history text-white display-6"></i>
                            </div>
                            <div>
                                <h2 class="h3 fw-bold mb-1">Stock History</h2>
                                <p class="text-muted mb-0" id="dashboard-subtitle">{{ Auth::user()->getAccountRole() === 'Staff' ? 'View your stock movement records' : 'View all stock movement records' }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    {{-- 统计卡片 - 仅对管理员和超级管理员可见 --}}
    @if(in_array(Auth::user()->getAccountRole(), ['Admin', 'SuperAdmin']))
        <div class="statistics-section mb-4">
            <div class="row g-4">
                <div class="col-xl-2 col-md-4 col-sm-6">
                    <div class="stats-card">
                        <div class="stats-card-body">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <div class="stats-number" id="totalStockIn">0</div>
                                    <div class="small text-muted fw-medium text-uppercase">Total Stock In</div>
                                </div>
                                <div class="d-flex align-items-center justify-content-center rounded bg-success icon-size-3rem">
                                    <i class="bi bi-arrow-up-circle-fill text-white fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-2 col-md-4 col-sm-6">
                    <div class="stats-card">
                        <div class="stats-card-body">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <div class="stats-number" id="totalStockOut">0</div>
                                    <div class="small text-muted fw-medium text-uppercase">Total Stock Out</div>
                                </div>
                                <div class="d-flex align-items-center justify-content-center rounded bg-danger icon-size-3rem">
                                    <i class="bi bi-arrow-down-circle-fill text-white fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-2 col-md-4 col-sm-6">
                    <div class="stats-card">
                        <div class="stats-card-body">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <div class="stats-number" id="netChange">0</div>
                                    <div class="small text-muted fw-medium text-uppercase">Net Change</div>
                                </div>
                                <div class="d-flex align-items-center justify-content-center rounded bg-primary icon-size-3rem">
                                    <i class="bi bi-graph-up text-white fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-2 col-md-4 col-sm-6">
                    <div class="stats-card">
                        <div class="stats-card-body">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <div class="stats-number" id="totalMovements">0</div>
                                    <div class="small text-muted fw-medium text-uppercase">Total Movements</div>
                                </div>
                                <div class="d-flex align-items-center justify-content-center rounded bg-info icon-size-3rem">
                                    <i class="bi bi-activity text-white fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-2 col-md-4 col-sm-6">
                    <div class="stats-card">
                        <div class="stats-card-body">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <div class="stats-number" id="currentTotalStock">0</div>
                                    <div class="small text-muted fw-medium text-uppercase">Current Stock</div>
                                </div>
                                <div class="d-flex align-items-center justify-content-center rounded bg-secondary icon-size-3rem">
                                    <i class="bi bi-box-seam text-white fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-2 col-md-4 col-sm-6">
                    <div class="stats-card">
                        <div class="stats-card-body">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <div class="stats-number" id="lowStockCount">0</div>
                                    <div class="small text-muted fw-medium text-uppercase">Low Stock Items</div>
                                </div>
                                <div class="d-flex align-items-center justify-content-center rounded bg-warning icon-size-3rem">
                                    <i class="bi bi-exclamation-triangle-fill text-white fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endif

    {{-- 筛选表单 --}}
    <div class="mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row g-3 align-items-end">
                    <div class="col-lg-3">
                        <label class="form-label fw-medium">Product</label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-search"></i>
                            </span>
                            <input type="text" class="form-control" id="search-input" placeholder="Search by product name or SKU...">
                        </div>
                    </div>
                    <div class="col-lg-2">
                        <label class="form-label fw-medium">Movement Type</label>
                        <select class="form-select" id="movement-type-filter">
                            <option value="">All Types</option>
                            <option value="stock_in">Stock In</option>
                            <option value="stock_out">Stock Out</option>
                            <option value="stock_return">Stock Return</option>
                        </select>
                    </div>
                    <div class="col-lg-2">
                        <label class="form-label fw-medium">Start Date</label>
                        <input type="date" class="form-control" id="start-date-filter" name="start-date-filter">
                    </div>
                    <div class="col-lg-2">
                        <label class="form-label fw-medium">End Date</label>
                        <input type="date" class="form-control" id="end-date-filter" name="end-date-filter">
                    </div>
                    <div class="col-lg-3">
                        <button class="btn btn-outline-secondary w-100" id="clear-filters">
                            <i class="bi bi-x-circle me-2"></i>Clear Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- 库存历史表格 --}}
    @include('stock_movement.components.history-data-table')

    {{-- 分页和结果统计 --}}
    <div class="d-flex justify-content-between align-items-center mt-4">
        {{-- 分页信息 --}}
        <div class="text-muted">
            Showing <span class="fw-medium" id="showing-start">0</span>
            to <span class="fw-medium" id="showing-end">0</span>
            of <span class="fw-medium" id="total-count">0</span> entries
        </div>

        {{-- 分页控件 --}}
        <nav aria-label="Page navigation">
            <ul id="pagination" class="pagination">
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
{{-- 库存历史相关 URL --}}
<script>
    // 库存历史相关 URL
    window.stockHistoryApiRoute = "{{ route('api.stock_history') }}";
    window.stockManagementRoute = "{{ route('staff.stock_management') }}";
    window.productImagePath = "{{ asset('assets/images') }}";
    window.defaultProductImage = "{{ asset('assets/img/no-image.png') }}";
</script>

{{-- 库存历史 JavaScript 文件 --}}
<script src="{{ asset('assets/js/stock-management.js') }}"></script>
@endsection
