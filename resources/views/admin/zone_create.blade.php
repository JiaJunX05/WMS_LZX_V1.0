@extends("layouts.app")

@section("title", "Create Zone")
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
                                <i class="bi bi-geo-alt-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Zone</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple zones to organize and manage storage locations</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.zone.index') }}" class="btn btn-primary">
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
    <form action="{{ route('admin.zone.store') }}" method="post" id="zoneForm" enctype="multipart/form-data">
        @csrf
        <div class="row">
            {{-- =============================================================================
                 左側主要內容區域 (Left Content Area)
                 ============================================================================= --}}
            <div class="col-lg-4">
                {{-- 區域基本信息卡片 (Zone Basic Information Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Zone Information</h5>
                    </div>
                    <div class="card-body">
                        {{-- 區域名稱 (Zone Name) --}}
                        <div class="mb-3">
                            <label class="form-label">Zone Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="zone_name" id="zone_name" placeholder="Enter zone name">
                        </div>

                        {{-- 區域位置 (Zone Location) --}}
                        <div class="mb-3">
                            <label class="form-label">Zone Location <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="location" id="location" placeholder="Enter zone location">
                        </div>

                        {{-- 區域圖片上傳 (Zone Image Upload) --}}
                        <div class="mb-3">
                            <label class="form-label">Zone Image</label>
                            <div class="image-upload-area" id="imageUploadArea">
                                <div class="image-upload-content" id="imageUploadContent">
                                    <i class="bi bi-cloud-upload fs-1 text-muted mb-3" id="preview-icon"></i>
                                    <h6 class="text-muted">Click to upload image</h6>
                                    <p class="text-muted small">Supports JPG, PNG, GIF formats</p>
                                </div>
                                <img id="preview-image" class="preview-image d-none" alt="Zone preview">
                            </div>
                            <input type="file" class="d-none" id="zone_image" name="zone_image" accept="image/*">
                        </div>
                    </div>

                    {{-- 操作按钮区域 --}}
                    <div class="card-footer">
                        <div class="d-flex gap-3">
                            <button type="button" class="btn btn-primary flex-fill" id="addZone">
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
                {{-- 區域管理卡片 (Zone Management Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">Zone Management</h5>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="sortZones" title="Sort zones">
                                    <i class="bi bi-sort-down" id="sortIcon"></i>
                                </button>
                                <span class="badge bg-primary" id="zoneValuesCount">0 zones</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Ready to Configure Zones</h5>
                            <p class="text-muted mb-0">Fill in the zone details on the left and click "Add To List"</p>
                        </div>

                        <!-- 区域列表区域 -->
                        <div id="zoneValuesArea" class="d-none">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th class="text-center" style="width: 8%">#</th>
                                            <th style="width: 60%">ZONE INFORMATION</th>
                                            <th class="text-end" style="width: 32%">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody id="zoneValuesList"></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 区域输入提示 -->
                        <div id="zoneInputPrompt" class="text-center text-muted py-4 d-none">
                            <i class="bi bi-arrow-up-circle fs-1 text-muted mb-3"></i>
                            <h6 class="text-muted">Add More Zones</h6>
                            <p class="text-muted small">Enter zone details in the left panel to continue</p>
                        </div>
                    </div>

                    <!-- 提交按钮区域 -->
                    <div id="submitSection" class="card-footer d-none">
                        <div class="d-grid">
                            <button type="submit" class="btn btn-success btn-lg py-3">
                                <i class="bi bi-stack me-2"></i>Create All Zones
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
    window.createZoneUrl = "{{ route('admin.zone.store') }}";
    window.zoneManagementRoute = "{{ route('admin.zone.index') }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/zone-management.js') }}"></script>
@endsection
