{{-- ==========================================
    子分类创建页面
    功能：创建单个或多个子分类，管理产品子分类
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Subcategory")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.main-display.dashboard-header.subcategory-header', ['type' => 'create'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 子分类创建表单 --}}
    @include('components.form-templates.subcategory-create-form')
</div>

@endsection

@section("scripts")
{{-- 子分类管理路由配置 --}}
<script>
    // 设置子分类管理相关路由
    window.createSubcategoryUrl = "{{ route('admin.subcategory.store') }}";
    window.subcategoryManagementRoute = "{{ route('admin.subcategory.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/subcategory-management.js') }}"></script>
@endsection
