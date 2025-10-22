@extends("layouts.app")

@section("title", "Create Color")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
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
                                <i class="bi bi-palette-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Color</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple colors to organize and manage products</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.color.index') }}" class="btn btn-primary">
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
    <form action="{{ route('admin.color.store') }}" method="post" id="colorForm" enctype="multipart/form-data">
        @csrf
        <div class="row">
            {{-- =============================================================================
                 左側主要內容區域 (Left Content Area)
                 ============================================================================= --}}
            <div class="col-lg-4">
                {{-- 顏色基本信息卡片 (Color Basic Information Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Color Information</h5>
                    </div>
                    <div class="card-body">
                        {{-- 顏色名稱 (Color Name) --}}
                        <div class="mb-3">
                            <label class="form-label">Color Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="color_name" id="color_name" placeholder="Enter color name">
                        </div>

                        {{-- 顏色代碼 (Color Hex Code) --}}
                        <div class="mb-3">
                            <label class="form-label">Color Hex Code</label>
                            <input type="text" class="form-control" name="color_hex" id="color_hex" placeholder="Enter hex code (e.g., #FF0000)">
                            <small class="text-muted">Enter the color's hex code (e.g., #FF0000 for red)</small>
                            <!-- 顏色預覽區域 -->
                            <div class="mt-3">
                                <div class="color-preview" id="color-preview" style="background-color: #f3f4f6; width: 100%; height: 64px; border-radius: 16px; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);"></div>
                            </div>
                        </div>
                    </div>

                    {{-- 操作按钮区域 --}}
                    <div class="card-footer">
                        <div class="d-flex gap-3">
                            <button type="button" class="btn btn-primary flex-fill" id="addColor">
                                <i class="bi bi-plus-circle me-2"></i>Add To List
                            </button>
                            <button type="button" class="btn btn-outline-secondary" id="clearForm">
                                <i class="bi bi-x-circle me-2"></i>Clear All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {{-- =============================================================================
                 右側操作面板 (Right Sidebar)
                 ============================================================================= --}}
            <div class="col-lg-8">
                {{-- 顏色管理卡片 (Color Management Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">Color Management</h5>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="sortColors" title="Sort colors">
                                    <i class="bi bi-sort-down" id="sortIcon"></i>
                                </button>
                                <span class="badge bg-primary" id="colorValuesCount">0 colors</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Ready to Configure Colors</h5>
                            <p class="text-muted mb-0">Fill in the color details on the left and click "Add To List"</p>
                        </div>

                        <!-- 颜色列表区域 -->
                        <div id="colorValuesArea" class="d-none">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th class="text-center" style="width: 8%">#</th>
                                            <th style="width: 60%">COLOR INFORMATION</th>
                                            <th class="text-end" style="width: 32%">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody id="colorValuesList"></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 颜色输入提示 -->
                        <div id="colorInputPrompt" class="text-center text-muted py-4 d-none">
                            <i class="bi bi-arrow-up-circle fs-1 text-muted mb-3"></i>
                            <h6 class="text-muted">Add More Colors</h6>
                            <p class="text-muted small">Enter color details in the left panel to continue</p>
                        </div>
                    </div>

                    <!-- 提交按钮区域 -->
                    <div id="submitSection" class="card-footer d-none">
                        <div class="d-grid">
                            <button type="submit" class="btn btn-success btn-lg py-3">
                                <i class="bi bi-stack me-2"></i>Create All Colors
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
    window.createColorUrl = "{{ route('admin.color.store') }}";
    window.colorManagementRoute = "{{ route('admin.color.index') }}";
</script>
<!-- Color.js 颜色库 (本地安装) -->
<script src="{{ asset('node_modules/colorjs.io/dist/color.js') }}"></script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/color-management.js') }}"></script>
@endsection
