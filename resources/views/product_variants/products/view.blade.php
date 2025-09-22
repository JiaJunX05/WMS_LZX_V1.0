@extends("layouts.app")

@section("title", "View Product")
@section("content")

@php
    $variant = $product->variants->first();
    $attributeVariant = $variant ? $variant->attributeVariant : null;
    $brand = $attributeVariant && $attributeVariant->brand ? $attributeVariant->brand : null;
    $color = $attributeVariant && $attributeVariant->color ? $attributeVariant->color : null;
    $size = $attributeVariant && $attributeVariant->size ? $attributeVariant->size : null;
    $gender = null;
    if ($size) {
        if ($size->clothingSize && $size->clothingSize->gender) {
            $gender = $size->clothingSize->gender;
        } elseif ($size->shoeSize && $size->shoeSize->gender) {
            $gender = $size->shoeSize->gender;
        }
    }
@endphp

<link rel="stylesheet" href="{{ asset('assets/css/product/product-view.css') }}">
<div class="container-fluid py-4">
    <!-- 提示信息 -->
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if(session('error') || $errors->any())
        <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ session('error') ?? $errors->first() }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <!-- 页面标题卡片 -->
    <div class="card shadow-sm border-0 mb-4">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                        <i class="bi bi-eye-fill text-primary fs-4"></i>
                    </div>
                    <div>
                        <h4 class="mb-0 fw-bold">Product Details</h4>
                        <p class="text-muted mb-0">View detailed product information</p>
                    </div>
                </div>
                <div class="d-flex gap-2">
                    <a href="{{ route('product.index') }}" class="btn btn-primary">
                        <i class="bi bi-arrow-left me-2"></i>Back to List
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- 产品详情卡片 -->
    <div class="row g-4">
        <!-- 左侧图片区域 -->
        <div class="col-lg-5">
            <div class="product-image-gallery">
                <!-- 主图片展示区 -->
                <div class="main-image-container">
                    @if($product->cover_image && file_exists(public_path('assets/images/products/' . $product->cover_image)))
                        <div class="main-image-wrapper">
                            <img src="{{ asset('assets/images/products/' . $product->cover_image) }}"
                                 alt="Product Image" class="main-image" id="mainImage">

                            <!-- 图片操作按钮组 -->
                            <div class="image-controls">
                                <!-- 放大查看按钮 -->
                                <button class="control-btn zoom-btn" onclick="openImageModal(document.getElementById('mainImage').src)" title="放大查看">
                                    <i class="bi bi-zoom-in"></i>
                                </button>

                                <!-- 全屏查看按钮 -->
                                <button class="control-btn fullscreen-btn" onclick="toggleFullscreen()" title="全屏查看">
                                    <i class="bi bi-arrows-fullscreen"></i>
                                </button>
                            </div>

                            <!-- 导航按钮 -->
                            <div class="nav-button nav-button-left" onclick="previousImage()" title="上一张">
                                <i class="bi bi-chevron-left"></i>
                            </div>
                            <div class="nav-button nav-button-right" onclick="nextImage()" title="下一张">
                                <i class="bi bi-chevron-right"></i>
                            </div>

                            <!-- 图片计数器 -->
                            <div class="image-counter">
                                <span id="currentImageIndex">1</span> / <span id="totalImages">{{ $product->images ? $product->images->count() + 1 : 1 }}</span>
                            </div>
                        </div>
                    @else
                        <div class="no-image-placeholder">
                            <div class="placeholder-content">
                                <i class="bi bi-image"></i>
                                <h6>暂无产品图片</h6>
                                <p>该产品尚未上传图片</p>
                            </div>
                        </div>
                    @endif
                </div>

                <!-- 缩略图导航 -->
                <div class="thumbnail-nav">
                    <div class="thumbnail-header">
                        <h6 class="thumbnail-title">
                            <i class="bi bi-images"></i>
                            产品图片 ({{ $product->images ? $product->images->count() + 1 : 1 }})
                        </h6>
                    </div>

                    <div class="thumbnail-scroll">
                        @if($product->cover_image && file_exists(public_path('assets/images/products/' . $product->cover_image)))
                            <div class="thumbnail-item active" onclick="switchMainImage('{{ asset('assets/images/products/' . $product->cover_image) }}', this, 0)">
                                <div class="thumbnail-image">
                                    <img src="{{ asset('assets/images/products/' . $product->cover_image) }}" alt="Cover">
                                </div>
                                <div class="thumbnail-label">封面</div>
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
                                    <div class="thumbnail-label">详情 {{ $index + 1 }}</div>
                                    <div class="thumbnail-overlay">
                                        <i class="bi bi-eye"></i>
                                    </div>
                                </div>
                            @endforeach
                        @endif
                    </div>
                </div>

                <!-- 条形码区域 -->
                @if($variant && $variant->barcode_number)
                    <div class="barcode-section">
                        <div class="barcode-header">
                            <div class="barcode-title">
                                <i class="bi bi-upc-scan"></i>
                                <span>产品条码</span>
                            </div>
                            <button class="barcode-copy-btn" onclick="copyBarcode('{{ $variant->barcode_number }}')" title="复制条码">
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

        <!-- 右侧产品信息 -->
        <div class="col-lg-7">
            <div class="card shadow-sm border-0 h-100">
                <div class="card-header bg-white border-0 p-4 pb-0">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="fw-bold text-primary mb-0">
                            <i class="bi bi-info-circle me-2"></i>Product Information
                        </h5>
                            <!-- 操作按钮区域 -->
                            @if(Auth::user()->getAccountRole() === 'SuperAdmin' || Auth::user()->getAccountRole() === 'Admin' || Auth::user()->getAccountRole() === 'Staff')
                            <div class="action-buttons">
                                @if(Auth::user()->getAccountRole() === 'SuperAdmin' || Auth::user()->getAccountRole() === 'Admin')
                                <button class="btn-action" title="Edit" onclick="if(typeof productView !== 'undefined' && productView.editProduct) { productView.editProduct({{ $product->id }}); } else { editProduct({{ $product->id }}); }">
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
                                                <a class="dropdown-item" href="javascript:void(0)" onclick="if(typeof productView !== 'undefined' && productView.setUnavailable) { productView.setUnavailable({{ $product->id }}); } else { deactivateProduct({{ $product->id }}); }">
                                                    <i class="bi bi-slash-circle me-2"></i> Deactivate Product
                                                </a>
                                            @else
                                                <a class="dropdown-item" href="javascript:void(0)" onclick="if(typeof productView !== 'undefined' && productView.setAvailable) { productView.setAvailable({{ $product->id }}); } else { activateProduct({{ $product->id }}); }">
                                                    <i class="bi bi-check-circle me-2"></i> Activate Product
                                                </a>
                                            @endif
                                        </li>
                                        <li>
                                            <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="if(typeof productView !== 'undefined' && productView.deleteProduct) { productView.deleteProduct({{ $product->id }}); } else { deleteProduct({{ $product->id }}); }">
                                                <i class="bi bi-trash me-2"></i> Delete Product
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                @elseif(Auth::user()->getAccountRole() === 'Admin')
                                    @if($product->product_status === 'Available')
                                        <button class="btn-action unavailable" title="Deactivate Product" onclick="if(typeof productView !== 'undefined' && productView.setUnavailable) { productView.setUnavailable({{ $product->id }}); } else { deactivateProduct({{ $product->id }}); }">
                                            <i class="bi bi-slash-circle"></i>
                                        </button>
                                    @else
                                        <button class="btn-action available" title="Activate Product" onclick="if(typeof productView !== 'undefined' && productView.setAvailable) { productView.setAvailable({{ $product->id }}); } else { activateProduct({{ $product->id }}); }">
                                            <i class="bi bi-check-circle"></i>
                                        </button>
                                    @endif
                                @endif
                            </div>
                        @endif
                    </div>
                </div>
                <div class="card-body p-0">
                    <!-- 产品名称区域 -->
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

                    <!-- 产品信息网格 -->
                    <div class="product-info-grid">
                        <!-- 左侧信息列 -->
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

                        <!-- 右侧信息列 -->
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

                    <!-- 产品描述 -->
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

