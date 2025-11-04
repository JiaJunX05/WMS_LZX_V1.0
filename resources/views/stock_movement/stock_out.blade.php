{{-- ==========================================
    库存出库页面 - 扫描产品并从库存中移除
    ========================================== --}}

@extends("layouts.app")

@section("title", "Stock Out")
@section("content")

{{-- CSS 文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 主容器 --}}
<div class="container-fluid py-4">
    {{-- 页面标题区域 --}}
    @include('components.dashboard-header.stock-dashboard-header', ['type' => 'stock_out'])


    {{-- 扫描器区域 --}}
    @include('components.information-section.stock-scanner-header', ['type' => 'stock_out'])

    {{-- 已扫描产品区域（使用组件） --}}
    <x-form-templates.templates.stock-scanner-form type="stock_out" />
</div>

@endsection
@section("scripts")
{{-- 库存出库相关 URL --}}
<script>
    // 库存出库相关 URL
    window.stockOutRoute = "{{ route('staff.stock_out') }}";
    window.stockManagementRoute = "{{ route('staff.stock_management') }}";
    window.productImagePath = "{{ asset('assets/images') }}";
    window.defaultProductImage = "{{ asset('assets/img/no-image.png') }}";
</script>

{{-- 库存管理 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/stock-management.js') }}"></script>
@endsection

