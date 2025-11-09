{{-- ==========================================
    分类映射列表卡片组件
    功能：显示分类映射列表卡片和空状态
    ========================================== --}}

{{-- 主要内容区域 --}}
<div class="row g-4" id="dashboard-cards-container">
    {{-- 分类映射卡片将通过JavaScript动态加载 --}}
</div>

{{-- 空状态显示 --}}
<div id="empty-state" class="text-center p-5 d-none">
    <div class="mb-4">
        <i class="bi bi-diagram-2 text-muted fs-1"></i>
    </div>
    <h4 class="text-secondary fw-semibold mb-3">No Category Mapping Data</h4>
    <p class="text-muted small mb-4">No category mappings have been created in the system yet</p>
    <button type="button" class="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#createMappingModal">
        <i class="bi bi-plus-circle-fill me-2"></i>Create First Mapping
    </button>
</div>

