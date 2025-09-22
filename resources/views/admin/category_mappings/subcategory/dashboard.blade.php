@extends("layouts.app")

@section("title", "Subcategory Management")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/dashboard-template.css') }}">

<div class="container-fluid py-4">
    <!-- 提示信息 -->
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
                                <i class="bi bi-collection-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Subcategory Management</h2>
                                <p class="dashboard-subtitle mb-0">Manage and organize product subcategories</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.category_mapping.subcategory.create') }}" class="btn btn-primary">
                            <i class="bi bi-plus-circle-fill me-2"></i>
                            Add Subcategory
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
                                <div class="stats-number" id="total-subcategories">0</div>
                                <div class="stats-label">Total Subcategories</div>
                            </div>
                            <div class="stats-icon bg-primary">
                                <i class="bi bi-tags"></i>
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
                                <div class="stats-number" id="active-subcategories">0</div>
                                <div class="stats-label">Active Subcategories</div>
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
                                <div class="stats-number" id="inactive-subcategories">0</div>
                                <div class="stats-label">Inactive Subcategories</div>
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
                                <div class="stats-number" id="subcategories-with-image">0</div>
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
                        <label class="form-label fw-medium">Search Subcategories</label>
                        <div class="search-input-wrapper">
                            <i class="bi bi-search search-icon"></i>
                            <input type="text" class="form-control search-input" id="search-input"
                                   placeholder="Search by subcategory name...">
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

    <!-- Subcategory List Table -->
    <div class="card shadow-sm border-0">
        <div class="card-header bg-transparent border-0 pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="mb-0 fw-semibold">Subcategory List</h5>
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
                            <th style="width: 25%"><div class="table-header">SUBCATEGORY IMAGE</div></th>
                            <th style="width: 25%"><div class="table-header">SUBCATEGORY NAME</div></th>
                            <th style="width: 20%"><div class="table-header">SUBCATEGORY STATUS</div></th>
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
                                <p class="mt-2 text-muted">Loading subcategories...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- 分页和结果统计 -->
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
                <!-- 页码由JS动态生成 -->
                <li class="page-item disabled" id="next-page">
                    <a class="page-link" href="#" aria-label="Next">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</div>

<!-- 图片预览 Modal -->
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

<script>
    // 定义全局变量供JavaScript使用
    window.subcategoryManagementRoute = "{{ route('admin.category_mapping.subcategory.index') }}";
    window.editSubcategoryUrl = "{{ route('admin.category_mapping.subcategory.edit', ['id' => ':id']) }}";
    window.deleteSubcategoryUrl = "{{ route('admin.category_mapping.subcategory.destroy', ['id' => ':id']) }}";
    window.availableSubcategoryUrl = "{{ route('admin.category_mapping.subcategory.available', ['id' => ':id']) }}";
    window.unavailableSubcategoryUrl = "{{ route('admin.category_mapping.subcategory.unavailable', ['id' => ':id']) }}";
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";

</script>
@endsection

@section("scripts")
    <script src="{{ asset('assets/js/subcategory-management.js') }}"></script>
@endsection
