@extends("layouts.app")

@section("title", "Product Management")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/product/product-dashboard.css') }}">
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

    <div class="row">
        <!-- 左侧筛选栏 -->
        <div class="col-3">
            <div class="filter-sidebar">
                <!-- 筛选标题 -->
                <div class="filter-header">
                    <div class="d-flex align-items-center">
                        <div class="filter-icon">
                            <i class="bi bi-funnel"></i>
                        </div>
                        <h5 class="mb-0">Filters</h5>
                    </div>
                    <button class="btn btn-sm btn-outline-secondary" id="clear-filters">
                        <i class="bi bi-arrow-clockwise me-1"></i>
                        Clear All
                    </button>
                </div>

                <!-- 主分类筛选 -->
                <div class="filter-group">
                    <div class="filter-group-header" data-bs-toggle="collapse" data-bs-target="#filter-categoryCollapse" aria-expanded="true">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-tags me-2"></i>
                            <span>Categories</span>
                        </div>
                        <i class="bi bi-chevron-down filter-arrow"></i>
                    </div>
                    <div class="collapse show" id="filter-categoryCollapse">
                        <div class="filter-group-content">
                            <div class="filter-option active" data-category="">
                                <div class="filter-option-icon">
                                    <i class="bi bi-grid-3x3-gap-fill"></i>
                                </div>
                                <span>All Categories</span>
                                <div class="filter-option-count">{{ $categories->sum('products_count') }}</div>
                            </div>
                            @foreach($categories as $category)
                            <div class="filter-option" data-category="{{ $category->id }}">
                                <div class="filter-option-icon">
                                    @if($category->category_image)
                                        <img src="{{ asset('assets/images/' . $category->category_image) }}"
                                             alt="{{ $category->category_name }}"
                                             class="filter-option-image"
                                             onerror="this.onerror=null; this.src='{{ asset('assets/images/placeholder.png') }}';"
                                             style="width: 24px; height: 24px; object-fit: cover; border-radius: 4px;"
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

                <!-- 子分类筛选 -->
                <div class="filter-group">
                    <div class="filter-group-header" data-bs-toggle="collapse" data-bs-target="#filter-subcategoryCollapse" aria-expanded="false">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-diagram-3 me-2"></i>
                            <span>Subcategories</span>
                        </div>
                        <i class="bi bi-chevron-down filter-arrow"></i>
                    </div>
                    <div class="collapse" id="filter-subcategoryCollapse">
                        <div class="filter-group-content">
                            @foreach($subcategories as $subcategory)
                            <div class="filter-checkbox">
                                <input type="checkbox" id="filter-subcategory-{{ $subcategory->id }}"
                                       data-subcategory="{{ $subcategory->id }}" class="filter-checkbox-input">
                                <label for="filter-subcategory-{{ $subcategory->id }}" class="filter-checkbox-label">
                                    <span class="filter-checkbox-text">{{ $subcategory->subcategory_name }}</span>
                                    <span class="filter-checkbox-count">{{ $subcategory->products_count ?? '0' }}</span>
                                </label>
                            </div>
                            @endforeach
                        </div>
                    </div>
                </div>

                <!-- 品牌筛选 -->
                <div class="filter-group">
                    <div class="filter-group-header" data-bs-toggle="collapse" data-bs-target="#filter-brandCollapse" aria-expanded="false">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-award me-2"></i>
                            <span>Brands</span>
                        </div>
                        <i class="bi bi-chevron-down filter-arrow"></i>
                    </div>
                    <div class="collapse" id="filter-brandCollapse">
                        <div class="filter-group-content">
                            @foreach($brands as $brand)
                            <div class="filter-checkbox">
                                <input type="checkbox" id="filter-brand-{{ $brand->id }}"
                                       data-brand="{{ $brand->id }}" class="filter-checkbox-input">
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

        <!-- 右侧内容区 -->
        <div class="col-9">
            <!-- 页面标题和添加按钮 -->
            <div class="card shadow-sm border-0 mb-4">
                <div class="card-body">
                    <div class="row justify-content-between align-items-center">
                        <div class="col">
                            <div class="d-flex align-items-center">
                                <div class="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                    <i class="bi bi-box-fill text-primary fs-4"></i>
                                </div>
                                <div>
                                    <h3 class="mb-0 fw-bold">Product Management</h3>
                                    <p class="text-muted mb-0">Manage your products</p>
                                </div>
                            </div>
                        </div>
                        @if(Auth::user()->getAccountRole() === 'SuperAdmin' || Auth::user()->getAccountRole() === 'Admin')
                        <div class="col-auto">
                            <a href="{{ route('product.create') }}" class="btn btn-primary">
                                <i class="bi bi-plus-circle-fill me-2"></i>
                                Add Product
                            </a>
                        </div>
                        @endif
                    </div>
                </div>
            </div>

            <!-- 搜索栏 -->
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

            <!-- 产品列表 -->
            <div class="card shadow-sm border-0">
                <div class="card-body">
                    <div id="product-card-container" class="row g-4"
                         data-url="{{ route('product.index') }}"
                         data-view-url="{{ route('product.view', ['id' => ':id']) }}">
                        <!-- 产品卡片将通过JavaScript动态加载 -->
                    </div>
                    <div id="no-results" class="text-center py-3" style="display: none;">
                        <div class="text-muted">No products found</div>
                    </div>
                </div>
            </div>

            <!-- 分页 -->
            <div class="d-flex justify-content-between align-items-center mt-4">
                <div class="text-muted">
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
<script src="{{ asset('assets/js/product/product-dashboard.js') }}"></script>
@endsection
