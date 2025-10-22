@extends("layouts.app")

@section("title", "Update Category")
@section("content")

<!-- CSS -->
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-normal.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

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
                                <h2 class="dashboard-title mb-1">Update Category</h2>
                                <p class="dashboard-subtitle mb-0">Modify category information to better organize products</p>
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

    {{-- ========================================== --}}
    {{-- 分类信息更新界面 (Category Update Interface) --}}
    {{-- ========================================== --}}
    {{-- 分类信息更新表单 --}}
    <form action="{{ route('admin.category.update', $category->id) }}" method="post" id="updateCategoryForm" enctype="multipart/form-data">
        @csrf
        @method('PUT')

        <div class="card shadow-sm border-0">
            <div class="row g-0">
                {{-- 左侧配置区域 --}}
                <div class="col-md-4">
                    <div class="config-section d-flex flex-column h-100 bg-light p-4">
                        {{-- 配置标题 --}}
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="mb-0 fw-bold text-primary">
                                <i class="bi bi-gear-fill me-2"></i>Configuration
                            </h6>
                            <span class="badge bg-white text-dark border px-3 py-2">Update</span>
                        </div>

                        {{-- 分类图片 (Category Image) --}}
                        <div class="mb-4">
                            <label class="form-label">Category Image</label>
                            <div class="image-upload-area" id="image-preview">
                                @if($category->category_image && file_exists(public_path('assets/images/' . $category->category_image)))
                                    {{-- 有现有图片时显示 --}}
                                    <div class="upload-placeholder d-none" id="imageUploadContent">
                                        <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                        <h5 class="mt-3">Click to upload image</h5>
                                        <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                    </div>
                                    <img id="preview-image" class="preview-image" src="{{ asset('assets/images/' . $category->category_image) }}" alt="Category Preview">
                                    <button type="button" class="image-remove-btn" id="removeImage">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                @else
                                    {{-- 没有图片时显示上传占位符 --}}
                                    <div class="upload-placeholder" id="imageUploadContent">
                                        <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                        <h5 class="mt-3">Click to upload image</h5>
                                        <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                    </div>
                                    <img id="preview-image" class="preview-image d-none" alt="Category Preview">
                                    <button type="button" class="image-remove-btn d-none" id="removeImage">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                @endif
                            </div>
                            <input type="file" class="d-none" id="input_image" name="category_image" accept="image/*">
                        </div>

                        {{-- 当前分类信息显示 --}}
                        <div class="alert alert-info border-0 mb-4">
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-info-circle-fill me-2"></i>
                                <strong>Current Category</strong>
                            </div>
                            <div class="small">
                                <div class="mb-1">
                                    <i class="bi bi-tags me-2 text-muted"></i>
                                    <span>Name: <strong>{{ $category->category_name }}</strong></span>
                                </div>
                                <div class="mb-1">
                                    <i class="bi bi-shield-check me-2 text-muted"></i>
                                    <span>Status: <strong>{{ $category->category_status ?? 'Available' }}</strong></span>
                                </div>
                                <div>
                                    <i class="bi bi-calendar me-2 text-muted"></i>
                                    <span>Created: <strong>{{ $category->created_at->format('M d, Y') }}</strong></span>
                                </div>
                            </div>
                        </div>

                        {{-- 统计信息 --}}
                        <div class="mt-auto">
                            <div class="row text-center">
                                <div class="col-12">
                                    <div class="h4 text-primary mb-0">1</div>
                                    <small class="text-muted">Category Record</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- 右侧编辑表单区域 --}}
                <div class="col-md-8">
                    <div class="size-values-section p-4">
                        {{-- 表单标题 --}}
                        <div class="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h6 class="mb-0 fw-bold">
                                    <i class="bi bi-pencil-square me-2"></i>Update Category Information
                                </h6>
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Modify category configuration below.
                                </small>
                            </div>
                        </div>

                        <div class="card border-0 bg-white shadow-sm">
                            <div class="card-body p-4">

                                {{-- 分类名字段 --}}
                                <div class="col-12 mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-tags me-2 text-primary"></i>Category Name
                                    </label>
                                    <input type="text" class="form-control" id="category_name" name="category_name"
                                           value="{{ old('category_name', $category->category_name) }}" placeholder="Enter category name" required>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Enter a unique category name
                                    </div>
                                </div>

                                {{-- Category Status Field --}}
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-3">Category Status</label>
                                    <div class="row g-3">
                                        @php
                                            $currentStatus = $category->category_status ?? 'Available';
                                        @endphp

                                        <div class="col-md-6">
                                            <div class="card h-100 border status-card {{ $currentStatus === 'Available' ? 'selected' : '' }}" data-status="Available">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="category_status" value="Available" class="form-check-input me-3"
                                                           {{ old('category_status', $currentStatus) === 'Available' ? 'checked' : '' }}>
                                                    <div>
                                                        <h6 class="card-title mb-1">
                                                            <i class="bi bi-check-circle me-2 text-success"></i>Available
                                                        </h6>
                                                        <p class="card-text text-muted small mb-0">Category is active and can be used</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="card h-100 border status-card {{ $currentStatus === 'Unavailable' ? 'selected' : '' }}" data-status="Unavailable">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="category_status" value="Unavailable" class="form-check-input me-3"
                                                           {{ old('category_status', $currentStatus) === 'Unavailable' ? 'checked' : '' }}>
                                                    <div>
                                                        <h6 class="card-title mb-1">
                                                            <i class="bi bi-x-circle me-2 text-danger"></i>Unavailable
                                                        </h6>
                                                        <p class="card-text text-muted small mb-0">Category is inactive and cannot be used</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Choose whether the category can be used for product organization
                                    </div>
                                </div>

                                <!-- 提交按钮区域 -->
                                <div class="d-flex gap-3 mt-4">
                                    <button type="submit" class="btn btn-warning flex-fill">
                                        <i class="bi bi-pencil-square me-2"></i>Update Category Information
                                    </button>
                                    <a href="{{ route('admin.category.index') }}" class="btn btn-outline-secondary">
                                        <i class="bi bi-x-circle me-2"></i>Cancel
                                    </a>
                                </div>
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
<!-- JavaScript -->
<script>
    // JavaScript URL definitions
    window.categoryManagementRoute = "{{ route('admin.category.index') }}";
    window.updateCategoryUrl = "{{ route('admin.category.update', $category->id) }}";

    // 传递现有分类图片路径给 JavaScript
    @if($category->category_image)
        window.existingCategoryImage = '{{ asset('assets/images/' . $category->category_image) }}';
    @endif
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/common/status-system.js') }}"></script>
<script src="{{ asset('assets/js/category-management.js') }}"></script>

<script>
    // 初始化分类更新页面
    document.addEventListener('DOMContentLoaded', function() {
        // 初始化图片处理功能和表单提交
        initializeCategoryUpdate();
    });
</script>
@endsection
