{{-- ==========================================
    分类映射查看页面头部组件
    功能：显示分类映射查看页面头部导航
    ========================================== --}}

{{-- 页面头部导航 --}}
<div class="dashboard-header mb-4">
    <div class="card shadow-sm border-0">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <div class="d-flex align-items-center">
                        <div class="header-icon-wrapper d-flex align-items-center justify-content-center me-4">
                            <i class="bi bi-diagram-2-fill text-white display-6"></i>
                        </div>
                        <div>
                            <h2 class="h3 fw-bold mb-1">{{ isset($category) ? "View {$category->category_name} Mappings" : 'View Category Mapping' }}</h2>
                            <p class="text-muted mb-0" id="dashboard-subtitle">{{ isset($category) ? "View all subcategory mappings for {$category->category_name}" : 'View category mapping details' }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 text-lg-end">
                    <a href="{{ route('admin.mapping.index') }}" class="btn btn-primary">
                        <i class="bi bi-arrow-left me-2"></i>Back to List
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

