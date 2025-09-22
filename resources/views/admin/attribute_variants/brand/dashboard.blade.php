@extends("layouts.app")

@section("title", "Brand Management")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/dashboard-template.css') }}">

<div class="container-fluid py-4">
    <!-- Alert Messages -->
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if($errors->any())
        <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            @foreach ($errors->all() as $error)
                <div>{{ $error }}</div>
            @endforeach
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <!-- 页面标题和添加按钮 -->
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-tag-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Brand Management</h2>
                                <p class="dashboard-subtitle mb-0">Manage and organize product brands</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.attribute_variant.brand.create') }}" class="btn btn-primary">
                            <i class="bi bi-plus-circle-fill me-2"></i>
                            Add Brand
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 统计数据卡片 -->
    <div class="statistics-section mb-4">
        <div class="row g-4">
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="total-brands">0</div>
                                <div class="stats-label">Total Brands</div>
                            </div>
                            <div class="stats-icon bg-primary">
                                <i class="bi bi-tag"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="active-brands">0</div>
                                <div class="stats-label">Active Brands</div>
                            </div>
                            <div class="stats-icon bg-success">
                                <i class="bi bi-check-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="inactive-brands">0</div>
                                <div class="stats-label">Inactive Brands</div>
                            </div>
                            <div class="stats-icon bg-warning">
                                <i class="bi bi-pause-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="brands-with-image">0</div>
                                <div class="stats-label">With Images</div>
                            </div>
                            <div class="stats-icon bg-info">
                                <i class="bi bi-image"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row g-3 align-items-end">
                    <div class="col-lg-6">
                        <label class="form-label fw-medium">Search Brands</label>
                        <div class="search-input-wrapper">
                            <i class="bi bi-search search-icon"></i>
                            <input type="text" class="form-control search-input" id="search-input"
                                   placeholder="Search by brand name...">
                        </div>
                    </div>
                    <div class="col-lg-3">
                        <label class="form-label fw-medium">Filter by Status</label>
                        <select class="form-select" id="status-filter">
                            <option value="">All Status</option>
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                        </select>
                    </div>
                    <div class="col-lg-3">
                        <button class="btn btn-outline-secondary w-100" id="clear-filters">
                            <i class="bi bi-x-circle me-2"></i>
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Brand List Table -->
    <div class="card shadow-sm border-0">
        <div class="card-header bg-transparent border-0 pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="mb-0 fw-semibold">Brand List</h5>
                    <span class="badge bg-light text-dark" id="results-count">Loading...</span>
                </div>
            </div>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table custom-table mb-0">
                    <thead>
                        <tr>
                            <th class="ps-4" style="width: 10%"><div class="table-header">ID</div></th>
                            <th style="width: 15%"><div class="table-header">BRAND IMAGE</div></th>
                            <th style="width: 45%"><div class="table-header">BRAND NAME</div></th>
                            <th style="width: 20%"><div class="table-header">BRAND STATUS</div></th>
                            <th class="text-end pe-4" style="width: 10%"><div class="table-header">ACTIONS</div></th>
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        <!-- Loading State -->
                        <tr>
                            <td colspan="5" class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-2 text-muted">Loading brands...</p>
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
                <!-- Page numbers generated dynamically by JS -->
                <li class="page-item disabled" id="next-page">
                    <a class="page-link" href="#" aria-label="Next">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</div>

<!-- Image Preview Modal -->
<div class="modal fade" id="imagePreviewModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
            <div class="modal-header border-0">
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body text-center p-0">
                <img id="previewImage" src="" alt="Preview" class="img-fluid">
            </div>
        </div>
    </div>
</div>
@endsection

@section("scripts")
<script>
    // Set brand management related URLs
    window.brandManagementRoute = "{{ route('admin.attribute_variant.brand.index') }}";
    window.editBrandUrl = "{{ route('admin.attribute_variant.brand.edit', ['id' => ':id']) }}";
    window.deleteBrandUrl = "{{ route('admin.attribute_variant.brand.destroy', ['id' => ':id']) }}";
    window.availableBrandUrl = "{{ route('admin.attribute_variant.brand.available', ['id' => ':id']) }}";
    window.unavailableBrandUrl = "{{ route('admin.attribute_variant.brand.unavailable', ['id' => ':id']) }}";

    // Pass current user role to JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>
<script src="{{ asset('assets/js/brand-management.js') }}"></script>
@endsection
