{{-- ==========================================
    产品更新表单模板
    功能：更新现有产品的表单模板
    ========================================== --}}

<form action="{{ $formAction }}" method="post" enctype="multipart/form-data" id="{{ $formId }}">
    @csrf
    @method('PUT')

    <div class="card shadow-sm border-0">
        <div class="row g-0">

            {{-- ==========================================
                左侧配置面板
                ========================================== --}}
            <div class="col-md-5">
                <div class="config-section d-flex flex-column h-100 bg-light p-4">

                    {{-- 配置区域标题 --}}
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-gear-fill me-2"></i>Configuration
                        </h6>
                        <span class="badge bg-white text-dark border px-3 py-2">Update</span>
                    </div>

                    {{-- 产品图片上传区域 --}}
                    <div class="mb-4">
                        <label class="form-label fw-bold">Product Images</label>

                        {{-- 封面图片 --}}
                        <div class="mb-3">
                            <label class="form-label">Cover Image</label>
                            <div class="img-upload-area" id="cover-image-area">
                                <div class="upload-placeholder {{ $product->cover_image ? 'd-none' : '' }}" id="cover-upload-placeholder">
                                    <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                    <h5 class="mt-3">Click to upload image</h5>
                                    <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                </div>
                                @if($product->cover_image && file_exists(public_path('assets/images/' . $product->cover_image)))
                                    <img id="cover-preview" class="img-preview" style="height: auto; max-height: 150px; object-fit: contain;" src="{{ asset('assets/images/' . $product->cover_image) }}" alt="Cover Preview">
                                @else
                                    <img id="cover-preview" class="img-preview d-none" style="height: auto; max-height: 150px; object-fit: contain;" alt="Cover Preview">
                                @endif
                                <button type="button" class="img-remove-btn {{ $product->cover_image ? '' : 'd-none' }}" id="remove-cover-image">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                            <input type="file" class="d-none" id="cover_image" name="cover_image">
                        </div>

                        {{-- 详细图片 --}}
                        <div>
                            <label class="form-label">Detail Images</label>
                            <div class="detail-images-container">
                                <div class="detail-images-grid" id="detail-images-grid">
                                    {{-- 现有图片显示 --}}
                                    @if($product->images->isNotEmpty())
                                        @foreach($product->images as $image)
                                            <div class="detail-image-item">
                                                <img src="{{ asset('assets/images/' . $image->detail_image) }}" alt="Detail Image">
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
            </div>

            {{-- ==========================================
                右侧表单区域
                ========================================== --}}
            <div class="col-md-7">
                <div class="size-values-section p-4">

                    {{-- 表单标题 --}}
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h6 class="mb-0 fw-bold">
                                <i class="bi bi-box me-2"></i>Product Information
                            </h6>
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i>
                                Fill in product information below.
                            </small>
                        </div>
                    </div>

                    <div class="card border-0 bg-white shadow-sm">
                        <div class="card-body p-4">

                            {{-- 产品基本信息 --}}
                            <div class="mb-4">
                                <label class="form-label fw-bold text-dark mb-2">
                                    <i class="bi bi-box me-2 text-primary"></i>Product Name
                                </label>
                                <input type="text" class="form-control" name="name" value="{{ $product->name }}" placeholder="Enter product name" required>
                            </div>

                            {{-- 价格和数量 --}}
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-currency-dollar me-2 text-primary"></i>Price (RM)
                                    </label>
                                    <input type="number" class="form-control" name="price" value="{{ $product->price }}" placeholder="0.00" step="0.01" min="0" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-box-seam me-2 text-primary"></i>Quantity (Unit)
                                    </label>
                                    <input type="number" class="form-control" name="quantity" value="{{ $product->quantity }}" placeholder="0" min="1" required>
                                </div>
                            </div>

                            {{-- 产品描述 --}}
                            <div class="mb-4">
                                <label class="form-label fw-bold text-dark mb-2">
                                    <i class="bi bi-textarea-t me-2 text-primary"></i>Description
                                </label>
                                <textarea class="form-control" name="description" rows="4" placeholder="Enter product description">{{ $product->description }}</textarea>
                            </div>

                            {{-- 产品代码 --}}
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-barcode me-2 text-primary"></i>SKU Code
                                    </label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" name="sku_code" id="sku_code" value="{{ $variant ? $variant->sku_code : '' }}" placeholder="SKU">
                                        <button type="button" class="btn btn-outline-secondary" id="regenerate-sku">
                                            <i class="bi bi-arrow-clockwise"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-upc-scan me-2 text-primary"></i>Barcode
                                    </label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" name="barcode_number" id="barcode_number" value="{{ $variant ? $variant->barcode_number : '' }}" placeholder="Barcode">
                                        <button type="button" class="btn btn-outline-secondary" id="regenerate-barcode">
                                            <i class="bi bi-arrow-clockwise"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {{-- 生成代码按钮 --}}
                            <div class="mb-4">
                                <button type="button" class="btn btn-outline-primary w-100" id="generate-codes-btn">
                                    <i class="bi bi-magic me-2"></i>Generate Both Codes
                                </button>
                            </div>
                        </div>
                    </div>

                    {{-- 库存位置和属性 --}}
                    <div class="card border-0 bg-white shadow-sm mt-4">
                        <div class="card-body p-4">

                            {{-- 库存位置 --}}
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-geo-alt me-2 text-primary"></i>Zone
                                    </label>
                                    <select class="form-select" name="zone_id" required>
                                        <option value="">Select Zone</option>
                                        @foreach($zones as $zone)
                                            <option value="{{ $zone->id }}" {{ $product->zone_id == $zone->id ? 'selected' : '' }}>{{ $zone->zone_name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-inboxes me-2 text-primary"></i>Rack
                                    </label>
                                    <select class="form-select" name="rack_id" required disabled>
                                        <option value="">Select Rack</option>
                                        @foreach($racks as $rack)
                                            @php $capacity = $rackCapacities[$rack->id] ?? ['capacity' => 0, 'used' => 0, 'available' => 0]; @endphp
                                            <option value="{{ $rack->id }}" {{ $product->rack_id == $rack->id ? 'selected' : '' }} data-capacity="{{ $capacity['capacity'] }}" data-used="{{ $capacity['used'] }}" data-available="{{ $capacity['available'] }}">
                                                {{ $rack->rack_number }} ({{ $capacity['available'] }}/{{ $capacity['capacity'] }})
                                            </option>
                                        @endforeach
                                    </select>
                                    {{-- 货架容量错误提示 --}}
                                    <div id="rack-capacity-error" class="invalid-feedback d-none">
                                        <i class="bi bi-exclamation-triangle-fill me-1"></i>
                                        <span id="rack-capacity-error-text"></span>
                                    </div>
                                </div>
                            </div>

                            {{-- 分类和子分类 --}}
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-tag me-2 text-primary"></i>Category
                                    </label>
                                    <select class="form-select" name="category_id" required>
                                        <option value="">Select Category</option>
                                        @foreach($categories as $category)
                                            <option value="{{ $category->id }}" {{ $product->category_id == $category->id ? 'selected' : '' }}>{{ $category->category_name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-tags me-2 text-primary"></i>Subcategory
                                    </label>
                                    <select class="form-select" name="subcategory_id" required disabled>
                                        <option value="">Select Subcategory</option>
                                        @foreach($subcategories as $subcategory)
                                            <option value="{{ $subcategory->id }}" {{ $product->subcategory_id == $subcategory->id ? 'selected' : '' }}>{{ $subcategory->subcategory_name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            {{-- 产品属性 --}}
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-trophy me-2 text-primary"></i>Brand
                                    </label>
                                    <select class="form-select" name="brand_id" required>
                                        <option value="">Select Brand</option>
                                        @foreach($brands as $brand)
                                            <option value="{{ $brand->id }}" {{ $attributeVariant && $attributeVariant->brand_id == $brand->id ? 'selected' : '' }}>{{ $brand->brand_name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-palette me-2 text-primary"></i>Color
                                    </label>
                                    <select class="form-select" name="color_id" required>
                                        <option value="">Select Color</option>
                                        @foreach($colors as $color)
                                            <option value="{{ $color->id }}" {{ $attributeVariant && $attributeVariant->color_id == $color->id ? 'selected' : '' }}>{{ $color->color_name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-gender-ambiguous me-2 text-primary"></i>Gender
                                    </label>
                                    <select class="form-select" name="gender_id" required>
                                        <option value="">Select Gender</option>
                                        @foreach($genders as $gender)
                                            <option value="{{ $gender->id }}" {{ $attributeVariant && $attributeVariant->gender_id == $gender->id ? 'selected' : '' }}>{{ $gender->gender_name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-rulers me-2 text-primary"></i>Size
                                    </label>
                                    <select class="form-select" name="size_id" required disabled>
                                        <option value="">Select Size</option>
                                        @php $sizesByCategory = $sizes->groupBy('category.category_name'); @endphp
                                        @foreach($sizesByCategory as $categoryName => $categorySizes)
                                            <optgroup label="{{ $categoryName ?? 'Other' }}">
                                                @foreach($categorySizes as $sizeOption)
                                                    <option value="{{ $sizeOption->id }}" {{ $attributeVariant && $attributeVariant->size_id == $sizeOption->id ? 'selected' : '' }}
                                                            data-category="{{ $sizeOption->category ? $sizeOption->category->id : '' }}">
                                                        {{ $sizeOption->size_value }}
                                                    </option>
                                                @endforeach
                                            </optgroup>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            {{-- 产品状态（Update 特有） --}}
                            @include('components.form-templates.templates.status-selector', [
                                'fieldName' => 'product_status',
                                'currentStatus' => $product->product_status,
                                'label' => 'Product Status',
                                'helpText' => 'Choose whether the product can be sold'
                            ])
                        </div>
                    </div>

                    {{-- 提交按钮 --}}
                    <div class="d-flex gap-3 mt-4">
                        <button type="submit" class="btn btn-primary flex-fill">
                            <i class="bi bi-check-circle me-2"></i>Update Product
                        </button>
                        <a href="{{ route('product.index') }}" class="btn btn-outline-secondary">
                            <i class="bi bi-x-circle me-2"></i>Cancel
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
