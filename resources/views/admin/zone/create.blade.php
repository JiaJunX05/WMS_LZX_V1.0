{{-- ==========================================
    区域创建页面
    功能：创建单个或多个区域，管理仓库区域
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Zone")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.zone-dashboard-header', ['type' => 'create'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 区域创建表单 --}}
    @include('components.form-templates.zone-create-form')
</div>

@endsection

@section("scripts")
{{-- 区域管理路由配置 --}}
<script>
    // 设置区域管理相关路由
    window.createZoneUrl = "{{ route('admin.zone.store') }}";
    window.zoneManagementRoute = "{{ route('admin.zone.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/zone-management.js') }}"></script>
@endsection
