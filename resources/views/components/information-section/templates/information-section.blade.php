{{-- ==========================================
    产品信息卡片模板
    功能：可重用的产品信息卡片显示
    参数：
    - $title: 卡片标题
    - $imageId: 图片元素的ID
    - $nameId: 产品名称元素的ID
    - $stockId: 库存元素的ID
    - $statusId: 状态元素的ID
    ========================================== --}}

@php
    $title = $title ?? 'Product Information';
    $imageId = $imageId ?? 'product-image';
    $nameId = $nameId ?? 'product-name';
    $stockId = $stockId ?? 'current-stock';
    $statusId = $statusId ?? 'product-status';
@endphp

<div class="card shadow-sm border-0 mb-4">
    <div class="card-header bg-transparent border-0 pb-3">
        <h5 class="mb-0 fw-semibold">{{ $title }}</h5>
    </div>
    <div class="card-body">
        <div class="row align-items-center">
            <div class="col-lg-4 text-center">
                <img id="{{ $imageId }}" src="{{ asset('assets/img/no-image.png') }}"
                     alt="Product Image" class="img-fluid rounded shadow-sm"
                     style="max-width: 180px; max-height: 180px; object-fit: cover;">
            </div>
            <div class="col-lg-8">
                <div class="row g-4">
                    <div class="col-12">
                        <label class="form-label fw-medium text-muted mb-2">Product Name</label>
                        <h4 class="mb-0" id="{{ $nameId }}">-</h4>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-medium text-muted mb-2">Current Stock</label>
                        <div class="d-flex align-items-center">
                            <span class="fs-3 fw-bold me-2" id="{{ $stockId }}">-</span>
                            <small class="text-muted">units</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-medium text-muted mb-2">Status</label>
                        <div>
                            <span class="badge fs-6" id="{{ $statusId }}">-</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

