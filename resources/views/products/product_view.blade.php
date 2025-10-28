{{-- ==========================================
    产品查看页面 - 显示产品详细信息
    ========================================== --}}
@extends('layouts.app')

@section('title', 'View Product')
@section('content')

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-card.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/product-view.css') }}">

{{-- ==========================================
    主容器
    ========================================== --}}
<div class="container-fluid py-4">
    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.product-dashboard-header', ['type' => 'view'])

    {{-- 警告信息容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 产品详情显示区域 --}}
    @include('components.form-templates.product-view-form')
</div>

{{-- ==========================================
    图片放大模态框
    ========================================== --}}
<div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="imageModalLabel">Product Image</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
                <img id="modalImage" src="" alt="Product Image" class="img-fluid">
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
{{-- 产品管理路由配置 --}}
<script>
    // 设置产品管理相关URL
    window.editProductUrl = '{{ route("product.edit", ":id") }}';
    window.deleteProductUrl = '{{ route("product.destroy", ":id") }}';
    window.availableProductUrl = '{{ route("product.available", ":id") }}';
    window.unavailableProductUrl = '{{ route("product.unavailable", ":id") }}';
    window.productIndexUrl = '{{ route("product.index") }}';
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/product-management.js') }}"></script>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
@endsection
