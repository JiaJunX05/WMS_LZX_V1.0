@extends("layouts.app")

@section("title", "Create Category Mapping")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

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
                                <i class="bi bi-tags-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Category Mapping</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple mapping combinations to connect categories with subcategories</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.mapping.index') }}" class="btn btn-primary">
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
    <form action="{{ route('admin.mapping.store') }}" method="post" id="mappingForm">
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
                        {{-- 分類選擇 (Category Selection) --}}
                        <div class="mb-4">
                            <label class="form-label">Category <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-white border-end-0">
                                    <i class="bi bi-folder text-primary"></i>
                                </span>
                                <select class="form-select border-start-0" id="category_id" name="category_id">
                                    <option value="">Select category</option>
                                    @foreach($categories as $category)
                                        <option value="{{ $category->id }}"
                                                {{ $category->category_status === 'Unavailable' ? 'disabled' : '' }}
                                                data-status="{{ $category->category_status }}">
                                            {{ strtoupper($category->category_name) }}
                                            @if($category->category_status === 'Unavailable')
                                                (Unavailable)
                                            @endif
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                        </div>

                        {{-- 子分類選擇 (Subcategory Selection) --}}
                        <div class="mb-4">
                            <label class="form-label">Subcategory <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-white border-end-0">
                                    <i class="bi bi-folder-plus text-primary"></i>
                                </span>
                                <select class="form-select border-start-0" id="subcategory_id" name="subcategory_id">
                                    <option value="">Select subcategory</option>
                                    @foreach($subcategories as $subcategory)
                                        <option value="{{ $subcategory->id }}"
                                                {{ $subcategory->subcategory_status === 'Unavailable' ? 'disabled' : '' }}
                                                data-status="{{ $subcategory->subcategory_status }}">
                                            {{ strtoupper($subcategory->subcategory_name) }}
                                            @if($subcategory->subcategory_status === 'Unavailable')
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
                                <button type="button" class="btn btn-success flex-fill" id="addMapping">
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
                                    <i class="bi bi-tags me-2"></i>Mapping Management
                                </h6>
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Manage and organize your mappings below.
                                </small>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="sortMappings" title="Sort mappings">
                                    <i class="bi bi-sort-down" id="sortIcon"></i>
                                </button>
                                <span class="badge bg-primary" id="mappingValuesCount">0 mappings</span>
                            </div>
                        </div>
                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Ready to Configure Mappings</h5>
                            <p class="text-muted mb-0">Select category and subcategory on the left and click "Add To List"</p>
                        </div>

                        <!-- 映射列表区域 -->
                        <div id="mappingValuesArea" class="d-none">
                            <div class="values-list overflow-auto" id="mappingValuesList" style="max-height: 400px;">
                                <!-- 映射将通过JavaScript动态添加 -->
                            </div>
                        </div>
                        <!-- 提交按钮区域 -->
                        <div id="submitSection" class="mt-4 d-none">
                            <div class="d-grid">
                                <button type="submit" class="btn btn-success">
                                    <i class="bi bi-stack me-2"></i>Create All Mappings
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
    // 设置分类映射管理相关路由
    window.mappingManagementRoute = "{{ route('admin.mapping.index') }}";
    window.createMappingUrl = "{{ route('admin.mapping.store') }}";
</script>

<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/mapping-management.js') }}"></script>
@endsection
