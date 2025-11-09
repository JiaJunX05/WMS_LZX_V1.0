{{-- ==========================================
    分类映射管理统计卡片组件
    功能：显示分类映射管理相关的统计数据
    ========================================== --}}

{{-- 统计卡片区域 --}}
<div class="statistics-section mb-4">
    <div class="row g-4">
        <div class="col-xl-3 col-md-6">
            <div class="stats-card">
                <div class="stats-card-body">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <div class="stats-number" id="total-mappings">{{ $totalMappings ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Total Mappings</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-primary icon-size-3rem">
                            <i class="bi bi-diagram-2 text-white fs-4"></i>
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
                            <div class="stats-number" id="available-categories">{{ $availableCategories ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Available Categories</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-success icon-size-3rem">
                            <i class="bi bi-folder text-white fs-4"></i>
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
                            <div class="stats-number" id="available-subcategories">{{ $availableSubcategories ?? 0 }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Available Subcategories</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-info icon-size-3rem">
                            <i class="bi bi-folder2 text-white fs-4"></i>
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
                            <div class="stats-number" id="mapping-groups">{{ $mappingGroups ?? ($mappings ? count($mappings->groupBy('category_id')) : 0) }}</div>
                            <div class="small text-muted fw-medium text-uppercase">Total Groups</div>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded bg-warning icon-size-3rem">
                            <i class="bi bi-collection text-white fs-4"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

