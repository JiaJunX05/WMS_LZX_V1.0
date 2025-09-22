@extends("layouts.app")

@section("title", "Create Product")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/product/product-create.css') }}">
<div class="container-fluid py-4">
    <!-- 提示信息 -->
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if($errors->any())
        <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            @foreach ($errors->all() as $error)
                <div>{{ $error }}</div>
            @endforeach
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <!-- 页面标题卡片 -->
    <div class="card shadow-sm border-0 mb-4">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                        <i class="bi bi-plus-circle-fill text-primary fs-4"></i>
                    </div>
                    <div>
                        <h4 class="mb-0 fw-bold">Create Product</h4>
                        <p class="text-muted mb-0">Add a new product to your inventory</p>
                    </div>
                </div>
                <a href="{{ route('product.index') }}" class="btn btn-primary">
                    <i class="bi bi-arrow-left me-2"></i>Back to List
                </a>
            </div>
        </div>
    </div>

    <!-- 主要内容卡片 -->
    <div class="card shadow-sm border-0">
        <div class="row g-0">
            <!-- 左侧预览区域 -->
            <div class="col-md-5">
                <div class="preview-section d-flex flex-column h-100 p-4">
                    <!-- 主图预览 -->
                    <div class="main-preview hover-lift" style="min-height: 400px;">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6>
                                <i class="bi bi-image"></i>Cover Image
                            </h6>
                            <span class="badge">800 x 600</span>
                        </div>
                        <div class="preview-container d-flex align-items-center justify-content-center" style="height: 350px;">
                            <i class="bi bi-image" id="preview-icon" style="font-size: 8rem;"></i>
                            <img src="" alt="Preview" id="preview-image" class="img-fluid d-none"
                                style="max-width: 100%; max-height: 100%; object-fit: contain;">
                        </div>
                        <div class="text-center mt-3">
                            <label for="cover_image" class="btn btn-outline-primary btn-sm">
                                <i class="bi bi-upload me-2"></i>Upload Cover Image
                            </label>
                            <input type="file" class="d-none" id="cover_image" name="cover_image" form="product-form">
                        </div>
                    </div>

                    <!-- 缩略图区域 -->
                    <div class="thumbnails-section hover-lift">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="mb-0 fw-bold text-primary">
                                <i class="bi bi-images me-2"></i>Detail Images
                            </h6>
                            <label for="detail_image" class="btn btn-primary btn-sm px-3 py-2">
                                <i class="bi bi-plus-lg me-2"></i>Add Images
                            </label>
                            <input type="file" class="d-none" id="detail_image" name="detail_image[]" multiple accept="image/*" form="product-form">
                        </div>

                        <!-- 新上传图片预览 -->
                        <div id="image-preview-container" class="row g-3" style="display: none;">
                            <div class="col-12">
                                <h6 class="text-muted mb-2 small fw-semibold">
                                    <i class="bi bi-plus-circle me-1"></i>New Images
                                </h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧表单区域 -->
            <div class="col-md-7">
                <div class="card-body p-4">
                    <!-- 表单标题 -->
                    <h2 class="text-primary text-center mb-3">Create Product</h2>
                    <p class="text-muted text-center">Add a new product to the inventory system</p>
                    <hr>

                    <!-- 表单内容 -->
                    <form action="{{ route('product.store') }}" method="post" enctype="multipart/form-data" id="product-form">
                        @csrf

                        <div class="form-section">
                            <label for="name" class="form-label">Product Name</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="bi bi-tag text-primary"></i></span>
                                <input type="text" class="form-control" id="name" name="name" placeholder="Enter product name" required>
                            </div>
                        </div>

                        <div class="form-section">
                            <label for="description" class="form-label">Product Description</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="bi bi-pencil text-primary"></i></span>
                                <textarea class="form-control" id="description" name="description" placeholder="Enter Product Description" rows="3"></textarea>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 form-section">
                                <label for="price" class="form-label">Product Price</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-currency-dollar text-primary"></i></span>
                                    <input type="text" class="form-control" id="price" name="price" placeholder="Enter Product Price" required>
                                </div>
                            </div>

                            <div class="col-md-6 form-section">
                                <label for="quantity" class="form-label">Product Quantity</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-box text-primary"></i></span>
                                    <input type="number" class="form-control" id="quantity" name="quantity" min="1" placeholder="Enter Product Quantity" required>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 form-section">
                                <label for="category_id" class="form-label">Select Category</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-list text-primary"></i></span>
                                    <select class="form-select" id="category_id" name="category_id" required>
                                        <option selected disabled value="">Select a Category</option>
                                        @foreach($categories as $category)
                                            <option value="{{ $category->id }}">{{ strtoupper($category->category_name) }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <div class="col-md-6 form-section">
                                <label for="subcategory_id" class="form-label">Select SubCategory</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-list text-primary"></i></span>
                                    <select class="form-select" id="subcategory_id" name="subcategory_id" required disabled>
                                        <option selected disabled value="">Select a SubCategory</option>
                                        @foreach($subcategories as $subcategory)
                                            <option value="{{ $subcategory->id }}">{{ strtoupper($subcategory->subcategory_name) }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 form-section">
                                <label for="brand_id" class="form-label">Select Brand</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-tag text-primary"></i></span>
                                    <select class="form-select" id="brand_id" name="brand_id" required>
                                        <option selected disabled value="">Select a Brand</option>
                                        @foreach($brands as $brand)
                                            <option value="{{ $brand->id }}">{{ strtoupper($brand->brand_name) }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <div class="col-md-6 form-section">
                                <label for="color_id" class="form-label">Select Color</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-paint-bucket text-primary"></i></span>
                                    <select class="form-select" id="color_id" name="color_id" required>
                                        <option selected disabled value="">Select a Color</option>
                                        @foreach($colors as $color)
                                            <option value="{{ $color->id }}">{{ strtoupper($color->color_name) }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 form-section">
                                <label for="gender_id" class="form-label">Select Gender <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-person text-primary"></i></span>
                                    <select class="form-select" id="gender_id" name="gender_id" required>
                                        <option selected disabled value="">Select a Gender</option>
                                        @foreach($genders as $gender)
                                            <option value="{{ $gender->id }}">{{ strtoupper($gender->gender_name) }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="form-text">
                                    <small class="text-muted">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Select category and gender to see available sizes
                                    </small>
                                </div>
                            </div>

                            <div class="col-md-6 form-section">
                                <label for="size_id" class="form-label">Select Size <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-rulers text-primary"></i></span>
                                    <select class="form-select" id="size_id" name="size_id" required disabled>
                                        <option selected disabled value="">Select Category & Gender First</option>
                                    </select>
                                </div>
                                <div class="form-text">
                                    <small class="text-muted">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Available sizes will appear based on selected category and gender
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 form-section">
                                <label for="zone_id" class="form-label">Select Zone</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-diagram-3 text-primary"></i></span>
                                    <select class="form-select" id="zone_id" name="zone_id" required>
                                        <option selected disabled value="">Select a zone</option>
                                        @foreach($zones as $zone)
                                            <option value="{{ $zone->id }}">{{ strtoupper($zone->zone_name) }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <div class="col-md-6 form-section">
                                <label for="rack_id" class="form-label">Select Rack</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-geo-alt text-primary"></i></span>
                                    <select class="form-select" id="rack_id" name="rack_id" disabled>
                                        <option selected disabled value="">Select a rack</option>
                                        @foreach($racks as $rack)
                                            @php
                                                $capacity = $rackCapacities[$rack->id] ?? ['capacity' => 0, 'used' => 0, 'available' => 0];
                                            @endphp
                                            <option value="{{ $rack->id }}"
                                                    data-capacity="{{ $capacity['capacity'] }}"
                                                    data-used="{{ $capacity['used'] }}"
                                                    data-available="{{ $capacity['available'] }}">
                                                {{ strtoupper($rack->rack_number) }}
                                                ({{ $capacity['available'] }}/{{ $capacity['capacity'] }} product slots available)
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="form-text">
                                    <small class="text-muted">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Rack capacity will be checked when you select a rack
                                    </small>
                                </div>
                            </div>
                        </div>

                        <!-- SKU和Barcode生成区域 -->
                        <div class="form-section">
                            <div class="row">
                                <div class="col-md-6">
                                    <label for="sku_code" class="form-label">Product SKU</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light border-end-0"><i class="bi bi-code-slash text-primary"></i></span>
                                        <input type="text" class="form-control" id="sku_code" name="sku_code"
                                               placeholder="Leave empty for auto-generation"
                                               value="{{ $suggestedSKU }}">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label for="barcode_number" class="form-label">Barcode Number <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light border-end-0"><i class="bi bi-upc-scan text-primary"></i></span>
                                        <input type="text" class="form-control" id="barcode_number" name="barcode_number"
                                               placeholder="Auto-generated if empty"
                                               value="{{ $suggestedBarcode }}" required>
                                    </div>
                                </div>
                            </div>
                            <div class="text-center mt-3">
                                <button type="button" class="btn btn-outline-primary w-100" id="generate-codes-btn">
                                    <i class="bi bi-arrow-clockwise me-2"></i>Generate SKU & Barcode
                                </button>
                            </div>
                            <div class="form-text">
                                <small class="text-muted">
                                    <i class="bi bi-info-circle me-1"></i>
                                    SKU can be auto-generated, but Barcode Number is required. Click Generate for new codes.
                                </small>
                            </div>
                        </div>

                        <!-- Product Status Selection -->
                        <div class="mb-4">
                            <label class="form-label fw-bold">Product Status</label>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="card h-100 border status-card selected" data-status="Available">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="product_status" value="Available" class="form-check-input me-3" checked>
                                            <div>
                                                <h6 class="card-title mb-1">
                                                    <i class="bi bi-check-circle me-2 text-success"></i>Available
                                                </h6>
                                                <p class="card-text text-muted small mb-0">Product is active and can be sold</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="card h-100 border status-card" data-status="Unavailable">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="product_status" value="Unavailable" class="form-check-input me-3">
                                            <div>
                                                <h6 class="card-title mb-1">
                                                    <i class="bi bi-x-circle me-2 text-danger"></i>Unavailable
                                                </h6>
                                                <p class="card-text text-muted small mb-0">Product is inactive and cannot be sold</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 shadow-sm mt-4">
                            <i class="bi bi-check-circle me-2"></i>Create Product
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
    <script>
        // 将 locationsData 定义在全局作用域
        window.locationsData = @json($locations);
        window.mappingsData = @json($mappings);
        window.allSizes = @json($sizes);

        // Category 和 Gender 选择变化时更新 Size 选项
        document.addEventListener('DOMContentLoaded', function() {
            const categorySelect = document.getElementById('category_id');
            const genderSelect = document.getElementById('gender_id');
            const sizeSelect = document.getElementById('size_id');

            // 更新尺寸选项的函数
            function updateSizeOptions() {
                const selectedCategoryId = categorySelect.value;
                const selectedGenderId = genderSelect.value;

                // 清空尺寸选项
                sizeSelect.innerHTML = '<option selected disabled value="">Select a Size</option>';

                if (!selectedCategoryId) {
                    // 如果没有选择分类，禁用尺寸选择
                    sizeSelect.disabled = true;
                    sizeSelect.innerHTML = '<option selected disabled value="">Select Category First</option>';
                    return;
                }

                if (!selectedGenderId) {
                    // 如果没有选择性别，禁用尺寸选择
                    sizeSelect.disabled = true;
                    sizeSelect.innerHTML = '<option selected disabled value="">Select Gender First</option>';
                    return;
                }

                // 启用尺寸选择
                sizeSelect.disabled = false;

                // 根据选择的分类和性别过滤尺寸
                const filteredSizes = window.allSizes.filter(size => {
                    // 检查尺寸是否属于选择的分类
                    const belongsToCategory = size.category && size.category.id == selectedCategoryId;

                    if (!belongsToCategory) {
                        return false;
                    }

                    // 检查是否是衣服尺寸且性别匹配
                    if (size.clothing_size && size.clothing_size.gender_id == selectedGenderId) {
                        return true;
                    }
                    // 检查是否是鞋子尺寸且性别匹配
                    if (size.shoe_size && size.shoe_size.gender_id == selectedGenderId) {
                        return true;
                    }
                    return false;
                });

                // 添加过滤后的尺寸选项
                filteredSizes.forEach(size => {
                    const option = document.createElement('option');
                    option.value = size.id;

                    // 确定尺寸值和类型
                    let sizeValue = '';
                    let sizeType = '';
                    if (size.clothing_size) {
                        sizeValue = size.clothing_size.size_value;
                        sizeType = 'Clothing';
                    } else if (size.shoe_size) {
                        sizeValue = size.shoe_size.size_value;
                        sizeType = 'Shoes';
                    }

                    option.textContent = `${sizeValue.toUpperCase()} (${sizeType})`;
                    option.dataset.sizeType = sizeType;
                    option.dataset.sizeValue = sizeValue;

                    sizeSelect.appendChild(option);
                });

                // 如果没有找到匹配的尺寸，显示提示
                if (filteredSizes.length === 0) {
                    const noSizeOption = document.createElement('option');
                    noSizeOption.disabled = true;
                    noSizeOption.textContent = 'No sizes available for selected category and gender';
                    sizeSelect.appendChild(noSizeOption);
                    sizeSelect.disabled = true;
                }
            }

            // 添加事件监听器
            if (categorySelect) {
                categorySelect.addEventListener('change', updateSizeOptions);
            }

            if (genderSelect) {
                genderSelect.addEventListener('change', updateSizeOptions);
            }
        });
    </script>

    <script src="{{ asset('assets/js/product/product-create.js') }}"></script>
@endsection
