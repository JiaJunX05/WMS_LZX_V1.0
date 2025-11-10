{{-- ==========================================
    产品列表表格组件
    功能：显示产品列表表格和空状态
    ========================================== --}}

{{-- 产品列表表格 --}}
<div class="card shadow-sm border-0">
    <div class="card-header bg-transparent border-0 pb-3 mb-3">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-3">
                <h5 class="mb-0 fw-semibold">Products List</h5>
                <span class="badge bg-light text-dark" id="dashboard-results-count">0 products</span>
            </div>
            @if(in_array(Auth::user()->getAccountRole(), ['SuperAdmin', 'Admin']))
            <button class="btn btn-primary" id="export-products-btn" disabled>
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
                        @if(in_array(Auth::user()->getAccountRole(), ['SuperAdmin', 'Admin']))
                            <th class="ps-4" style="width: 5%">
                                <div class="fw-bold text-muted small text-uppercase"></div>
                                <input type="checkbox" name="select-all" id="select-all" class="form-check-input">
                            </th>
                            <th style="width: 35%"><div class="fw-bold text-muted small text-uppercase">PRODUCT</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">SKU CODE</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">CURRENT STOCK</div></th>
                            <th style="width: 20%"><div class="fw-bold text-muted small text-uppercase">Last Movement / Created By</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">STATUS</div></th>
                            <th class="text-end pe-4" style="width: 10%">
                                <div class="fw-bold text-muted small text-uppercase">ACTIONS</div>
                            </th>
                        @else
                            <th class="ps-4" style="width: 5%"><div class="fw-bold text-muted small text-uppercase">ID</div></th>
                            <th style="width: 35%"><div class="fw-bold text-muted small text-uppercase">PRODUCT</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">SKU CODE</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">CURRENT STOCK</div></th>
                            <th style="width: 20%"><div class="fw-bold text-muted small text-uppercase">Last Movement / Created By</div></th>
                            <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">STATUS</div></th>
                            <th class="text-end pe-4" style="width: 10%">
                                <div class="fw-bold text-muted small text-uppercase">ACTIONS</div>
                            </th>
                        @endif
                    </tr>
                </thead>
                <tbody id="products-table-body">
                    <tr>
                        <td colspan="{{ in_array(Auth::user()->getAccountRole(), ['SuperAdmin', 'Admin']) ? '7' : '7' }}" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2 text-muted">Loading products...</p>
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
        <i class="bi bi-clipboard-data text-muted fs-1"></i>
    </div>
    <h4 class="text-secondary fw-semibold mb-3">No Stock Data</h4>
    <p class="text-muted small mb-4">No stock movements have been recorded in the system yet</p>
    <a href="{{ route('staff.stock_management') }}" class="btn btn-primary btn-lg">
        <i class="bi bi-plus-circle-fill me-2"></i>Create First Stock Movement
    </a>
</div>

