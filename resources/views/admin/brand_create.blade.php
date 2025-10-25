{{-- ==========================================
    品牌创建页面
    功能：创建单个或多个品牌，管理产品品牌
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Brand")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.main-display.dashboard-header.brand-header', ['type' => 'create'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 品牌创建表单 --}}
    @include('components.form-templates.brand-create-form')
</div>

@endsection

@section("scripts")
{{-- 品牌管理路由配置 --}}
<script>
    // 设置品牌管理相关路由
    window.createBrandUrl = "{{ route('admin.brand.store') }}";
    window.brandManagementRoute = "{{ route('admin.brand.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/brand-management.js') }}"></script>
@endsection
