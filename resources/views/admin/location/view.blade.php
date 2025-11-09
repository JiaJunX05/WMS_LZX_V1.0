{{-- ==========================================
    位置查看页面
    功能：查看区域和货架的位置关系详情
    ========================================== --}}

@extends("layouts.app")

@section("title", "View Storage Location")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('admin.location.components.view-header')

    {{-- 主要内容卡片 --}}
    @include('admin.location.view-model')

    {{-- Location Update Modal --}}
    @include('admin.location.update-model')
</div>

@endsection

@section("scripts")
{{-- 位置管理路由配置 --}}
<script>
    // 设置位置管理相关路由
    window.viewLocationUrl = "{{ route('admin.location.view', ['id' => ':id']) }}";
    window.locationManagementRoute = "{{ route('admin.location.index') }}";
    window.updateLocationUrl = "{{ route('admin.location.update', ['id' => ':id']) }}";
    window.editLocationUrl = "{{ route('admin.location.edit', ':id') }}";
    window.deleteLocationUrl = "{{ route('admin.location.destroy', ['id' => ':id']) }}";
    window.availableLocationUrl = "{{ route('admin.location.available', ['id' => ':id']) }}";
    window.unavailableLocationUrl = "{{ route('admin.location.unavailable', ['id' => ':id']) }}";

    // 设置可用的 zones 和 racks 数据（从后端传递）
    window.availableZones = @json($zones ?? []);
    window.availableRacks = @json($racks ?? []);
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/location-management.js') }}"></script>
@endsection
