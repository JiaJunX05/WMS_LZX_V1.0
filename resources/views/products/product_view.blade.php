@extends('layouts.app')

@section('title', 'View Product')

@section('content')
{{-- =============================================================================
     PHP Variables Processing
     ============================================================================= --}}
@php
    $variant = $product->variants->first();
    $attributeVariant = $variant ? $variant->attributeVariant : null;
    $brand = $attributeVariant && $attributeVariant->brand ? $attributeVariant->brand : null;
    $color = $attributeVariant && $attributeVariant->color ? $attributeVariant->color : null;
    $size = $attributeVariant && $attributeVariant->size ? $attributeVariant->size : null;
    $gender = $attributeVariant && $attributeVariant->gender ? $attributeVariant->gender : null;

@endphp

{{-- =============================================================================
     CSS Files
     ============================================================================= --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-card.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/product-view.css') }}">

{{-- =============================================================================
     Main Container
     ============================================================================= --}}
<div class="container-fluid py-4">
    {{-- =============================================================================
         Page Header & Actions
         ============================================================================= --}}
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-eye-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">View Product</h2>
                                <p class="dashboard-subtitle mb-0">View detailed product information in your inventory system</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('product.index') }}" class="btn btn-primary">
                            <i class="bi bi-arrow-left me-2"></i>
                            Back to List
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- =============================================================================
         Alert Container
         ============================================================================= --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- =============================================================================
         Product Details Display Area
         ============================================================================= --}}
    <div class="row g-4">
        {{-- =============================================================================
             Left Image Area
             ============================================================================= --}}
        <div class="col-lg-5">
            <div class="product-image-gallery">
                {{-- Main Image Display Area --}}
                <div class="main-image-container">
                    @if($product->cover_image && file_exists(public_path('assets/images/products/' . $product->cover_image)))
                        <div class="main-image-wrapper">
                            <img src="{{ asset('assets/images/products/' . $product->cover_image) }}"
                                 alt="Product Image" class="main-image" id="mainImage">

                            {{-- Image Control Buttons --}}
                            <div class="image-controls">
                                {{-- Zoom Button --}}
                                <button class="control-btn zoom-btn" onclick="openImageModal(document.getElementById('mainImage').src)" title="Zoom In">
                                    <i class="bi bi-zoom-in"></i>
                                </button>

                                {{-- Fullscreen Button --}}
                                <button class="control-btn fullscreen-btn" onclick="toggleFullscreen()" title="Fullscreen">
                                    <i class="bi bi-arrows-fullscreen"></i>
                                </button>
                            </div>

                            {{-- Navigation Buttons --}}
                            <div class="nav-button nav-button-left" onclick="previousImage()" title="Previous">
                                <i class="bi bi-chevron-left"></i>
                            </div>
                            <div class="nav-button nav-button-right" onclick="nextImage()" title="Next">
                                <i class="bi bi-chevron-right"></i>
                            </div>

                            {{-- Image Counter --}}
                            <div class="image-counter">
                                <span id="currentImageIndex">1</span> / <span id="totalImages">{{ $product->images ? $product->images->count() + 1 : 1 }}</span>
                            </div>
                        </div>
                    @else
                        <div class="no-image-placeholder">
                            <div class="placeholder-content">
                                <i class="bi bi-image"></i>
                                <h6>No Product Images</h6>
                                <p>This product has no images uploaded</p>
                            </div>
                        </div>
                    @endif
                </div>

                {{-- Thumbnail Navigation --}}
                <div class="thumbnail-nav">
                    <div class="thumbnail-header">
                        <h6 class="thumbnail-title">
                            <i class="bi bi-images"></i>
                            Product Images ({{ $product->images ? $product->images->count() + 1 : 1 }})
                        </h6>
                    </div>

                    <div class="thumbnail-scroll">
                        @if($product->cover_image && file_exists(public_path('assets/images/products/' . $product->cover_image)))
                            <div class="thumbnail-item active" onclick="switchMainImage('{{ asset('assets/images/products/' . $product->cover_image) }}', this, 0)">
                                <div class="thumbnail-image">
                                    <img src="{{ asset('assets/images/products/' . $product->cover_image) }}" alt="Cover">
                                </div>
                                <div class="thumbnail-label">Cover</div>
                                <div class="thumbnail-overlay">
                                    <i class="bi bi-eye"></i>
                                </div>
                            </div>
                        @endif

                        @if($product->images && $product->images->count() > 0)
                            @foreach($product->images as $index => $image)
                                <div class="thumbnail-item" onclick="switchMainImage('{{ asset('assets/images/products/' . $image->detail_image) }}', this, {{ $index + 1 }})">
                                    <div class="thumbnail-image">
                                        <img src="{{ asset('assets/images/products/' . $image->detail_image) }}" alt="Detail {{ $index + 1 }}">
                                    </div>
                                    <div class="thumbnail-label">Detail {{ $index + 1 }}</div>
                                    <div class="thumbnail-overlay">
                                        <i class="bi bi-eye"></i>
                                    </div>
                                </div>
                            @endforeach
                        @endif
                    </div>
                </div>

                {{-- Barcode Section --}}
                @if($variant && $variant->barcode_number)
                    <div class="barcode-section p-4 bg-light border-top">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <div class="d-flex align-items-center gap-2 fw-semibold text-dark small">
                                <i class="bi bi-upc-scan text-primary fs-5"></i>
                                <span>Product Barcode</span>
                            </div>
                            <button class="btn btn-outline-primary btn-sm" onclick="copyBarcode('{{ $variant->barcode_number }}')" title="Copy Barcode">
                                <i class="bi bi-copy"></i>
                            </button>
                        </div>
                        <div class="bg-white rounded-3 p-4 text-center shadow-sm border">
                            <div class="mb-3">
                                <canvas id="barcodeCanvas" style="max-width: 100%; height: 60px;"></canvas>
                            </div>
                            <div class="mt-2">
                                <span id="barcode-number" class="font-monospace small text-muted fw-semibold bg-light px-3 py-2 rounded border d-inline-block" style="letter-spacing: 1px; min-width: 120px;">{{ $variant->barcode_number }}</span>
                            </div>
                        </div>
                    </div>
                @endif
            </div>
        </div>

        {{-- =============================================================================
             Right Product Information
             ============================================================================= --}}
        <div class="col-lg-7">
            <div class="card shadow-sm border-0 h-100">
                <div class="card-header bg-white border-0 p-4 pb-0">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="fw-bold text-primary mb-0">
                            <i class="bi bi-info-circle me-2"></i>Product Information
                        </h5>
                        {{-- Action Buttons Area --}}
                        @if(Auth::user()->getAccountRole() === 'SuperAdmin' || Auth::user()->getAccountRole() === 'Admin' || Auth::user()->getAccountRole() === 'Staff')
                        <div class="d-flex justify-content-end gap-1">
                            @if(Auth::user()->getAccountRole() === 'SuperAdmin' || Auth::user()->getAccountRole() === 'Admin')
                            <button class="btn btn-sm btn-outline-primary" title="Edit" onclick="editProduct({{ $product->id }})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            @endif

                            @if(Auth::user()->getAccountRole() === 'SuperAdmin')
                            <div class="dropdown d-inline">
                                <button class="btn btn-sm btn-outline-secondary" title="More" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li>
                                        @if($product->product_status === 'Available')
                                            <a class="dropdown-item" href="javascript:void(0)" onclick="setUnavailable({{ $product->id }})">
                                                <i class="bi bi-slash-circle me-2"></i> Deactivate Product
                                            </a>
                                        @else
                                            <a class="dropdown-item" href="javascript:void(0)" onclick="setAvailable({{ $product->id }})">
                                                <i class="bi bi-check-circle me-2"></i> Activate Product
                                            </a>
                                        @endif
                                    </li>
                                    <li>
                                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="deleteProduct({{ $product->id }})">
                                            <i class="bi bi-trash me-2"></i> Delete Product
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            @elseif(Auth::user()->getAccountRole() === 'Admin')
                                @if($product->product_status === 'Available')
                                    <button class="btn btn-sm btn-outline-warning" title="Deactivate Product" onclick="setUnavailable({{ $product->id }})">
                                        <i class="bi bi-slash-circle"></i>
                                    </button>
                                @else
                                    <button class="btn btn-sm btn-outline-success" title="Activate Product" onclick="setAvailable({{ $product->id }})">
                                        <i class="bi bi-check-circle"></i>
                                    </button>
                                @endif
                            @endif
                        </div>
                        @endif
                    </div>
                </div>
                <div class="card-body p-0">
                    {{-- Product Name Section --}}
                    <div class="p-4 pb-3 border-bottom bg-light">
                        <h4 class="fw-bold fs-3 lh-sm mb-3 text-truncate">{{ $product->name }}</h4>
                        <div class="d-flex align-items-center justify-content-between gap-3 mb-2">
                            <div class="fw-bold fs-4 text-success mb-0">RM {{ number_format($product->price, 2) }}</div>
                            <div>
                                <span class="badge {{ $product->product_status === 'Available' ? 'bg-success' : 'bg-danger' }} px-3 py-2">
                                    <i class="bi {{ $product->product_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle' }} me-1"></i>{{ $product->product_status }}
                                </span>
                            </div>
                        </div>
                    </div>

                    {{-- Product Information Grid --}}
                    <div class="bg-white rounded-bottom-3 overflow-hidden p-4 d-flex gap-4">
                        {{-- Left Information Column --}}
                        <div class="flex-fill d-flex flex-column gap-3">
                            {{-- 产品分类信息 --}}
                            <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                                <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 10px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                                    <i class="bi bi-tags text-white fs-5"></i>
                                </div>
                                <div class="d-flex flex-column gap-1 flex-fill">
                                    <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Category</span>
                                    <span class="fw-semibold lh-sm">{{ $product->category->category_name ?? 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                                <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 10px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                                    <i class="bi bi-tag text-white fs-5"></i>
                                </div>
                                <div class="d-flex flex-column gap-1 flex-fill">
                                    <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Subcategory</span>
                                    <span class="fw-semibold lh-sm">{{ $product->subcategory->subcategory_name ?? 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                                <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 10px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                                    <i class="bi bi-award text-white fs-5"></i>
                                </div>
                                <div class="d-flex flex-column gap-1 flex-fill">
                                    <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Brand</span>
                                    <span class="fw-semibold lh-sm">{{ $brand ? $brand->brand_name : 'N/A' }}</span>
                                </div>
                            </div>

                            {{-- 产品属性信息 --}}
                            <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                                <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 10px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                                    <i class="bi bi-palette text-white fs-5"></i>
                                </div>
                                <div class="d-flex flex-column gap-1 flex-fill">
                                    <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Color</span>
                                    <span class="fw-semibold lh-sm">{{ $color ? $color->color_name : 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                                <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 10px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                                    <i class="bi bi-rulers text-white fs-5"></i>
                                </div>
                                <div class="d-flex flex-column gap-1 flex-fill">
                                    <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Size</span>
                                    <span class="fw-semibold lh-sm">{{ $size ? $size->size_value : 'N/A' }}</span>
                                </div>
                            </div>
                        </div>

                        {{-- Right Information Column --}}
                        <div class="flex-fill d-flex flex-column gap-3">
                            {{-- 库存管理信息 --}}
                            <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                                <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 10px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                                    <i class="bi bi-upc-scan text-white fs-5"></i>
                                </div>
                                <div class="d-flex flex-column gap-1 flex-fill">
                                    <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">SKU Code</span>
                                    <span class="fw-semibold lh-sm">{{ $variant ? $variant->sku_code : 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                                <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 10px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                                    <i class="bi bi-box-seam text-white fs-5"></i>
                                </div>
                                <div class="d-flex flex-column gap-1 flex-fill">
                                    <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Quantity</span>
                                    <span class="fw-semibold lh-sm">{{ $product->quantity }}</span>
                                </div>
                            </div>

                            {{-- 存储位置信息 --}}
                            <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                                <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 10px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                                    <i class="bi bi-geo-alt text-white fs-5"></i>
                                </div>
                                <div class="d-flex flex-column gap-1 flex-fill">
                                    <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Zone</span>
                                    <span class="fw-semibold lh-sm">{{ $product->zone->zone_name ?? 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                                <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 10px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                                    <i class="bi bi-boxes text-white fs-5"></i>
                                </div>
                                <div class="d-flex flex-column gap-1 flex-fill">
                                    <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Rack</span>
                                    <span class="fw-semibold lh-sm">{{ $product->rack->rack_number ?? 'N/A' }}</span>
                                </div>
                            </div>

                            {{-- 目标客户信息 --}}
                            <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                                <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 10px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                                    <i class="bi bi-person text-white fs-5"></i>
                                </div>
                                <div class="d-flex flex-column gap-1 flex-fill">
                                    <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Gender</span>
                                    <span class="fw-semibold lh-sm">{{ $gender ? $gender->gender_name : 'N/A' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Product Description --}}
                    @if($product->description)
                        <div class="p-4 bg-light">
                            <h6 class="fw-semibold mb-2 d-flex align-items-center gap-2 border-start border-primary border-3 ps-3">Description</h6>
                            <p class="text-muted mb-0">{{ $product->description }}</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

{{-- =============================================================================
     Image Zoom Modal
     ============================================================================= --}}
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

{{-- =============================================================================
     JavaScript Files
     ============================================================================= --}}
@section('scripts')
{{-- Barcode Generation Library --}}
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>

{{-- Common JavaScript Files --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/common/status-system.js') }}"></script>

{{-- Data for JavaScript --}}
<script>
    // Pass routes to JavaScript
    window.editProductUrl = '{{ route("product.edit", ":id") }}';
    window.deleteProductUrl = '{{ route("product.destroy", ":id") }}';
    window.availableProductUrl = '{{ route("product.available", ":id") }}';
    window.unavailableProductUrl = '{{ route("product.unavailable", ":id") }}';
    window.productIndexUrl = '{{ route("product.index") }}';
</script>

{{-- 统一产品管理 JavaScript (Unified Product Management JavaScript) --}}
<script src="{{ asset('assets/js/product-management.js') }}"></script>
@endsection
