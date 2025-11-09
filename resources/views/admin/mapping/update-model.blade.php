{{-- ==========================================
    Update Mapping 弹窗模态框组件
    功能：在view页面中显示更新mapping的弹窗
    ========================================== --}}

<div class="modal fade" id="updateMappingModal" tabindex="-1" aria-labelledby="updateMappingModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="updateMappingModalLabel">
                    <i class="bi bi-pencil-square me-2"></i>Update Mapping
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
                <form id="updateMappingModalForm">
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

                                    {{-- 当前Mapping信息卡片 --}}
                                    <div class="alert alert-info border-0 mb-0">
                                        <div class="d-flex align-items-center mb-2">
                                            <i class="bi bi-info-circle-fill me-2"></i>
                                            <strong>Current Mapping</strong>
                                        </div>
                                        <div class="small" id="currentMappingInfo">
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
                                                <i class="bi bi-pencil-square me-2"></i>Update Mapping Information
                                            </h6>
                                            <small class="text-muted">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Modify the mapping configuration below.
                                            </small>
                                        </div>
                                    </div>

                                    <div class="card border-0 bg-white shadow-sm">
                                        <div class="card-body p-4">
                                            {{-- 映射分类选择 --}}
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
                                                    Choose the category for this mapping
                                                </div>
                                            </div>

                                            {{-- 映射子分类选择 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-tags me-2 text-primary"></i>Subcategory <span class="text-danger">*</span>
                                                </label>
                                                <select class="form-control" id="update_subcategory_id" name="subcategory_id" required>
                                                    <option value="">Select subcategory</option>
                                                    {{-- 选项将动态填充 --}}
                                                </select>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Choose the subcategory for this mapping
                                                </div>
                                            </div>

                                            {{-- 映射状态选择 --}}
                                            <div class="col-12 mb-4">
                                                <label class="form-label fw-bold text-dark mb-3">
                                                    <i class="bi bi-shield-check me-2 text-primary"></i>Mapping Status <span class="text-danger">*</span>
                                                </label>
                                                <div class="row g-3">
                                                    <div class="col-md-6">
                                                        <div class="card h-100 border status-card" data-status="Available">
                                                            <label class="card-body d-flex align-items-center" style="cursor: pointer;" for="update_status_available">
                                                                <input type="radio" name="mapping_status" id="update_status_available" value="Available" class="form-check-input me-3">
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
                                                                <input type="radio" name="mapping_status" id="update_status_unavailable" value="Unavailable" class="form-check-input me-3">
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
                                                    Choose whether the mapping can be used for stock management
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
                <button type="button" class="btn btn-warning" id="submitUpdateMappingModal">
                    <i class="bi bi-check-circle me-2"></i>Update Mapping
                </button>
            </div>
        </div>
    </div>
</div>

