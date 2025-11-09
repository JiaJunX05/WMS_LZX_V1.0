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
    @include('admin.template.components.dashboard-header')

    {{-- 统计卡片区域 --}}
    @include('admin.template.components.metric-cards')

    {{-- 主要内容区域 --}}
    @include('admin.template.components.data-cards')

    {{-- 分页导航区域 --}}
    @include('admin.template.components.pagination-nav')

    {{-- Create Template Modal --}}
    @include('admin.template.create-model')
</div>

@endsection

@section("scripts")
{{-- 尺码模板管理路由配置 --}}
<script>
    // 设置尺码模板管理相关路由
    window.templateManagementRoute = "{{ route('admin.template.index') }}";
    window.createTemplateUrl = "{{ route('admin.template.create') }}";
    window.storeTemplateUrl = "{{ route('admin.template.store') }}";
    window.editTemplateUrl = "{{ route('admin.template.edit', ['id' => ':id']) }}";
    window.viewTemplateUrl = "{{ route('admin.template.view', ['id' => ':id']) }}";
    window.deleteTemplateUrl = "{{ route('admin.template.destroy', ['id' => ':id']) }}";
    window.availableTemplateUrl = "{{ route('admin.template.available', ['id' => ':id']) }}";
    window.unavailableTemplateUrl = "{{ route('admin.template.unavailable', ['id' => ':id']) }}";
    window.getAvailableSizeLibrariesUrl = "{{ route('admin.template.available-size-libraries') }}";
    window.availableSizeLibrariesUrl = "{{ route('admin.template.available-size-libraries') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/template-management.js') }}"></script>
@endsection
