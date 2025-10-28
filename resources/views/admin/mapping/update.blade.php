{{-- ==========================================
    分类映射更新页面
    功能：修改分类和子分类的映射关系
    ========================================== --}}

@extends("layouts.app")

@section("title", "Update Category Mapping")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.mapping-dashboard-header', ['type' => 'update'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 分类映射更新表单 --}}
    @include('components.form-templates.mapping-update-form')
</div>

@endsection

@section("scripts")
{{-- 分类映射管理路由配置 --}}
<script>
    // 设置分类映射管理相关路由
    window.updateMappingUrl = "{{ route('admin.mapping.update', $mapping->id) }}";
    window.mappingManagementRoute = "{{ route('admin.mapping.index') }}";
    window.availableMappingUrl = "{{ route('admin.mapping.available', ['id' => ':id']) }}";
    window.unavailableMappingUrl = "{{ route('admin.mapping.unavailable', ['id' => ':id']) }}";
    window.deleteMappingUrl = "{{ route('admin.mapping.destroy', ['id' => ':id']) }}";
</script>

{{-- 引入分类映射管理JavaScript文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/mapping-management.js') }}"></script>
@endsection
