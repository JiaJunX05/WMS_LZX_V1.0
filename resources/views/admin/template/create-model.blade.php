{{-- ==========================================
    Add Size Template 弹窗模态框组件
    功能：在dashboard页面中显示添加size template的弹窗
    ========================================== --}}

<div class="modal fade" id="createTemplateModal" tabindex="-1" aria-labelledby="createTemplateModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="createTemplateModalLabel">
                    <i class="bi bi-plus-circle me-2"></i>Add Size Template
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
                <form id="createTemplateModalForm">
                    @csrf
                    <div class="card shadow-sm border-0">
                        <div class="row g-0">
                            {{-- ==========================================
                                左侧配置区域
                                ========================================== --}}
                            <div class="col-md-4">
                                <div class="config-section d-flex flex-column h-100 bg-light p-4">
                                    <div class="mb-4">
                                        <h5 class="fw-bold text-dark mb-3">
                                            <i class="bi bi-gear me-2"></i>Configuration
                                        </h5>

                                        {{-- 模板分类选择 --}}
                                        <div class="mb-3">
                                            <label class="form-label">Category <span class="text-danger">*</span></label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-white border-end-0">
                                                    <i class="bi bi-tag text-primary"></i>
                                                </span>
                                                <select class="form-select border-start-0" id="create_category_id" name="category_id" required>
                                                    <option value="">Select category</option>
                                                    {{-- 选项将动态填充 --}}
                                                </select>
                                            </div>
                                        </div>

                                        {{-- 模板性别选择 --}}
                                        <div class="mb-3">
                                            <label class="form-label">Gender <span class="text-danger">*</span></label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-white border-end-0">
                                                    <i class="bi bi-person text-primary"></i>
                                                </span>
                                                <select class="form-select border-start-0" id="create_gender" name="gender" required>
                                                    <option value="">Select gender</option>
                                                    <option value="Men">Men</option>
                                                    <option value="Women">Women</option>
                                                    <option value="Kids">Kids</option>
                                                    <option value="Unisex">Unisex</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {{-- 模板信息提示卡片 --}}
                                    <div class="mb-3">
                                        <div class="alert alert-info border-0 mb-0">
                                            <div class="d-flex align-items-center mb-2">
                                                <i class="bi bi-info-circle-fill me-2"></i>
                                                <strong>Quick Tips</strong>
                                            </div>
                                            <div class="small">
                                                <div class="mb-1">
                                                    <i class="bi bi-check-circle me-2 text-muted"></i>
                                                    <span>Select category and gender first</span>
                                                </div>
                                                <div class="mb-1">
                                                    <i class="bi bi-check-circle me-2 text-muted"></i>
                                                    <span>Available size libraries will appear on the right</span>
                                                </div>
                                                <div>
                                                    <i class="bi bi-check-circle me-2 text-muted"></i>
                                                    <span>Select size libraries to create templates</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {{-- 模板尺码库卡片操作按钮区域 --}}
                                    <div class="mt-auto">
                                        <div class="d-flex gap-2 mb-3">
                                            <button type="button" class="btn btn-outline-primary flex-fill" id="selectAllSizeLibrariesBtn">
                                                <i class="bi bi-check-all me-2"></i>Select All
                                            </button>
                                            <button type="button" class="btn btn-outline-danger" id="clearAllSizeLibrariesBtn">
                                                <i class="bi bi-x-circle me-2"></i>Clear All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {{-- 模板尺码库卡片区域 --}}
                            <div class="col-md-8">
                                <div class="size-library-selection-section p-4">
                                    <div class="d-flex justify-content-between align-items-center mb-4">
                                        <div>
                                            <h5 class="fw-bold text-dark mb-1">
                                                <i class="bi bi-rulers me-2"></i>Size Library Selection
                                            </h5>
                                            <p class="text-muted mb-0">Select size libraries to create templates.</p>
                                        </div>
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="badge bg-primary" id="sizeLibrarySelectionCounter">0 selected</span>
                                        </div>
                                    </div>

                                    {{-- 初始提示信息 --}}
                                    <div class="text-center text-muted py-5" id="initial-size-library-message">
                                        <i class="bi bi-rulers fs-1 text-muted mb-3"></i>
                                        <h5 class="text-muted">Ready to Select Size Libraries</h5>
                                        <p class="text-muted">Select category and gender on the left to load available size libraries</p>
                                    </div>

                                    {{-- 模板尺码库卡片区域 --}}
                                    <div id="sizeLibrarySelection" class="d-none">
                                        <div id="sizeLibraryCardsContainer" class="row g-3 overflow-auto" style="max-height: 400px;">
                                            {{-- 模板尺码库卡片将在这里动态生成 --}}
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
                <button type="button" class="btn btn-success" id="submitCreateTemplateModal" disabled>
                    <i class="bi bi-stack me-2"></i>Create All Templates
                </button>
            </div>
        </div>
    </div>
</div>

