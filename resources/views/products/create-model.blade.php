{{-- ==========================================
    创建产品 Modal
    功能：在 modal 中创建新产品
    ========================================== --}}

<div class="modal fade" id="createProductModal" tabindex="-1" aria-labelledby="createProductModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="createProductModalLabel">
                    <i class="bi bi-box-seam me-2"></i>Create New Product
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form action="{{ route('product.store') }}" method="post" enctype="multipart/form-data" id="createProductForm">
                    @csrf

                    <div class="row g-0">
                        {{-- 左侧配置面板 --}}
                        <div class="col-md-5">
                            <div class="config-section d-flex flex-column h-100 bg-light p-4">
                                {{-- 配置区域标题 --}}
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <h6 class="mb-0 fw-bold text-primary">
                                        <i class="bi bi-gear-fill me-2"></i>Configuration
                                    </h6>
                                    <span class="badge bg-white text-dark border px-3 py-2">Create</span>
                                </div>

                                {{-- 产品图片上传区域 --}}
                                <div class="mb-4">
                                    <label class="form-label fw-bold">Product Images</label>

                                    {{-- 封面图片 --}}
                                    <div class="mb-3">
                                        <label class="form-label">Cover Image</label>
                                        <div class="img-upload-area" id="cover-image-area">
                                            <div class="upload-placeholder" id="cover-upload-placeholder">
                                                <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                                <h5 class="mt-3">Click to upload image</h5>
                                                <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                            </div>
                                            <img id="cover-preview" class="img-preview d-none" style="height: auto; max-height: 150px; object-fit: contain;" alt="Cover Preview">
                                            <button type="button" class="img-remove-btn d-none" id="remove-cover-image">
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
                                                {{-- 动态添加的图片将在这里显示 --}}
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

                        {{-- 右侧表单区域 --}}
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
                                            <input type="text" class="form-control" name="name" id="name" placeholder="Enter product name" required>
                                            <div class="invalid-feedback">
                                                Please enter product name.
                                            </div>
                                        </div>

                                        {{-- 价格和数量 --}}
                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-currency-dollar me-2 text-primary"></i>Price (RM)
                                                </label>
                                                <input type="number" class="form-control" name="price" id="price" placeholder="0.00" step="0.01" min="0" required>
                                                <div class="invalid-feedback">
                                                    Please enter price.
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-box-seam me-2 text-primary"></i>Quantity (Unit)
                                                </label>
                                                <input type="number" class="form-control" name="quantity" id="quantity" placeholder="0" min="1" required>
                                                <div class="invalid-feedback">
                                                    Please enter quantity.
                                                </div>
                                            </div>
                                        </div>

                                        {{-- 产品描述 --}}
                                        <div class="mb-4">
                                            <label class="form-label fw-bold text-dark mb-2">
                                                <i class="bi bi-textarea-t me-2 text-primary"></i>Description
                                            </label>
                                            <textarea class="form-control" name="description" rows="4" placeholder="Enter product description"></textarea>
                                        </div>

                                        {{-- 产品代码 --}}
                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-barcode me-2 text-primary"></i>SKU Code
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" name="sku_code" id="sku_code" placeholder="SKU">
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
                                                    <input type="text" class="form-control" name="barcode_number" id="barcode_number" placeholder="Barcode">
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
                                                <select class="form-select" name="zone_id" id="create_zone_id" required>
                                                    <option value="">Select Zone</option>
                                                </select>
                                                <div class="invalid-feedback">
                                                    Please select zone.
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-inboxes me-2 text-primary"></i>Rack
                                                </label>
                                                <select class="form-select" name="rack_id" id="create_rack_id" required disabled>
                                                    <option value="">Select Rack</option>
                                                </select>
                                                <div class="invalid-feedback">
                                                    Please select rack.
                                                </div>
                                                {{-- 货架容量错误提示 --}}
                                                <div id="create-rack-capacity-error" class="invalid-feedback d-none">
                                                    <i class="bi bi-exclamation-triangle-fill me-1"></i>
                                                    <span id="create-rack-capacity-error-text"></span>
                                                </div>
                                            </div>
                                        </div>

                                        {{-- 分类和子分类 --}}
                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-tag me-2 text-primary"></i>Category
                                                </label>
                                                <select class="form-select" name="category_id" id="create_category_id" required>
                                                    <option value="">Select Category</option>
                                                </select>
                                                <div class="invalid-feedback">
                                                    Please select category.
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-tags me-2 text-primary"></i>Subcategory
                                                </label>
                                                <select class="form-select" name="subcategory_id" id="create_subcategory_id" required disabled>
                                                    <option value="">Select Subcategory</option>
                                                </select>
                                                <div class="invalid-feedback">
                                                    Please select subcategory.
                                                </div>
                                            </div>
                                        </div>

                                        {{-- 产品属性 --}}
                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-trophy me-2 text-primary"></i>Brand
                                                </label>
                                                <select class="form-select" name="brand_id" id="create_brand_id" required>
                                                    <option value="">Select Brand</option>
                                                </select>
                                                <div class="invalid-feedback">
                                                    Please select brand.
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-palette me-2 text-primary"></i>Color
                                                </label>
                                                <select class="form-select" name="color_id" id="create_color_id" required>
                                                    <option value="">Select Color</option>
                                                </select>
                                                <div class="invalid-feedback">
                                                    Please select color.
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-gender-ambiguous me-2 text-primary"></i>Gender
                                                </label>
                                                <select class="form-select" name="gender" id="create_gender" required>
                                                    <option value="">Select Gender</option>
                                                    <option value="Men">Men</option>
                                                    <option value="Women">Women</option>
                                                    <option value="Kids">Kids</option>
                                                    <option value="Unisex">Unisex</option>
                                                </select>
                                                <div class="invalid-feedback">
                                                    Please select gender.
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-rulers me-2 text-primary"></i>Size
                                                </label>
                                                <select class="form-select" name="size_id" id="create_size_id" required>
                                                    <option value="">Select Size</option>
                                                </select>
                                                <div class="invalid-feedback">
                                                    Please select size.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    <i class="bi bi-x-circle me-2"></i>Cancel
                </button>
                <button type="submit" form="createProductForm" class="btn btn-primary" id="submitCreateProduct">
                    <i class="bi bi-check-circle me-2"></i>Create Product
                </button>
            </div>
        </div>
    </div>
</div>

