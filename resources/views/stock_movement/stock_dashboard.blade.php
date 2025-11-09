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
    @include('stock_movement.components.dashboard-header')


    @include('stock_movement.components.search-filter')

    {{-- 产品列表表格 --}}
    @include('stock_movement.components.data-table')

    @include('stock_movement.components.pagination-nav')
</div>

    {{-- 库存详情模态框 --}}
    @include('stock_movement.detail-model')

    {{-- 库存操作模态框 --}}
    @include('stock_movement.stock-in-model')
    @include('stock_movement.stock-out-model')
    @include('stock_movement.stock-return-model')

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
