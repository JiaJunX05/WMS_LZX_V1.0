@extends("layouts.app")

@section("title", "Create Location")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-table-list.css') }}">
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
                                <h2 class="dashboard-title mb-1">Create Location</h2>
                                <p class="dashboard-subtitle mb-0">Add location combinations to connect zones with racks</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.storage_locations.location.index') }}" class="btn btn-primary">
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
    <form action="{{ route('admin.storage_locations.location.store') }}" method="post" id="locationForm">
        @csrf
        <div class="card shadow-sm border-0">
            <div class="row g-0">
                <!-- 左侧配置区域 -->
                <div class="col-md-3">
                    <div class="config-section d-flex flex-column h-100 bg-light p-4">
                        <!-- 配置标题 -->
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="mb-0 fw-bold text-primary">
                                <i class="bi bi-gear-fill me-2"></i>Configuration
                            </h6>
                            <span class="badge bg-white text-dark border px-3 py-2">Step 1</span>
                        </div>

                        <!-- 配置内容 -->
                        <div class="config-content flex-grow-1">
                            <!-- 区域选择 -->
                            <div class="mb-4">
                                <label for="zone_id" class="form-label fw-bold">Zone <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-diagram-3 text-primary"></i>
                                    </span>
                                    <select class="form-select border-start-0" id="zone_id" name="zone_id">
                                        <option value="">Select zone</option>
                                        @foreach($zones as $zone)
                                            <option value="{{ $zone->id }}"
                                                    {{ $zone->zone_status === 'Unavailable' ? 'disabled' : '' }}
                                                    data-status="{{ $zone->zone_status }}">
                                                {{ strtoupper($zone->zone_name) }}
                                                @if($zone->zone_status === 'Unavailable')
                                                    (Unavailable)
                                                @endif
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <!-- 货架选择 -->
                            <div class="mb-4">
                                <label for="rack_id" class="form-label fw-bold">Rack <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-box-seam text-primary"></i>
                                    </span>
                                    <select class="form-select border-start-0" id="rack_id" name="rack_id">
                                        <option value="">Select rack</option>
                                        @foreach($racks as $rack)
                                            <option value="{{ $rack->id }}"
                                                    {{ $rack->rack_status === 'Unavailable' ? 'disabled' : '' }}
                                                    data-status="{{ $rack->rack_status }}">
                                                {{ strtoupper($rack->rack_number) }}
                                                @if($rack->rack_status === 'Unavailable')
                                                    (Unavailable)
                                                @endif
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <!-- 添加位置按钮 -->
                            <div class="mb-4">
                                <button type="button" class="btn btn-primary w-100" id="addLocation">
                                    <i class="bi bi-plus-circle me-2"></i>Add Location
                                </button>
                                <small class="text-muted">Select zone and rack, then click add</small>
                                <div class="mt-2">
                                    <small class="text-info">
                                        <i class="bi bi-info-circle me-1"></i>
                                        <span id="locationCountText">No locations added yet</span>
                                    </small>
                                </div>
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
                                            <i class="bi bi-diagram-3 me-2 text-muted"></i>
                                            <span>Zone: &nbsp;<strong id="selectedZone">None</strong></span>
                                        </div>
                                        <div>
                                            <i class="bi bi-box-seam me-2 text-muted"></i>
                                            <span>Rack: &nbsp;<strong id="selectedRack">None</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 快速操作 -->
                            <div class="quick-actions mt-auto">
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-outline-secondary" id="clearForm">
                                        <i class="bi bi-x-circle me-2"></i>Clear All
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧位置列表区域 -->
                <div class="col-md-9">
                    <div class="card-body p-4">
                        <!-- 表单标题 -->
                        <h2 class="text-primary text-center mb-3">Location Combinations</h2>
                        <p class="text-muted text-center">Add location combinations for zone-rack connections</p>
                        <hr>

                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Configure Location Combinations</h5>
                            <p class="text-muted">Select zone and rack from the left panel to add location combinations</p>
                        </div>

                        <!-- 位置列表区域 -->
                        <div id="locationArea" style="display: none;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">
                                    <i class="bi bi-collection text-primary me-2"></i>Location Combinations
                                </h5>
                                <div class="d-flex align-items-center gap-2">
                                    <button type="button" class="btn btn-sm btn-outline-secondary" id="sortLocations" title="Sort locations">
                                        <i class="bi bi-sort-down" id="sortIcon"></i>
                                    </button>
                                    <span class="badge bg-info" id="locationCount">0 locations</span>
                                </div>
                            </div>

                            <div class="values-list" id="locationList">
                                <!-- 位置将通过JavaScript动态添加 -->
                            </div>
                        </div>


                        <!-- 状态选择 -->
                        <div class="mb-4" id="statusSelection" style="display: none;">
                            <hr class="my-4">
                            <h5 class="mb-3">
                                <i class="bi bi-toggle-on text-primary me-2"></i>Location Status
                            </h5>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="card h-100 border status-card selected" data-status="Available">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="location_status" value="Available" class="form-check-input me-3" checked>
                                            <div>
                                                <div class="fw-semibold text-success">
                                                    <i class="bi bi-check-circle-fill me-2"></i>Available
                                                </div>
                                                <small class="text-muted">Location will be active and usable</small>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card h-100 border status-card" data-status="Unavailable">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="location_status" value="Unavailable" class="form-check-input me-3">
                                            <div>
                                                <div class="fw-semibold text-secondary">
                                                    <i class="bi bi-slash-circle-fill me-2"></i>Unavailable
                                                </div>
                                                <small class="text-muted">Location will be inactive</small>
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
                                <i class="bi bi-stack me-2"></i>Create Locations
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
    // 定义JavaScript URL
    window.createLocationUrl = '{{ route("admin.storage_locations.location.store") }}';
    window.locationManagementRoute = '{{ route("admin.storage_locations.location.index") }}';
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/location-common.js') }}"></script>
<script src="{{ asset('assets/js/storage-location/location-create.js') }}"></script>
@endsection
