{{-- 页面标题和操作按钮区域 --}}
<div class="dashboard-header mb-4">
    <div class="card shadow-sm border-0">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="{{ Auth::user()->getAccountRole() === 'Staff' ? 'col-lg-8' : 'col-12' }}">
                    <div class="d-flex align-items-center">
                        <div class="header-icon-wrapper d-flex align-items-center justify-content-center me-4">
                            <i class="bi bi-box-seam-fill text-white display-6"></i>
                        </div>
                        <div>
                            <h2 class="h3 fw-bold mb-1">Stock Management</h2>
                            <p class="text-muted mb-0" id="dashboard-subtitle">Manage product inventory movements</p>
                        </div>
                    </div>
                </div>
                @if(Auth::user()->getAccountRole() === 'Staff')
                <div class="col-lg-4 text-lg-end">
                    <button type="button" class="btn btn-success me-2" data-bs-toggle="modal" data-bs-target="#stockInModal">
                        <i class="bi bi-plus-circle-fill me-2"></i>Stock In
                    </button>
                    <button type="button" class="btn btn-danger me-2" data-bs-toggle="modal" data-bs-target="#stockOutModal">
                        <i class="bi bi-dash-circle-fill me-2"></i>Stock Out
                    </button>
                    <button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#stockReturnModal">
                        <i class="bi bi-arrow-return-left me-2"></i>Stock Return
                    </button>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>

