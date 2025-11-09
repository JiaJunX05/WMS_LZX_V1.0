{{-- ==========================================
    品牌管理仪表板页面
    功能：品牌列表展示、搜索筛选、分页管理、品牌操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Brand Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('admin.brand.components.dashboard-header')

    {{-- 统计卡片区域 --}}
    @include('admin.brand.components.metric-cards')

    {{-- 搜索筛选区域 --}}
    @include('admin.brand.components.search-filters')

    {{-- 品牌列表表格 --}}
    @include('admin.brand.components.data-table')

    {{-- 分页导航区域 --}}
    @include('admin.brand.components.pagination-nav')
</div>

    {{-- Create Brand 弹窗模态框 --}}
    @include('admin.brand.create-model')

    {{-- Update Brand 弹窗模态框 --}}
    @include('admin.brand.update-model')

@endsection

@section("scripts")
{{-- 品牌管理路由配置 --}}
<script>
    // 设置品牌管理相关URL
    window.brandManagementRoute = "{{ route('admin.brand.index') }}";
    window.createBrandUrl = "{{ route('admin.brand.store') }}";
    window.updateBrandUrl = "{{ route('admin.brand.update', ['id' => ':id']) }}";
    window.editBrandUrl = "{{ route('admin.brand.edit', ':id') }}";
    window.deleteBrandUrl = "{{ route('admin.brand.destroy', ['id' => ':id']) }}";
    window.availableBrandUrl = "{{ route('admin.brand.available', ['id' => ':id']) }}";
    window.unavailableBrandUrl = "{{ route('admin.brand.unavailable', ['id' => ':id']) }}";
    window.brandExportUrl = "{{ route('admin.brand.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/brand-management.js') }}"></script>
@endsection
