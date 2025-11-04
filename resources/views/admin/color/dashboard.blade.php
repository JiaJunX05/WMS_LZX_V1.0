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

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.color-dashboard-header', ['type' => 'dashboard'])


    {{-- 统计卡片区域 --}}
    @include('components.metric-cards.color-metric-cards')

    {{-- 搜索筛选区域 --}}
    @include('components.search-filters.color-search-filters')

    {{-- 颜色列表表格 --}}
    @include('components.data-tables.color-data-tables')

    {{-- 空状态显示 --}}
    @include('components.empty-list.color-empty-list')

    {{-- 分页导航区域 --}}
    @include('components.pagination-nav.color-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 颜色管理路由配置 --}}
<script>
    // 设置颜色管理相关URL
    window.colorManagementRoute = "{{ route('admin.color.index') }}";
    window.editColorUrl = "{{ route('admin.color.edit', ['id' => ':id']) }}";
    window.deleteColorUrl = "{{ route('admin.color.destroy', ['id' => ':id']) }}";
    window.availableColorUrl = "{{ route('admin.color.available', ['id' => ':id']) }}";
    window.unavailableColorUrl = "{{ route('admin.color.unavailable', ['id' => ':id']) }}";
    window.colorExportUrl = "{{ route('admin.color.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/color-management.js') }}"></script>
@endsection
