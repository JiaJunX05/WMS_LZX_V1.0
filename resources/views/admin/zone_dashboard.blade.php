{{-- ==========================================
    区域管理仪表板页面
    功能：区域列表展示、搜索筛选、分页管理、区域操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Zone Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.main-display.dashboard-header.zone-header', ['type' => 'dashboard'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 统计卡片区域 --}}
    @include('components.main-display.stats-cards.zone-stats-cards')

    {{-- 搜索筛选区域 --}}
    @include('components.main-display.search-filter.zone-search-filter')

    {{-- 区域列表表格 --}}
    @include('components.main-display.data-table.zone-table')

    {{-- 分页导航区域 --}}
    @include('components.main-display.pagination-nav.zone-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 区域管理路由配置 --}}
<script>
    // 设置区域管理相关URL
    window.zoneManagementRoute = "{{ route('admin.zone.index') }}";
    window.editZoneUrl = "{{ route('admin.zone.edit', ['id' => ':id']) }}";
    window.deleteZoneUrl = "{{ route('admin.zone.destroy', ['id' => ':id']) }}";
    window.availableZoneUrl = "{{ route('admin.zone.available', ['id' => ':id']) }}";
    window.unavailableZoneUrl = "{{ route('admin.zone.unavailable', ['id' => ':id']) }}";
    window.zoneExportUrl = "{{ route('admin.zone.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/zone-management.js') }}"></script>
@endsection

