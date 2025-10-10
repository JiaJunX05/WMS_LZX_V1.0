@extends("layouts.app")

@section("title", "Update Location")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-normal.css') }}">
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
                                <i class="bi bi-pencil-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">
                                    @if(isset($zone))
                                        Update {{ $zone->zone_name }} Locations
                                    @else
                                        Update Location
                                    @endif
                                </h2>
                                <p class="dashboard-subtitle mb-0">
                                    @if(isset($zone))
                                        Manage location combinations for {{ $zone->zone_name }} zone
                                    @else
                                        Modify existing location information
                                    @endif
                                </p>
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

    <!-- 统一的位置管理界面 -->
    <div class="card shadow-sm border-0">
        <div class="row g-0">
            <!-- 左侧配置区域 -->
            <div class="col-md-4">
                <div class="config-section d-flex flex-column h-100 bg-light p-4">
                    <!-- 配置标题 -->
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-gear-fill me-2"></i>Configuration
                        </h6>
                        <span class="badge bg-white text-dark border px-3 py-2">Update</span>
                    </div>

                    <!-- 信息显示 -->
                    <div class="alert alert-info border-0 mb-4">
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-info-circle-fill me-2"></i>
                            <strong>Current Location</strong>
                        </div>
                        <div class="small">
                            <div class="mb-1">
                                <i class="bi bi-geo-alt me-2 text-muted"></i>
                                <span>Zone: <strong>{{ $location->zone->zone_name ?? 'N/A' }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-box-seam me-2 text-muted"></i>
                                <span>Rack: <strong>{{ $location->rack->rack_number ?? 'N/A' }}</strong></span>
                            </div>
                            <div>
                                <i class="bi bi-toggle-on me-2 text-muted"></i>
                                <span>Status: <strong>{{ $location->location_status ?? 'N/A' }}</strong></span>
                            </div>
                        </div>
                    </div>

                    <!-- 统计信息 -->
                    <div class="mt-auto">
                        <div class="row text-center">
                            <div class="col-12">
                                <div class="h4 text-primary mb-0">1</div>
                                <small class="text-muted">Location Entry</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧编辑表单区域 -->
            <div class="col-md-8">
                <div class="size-values-section p-4">
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h6 class="mb-0 fw-bold">
                                <i class="bi bi-pencil-square me-2"></i>Update Storage Location
                            </h6>
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i>
                                Modify location configuration below.
                            </small>
                        </div>
                    </div>

                    <!-- 编辑表单 -->
                    <form action="{{ route('admin.storage_locations.location.update', $location->id) }}" method="POST" id="updateLocationForm">
                        @csrf
                        @method('PUT')

                        <div class="card border-0 bg-white shadow-sm">
                            <div class="card-body p-4">
                                <!-- Zone Field -->
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-geo-alt me-2 text-primary"></i>Zone
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light border-end-0">
                                            <i class="bi bi-geo-alt text-muted"></i>
                                        </span>
                                        <select class="form-select border-start-0" name="zone_id" id="zone_id" required>
                                            <option value="">Select zone</option>
                                            @foreach($zones as $zone)
                                                <option value="{{ $zone->id }}"
                                                    {{ $location->zone_id == $zone->id ? 'selected' : '' }}>
                                                    {{ $zone->zone_name }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Choose the zone for this location
                                    </div>
                                </div>

                                <!-- Rack Field -->
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-box-seam me-2 text-primary"></i>Rack
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light border-end-0">
                                            <i class="bi bi-box-seam text-muted"></i>
                                        </span>
                                        <select class="form-select border-start-0" name="rack_id" id="rack_id" required>
                                            <option value="">Select rack</option>
                                            @foreach($racks as $rack)
                                                <option value="{{ $rack->id }}"
                                                    {{ $location->rack_id == $rack->id ? 'selected' : '' }}>
                                                    {{ $rack->rack_number }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Choose the rack for this location
                                    </div>
                                </div>

                                <!-- Location Status Field -->
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-3">Location Status</label>
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="card h-100 status-card {{ $location->location_status === 'Available' ? 'selected' : '' }}" data-status="Available">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="location_status" value="Available" class="form-check-input me-3" {{ $location->location_status === 'Available' ? 'checked' : '' }}>
                                                    <div>
                                                        <div class="fw-semibold text-success">
                                                            <i class="bi bi-check-circle-fill me-2"></i>Available
                                                        </div>
                                                        <small class="text-muted">Location is active and can be used</small>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="card h-100 status-card {{ $location->location_status === 'Unavailable' ? 'selected' : '' }}" data-status="Unavailable">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="location_status" value="Unavailable" class="form-check-input me-3" {{ $location->location_status === 'Unavailable' ? 'checked' : '' }}>
                                                    <div>
                                                        <div class="fw-semibold text-secondary">
                                                            <i class="bi bi-slash-circle-fill me-2"></i>Unavailable
                                                        </div>
                                                        <small class="text-muted">Location is inactive and cannot be used</small>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Action Button -->
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary btn-lg">
                                        <i class="bi bi-check-lg me-2"></i>Update Location
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection

@section("scripts")
<script>
    // 设置全局变量
    window.updateLocationUrl = "{{ route('admin.storage_locations.location.update', $location->id) }}";
    window.locationManagementRoute = "{{ route('admin.storage_locations.location.index') }}";
    window.availableLocationUrl = "{{ route('admin.storage_locations.location.available', ['id' => ':id']) }}";
    window.unavailableLocationUrl = "{{ route('admin.storage_locations.location.unavailable', ['id' => ':id']) }}";
    window.deleteLocationUrl = "{{ route('admin.storage_locations.location.destroy', ['id' => ':id']) }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/status-system.js') }}"></script>
<script src="{{ asset('assets/js/location-management.js') }}"></script>
@endsection
