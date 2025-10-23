@extends("layouts.app")

@section("title", "Stock Detail")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

<div class="container-fluid py-4">
    <!-- 页面标题 -->
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-box-seam"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Stock Detail</h2>
                                <p class="dashboard-subtitle mb-0" id="product-detail-subtitle">
                                    Product stock information and movement history
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

    <!-- 产品基本信息 -->
    <div class="card shadow-sm border-0 mb-4">
        <div class="card-header bg-transparent border-0 pb-3">
            <h5 class="mb-0 fw-semibold">Product Information</h5>
        </div>
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-lg-4 text-center">
                    <img id="product-image" src="{{ asset('assets/img/no-image.png') }}"
                         alt="Product Image" class="img-fluid rounded shadow-sm"
                         style="max-width: 180px; max-height: 180px; object-fit: cover;">
                </div>
                <div class="col-lg-8">
                    <div class="row g-4">
                        <div class="col-12">
                            <label class="form-label fw-medium text-muted mb-2">Product Name</label>
                            <h4 class="mb-0" id="product-name">-</h4>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-medium text-muted mb-2">Current Stock</label>
                            <div class="d-flex align-items-center">
                                <span class="fs-3 fw-bold me-2" id="current-stock">-</span>
                                <small class="text-muted">units</small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-medium text-muted mb-2">Status</label>
                            <div>
                                <span class="badge ${product.product_status === 'Available' ? 'bg-success' : 'bg-danger'} fs-6" id="product-status">-</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 库存历史表格 -->
    <div class="card shadow-sm border-0">
        <div class="card-header bg-transparent border-0 pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="mb-0 fw-semibold">Stock Movement History</h5>
                    <span class="badge bg-light text-dark" id="detail-history-count">0 records</span>
                </div>
            </div>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="ps-4" style="width: 10%"><div class="fw-bold text-muted small text-uppercase">ID</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">DATE</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">TYPE</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">QUANTITY</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">BEFORE</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">AFTER</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">USER</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">REFERENCE</div></th>
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
            Showing <span class="fw-medium" id="detail-showing-start">0</span>
            to <span class="fw-medium" id="detail-showing-end">0</span>
            of <span class="fw-medium" id="detail-total-count">0</span> entries
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
    // Set stock detail related URLs
    window.stockHistoryApiRoute = "{{ route('api.stock_history') }}";
    window.stockManagementRoute = "{{ route('staff.stock_management') }}";
    window.productImagePath = "{{ asset('assets/images/products') }}";
    window.defaultProductImage = "{{ asset('assets/img/no-image.png') }}";

    // Get product ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        window.currentProductId = productId;
        console.log('Product ID from URL:', productId);
    } else {
        console.error('No product ID found in URL');
        // Redirect back to dashboard if no ID
        window.location.href = window.stockManagementRoute;
    }
</script>

<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/stock-management.js') }}"></script>
@endsection
