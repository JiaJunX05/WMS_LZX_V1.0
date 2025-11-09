{{-- ==========================================
    更新产品 Modal
    功能：在 modal 中更新现有产品信息
    ========================================== --}}

<div class="modal fade" id="updateProductModal" tabindex="-1" aria-labelledby="updateProductModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="updateProductModalLabel">
                    <i class="bi bi-pencil-square me-2"></i>Update Product Information
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form action="" method="post" enctype="multipart/form-data" id="updateProductForm">
                    @csrf
                    @method('PUT')

                    <div class="row g-0">
                        {{-- 左侧配置面板 --}}
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
                                        <div class="img-upload-area" id="update-cover-image-area">
                                            <div class="upload-placeholder" id="update-cover-upload-placeholder">
                                                <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                                <h5 class="mt-3">Click to upload image</h5>
                                                <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                            </div>
                                            <img id="update-cover-preview" class="img-preview d-none" style="height: auto; max-height: 150px; object-fit: contain;" alt="Cover Preview">
                                            <button type="button" class="img-remove-btn d-none" id="remove-update-cover-image">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                        <input type="file" class="d-none" id="update_cover_image" name="cover_image">
                                        <input type="hidden" name="remove_cover_image" id="update_remove_cover_image" value="0">
                                    </div>

                                    {{-- 详细图片 --}}
                                    <div>
                                        <label class="form-label">Detail Images</label>
                                        <div class="detail-images-container">
                                            <div class="detail-images-grid" id="update-detail-images-grid">
                                                {{-- 动态添加的图片将在这里显示 --}}
                                            </div>
                                            <div class="add-detail-image-btn" id="add-update-detail-image">
                                                <i class="bi bi-cloud-upload"></i>
                                                <span>Add Detail Image</span>
                                            </div>
                                        </div>
                                        <input type="file" class="d-none" id="update_detail_images" name="detail_image[]" multiple accept="image/*">
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
                                            Modify product information below.
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
                                            <input type="text" class="form-control" name="name" id="update_product_name" placeholder="Enter product name" required>
                                        </div>

                                        {{-- 价格和数量 --}}
                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-currency-dollar me-2 text-primary"></i>Price (RM)
                                                </label>
                                                <input type="number" class="form-control" name="price" id="update_product_price" placeholder="0.00" step="0.01" min="0" required>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-box-seam me-2 text-primary"></i>Quantity (Unit)
                                                </label>
                                                <input type="number" class="form-control" name="quantity" id="update_product_quantity" placeholder="0" min="1" required>
                                            </div>
                                        </div>

                                        {{-- 产品描述 --}}
                                        <div class="mb-4">
                                            <label class="form-label fw-bold text-dark mb-2">
                                                <i class="bi bi-textarea-t me-2 text-primary"></i>Description
                                            </label>
                                            <textarea class="form-control" name="description" id="update_product_description" rows="4" placeholder="Enter product description"></textarea>
                                        </div>

                                        {{-- 产品代码 --}}
                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-barcode me-2 text-primary"></i>SKU Code
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" name="sku_code" id="update_sku_code" placeholder="SKU">
                                                    <button type="button" class="btn btn-outline-secondary" id="update-regenerate-sku">
                                                        <i class="bi bi-arrow-clockwise"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-upc-scan me-2 text-primary"></i>Barcode
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" name="barcode_number" id="update_barcode_number" placeholder="Barcode">
                                                    <button type="button" class="btn btn-outline-secondary" id="update-regenerate-barcode">
                                                        <i class="bi bi-arrow-clockwise"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {{-- 生成代码按钮 --}}
                                        <div class="mb-4">
                                            <button type="button" class="btn btn-outline-primary w-100" id="update-generate-codes-btn">
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
                                                <select class="form-select" name="zone_id" id="update_zone_id" required>
                                                    <option value="">Select Zone</option>
                                                </select>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-inboxes me-2 text-primary"></i>Rack
                                                </label>
                                                <select class="form-select" name="rack_id" id="update_rack_id" required disabled>
                                                    <option value="">Select Rack</option>
                                                </select>
                                                {{-- 货架容量错误提示 --}}
                                                <div id="update-rack-capacity-error" class="invalid-feedback d-none">
                                                    <i class="bi bi-exclamation-triangle-fill me-1"></i>
                                                    <span id="update-rack-capacity-error-text"></span>
                                                </div>
                                            </div>
                                        </div>

                                        {{-- 分类和子分类 --}}
                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-tag me-2 text-primary"></i>Category
                                                </label>
                                                <select class="form-select" name="category_id" id="update_category_id" required>
                                                    <option value="">Select Category</option>
                                                </select>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-tags me-2 text-primary"></i>Subcategory
                                                </label>
                                                <select class="form-select" name="subcategory_id" id="update_subcategory_id" required disabled>
                                                    <option value="">Select Subcategory</option>
                                                </select>
                                            </div>
                                        </div>

                                        {{-- 产品属性 --}}
                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-trophy me-2 text-primary"></i>Brand
                                                </label>
                                                <select class="form-select" name="brand_id" id="update_brand_id" required>
                                                    <option value="">Select Brand</option>
                                                </select>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-palette me-2 text-primary"></i>Color
                                                </label>
                                                <select class="form-select" name="color_id" id="update_color_id" required>
                                                    <option value="">Select Color</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-gender-ambiguous me-2 text-primary"></i>Gender
                                                </label>
                                                <select class="form-select" name="gender" id="update_gender" required>
                                                    <option value="">Select Gender</option>
                                                    <option value="Men">Men</option>
                                                    <option value="Women">Women</option>
                                                    <option value="Kids">Kids</option>
                                                    <option value="Unisex">Unisex</option>
                                                </select>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-rulers me-2 text-primary"></i>Size
                                                </label>
                                                <select class="form-select" name="size_id" id="update_size_id" required disabled>
                                                    <option value="">Select Size</option>
                                                </select>
                                            </div>
                                        </div>

                                        {{-- 产品状态 --}}
                                        <div class="mb-4">
                                            <label class="form-label fw-bold text-dark mb-3">Product Status</label>
                                            <div class="row g-3">
                                                {{-- 可用状态选项 --}}
                                                <div class="col-md-6">
                                                    <div class="card h-100 border status-card" data-status="Available">
                                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;" for="update_status_available">
                                                            <input type="radio" name="product_status" value="Available" class="form-check-input me-3" id="update_status_available">
                                                            <div class="flex-grow-1">
                                                                <h6 class="card-title mb-1">
                                                                    <i class="bi bi-check-circle me-2 text-success"></i>Available
                                                                </h6>
                                                                <p class="card-text text-muted small mb-0">Active and can be used</p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>

                                                {{-- 不可用状态选项 --}}
                                                <div class="col-md-6">
                                                    <div class="card h-100 border status-card" data-status="Unavailable">
                                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;" for="update_status_unavailable">
                                                            <input type="radio" name="product_status" value="Unavailable" class="form-check-input me-3" id="update_status_unavailable">
                                                            <div class="flex-grow-1">
                                                                <h6 class="card-title mb-1">
                                                                    <i class="bi bi-x-circle me-2 text-danger"></i>Unavailable
                                                                </h6>
                                                                <p class="card-text text-muted small mb-0">Inactive and cannot be used</p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="form-text">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Choose whether the product can be sold
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
                <button type="submit" form="updateProductForm" class="btn btn-primary" id="submitUpdateProduct">
                    <i class="bi bi-check-circle me-2"></i>Update Product
                </button>
            </div>
        </div>
    </div>
</div>



