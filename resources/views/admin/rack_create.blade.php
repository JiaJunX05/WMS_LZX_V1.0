@extends("layouts.app")

@section("title", "Create Rack")
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

    <!-- 主要内容卡片 - 左右布局 -->
    <form action="{{ route('admin.rack.store') }}" method="post" id="rackForm" enctype="multipart/form-data">
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
                            <!-- 货架编号输入 -->
                            <div class="mb-4">
                                <label for="rack_number" class="form-label fw-bold">Rack Number <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-hash text-primary"></i>
                                    </span>
                                    <input type="text" class="form-control border-start-0" id="rack_number" name="rack_number"
                                           placeholder="Enter rack number">
                                    <button type="button" class="btn btn-outline-primary" id="addRack">
                                        <i class="bi bi-plus-circle"></i>
                                    </button>
                                </div>
                                <small class="text-muted">Enter the rack number and click + to add</small>
                            </div>

                            <!-- 货架容量输入 -->
                            <div class="mb-4">
                                <label for="capacity" class="form-label fw-bold">Rack Capacity</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-boxes text-primary"></i>
                                    </span>
                                    <input type="number" class="form-control border-start-0" id="capacity" name="capacity"
                                           placeholder="Enter rack capacity (default: 50)">
                                </div>
                                <small class="text-muted">Leave empty to use default capacity (50)</small>
                            </div>

                            <!-- 货架图片上传 -->
                            <div class="mb-4">
                                <label for="rack_image" class="form-label fw-bold">Rack Image</label>
                                <div class="image-upload-container">
                                    <input type="file" class="form-control" id="rack_image" name="rack_image"
                                           accept="image/*" style="display: none;">
                                    <div class="image-upload-area" id="imageUploadArea">
                                        <div class="image-upload-content" id="imageUploadContent">
                                            <i class="bi bi-cloud-upload fs-1 text-muted mb-3" id="preview-icon"></i>
                                            <h6 class="text-muted">Click to upload image</h6>
                                            <p class="text-muted small">Supports JPG, PNG, GIF formats</p>
                                        </div>
                                        <img id="preview-image" class="preview-image d-none" alt="Rack preview">
                                    </div>
                                </div>
                                <small class="text-muted">Optional: Upload an image to represent this rack</small>
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
                                            <i class="bi bi-hash me-2 text-muted"></i>
                                            <span>Racks: &nbsp;<strong id="selectedRack">None</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 快速操作 -->
                            <div class="quick-actions mt-auto">
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-outline-success" id="addCommonRacks">
                                        <i class="bi bi-list-ul me-2"></i>Add Common Racks
                                    </button>
                                    <button type="button" class="btn btn-outline-info" id="addWarehouseRacks">
                                        <i class="bi bi-building me-2"></i>Add Warehouse Racks
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

                <!-- 右侧货架列表区域 -->
                <div class="col-md-9">
                    <div class="card-body p-4">
                        <!-- 表单标题 -->
                        <h2 class="text-primary text-center mb-3">Racks</h2>
                        <p class="text-muted text-center">Add racks for organizing and managing stock storage</p>
                        <hr>

                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Configure Racks</h5>
                            <p class="text-muted">Add rack numbers from the left panel</p>
                        </div>

                        <!-- 货架列表区域 -->
                        <div id="rackValuesArea" style="display: none;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">
                                    <i class="bi bi-collection text-primary me-2"></i>Racks
                                    <span class="text-muted" id="rackName"></span>
                                </h5>
                                <div class="d-flex align-items-center gap-2">
                                    <button type="button" class="btn btn-sm btn-outline-secondary" id="sortRacks" title="Sort racks">
                                        <i class="bi bi-sort-down" id="sortIcon"></i>
                                    </button>
                                    <span class="badge bg-info" id="rackValuesCount">0 racks</span>
                                </div>
                            </div>

                            <div class="values-list" id="rackValuesList">
                                <!-- 货架将通过JavaScript动态添加 -->
                            </div>
                        </div>

                        <!-- 货架输入提示 -->
                        <div id="rackInputPrompt" class="text-center text-muted py-4" style="display: none;">
                            <i class="bi bi-arrow-up-circle fs-1 text-muted mb-3"></i>
                            <h6 class="text-muted">Add Racks</h6>
                            <p class="text-muted small">Enter rack numbers in the left panel</p>
                        </div>

                        <!-- 提交按钮 -->
                        <div id="submitSection" style="display: none;">
                            <hr class="my-4">
                            <button type="submit" class="btn btn-primary w-100 btn-lg">
                                <i class="bi bi-stack me-2"></i>Create Racks
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
    window.createRackUrl = "{{ route('admin.rack.store') }}";
    window.rackManagementRoute = "{{ route('admin.rack.index') }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/rack-management.js') }}"></script>
@endsection
