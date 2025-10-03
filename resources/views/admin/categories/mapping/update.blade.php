@extends("layouts.app")

@section("title", "Update Category Mapping")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/dashboard-template.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/common/update-page.css') }}">

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
                                    @if(isset($category))
                                        Update {{ $category->category_name }} Mappings
                                    @else
                                        Update Category Mapping
                                    @endif
                                </h2>
                                <p class="dashboard-subtitle mb-0">
                                    @if(isset($category))
                                        Manage mapping combinations for {{ $category->category_name }} category
                                    @else
                                        Modify existing mapping information
                                    @endif
                                </p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.category_mapping.mapping.index') }}" class="btn btn-primary">
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

    <!-- 统一的映射管理界面 -->
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
                            <strong>Current Mapping</strong>
                        </div>
                        <div class="small">
                            <div class="mb-1">
                                <i class="bi bi-tag me-2 text-muted"></i>
                                <span>Category: <strong>{{ $mapping->category->category_name ?? 'N/A' }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-tags me-2 text-muted"></i>
                                <span>Subcategory: <strong>{{ $mapping->subcategory->subcategory_name ?? 'N/A' }}</strong></span>
                            </div>
                            <div>
                                <i class="bi bi-toggle-on me-2 text-muted"></i>
                                <span>Status: <strong>{{ $mapping->mapping_status ?? 'N/A' }}</strong></span>
                            </div>
                        </div>
                    </div>

                    <!-- 统计信息 -->
                    <div class="mt-auto">
                        <div class="row text-center">
                            <div class="col-12">
                                <div class="h4 text-primary mb-0">1</div>
                                <small class="text-muted">Mapping Entry</small>
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
                                <i class="bi bi-pencil-square me-2"></i>Update Category Mapping
                            </h6>
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i>
                                Modify mapping configuration below.
                            </small>
                        </div>
                    </div>

                    <!-- 编辑表单 -->
                    <form action="{{ route('admin.category_mapping.mapping.update', $mapping->id) }}" method="POST" id="updateMappingForm">
                        @csrf
                        @method('PUT')

                        <div class="card border-0 bg-white shadow-sm">
                            <div class="card-body p-4">
                                <!-- Category Field -->
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-tag me-2 text-primary"></i>Category
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light border-end-0">
                                            <i class="bi bi-tag text-muted"></i>
                                        </span>
                                        <select class="form-select border-start-0" name="category_id" id="category_id" required>
                                            <option value="">Select category</option>
                                            @foreach($categories as $category)
                                                <option value="{{ $category->id }}"
                                                    {{ $mapping->category_id == $category->id ? 'selected' : '' }}>
                                                    {{ $category->category_name }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Choose the category for this mapping
                                    </div>
                                </div>

                                <!-- Subcategory Field -->
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-tags me-2 text-primary"></i>Subcategory
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light border-end-0">
                                            <i class="bi bi-tags text-muted"></i>
                                        </span>
                                        <select class="form-select border-start-0" name="subcategory_id" id="subcategory_id" required>
                                            <option value="">Select subcategory</option>
                                            @foreach($subcategories as $subcategory)
                                                <option value="{{ $subcategory->id }}"
                                                    {{ $mapping->subcategory_id == $subcategory->id ? 'selected' : '' }}>
                                                    {{ $subcategory->subcategory_name }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Choose the subcategory for this mapping
                                    </div>
                                </div>

                                <!-- Mapping Status Field -->
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-3">Mapping Status</label>
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="card h-100 status-card {{ $mapping->mapping_status === 'Available' ? 'selected' : '' }}" data-status="Available">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="mapping_status" value="Available" class="form-check-input me-3" {{ $mapping->mapping_status === 'Available' ? 'checked' : '' }}>
                                                    <div>
                                                        <div class="fw-semibold text-success">
                                                            <i class="bi bi-check-circle-fill me-2"></i>Available
                                                        </div>
                                                        <small class="text-muted">Mapping is active and can be used</small>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="card h-100 status-card {{ $mapping->mapping_status === 'Unavailable' ? 'selected' : '' }}" data-status="Unavailable">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="mapping_status" value="Unavailable" class="form-check-input me-3" {{ $mapping->mapping_status === 'Unavailable' ? 'checked' : '' }}>
                                                    <div>
                                                        <div class="fw-semibold text-secondary">
                                                            <i class="bi bi-slash-circle-fill me-2"></i>Unavailable
                                                        </div>
                                                        <small class="text-muted">Mapping is inactive and cannot be used</small>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Action Button -->
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary btn-lg">
                                        <i class="bi bi-check-lg me-2"></i>Update Mapping
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

{{-- JavaScript支持 --}}
<script>
    // 设置路由
    window.updateMappingUrl = "{{ route('admin.category_mapping.mapping.update', $mapping->id) }}";
    window.mappingManagementRoute = "{{ route('admin.category_mapping.mapping.index') }}";
</script>

@endsection

@section("scripts")
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/update-common.js') }}"></script>
<script src="{{ asset('assets/js/category-mapping/category-mapping-update.js') }}"></script>
@endsection
