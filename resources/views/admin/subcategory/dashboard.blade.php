{{-- ==========================================
    子分类管理仪表板页面
    功能：子分类列表展示、搜索筛选、分页管理、子分类操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Subcategory Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('admin.subcategory.components.dashboard-header')

    {{-- 统计卡片区域 --}}
    @include('admin.subcategory.components.metric-cards')

    {{-- 搜索筛选区域 --}}
    @include('admin.subcategory.components.search-filters')

    {{-- 子分类列表表格 --}}
    @include('admin.subcategory.components.data-table')

    {{-- 分页导航区域 --}}
    @include('admin.subcategory.components.pagination-nav')
</div>

    {{-- Create Subcategory 弹窗模态框 --}}
    @include('admin.subcategory.create-model')

    {{-- Update Subcategory 弹窗模态框 --}}
    @include('admin.subcategory.update-model')

@endsection

@section("scripts")
{{-- 子分类管理路由配置 --}}
<script>
    // 设置子分类管理相关URL
    window.subcategoryManagementRoute = "{{ route('admin.subcategory.index') }}";
    window.createSubcategoryUrl = "{{ route('admin.subcategory.store') }}";
    window.updateSubcategoryUrl = "{{ route('admin.subcategory.update', ['id' => ':id']) }}";
    window.editSubcategoryUrl = "{{ route('admin.subcategory.edit', ':id') }}";
    window.deleteSubcategoryUrl = "{{ route('admin.subcategory.destroy', ['id' => ':id']) }}";
    window.availableSubcategoryUrl = "{{ route('admin.subcategory.available', ['id' => ':id']) }}";
    window.unavailableSubcategoryUrl = "{{ route('admin.subcategory.unavailable', ['id' => ':id']) }}";
    window.subcategoryExportUrl = "{{ route('admin.subcategory.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/subcategory-management.js') }}"></script>
@endsection
