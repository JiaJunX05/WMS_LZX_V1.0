@extends('layouts.app')

@section('title', 'Update Product')

@section('content')
{{-- =============================================================================
     PHP 變量處理 (PHP Variables Processing)
     ============================================================================= --}}
@php
    $variant = $product->variants->first();
    $attributeVariant = $variant ? $variant->attributeVariant : null;
    $brand = $attributeVariant && $attributeVariant->brand ? $attributeVariant->brand : null;
    $color = $attributeVariant && $attributeVariant->color ? $attributeVariant->color : null;
    $size = $attributeVariant && $attributeVariant->size ? $attributeVariant->size : null;
@endphp

{{-- =============================================================================
     CSS 文件引入 (CSS Files)
     ============================================================================= --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-product.css') }}">

{{-- =============================================================================
     主要容器 (Main Container)
     ============================================================================= --}}
<div class="container-fluid py-4">
    {{-- =============================================================================
         頁面標題和操作區域 (Page Header & Actions)
         ============================================================================= --}}
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-pencil-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Update Product</h2>
                                <p class="dashboard-subtitle mb-0">Modify existing product information in your inventory system</p>
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
         提示信息容器 (Alert Container)
         ============================================================================= --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- =============================================================================
         主要表單 (Main Form)
         ============================================================================= --}}
    <form action="{{ route('product.update', $product->id) }}" method="post" enctype="multipart/form-data" id="product-form">
        @csrf
        @method('PUT')

        <div class="row">
            {{-- =============================================================================
                 左側主要內容區域 (Left Content Area)
                 ============================================================================= --}}
            <div class="col-lg-6">
                {{-- 產品基本信息卡片 (Product Basic Information Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Product Information</h5>
                    </div>
                    <div class="card-body">
                        {{-- 產品名稱 (Product Name) --}}
                        <div class="mb-3">
                            <label class="form-label">Product Name</label>
                            <input type="text" class="form-control" name="name" value="{{ $product->name }}" placeholder="Enter product name" required>
                        </div>

                        {{-- 價格和數量 (Price & Quantity) --}}
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Price (RM)</label>
                                <input type="number" class="form-control" name="price" value="{{ $product->price }}" placeholder="0.00" step="0.01" min="0" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Quantity (Unit)</label>
                                <input type="number" class="form-control" name="quantity" value="{{ $product->quantity }}" placeholder="0" min="1" required>
                            </div>
                        </div>

                        {{-- 產品描述 (Product Description) --}}
                        <div class="mb-3">
                            <label class="form-label">Description (Optional)</label>
                            <textarea class="form-control" name="description" rows="4" placeholder="Enter product description">{{ $product->description }}</textarea>
                        </div>
                    </div>
                </div>

                {{-- 產品圖片卡片 (Product Images Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Product Images</h5>
                    </div>
                    <div class="card-body">
                        {{-- 封面圖片 (Cover Image) --}}
                        <div class="mb-4">
                            <label class="form-label">Cover Image</label>
                            <div class="image-upload-area" id="cover-image-area">
                                <div class="upload-placeholder {{ $product->cover_image ? 'd-none' : '' }}" id="cover-upload-placeholder">
                                    <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                    <h5 class="mt-3">Click to upload image</h5>
                                    <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                </div>
                                @if($product->cover_image && file_exists(public_path('assets/images/products/' . $product->cover_image)))
                                    <img id="cover-preview" class="preview-image" src="{{ asset('assets/images/products/' . $product->cover_image) }}" alt="Cover Preview">
                                @else
                                    <img id="cover-preview" class="preview-image d-none" alt="Cover Preview">
                                @endif
                                <button type="button" class="remove-image-btn {{ $product->cover_image ? '' : 'd-none' }}" id="remove-cover-image">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                            <input type="file" class="d-none" id="cover_image" name="cover_image">
                        </div>

                        {{-- 詳細圖片 (Detail Images) --}}
                        <div>
                            <label class="form-label">Detail Images</label>
                            <div class="detail-images-container">
                                <div class="detail-images-grid" id="detail-images-grid">
                                    {{-- 現有圖片顯示 (Existing Images Display) --}}
                                    @if($product->images->isNotEmpty())
                                        @foreach($product->images as $image)
                                            <div class="detail-image-item">
                                                <img src="{{ asset('assets/images/products/' . $image->detail_image) }}" alt="Detail Image">
                                                <button type="button" class="remove-btn" onclick="toggleImageRemoval(this, {{ $image->id }})">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                                <input type="checkbox" name="remove_image[]" value="{{ $image->id }}" id="remove_image_{{ $image->id }}" class="d-none">
                                            </div>
                                        @endforeach
                                    @endif
                                </div>
                                <div class="add-detail-image-btn" id="add-detail-image">
                                    <i class="bi bi-cloud-upload"></i>
                                    <span>Add Detail Image</span>
                                </div>
                            </div>
                            <input type="file" class="d-none" id="detail_images" name="detail_image[]" multiple accept="image/*">
                        </div>
                    </div>
                </div>

                {{-- 產品代碼生成卡片 (Product Codes Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Product Codes</h5>
                    </div>
                    <div class="card-body">
                        {{-- SKU 和 Barcode 輸入框 (SKU & Barcode Inputs) --}}
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">SKU Code</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" name="sku_code" id="sku_code" value="{{ $variant ? $variant->sku_code : '' }}" placeholder="SKU">
                                    <button type="button" class="btn btn-outline-secondary" id="regenerate-sku">
                                        <i class="bi bi-arrow-clockwise"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Barcode</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" name="barcode_number" id="barcode_number" value="{{ $variant ? $variant->barcode_number : '' }}" placeholder="Barcode">
                                    <button type="button" class="btn btn-outline-secondary" id="regenerate-barcode">
                                        <i class="bi bi-arrow-clockwise"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {{-- 生成按鈕 (Generate Button) --}}
                        <div class="text-center">
                            <button type="button" class="btn btn-primary w-100" id="generate-codes-btn">
                                <i class="bi bi-magic me-2"></i>Generate Both Codes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {{-- =============================================================================
                 右側操作面板 (Right Sidebar)
                 ============================================================================= --}}
            <div class="col-lg-6">
                {{-- 產品屬性卡片 (Product Attributes Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Product Attributes</h5>
                    </div>
                    <div class="card-body">
                        {{-- 分類選擇 (Category Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Select Category</label>
                            <select class="form-select" name="category_id" required>
                                <option value="">Select Category</option>
                                @foreach($categories as $category)
                                    <option value="{{ $category->id }}" {{ $product->category_id == $category->id ? 'selected' : '' }}>{{ $category->category_name }}</option>
                                @endforeach
                            </select>
                        </div>

                        {{-- 子分類選擇 (Subcategory Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Subcategory</label>
                            <select class="form-select" name="subcategory_id" required disabled>
                                <option value="">Select Subcategory</option>
                                @foreach($subcategories as $subcategory)
                                    <option value="{{ $subcategory->id }}" {{ $product->subcategory_id == $subcategory->id ? 'selected' : '' }}>{{ $subcategory->subcategory_name }}</option>
                                @endforeach
                            </select>
                        </div>

                        {{-- 品牌選擇 (Brand Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Brand</label>
                            <select class="form-select" name="brand_id" required>
                                <option value="">Select Brand</option>
                                @foreach($brands as $brand)
                                    <option value="{{ $brand->id }}" {{ $attributeVariant && $attributeVariant->brand_id == $brand->id ? 'selected' : '' }}>{{ $brand->brand_name }}</option>
                                @endforeach
                            </select>
                        </div>

                        {{-- 顏色選擇 (Color Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Color</label>
                            <select class="form-select" name="color_id" required>
                                <option value="">Select Color</option>
                                @foreach($colors as $color)
                                    <option value="{{ $color->id }}" {{ $attributeVariant && $attributeVariant->color_id == $color->id ? 'selected' : '' }}>{{ $color->color_name }}</option>
                                @endforeach
                            </select>
                        </div>

                        {{-- 尺寸選擇 (Size Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Size</label>
                            <select class="form-select" name="size_id" required disabled>
                                <option value="">Select Size</option>
                                @php
                                    $sizesByCategory = $sizes->groupBy('category.category_name');
                                @endphp
                                @foreach($sizesByCategory as $categoryName => $categorySizes)
                                    <optgroup label="{{ $categoryName ?? 'Other' }}">
                                        @foreach($categorySizes as $sizeOption)
                                            <option value="{{ $sizeOption->id }}"
                                                    {{ $attributeVariant && $attributeVariant->size_id == $sizeOption->id ? 'selected' : '' }}
                                                    data-category="{{ $sizeOption->category ? $sizeOption->category->id : '' }}">
                                                {{ $sizeOption->size_value }}
                                            </option>
                                        @endforeach
                                    </optgroup>
                                @endforeach
                            </select>
                        </div>
                    </div>
                </div>

                {{-- 庫存位置卡片 (Storage Location Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Storage Location</h5>
                    </div>
                    <div class="card-body">
                        {{-- 區域選擇 (Zone Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Zone</label>
                            <select class="form-select" name="zone_id" required>
                                <option value="">Select Zone</option>
                                @foreach($zones as $zone)
                                    <option value="{{ $zone->id }}" {{ $product->zone_id == $zone->id ? 'selected' : '' }}>{{ $zone->zone_name }}</option>
                                @endforeach
                            </select>
                        </div>

                        {{-- 貨架選擇 (Rack Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Rack</label>
                            <select class="form-select" name="rack_id" required disabled>
                                <option value="">Select Rack</option>
                                @foreach($racks as $rack)
                                    @php
                                        $capacity = $rackCapacities[$rack->id] ?? ['capacity' => 0, 'used' => 0, 'available' => 0];
                                    @endphp
                                    <option value="{{ $rack->id }}"
                                            {{ $product->rack_id == $rack->id ? 'selected' : '' }}
                                            data-capacity="{{ $capacity['capacity'] }}"
                                            data-used="{{ $capacity['used'] }}"
                                            data-available="{{ $capacity['available'] }}">
                                        {{ $rack->rack_number }} ({{ $capacity['available'] }}/{{ $capacity['capacity'] }})
                                    </option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                </div>

                {{-- 產品狀態和提交卡片 (Product Status & Submit Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Product Status & Submit</h5>
                    </div>
                    <div class="card-body">
                        {{-- 產品狀態選擇 (Product Status Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Product Status</label>
                            <div class="row g-2">
                                {{-- 可用狀態 (Available Status) --}}
                                <div class="col-6">
                                    <div class="card h-100 status-card {{ $product->product_status === 'Available' ? 'selected' : '' }}" data-status="Available">
                                        <label class="card-body d-flex align-items-center">
                                            <input type="radio" name="product_status" value="Available" class="form-check-input me-3" {{ $product->product_status === 'Available' ? 'checked' : '' }}>
                                            <div>
                                                <div class="fw-semibold text-success">
                                                    <i class="bi bi-check-circle-fill me-2"></i>Available
                                                </div>
                                                <small class="text-muted">Product is active and can be sold</small>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {{-- 不可用狀態 (Unavailable Status) --}}
                                <div class="col-6">
                                    <div class="card h-100 status-card {{ $product->product_status === 'Unavailable' ? 'selected' : '' }}" data-status="Unavailable">
                                        <label class="card-body d-flex align-items-center">
                                            <input type="radio" name="product_status" value="Unavailable" class="form-check-input me-3" {{ $product->product_status === 'Unavailable' ? 'checked' : '' }}>
                                            <div>
                                                <div class="fw-semibold text-danger">
                                                    <i class="bi bi-slash-circle-fill me-2"></i>Unavailable
                                                </div>
                                                <small class="text-muted">Product is inactive and cannot be sold</small>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {{-- 提交按鈕 (Submit Button) --}}
                        <div class="text-center mt-4">
                            <button type="submit" class="btn btn-primary btn-lg px-5 w-100">
                                <i class="bi bi-check-circle me-2"></i>Update Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection

{{-- =============================================================================
     JavaScript 文件引入 (JavaScript Files)
     ============================================================================= --}}
@section('scripts')
{{-- 通用 JavaScript 文件 (Common JavaScript Files) --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-handler.js') }}"></script>

{{-- 數據傳遞給 JavaScript (Data for JavaScript) --}}
<script>
    // 傳遞關聯數據給 JavaScript
    window.locationsData = @json($locations);
    window.mappingsData = @json($mappings);
    window.sizesData = @json($sizes);
    window.currentSizeId = '{{ $attributeVariant ? $attributeVariant->size_id : "" }}';
</script>

{{-- 產品更新頁面專用 JavaScript (Product Update Page JavaScript) --}}
<script src="{{ asset('assets/js/product/product-update.js') }}"></script>
@endsection
