{{-- ==========================================
    分类映射管理仪表板
    功能：管理分类和子分类的映射关系，查看统计信息
    ========================================== --}}

@extends("layouts.app")

@section("title", "Category Mapping Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-card.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.mapping-dashboard-header', ['type' => 'dashboard'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 统计卡片区域 --}}
    @include('components.metric-cards.mapping-metric-cards')

    {{-- 主要内容区域 --}}
    <div class="row g-4" id="dashboard-cards-container">
        {{-- 分类映射卡片将通过JavaScript动态加载 --}}
    </div>

    {{-- 空状态显示 --}}
    @include('components.empty-list.mapping-empty-state')

    {{-- 无结果提示 --}}
    <div id="no-results" class="text-center py-4 d-none">
        <div class="text-muted">No mappings found</div>
    </div>

    {{-- 分页导航区域 --}}
    @include('components.pagination-nav.mapping-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 分类映射管理路由配置 --}}
<script>
    // 设置分类映射管理相关路由
    window.categoryMappingManagementRoute = "{{ route('admin.mapping.index') }}";
    window.viewCategoryMappingUrl = "{{ route('admin.mapping.view', ['id' => ':id']) }}";
    window.editCategoryMappingUrl = "{{ route('admin.mapping.edit', ['id' => ':id']) }}";
    window.editMappingUrl = "{{ route('admin.mapping.edit', ['id' => ':id']) }}";
    window.deleteMappingUrl = "{{ route('admin.mapping.destroy', ['id' => ':id']) }}";
    window.availableMappingUrl = "{{ route('admin.mapping.available', ['id' => ':id']) }}";
    window.unavailableMappingUrl = "{{ route('admin.mapping.unavailable', ['id' => ':id']) }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/mapping-management.js') }}"></script>
@endsection
