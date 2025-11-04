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

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.subcategory-dashboard-header', ['type' => 'dashboard'])


    {{-- 统计卡片区域 --}}
    @include('components.metric-cards.subcategory-metric-cards')

    {{-- 搜索筛选区域 --}}
    @include('components.search-filters.subcategory-search-filters')

    {{-- 子分类列表表格 --}}
    @include('components.data-tables.subcategory-data-tables')

    {{-- 空状态显示 --}}
    @include('components.empty-list.subcategory-empty-list')

    {{-- 分页导航区域 --}}
    @include('components.pagination-nav.subcategory-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 子分类管理路由配置 --}}
<script>
    // 设置子分类管理相关URL
    window.subcategoryManagementRoute = "{{ route('admin.subcategory.index') }}";
    window.editSubcategoryUrl = "{{ route('admin.subcategory.edit', ['id' => ':id']) }}";
    window.deleteSubcategoryUrl = "{{ route('admin.subcategory.destroy', ['id' => ':id']) }}";
    window.availableSubcategoryUrl = "{{ route('admin.subcategory.available', ['id' => ':id']) }}";
    window.unavailableSubcategoryUrl = "{{ route('admin.subcategory.unavailable', ['id' => ':id']) }}";
    window.subcategoryExportUrl = "{{ route('admin.subcategory.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/subcategory-management.js') }}"></script>
@endsection
