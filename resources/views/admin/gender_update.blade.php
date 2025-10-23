@extends("layouts.app")

@section("title", "Update Gender")
@section("content")

<!-- CSS -->
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
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
                                <i class="bi bi-person-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Update Gender</h2>
                                <p class="dashboard-subtitle mb-0">Modify gender information to better manage products</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.gender.index') }}" class="btn btn-primary">
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
    {{-- 性别信息更新界面 (Gender Update Interface) --}}
    {{-- ========================================== --}}
    {{-- 性别信息更新表单 --}}
    <form action="{{ route('admin.gender.update', $gender->id) }}" method="post" id="updateGenderForm">
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

                        {{-- 当前性别信息显示 --}}
                        <div class="alert alert-info border-0 mb-4">
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-info-circle-fill me-2"></i>
                                <strong>Current Gender</strong>
                            </div>
                            <div class="small">
                                <div class="mb-1">
                                    <i class="bi bi-person me-2 text-muted"></i>
                                    <span>Name: <strong>{{ $gender->gender_name }}</strong></span>
                                </div>
                                <div class="mb-1">
                                    <i class="bi bi-shield-check me-2 text-muted"></i>
                                    <span>Status: <strong>{{ $gender->gender_status ?? 'Available' }}</strong></span>
                                </div>
                                <div>
                                    <i class="bi bi-calendar me-2 text-muted"></i>
                                    <span>Created: <strong>{{ $gender->created_at->format('M d, Y') }}</strong></span>
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
                                    <i class="bi bi-pencil-square me-2"></i>Update Gender Information
                                </h6>
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Modify gender configuration below.
                                </small>
                            </div>
                        </div>

                        <div class="card border-0 bg-white shadow-sm">
                            <div class="card-body p-4">

                                {{-- 性别名字段 --}}
                                <div class="col-12 mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-person me-2 text-primary"></i>Gender Name
                                    </label>
                                    <input type="text" class="form-control" id="gender_name" name="gender_name"
                                           value="{{ old('gender_name', $gender->gender_name) }}" placeholder="Enter gender name" required>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Enter a unique gender name
                                    </div>
                                </div>

                                {{-- Gender Status Field --}}
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-3">Gender Status</label>
                                    <div class="row g-3">
                                        @php
                                            $currentStatus = $gender->gender_status ?? 'Available';
                                        @endphp

                                        <div class="col-md-6">
                                            <div class="card h-100 border status-card {{ $currentStatus === 'Available' ? 'selected' : '' }}" data-status="Available">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="gender_status" value="Available" class="form-check-input me-3"
                                                           {{ old('gender_status', $currentStatus) === 'Available' ? 'checked' : '' }}>
                                                    <div>
                                                        <h6 class="card-title mb-1">
                                                            <i class="bi bi-check-circle me-2 text-success"></i>Available
                                                        </h6>
                                                        <p class="card-text text-muted small mb-0">Gender is active and can be used</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="card h-100 border status-card {{ $currentStatus === 'Unavailable' ? 'selected' : '' }}" data-status="Unavailable">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="gender_status" value="Unavailable" class="form-check-input me-3"
                                                           {{ old('gender_status', $currentStatus) === 'Unavailable' ? 'checked' : '' }}>
                                                    <div>
                                                        <h6 class="card-title mb-1">
                                                            <i class="bi bi-x-circle me-2 text-danger"></i>Unavailable
                                                        </h6>
                                                        <p class="card-text text-muted small mb-0">Gender is inactive and cannot be used</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Choose whether the gender can be used for product management
                                    </div>
                                </div>

                                <!-- 提交按钮区域 -->
                                <div class="d-flex gap-3 mt-4">
                                    <button type="submit" class="btn btn-warning flex-fill">
                                        <i class="bi bi-pencil-square me-2"></i>Update Gender Information
                                    </button>
                                    <a href="{{ route('admin.gender.index') }}" class="btn btn-outline-secondary">
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
    window.genderManagementRoute = "{{ route('admin.gender.index') }}";
    window.updateGenderUrl = "{{ route('admin.gender.update', $gender->id) }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/common/status-system.js') }}"></script>
<script src="{{ asset('assets/js/gender-management.js') }}"></script>

<script>
    // 初始化性别更新页面
    document.addEventListener('DOMContentLoaded', function() {
        // 初始化性别处理功能和表单提交
        initializeGenderUpdate();
    });
</script>
@endsection
