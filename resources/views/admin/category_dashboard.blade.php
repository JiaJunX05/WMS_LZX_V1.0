{{-- ==========================================
    分类管理仪表板页面
    功能：分类列表展示、搜索筛选、分页管理、分类操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Category Management")
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
                            <div class="header-icon-wrapper me-4"><i class="bi bi-tags-fill"></i></div>
                            <div>
                                <h2 class="dashboard-title mb-1">Category Management</h2>
                                <p class="dashboard-subtitle mb-0">Manage and organize product categories</p>
                            </div>
                        </div>
                    </div>
                    {{-- 右侧添加分类按钮 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.category.create') }}" class="btn btn-primary">
                            <i class="bi bi-plus-circle-fill me-2"></i>Add Category
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
            {{-- 总分类数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="total-categories">0</div>
                                <div class="stats-label">Total Categories</div>
                            </div>
                            <div class="stats-icon bg-primary"><i class="bi bi-tags"></i></div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- 可用分类数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="active-categories">0</div>
                                <div class="stats-label">Available Categories</div>
                            </div>
                            <div class="stats-icon bg-success"><i class="bi bi-check-circle"></i></div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- 不可用分类数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="inactive-categories">0</div>
                                <div class="stats-label">Unavailable Categories</div>
                            </div>
                            <div class="stats-icon bg-warning"><i class="bi bi-pause-circle"></i></div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- 有图片的分类数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="categories-with-image">0</div>
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
                        <label class="form-label fw-medium">Search Categories</label>
                        <div class="search-input-wrapper">
                            <i class="bi bi-search search-icon"></i>
                            <input type="text" class="form-control search-input" id="search-input" placeholder="Search by category name...">
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
        分类列表表格
        ========================================== --}}
    <div class="card shadow-sm border-0">
        <div class="card-header bg-transparent border-0 pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="mb-0 fw-semibold">Category List</h5>
                    <span class="badge bg-light text-dark" id="results-count">Loading...</span>
                </div>
                {{-- 导出按钮 --}}
                <button class="btn btn-outline-success" id="export-categories-btn" disabled>
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
                                    <input type="checkbox" class="form-check-input" id="select-all" style="width: 20px; height: 20px;">
                                </div>
                            </th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">CATEGORY IMAGE</div></th>
                            <th style="width: 60%"><div class="fw-bold text-muted small text-uppercase">CATEGORY NAME</div></th>
                            <th style="width: 15%"><div class="fw-bold text-muted small text-uppercase">CATEGORY STATUS</div></th>
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
                                <p class="mt-2 text-muted">Loading categories...</p>
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

{{-- 分类管理路由配置 --}}
<script>
    // 设置分类管理相关URL
    window.categoryManagementRoute = "{{ route('admin.category.index') }}";
    window.editCategoryUrl = "{{ route('admin.category.edit', ['id' => ':id']) }}";
    window.deleteCategoryUrl = "{{ route('admin.category.destroy', ['id' => ':id']) }}";
    window.availableCategoryUrl = "{{ route('admin.category.available', ['id' => ':id']) }}";
    window.unavailableCategoryUrl = "{{ route('admin.category.unavailable', ['id' => ':id']) }}";
    window.categoryExportUrl = "{{ route('admin.category.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/category-management.js') }}"></script>
@endsection
