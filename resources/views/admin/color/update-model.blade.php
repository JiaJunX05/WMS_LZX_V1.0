{{-- ==========================================
    Update Color 弹窗模态框组件
    功能：在dashboard页面中显示更新color的弹窗
    ========================================== --}}

<div class="modal fade" id="updateColorModal" tabindex="-1" aria-labelledby="updateColorModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="updateColorModalLabel">
                    <i class="bi bi-pencil-square me-2"></i>Update Color
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
                <form id="updateColorModalForm">
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

                                    {{-- 颜色预览 --}}
                                    <div class="mb-4">
                                        <label class="form-label">Color Preview</label>
                                        <div class="rounded-3 border border-3 border-white shadow-sm" id="color-preview"
                                            style="background-color: #f3f4f6; width: 100%; height: 80px; transition: all 0.3s ease;">
                                        </div>
                                    </div>

                                    {{-- 当前Color信息卡片 --}}
                                    <div class="alert alert-info border-0 mb-0">
                                        <div class="d-flex align-items-center mb-2">
                                            <i class="bi bi-info-circle-fill me-2"></i>
                                            <strong>Current Color</strong>
                                        </div>
                                        <div class="small" id="currentColorInfo">
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
                                                <i class="bi bi-pencil-square me-2"></i>Update Color Information
                                            </h6>
                                            <small class="text-muted">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Modify the color details below.
                                            </small>
                                        </div>
                                    </div>

                                    <div class="card border-0 bg-white shadow-sm">
                                        <div class="card-body p-4">
                                            {{-- 颜色名称输入框 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-palette me-2 text-primary"></i>Color Name <span class="text-danger">*</span>
                                                </label>
                                                <input type="text" class="form-control" id="update_color_name" name="color_name"
                                                       placeholder="Enter color name" required>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Enter a unique color name
                                                </div>
                                                <div class="invalid-feedback">
                                                    Please enter color name.
                                                </div>
                                            </div>

                                            {{-- 颜色十六进制代码输入框 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-hash me-2 text-primary"></i>Color Hex Code <span class="text-danger">*</span>
                                                </label>
                                                <input type="text" class="form-control" id="update_color_hex" name="color_hex"
                                                       placeholder="#FF0000" pattern="^#[0-9A-Fa-f]{6}$" required>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Enter hex code (e.g., #FF0000)
                                                </div>
                                                <div class="invalid-feedback">
                                                    Please enter a valid hex code (e.g., #FF0000).
                                                </div>
                                            </div>

                                            {{-- 颜色RGB代码输入框（只读，自动生成） --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-circle-fill me-2 text-primary"></i>Color RGB Code
                                                </label>
                                                <input type="text" class="form-control bg-light" id="update_color_rgb" name="color_rgb"
                                                       placeholder="RGB(255, 0, 0)" readonly>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    RGB code is automatically generated from hex code
                                                </div>
                                            </div>

                                            {{-- 颜色状态选择 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-3">
                                                    <i class="bi bi-shield-check me-2 text-primary"></i>Color Status <span class="text-danger">*</span>
                                                </label>
                                                <div class="row g-3">
                                                    <div class="col-md-6">
                                                        <div class="card h-100 border status-card" data-status="Available">
                                                            <label class="card-body d-flex align-items-center" style="cursor: pointer;" for="update_status_available">
                                                                <input type="radio" name="color_status" id="update_status_available" value="Available" class="form-check-input me-3">
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
                                                                <input type="radio" name="color_status" id="update_status_unavailable" value="Unavailable" class="form-check-input me-3">
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
                                                    Choose whether the color can be used for product management
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
                <button type="button" class="btn btn-warning" id="submitUpdateColorModal">
                    <i class="bi bi-check-circle me-2"></i>Update Color
                </button>
            </div>
        </div>
    </div>
</div>

