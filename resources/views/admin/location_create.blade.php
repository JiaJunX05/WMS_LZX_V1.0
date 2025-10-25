{{-- ==========================================
    位置创建页面
    功能：创建单个或多个位置组合，连接区域与货架
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Location")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.main-display.dashboard-header.location-header', ['type' => 'create'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 位置创建表单 --}}
    @include('components.form-templates.location-create-form')
</div>

@endsection

@section("scripts")
{{-- 位置管理路由配置 --}}
<script>
    // 设置位置管理相关路由
    window.createLocationUrl = "{{ route('admin.location.store') }}";
    window.locationManagementRoute = "{{ route('admin.location.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/location-management.js') }}"></script>
@endsection
