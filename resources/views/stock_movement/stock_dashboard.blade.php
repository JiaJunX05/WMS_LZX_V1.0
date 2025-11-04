{{-- ==========================================
    库存管理仪表板 - 管理产品库存变动
    ========================================== --}}
@extends("layouts.app")

@section("title", "Stock Management")
@section("content")

{{-- CSS 文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 主容器 --}}
<div class="container-fluid py-4">
    {{-- 页面标题和操作按钮区域 --}}
    @include('components.dashboard-header.stock-dashboard-header', ['type' => 'dashboard'])


    {{-- 产品搜索和筛选区域 --}}
    @include('components.search-filters.stock-search-filters')

    {{-- 产品列表表格 --}}
    @include('components.data-tables.stock-data-tables')

    {{-- 空状态显示 --}}
    @include('components.empty-list.stock-empty-list')

    {{-- 分页和结果统计 --}}
    @include('components.pagination-nav.stock-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 库存管理相关 URL --}}
<script>
    // 库存管理相关 URL
    window.stockManagementRoute = "{{ route('staff.stock_management') }}";
    window.stockInPageRoute = "{{ route('staff.stock_in_page') }}";
    window.stockOutPageRoute = "{{ route('staff.stock_out_page') }}";
    window.stockHistoryRoute = "{{ route('staff.staff.stock_history', ['id' => ':id']) }}";
    window.stockExportUrl = "{{ route('staff.stock_management.export') }}";
    window.productImagePath = "{{ asset('assets/images') }}";
    window.defaultProductImage = "{{ asset('assets/img/no-image.png') }}";
    window.currentUserRole = "{{ Auth::user()->getAccountRole() }}";
</script>

{{-- 库存管理 JavaScript --}}
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/stock-management.js') }}"></script>
@endsection
