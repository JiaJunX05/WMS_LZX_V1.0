{{-- ==========================================
    尺码模板管理仪表板
    功能：管理尺码模板，查看统计信息和按分类分组的模板
    ========================================== --}}

@extends("layouts.app")

@section("title", "Size Template Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.template-dashboard-header', ['type' => 'dashboard'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 统计卡片区域 --}}
    @include('components.metric-cards.template-metric-cards')

    {{-- 主要内容区域 --}}
    <div id="dashboard-cards-container" class="row g-4">
        {{-- 按类别分组的模板卡片将通过JavaScript动态加载 --}}
    </div>

    {{-- 空状态显示 --}}
    @include('components.empty-list.template-empty-list')

    {{-- 分页导航区域 --}}
    @include('components.pagination-nav.template-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 尺码模板管理路由配置 --}}
<script>
    // 设置尺码模板管理相关路由
    window.templateManagementRoute = "{{ route('admin.template.index') }}";
    window.createTemplateUrl = "{{ route('admin.template.create') }}";
    window.editTemplateUrl = "{{ route('admin.template.edit', ['id' => ':id']) }}";
    window.viewTemplateUrl = "{{ route('admin.template.view', ['id' => ':id']) }}";
    window.deleteTemplateUrl = "{{ route('admin.template.destroy', ['id' => ':id']) }}";
    window.availableTemplateUrl = "{{ route('admin.template.available', ['id' => ':id']) }}";
    window.unavailableTemplateUrl = "{{ route('admin.template.unavailable', ['id' => ':id']) }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/template-management.js') }}"></script>
@endsection
