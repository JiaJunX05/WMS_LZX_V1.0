{{-- ==========================================
    尺码模板更新页面
    功能：修改现有尺码模板信息
    ========================================== --}}

@extends("layouts.app")

@section("title", "Update Size Template")
@section("content")

{{-- ==========================================
    页面样式文件引入
    ========================================== --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

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
                            <div class="header-icon-wrapper me-4"><i class="bi bi-pencil-fill"></i></div>
                            <div>
                                <h2 class="dashboard-title mb-1">Update Size Template</h2>
                                <p class="dashboard-subtitle mb-0 text-muted">Modify template configuration and manage size values</p>
                            </div>
                        </div>
                    </div>
                    {{-- 右侧返回按钮 --}}
                    <div class="col-lg-4">
                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ route('admin.template.index') }}" class="btn btn-primary">
                                <i class="bi bi-arrow-left me-2"></i>Back to List
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- ==========================================
        尺码模板更新界面
        ========================================== --}}
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
                        <span class="badge bg-white text-dark border px-3 py-2">Update</span>
                    </div>

                    {{-- 当前模板信息显示 --}}
                    <div class="alert alert-info border-0 mb-4">
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-info-circle-fill me-2"></i><strong>Current Template</strong>
                        </div>
                        <div class="small">
                            <div class="mb-1">
                                <i class="bi bi-tag me-2 text-muted"></i>
                                <span>Category: <strong>{{ $sizeTemplate->category->category_name ?? 'N/A' }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-person me-2 text-muted"></i>
                                <span>Gender: <strong>{{ $sizeTemplate->gender->gender_name ?? 'N/A' }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-rulers me-2 text-muted"></i>
                                <span>Size: <strong>{{ $sizeTemplate->sizeLibrary->size_value ?? 'N/A' }}</strong></span>
                            </div>
                            <div>
                                <i class="bi bi-toggle-on me-2 text-muted"></i>
                                <span>Status: <strong>{{ $sizeTemplate->template_status ?? 'N/A' }}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- ==========================================
                右侧编辑表单区域
                ========================================== --}}
            <div class="col-md-8">
                <div class="size-values-section p-4">
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h6 class="mb-0 fw-bold">
                                <i class="bi bi-pencil-square me-2"></i>Update Template
                            </h6>
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i>Modify template configuration below.
                            </small>
                        </div>
                    </div>

                    {{-- 编辑表单 --}}
                    <form action="{{ route('admin.template.update', $sizeTemplate->id) }}" method="POST" id="updateTemplateForm">
                        @csrf
                        @method('PUT')

                        <div class="card border-0 bg-white shadow-sm">
                            <div class="card-body p-4">
                                {{-- 分类字段 --}}
                                <div class="col-12 mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-tag me-2 text-primary"></i>Category
                                    </label>
                                    <select class="form-control" name="category_id" id="category_id" required>
                                        <option value="">Select category</option>
                                        @foreach($categories as $category)
                                            <option value="{{ $category->id }}" {{ $sizeTemplate->category_id == $category->id ? 'selected' : '' }}>
                                                {{ $category->category_name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>Choose the category for this template
                                    </div>
                                </div>

                                {{-- 性别字段 --}}
                                <div class="col-12 mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-person me-2 text-primary"></i>Gender
                                    </label>
                                    <select class="form-control" name="gender_id" id="gender_id" required>
                                        <option value="">Select gender</option>
                                        @foreach($genders as $gender)
                                            <option value="{{ $gender->id }}" {{ $sizeTemplate->gender_id == $gender->id ? 'selected' : '' }}>
                                                {{ $gender->gender_name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>Choose the gender for this template
                                    </div>
                                </div>

                                {{-- 尺码库字段 --}}
                                <div class="col-12 mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-rulers me-2 text-primary"></i>Size Library
                                    </label>
                                    <select class="form-control" name="size_library_id" id="size_library_id" required data-current-value="{{ $sizeTemplate->size_library_id }}">
                                        <option value="">Select size library</option>
                                        @foreach($sizeLibraries as $sizeLibrary)
                                            <option value="{{ $sizeLibrary->id }}" {{ $sizeTemplate->size_library_id == $sizeLibrary->id ? 'selected' : '' }}>
                                                {{ $sizeLibrary->size_value }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>Select the size library for this template based on category and gender
                                    </div>
                                </div>

                                {{-- 模板状态字段 --}}
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-3">Template Status</label>
                                    <div class="row g-3">
                                        @php $currentStatus = $sizeTemplate->template_status ?? 'Available'; @endphp
                                        <div class="col-md-6">
                                            <div class="card h-100 border status-card {{ $currentStatus === 'Available' ? 'selected' : '' }}" data-status="Available">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="template_status" value="Available" class="form-check-input me-3"
                                                        {{ old('template_status', $currentStatus) === 'Available' ? 'checked' : '' }}>
                                                    <div>
                                                        <h6 class="card-title mb-1">
                                                            <i class="bi bi-check-circle me-2 text-success"></i>Available
                                                        </h6>
                                                        <p class="card-text text-muted small mb-0">Template is active and can be used</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="card h-100 border status-card {{ $currentStatus === 'Unavailable' ? 'selected' : '' }}" data-status="Unavailable">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="template_status" value="Unavailable" class="form-check-input me-3"
                                                        {{ old('template_status', $currentStatus) === 'Unavailable' ? 'checked' : '' }}>
                                                    <div>
                                                        <h6 class="card-title mb-1">
                                                            <i class="bi bi-x-circle me-2 text-danger"></i>Unavailable
                                                        </h6>
                                                        <p class="card-text text-muted small mb-0">Template is inactive and cannot be used</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>Choose whether the template can be used for product management
                                    </div>
                                </div>

                                {{-- 提交按钮区域 --}}
                                <div class="d-flex gap-3 mt-4">
                                    <button type="submit" class="btn btn-warning flex-fill">
                                        <i class="bi bi-pencil-square me-2"></i>Update Template Information
                                    </button>
                                    <a href="{{ route('admin.template.index') }}" class="btn btn-outline-secondary">
                                        <i class="bi bi-x-circle me-2"></i>Cancel
                                    </a>
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
{{-- ==========================================
    页面脚本区域
    ========================================== --}}
<script>
    {{-- 尺码模板管理路由配置 --}}
    window.updateTemplateUrl = "{{ route('admin.template.update', $sizeTemplate->id) }}";
    window.templateManagementRoute = "{{ route('admin.template.index') }}";
    window.availableSizeLibrariesUrl = "{{ route('admin.template.available-size-libraries') }}";
    window.availableTemplateUrl = "{{ route('admin.template.available', ['id' => ':id']) }}";
    window.unavailableTemplateUrl = "{{ route('admin.template.unavailable', ['id' => ':id']) }}";
    window.deleteTemplateUrl = "{{ route('admin.template.destroy', ['id' => ':id']) }}";
</script>

{{-- 引入尺码模板管理JavaScript文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/status-system.js') }}"></script>
<script src="{{ asset('assets/js/template-management.js') }}"></script>
@endsection
