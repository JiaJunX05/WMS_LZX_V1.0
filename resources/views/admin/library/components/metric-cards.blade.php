{{-- ==========================================
    尺码库管理统计卡片组件
    功能：显示尺码库管理相关的统计数据
    ========================================== --}}

{{-- 统计卡片区域 --}}
<div class="statistics-section mb-4">
    <div class="row g-4">
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <div class="stats-number" id="total-libraries">{{ $totalLibraries ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Total Libraries</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-primary icon-size-3rem">
                            <i class="bi bi-collection text-white fs-4"></i>
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
                            <div class="stats-number" id="active-libraries">{{ $activeLibraries ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Available Libraries</div>
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
                            <div class="stats-number" id="inactive-libraries">{{ $inactiveLibraries ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Unavailable Libraries</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-danger icon-size-3rem">
                            <i class="bi bi-x-circle text-white fs-4"></i>
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
                            <div class="stats-number" id="library-groups">{{ $libraryGroups ?? ($sizeLibraries ? count($sizeLibraries->groupBy('category_id')) : 0) }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Total Groups</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-info icon-size-3rem">
                            <i class="bi bi-tags text-white fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

