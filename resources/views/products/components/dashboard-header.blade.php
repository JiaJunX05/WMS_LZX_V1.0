{{-- ==========================================
    产品管理仪表板头部
    功能：显示产品管理页面的头部导航
    ========================================== --}}

<div class="dashboard-header mb-4">
    <div class="card shadow-sm border-0">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="{{ Auth::user()->getAccountRole() === 'Admin' ? 'col-lg-8' : 'col-12' }}">
                    <div class="d-flex align-items-center">
                        <div class="header-icon-wrapper d-flex align-items-center justify-content-center me-4">
                            <i class="bi bi-box-seam text-white display-6"></i>
                        </div>
                        <div>
                            <h2 class="h3 fw-bold mb-1">Product Management</h2>
                            <p class="text-muted mb-0" id="dashboard-subtitle">Manage products and inventory</p>
                        </div>
                    </div>
                </div>
                @if(Auth::user()->getAccountRole() === 'Admin')
                <div class="col-lg-4 text-lg-end">
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createProductModal">
                        <i class="bi bi-plus-circle-fill me-2"></i>Create Product
                    </button>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>

