{{-- ==========================================
    子分类管理仪表板
    功能：管理产品子分类，查看统计信息，搜索筛选
    ========================================== --}}

@extends("layouts.app")

@section("title", "Subcategory Management")
@section("content")

{{-- ==========================================
    页面样式文件引入
    ========================================== --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- ==========================================
    页面主体内容
    ========================================== --}}
<div class="container-fluid py-4">

    {{-- ==========================================
        页面头部导航
        ========================================== --}}
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    {{-- 左侧标题区域 --}}
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4"><i class="bi bi-collection-fill"></i></div>
                            <div>
                                <h2 class="dashboard-title mb-1">Subcategory Management</h2>
                                <p class="dashboard-subtitle mb-0">Manage and organize product subcategories</p>
                            </div>
                        </div>
                    </div>
                    {{-- 右侧添加子分类按钮 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.subcategory.create') }}" class="btn btn-primary">
                            <i class="bi bi-plus-circle-fill me-2"></i>Add Subcategory
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- ==========================================
        统计卡片区域
        ========================================== --}}
    <div class="statistics-section mb-4">
        <div class="row g-4">
            {{-- 总子分类数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="total-subcategories">0</div>
                                <div class="stats-label">Total Subcategories</div>
                            </div>
                            <div class="stats-icon bg-primary"><i class="bi bi-tags"></i></div>
                        </div>
                    </div>
                </div>
            </div>
            {{-- 可用子分类数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="active-subcategories">0</div>
                                <div class="stats-label">Available Subcategories</div>
                            </div>
                            <div class="stats-icon bg-success"><i class="bi bi-check-circle"></i></div>
                        </div>
                    </div>
                </div>
            </div>
            {{-- 不可用子分类数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="inactive-subcategories">0</div>
                                <div class="stats-label">Unavailable Subcategories</div>
                            </div>
                            <div class="stats-icon bg-warning"><i class="bi bi-pause-circle"></i></div>
                        </div>
                    </div>
                </div>
            </div>
            {{-- 有图片的子分类数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="subcategories-with-image">0</div>
                                <div class="stats-label">With Images</div>
                            </div>
                            <div class="stats-icon bg-info"><i class="bi bi-image"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- ==========================================
        搜索筛选区域
        ========================================== --}}
    <div class="search-filter-section mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row g-3 align-items-end">
                    {{-- 搜索输入框 --}}
                    <div class="col-lg-6">
                        <label class="form-label fw-medium">Search Subcategories</label>
                        <div class="search-input-wrapper">
                            <i class="bi bi-search search-icon"></i>
                            <input type="text" class="form-control search-input" id="search-input" placeholder="Search by subcategory name...">
                        </div>
                    </div>
                    {{-- 状态筛选 --}}
                    <div class="col-lg-3">
                        <label class="form-label fw-medium">Filter by Status</label>
                        <select class="form-select" id="status-filter"><option value="">All Status</option>
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                        </select>
                    </div>
                    {{-- 清除筛选按钮 --}}
                    <div class="col-lg-3">
                        <button class="btn btn-outline-secondary w-100" id="clear-filters">
                            <i class="bi bi-x-circle me-2"></i>Clear Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- ==========================================
        子分类列表表格
        ========================================== --}}
    <div class="card shadow-sm border-0">
        <div class="card-header bg-transparent border-0 pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="mb-0 fw-semibold">Subcategory List</h5>
                    <span class="badge bg-light text-dark" id="results-count">Loading...</span>
                </div>
                <button class="btn btn-outline-success" id="export-subcategories-btn" disabled>
                    <i class="bi bi-download me-2"></i>Export Data
                </button>
            </div>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="ps-4" style="width: 5%">
                                <div class="fw-bold text-muted small text-uppercase">
                                    <input type="checkbox" name="select-all" id="select-all" style="width: 20px; height: 20px;">
                                </div>
                            </th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">SUBCATEGORY IMAGE</div></th>
                            <th style="width: 60%"><div class="fw-bold text-muted small text-uppercase">SUBCATEGORY NAME</div></th>
                            <th style="width: 15%"><div class="fw-bold text-muted small text-uppercase">SUBCATEGORY STATUS</div></th>
                            <th class="text-end pe-4" style="width: 10%">
                                <div class="fw-bold text-muted small text-uppercase">ACTIONS</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        {{-- 加载状态 --}}
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

    {{-- ==========================================
        分页导航区域
        ========================================== --}}
    <div class="d-flex justify-content-between align-items-center mt-4">
        {{-- 分页信息 --}}
        <div class="pagination-info text-muted">
            Showing <span class="fw-medium" id="showing-start">0</span>
            to <span class="fw-medium" id="showing-end">0</span>
            of <span class="fw-medium" id="total-count">0</span> entries
        </div>
        {{-- 分页控件 --}}
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
{{-- ==========================================
    页面脚本区域
    ========================================== --}}
<script>
    {{-- 子分类管理路由配置 --}}
    window.subcategoryManagementRoute = "{{ route('admin.subcategory.index') }}";
    window.editSubcategoryUrl = "{{ route('admin.subcategory.edit', ['id' => ':id']) }}";
    window.deleteSubcategoryUrl = "{{ route('admin.subcategory.destroy', ['id' => ':id']) }}";
    window.availableSubcategoryUrl = "{{ route('admin.subcategory.available', ['id' => ':id']) }}";
    window.unavailableSubcategoryUrl = "{{ route('admin.subcategory.unavailable', ['id' => ':id']) }}";
    window.subcategoryExportUrl = "{{ route('admin.subcategory.export') }}";

    {{-- 传递当前用户角色给JavaScript --}}
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/subcategory-management.js') }}"></script>
@endsection
