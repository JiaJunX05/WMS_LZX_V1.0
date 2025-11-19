{{-- ==========================================
    库存管理统计卡片组件
    功能：显示库存管理相关的统计数据
    ========================================== --}}

{{-- 库存管理统计卡片区域 --}}
<div class="statistics-section mb-4">
    <div class="row g-4">
        <!-- Total Stock In -->
        <div class="col-xl col-lg-3 col-md-4 col-sm-6">
            <div class="stats-card">
                <div class="stats-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <div class="stats-number" id="totalStockIn">0</div>
                            <div class="small text-muted fw-medium text-uppercase">Total Stock In</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-success icon-size-3rem">
                            <i class="bi bi-arrow-up-circle-fill text-white fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Total Stock Out -->
        <div class="col-xl col-lg-3 col-md-4 col-sm-6">
            <div class="stats-card">
                <div class="stats-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <div class="stats-number" id="totalStockOut">0</div>
                            <div class="small text-muted fw-medium text-uppercase">Total Stock Out</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-danger icon-size-3rem">
                            <i class="bi bi-arrow-down-circle-fill text-white fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Total Stock Return -->
        <div class="col-xl col-lg-3 col-md-4 col-sm-6">
            <div class="stats-card">
                <div class="stats-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <div class="stats-number" id="totalStockReturn">0</div>
                            <div class="small text-muted fw-medium text-uppercase">Total Stock Return</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-warning icon-size-3rem">
                            <i class="bi bi-arrow-return-left text-white fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Total Low Stock -->
        <div class="col-xl col-lg-3 col-md-4 col-sm-6">
            <div class="stats-card">
                <div class="stats-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <div class="stats-number" id="lowStockCount">0</div>
                            <div class="small text-muted fw-medium text-uppercase">Total Low Stock</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-warning icon-size-3rem">
                            <i class="bi bi-exclamation-triangle-fill text-white fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Current Stock -->
        <div class="col-xl col-lg-3 col-md-4 col-sm-6">
            <div class="stats-card">
                <div class="stats-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <div class="stats-number" id="currentTotalStock">0</div>
                            <div class="small text-muted fw-medium text-uppercase">Current Stock</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-secondary icon-size-3rem">
                            <i class="bi bi-box-seam text-white fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
