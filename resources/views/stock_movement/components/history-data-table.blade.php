{{-- ==========================================
    库存历史表格组件
    功能：显示库存历史表格和空状态
    ========================================== --}}

{{-- 库存历史表格 --}}
<div class="card shadow-sm border-0">
    <div class="card-header bg-transparent border-0 pb-3 mb-3">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-3">
                <h5 class="mb-0 fw-semibold">Stock Movement History</h5>
                <span class="badge bg-light text-dark" id="history-results-count">0 records</span>
            </div>
            @if(Auth::user()->getAccountRole() === 'SuperAdmin')
            <button class="btn btn-primary" id="export-history-btn">
                <i class="bi bi-download me-2"></i>Export Data
            </button>
            @endif
        </div>
    </div>
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4" style="width: 5%"><div class="fw-bold text-muted small text-uppercase">ID</div></th>
                        <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">DATE</div></th>
                        <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">TYPE</div></th>
                        <th style="width: 30%"><div class="fw-bold text-muted small text-uppercase">PRODUCT</div></th>
                        <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">QUANTITY</div></th>
                        <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">BEFORE</div></th>
                        <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">AFTER</div></th>
                        <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">USER INFO</div></th>
                        <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">REFERENCE</div></th>
                    </tr>
                </thead>
                <tbody id="history-table-body">
                    <tr>
                        <td colspan="9" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2 text-muted">Loading history...</p>
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
        <i class="bi bi-clock-history text-muted fs-1"></i>
    </div>
    <h4 class="text-secondary fw-semibold mb-3">No Stock History Data</h4>
    <p class="text-muted small mb-4">No stock movement history has been recorded in the system yet</p>
</div>

