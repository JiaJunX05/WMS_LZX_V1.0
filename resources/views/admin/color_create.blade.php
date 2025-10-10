@extends("layouts.app")

@section("title", "Create Color")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-table-list.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
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
                                <h2 class="dashboard-title mb-1">Create Color</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple colors to organize and manage products</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.management_tool.color.index') }}" class="btn btn-primary">
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
    <form action="{{ route('admin.management_tool.color.store') }}" method="post" id="colorForm" enctype="multipart/form-data">
        @csrf
        <div class="card shadow-sm border-0">
            <div class="row g-0">
                <!-- 左侧配置区域 -->
                <div class="col-md-3">
                    <div class="config-section d-flex flex-column h-100 p-4">
                        <!-- 配置标题 -->
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="mb-0 fw-bold text-primary">
                                <i class="bi bi-gear-fill me-2"></i>Configuration
                            </h6>
                            <span class="badge bg-white text-dark border px-3 py-2">Step 1</span>
                        </div>

                        <!-- 配置内容 -->
                        <div class="config-content flex-grow-1">
                            <!-- 颜色名称输入 -->
                            <div class="mb-4">
                                <label for="color_name" class="form-label fw-bold">Color Name <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-palette text-primary"></i>
                                    </span>
                                    <input type="text" class="form-control border-start-0" id="color_name" name="color_name"
                                           placeholder="Enter color name">
                                    <button type="button" class="btn btn-outline-primary" id="addColor">
                                        <i class="bi bi-plus-circle"></i>
                                    </button>
                                </div>
                                <small class="text-muted">Enter the color name and click + to add</small>
                            </div>

                            <!-- 颜色代码输入 -->
                            <div class="mb-4">
                                <label for="color_hex" class="form-label fw-bold">Color Hex Code</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-hash text-primary"></i>
                                    </span>
                                    <input type="text" class="form-control border-start-0" id="color_hex" name="color_hex"
                                           placeholder="Enter hex code (e.g., #FF0000)">
                                </div>
                                <small class="text-muted">Enter the color's hex code (e.g., #FF0000 for red)</small>
                                <!-- 颜色预览区域 -->
                                <div class="mt-3">
                                    <div class="color-preview" id="color-preview" style="background-color: #f3f4f6; width: 100%; height: 64px; border-radius: 16px; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);"></div>
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
                                            <i class="bi bi-palette me-2 text-muted"></i>
                                            <span>Colors: &nbsp;<strong id="selectedColor">None</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 快速操作 -->
                            <div class="quick-actions mt-auto">
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-outline-success" id="addCommonColors">
                                        <i class="bi bi-list-ul me-2"></i>Add Common Colors
                                    </button>
                                    <button type="button" class="btn btn-outline-info" id="addFashionColors">
                                        <i class="bi bi-shop me-2"></i>Add Fashion Colors
                                    </button>
                                    <hr class="my-2">
                                    <button type="button" class="btn btn-outline-secondary" id="clearForm">
                                        <i class="bi bi-x-circle me-2"></i>Clear All
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧颜色列表区域 -->
                <div class="col-md-9">
                    <div class="card-body p-4">
                        <!-- 表单标题 -->
                        <h2 class="text-primary text-center mb-3">Colors</h2>
                        <p class="text-muted text-center">Add colors for organizing and managing products</p>
                        <hr>

                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Configure Colors</h5>
                            <p class="text-muted">Add color names from the left panel</p>
                        </div>

                        <!-- 颜色列表区域 -->
                        <div id="colorValuesArea" style="display: none;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">
                                    <i class="bi bi-collection text-primary me-2"></i>Colors
                                    <span class="text-muted" id="colorName"></span>
                                </h5>
                                <div class="d-flex align-items-center gap-2">
                                    <button type="button" class="btn btn-sm btn-outline-secondary" id="sortColors" title="Sort colors">
                                        <i class="bi bi-sort-down" id="sortIcon"></i>
                                    </button>
                                    <span class="badge bg-info" id="colorValuesCount">0 colors</span>
                                </div>
                            </div>

                            <div class="values-list" id="colorValuesList">
                                <!-- 颜色将通过JavaScript动态添加 -->
                            </div>
                        </div>

                        <!-- 颜色输入提示 -->
                        <div id="colorInputPrompt" class="text-center text-muted py-4" style="display: none;">
                            <i class="bi bi-arrow-up-circle fs-1 text-muted mb-3"></i>
                            <h6 class="text-muted">Add Colors</h6>
                            <p class="text-muted small">Enter color names in the left panel</p>
                        </div>

                        <!-- 提交按钮 -->
                        <div id="submitSection" style="display: none;">
                            <hr class="my-4">
                            <button type="submit" class="btn btn-primary w-100 btn-lg">
                                <i class="bi bi-stack me-2"></i>Create Colors
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
    window.createColorUrl = "{{ route('admin.management_tool.color.store') }}";
    window.colorManagementRoute = "{{ route('admin.management_tool.color.index') }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/color-management.js') }}"></script>
@endsection
