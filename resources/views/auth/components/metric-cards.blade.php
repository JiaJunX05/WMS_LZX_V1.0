{{-- ==========================================
    用户管理统计卡片组件
    功能：显示用户管理相关的统计数据
    ========================================== --}}

{{-- 用户统计卡片区域 --}}
<div class="statistics-section mb-4">
    <div class="row g-4">
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <div class="stats-number" id="total-users">{{ $totalUsers ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Total Users</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-primary icon-size-3rem">
                            <i class="bi bi-people text-white fs-4"></i>
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
                            <div class="stats-number" id="active-users">{{ $activeUsers ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Available Users</div>
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
                            <div class="stats-number" id="inactive-users">{{ $inactiveUsers ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Unavailable Users</div>
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
                            <div class="stats-number" id="admin-users">{{ $adminUsers ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Admin Users</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-info icon-size-3rem">
                            <i class="bi bi-shield-check text-white fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

