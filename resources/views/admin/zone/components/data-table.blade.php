{{-- ==========================================
    区域列表表格组件
    功能：显示区域列表表格和空状态
    ========================================== --}}

{{-- 区域列表表格 --}}
<div class="card shadow-sm border-0">
    <div class="card-header bg-transparent border-0 pb-3 mb-3">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-3">
                <h5 class="mb-0 fw-semibold">Zone List</h5>
                <span class="badge bg-light text-dark" id="results-count">Loading...</span>
            </div>
            <button class="btn btn-primary" id="export-zones-btn" disabled>
                <i class="bi bi-download me-2"></i>Export Data
            </button>
        </div>
    </div>
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4" style="width: 5%">
                            <div class="fw-bold text-muted small text-uppercase"></div>
                            <input type="checkbox" name="select-all" id="select-all" class="form-check-input">
                        </th>
                        <th style="width: 10%">
                            <div class="fw-bold text-muted small text-uppercase">ZONE IMAGE</div>
                        </th>
                        <th style="width: 60%">
                            <div class="fw-bold text-muted small text-uppercase">ZONE INFORMATION</div>
                        </th>
                        <th style="width: 15%">
                            <div class="fw-bold text-muted small text-uppercase">ZONE STATUS</div>
                        </th>
                        <th class="text-end pe-4" style="width: 10%">
                            <div class="fw-bold text-muted small text-uppercase">ACTIONS</div>
                        </th>
                    </tr>
                </thead>
                <tbody id="table-body">
                    <tr>
                        <td colspan="5" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2 text-muted">Loading zones...</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

{{-- 空状态显示 --}}
<div id="empty-state" class="text-center p-5 d-none">
    <div class="mb-4">
        <i class="bi bi-grid-3x3-gap text-muted fs-1"></i>
    </div>
    <h4 class="text-secondary fw-semibold mb-3">No Zone Data</h4>
    <p class="text-muted small mb-4">No zones have been created in the system yet</p>
    <button type="button" class="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#createZoneModal">
        <i class="bi bi-plus-circle-fill me-2"></i>Create First Zone
    </button>
</div>

