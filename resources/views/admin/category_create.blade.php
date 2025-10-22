@extends("layouts.app")

@section("title", "Create Category")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
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
        <div class="row">
            {{-- =============================================================================
                 左側主要內容區域 (Left Content Area)
                 ============================================================================= --}}
            <div class="col-lg-4">
                {{-- 分類基本信息卡片 (Category Basic Information Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Category Information</h5>
                    </div>
                    <div class="card-body">
                        {{-- 分類名稱 (Category Name) --}}
                        <div class="mb-3">
                            <label class="form-label">Category Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="category_name" id="category_name" placeholder="Enter category name">
                        </div>

                        {{-- 分類圖片上傳 (Category Image Upload) --}}
                        <div class="mb-3">
                            <label class="form-label">Category Image</label>
                            <div class="image-upload-area" id="imageUploadArea">
                                <div class="image-upload-content" id="imageUploadContent">
                                    <i class="bi bi-cloud-upload fs-1 text-muted mb-3" id="preview-icon"></i>
                                    <h6 class="text-muted">Click to upload image</h6>
                                    <p class="text-muted small">Supports JPG, PNG, GIF formats</p>
                                </div>
                                <img id="preview-image" class="preview-image d-none" alt="Category preview">
                            </div>
                            <input type="file" class="d-none" id="category_image" name="category_image" accept="image/*">
                        </div>
                    </div>

                    {{-- 操作按钮区域 --}}
                    <div class="card-footer">
                        <div class="d-flex gap-3">
                            <button type="button" class="btn btn-primary flex-fill" id="addCategory">
                                <i class="bi bi-plus-circle me-2"></i>Add To List
                            </button>
                            <button type="button" class="btn btn-outline-secondary" id="clearForm">
                                <i class="bi bi-x-circle me-2"></i>Clear All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {{-- =============================================================================
                 右側操作面板 (Right Sidebar)
                 ============================================================================= --}}
            <div class="col-lg-8">
                {{-- 分類管理卡片 (Category Management Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">Category Management</h5>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="sortCategories" title="Sort categories">
                                    <i class="bi bi-sort-down" id="sortIcon"></i>
                                </button>
                                <span class="badge bg-primary" id="categoryValuesCount">0 categories</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Ready to Configure Categories</h5>
                            <p class="text-muted mb-0">Fill in the category details on the left and click "Add To List"</p>
                        </div>

                        <!-- 分类列表区域 -->
                        <div id="categoryValuesArea" class="d-none">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th class="text-center" style="width: 8%">#</th>
                                            <th style="width: 60%">CATEGORY INFORMATION</th>
                                            <th class="text-end" style="width: 32%">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody id="categoryValuesList"></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 分类输入提示 -->
                        <div id="categoryInputPrompt" class="text-center text-muted py-4 d-none">
                            <i class="bi bi-arrow-up-circle fs-1 text-muted mb-3"></i>
                            <h6 class="text-muted">Add More Categories</h6>
                            <p class="text-muted small">Enter category details in the left panel to continue</p>
                        </div>
                    </div>

                    <!-- 提交按钮区域 -->
                    <div id="submitSection" class="card-footer d-none">
                        <div class="d-grid">
                            <button type="submit" class="btn btn-success btn-lg py-3">
                                <i class="bi bi-stack me-2"></i>Create All Categories
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
    window.createCategoryUrl = "{{ route('admin.category.store') }}";
    window.categoryManagementRoute = "{{ route('admin.category.index') }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/category-management.js') }}"></script>
@endsection


