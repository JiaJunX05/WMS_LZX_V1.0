{{-- ==========================================
    通用角色选择器组件
    功能：提供标准化的角色选择（Staff/Admin/SuperAdmin）
    参数：
    - $fieldName: 字段名称 (e.g., 'account_role')
    - $currentRole: 当前角色值 (e.g., 'Staff', 'Admin', 'SuperAdmin')
    - $label: 标签文本 (e.g., 'User Role')
    - $helpText: 帮助文本（可选）
    - $availableRoles: 可选角色数组（可选，默认为全部）
    ========================================== --}}

@php
    $fieldName = $fieldName ?? 'account_role';
    $currentRole = $currentRole ?? 'Staff';
    $label = $label ?? 'User Role';
    $helpText = $helpText ?? 'Choose the user role';
    $availableRoles = $availableRoles ?? ['Staff', 'Admin', 'SuperAdmin'];
@endphp

<div class="mb-4">
    <label class="form-label fw-bold text-dark mb-3">{{ $label }}</label>
    <div class="row g-3">
        {{-- Staff 角色选项 --}}
        @if(in_array('Staff', $availableRoles))
        <div class="col-lg-4 col-md-6 col-sm-12">
            <div class="card h-100 border role-card {{ $currentRole === 'Staff' ? 'selected' : '' }}" data-role="Staff">
                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                    <input type="radio" name="{{ $fieldName }}" value="Staff" class="form-check-input me-3"
                           {{ old($fieldName, $currentRole) === 'Staff' ? 'checked' : '' }}>
                    <div>
                        <h6 class="card-title mb-1 fw-semibold">
                            <i class="bi bi-person-badge me-2 text-success"></i>Staff
                        </h6>
                        <p class="card-text text-muted small mb-0">Basic user permissions</p>
                    </div>
                </label>
            </div>
        </div>
        @endif

        {{-- Admin 角色选项 --}}
        @if(in_array('Admin', $availableRoles))
        <div class="col-lg-4 col-md-6 col-sm-12">
            <div class="card h-100 border role-card {{ $currentRole === 'Admin' ? 'selected' : '' }}" data-role="Admin">
                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                    <input type="radio" name="{{ $fieldName }}" value="Admin" class="form-check-input me-3"
                           {{ old($fieldName, $currentRole) === 'Admin' ? 'checked' : '' }}>
                    <div>
                        <h6 class="card-title mb-1 fw-semibold">
                            <i class="bi bi-shield-check me-2 text-warning"></i>Admin
                        </h6>
                        <p class="card-text text-muted small mb-0">Full management permissions</p>
                    </div>
                </label>
            </div>
        </div>
        @endif

        {{-- SuperAdmin 角色选项 --}}
        @if(in_array('SuperAdmin', $availableRoles))
        <div class="col-lg-4 col-md-6 col-sm-12">
            <div class="card h-100 border role-card {{ $currentRole === 'SuperAdmin' ? 'selected' : '' }}" data-role="SuperAdmin">
                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                    <input type="radio" name="{{ $fieldName }}" value="SuperAdmin" class="form-check-input me-3"
                           {{ old($fieldName, $currentRole) === 'SuperAdmin' ? 'checked' : '' }}>
                    <div>
                        <h6 class="card-title mb-1 fw-semibold">
                            <i class="bi bi-person-fill-gear me-2 text-danger"></i>Super Admin
                        </h6>
                        <p class="card-text text-muted small mb-0">Highest system permissions</p>
                    </div>
                </label>
            </div>
        </div>
        @endif
    </div>
    @if(!empty($helpText))
    <div class="form-text">
        <i class="bi bi-info-circle me-1"></i>
        {{ $helpText }}
    </div>
    @endif
</div>

