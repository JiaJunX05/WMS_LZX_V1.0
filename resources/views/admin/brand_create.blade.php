@extends("layouts.app")

@section("title", "Create Brand")
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
                                <i class="bi bi-tag-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Brand</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple brands to organize and manage products</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.brand.index') }}" class="btn btn-primary">
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
    <form action="{{ route('admin.brand.store') }}" method="post" id="brandForm" enctype="multipart/form-data">
        @csrf
        <div class="row">
            {{-- =============================================================================
                 左側主要內容區域 (Left Content Area)
                 ============================================================================= --}}
            <div class="col-lg-4">
                {{-- 品牌基本信息卡片 (Brand Basic Information Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Brand Information</h5>
                    </div>
                    <div class="card-body">
                        {{-- 品牌名稱 (Brand Name) --}}
                        <div class="mb-3">
                            <label class="form-label">Brand Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="brand_name" id="brand_name" placeholder="Enter brand name">
                        </div>

                        {{-- 品牌圖片上傳 (Brand Image Upload) --}}
                        <div class="mb-3">
                            <label class="form-label">Brand Image</label>
                            <div class="image-upload-area" id="imageUploadArea">
                                <div class="image-upload-content" id="imageUploadContent">
                                    <i class="bi bi-cloud-upload fs-1 text-muted mb-3" id="preview-icon"></i>
                                    <h6 class="text-muted">Click to upload image</h6>
                                    <p class="text-muted small">Supports JPG, PNG, GIF formats</p>
                                </div>
                                <img id="preview-image" class="preview-image d-none" alt="Brand preview">
                            </div>
                            <input type="file" class="d-none" id="brand_image" name="brand_image" accept="image/*">
                        </div>
                    </div>

                    {{-- 操作按钮区域 --}}
                    <div class="card-footer">
                        <div class="d-flex gap-3">
                            <button type="button" class="btn btn-primary flex-fill" id="addBrand">
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
                {{-- 品牌管理卡片 (Brand Management Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">Brand Management</h5>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="sortBrands" title="Sort brands">
                                    <i class="bi bi-sort-down" id="sortIcon"></i>
                                </button>
                                <span class="badge bg-primary" id="brandValuesCount">0 brands</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Ready to Configure Brands</h5>
                            <p class="text-muted mb-0">Fill in the brand details on the left and click "Add To List"</p>
                        </div>

                        <!-- 品牌列表区域 -->
                        <div id="brandValuesArea" class="d-none">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th class="text-center" style="width: 8%">#</th>
                                            <th style="width: 60%">BRAND INFORMATION</th>
                                            <th class="text-end" style="width: 32%">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody id="brandValuesList"></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 品牌输入提示 -->
                        <div id="brandInputPrompt" class="text-center text-muted py-4 d-none">
                            <i class="bi bi-arrow-up-circle fs-1 text-muted mb-3"></i>
                            <h6 class="text-muted">Add More Brands</h6>
                            <p class="text-muted small">Enter brand details in the left panel to continue</p>
                        </div>
                    </div>

                    <!-- 提交按钮区域 -->
                    <div id="submitSection" class="card-footer d-none">
                        <div class="d-grid">
                            <button type="submit" class="btn btn-success btn-lg py-3">
                                <i class="bi bi-stack me-2"></i>Create All Brands
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
    window.createBrandUrl = "{{ route('admin.brand.store') }}";
    window.brandManagementRoute = "{{ route('admin.brand.index') }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/brand-management.js') }}"></script>
@endsection
