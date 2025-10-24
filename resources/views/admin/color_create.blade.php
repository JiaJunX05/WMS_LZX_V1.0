{{-- ==========================================
    颜色创建页面
    功能：创建新的产品颜色
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Color")
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
                            <div class="header-icon-wrapper me-4"><i class="bi bi-palette-fill"></i></div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Color</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple colors to organize and manage products</p>
                            </div>
                        </div>
                    </div>
                    {{-- 右侧返回按钮 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.color.index') }}" class="btn btn-primary">
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
        颜色创建表单
        ========================================== --}}
    <form action="{{ route('admin.color.store') }}" method="post" id="colorForm">
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

                        {{-- 颜色名称输入 --}}
                        <div class="mb-4">
                            <label class="form-label">Color Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="color_name" id="color_name" placeholder="Enter color name">
                        </div>

                        {{-- 颜色代码输入 --}}
                        <div class="mb-4">
                            <label class="form-label">Color Hex Code</label>
                            <input type="text" class="form-control" name="color_hex" id="color_hex" placeholder="Enter hex code (e.g., #FF0000)">
                            <small class="text-muted">Enter the color's hex code (e.g., #FF0000 for red)</small>
                            {{-- 颜色预览区域 --}}
                            <div class="mt-3">
                                <div class="rounded-3 border border-3 border-white shadow-sm" id="color-preview"
                                    style="background-color: #f3f4f6; width: 100%; height: 64px; transition: all 0.3s ease;">
                                </div>
                            </div>
                        </div>

                        {{-- 操作按钮区域 --}}
                        <div class="mt-auto">
                            <div class="d-flex gap-3">
                                <button type="button" class="btn btn-success flex-fill" id="addColor">
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
                    右侧颜色管理区域
                    ========================================== --}}
                <div class="col-md-8">
                    <div class="size-values-section p-4">
                        {{-- 管理区域标题 --}}
                        <div class="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h6 class="mb-0 fw-bold">
                                    <i class="bi bi-palette me-2"></i>Color Management
                                </h6>
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>Manage and organize your colors below.
                                </small>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="sortColors" title="Sort colors">
                                    <i class="bi bi-sort-down" id="sortIcon"></i>
                                </button>
                                <span class="badge bg-primary" id="colorValuesCount">0 colors</span>
                            </div>
                        </div>

                        {{-- 初始提示信息 --}}
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Ready to Configure Colors</h5>
                            <p class="text-muted mb-0">Fill in the color details on the left and click "Add To List"</p>
                        </div>

                        {{-- 颜色列表区域 --}}
                        <div id="colorValuesArea" class="d-none">
                            <div class="values-list overflow-auto" id="colorValuesList" style="max-height: 400px;">
                                {{-- 颜色将通过JavaScript动态添加 --}}
                            </div>
                        </div>

                        {{-- 提交按钮区域 --}}
                        <div id="submitSection" class="mt-4 d-none">
                            <div class="d-grid">
                                <button type="submit" class="btn btn-success">
                                    <i class="bi bi-stack me-2"></i>Create All Colors
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
<script>
    {{-- 颜色管理路由配置 --}}
    window.createColorUrl = "{{ route('admin.color.store') }}";
    window.colorManagementRoute = "{{ route('admin.color.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('node_modules/colorjs.io/dist/color.js') }}"></script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/color-management.js') }}"></script>
@endsection