<!-- 图片放大模态框 -->
<div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="imageModalLabel">产品图片</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
                <img id="modalImage" src="" alt="Product Image" class="img-fluid">
            </div>
        </div>
    </div>
</div>
@endsection

@section("scripts")
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
<script>
    // 传递路由到 JavaScript
    window.editProductUrl = '{{ route("product.edit", ":id") }}';
    window.deleteProductUrl = '{{ route("product.destroy", ":id") }}';
    window.availableProductUrl = '{{ route("product.available", ":id") }}';
    window.unavailableProductUrl = '{{ route("product.unavailable", ":id") }}';

    // 生成条形码
    document.addEventListener('DOMContentLoaded', function() {
        @if($variant && $variant->barcode_number)
            const barcodeCanvas = document.getElementById('barcodeCanvas');
            if (barcodeCanvas) {
                JsBarcode(barcodeCanvas, "{{ $variant->barcode_number }}", {
                    format: "CODE128",
                    width: 2,
                    height: 60,
                    displayValue: false,
                    background: "#ffffff",
                    lineColor: "#000000",
                });
            }
        @endif
    });

    // 复制条形码功能
    function copyBarcode(barcodeNumber) {
        navigator.clipboard.writeText(barcodeNumber).then(function() {
            // 显示成功提示
            const btn = event.target.closest('.barcode-copy-btn');
            const originalIcon = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check"></i>';
            btn.classList.add('copied');

            setTimeout(() => {
                btn.innerHTML = originalIcon;
                btn.classList.remove('copied');
            }, 2000);
        }).catch(function(err) {
            console.error('复制失败: ', err);
        });
    }
</script>
<script src="{{ asset('assets/js/product/product-view.js') }}"></script>
@endsection
