{{-- ==========================================
    只读角色卡片组件
    功能：显示只读的角色信息（用于用户不能修改自己角色或其他限制的情况）
    参数：
    - $role: 角色值 (e.g., 'Staff', 'Admin', 'SuperAdmin')
    - $label: 标签文本 (e.g., 'User Role')
    - $helpText: 帮助文本（可选）
    ========================================== --}}

@php
    $role = $role ?? 'Staff';
    $label = $label ?? 'User Role';
    $helpText = $helpText ?? null;
@endphp

<div class="mb-4">
    <label class="form-label fw-bold">{{ $label }}</label>
    <div class="row g-3">
        <div class="col-12">
            <div class="card border">
                <div class="card-body d-flex align-items-center">
                    <div class="me-3">
                        <span class="badge {{ $role === 'SuperAdmin' ? 'bg-danger' : ($role === 'Admin' ? 'bg-warning' : 'bg-success') }} px-3 py-2">
                            <i class="bi {{ $role === 'SuperAdmin' ? 'bi-person-fill-gear' : ($role === 'Admin' ? 'bi-shield-check' : 'bi-person-badge') }} me-1"></i>
                            {{ $role === 'SuperAdmin' ? 'SUPER ADMIN' : ($role === 'Admin' ? 'ADMIN' : 'STAFF') }}
                        </span>
                    </div>
                    <div>
                        <h6 class="card-title mb-1">
                            @if($role === 'SuperAdmin')
                                Super Admin
                            @elseif($role === 'Admin')
                                Admin
                            @else
                                Staff
                            @endif
                        </h6>
                        <p class="card-text text-muted small mb-0">
                            @if($role === 'SuperAdmin')
                                Highest system permissions
                            @elseif($role === 'Admin')
                                Full management permissions
                            @else
                                Basic user permissions
                            @endif
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    @if(!empty($helpText))
    <div class="mt-3">
        <div class="alert alert-info alert-sm d-flex align-items-center" role="alert">
            <i class="bi bi-info-circle me-2"></i>
            <small>{{ $helpText }}</small>
        </div>
    </div>
    @endif
</div>

