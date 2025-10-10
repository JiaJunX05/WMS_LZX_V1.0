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
<link rel="stylesheet" href="{{ asset('assets/css/product/product-view.css') }}">

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
                    <div class="barcode-section">
                        <div class="barcode-header">
                            <div class="barcode-title">
                                <i class="bi bi-upc-scan"></i>
                                <span>Product Barcode</span>
                            </div>
                            <button class="barcode-copy-btn" onclick="copyBarcode('{{ $variant->barcode_number }}')" title="Copy Barcode">
                                <i class="bi bi-copy"></i>
                            </button>
                        </div>
                        <div class="barcode-content">
                            <div class="barcode-image-container">
                                <canvas id="barcodeCanvas" style="max-width: 100%; height: 60px;"></canvas>
                            </div>
                            <div class="barcode-number-container">
                                <span class="barcode-number">{{ $variant->barcode_number }}</span>
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
                        <div class="action-buttons">
                            @if(Auth::user()->getAccountRole() === 'SuperAdmin' || Auth::user()->getAccountRole() === 'Admin')
                            <button class="btn-action" title="Edit" onclick="editProduct({{ $product->id }})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            @endif

                            @if(Auth::user()->getAccountRole() === 'SuperAdmin')
                            <div class="btn-group dropstart d-inline">
                                <button class="btn-action dropdown-toggle" title="More" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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
                                    <button class="btn-action unavailable" title="Deactivate Product" onclick="setUnavailable({{ $product->id }})">
                                        <i class="bi bi-slash-circle"></i>
                                    </button>
                                @else
                                    <button class="btn-action available" title="Activate Product" onclick="setAvailable({{ $product->id }})">
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
                    <div class="product-name-section">
                        <h4 class="product-name">{{ $product->name }}</h4>
                        <div class="price-status-container">
                            <div class="product-price">RM {{ number_format($product->price, 2) }}</div>
                            <div class="product-status">
                                <span class="status-badge {{ $product->product_status === 'Available' ? 'available' : 'unavailable' }}">
                                    {{ $product->product_status }}
                                </span>
                            </div>
                        </div>
                    </div>

                    {{-- Product Information Grid --}}
                    <div class="product-info-grid">
                        {{-- Left Information Column --}}
                        <div class="info-column">
                            <div class="info-item">
                                <div class="info-icon">
                                    <i class="bi bi-tags"></i>
                                </div>
                                <div class="info-content">
                                    <span class="info-label">Category</span>
                                    <span class="info-value">{{ $product->category->category_name ?? 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="info-item">
                                <div class="info-icon">
                                    <i class="bi bi-award"></i>
                                </div>
                                <div class="info-content">
                                    <span class="info-label">Brand</span>
                                    <span class="info-value">{{ $brand ? $brand->brand_name : 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="info-item">
                                <div class="info-icon">
                                    <i class="bi bi-tag"></i>
                                </div>
                                <div class="info-content">
                                    <span class="info-label">Subcategory</span>
                                    <span class="info-value">{{ $product->subcategory->subcategory_name ?? 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="info-item">
                                <div class="info-icon">
                                    <i class="bi bi-palette"></i>
                                </div>
                                <div class="info-content">
                                    <span class="info-label">Color</span>
                                    <span class="info-value">{{ $color ? $color->color_name : 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="info-item">
                                <div class="info-icon">
                                    <i class="bi bi-rulers"></i>
                                </div>
                                <div class="info-content">
                                    <span class="info-label">Size</span>
                                    <span class="info-value">{{ $size ? $size->size_value : 'N/A' }}</span>
                                </div>
                            </div>
                        </div>

                        {{-- Right Information Column --}}
                        <div class="info-column">
                            <div class="info-item">
                                <div class="info-icon">
                                    <i class="bi bi-upc-scan"></i>
                                </div>
                                <div class="info-content">
                                    <span class="info-label">SKU Code</span>
                                    <span class="info-value">{{ $variant ? $variant->sku_code : 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="info-item">
                                <div class="info-icon">
                                    <i class="bi bi-box-seam"></i>
                                </div>
                                <div class="info-content">
                                    <span class="info-label">Quantity</span>
                                    <span class="info-value">{{ $product->quantity }}</span>
                                </div>
                            </div>

                            <div class="info-item">
                                <div class="info-icon">
                                    <i class="bi bi-geo-alt"></i>
                                </div>
                                <div class="info-content">
                                    <span class="info-label">Zone</span>
                                    <span class="info-value">{{ $product->zone->zone_name ?? 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="info-item">
                                <div class="info-icon">
                                    <i class="bi bi-boxes"></i>
                                </div>
                                <div class="info-content">
                                    <span class="info-label">Rack</span>
                                    <span class="info-value">{{ $product->rack->rack_number ?? 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="info-item">
                                <div class="info-icon">
                                    <i class="bi bi-person"></i>
                                </div>
                                <div class="info-content">
                                    <span class="info-label">Gender</span>
                                    <span class="info-value">{{ $gender ? $gender->gender_name : 'N/A' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Product Description --}}
                    @if($product->description)
                        <div class="product-description">
                            <h6 class="description-title">Description</h6>
                            <p class="description-text">{{ $product->description }}</p>
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
