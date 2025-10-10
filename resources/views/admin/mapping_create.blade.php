@extends("layouts.app")

@section("title", "Create Category Mapping")
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
                                <h2 class="dashboard-title mb-1">Create Category Mapping</h2>
                                <p class="dashboard-subtitle mb-0">Add mapping combinations to connect categories with subcategories</p>
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

    <!-- 主要内容卡片 - 左右布局 -->
    <form action="{{ route('admin.category_mapping.mapping.store') }}" method="post" id="mappingForm">
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
                            <!-- 分类选择 -->
                            <div class="mb-4">
                                <label for="category_id" class="form-label fw-bold">Category <span class="text-danger">*</span></label>
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

                            <!-- 子分类选择 -->
                            <div class="mb-4">
                                <label for="subcategory_id" class="form-label fw-bold">Subcategory <span class="text-danger">*</span></label>
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

                            <!-- 添加映射按钮 -->
                            <div class="mb-4">
                                <button type="button" class="btn btn-primary w-100" id="addMapping">
                                    <i class="bi bi-plus-circle me-2"></i>Add Mapping
                                </button>
                                <small class="text-muted">Select category and subcategory, then click add</small>
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
                                            <i class="bi bi-folder me-2 text-muted"></i>
                                            <span>Category: &nbsp;<strong id="selectedCategory">None</strong></span>
                                        </div>
                                        <div>
                                            <i class="bi bi-folder-plus me-2 text-muted"></i>
                                            <span>Subcategory: &nbsp;<strong id="selectedSubcategory">None</strong></span>
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

                <!-- 右侧映射列表区域 -->
                <div class="col-md-9">
                    <div class="card-body p-4">
                        <!-- 表单标题 -->
                        <h2 class="text-primary text-center mb-3">Mapping Combinations</h2>
                        <p class="text-muted text-center">Add mapping combinations for category-subcategory connections</p>
                        <hr>

                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Configure Mapping Combinations</h5>
                            <p class="text-muted">Select category and subcategory from the left panel to add mapping combinations</p>
                        </div>

                        <!-- 映射列表区域 -->
                        <div id="mappingArea" style="display: none;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">
                                    <i class="bi bi-collection text-primary me-2"></i>Mapping Combinations
                                </h5>
                                <div class="d-flex align-items-center gap-2">
                                    <button type="button" class="btn btn-sm btn-outline-secondary" id="sortMappings" title="Sort mappings">
                                        <i class="bi bi-sort-down" id="sortIcon"></i>
                                    </button>
                                    <span class="badge bg-info" id="mappingCount">0 mappings</span>
                                </div>
                            </div>

                            <div class="values-list" id="mappingList">
                                <!-- 映射将通过JavaScript动态添加 -->
                            </div>
                        </div>


                        <!-- 提交按钮 -->
                        <div id="submitSection" style="display: none;">
                            <hr class="my-4">
                            <button type="submit" class="btn btn-primary w-100 btn-lg">
                                <i class="bi bi-stack me-2"></i>Create Mappings
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
    // 设置分类映射管理相关路由
    window.mappingManagementRoute = "{{ route('admin.category_mapping.mapping.index') }}";
    window.createMappingUrl = "{{ route('admin.category_mapping.mapping.store') }}";
</script>

<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/mapping-management.js') }}"></script>
@endsection
