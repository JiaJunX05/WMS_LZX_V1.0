{{-- ==========================================
    性别创建页面
    功能：创建单个或多个性别，管理产品性别分类
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Gender")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.gender-dashboard-header', ['type' => 'create'])


    {{-- 性别创建表单 --}}
    @include('components.form-templates.gender-create-form')
</div>

@endsection

@section("scripts")
{{-- 性别管理路由配置 --}}
<script>
    // 设置性别管理相关路由
    window.createGenderUrl = "{{ route('admin.gender.store') }}";
    window.genderManagementRoute = "{{ route('admin.gender.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/gender-management.js') }}"></script>
@endsection
