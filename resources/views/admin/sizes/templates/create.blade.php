@extends("layouts.app")

@section("title", "Create Size Template")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-table-list.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-size-card.css') }}">
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
                                <h2 class="dashboard-title mb-1">Create Size Template</h2>
                                <p class="dashboard-subtitle mb-0">Add size template combinations to manage size systems</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.size_library.template.index') }}" class="btn btn-primary">
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
    <form action="{{ route('admin.size_library.template.store') }}" method="post" id="templateForm">
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
                                        <i class="bi bi-tag text-primary"></i>
                                    </span>
                                    <select class="form-control border-start-0" id="category_id" name="category_id" required>
                                        <option value="">Select category</option>
                                        @foreach($categories as $category)
                                            <option value="{{ $category->id }}">{{ $category->category_name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <!-- 性别选择 -->
                            <div class="mb-4">
                                <label for="gender_id" class="form-label fw-bold">Gender <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-person text-primary"></i>
                                    </span>
                                    <select class="form-control border-start-0" id="gender_id" name="gender_id" required>
                                        <option value="">Select gender</option>
                                        @foreach($genders as $gender)
                                            <option value="{{ $gender->id }}">{{ $gender->gender_name }}</option>
                                        @endforeach
                                    </select>
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
                                            <i class="bi bi-tag me-2 text-muted"></i>
                                            <span>Category: &nbsp;<strong id="selectedCategory">None</strong></span>
                                        </div>
                                        <div class="mb-1">
                                            <i class="bi bi-person me-2 text-muted"></i>
                                            <span>Gender: &nbsp;<strong id="selectedGender">None</strong></span>
                                        </div>
                                        <div>
                                            <i class="bi bi-collection me-2 text-muted"></i>
                                            <span>Templates: &nbsp;<strong id="selectedSizeLibrary">None</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 快速操作 -->
                            <div class="quick-actions mt-auto">
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-outline-success" id="selectAllBtn">
                                        <i class="bi bi-check2-all me-2"></i>Select All
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary" id="clearAllBtn">
                                        <i class="bi bi-x-circle me-2"></i>Clear All
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧模板列表区域 -->
                <div class="col-md-9">
                    <div class="card-body p-4">
                        <!-- 表单标题 -->
                        <h2 class="text-primary text-center mb-3">Template Combinations</h2>
                        <p class="text-muted text-center">Add template combinations for the selected category and gender</p>
                        <hr>

                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Configure Size Templates</h5>
                            <p class="text-muted">Select category and gender from the left panel to view available size libraries</p>
                        </div>

                        <!-- 尺码库选择区域 -->
                        <div id="sizeLibrarySelection" style="display: none;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">
                                    <i class="bi bi-collection text-primary me-2"></i>Available Size Libraries
                                </h5>
                                <span class="badge bg-primary" id="selectionCounter">0 selected</span>
                            </div>

                            <!-- 尺码库卡片容器 -->
                            <div id="sizeLibraryCardsContainer" class="mb-4">
                                <!-- 尺码库卡片将通过JavaScript动态添加 -->
                            </div>

                            <!-- 状态选择 -->
                            <div class="mb-4">
                                <hr class="my-4">
                                <h5 class="mb-3">
                                    <i class="bi bi-toggle-on text-primary me-2"></i>Template Status
                                </h5>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="card h-100 border status-card selected" data-status="Available">
                                            <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                <input type="radio" name="template_status" value="Available" class="form-check-input me-3" checked>
                                                <div>
                                                    <div class="fw-semibold text-success">
                                                        <i class="bi bi-check-circle-fill me-2"></i>Available
                                                    </div>
                                                    <small class="text-muted">Template will be active and usable</small>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="card h-100 border status-card" data-status="Unavailable">
                                            <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                <input type="radio" name="template_status" value="Unavailable" class="form-check-input me-3">
                                                <div>
                                                    <div class="fw-semibold text-secondary">
                                                        <i class="bi bi-slash-circle-fill me-2"></i>Unavailable
                                                    </div>
                                                    <small class="text-muted">Template will be inactive</small>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 提交按钮 -->
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary btn-lg">
                                    <i class="bi bi-plus-circle me-2"></i>Create Size Templates
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
    // JavaScript URL definitions
    window.createTemplateUrl = "{{ route('admin.size_library.template.store') }}";
    window.templateManagementRoute = "{{ route('admin.size_library.template.index') }}";
    window.getAvailableSizeLibrariesUrl = "{{ route('admin.size_library.template.available-size-libraries') }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/template-common.js') }}"></script>
<script src="{{ asset('assets/js/size-library/template-create.js') }}"></script>
@endsection
