{{-- ==========================================
    Update Rack 弹窗模态框组件
    功能：在dashboard页面中显示更新rack的弹窗
    ========================================== --}}

<div class="modal fade" id="updateRackModal" tabindex="-1" aria-labelledby="updateRackModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="updateRackModalLabel">
                    <i class="bi bi-pencil-square me-2"></i>Update Rack
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
                <form id="updateRackModalForm" enctype="multipart/form-data">
                    @csrf
                    @method('PUT')

                    <div class="card shadow-sm border-0">
                        <div class="row g-0">
                            {{-- ==========================================
                                左侧配置区域
                                ========================================== --}}
                            <div class="col-md-4">
                                <div class="config-section d-flex flex-column h-100 bg-light p-4">
                                    {{-- 配置标题 --}}
                                    <div class="d-flex justify-content-between align-items-center mb-4">
                                        <h6 class="mb-0 fw-bold text-primary">
                                            <i class="bi bi-gear-fill me-2"></i>Configuration
                                        </h6>
                                        <span class="badge bg-white text-dark border px-3 py-2">Update</span>
                                    </div>

                                    {{-- 图片上传 --}}
                                    <div class="mb-4">
                                        <label class="form-label">Rack Image</label>
                                        <div class="img-upload-area" id="image-preview">
                                            {{-- 初始状态下显示上传占位符 --}}
                                            <div class="upload-placeholder" id="imageUploadContent">
                                                <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                                <h5 class="mt-3">Click to upload image</h5>
                                                <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                            </div>
                                            {{-- 图片预览（初始隐藏） --}}
                                            <img id="preview-image" class="img-preview d-none" alt="Rack preview">
                                            {{-- 删除按钮（初始隐藏） --}}
                                            <button type="button" class="img-remove-btn d-none" id="removeImage" title="Remove image">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                        <input type="file" class="d-none" id="input_image" name="rack_image" accept="image/*">
                                        <input type="hidden" id="remove_image" name="remove_image" value="0">
                                    </div>

                                    {{-- 当前Rack信息卡片 --}}
                                    <div class="alert alert-info border-0 mb-0">
                                        <div class="d-flex align-items-center mb-2">
                                            <i class="bi bi-info-circle-fill me-2"></i>
                                            <strong>Current Rack</strong>
                                        </div>
                                        <div class="small" id="currentRackInfo">
                                            {{-- 信息将通过 JavaScript 动态填充 --}}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {{-- ==========================================
                                右侧表单区域
                                ========================================== --}}
                            <div class="col-md-8">
                                <div class="size-values-section p-4">
                                    {{-- 表单标题 --}}
                                    <div class="d-flex align-items-center justify-content-between mb-4">
                                        <div>
                                            <h6 class="mb-0 fw-bold">
                                                <i class="bi bi-pencil-square me-2"></i>Update Rack Information
                                            </h6>
                                            <small class="text-muted">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Modify the rack details below.
                                            </small>
                                        </div>
                                    </div>

                                    <div class="card border-0 bg-white shadow-sm">
                                        <div class="card-body p-4">
                                            {{-- 货架编号输入框 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-hash me-2 text-primary"></i>Rack Number <span class="text-danger">*</span>
                                                </label>
                                                <input type="text" class="form-control" id="update_rack_number" name="rack_number"
                                                       placeholder="Enter rack number" required>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Enter a unique rack number
                                                </div>
                                                <div class="invalid-feedback">
                                                    Please enter rack number.
                                                </div>
                                            </div>

                                            {{-- 货架最大容量输入框 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-box-seam me-2 text-primary"></i>Rack Capacity <span class="text-muted">(Optional)</span>
                                                </label>
                                                <input type="number" class="form-control" id="update_capacity" name="capacity"
                                                       placeholder="Enter rack capacity (default: 50)" min="1">
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Enter the maximum capacity of the rack
                                                </div>
                                            </div>

                                            {{-- 货架状态选择 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-3">
                                                    <i class="bi bi-shield-check me-2 text-primary"></i>Rack Status <span class="text-danger">*</span>
                                                </label>
                                                <div class="row g-3">
                                                    <div class="col-md-6">
                                                        <div class="card h-100 border status-card" data-status="Available">
                                                            <label class="card-body d-flex align-items-center" style="cursor: pointer;" for="update_status_available">
                                                                <input type="radio" name="rack_status" id="update_status_available" value="Available" class="form-check-input me-3">
                                                                <div class="flex-grow-1">
                                                                    <h6 class="card-title mb-1">
                                                                        <i class="bi bi-check-circle me-2 text-success"></i>Available
                                                                    </h6>
                                                                    <p class="card-text text-muted small mb-0">Active and can be used</p>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="card h-100 border status-card" data-status="Unavailable">
                                                            <label class="card-body d-flex align-items-center" style="cursor: pointer;" for="update_status_unavailable">
                                                                <input type="radio" name="rack_status" id="update_status_unavailable" value="Unavailable" class="form-check-input me-3">
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
                                                    Choose whether the rack can be used for stock management
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
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="bi bi-x-circle me-2"></i>Cancel
                </button>
                <button type="button" class="btn btn-warning" id="submitUpdateRackModal">
                    <i class="bi bi-check-circle me-2"></i>Update Rack
                </button>
            </div>
        </div>
    </div>
</div>

