{{-- ==========================================
    只读状态卡片组件
    功能：显示只读的状态信息（用于用户不能修改自己状态的情况）
    参数：
    - $status: 状态值 (e.g., 'Available' or 'Unavailable')
    - $label: 标签文本 (e.g., 'Account Status')
    - $helpText: 帮助文本（可选）
    ========================================== --}}

@php
    $status = $status ?? 'Available';
    $label = $label ?? 'Status';
    $helpText = $helpText ?? null;
@endphp

<div class="mb-4">
    <label class="form-label fw-bold text-dark mb-3">{{ $label }}</label>
    <div class="row g-3">
        <div class="col-12">
            <div class="card border">
                <div class="card-body d-flex align-items-center">
                    <div class="me-3">
                        @if($status === 'Available')
                            <i class="bi bi-check-circle text-success fs-4"></i>
                        @else
                            <i class="bi bi-x-circle text-danger fs-4"></i>
                        @endif
                    </div>
                    <div>
                        <h6 class="card-title mb-1">
                            {{ $status === 'Available' ? 'Available' : 'Unavailable' }}
                        </h6>
                        <p class="card-text text-muted small mb-0">
                            {{ $status === 'Available' ? 'User can login and use normally' : 'User cannot login to the system' }}
                        </p>
                    </div>
                </div>
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

