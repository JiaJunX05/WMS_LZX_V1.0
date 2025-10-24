{{-- ==========================================
    尺码模板管理仪表板
    功能：管理尺码模板，查看统计信息和按分类分组的模板
    ========================================== --}}

@extends("layouts.app")

@section("title", "Size Template Management")
@section("content")

{{-- ==========================================
    页面样式文件引入
    ========================================== --}}
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-card.css') }}">

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
                            <div class="header-icon-wrapper me-4"><i class="bi bi-collection-fill"></i></div>
                            <div>
                                <h2 class="dashboard-title mb-1">Size Template Management</h2>
                                <p class="dashboard-subtitle mb-0">Manage and organize size template combinations</p>
                            </div>
                        </div>
                    </div>
                    {{-- 右侧添加尺码模板按钮 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.template.create') }}" class="btn btn-primary">
                            <i class="bi bi-plus-circle-fill me-2"></i>Add Size Template
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- ==========================================
        统计卡片区域
        ========================================== --}}
    <div class="statistics-section mb-4">
        <div class="row g-4">
            {{-- 总模板数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="total-items">0</div>
                                <div class="stats-label">Total Templates</div>
                            </div>
                            <div class="stats-icon bg-primary"><i class="bi bi-collection"></i></div>
                        </div>
                    </div>
                </div>
            </div>
            {{-- 可用模板数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="available-items">0</div>
                                <div class="stats-label">Available Templates</div>
                            </div>
                            <div class="stats-icon bg-success"><i class="bi bi-check-circle"></i></div>
                        </div>
                    </div>
                </div>
            </div>
            {{-- 不可用模板数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="unavailable-items">0</div>
                                <div class="stats-label">Unavailable Templates</div>
                            </div>
                            <div class="stats-icon bg-danger"><i class="bi bi-x-circle"></i></div>
                        </div>
                    </div>
                </div>
            </div>
            {{-- 类别分组数 --}}
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="total-groups">0</div>
                                <div class="stats-label">Total Groups</div>
                            </div>
                            <div class="stats-icon bg-info"><i class="bi bi-tags"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- ==========================================
        主要内容区域
        ========================================== --}}
    <div id="dashboard-cards-container" class="row g-4">
        {{-- 按类别分组的模板卡片将通过JavaScript动态加载 --}}
    </div>

    {{-- 空状态显示 --}}
    <div id="empty-state" class="text-center py-5 d-none">
        <div class="empty-state-container">
            <div class="empty-state-icon mb-4">
                <i class="bi bi-collection" style="font-size: 4rem; color: #6c757d;"></i>
            </div>
            <h4 class="empty-state-title mb-3">No Size Template Data</h4>
            <p class="empty-state-description mb-4">No size templates have been created in the system yet</p>
            <a href="{{ route('admin.template.create') }}" class="btn btn-primary btn-lg">
                <i class="bi bi-plus-circle-fill me-2"></i>Create First Size Template
            </a>
        </div>
    </div>

    {{-- ==========================================
        分页导航区域
        ========================================== --}}
    <div class="d-flex justify-content-between align-items-center mt-4">
        {{-- 分页信息 --}}
        <div class="pagination-info text-muted">
            Showing <span class="fw-medium" id="showing-start">0</span>
            to <span class="fw-medium" id="showing-end">0</span>
            of <span class="fw-medium" id="total-count">0</span> entries
        </div>

        {{-- 分页控件 --}}
        <nav aria-label="Page navigation">
            <ul id="pagination" class="pagination pagination-sm mb-0">
                <li class="page-item disabled" id="prev-page">
                    <a class="page-link" href="#" aria-label="Previous">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                </li>
                <li class="page-item active" id="current-page">
                    <span class="page-link" id="page-number">1</span>
                </li>
                <li class="page-item disabled" id="next-page">
                    <a class="page-link" href="#" aria-label="Next">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</div>

@endsection

@section("scripts")
{{-- ==========================================
    页面脚本区域
    ========================================== --}}
<script>
    {{-- 尺码模板管理路由配置 --}}
    window.templateManagementRoute = "{{ route('admin.template.index') }}";
    window.createTemplateUrl = "{{ route('admin.template.create') }}";
    window.editTemplateUrl = "{{ route('admin.template.edit', ['id' => ':id']) }}";
    window.viewTemplateUrl = "{{ route('admin.template.view', ['id' => ':id']) }}";
    window.deleteTemplateUrl = "{{ route('admin.template.destroy', ['id' => ':id']) }}";
    window.availableTemplateUrl = "{{ route('admin.template.available', ['id' => ':id']) }}";
    window.unavailableTemplateUrl = "{{ route('admin.template.unavailable', ['id' => ':id']) }}";
</script>

{{-- 引入尺码模板管理JavaScript文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/template-management.js') }}"></script>
@endsection
