{{-- ==========================================
    用户创建表单模板
    功能：创建新用户的表单模板
    参数：
    - $formAction: 表单提交地址
    - $formId: 表单ID
    - $badgeText: 配置面板徽章文本
    - $formTitle: 表单标题
    - $formSubtitle: 表单副标题
    - $submitButtonText: 提交按钮文本
    - $submitButtonClass: 提交按钮样式类
    - $cancelUrl: 取消按钮链接
    - $showRoleSelection: 是否显示角色选择
    - $showStatusSelection: 是否显示状态选择
    ========================================== --}}

@php
    $formAction = $formAction ?? '#';
    $formId = $formId ?? 'userCreateForm';
    $badgeText = $badgeText ?? 'Create';
    $formTitle = $formTitle ?? 'Create User Information';
    $formSubtitle = $formSubtitle ?? 'Fill in user information below.';
    $submitButtonText = $submitButtonText ?? 'Create User';
    $submitButtonClass = $submitButtonClass ?? 'btn-primary';
    $cancelUrl = $cancelUrl ?? '#';
    $showRoleSelection = $showRoleSelection ?? true;
    $showStatusSelection = $showStatusSelection ?? false;
@endphp

<form action="{{ $formAction }}" method="post" id="{{ $formId }}" enctype="multipart/form-data">
    @csrf

    <div class="card shadow-sm border-0">
        <div class="row g-0">

            {{-- ==========================================
                左侧配置面板
                ========================================== --}}
            <div class="col-md-4">
                <div class="config-section d-flex flex-column h-100 bg-light p-4">

                    {{-- 配置区域标题 --}}
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-gear-fill me-2"></i>Configuration
                        </h6>
                        <span class="badge bg-white text-dark border px-3 py-2">{{ $badgeText }}</span>
                    </div>

                    {{-- 用户头像上传区域 --}}
                    <div class="mb-4">
                        <label class="form-label">Profile Image</label>
                        <div class="img-upload-area" id="user-image-area">
                            <div class="upload-placeholder" id="user-upload-placeholder">
                                <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                <h5 class="mt-3">Click to upload image</h5>
                                <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                            </div>
                            <img id="user-preview" class="img-preview d-none" alt="User Preview">
                            <button type="button" class="img-remove-btn d-none" id="remove-user-image"><i class="bi bi-trash"></i></button>
                        </div>
                        <input type="file" class="d-none" id="user_image" name="user_image" accept="image/*">
                    </div>
                </div>
            </div>

            {{-- ==========================================
                右侧表单区域
                ========================================== --}}
            <div class="col-md-8">
                <div class="size-values-section p-4">

                    {{-- 表单标题 --}}
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h6 class="mb-0 fw-bold">
                                <i class="bi bi-person-plus me-2"></i>{{ $formTitle }}
                            </h6>
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i>
                                {{ $formSubtitle }}
                            </small>
                        </div>
                    </div>

                    <div class="card border-0 bg-white shadow-sm">
                        <div class="card-body p-4">

                            {{-- ==========================================
                                基本信息表单字段
                                ========================================== --}}

                            {{-- 用户名输入 --}}
                            <div class="col-12 mb-4">
                                <label class="form-label fw-bold text-dark mb-2">
                                    <i class="bi bi-at me-2 text-primary"></i>Username
                                </label>
                                <input type="text" class="form-control" id="username" name="username"
                                    value="{{ old('username') }}" placeholder="Enter username" required>
                                <div class="form-text">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Enter the user's username
                                </div>
                            </div>

                            {{-- 姓名输入（分为名字和姓氏） --}}
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-person me-2 text-primary"></i>First Name
                                    </label>
                                    <input type="text" class="form-control" id="first_name" name="first_name"
                                        value="{{ old('first_name') }}" placeholder="Enter first name" required>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Enter the user's first name.
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-person me-2 text-primary"></i>Last Name
                                    </label>
                                    <input type="text" class="form-control" id="last_name" name="last_name"
                                        value="{{ old('last_name') }}" placeholder="Enter last name" required>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Enter the user's last name.
                                    </div>
                                </div>
                            </div>

                            {{-- 邮箱地址输入 --}}
                            <div class="col-12 mb-4">
                                <label class="form-label fw-bold text-dark mb-2">
                                    <i class="bi bi-envelope me-2 text-primary"></i>Email Address
                                </label>
                                <input type="email" class="form-control" id="email" name="email"
                                    value="{{ old('email') }}" placeholder="Enter email address" required>
                                <div class="form-text">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Enter a valid email address
                                </div>
                            </div>

                            {{-- ==========================================
                                密码输入区域
                                ========================================== --}}
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-lock me-2 text-primary"></i>Password
                                    </label>
                                    <div class="input-group">
                                        <input type="password" class="form-control" id="password" name="password"
                                            placeholder="Enter password" required>
                                        <span class="input-group-text" role="button" onclick="togglePassword('password', 'togglePassword')">
                                            <i class="bi bi-eye-slash text-primary" id="togglePassword"></i>
                                        </span>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Enter a secure password
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-shield-lock me-2 text-primary"></i>Confirm Password
                                    </label>
                                    <div class="input-group">
                                        <input type="password" class="form-control" id="password_confirmation" name="password_confirmation"
                                            placeholder="Confirm password" required>
                                        <span class="input-group-text" role="button" onclick="togglePassword('password_confirmation', 'togglePasswordConfirm')">
                                            <i class="bi bi-eye-slash text-primary" id="togglePasswordConfirm"></i>
                                        </span>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Enter the password again
                                    </div>
                                </div>
                            </div>

                            @if($showRoleSelection)
                                {{-- ==========================================
                                    用户角色设置区域
                                    ========================================== --}}
                                @php
                                    $currentUserRole = Auth::user()->getAccountRole();
                                @endphp

                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-3">User Role</label>
                                    <div class="row g-3">

                                        {{-- 员工角色选项（默认选中） --}}
                                        <div class="col-lg-4 col-md-6 col-sm-12">
                                            <div class="card h-100 border role-card selected" data-role="Staff">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="account_role" value="Staff" class="form-check-input me-3" checked>
                                                    <div class="flex-fill">
                                                        <h6 class="card-title mb-1 fw-semibold">
                                                            <i class="bi bi-person-badge me-2 text-success"></i>Staff
                                                        </h6>
                                                        <p class="card-text text-muted small mb-0">Basic user permissions</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {{-- 超级管理员可以设置管理员和超级管理员角色 --}}
                                        @if($currentUserRole === 'SuperAdmin')

                                            {{-- 管理员角色选项 --}}
                                            <div class="col-lg-4 col-md-6 col-sm-12">
                                                <div class="card h-100 border role-card" data-role="Admin">
                                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                        <input type="radio" name="account_role" value="Admin" class="form-check-input me-3">
                                                        <div class="flex-fill">
                                                            <h6 class="card-title mb-1 fw-semibold">
                                                                <i class="bi bi-shield-check me-2 text-warning"></i>Admin
                                                            </h6>
                                                            <p class="card-text text-muted small mb-0">Full management permissions</p>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            {{-- 超级管理员角色选项 --}}
                                            <div class="col-lg-4 col-md-6 col-sm-12">
                                                <div class="card h-100 border role-card" data-role="SuperAdmin">
                                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                        <input type="radio" name="account_role" value="SuperAdmin" class="form-check-input me-3">
                                                        <div class="flex-fill">
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
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Choose the user's role and permissions
                                    </div>
                                </div>
                            @endif

                            @if($showStatusSelection)
                                {{-- ==========================================
                                    账户状态设置区域
                                    ========================================== --}}
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-3">Account Status</label>
                                    <div class="row g-3">

                                        {{-- 可用状态选项（默认选中） --}}
                                        <div class="col-md-6">
                                            <div class="card h-100 border status-card selected" data-status="Available">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="account_status" value="Available" class="form-check-input me-3" checked>
                                                    <div class="flex-fill">
                                                        <h6 class="card-title mb-1 fw-semibold">
                                                            <i class="bi bi-check-circle me-2 text-success"></i>Available
                                                        </h6>
                                                        <p class="card-text text-muted small mb-0">User can login and use normally</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {{-- 不可用状态选项 --}}
                                        <div class="col-md-6">
                                            <div class="card h-100 border status-card" data-status="Unavailable">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="account_status" value="Unavailable" class="form-check-input me-3">
                                                    <div class="flex-fill">
                                                        <h6 class="card-title mb-1 fw-semibold">
                                                            <i class="bi bi-x-circle me-2 text-danger"></i>Unavailable
                                                        </h6>
                                                        <p class="card-text text-muted small mb-0">User cannot login to the system</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Choose whether the user can access the system
                                    </div>
                                </div>
                            @endif

                            {{-- ==========================================
                                表单操作按钮
                                ========================================== --}}
                            <div class="d-flex gap-3 mt-4">
                                <button type="submit" class="btn {{ $submitButtonClass }} flex-fill">
                                    <i class="bi bi-check-circle me-2"></i>{{ $submitButtonText }}
                                </button>
                                <a href="{{ $cancelUrl }}" class="btn btn-outline-secondary">
                                    <i class="bi bi-x-circle me-2"></i>Cancel
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
