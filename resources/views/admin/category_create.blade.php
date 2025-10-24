{{-- ==========================================
    分类创建页面
    功能：创建单个或多个分类，管理产品分类
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Category")
@section("content")

{{-- ==========================================
    页面样式文件引入
    ========================================== --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">

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
                                <h2 class="dashboard-title mb-1">Create Category</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple categories to organize and manage products</p>
                            </div>
                        </div>
                    </div>
                    {{-- 右侧返回按钮 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.category.index') }}" class="btn btn-primary">
                            <i class="bi bi-arrow-left me-2"></i>Back to List
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- ==========================================
        分类创建表单
        ========================================== --}}
    <form action="{{ route('admin.category.store') }}" method="post" id="categoryForm" enctype="multipart/form-data">
        @csrf

        <div class="card shadow-sm border-0">
            <div class="row g-0">
                {{-- ==========================================
                    左侧配置区域
                    ========================================== --}}
                <div class="col-md-4">
                    <div class="config-section d-flex flex-column h-100 bg-light p-4">
                        {{-- 配置标题 --}}
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="mb-0 fw-bold text-primary">
                                <i class="bi bi-gear-fill me-2"></i>Configuration
                            </h6>
                            <span class="badge bg-white text-dark border px-3 py-2">Create</span>
                        </div>

                        {{-- 分类名称输入 --}}
                        <div class="mb-4">
                            <label class="form-label">Category Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="category_name" id="category_name" placeholder="Enter category name">
                        </div>

                        {{-- 分类图片上传 --}}
                        <div class="mb-4">
                            <label class="form-label">Category Image</label>
                            <div class="img-upload-area" id="imageUploadArea">
                                <div class="img-upload-content" id="imageUploadContent">
                                    <i class="bi bi-cloud-upload fs-1 text-muted mb-3" id="preview-icon"></i>
                                    <h6 class="text-muted">Click to upload image</h6>
                                    <p class="text-muted small">Supports JPG, PNG, GIF formats</p>
                                </div>
                                <img id="img-preview" class="img-preview d-none" alt="Category preview">
                            </div>
                            <input type="file" class="d-none" id="category_image" name="category_image" accept="image/*">
                        </div>

                        {{-- 操作按钮区域 --}}
                        <div class="mt-auto">
                            <div class="d-flex gap-3">
                                <button type="button" class="btn btn-success flex-fill" id="addCategory">
                                    <i class="bi bi-plus-circle me-2"></i>Add To List
                                </button>
                                <button type="button" class="btn btn-outline-danger" id="clearForm">
                                    <i class="bi bi-x-circle me-2"></i>Clear All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- ==========================================
                    右侧分类管理区域
                    ========================================== --}}
                <div class="col-md-8">
                    <div class="size-values-section p-4">
                        {{-- 管理区域标题 --}}
                        <div class="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h6 class="mb-0 fw-bold">
                                    <i class="bi bi-tags me-2"></i>Category Management
                                </h6>
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Manage and organize your categories below.
                                </small>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="sortCategories" title="Sort categories">
                                    <i class="bi bi-sort-down" id="sortIcon"></i>
                                </button>
                                <span class="badge bg-primary" id="categoryValuesCount">0 categories</span>
                            </div>
                        </div>

                        {{-- 初始提示信息 --}}
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Ready to Configure Categories</h5>
                            <p class="text-muted mb-0">Fill in the category details on the left and click "Add To List"</p>
                        </div>

                        {{-- 分类列表区域 --}}
                        <div id="categoryValuesArea" class="d-none">
                            <div class="values-list overflow-auto" id="categoryValuesList" style="max-height: 400px;"></div>
                        </div>

                        {{-- 提交按钮区域 --}}
                        <div id="submitSection" class="mt-4 d-none">
                            <div class="d-grid">
                                <button type="submit" class="btn btn-success">
                                    <i class="bi bi-stack me-2"></i>Create All Categories
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>

@endsection

@section("scripts")
{{-- ==========================================
    页面脚本区域
    ========================================== --}}

{{-- 分类管理路由配置 --}}
<script>
    window.createCategoryUrl = "{{ route('admin.category.store') }}";
    window.categoryManagementRoute = "{{ route('admin.category.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/category-management.js') }}"></script>
@endsection
