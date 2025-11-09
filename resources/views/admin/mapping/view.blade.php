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
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('admin.mapping.components.view-header')

    {{-- 主要内容卡片 --}}
    @include('admin.mapping.view-model')

    {{-- Mapping Update Modal --}}
    @include('admin.mapping.update-model')
</div>

@endsection

@section("scripts")
{{-- 分类映射管理路由配置 --}}
<script>
    // 设置分类映射管理相关路由
    window.viewMappingUrl = "{{ route('admin.mapping.view', ['id' => ':id']) }}";
    window.mappingManagementRoute = "{{ route('admin.mapping.index') }}";
    window.updateMappingUrl = "{{ route('admin.mapping.update', ['id' => ':id']) }}";
    window.editMappingUrl = "{{ route('admin.mapping.edit', ':id') }}";
    window.deleteMappingUrl = "{{ route('admin.mapping.destroy', ['id' => ':id']) }}";
    window.availableMappingUrl = "{{ route('admin.mapping.available', ['id' => ':id']) }}";
    window.unavailableMappingUrl = "{{ route('admin.mapping.unavailable', ['id' => ':id']) }}";

    // 设置可用的 categories 和 subcategories 数据（从后端传递）
    window.availableCategories = @json($categories ?? []);
    window.availableSubcategories = @json($subcategories ?? []);
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/mapping-management.js') }}"></script>
@endsection
