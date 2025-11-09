{{-- ==========================================
    产品查看组件
    功能：显示产品详细信息（可在页面或 modal 中使用）
    ========================================== --}}

{{-- 产品详情显示区域 --}}
@php
    $variant = $product->variants->first();
    $attributeVariant = $variant ? $variant->attributeVariant : null;
    $brand = $attributeVariant && $attributeVariant->brand ? $attributeVariant->brand : null;
    $color = $attributeVariant && $attributeVariant->color ? $attributeVariant->color : null;
    $size = $attributeVariant && $attributeVariant->size ? $attributeVariant->size : null;
    $gender = $attributeVariant && $attributeVariant->gender ? $attributeVariant->gender : null;
@endphp

{{-- 产品详情显示区域 --}}
<div class="row g-4">
    {{-- ==========================================
        左侧图片区域
        ========================================== --}}
    <div class="col-lg-5">
        <div class="product-image-gallery">
            {{-- ==========================================
                主图片显示区域
                ========================================== --}}
            <div class="main-image-container">
                @if($product->cover_image && file_exists(public_path('assets/images/' . $product->cover_image)))
                    <div class="main-image-wrapper">
                        <img src="{{ asset('assets/images/' . $product->cover_image) }}"
                             alt="Product Image" class="main-image" id="mainImage">

                        {{-- ==========================================
                            导航按钮
                            ========================================== --}}
                        <div class="nav-button nav-button-left" onclick="previousImage()" title="Previous">
                            <i class="bi bi-chevron-left"></i>
                        </div>
                        <div class="nav-button nav-button-right" onclick="nextImage()" title="Next">
                            <i class="bi bi-chevron-right"></i>
                        </div>

                        {{-- ==========================================
                            图片计数器
                            ========================================== --}}
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

            {{-- ==========================================
                缩略图导航
                ========================================== --}}
            <div class="thumbnail-nav">
                <div class="thumbnail-header">
                    <h6 class="thumbnail-title">
                        <i class="bi bi-images"></i>
                        Product Images ({{ $product->images ? $product->images->count() + 1 : 1 }})
                    </h6>
                </div>

                <div class="thumbnail-scroll">
                    @if($product->cover_image && file_exists(public_path('assets/images/' . $product->cover_image)))
                        <div class="thumbnail-item active" onclick="switchMainImage('{{ asset('assets/images/' . $product->cover_image) }}', this, 0)">
                            <div class="thumbnail-image">
                                <img src="{{ asset('assets/images/' . $product->cover_image) }}" alt="Cover">
                            </div>
                            <div class="thumbnail-label">Cover</div>
                            <div class="thumbnail-overlay">
                                <i class="bi bi-eye"></i>
                            </div>
                        </div>
                    @endif

                    @if($product->images && $product->images->count() > 0)
                        @foreach($product->images as $index => $image)
                            <div class="thumbnail-item" onclick="switchMainImage('{{ asset('assets/images/' . $image->detail_image) }}', this, {{ $index + 1 }})">
                                <div class="thumbnail-image">
                                    <img src="{{ asset('assets/images/' . $image->detail_image) }}" alt="Detail {{ $index + 1 }}">
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

            {{-- ==========================================
                条形码区域
                ========================================== --}}
            @if($variant && $variant->barcode_number)
                <div class="barcode-section p-4 bg-light border-top">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <div class="d-flex align-items-center gap-2 fw-semibold text-dark small">
                            <i class="bi bi-upc-scan text-primary fs-5"></i>
                            <span>Product Barcode</span>
                        </div>
                        <button class="btn btn-outline-primary btn-sm" onclick="copyBarcode('{{ $variant->barcode_number }}', event)" title="Copy Barcode">
                            <i class="bi bi-copy"></i>
                        </button>
                    </div>
                    <div class="bg-white rounded-3 p-4 text-center shadow-sm border">
                        <div class="mb-3">
                            <canvas id="barcodeCanvas" style="max-width: 100%; height: 60px;"></canvas>
                        </div>
                        <div class="mt-2">
                            <span id="barcode-number" class="font-monospace small text-muted fw-semibold bg-light px-3 py-2 rounded border d-inline-block"
                                style="letter-spacing: 1px; min-width: 120px;">{{ $variant->barcode_number }}</span>
                        </div>
                    </div>
                </div>
            @endif
        </div>
    </div>

    {{-- ==========================================
        右侧产品信息
        ========================================== --}}
    <div class="col-lg-7">
        <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white border-0 p-4 pb-0">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="fw-bold text-primary mb-0">
                        <i class="bi bi-info-circle me-2"></i>Product Information
                    </h5>
                    {{-- ==========================================
                        操作按钮区域
                        ========================================== --}}
                    @if(Auth::user()->getAccountRole() === 'SuperAdmin' || Auth::user()->getAccountRole() === 'Admin' || Auth::user()->getAccountRole() === 'Staff')
                    <div class="d-flex justify-content-end gap-1">
                        @if(Auth::user()->getAccountRole() === 'SuperAdmin' || Auth::user()->getAccountRole() === 'Admin')
                        <button class="btn btn-sm btn-outline-primary" title="Edit" onclick="openUpdateProductModal({{ $product->id }})">
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
                {{-- ==========================================
                    产品名称区域
                    ========================================== --}}
                <div class="p-4 pb-3 border-bottom bg-light">
                    <h4 class="fw-bold fs-3 lh-sm mb-3" style="word-wrap: break-word; overflow-wrap: break-word;">{{ $product->name }}</h4>
                    <div class="d-flex align-items-center justify-content-between gap-3 mb-2">
                        <div class="fw-bold fs-4 text-success mb-0">RM {{ number_format($product->price, 2) }}</div>
                        <div>
                            <span class="badge {{ $product->product_status === 'Available' ? 'bg-success' : 'bg-danger' }} px-3 py-2">
                                <i class="bi {{ $product->product_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle' }} me-1"></i>{{ $product->product_status }}
                            </span>
                        </div>
                    </div>
                </div>

                {{-- ==========================================
                    产品信息网格
                    ========================================== --}}
                <div class="bg-white rounded-bottom-3 overflow-hidden p-4 d-flex gap-4">
                    {{-- ==========================================
                        左侧信息列
                        ========================================== --}}
                    <div class="flex-fill d-flex flex-column gap-3">
                        {{-- ==========================================
                            产品分类信息
                            ========================================== --}}
                        <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                            <div class="info-icon-container">
                                <i class="bi bi-tags"></i>
                            </div>
                            <div class="d-flex flex-column gap-1 flex-fill">
                                <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Category</span>
                                <span class="fw-semibold lh-sm">{{ $product->category->category_name ?? 'N/A' }}</span>
                            </div>
                        </div>

                        <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                            <div class="info-icon-container">
                                <i class="bi bi-tag"></i>
                            </div>
                            <div class="d-flex flex-column gap-1 flex-fill">
                                <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Subcategory</span>
                                <span class="fw-semibold lh-sm">{{ $product->subcategory->subcategory_name ?? 'N/A' }}</span>
                            </div>
                        </div>

                        <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                            <div class="info-icon-container">
                                <i class="bi bi-award"></i>
                            </div>
                            <div class="d-flex flex-column gap-1 flex-fill">
                                <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Brand</span>
                                <span class="fw-semibold lh-sm">{{ $brand ? $brand->brand_name : 'N/A' }}</span>
                            </div>
                        </div>

                        {{-- ==========================================
                            产品属性信息
                            ========================================== --}}
                        <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                            <div class="info-icon-container">
                                <i class="bi bi-palette"></i>
                            </div>
                            <div class="d-flex flex-column gap-1 flex-fill">
                                <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Color</span>
                                <span class="fw-semibold lh-sm">{{ $color ? $color->color_name : 'N/A' }}</span>
                            </div>
                        </div>

                        <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                            <div class="info-icon-container">
                                <i class="bi bi-rulers"></i>
                            </div>
                            <div class="d-flex flex-column gap-1 flex-fill">
                                <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Size</span>
                                <span class="fw-semibold lh-sm">{{ $size ? $size->size_value : 'N/A' }}</span>
                            </div>
                        </div>
                    </div>

                    {{-- ==========================================
                        右侧信息列
                        ========================================== --}}
                    <div class="flex-fill d-flex flex-column gap-3">
                        {{-- ==========================================
                            库存管理信息
                            ========================================== --}}
                        <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                            <div class="info-icon-container">
                                <i class="bi bi-upc-scan"></i>
                            </div>
                            <div class="d-flex flex-column gap-1 flex-fill">
                                <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">SKU Code</span>
                                <span class="fw-semibold lh-sm">{{ $variant ? $variant->sku_code : 'N/A' }}</span>
                            </div>
                        </div>

                        <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                            <div class="info-icon-container">
                                <i class="bi bi-box-seam"></i>
                            </div>
                            <div class="d-flex flex-column gap-1 flex-fill">
                                <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Quantity</span>
                                <span class="fw-semibold lh-sm">{{ $product->quantity }}</span>
                            </div>
                        </div>

                        {{-- ==========================================
                            存储位置信息
                            ========================================== --}}
                        <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                            <div class="info-icon-container">
                                <i class="bi bi-geo-alt"></i>
                            </div>
                            <div class="d-flex flex-column gap-1 flex-fill">
                                <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Zone</span>
                                <span class="fw-semibold lh-sm">{{ $product->zone->zone_name ?? 'N/A' }}</span>
                            </div>
                        </div>

                        <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                            <div class="info-icon-container">
                                <i class="bi bi-boxes"></i>
                            </div>
                            <div class="d-flex flex-column gap-1 flex-fill">
                                <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Rack</span>
                                <span class="fw-semibold lh-sm">{{ $product->rack->rack_number ?? 'N/A' }}</span>
                            </div>
                        </div>

                        {{-- ==========================================
                            目标客户信息
                            ========================================== --}}
                        <div class="d-flex align-items-center gap-3 p-3 border-bottom">
                            <div class="info-icon-container">
                                <i class="bi bi-person"></i>
                            </div>
                            <div class="d-flex flex-column gap-1 flex-fill">
                                <span class="small text-muted fw-medium text-uppercase" style="letter-spacing: 0.5px;">Gender</span>
                                <span class="fw-semibold lh-sm">{{ $gender ? $gender : 'N/A' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- ==========================================
                    产品描述
                    ========================================== --}}
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
