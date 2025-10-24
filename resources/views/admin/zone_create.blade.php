{{-- ==========================================
    区域创建页面
    功能：创建单个或多个区域，管理存储位置
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Zone")
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
                            <div class="header-icon-wrapper me-4"><i class="bi bi-geo-alt-fill"></i></div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Zone</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple zones to organize and manage storage locations</p>
                            </div>
                        </div>
                    </div>
                    {{-- 右侧返回按钮 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.zone.index') }}" class="btn btn-primary">
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
        区域创建表单
        ========================================== --}}
    <form action="{{ route('admin.zone.store') }}" method="post" id="zoneForm" enctype="multipart/form-data">
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

                        {{-- 区域名称输入 --}}
                        <div class="mb-4">
                            <label class="form-label">Zone Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="zone_name" id="zone_name" placeholder="Enter zone name">
                        </div>

                        {{-- 区域位置输入 --}}
                        <div class="mb-4">
                            <label class="form-label">Zone Location <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="location" id="location" placeholder="Enter zone location">
                        </div>

                        {{-- 区域图片上传 --}}
                        <div class="mb-4">
                            <label class="form-label">Zone Image</label>
                            <div class="img-upload-area" id="imageUploadArea">
                                <div class="img-upload-content" id="imageUploadContent">
                                    <i class="bi bi-cloud-upload fs-1 text-muted mb-3" id="preview-icon"></i>
                                    <h6 class="text-muted">Click to upload image</h6>
                                    <p class="text-muted small">Supports JPG, PNG, GIF formats</p>
                                </div>
                                <img id="img-preview" class="img-preview d-none" alt="Zone preview">
                            </div>
                            <input type="file" class="d-none" id="zone_image" name="zone_image" accept="image/*">
                        </div>

                        {{-- 操作按钮区域 --}}
                        <div class="mt-auto">
                            <div class="d-flex gap-3">
                                <button type="button" class="btn btn-success flex-fill" id="addZone">
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
                    右侧区域管理区域
                    ========================================== --}}
                <div class="col-md-8">
                    <div class="size-values-section p-4">
                        {{-- 管理区域标题 --}}
                        <div class="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h6 class="mb-0 fw-bold">
                                    <i class="bi bi-geo-alt me-2"></i>Zone Management
                                </h6>
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Manage and organize your zones below.
                                </small>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="sortZones" title="Sort zones">
                                    <i class="bi bi-sort-down" id="sortIcon"></i>
                                </button>
                                <span class="badge bg-primary" id="zoneValuesCount">0 zones</span>
                            </div>
                        </div>

                        {{-- 初始提示信息 --}}
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Ready to Configure Zones</h5>
                            <p class="text-muted mb-0">Fill in the zone details on the left and click "Add To List"</p>
                        </div>

                        {{-- 区域列表区域 --}}
                        <div id="zoneValuesArea" class="d-none">
                            <div class="values-list overflow-auto" id="zoneValuesList" style="max-height: 400px;">
                            </div>
                        </div>

                        {{-- 提交按钮区域 --}}
                        <div id="submitSection" class="mt-4 d-none">
                            <div class="d-grid">
                                <button type="submit" class="btn btn-success">
                                    <i class="bi bi-stack me-2"></i>Create All Zones
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

{{-- 区域管理路由配置 --}}
<script>
    window.createZoneUrl = "{{ route('admin.zone.store') }}";
    window.zoneManagementRoute = "{{ route('admin.zone.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/zone-management.js') }}"></script>
@endsection
