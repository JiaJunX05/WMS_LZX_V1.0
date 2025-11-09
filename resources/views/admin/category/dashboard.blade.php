{{-- ==========================================
    分类管理仪表板页面
    功能：分类列表展示、搜索筛选、分页管理、分类操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Category Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('admin.category.components.dashboard-header')

    {{-- 统计卡片区域 --}}
    @include('admin.category.components.metric-cards')

    {{-- 搜索筛选区域 --}}
    @include('admin.category.components.search-filters')

    {{-- 分类列表表格 --}}
    @include('admin.category.components.data-table')

    {{-- 分页导航区域 --}}
    @include('admin.category.components.pagination-nav')
</div>

    {{-- Create Category 弹窗模态框 --}}
    @include('admin.category.create-model')

    {{-- Update Category 弹窗模态框 --}}
    @include('admin.category.update-model')

@endsection

@section("scripts")
{{-- 分类管理路由配置 --}}
<script>
    // 设置分类管理相关URL
    window.categoryManagementRoute = "{{ route('admin.category.index') }}";
    window.createCategoryUrl = "{{ route('admin.category.store') }}";
    window.updateCategoryUrl = "{{ route('admin.category.update', ['id' => ':id']) }}";
    window.editCategoryUrl = "{{ route('admin.category.edit', ':id') }}";
    window.deleteCategoryUrl = "{{ route('admin.category.destroy', ['id' => ':id']) }}";
    window.availableCategoryUrl = "{{ route('admin.category.available', ['id' => ':id']) }}";
    window.unavailableCategoryUrl = "{{ route('admin.category.unavailable', ['id' => ':id']) }}";
    window.categoryExportUrl = "{{ route('admin.category.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/category-management.js') }}"></script>
@endsection
