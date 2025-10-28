{{-- ==========================================
    通用已扫描产品区域组件
    支持 stock_in, stock_out, stock_return
    ========================================== --}}

@props([
    'type' => 'stock_in', // stock_in, stock_out, stock_return
])

@php
    // 根据类型设置不同的样式和文本
    $badgeClass = match($type) {
        'stock_in' => 'bg-success',
        'stock_out' => 'bg-danger',
        'stock_return' => 'bg-warning text-dark',
        default => 'bg-primary'
    };

    $buttonClass = match($type) {
        'stock_in' => 'btn-success',
        'stock_out' => 'btn-danger',
        'stock_return' => 'btn-warning',
        default => 'btn-primary'
    };

    $buttonOnClick = match($type) {
        'stock_in' => 'submitStockIn()',
        'stock_out' => 'submitStockOut()',
        'stock_return' => 'submitStockReturn()',
        default => 'submitStock()'
    };

    $buttonText = match($type) {
        'stock_in' => 'Submit Stock In',
        'stock_out' => 'Submit Stock Out',
        'stock_return' => 'Submit Stock Return',
        default => 'Submit'
    };

    $placeholder = match($type) {
        'stock_in' => 'e.g., PO-2024-001, INV-001',
        'stock_out' => 'e.g., SO-2024-001, OUT-001',
        'stock_return' => 'e.g., RT-2024-001, RET-001',
        default => 'e.g., REF-001'
    };

    $formText = match($type) {
        'stock_in' => 'Required reference number for tracking this stock in batch',
        'stock_out' => 'Required reference number for tracking this stock out batch',
        'stock_return' => 'Required reference number for tracking this stock return batch',
        default => 'Required reference number for tracking this batch'
    };

    $emptyStateText = match($type) {
        'stock_in' => 'Start scanning product barcodes to add them to the stock in list',
        'stock_out' => 'Start scanning product barcodes to add them to the stock out list',
        'stock_return' => 'Start scanning product barcodes to add them to the stock return list',
        default => 'Start scanning product barcodes'
    };
@endphp

{{-- 已扫描产品表格 --}}
<div class="card shadow-sm border-0 d-none" id="scanned-products-card">
    <div class="card-header bg-transparent border-0 pb-3 mb-3">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-3">
                <h5 class="mb-0 fw-semibold">Scanned Products</h5>
                <span class="badge {{ $badgeClass }}" id="scanned-products-count">0 products</span>
            </div>
            <div class="d-flex gap-2">
                <span class="badge bg-primary fs-6 me-2" id="scanned-count">0 items scanned</span>
                <button class="btn btn-outline-danger btn-sm" id="clear-all-btn" disabled>
                    <i class="bi bi-trash me-1"></i>
                    Clear All
                </button>
            </div>
        </div>
    </div>
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4" style="width: 10%"><div class="fw-bold text-muted small text-uppercase">#</div></th>
                        <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">IMAGE</div></th>
                        <th style="width: 30%"><div class="fw-bold text-muted small text-uppercase">PRODUCT NAME</div></th>
                        <th style="width: 20%"><div class="fw-bold text-muted small text-uppercase">SKU CODE</div></th>
                        <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">CURRENT STOCK</div></th>
                        <th style="width: 10%"><div class="fw-bold text-muted small text-uppercase">QUANTITY</div></th>
                        <th class="text-end pe-4" style="width: 10%"><div class="fw-bold text-muted small text-uppercase">ACTION</div></th>
                    </tr>
                </thead>
                <tbody id="scanned-products-table-body">
                    {{-- 动态生成已扫描产品 --}}
                </tbody>
            </table>
        </div>
    </div>
</div>

{{-- 空状态 --}}
<div class="card shadow-sm border-0" id="empty-state-card">
    <div class="card-body text-center py-5">
        <i class="bi bi-upc-scan display-1 text-muted mb-3"></i>
        <h5 class="text-muted mb-2">No Products Scanned Yet</h5>
        <p class="text-muted mb-0">{{ $emptyStateText }}</p>
    </div>
</div>

{{-- 提交区域 --}}
<div class="card shadow-sm border-0 mt-4 d-none" id="submit-section">
    <div class="card-body">
        <div class="mb-3">
            <label for="reference-number" class="form-label fw-medium">
                <i class="bi bi-tag text-primary me-1"></i>
                Reference Number <span class="text-danger">*</span>
            </label>
            <input type="text" class="form-control" id="reference-number" required
                   placeholder="{{ $placeholder }}">
            <div class="form-text">{{ $formText }}</div>
        </div>

        <button class="btn {{ $buttonClass }} w-100" onclick="{{ $buttonOnClick }}" id="submit-btn">
            <i class="bi bi-check-circle me-2"></i>
            {{ $buttonText }}
        </button>
    </div>
</div>
