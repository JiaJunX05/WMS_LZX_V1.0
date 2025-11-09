{{-- ==========================================
    产品查看页面 - 显示产品详细信息
    ========================================== --}}
@extends('layouts.app')

@section('title', 'View Product')
@section('content')

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/product-view.css') }}">

{{-- ==========================================
    主容器
    ========================================== --}}
<div class="container-fluid py-4">
    {{-- 页面头部导航 --}}
    @include('products.components.view-header')

    {{-- 产品详情显示区域 --}}
    @include('products.view-model')
</div>

{{-- Product Update Modal --}}
@include('products.update-model')

@endsection

@section('scripts')
{{-- 产品管理路由配置 --}}
<script>
    // 设置产品管理相关URL
    window.editProductUrl = '{{ route("product.edit", ":id") }}';
    window.updateProductUrl = '{{ route("product.update", ":id") }}';
    window.deleteProductUrl = '{{ route("product.destroy", ":id") }}';
    window.availableProductUrl = '{{ route("product.available", ":id") }}';
    window.unavailableProductUrl = '{{ route("product.unavailable", ":id") }}';
    window.productIndexUrl = '{{ route("product.index") }}';

    // 预加载 Update Modal 所需的数据（用于级联选择）
    window.productModalData = {
        categories: @json($categories),
        zones: @json($zones),
        brands: @json($brands),
        colors: @json($colors),
        sizes: @json($sizes),
        locations: @json($locations),
        mappings: @json($mappings),
        rackCapacities: @json($rackCapacities)
    };
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/product-management.js') }}"></script>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
@endsection
