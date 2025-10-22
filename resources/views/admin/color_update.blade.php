@extends("layouts.app")

@section("title", "Update Color")
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
                                <i class="bi bi-palette-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Update Color</h2>
                                <p class="dashboard-subtitle mb-0">Modify color information to better manage products</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.color.index') }}" class="btn btn-primary">
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
    {{-- 颜色信息更新界面 (Color Update Interface) --}}
    {{-- ========================================== --}}
    {{-- 颜色信息更新表单 --}}
    <form action="{{ route('admin.color.update', $color->id) }}" method="post" id="updateColorForm">
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

                        {{-- 颜色预览 (Color Preview) --}}
                        <div class="mb-4">
                            <label class="form-label">Color Preview</label>
                            <div class="color-preview" id="color-preview" style="background-color: {{ $color->color_hex }}; width: 100%; height: 80px; border-radius: 12px; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);"></div>
                        </div>

                        {{-- 当前颜色信息显示 --}}
                        <div class="alert alert-info border-0 mb-4">
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-info-circle-fill me-2"></i>
                                <strong>Current Color</strong>
                            </div>
                            <div class="small">
                                <div class="mb-1">
                                    <i class="bi bi-palette me-2 text-muted"></i>
                                    <span>Name: <strong>{{ $color->color_name }}</strong></span>
                                </div>
                                <div class="mb-1">
                                    <i class="bi bi-hash me-2 text-muted"></i>
                                    <span>Hex: <strong>{{ $color->color_hex }}</strong></span>
                                </div>
                                <div class="mb-1">
                                    <i class="bi bi-circle-fill me-2 text-muted"></i>
                                    <span>RGB: <strong>{{ $color->color_rgb }}</strong></span>
                                </div>
                                <div class="mb-1">
                                    <i class="bi bi-shield-check me-2 text-muted"></i>
                                    <span>Status: <strong>{{ $color->color_status ?? 'Available' }}</strong></span>
                                </div>
                                <div>
                                    <i class="bi bi-calendar me-2 text-muted"></i>
                                    <span>Created: <strong>{{ $color->created_at->format('M d, Y') }}</strong></span>
                                </div>
                            </div>
                        </div>

                        {{-- 统计信息 --}}
                        <div class="mt-auto">
                            <div class="row text-center">
                                <div class="col-12">
                                    <div class="h4 text-primary mb-0">1</div>
                                    <small class="text-muted">Color Record</small>
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
                                    <i class="bi bi-pencil-square me-2"></i>Update Color Information
                                </h6>
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Modify color configuration below.
                                </small>
                            </div>
                        </div>

                        <div class="card border-0 bg-white shadow-sm">
                            <div class="card-body p-4">

                                {{-- 颜色名字段 --}}
                                <div class="col-12 mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-palette me-2 text-primary"></i>Color Name
                                    </label>
                                    <input type="text" class="form-control" id="color_name" name="color_name"
                                           value="{{ old('color_name', $color->color_name) }}" placeholder="Enter color name" required>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Enter a unique color name
                                    </div>
                                </div>

                                {{-- 颜色Hex字段 --}}
                                <div class="col-12 mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-hash me-2 text-primary"></i>Color Hex Code
                                    </label>
                                    <input type="text" class="form-control" id="color_hex" name="color_hex"
                                           value="{{ old('color_hex', $color->color_hex) }}" placeholder="Enter hex code (e.g., #FF0000)" required>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Enter the color's hex code (e.g., #FF0000 for red)
                                    </div>
                                </div>

                                {{-- 颜色RGB字段 --}}
                                <div class="col-12 mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-circle-fill me-2 text-primary"></i>Color RGB Code
                                    </label>
                                    <input type="text" class="form-control bg-light" id="color_rgb" name="color_rgb"
                                           value="{{ old('color_rgb', $color->color_rgb) }}" readonly>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        RGB code is automatically generated from hex code
                                    </div>
                                </div>

                                {{-- Color Status Field --}}
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-3">Color Status</label>
                                    <div class="row g-3">
                                        @php
                                            $currentStatus = $color->color_status ?? 'Available';
                                        @endphp

                                        <div class="col-md-6">
                                            <div class="card h-100 border status-card {{ $currentStatus === 'Available' ? 'selected' : '' }}" data-status="Available">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="color_status" value="Available" class="form-check-input me-3"
                                                           {{ old('color_status', $currentStatus) === 'Available' ? 'checked' : '' }}>
                                                    <div>
                                                        <h6 class="card-title mb-1">
                                                            <i class="bi bi-check-circle me-2 text-success"></i>Available
                                                        </h6>
                                                        <p class="card-text text-muted small mb-0">Color is active and can be used</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="card h-100 border status-card {{ $currentStatus === 'Unavailable' ? 'selected' : '' }}" data-status="Unavailable">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="color_status" value="Unavailable" class="form-check-input me-3"
                                                           {{ old('color_status', $currentStatus) === 'Unavailable' ? 'checked' : '' }}>
                                                    <div>
                                                        <h6 class="card-title mb-1">
                                                            <i class="bi bi-x-circle me-2 text-danger"></i>Unavailable
                                                        </h6>
                                                        <p class="card-text text-muted small mb-0">Color is inactive and cannot be used</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Choose whether the color can be used for product management
                                    </div>
                                </div>

                                <!-- 提交按钮区域 -->
                                <div class="d-flex gap-3 mt-4">
                                    <button type="submit" class="btn btn-warning flex-fill">
                                        <i class="bi bi-pencil-square me-2"></i>Update Color Information
                                    </button>
                                    <a href="{{ route('admin.color.index') }}" class="btn btn-outline-secondary">
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
    window.colorManagementRoute = "{{ route('admin.color.index') }}";
    window.updateColorUrl = "{{ route('admin.color.update', $color->id) }}";
</script>

<!-- Color.js 颜色库 (本地安装) -->
<script src="{{ asset('node_modules/colorjs.io/dist/color.js') }}"></script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/common/status-system.js') }}"></script>
<script src="{{ asset('assets/js/color-management.js') }}"></script>

<script>
    // 初始化颜色更新页面
    document.addEventListener('DOMContentLoaded', function() {
        // 初始化颜色处理功能和表单提交
        initializeColorUpdate();
    });
</script>
@endsection
