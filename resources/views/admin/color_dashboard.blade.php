{{-- ==========================================
    颜色管理仪表板页面
    功能：颜色列表展示、搜索筛选、分页管理、颜色操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Color Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.main-display.dashboard-header.color-header', ['type' => 'dashboard'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 统计卡片区域 --}}
    @include('components.main-display.stats-cards.color-stats-cards')

    {{-- 搜索筛选区域 --}}
    @include('components.main-display.search-filter.color-search-filter')

    {{-- 颜色列表表格 --}}
    @include('components.main-display.data-table.color-table')

    {{-- 分页导航区域 --}}
    @include('components.main-display.pagination-nav.color-pagination-nav')
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
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/color-management.js') }}"></script>
@endsection
