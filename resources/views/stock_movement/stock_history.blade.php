{{-- ==========================================
    库存历史页面 - 查看库存变动记录
    ========================================== --}}

@extends("layouts.app")

@section("title", "Stock History")
@section("content")


{{-- CSS 文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 主容器 --}}
<div class="container-fluid py-4">
    {{-- 页面标题区域 --}}
    @include('components.dashboard-header.stock-dashboard-header', ['type' => 'history'])


    {{-- 统计卡片 - 仅对管理员和超级管理员可见 --}}
    @if(in_array(Auth::user()->getAccountRole(), ['Admin', 'SuperAdmin']))
        @include('components.metric-cards.stock-metric-cards')
    @endif

    {{-- 筛选表单 --}}
    @include('components.search-filters.history-search-filters')

    {{-- 库存历史表格 --}}
    @include('components.data-tables.history-data-tables')

    {{-- 空状态显示 --}}
    @include('components.empty-list.history-empty-list')

    {{-- 分页和结果统计 --}}
    @include('components.pagination-nav.stock-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 库存历史相关 URL --}}
<script>
    // 库存历史相关 URL
    window.stockHistoryApiRoute = "{{ route('api.stock_history') }}";
    window.stockManagementRoute = "{{ route('staff.stock_management') }}";
    window.productImagePath = "{{ asset('assets/images') }}";
    window.defaultProductImage = "{{ asset('assets/img/no-image.png') }}";
</script>

{{-- 库存历史 JavaScript 文件 --}}
<script src="{{ asset('assets/js/stock-management.js') }}"></script>
@endsection
