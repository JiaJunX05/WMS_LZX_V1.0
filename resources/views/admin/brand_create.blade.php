{{-- ==========================================
    品牌创建页面
    功能：创建新的产品品牌
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Brand")
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
                            <div class="header-icon-wrapper me-4"><i class="bi bi-tag-fill"></i></div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Brand</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple brands to organize and manage products</p>
                            </div>
                        </div>
                    </div>
                    {{-- 右侧返回按钮 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.brand.index') }}" class="btn btn-primary">
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
        品牌创建表单
        ========================================== --}}
    <form action="{{ route('admin.brand.store') }}" method="post" id="brandForm" enctype="multipart/form-data">
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

                        {{-- 品牌名称输入 --}}
                        <div class="mb-4">
                            <label class="form-label">Brand Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="brand_name" id="brand_name" placeholder="Enter brand name">
                        </div>

                        {{-- 品牌图片上传 --}}
                        <div class="mb-4">
                            <label class="form-label">Brand Image</label>
                            <div class="img-upload-area" id="imageUploadArea">
                                <div class="img-upload-content" id="imageUploadContent">
                                    <i class="bi bi-cloud-upload fs-1 text-muted mb-3" id="preview-icon"></i>
                                    <h6 class="text-muted">Click to upload image</h6>
                                    <p class="text-muted small">Supports JPG, PNG, GIF formats</p>
                                </div>
                                <img id="img-preview" class="img-preview d-none" alt="Brand preview">
                            </div>
                            <input type="file" class="d-none" id="brand_image" name="brand_image" accept="image/*">
                        </div>

                        {{-- 操作按钮区域 --}}
                        <div class="mt-auto">
                            <div class="d-flex gap-3">
                                <button type="button" class="btn btn-success flex-fill" id="addBrand">
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
                    右侧品牌管理区域
                    ========================================== --}}
                <div class="col-md-8">
                    <div class="size-values-section p-4">
                        {{-- 管理区域标题 --}}
                        <div class="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h6 class="mb-0 fw-bold">
                                    <i class="bi bi-tag me-2"></i>Brand Management
                                </h6>
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>Manage and organize your brands below.
                                </small>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="sortBrands" title="Sort brands">
                                    <i class="bi bi-sort-down" id="sortIcon"></i>
                                </button>
                                <span class="badge bg-primary" id="brandValuesCount">0 brands</span>
                            </div>
                        </div>

                        {{-- 初始提示信息 --}}
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Ready to Configure Brands</h5>
                            <p class="text-muted mb-0">Fill in the brand details on the left and click "Add To List"</p>
                        </div>

                        {{-- 品牌列表区域 --}}
                        <div id="brandValuesArea" class="d-none">
                            <div class="values-list overflow-auto" id="brandValuesList" style="max-height: 400px;">
                                {{-- 品牌将通过JavaScript动态添加 --}}
                            </div>
                        </div>

                        {{-- 提交按钮区域 --}}
                        <div id="submitSection" class="mt-4 d-none">
                            <div class="d-grid">
                                <button type="submit" class="btn btn-success">
                                    <i class="bi bi-stack me-2"></i>Create All Brands
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
<script>
    {{-- 品牌管理路由配置 --}}
    window.createBrandUrl = "{{ route('admin.brand.store') }}";
    window.brandManagementRoute = "{{ route('admin.brand.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/brand-management.js') }}"></script>
@endsection
