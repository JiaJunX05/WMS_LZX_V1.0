{{-- ==========================================
    颜色管理统计卡片组件
    功能：显示颜色管理相关的统计数据
    ========================================== --}}

{{-- 统计卡片区域 --}}
<div class="statistics-section mb-4">
    <div class="row g-4">
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <div class="stats-number" id="total-colors">{{ $totalColors ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Total Colors</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-primary icon-size-3rem">
                            <i class="bi bi-palette text-white fs-4"></i>
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
                            <div class="stats-number" id="active-colors">{{ $activeColors ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Available Colors</div>
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
                            <div class="stats-number" id="inactive-colors">{{ $inactiveColors ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Unavailable Colors</div>
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
                            <div class="stats-number" id="hex-colors">{{ $hexColors ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Hex Colors</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-info icon-size-3rem">
                            <i class="bi bi-hash text-white fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

