{{-- ==========================================
    Add Size Library 弹窗模态框组件
    功能：在dashboard页面中显示添加size library的弹窗
    ========================================== --}}

<div class="modal fade" id="createLibraryModal" tabindex="-1" aria-labelledby="createLibraryModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="createLibraryModalLabel">
                    <i class="bi bi-plus-circle me-2"></i>Add Size Library
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
                <form id="createLibraryModalForm">
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

                                        {{-- 尺码库分类选择 --}}
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

                                        {{-- 尺码库类型选择 --}}
                                        <div class="mb-3">
                                            <label class="form-label">Size Type</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-white border-end-0">
                                                    <i class="bi bi-grid text-primary"></i>
                                                </span>
                                                <select class="form-select border-start-0" id="create_size_type" name="size_type">
                                                    <option value="">Select size type</option>
                                                    <option value="clothing">Clothing</option>
                                                    <option value="shoe">Shoes</option>
                                                </select>
                                            </div>
                                            <small class="text-muted">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Select the type to display predefined sizes
                                            </small>
                                        </div>

                                        {{-- 尺码库值输入 --}}
                                        <div class="mb-3">
                                            <label class="form-label">Size Value <span class="text-danger">*</span></label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-white border-end-0">
                                                    <i class="bi bi-rulers text-primary"></i>
                                                </span>
                                                <input type="text" class="form-control border-start-0" id="create_size_value" name="size_value"
                                                       placeholder="(e.g., S, M, L, 8, 9, 10)" required>
                                                <button type="button" class="btn btn-outline-primary border-start-0" id="createSingleSizeBtn" title="Create this size">
                                                    <i class="bi bi-plus-circle"></i>
                                                </button>
                                            </div>
                                            <small class="text-muted">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Enter a custom size value and click the button or press Enter to create directly, or select from predefined sizes on the right
                                            </small>
                                        </div>
                                    </div>

                                    {{-- 尺码库信息提示卡片 --}}
                                    <div class="mb-3">
                                        <div class="alert alert-info border-0 mb-0">
                                            <div class="d-flex align-items-center mb-2">
                                                <i class="bi bi-info-circle-fill me-2"></i>
                                                <strong>Quick Tips</strong>
                                            </div>
                                            <div class="small">
                                                <div class="mb-1">
                                                    <i class="bi bi-check-circle me-2 text-muted"></i>
                                                    <span>Select category (and size type for predefined sizes)</span>
                                                </div>
                                                <div class="mb-1">
                                                    <i class="bi bi-check-circle me-2 text-muted"></i>
                                                    <span>Click the green button or press Enter to create directly</span>
                                                </div>
                                                <div>
                                                    <i class="bi bi-check-circle me-2 text-muted"></i>
                                                    <span>Size value must be unique for each category</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {{-- 尺码库卡片操作按钮区域 --}}
                                    <div class="mt-auto">
                                        <div class="d-flex gap-2 mb-3">
                                            <button type="button" class="btn btn-outline-primary flex-fill" id="selectAllSizesBtn">
                                                <i class="bi bi-check-all me-2"></i>Select All
                                            </button>
                                            <button type="button" class="btn btn-outline-danger" id="clearAllSizesBtn">
                                                <i class="bi bi-x-circle me-2"></i>Clear All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {{-- 尺码库卡片区域 --}}
                            <div class="col-md-8">
                                <div class="size-selection-section p-4">
                                    <div class="d-flex justify-content-between align-items-center mb-4">
                                        <div>
                                            <h5 class="fw-bold text-dark mb-1">
                                                <i class="bi bi-rulers me-2"></i>Size Selection
                                            </h5>
                                            <p class="text-muted mb-0">Select predefined sizes or enter custom size on the left.</p>
                                        </div>
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="badge bg-primary" id="sizeSelectionCounter">0 selected</span>
                                        </div>
                                    </div>

                                    {{-- 初始提示信息 --}}
                                    <div class="text-center text-muted py-5" id="initial-size-message">
                                        <i class="bi bi-rulers fs-1 text-muted mb-3"></i>
                                        <h5 class="text-muted">Ready to Select Sizes</h5>
                                        <p class="text-muted">Select a category and size type on the left to load available sizes</p>
                                    </div>

                                    {{-- 尺码库卡片区域 --}}
                                    <div id="sizeSelection" class="d-none">
                                        {{-- 服装尺码区域 --}}
                                        <div id="clothingSizesSection" class="mb-4 d-none">
                                            <h6 class="fw-bold text-dark mb-3">
                                                <i class="bi bi-shirt me-2 text-primary"></i>Clothing Sizes
                                            </h6>
                                            <div id="clothingSizesContainer" class="row g-3">
                                                {{-- 服装尺码库卡片将在这里动态生成 --}}
                                            </div>
                                        </div>

                                        {{-- 靴子尺码区域 --}}
                                        <div id="shoeSizesSection" class="mb-4 d-none">
                                            <h6 class="fw-bold text-dark mb-3">
                                                <i class="bi bi-shoe-prints me-2 text-warning"></i>Shoe Sizes
                                            </h6>
                                            <div id="shoeSizesContainer" class="row g-3">
                                                {{-- 靴子尺码库卡片将在这里动态生成 --}}
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
                <button type="button" class="btn btn-success" id="submitCreateLibraryModal" disabled>
                    <i class="bi bi-stack me-2"></i>Create All Sizes
                </button>
            </div>
        </div>
    </div>
</div>

