{{-- ==========================================
    库存详情页面 - 显示产品库存信息和变动历史
    ========================================== --}}

@extends("layouts.app")

@section("title", "Stock Detail")
@section("content")

{{-- CSS 文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 主容器 --}}
<div class="container-fluid py-4">
    {{-- 页面标题区域 --}}
    @include('components.dashboard-header.stock-dashboard-header', ['type' => 'detail'])


    {{-- 产品基本信息卡片 --}}
    @include('components.information-section.stock-infomation-card')

    {{-- 库存历史表格 --}}
    @include('components.data-tables.detail-data-tables')

    {{-- 空状态显示 --}}
    @include('components.empty-list.detail-empty-list')

    {{-- 分页和结果统计 --}}
    @include('components.pagination-nav.stock-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 库存详情相关 URL --}}
<script>
    // 库存详情相关 URL
    window.stockHistoryApiRoute = "{{ route('api.stock_history') }}";
    window.stockManagementRoute = "{{ route('staff.stock_management') }}";
    window.productImagePath = "{{ asset('assets/images') }}";
    window.defaultProductImage = "{{ asset('assets/img/no-image.png') }}";

    // 当前产品 ID 和数据
    window.currentProductId = {{ $product->id ?? 'null' }};
    @if(isset($product))
    window.currentProductData = {
        id: {{ $product->id }},
        name: "{{ addslashes($product->name) }}",
        quantity: {{ $product->quantity ?? 0 }},
        product_status: "{{ $product->product_status }}",
        cover_image: "{{ $product->cover_image }}",
        description: "{{ addslashes($product->description) }}"
    };
    @else
        window.currentProductData = null;
    @endif
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/stock-management.js') }}"></script>
@endsection
