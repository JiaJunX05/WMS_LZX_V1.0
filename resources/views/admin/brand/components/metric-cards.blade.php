{{-- ==========================================
    品牌管理统计卡片组件
    功能：显示品牌管理相关的统计数据
    ========================================== --}}

{{-- 统计卡片区域 --}}
<div class="statistics-section mb-4">
    <div class="row g-4">
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <div class="stats-number" id="total-brands">{{ $totalBrands ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Total Brands</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-primary icon-size-3rem">
                            <i class="bi bi-tag text-white fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <div class="stats-number" id="active-brands">{{ $activeBrands ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Available Brands</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-success icon-size-3rem">
                            <i class="bi bi-check-circle text-white fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <div class="stats-number" id="inactive-brands">{{ $inactiveBrands ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Unavailable Brands</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-warning icon-size-3rem">
                            <i class="bi bi-pause-circle text-white fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <div class="stats-number" id="brands-with-image">{{ $brandsWithImage ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">With Images</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-info icon-size-3rem">
                            <i class="bi bi-image text-white fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

