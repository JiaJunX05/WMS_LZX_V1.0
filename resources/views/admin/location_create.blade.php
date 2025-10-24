{{-- ==========================================
    位置创建页面
    功能：创建单个或多个位置组合，连接区域与货架
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Location")
@section("content")

{{-- ==========================================
    页面样式文件引入
    ========================================== --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

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
                                <h2 class="dashboard-title mb-1">Create Location</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple location combinations to connect zones with racks</p>
                            </div>
                        </div>
                    </div>
                    {{-- 右侧返回按钮 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.location.index') }}" class="btn btn-primary">
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
        位置创建表单
        ========================================== --}}
    <form action="{{ route('admin.location.store') }}" method="post" id="locationForm">
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

                        {{-- 区域选择 --}}
                        <div class="mb-4">
                            <label class="form-label">Zone <span class="text-danger">*</span></label>
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

                        {{-- 货架选择 --}}
                        <div class="mb-4">
                            <label class="form-label">Rack <span class="text-danger">*</span></label>
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

                        {{-- 操作按钮区域 --}}
                        <div class="mt-auto">
                            <div class="d-flex gap-3">
                                <button type="button" class="btn btn-success flex-fill" id="addLocation">
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
                    右侧位置管理区域
                    ========================================== --}}
                <div class="col-md-8">
                    <div class="size-values-section p-4">
                        {{-- 管理区域标题 --}}
                        <div class="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h6 class="mb-0 fw-bold">
                                    <i class="bi bi-geo-alt me-2"></i>Location Management
                                </h6>
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Manage and organize your locations below.
                                </small>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="sortLocations" title="Sort locations">
                                    <i class="bi bi-sort-down" id="sortIcon"></i>
                                </button>
                                <span class="badge bg-primary" id="locationValuesCount">0 locations</span>
                            </div>
                        </div>

                        {{-- 初始提示信息 --}}
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Ready to Configure Locations</h5>
                            <p class="text-muted mb-0">Select zone and rack on the left and click "Add To List"</p>
                        </div>

                        {{-- 位置列表区域 --}}
                        <div id="locationValuesArea" class="d-none">
                            <div class="values-list overflow-auto" id="locationValuesList" style="max-height: 400px;"></div>
                        </div>

                        {{-- 提交按钮区域 --}}
                        <div id="submitSection" class="mt-4 d-none">
                            <div class="d-grid">
                                <button type="submit" class="btn btn-success">
                                    <i class="bi bi-stack me-2"></i>Create All Locations
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

{{-- 位置管理路由配置 --}}
<script>
    window.createLocationUrl = "{{ route('admin.location.store') }}";
    window.locationManagementRoute = "{{ route('admin.location.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/location-management.js') }}"></script>
@endsection
