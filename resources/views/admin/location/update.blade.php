{{-- ==========================================
    位置更新页面
    功能：修改位置信息，管理存储位置组合
    ========================================== --}}

@extends("layouts.app")

@section("title", "Update Location")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.location-dashboard-header', ['type' => 'update'])


    {{-- 位置更新表单 --}}
    @include('components.form-templates.location-update-form')
</div>

@endsection

@section("scripts")
{{-- 位置管理路由配置 --}}
<script>
    // 设置位置管理相关路由
    window.updateLocationUrl = "{{ route('admin.location.update', $location->id) }}";
    window.locationManagementRoute = "{{ route('admin.location.index') }}";
    window.availableLocationUrl = "{{ route('admin.location.available', ['id' => ':id']) }}";
    window.unavailableLocationUrl = "{{ route('admin.location.unavailable', ['id' => ':id']) }}";
    window.deleteLocationUrl = "{{ route('admin.location.destroy', ['id' => ':id']) }}";
</script>

{{-- 引入位置管理JavaScript文件 --}}
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/location-management.js') }}"></script>
@endsection
