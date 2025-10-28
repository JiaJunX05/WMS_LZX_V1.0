{{-- ==========================================
    颜色创建页面
    功能：创建单个或多个颜色，管理产品颜色
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Color")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.color-dashboard-header', ['type' => 'create'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 颜色创建表单 --}}
    @include('components.form-templates.color-create-form')
</div>

@endsection

@section("scripts")
{{-- 颜色管理路由配置 --}}
<script>
    // 设置颜色管理相关路由
    window.createColorUrl = "{{ route('admin.color.store') }}";
    window.colorManagementRoute = "{{ route('admin.color.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('node_modules/colorjs.io/dist/color.js') }}"></script>
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/color-management.js') }}"></script>
@endsection
