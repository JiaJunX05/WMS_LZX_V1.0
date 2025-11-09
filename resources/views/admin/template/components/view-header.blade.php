{{-- ==========================================
    尺码模板查看页面头部组件
    功能：显示尺码模板查看页面头部导航
    ========================================== --}}

{{-- 页面头部导航 --}}
<div class="dashboard-header mb-4">
    <div class="card shadow-sm border-0">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <div class="d-flex align-items-center">
                        <div class="header-icon-wrapper d-flex align-items-center justify-content-center me-4">
                            <i class="bi bi-layout-text-window-reverse text-white display-6"></i>
                        </div>
                        <div>
                            <h2 class="h3 fw-bold mb-1">{{ isset($category) && isset($gender) ? "View {$category->category_name} ({$gender}) Size Template" : 'View Size Template' }}</h2>
                            <p class="text-muted mb-0" id="dashboard-subtitle">{{ isset($category) && isset($gender) ? "View size templates for {$category->category_name} category and {$gender} gender" : 'View template configuration and size values' }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 text-lg-end">
                    <a href="{{ route('admin.template.index') }}" class="btn btn-primary">
                        <i class="bi bi-arrow-left me-2"></i>Back to List
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

