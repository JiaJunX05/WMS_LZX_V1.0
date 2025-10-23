@extends("layouts.app")

@section("title", "Create Rack")
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
                                <i class="bi bi-box-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Rack</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple racks to organize and manage stock storage efficiently</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.rack.index') }}" class="btn btn-primary">
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
    <form action="{{ route('admin.rack.store') }}" method="post" id="rackForm" enctype="multipart/form-data">
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
                        {{-- 貨架編號 (Rack Number) --}}
                        <div class="mb-4">
                            <label class="form-label">Rack Number <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="rack_number" id="rack_number" placeholder="Enter rack number">
                        </div>

                        {{-- 貨架容量 (Rack Capacity) --}}
                        <div class="mb-4">
                            <label class="form-label">Rack Capacity</label>
                            <input type="number" class="form-control" name="capacity" id="capacity" placeholder="Enter rack capacity (default: 50)">
                        </div>

                        {{-- 貨架圖片上傳 (Rack Image Upload) --}}
                        <div class="mb-4">
                            <label class="form-label">Rack Image</label>
                            <div class="image-upload-area" id="imageUploadArea">
                                <div class="image-upload-content" id="imageUploadContent">
                                    <i class="bi bi-cloud-upload fs-1 text-muted mb-3" id="preview-icon"></i>
                                    <h6 class="text-muted">Click to upload image</h6>
                                    <p class="text-muted small">Supports JPG, PNG, GIF formats</p>
                                </div>
                                <img id="preview-image" class="preview-image d-none" alt="Rack preview">
                            </div>
                            <input type="file" class="d-none" id="rack_image" name="rack_image" accept="image/*">
                        </div>

                        {{-- 操作按钮区域 --}}
                        <div class="mt-auto">
                            <div class="d-flex gap-3">
                                <button type="button" class="btn btn-success flex-fill" id="addRack">
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
                                    <i class="bi bi-box-seam me-2"></i>Rack Management
                                </h6>
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Manage and organize your racks below.
                                </small>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="sortRacks" title="Sort racks">
                                    <i class="bi bi-sort-down" id="sortIcon"></i>
                                </button>
                                <span class="badge bg-primary" id="rackValuesCount">0 racks</span>
                            </div>
                        </div>
                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Ready to Configure Racks</h5>
                            <p class="text-muted mb-0">Fill in the rack details on the left and click "Add To List"</p>
                        </div>

                        <!-- 货架列表区域 -->
                        <div id="rackValuesArea" class="d-none">
                            <div class="values-list overflow-auto" id="rackValuesList" style="max-height: 400px;">
                                <!-- 货架将通过JavaScript动态添加 -->
                            </div>
                        </div>

                        <!-- 提交按钮区域 -->
                        <div id="submitSection" class="mt-4 d-none">
                            <div class="d-grid">
                                <button type="submit" class="btn btn-success">
                                    <i class="bi bi-stack me-2"></i>Create All Racks
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
    window.createRackUrl = "{{ route('admin.rack.store') }}";
    window.rackManagementRoute = "{{ route('admin.rack.index') }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/rack-management.js') }}"></script>
@endsection
