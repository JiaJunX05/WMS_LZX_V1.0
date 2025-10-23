@extends("layouts.app")

@section("title", "Create Category")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">

<div class="container-fluid py-4">
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
                                <i class="bi bi-tags-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Category</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple categories to organize and manage products</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.category.index') }}" class="btn btn-primary">
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

    {{-- =============================================================================
         主要表單 (Main Form)
         ============================================================================= --}}
    <form action="{{ route('admin.category.store') }}" method="post" id="categoryForm" enctype="multipart/form-data">
        @csrf

        <div class="card shadow-sm border-0">
            <div class="row g-0">
            {{-- =============================================================================
                 左側主要內容區域 (Left Content Area)
                 ============================================================================= --}}
                <div class="col-md-4">
                    <div class="config-section d-flex flex-column h-100 bg-light p-4">
                        {{-- 配置标题 --}}
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="mb-0 fw-bold text-primary">
                                <i class="bi bi-gear-fill me-2"></i>Configuration
                            </h6>
                            <span class="badge bg-white text-dark border px-3 py-2">Create</span>
                        </div>
                        {{-- 分類名稱 (Category Name) --}}
                        <div class="mb-4">
                            <label class="form-label">Category Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="category_name" id="category_name" placeholder="Enter category name">
                        </div>

                        {{-- 分類圖片上傳 (Category Image Upload) --}}
                        <div class="mb-4">
                            <label class="form-label">Category Image</label>
                            <div class="img-upload-area" id="imageUploadArea">
                                <div class="img-upload-content" id="imageUploadContent">
                                    <i class="bi bi-cloud-upload fs-1 text-muted mb-3" id="preview-icon"></i>
                                    <h6 class="text-muted">Click to upload image</h6>
                                    <p class="text-muted small">Supports JPG, PNG, GIF formats</p>
                                </div>
                                <img id="preview-image" class="img-preview d-none" alt="Category preview">
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

            {{-- =============================================================================
                 右側操作面板 (Right Sidebar)
                 ============================================================================= --}}
                <div class="col-md-8">
                    <div class="size-values-section p-4">
                        {{-- 表单标题 --}}
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
                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Ready to Configure Categories</h5>
                            <p class="text-muted mb-0">Fill in the category details on the left and click "Add To List"</p>
                        </div>

                        <!-- 分类列表区域 -->
                        <div id="categoryValuesArea" class="d-none">
                            <div class="values-list overflow-auto" id="categoryValuesList" style="max-height: 400px;">
                                <!-- 分类将通过JavaScript动态添加 -->
                            </div>
                        </div>
                        <!-- 提交按钮区域 -->
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
<script>
    // JavaScript URL definitions
    window.createCategoryUrl = "{{ route('admin.category.store') }}";
    window.categoryManagementRoute = "{{ route('admin.category.index') }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/category-management.js') }}"></script>
@endsection


