{{-- ==========================================
    产品管理仪表板
    功能：管理产品，查看统计信息和按分类筛选的产品
    ========================================== --}}

@extends("layouts.app")

@section("title", "Product Management")
@section("content")

{{-- ==========================================
    页面样式文件引入
    ========================================== --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/product-dashboard.css') }}">

{{-- ==========================================
    页面主体内容
    ========================================== --}}
<div class="container-fluid py-4">
    <div class="row g-4">
        {{-- ==========================================
            左侧筛选侧边栏
            ========================================== --}}
        <div class="col-3">
            <div class="filter-sidebar">
                {{-- 筛选头部 --}}
                <div class="filter-header">
                    <div class="d-flex align-items-center">
                        <div class="filter-icon"><i class="bi bi-funnel"></i></div>
                        <h5 class="mb-0">Filters</h5>
                    </div>
                    <button class="btn btn-sm btn-outline-secondary" id="clear-filters">
                        <i class="bi bi-arrow-clockwise me-1"></i>Clear All
                    </button>
                </div>

                {{-- 分类筛选 --}}
                <div class="filter-group">
                    <div class="filter-group-header" data-bs-toggle="collapse" data-bs-target="#filter-categoryCollapse" aria-expanded="true">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-tags me-2"></i><span>Categories</span>
                        </div>
                        <i class="bi bi-chevron-down filter-arrow"></i>
                    </div>
                    <div class="collapse show" id="filter-categoryCollapse">
                        <div class="filter-group-content">
                            {{-- 全部分类选项 --}}
                            <div class="filter-option active" data-category="">
                                <div class="filter-option-icon"><i class="bi bi-grid-3x3-gap-fill"></i></div>
                                <span>All Categories</span>
                                <div class="filter-option-count">{{ $categories->sum('products_count') }}</div>
                            </div>

                            {{-- 分类选项 --}}
                            @foreach($categories as $category)
                            <div class="filter-option" data-category="{{ $category->id }}">
                                <div class="filter-option-icon">
                                    @if($category->category_image)
                                        <img src="{{ asset('assets/images/' . $category->category_image) }}" alt="{{ $category->category_name }}"
                                            class="filter-option-image" onerror="this.onerror=null; this.src='{{ asset('assets/images/placeholder.png') }}';"
                                            title="Image: {{ $category->category_image }}">
                                    @else
                                        <i class="bi bi-tag-fill" title="No image for {{ $category->category_name }}"></i>
                                    @endif
                                </div>
                                <span>{{ $category->category_name }}</span>
                                <div class="filter-option-count">{{ $category->products_count ?? '0' }}</div>
                            </div>
                            @endforeach
                        </div>
                    </div>
                </div>

                {{-- 子分类筛选 --}}
                <div class="filter-group">
                    <div class="filter-group-header" data-bs-toggle="collapse" data-bs-target="#filter-subcategoryCollapse" aria-expanded="false">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-diagram-3 me-2"></i><span>Subcategories</span>
                        </div>
                        <i class="bi bi-chevron-down filter-arrow"></i>
                    </div>
                    <div class="collapse" id="filter-subcategoryCollapse">
                        <div class="filter-group-content">
                            @foreach($subcategories as $subcategory)
                            <div class="filter-checkbox">
                                <input type="checkbox" id="filter-subcategory-{{ $subcategory->id }}" data-subcategory="{{ $subcategory->id }}" class="filter-checkbox-input">
                                <label for="filter-subcategory-{{ $subcategory->id }}" class="filter-checkbox-label">
                                    <span class="filter-checkbox-text">{{ $subcategory->subcategory_name }}</span>
                                    <span class="filter-checkbox-count">{{ $subcategory->products_count ?? '0' }}</span>
                                </label>
                            </div>
                            @endforeach
                        </div>
                    </div>
                </div>

                {{-- 品牌筛选 --}}
                <div class="filter-group">
                    <div class="filter-group-header" data-bs-toggle="collapse" data-bs-target="#filter-brandCollapse" aria-expanded="false">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-award me-2"></i><span>Brands</span>
                        </div>
                        <i class="bi bi-chevron-down filter-arrow"></i>
                    </div>
                    <div class="collapse" id="filter-brandCollapse">
                        <div class="filter-group-content">
                            @foreach($brands as $brand)
                            <div class="filter-checkbox">
                                <input type="checkbox" id="filter-brand-{{ $brand->id }}" data-brand="{{ $brand->id }}" class="filter-checkbox-input">
                                <label for="filter-brand-{{ $brand->id }}" class="filter-checkbox-label">
                                    <span class="filter-checkbox-text">{{ $brand->brand_name }}</span>
                                    <span class="filter-checkbox-count">{{ $brand->products_count ?? '0' }}</span>
                                </label>
                            </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- ==========================================
            右侧内容区域
            ========================================== --}}
        <div class="col-9">
            {{-- 页面头部 --}}
            <div class="dashboard-header mb-4">
                <div class="card shadow-sm border-0">
                    <div class="card-body">
                        <div class="row align-items-center">
                            {{-- 左侧标题区域 --}}
                            <div class="col-lg-8">
                                <div class="d-flex align-items-center">
                                    <div class="header-icon-wrapper me-4"><i class="bi bi-box-fill"></i></div>
                                    <div>
                                        <h2 class="dashboard-title mb-1">Product Management</h2>
                                        <p class="dashboard-subtitle mb-0">Manage your products</p>
                                    </div>
                                </div>
                            </div>
                            @if(Auth::user()->getAccountRole() === 'Admin')
                            {{-- 右侧添加产品按钮 --}}
                            <div class="col-lg-4 text-lg-end">
                                <a href="{{ route('product.create') }}" class="btn btn-primary">
                                    <i class="bi bi-plus-circle-fill me-2"></i>Add Product
                                </a>
                            </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>

            {{-- 消息提示容器 --}}
            <div id="alertContainer" class="mb-4"></div>

            {{-- 搜索区域 --}}
            <div class="card shadow-sm border-0 mb-4">
                <div class="card-body">
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0">
                            <i class="bi bi-search"></i>
                        </span>
                        <input type="search" class="form-control border-start-0" id="search-input" placeholder="Search by SKU...">
                    </div>
                </div>
            </div>

            {{-- 产品列表区域 --}}
            <div class="card shadow-sm border-0">
                <div class="card-body">
                    <div id="product-card-container" class="row g-4" data-url="{{ route('product.index') }}" data-view-url="{{ route('product.view', ['id' => ':id']) }}">
                        {{-- 产品卡片将通过JavaScript动态加载 --}}
                    </div>

                    {{-- 无结果消息 --}}
                    <div id="no-results" class="text-center py-3 d-none">
                        <div class="text-muted">No products found</div>
                    </div>
                </div>
            </div>

            {{-- 分页区域 --}}
            <div class="d-flex justify-content-between align-items-center mt-4">
                {{-- 结果信息 --}}
                <div class="text-muted">
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
    </div>
</div>

@endsection

@section("scripts")
{{-- ==========================================
    页面脚本区域
    ========================================== --}}
{{-- 通用 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/common/status-system.js') }}"></script>

{{-- 产品管理 JavaScript --}}
<script src="{{ asset('assets/js/product-management.js') }}"></script>
@endsection
