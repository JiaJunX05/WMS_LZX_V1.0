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
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('admin.zone.components.dashboard-header')

    {{-- 统计卡片区域 --}}
    @include('admin.zone.components.metric-cards')

    {{-- 搜索筛选区域 --}}
    @include('admin.zone.components.search-filters')

    {{-- 区域列表表格 --}}
    @include('admin.zone.components.data-table')

    {{-- 分页导航区域 --}}
    @include('admin.zone.components.pagination-nav')
</div>

    {{-- Add Zone 弹窗模态框 --}}
    @include('admin.zone.create-model')

    {{-- Update Zone 弹窗模态框 --}}
    @include('admin.zone.update-model')

@endsection

@section("scripts")
{{-- 区域管理路由配置 --}}
<script>
    // 设置区域管理相关URL
    window.zoneManagementRoute = "{{ route('admin.zone.index') }}";
    window.createZoneUrl = "{{ route('admin.zone.store') }}";
    window.updateZoneUrl = "{{ route('admin.zone.update', ['id' => ':id']) }}";
    window.editZoneUrl = "{{ route('admin.zone.edit', ':id') }}";
    window.deleteZoneUrl = "{{ route('admin.zone.destroy', ['id' => ':id']) }}";
    window.availableZoneUrl = "{{ route('admin.zone.available', ['id' => ':id']) }}";
    window.unavailableZoneUrl = "{{ route('admin.zone.unavailable', ['id' => ':id']) }}";
    window.zoneExportUrl = "{{ route('admin.zone.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/zone-management.js') }}"></script>
@endsection

