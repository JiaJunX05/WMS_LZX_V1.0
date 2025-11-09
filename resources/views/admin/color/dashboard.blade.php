{{-- ==========================================
    颜色管理仪表板页面
    功能：颜色列表展示、搜索筛选、分页管理、颜色操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Color Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('admin.color.components.dashboard-header')

    {{-- 统计卡片区域 --}}
    @include('admin.color.components.metric-cards')

    {{-- 搜索筛选区域 --}}
    @include('admin.color.components.search-filters')

    {{-- 颜色列表表格 --}}
    @include('admin.color.components.data-table')

    {{-- 分页导航区域 --}}
    @include('admin.color.components.pagination-nav')
</div>

    {{-- Create Color 弹窗模态框 --}}
    @include('admin.color.create-model')

    {{-- Update Color 弹窗模态框 --}}
    @include('admin.color.update-model')

@endsection

@section("scripts")
{{-- 颜色管理路由配置 --}}
<script>
    // 设置颜色管理相关URL
    window.colorManagementRoute = "{{ route('admin.color.index') }}";
    window.createColorUrl = "{{ route('admin.color.store') }}";
    window.updateColorUrl = "{{ route('admin.color.update', ['id' => ':id']) }}";
    window.editColorUrl = "{{ route('admin.color.edit', ':id') }}";
    window.deleteColorUrl = "{{ route('admin.color.destroy', ['id' => ':id']) }}";
    window.availableColorUrl = "{{ route('admin.color.available', ['id' => ':id']) }}";
    window.unavailableColorUrl = "{{ route('admin.color.unavailable', ['id' => ':id']) }}";
    window.colorExportUrl = "{{ route('admin.color.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('node_modules/colorjs.io/dist/color.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/color-management.js') }}"></script>
@endsection
