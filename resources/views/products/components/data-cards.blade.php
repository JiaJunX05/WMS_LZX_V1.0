{{-- ==========================================
    产品列表卡片区域
    功能：显示产品卡片列表和空状态
    ========================================== --}}

{{-- 产品列表区域 --}}
<div id="product-card-container" class="row g-4" data-url="{{ route('product.index') }}" data-view-url="{{ route('product.view', ['id' => ':id']) }}">
    {{-- 产品卡片将通过JavaScript动态加载 --}}
</div>

{{-- 空状态显示 --}}
<div id="empty-state" class="text-center p-5 d-none">
    <div class="mb-4">
        <i class="bi bi-box text-muted fs-1"></i>
    </div>
    <h4 class="text-secondary fw-semibold mb-3">No Product Data</h4>
    <p class="text-muted small mb-4">No products have been created in the system yet</p>
    <button type="button" class="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#createProductModal">
        <i class="bi bi-plus-circle-fill me-2"></i>Create First Product
    </button>
</div>

