{{-- ==========================================
    位置查看页面头部组件
    功能：显示位置查看页面头部导航
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
                            <h2 class="h3 fw-bold mb-1">{{ isset($zone) ? "View {$zone->zone_name} Locations" : 'View Storage Location' }}</h2>
                            <p class="text-muted mb-0" id="dashboard-subtitle">{{ isset($zone) ? "View all storage locations in {$zone->zone_name}" : 'View storage location details' }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 text-lg-end">
                    <a href="{{ route('admin.location.index') }}" class="btn btn-primary">
                        <i class="bi bi-arrow-left me-2"></i>Back to List
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

