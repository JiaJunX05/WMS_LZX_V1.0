@extends('layouts.app')

@section('title', 'Create Product')

@section('content')
{{-- =============================================================================
     CSS 文件引入 (CSS Files)
     ============================================================================= --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">

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
                                <i class="bi bi-plus-circle-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Product</h2>
                                <p class="dashboard-subtitle mb-0">Add a new product to your inventory system</p>
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
    <form action="{{ route('product.store') }}" method="post" enctype="multipart/form-data" id="product-form">
        @csrf

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
                            <input type="text" class="form-control" name="name" placeholder="Enter product name" required>
                        </div>

                        {{-- 價格和數量 (Price & Quantity) --}}
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Price (RM)</label>
                                <input type="number" class="form-control" name="price" placeholder="0.00" step="0.01" min="0" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Quantity (Unit)</label>
                                <input type="number" class="form-control" name="quantity" placeholder="0" min="1" required>
                            </div>
                        </div>

                        {{-- 產品描述 (Product Description) --}}
                        <div class="mb-3">
                            <label class="form-label">Description (Optional)</label>
                            <textarea class="form-control" name="description" rows="4" placeholder="Enter product description"></textarea>
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
                            <div class="img-upload-area" id="cover-image-area">
                                <div class="upload-placeholder" id="cover-upload-placeholder">
                                    <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                    <h5 class="mt-3">Click to upload image</h5>
                                    <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                </div>
                                <img id="cover-preview" class="img-preview d-none"
                                    style="height: auto; max-height: 200px; object-fit: contain;" alt="Cover Preview">
                                <button type="button" class="img-remove-btn d-none" id="remove-cover-image">
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
                                    {{-- 動態添加的圖片將在這裡顯示 --}}
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
                                    <input type="text" class="form-control" name="sku_code" id="sku_code" placeholder="SKU">
                                    <button type="button" class="btn btn-outline-secondary" id="regenerate-sku">
                                        <i class="bi bi-arrow-clockwise"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Barcode</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" name="barcode_number" id="barcode_number" placeholder="Barcode">
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
                                    <option value="{{ $zone->id }}">{{ $zone->zone_name }}</option>
                                @endforeach
                            </select>
                        </div>

                        {{-- 貨架選擇 (Rack Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Rack</label>
                            <select class="form-select" name="rack_id" required disabled>
                                <option value="">Select Rack</option>
                            </select>
                            {{-- 货架容量错误提示 --}}
                            <div id="rack-capacity-error" class="invalid-feedback" style="display: none;">
                                <i class="bi bi-exclamation-triangle-fill me-1"></i>
                                <span id="rack-capacity-error-text"></span>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- 庫存位置卡片 (Category Mapping Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Category Mapping</h5>
                    </div>
                    <div class="card-body">
                        {{-- 分類選擇 (Category Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Select Category</label>
                            <select class="form-select" name="category_id" required>
                                <option value="">Select Category</option>
                                @foreach($categories as $category)
                                    <option value="{{ $category->id }}">{{ $category->category_name }}</option>
                                @endforeach
                            </select>
                        </div>

                        {{-- 子分類選擇 (Subcategory Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Subcategory</label>
                            <select class="form-select" name="subcategory_id" required disabled>
                                <option value="">Select Subcategory</option>
                            </select>
                        </div>
                    </div>
                </div>

                {{-- 產品屬性卡片 (Product Attributes Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Product Attributes</h5>
                    </div>
                    <div class="card-body">
                        {{-- 品牌選擇 (Brand Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Brand</label>
                            <select class="form-select" name="brand_id" required>
                                <option value="">Select Brand</option>
                                @foreach($brands as $brand)
                                    <option value="{{ $brand->id }}">{{ $brand->brand_name }}</option>
                                @endforeach
                            </select>
                        </div>

                        {{-- 顏色選擇 (Color Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Color</label>
                            <select class="form-select" name="color_id" required>
                                <option value="">Select Color</option>
                                @foreach($colors as $color)
                                    <option value="{{ $color->id }}">{{ $color->color_name }}</option>
                                @endforeach
                            </select>
                        </div>

                        {{-- 性別選擇 (Gender Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Gender</label>
                            <select class="form-select" name="gender_id" required>
                                <option value="">Select Gender</option>
                                @foreach($genders as $gender)
                                    <option value="{{ $gender->id }}">{{ $gender->gender_name }}</option>
                                @endforeach
                            </select>
                        </div>

                        {{-- 尺寸選擇 (Size Selection) --}}
                        <div class="mb-3">
                            <label class="form-label">Size</label>
                            <select class="form-select" name="size_id" required>
                                <option value="">Select Size</option>
                                @foreach($sizes as $size)
                                    <option value="{{ $size->id }}">{{ $size->size_name }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                </div>

                {{-- 產品提交卡片 (Product Submit Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Submit Product</h5>
                    </div>
                    <div class="card-body">
                        {{-- 提交按鈕 (Submit Button) --}}
                        <div class="text-center">
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="bi bi-check-circle me-2"></i>Create Product
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
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/common/status-system.js') }}"></script>

{{-- 數據傳遞給 JavaScript (Data for JavaScript) --}}
<script>
    // 傳遞關聯數據給 JavaScript
    window.mappingsData = @json($mappings);
    window.locationsData = @json($locations);
    window.sizesData = @json($sizes);
    window.rackCapacitiesData = @json($rackCapacities);
</script>

{{-- 统一产品管理 JavaScript (Unified Product Management JavaScript) --}}
<script src="{{ asset('assets/js/product-management.js') }}"></script>
@endsection
