@extends("layouts.app")

@section("title", "Size Type Management")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/dashboard-template.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/size-display.css') }}">

<div class="container-fluid py-4">
    {{-- ========================================== --}}
    {{-- 提示信息区域 (Alert Messages Section) --}}
    {{-- ========================================== --}}

    {{-- 成功提示 --}}
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    {{-- 错误提示 --}}
    @if($errors->any())
        <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            @foreach ($errors->all() as $error)
                <div>{{ $error }}</div>
            @endforeach
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    {{-- ========================================== --}}
    {{-- 页面标题和操作区域 (Page Header & Actions) --}}
    {{-- ========================================== --}}
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    {{-- 标题区域 --}}
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-diagram-3-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Size Type Management</h2>
                                <p class="dashboard-subtitle mb-0">Map clothing and shoe sizes to product categories</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.attribute_variant.size_type.create') }}" class="btn btn-primary">
                            <i class="bi bi-plus-circle-fill me-2"></i>
                            Add Size Type
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- ========================================== --}}
    {{-- 统计数据区域 (Statistics Cards Section) --}}
    {{-- ========================================== --}}
    <div class="statistics-section mb-4">
        <div class="row g-4">
            {{-- 总尺码类型数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="total-sizes">0</div>
                                <div class="stats-label">Total Size Types</div>
                            </div>
                            <div class="stats-icon bg-primary">
                                <i class="bi bi-diagram-3"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {{-- 可用尺码类型数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="available-sizes">0</div>
                                <div class="stats-label">Available Types</div>
                            </div>
                            <div class="stats-icon bg-success">
                                <i class="bi bi-check-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {{-- 不可用尺码类型数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="unavailable-sizes">0</div>
                                <div class="stats-label">Unavailable Types</div>
                            </div>
                            <div class="stats-icon bg-danger">
                                <i class="bi bi-x-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {{-- 类别分组数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="category-groups">{{ count($sizeTypes->groupBy(['category.category_name', 'gender.gender_name'])) }}</div>
                                <div class="stats-label">Category Groups</div>
                            </div>
                            <div class="stats-icon bg-info">
                                <i class="bi bi-collection"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- ========================================== --}}
    {{-- 主要内容区域 (Main Content Section) --}}
    {{-- ========================================== --}}
    <div id="table-body" class="size-list">
        {{-- 尺码类型列表将通过JavaScript动态加载 --}}
    </div>

    {{-- 无结果提示 --}}
    <div id="no-results" class="text-center py-4" style="display: none;">
        <div class="text-muted">No size types found</div>
    </div>

    {{-- ========================================== --}}
    {{-- 分页和结果统计 (Pagination & Statistics) --}}
    {{-- ========================================== --}}
    <div class="d-flex justify-content-between align-items-center mt-4">
        {{-- 结果统计信息 --}}
        <div class="pagination-info text-muted">
            Showing <span class="fw-medium" id="showing-start">0</span>
            to <span class="fw-medium" id="showing-end">0</span>
            of <span class="fw-medium" id="total-count">0</span> entries
        </div>

        {{-- 分页导航 --}}
        <nav aria-label="Page navigation">
            <ul id="pagination" class="pagination pagination-sm mb-0">
                <li class="page-item disabled" id="prev-page">
                    <a class="page-link" href="#" aria-label="Previous">
                        <i class="bi bi-chevron-left"></i>
                    </a>
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

{{-- ========================================== --}}
{{-- JavaScript 脚本区域 (Scripts Section) --}}
{{-- ========================================== --}}
@section("scripts")
<script>
    // 设置尺码类型管理相关路由
    window.sizeTypeManagementRoute = "{{ route('admin.attribute_variant.size_type.index') }}";
    window.editSizeTypeUrl = "{{ route('admin.attribute_variant.size_type.edit', ['id' => ':id']) }}";
    window.deleteSizeTypeUrl = "{{ route('admin.attribute_variant.size_type.destroy', ['id' => ':id']) }}";
    window.availableSizeTypeUrl = "{{ route('admin.attribute_variant.size_type.available', ['id' => ':id']) }}";
    window.unavailableSizeTypeUrl = "{{ route('admin.attribute_variant.size_type.unavailable', ['id' => ':id']) }}";
</script>

{{-- 引入尺码类型管理JavaScript文件 --}}
<script src="{{ asset('assets/js/size-type-dashboard.js') }}"></script>
@endsection
