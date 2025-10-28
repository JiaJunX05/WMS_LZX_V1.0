{{-- ==========================================
    通用状态选择器组件
    功能：提供标准化的状态选择（Available/Unavailable）
    参数：
    - $fieldName: 字段名称 (e.g., 'product_status', 'zone_status')
    - $currentStatus: 当前状态值 (e.g., 'Available' or 'Unavailable')
    - $label: 标签文本 (e.g., 'Product Status', 'Zone Status')
    - $helpText: 帮助文本（可选）
    ========================================== --}}

@php
    $fieldName = $fieldName ?? 'status';
    $currentStatus = $currentStatus ?? 'Available';
    $label = $label ?? 'Status';
    $helpText = $helpText ?? 'Choose whether this item can be used for management';
@endphp

<div class="mb-4">
    <label class="form-label fw-bold text-dark mb-3">{{ $label }}</label>
    <div class="row g-3">
        {{-- 可用状态选项 --}}
        <div class="col-md-6">
            <div class="card h-100 border status-card {{ $currentStatus === 'Available' ? 'selected' : '' }}" data-status="Available">
                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                    <input type="radio" name="{{ $fieldName }}" value="Available" class="form-check-input me-3"
                           {{ old($fieldName, $currentStatus) === 'Available' ? 'checked' : '' }}>
                    <div>
                        <h6 class="card-title mb-1">
                            <i class="bi bi-check-circle me-2 text-success"></i>Available
                        </h6>
                        <p class="card-text text-muted small mb-0">This item is active and can be used</p>
                    </div>
                </label>
            </div>
        </div>

        {{-- 不可用状态选项 --}}
        <div class="col-md-6">
            <div class="card h-100 border status-card {{ $currentStatus === 'Unavailable' ? 'selected' : '' }}" data-status="Unavailable">
                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                    <input type="radio" name="{{ $fieldName }}" value="Unavailable" class="form-check-input me-3"
                           {{ old($fieldName, $currentStatus) === 'Unavailable' ? 'checked' : '' }}>
                    <div>
                        <h6 class="card-title mb-1">
                            <i class="bi bi-x-circle me-2 text-danger"></i>Unavailable
                        </h6>
                        <p class="card-text text-muted small mb-0">This item is inactive and cannot be used</p>
                    </div>
                </label>
            </div>
        </div>
    </div>
    @if(!empty($helpText))
    <div class="form-text">
        <i class="bi bi-info-circle me-1"></i>
        {{ $helpText }}
    </div>
    @endif
</div>

