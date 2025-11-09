{{-- ==========================================
    区域管理页面头部组件
    功能：显示区域管理页面头部导航
    ========================================== --}}

{{-- 页面头部导航 --}}
<div class="dashboard-header mb-4">
    <div class="card shadow-sm border-0">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <div class="d-flex align-items-center">
                        <div class="header-icon-wrapper d-flex align-items-center justify-content-center me-4">
                            <i class="bi bi-geo-alt-fill text-white display-6"></i>
                        </div>
                        <div>
                            <h2 class="h3 fw-bold mb-1">Zone Management</h2>
                            <p class="text-muted mb-0" id="dashboard-subtitle">Manage and organize storage zones</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 text-lg-end">
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createZoneModal">
                        <i class="bi bi-plus-circle-fill me-2"></i>Add Zone
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

