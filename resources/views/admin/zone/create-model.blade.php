{{-- ==========================================
    Add Zone 弹窗模态框组件
    功能：在dashboard页面中显示添加zone的弹窗
    ========================================== --}}

<div class="modal fade" id="createZoneModal" tabindex="-1" aria-labelledby="createZoneModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="createZoneModalLabel">
                    <i class="bi bi-plus-circle me-2"></i>Add Zone
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
                <form id="createZoneModalForm" enctype="multipart/form-data">
                    @csrf

                    <div class="card shadow-sm border-0">
                        <div class="row g-0">
                            {{-- ==========================================
                                左侧配置区域
                                ========================================== --}}
                            <div class="col-md-4">
                                <div class="config-section d-flex flex-column h-100 bg-light p-4">
                                    {{-- 位置区域配置标题 --}}
                                    <div class="d-flex justify-content-between align-items-center mb-4">
                                        <h6 class="mb-0 fw-bold text-primary">
                                            <i class="bi bi-gear-fill me-2"></i>Configuration
                                        </h6>
                                        <span class="badge bg-white text-dark border px-3 py-2">Create</span>
                                    </div>

                                    {{-- 位置区域图片上传 --}}
                                    <div class="mb-4">
                                        <label class="form-label">Zone Image</label>
                                        <div class="img-upload-area" id="imageUploadArea">
                                            <div class="img-upload-content" id="imageUploadContent">
                                                <i class="bi bi-cloud-upload fs-1 text-muted mb-3" id="preview-icon"></i>
                                                <h6 class="text-muted">Click to upload image</h6>
                                                <p class="text-muted small">Supports JPG, PNG, GIF formats</p>
                                            </div>
                                            <img id="img-preview" class="img-preview d-none" alt="Zone preview">
                                        </div>
                                        <input type="file" class="d-none" id="zone_image" name="zone_image" accept="image/*">
                                    </div>

                                    {{-- 位置区域信息提示卡片 --}}
                                    <div class="alert alert-info border-0 mb-0">
                                        <div class="d-flex align-items-center mb-2">
                                            <i class="bi bi-info-circle-fill me-2"></i>
                                            <strong>Quick Tips</strong>
                                        </div>
                                        <div class="small">
                                            <div class="mb-1">
                                                <i class="bi bi-check-circle me-2 text-muted"></i>
                                                <span>Zone name must be unique</span>
                                            </div>
                                            <div class="mb-1">
                                                <i class="bi bi-check-circle me-2 text-muted"></i>
                                                <span>Location helps identify zone</span>
                                            </div>
                                            <div>
                                                <i class="bi bi-check-circle me-2 text-muted"></i>
                                                <span>Image is optional</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {{-- ==========================================
                                右侧表单区域
                                ========================================== --}}
                            <div class="col-md-8">
                                <div class="size-values-section p-4">
                                    {{-- 位置区域表单标题 --}}
                                    <div class="d-flex align-items-center justify-content-between mb-4">
                                        <div>
                                            <h6 class="mb-0 fw-bold">
                                                <i class="bi bi-pencil-square me-2"></i>Add Zone Information
                                            </h6>
                                            <small class="text-muted">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Fill in the zone details below.
                                            </small>
                                        </div>
                                    </div>

                                    <div class="card border-0 bg-white shadow-sm">
                                        <div class="card-body p-4">
                                            {{-- 位置区域名称输入框 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-geo-alt me-2 text-primary"></i>Zone Name <span class="text-danger">*</span>
                                                </label>
                                                <input type="text" class="form-control" id="zone_name" name="zone_name"
                                                       placeholder="Enter zone name" required>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Enter a unique zone name
                                                </div>
                                                <div class="invalid-feedback">
                                                    Please enter zone name.
                                                </div>
                                            </div>

                                            {{-- 位置区域位置输入框 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-geo-alt me-2 text-primary"></i>Zone Location <span class="text-danger">*</span>
                                                </label>
                                                <input type="text" class="form-control" id="location" name="location"
                                                       placeholder="Enter zone location" required>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Enter the physical location of the zone
                                                </div>
                                                <div class="invalid-feedback">
                                                    Please enter location.
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
                <button type="button" class="btn btn-primary" id="submitCreateZoneModal">
                    <i class="bi bi-check-circle me-2"></i>Add Zone
                </button>
            </div>
        </div>
    </div>
</div>
