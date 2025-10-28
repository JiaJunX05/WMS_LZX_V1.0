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

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.category-dashboard-header', ['type' => 'dashboard'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 统计卡片区域 --}}
    @include('components.metric-cards.category-metric-cards')

    {{-- 搜索筛选区域 --}}
    @include('components.search-filters.category-search-filters')

    {{-- 分类列表表格 --}}
    @include('components.data-tables.category-data-tables')

    {{-- 空状态显示 --}}
    @include('components.empty-list.category-empty-list')

    {{-- 分页导航区域 --}}
    @include('components.pagination-nav.category-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 分类管理路由配置 --}}
<script>
    // 设置分类管理相关URL
    window.categoryManagementRoute = "{{ route('admin.category.index') }}";
    window.editCategoryUrl = "{{ route('admin.category.edit', ['id' => ':id']) }}";
    window.deleteCategoryUrl = "{{ route('admin.category.destroy', ['id' => ':id']) }}";
    window.availableCategoryUrl = "{{ route('admin.category.available', ['id' => ':id']) }}";
    window.unavailableCategoryUrl = "{{ route('admin.category.unavailable', ['id' => ':id']) }}";
    window.categoryExportUrl = "{{ route('admin.category.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/category-management.js') }}"></script>
@endsection
