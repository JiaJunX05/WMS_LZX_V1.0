{{-- ==========================================
    区域管理仪表板页面
    功能：区域列表展示、搜索筛选、分页管理、区域操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Zone Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.zone-dashboard-header', ['type' => 'dashboard'])


    {{-- 统计卡片区域 --}}
    @include('components.metric-cards.zone-metric-cards')

    {{-- 搜索筛选区域 --}}
    @include('components.search-filters.zone-search-filters')

    {{-- 区域列表表格 --}}
    @include('components.data-tables.zone-data-tables')

    {{-- 空状态显示 --}}
    @include('components.empty-list.zone-empty-list')

    {{-- 分页导航区域 --}}
    @include('components.pagination-nav.zone-pagination-nav')
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
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/zone-management.js') }}"></script>
@endsection

