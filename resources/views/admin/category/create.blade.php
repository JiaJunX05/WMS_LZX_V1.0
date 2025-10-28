{{-- ==========================================
    分类创建页面
    功能：创建单个或多个分类，管理产品分类
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Category")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.category-dashboard-header', ['type' => 'create'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 分类创建表单 --}}
    @include('components.form-templates.category-create-form')
</div>

@endsection

@section("scripts")
{{-- 分类管理路由配置 --}}
<script>
    window.createCategoryUrl = "{{ route('admin.category.store') }}";
    window.categoryManagementRoute = "{{ route('admin.category.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/category-management.js') }}"></script>
@endsection
