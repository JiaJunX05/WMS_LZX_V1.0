{{-- ==========================================
    Update Size Template 弹窗模态框组件
    功能：在view页面中显示更新size template的弹窗
    ========================================== --}}

<div class="modal fade" id="updateTemplateModal" tabindex="-1" aria-labelledby="updateTemplateModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="updateTemplateModalLabel">
                    <i class="bi bi-pencil-square me-2"></i>Update Size Template
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
                <form id="updateTemplateModalForm">
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

                                    {{-- 当前Template信息卡片 --}}
                                    <div class="alert alert-info border-0 mb-0">
                                        <div class="d-flex align-items-center mb-2">
                                            <i class="bi bi-info-circle-fill me-2"></i>
                                            <strong>Current Template</strong>
                                        </div>
                                        <div class="small" id="currentTemplateInfo">
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
                                                <i class="bi bi-pencil-square me-2"></i>Update Template Information
                                            </h6>
                                            <small class="text-muted">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Modify the template configuration below.
                                            </small>
                                        </div>
                                    </div>

                                    <div class="card border-0 bg-white shadow-sm">
                                        <div class="card-body p-4">
                                            {{-- 模板分类选择 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-tag me-2 text-primary"></i>Category <span class="text-danger">*</span>
                                                </label>
                                                <select class="form-control" id="update_category_id" name="category_id" required>
                                                    <option value="">Select category</option>
                                                    {{-- 选项将动态填充 --}}
                                                </select>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Choose the category for this template
                                                </div>
                                            </div>

                                            {{-- 模板性别选择 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-person me-2 text-primary"></i>Gender <span class="text-danger">*</span>
                                                </label>
                                                <select class="form-control" id="update_gender" name="gender" required>
                                                    <option value="">Select gender</option>
                                                    <option value="Men">Men</option>
                                                    <option value="Women">Women</option>
                                                    <option value="Kids">Kids</option>
                                                    <option value="Unisex">Unisex</option>
                                                </select>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Choose the gender for this template
                                                </div>
                                            </div>

                                            {{-- 模板尺码库选择 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-rulers me-2 text-primary"></i>Size Library <span class="text-danger">*</span>
                                                </label>
                                                <select class="form-control" id="update_size_library_id" name="size_library_id" required>
                                                    <option value="">Select size library</option>
                                                    {{-- 选项将动态填充 --}}
                                                </select>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Select the size library for this template based on category and gender
                                                </div>
                                            </div>

                                            {{-- 模板状态选择 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-3">
                                                    <i class="bi bi-shield-check me-2 text-primary"></i>Template Status <span class="text-danger">*</span>
                                                </label>
                                                <div class="row g-3">
                                                    <div class="col-md-6">
                                                        <div class="card h-100 border status-card" data-status="Available">
                                                            <label class="card-body d-flex align-items-center" style="cursor: pointer;" for="update_status_available">
                                                                <input type="radio" name="template_status" id="update_status_available" value="Available" class="form-check-input me-3">
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
                                                                <input type="radio" name="template_status" id="update_status_unavailable" value="Unavailable" class="form-check-input me-3">
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
                                                    Choose whether the template can be used for product management
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
                <button type="button" class="btn btn-warning" id="submitUpdateTemplateModal">
                    <i class="bi bi-check-circle me-2"></i>Update Template
                </button>
            </div>
        </div>
    </div>
</div>

