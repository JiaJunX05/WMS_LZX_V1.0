{{-- ==========================================
    通用扫描器模板
    功能：可重用的条形码扫描器
    参数：
    - $bgClass: 背景颜色类
    - $iconColor: 图标颜色类
    - $buttonIcon: 按钮图标类
    ========================================== --}}

@php
    $bgClass = $bgClass ?? 'bg-success';
    $iconColor = $iconColor ?? 'text-success';
    $buttonIcon = $buttonIcon ?? 'bi-check-circle text-success';
@endphp

<div class="card shadow-sm border-0 mb-4">
    <div class="card-header {{ $bgClass }}">
        <h5 class="mb-0">
            <i class="bi bi-upc-scan me-2"></i>
            Barcode Scanner
        </h5>
    </div>
    <div class="card-body">
        <div class="input-group mb-3">
            <span class="input-group-text bg-light">
                <i class="bi bi-upc-scan {{ $iconColor }}"></i>
            </span>
            <input type="text" class="form-control" id="barcode-scanner"
                   placeholder="Please scan barcode using scanner..." aria-label="Barcode Scanner">
            <span class="input-group-text">
                <i class="{{ $buttonIcon }}">Scan Barcode</i>
            </span>
        </div>
        <div class="form-text mt-2">
            <i class="bi bi-info-circle me-1"></i>
            Please use scanner to scan barcode (manual input disabled)
        </div>
    </div>
</div>

