{{-- ==========================================
    货架管理仪表板页面
    功能：货架列表展示、搜索筛选、分页管理、货架操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Rack Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('admin.rack.components.dashboard-header')

    {{-- 统计卡片区域 --}}
    @include('admin.rack.components.metric-cards')

    {{-- 搜索筛选区域 --}}
    @include('admin.rack.components.search-filters')

    {{-- 货架列表表格 --}}
    @include('admin.rack.components.data-table')

    {{-- 分页导航区域 --}}
    @include('admin.rack.components.pagination-nav')
</div>

    {{-- Add Rack 弹窗模态框 --}}
    @include('admin.rack.create-model')

    {{-- Update Rack 弹窗模态框 --}}
    @include('admin.rack.update-model')

@endsection

@section("scripts")
{{-- 货架管理路由配置 --}}
<script>
    // 设置货架管理相关URL
    window.rackManagementRoute = "{{ route('admin.rack.index') }}";
    window.createRackUrl = "{{ route('admin.rack.store') }}";
    window.updateRackUrl = "{{ route('admin.rack.update', ['id' => ':id']) }}";
    window.editRackUrl = "{{ route('admin.rack.edit', ':id') }}";
    window.deleteRackUrl = "{{ route('admin.rack.destroy', ['id' => ':id']) }}";
    window.availableRackUrl = "{{ route('admin.rack.available', ['id' => ':id']) }}";
    window.unavailableRackUrl = "{{ route('admin.rack.unavailable', ['id' => ':id']) }}";
    window.rackExportUrl = "{{ route('admin.rack.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/rack-management.js') }}"></script>
@endsection
