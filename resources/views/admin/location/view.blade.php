{{-- ==========================================
    位置查看页面
    功能：查看存储位置详情，支持单个位置或区域位置列表查看
    ========================================== --}}

@extends("layouts.app")

@section("title", "View Storage Location")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.location-dashboard-header', ['type' => 'view'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    @include('components.form-templates.location-view-form')
</div>

@endsection

@section("scripts")
{{-- 位置管理路由配置 --}}
<script>
    window.viewLocationUrl = "{{ route('admin.location.view', ['id' => ':id']) }}";
    window.locationManagementRoute = "{{ route('admin.location.index') }}";
    window.availableLocationUrl = "{{ route('admin.location.available', ['id' => ':id']) }}";
    window.unavailableLocationUrl = "{{ route('admin.location.unavailable', ['id' => ':id']) }}";
    window.deleteLocationUrl = "{{ route('admin.location.destroy', ['id' => ':id']) }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/location-management.js') }}"></script>
@endsection
