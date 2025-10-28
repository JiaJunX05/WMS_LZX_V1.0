{{-- ==========================================
    货架创建页面
    功能：创建单个或多个货架，管理存储位置
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Rack")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.rack-dashboard-header', ['type' => 'create'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 货架创建表单 --}}
    @include('components.form-templates.rack-create-form')
</div>

@endsection

@section("scripts")
{{-- 货架管理路由配置 --}}
<script>
    // 设置货架管理相关路由
    window.createRackUrl = "{{ route('admin.rack.store') }}";
    window.rackManagementRoute = "{{ route('admin.rack.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/rack-management.js') }}"></script>
@endsection
