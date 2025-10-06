@extends("layouts.app")

@section("title", "Create Category")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-table-list.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-quick-action.css') }}">

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
                                <i class="bi bi-plus-circle-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Category</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple categories to organize and manage products</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.category_mapping.category.index') }}" class="btn btn-primary">
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

    <!-- 主要内容卡片 - 左右布局 -->
    <form action="{{ route('admin.category_mapping.category.store') }}" method="post" id="categoryForm" enctype="multipart/form-data">
        @csrf
        <div class="card shadow-sm border-0">
            <div class="row g-0">
                <!-- 左侧配置区域 -->
                <div class="col-md-3">
                    <div class="config-section d-flex flex-column h-100 p-4">
                        <!-- 配置标题 -->
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="mb-0 fw-bold text-primary">
                                <i class="bi bi-gear-fill me-2"></i>Configuration
                            </h6>
                            <span class="badge bg-white text-dark border px-3 py-2">Step 1</span>
                        </div>

                        <!-- 配置内容 -->
                        <div class="config-content flex-grow-1">
                            <!-- 分类名称输入 -->
                            <div class="mb-4">
                                <label for="category_name" class="form-label fw-bold">Category Name <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-tag text-primary"></i>
                                    </span>
                                    <input type="text" class="form-control border-start-0" id="category_name" name="category_name"
                                           placeholder="Enter category name">
                                    <button type="button" class="btn btn-outline-primary" id="addCategory">
                                        <i class="bi bi-plus-circle"></i>
                                    </button>
                                </div>
                                <small class="text-muted">Enter the category name and click + to add</small>
                                <div class="mt-2">
                                    <small class="text-info">
                                        <i class="bi bi-info-circle me-1"></i>
                                        <span id="categoryCountText">No categories added yet</span>
                                    </small>
                                </div>
                            </div>

                            <!-- 分类图片上传 -->
                            <div class="mb-4">
                                <label for="category_image" class="form-label fw-bold">Category Image</label>
                                <div class="image-upload-container">
                                    <input type="file" class="form-control" id="category_image" name="category_image"
                                           accept="image/*" style="display: none;">
                                    <div class="image-upload-area" id="imageUploadArea">
                                        <div class="image-upload-content" id="imageUploadContent">
                                            <i class="bi bi-cloud-upload fs-1 text-muted mb-3" id="preview-icon"></i>
                                            <h6 class="text-muted">Click to upload image</h6>
                                            <p class="text-muted small">Supports JPG, PNG, GIF formats</p>
                                        </div>
                                        <img id="preview-image" class="preview-image d-none" alt="Category preview">
                                    </div>
                                </div>
                                <small class="text-muted">Optional: Upload an image to represent this category</small>
                            </div>

                            <!-- 配置摘要 -->
                            <div class="config-summary" id="configSummary" style="display: none;">
                                <div class="alert alert-info border-0 bg-white">
                                    <div class="d-flex align-items-center mb-2">
                                        <i class="bi bi-info-circle-fill text-primary me-2"></i>
                                        <strong>Configuration Summary</strong>
                                    </div>
                                    <div class="summary-details">
                                        <div class="mb-1">
                                            <i class="bi bi-tag me-2 text-muted"></i>
                                            <span>Categories: &nbsp;<strong id="selectedCategory">None</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 快速操作 -->
                            <div class="quick-actions mt-auto">
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-outline-success" id="addCommonCategories">
                                        <i class="bi bi-list-ul me-2"></i>Add Common Categories
                                    </button>
                                    <button type="button" class="btn btn-outline-info" id="addFashionCategories">
                                        <i class="bi bi-shop me-2"></i>Add Fashion Categories
                                    </button>
                                    <hr class="my-2">
                                    <button type="button" class="btn btn-outline-secondary" id="clearForm">
                                        <i class="bi bi-x-circle me-2"></i>Clear All
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧分类列表区域 -->
                <div class="col-md-9">
                    <div class="card-body p-4">
                        <!-- 表单标题 -->
                        <h2 class="text-primary text-center mb-3">Categories</h2>
                        <p class="text-muted text-center">Add categories for organizing and managing products</p>
                        <hr>

                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Configure Categories</h5>
                            <p class="text-muted">Add category names from the left panel</p>
                        </div>

                        <!-- 分类列表区域 -->
                        <div id="categoryValuesArea" style="display: none;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">
                                    <i class="bi bi-collection text-primary me-2"></i>Categories
                                    <span class="text-muted" id="categoryName"></span>
                                </h5>
                                <div class="d-flex align-items-center gap-2">
                                    <button type="button" class="btn btn-sm btn-outline-secondary" id="sortCategories" title="Sort categories">
                                        <i class="bi bi-sort-down" id="sortIcon"></i>
                                    </button>
                                    <span class="badge bg-info" id="categoryValuesCount">0 categories</span>
                                </div>
                            </div>

                            <div class="values-list" id="categoryValuesList">
                                <!-- 分类将通过JavaScript动态添加 -->
                            </div>
                        </div>

                        <!-- 分类输入提示 -->
                        <div id="categoryInputPrompt" class="text-center text-muted py-4" style="display: none;">
                            <i class="bi bi-arrow-up-circle fs-1 text-muted mb-3"></i>
                            <h6 class="text-muted">Add Categories</h6>
                            <p class="text-muted small">Enter category names in the left panel</p>
                        </div>

                        <!-- 状态选择 -->
                        <div class="mb-4" id="statusSelection" style="display: none;">
                            <hr class="my-4">
                            <h5 class="mb-3">
                                <i class="bi bi-toggle-on text-primary me-2"></i>Category Status
                            </h5>
                            <div class="row g-3">
                                <div class="col-md-6">
                                        <div class="card h-100 status-card selected" data-status="Available">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="category_status" value="Available" class="form-check-input me-3" checked>
                                            <div>
                                                <div class="fw-semibold text-success">
                                                    <i class="bi bi-check-circle-fill me-2"></i>Available
                                                </div>
                                                <small class="text-muted">Categories will be active and usable</small>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                        <div class="card h-100 status-card" data-status="Unavailable">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="category_status" value="Unavailable" class="form-check-input me-3">
                                            <div>
                                                <div class="fw-semibold text-secondary">
                                                    <i class="bi bi-slash-circle-fill me-2"></i>Unavailable
                                                </div>
                                                <small class="text-muted">Categories will be inactive</small>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 提交按钮 -->
                        <div id="submitSection" style="display: none;">
                            <hr class="my-4">
                            <button type="submit" class="btn btn-primary w-100 btn-lg">
                                <i class="bi bi-stack me-2"></i>Create Categories
                            </button>
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
    window.createCategoryUrl = "{{ route('admin.category_mapping.category.store') }}";
    window.categoryManagementRoute = "{{ route('admin.category_mapping.category.index') }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-handler.js') }}"></script>
<script src="{{ asset('assets/js/common/category-common.js') }}"></script>
<script src="{{ asset('assets/js/category-mapping/category-create.js') }}"></script>
@endsection


