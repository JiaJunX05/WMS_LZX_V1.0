{{-- ==========================================
    Add Location 弹窗模态框组件
    功能：在dashboard页面中显示添加location的弹窗
    ========================================== --}}

<div class="modal fade" id="createLocationModal" tabindex="-1" aria-labelledby="createLocationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="createLocationModalLabel">
                    <i class="bi bi-plus-circle me-2"></i>Add Location
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
                <form id="createLocationModalForm">
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

                                        {{-- 位置区域选择 --}}
                                        <div class="mb-3">
                                            <label class="form-label">Zone <span class="text-danger">*</span></label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-white border-end-0">
                                                    <i class="bi bi-diagram-3 text-primary"></i>
                                                </span>
                                                <select class="form-select border-start-0" id="zone_id" name="zone_id" required>
                                                    <option value="">Select zone</option>
                                                    @foreach($zones as $zone)
                                                        <option value="{{ $zone->id }}">{{ strtoupper($zone->zone_name) }}</option>
                                                    @endforeach
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {{-- 位置货架卡片操作按钮区域 --}}
                                    <div class="mt-auto">
                                        <div class="d-flex gap-2 mb-3">
                                            <button type="button" class="btn btn-outline-primary flex-fill" id="selectAllRacksBtn">
                                                <i class="bi bi-check-all me-2"></i>Select All
                                            </button>
                                            <button type="button" class="btn btn-outline-danger" id="clearAllRacksBtn">
                                                <i class="bi bi-x-circle me-2"></i>Clear All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {{-- 位置货架卡片区域 --}}
                            <div class="col-md-8">
                                <div class="rack-selection-section p-4">
                                    <div class="d-flex justify-content-between align-items-center mb-4">
                                        <div>
                                            <h5 class="fw-bold text-dark mb-1">
                                                <i class="bi bi-box-seam me-2"></i>Rack Selection
                                            </h5>
                                            <p class="text-muted mb-0">Select racks to create locations.</p>
                                        </div>
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="badge bg-primary" id="rackSelectionCounter">0 selected</span>
                                        </div>
                                    </div>

                                    {{-- 初始提示信息 --}}
                                    <div class="text-center text-muted py-5" id="initial-rack-message">
                                        <i class="bi bi-box-seam fs-1 text-muted mb-3"></i>
                                        <h5 class="text-muted">Ready to Select Racks</h5>
                                        <p class="text-muted">Select a zone on the left to load available racks</p>
                                    </div>

                                    {{-- 位置货架卡片区域 --}}
                                    <div id="rackSelection" class="d-none">
                                        <div id="rackCardsContainer" class="row g-3 overflow-auto" style="max-height: 400px;">
                                            {{-- 位置货架卡片将在这里动态生成 --}}
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
                <button type="button" class="btn btn-success" id="submitCreateLocationModal" disabled>
                    <i class="bi bi-stack me-2"></i>Create All Locations
                </button>
            </div>
        </div>
    </div>
</div>

