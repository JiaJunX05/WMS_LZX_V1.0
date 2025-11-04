{{-- ==========================================
    分类映射查看页面
    功能：查看分类和子分类的映射关系详情
    ========================================== --}}

@extends("layouts.app")

@section("title", "View Category Mapping")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.mapping-dashboard-header', ['type' => 'view'])


    @include('components.form-templates.mapping-view-form')
</div>

@endsection

@section("scripts")
{{-- 分类映射管理路由配置 --}}
<script>
    // 设置分类映射管理相关路由
    window.viewMappingUrl = "{{ route('admin.mapping.view', ['id' => ':id']) }}";
    window.mappingManagementRoute = "{{ route('admin.mapping.index') }}";
    window.availableMappingUrl = "{{ route('admin.mapping.available', ['id' => ':id']) }}";
    window.unavailableMappingUrl = "{{ route('admin.mapping.unavailable', ['id' => ':id']) }}";
    window.deleteMappingUrl = "{{ route('admin.mapping.destroy', ['id' => ':id']) }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/mapping-management.js') }}"></script>
@endsection
