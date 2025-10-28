{{-- ==========================================
    分类映射创建页面
    功能：创建分类和子分类的映射关系
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Category Mapping")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.mapping-dashboard-header', ['type' => 'create'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 分类映射创建表单 --}}
    @include('components.form-templates.mapping-create-form')
</div>

@endsection

@section("scripts")
{{-- 分类映射管理路由配置 --}}
<script>
    // 设置分类映射管理相关路由
    window.createMappingUrl = "{{ route('admin.mapping.store') }}";
    window.mappingManagementRoute = "{{ route('admin.mapping.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/mapping-management.js') }}"></script>
@endsection
