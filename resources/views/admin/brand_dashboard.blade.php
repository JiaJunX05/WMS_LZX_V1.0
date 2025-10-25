{{-- ==========================================
    品牌管理仪表板页面
    功能：品牌列表展示、搜索筛选、分页管理、品牌操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Brand Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.main-display.dashboard-header.brand-header', ['type' => 'dashboard'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 统计卡片区域 --}}
    @include('components.main-display.stats-cards.brand-stats-cards')

    {{-- 搜索筛选区域 --}}
    @include('components.main-display.search-filter.brand-search-filter')

    {{-- 品牌列表表格 --}}
    @include('components.main-display.data-table.brand-table')

    {{-- 分页导航区域 --}}
    @include('components.main-display.pagination-nav.brand-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 品牌管理路由配置 --}}
<script>
    // 设置品牌管理相关URL
    window.brandManagementRoute = "{{ route('admin.brand.index') }}";
    window.editBrandUrl = "{{ route('admin.brand.edit', ['id' => ':id']) }}";
    window.deleteBrandUrl = "{{ route('admin.brand.destroy', ['id' => ':id']) }}";
    window.availableBrandUrl = "{{ route('admin.brand.available', ['id' => ':id']) }}";
    window.unavailableBrandUrl = "{{ route('admin.brand.unavailable', ['id' => ':id']) }}";
    window.brandExportUrl = "{{ route('admin.brand.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/brand-management.js') }}"></script>
@endsection
