{{-- ==========================================
    位置管理仪表板页面
    功能：位置列表展示、统计信息、分页管理、位置操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Location Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('admin.location.components.dashboard-header')

    {{-- 统计卡片区域 --}}
    @include('admin.location.components.metric-cards')

    {{-- 主要内容区域 --}}
    @include('admin.location.components.data-cards')

    {{-- 分页导航区域 --}}
    @include('admin.location.components.pagination-nav')

    {{-- Location Create Modal --}}
    @include('admin.location.create-model')
</div>

@endsection

@section("scripts")
{{-- 位置管理路由配置 --}}
<script>
    // 设置位置管理相关路由
    window.locationManagementRoute = "{{ route('admin.location.index') }}";
    window.createLocationUrl = "{{ route('admin.location.store') }}";
    window.viewLocationUrl = "{{ route('admin.location.view', ['id' => ':id']) }}";
    window.deleteLocationUrl = "{{ route('admin.location.destroy', ['id' => ':id']) }}";
    window.availableLocationUrl = "{{ route('admin.location.available', ['id' => ':id']) }}";
    window.unavailableLocationUrl = "{{ route('admin.location.unavailable', ['id' => ':id']) }}";

    // 设置可用 racks 数据（从后端传递）
    window.availableRacks = @json($racks);
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/location-management.js') }}"></script>
@endsection
