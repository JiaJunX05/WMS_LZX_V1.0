{{-- ==========================================
    分类映射管理仪表板
    功能：管理分类和子分类的映射关系，查看统计信息
    ========================================== --}}

@extends("layouts.app")

@section("title", "Category Mapping Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('admin.mapping.components.dashboard-header')

    {{-- 统计卡片区域 --}}
    @include('admin.mapping.components.metric-cards')

    {{-- 主要内容区域 --}}
    @include('admin.mapping.components.data-cards')

    {{-- 分页导航区域 --}}
    @include('admin.mapping.components.pagination-nav')

    {{-- Mapping Create Modal --}}
    @include('admin.mapping.create-model')
</div>

@endsection

@section("scripts")
{{-- 分类映射管理路由配置 --}}
<script>
    // 设置分类映射管理相关路由
    window.categoryMappingManagementRoute = "{{ route('admin.mapping.index') }}";
    window.createMappingUrl = "{{ route('admin.mapping.store') }}";
    window.viewCategoryMappingUrl = "{{ route('admin.mapping.view', ['id' => ':id']) }}";
    window.deleteMappingUrl = "{{ route('admin.mapping.destroy', ['id' => ':id']) }}";
    window.availableMappingUrl = "{{ route('admin.mapping.available', ['id' => ':id']) }}";
    window.unavailableMappingUrl = "{{ route('admin.mapping.unavailable', ['id' => ':id']) }}";

    // 设置可用的 subcategories 数据（从后端传递）
    window.availableSubcategories = @json($subcategories);
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/mapping-management.js') }}"></script>
@endsection
