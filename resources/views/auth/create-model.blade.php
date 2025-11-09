{{-- ==========================================
    创建用户 Modal
    功能：在 modal 中创建新用户账户
    ========================================== --}}

<div class="modal fade" id="createUserModal" tabindex="-1" aria-labelledby="createUserModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="createUserModalLabel">
                    <i class="bi bi-person-plus me-2"></i>Create New User
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form action="{{ route('register.submit') }}" method="post" id="createUserForm" enctype="multipart/form-data">
                    @csrf

                    <div class="row g-0">
                        {{-- 左侧配置面板 --}}
                        <div class="col-md-4">
                            <div class="config-section d-flex flex-column h-100 bg-light p-4">
                                {{-- 配置区域标题 --}}
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <h6 class="mb-0 fw-bold text-primary">
                                        <i class="bi bi-gear-fill me-2"></i>Configuration
                                    </h6>
                                    <span class="badge bg-white text-dark border px-3 py-2">Create</span>
                                </div>

                                {{-- 用户头像上传区域 --}}
                                <div class="mb-4">
                                    <label class="form-label">Profile Image</label>
                                    <div class="img-upload-area" id="create-user-image-area">
                                        <div class="img-upload-content" id="create-user-image-upload-content">
                                            <i class="bi bi-cloud-upload fs-1 text-muted mb-3" id="create-user-preview-icon"></i>
                                            <h6 class="text-muted">Click to upload image</h6>
                                            <p class="text-muted small">Supports JPG, PNG, GIF formats</p>
                                        </div>
                                        <img id="create-user-preview" class="img-preview d-none" alt="User Preview">
                                    </div>
                                    <input type="file" class="d-none" id="create_user_image" name="user_image" accept="image/*">
                                </div>

                                {{-- 信息提示卡片 --}}
                                <div class="alert alert-info border-0 mb-0">
                                    <div class="d-flex align-items-center mb-2">
                                        <i class="bi bi-info-circle-fill me-2"></i>
                                        <strong>Quick Tips</strong>
                                    </div>
                                    <div class="small">
                                        <div class="mb-1">
                                            <i class="bi bi-check-circle me-2 text-muted"></i>
                                            <span>Username must be unique</span>
                                        </div>
                                        <div class="mb-1">
                                            <i class="bi bi-check-circle me-2 text-muted"></i>
                                            <span>Email address must be valid</span>
                                        </div>
                                        <div>
                                            <i class="bi bi-check-circle me-2 text-muted"></i>
                                            <span>Profile image is optional</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {{-- 右侧表单区域 --}}
                        <div class="col-md-8">
                            <div class="size-values-section p-4">
                                {{-- 表单标题 --}}
                                <div class="d-flex align-items-center justify-content-between mb-4">
                                    <div>
                                        <h6 class="mb-0 fw-bold">
                                            <i class="bi bi-person-plus me-2"></i>Create User Information
                                        </h6>
                                        <small class="text-muted">
                                            <i class="bi bi-info-circle me-1"></i>
                                            Fill in user information below.
                                        </small>
                                    </div>
                                </div>

                                <div class="card border-0 bg-white shadow-sm">
                                    <div class="card-body p-4">
                                        {{-- 用户名输入 --}}
                                        <div class="col-12 mb-4">
                                            <label class="form-label fw-bold text-dark mb-2">
                                                <i class="bi bi-at me-2 text-primary"></i>Username
                                            </label>
                                            <input type="text" class="form-control" id="create-username" name="username"
                                                value="{{ old('username') }}" placeholder="Enter username" required>
                                            <div class="form-text">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Enter the user's username
                                            </div>
                                        </div>

                                        {{-- 姓名输入 --}}
                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-person me-2 text-primary"></i>First Name
                                                </label>
                                                <input type="text" class="form-control" id="create-first_name" name="first_name"
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
                                                <input type="text" class="form-control" id="create-last_name" name="last_name"
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
                                            <input type="email" class="form-control" id="create-email" name="email"
                                                value="{{ old('email') }}" placeholder="Enter email address" required>
                                            <div class="form-text">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Enter a valid email address
                                            </div>
                                        </div>

                                        {{-- 密码输入区域 --}}
                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-lock me-2 text-primary"></i>Password
                                                </label>
                                                <div class="input-group">
                                                    <input type="password" class="form-control" id="create-password" name="password"
                                                        placeholder="Enter password" required>
                                                    <span class="input-group-text" role="button" onclick="togglePassword('create-password', 'toggleCreatePassword')">
                                                        <i class="bi bi-eye-slash text-primary" id="toggleCreatePassword"></i>
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
                                                    <input type="password" class="form-control" id="create-password_confirmation" name="password_confirmation"
                                                        placeholder="Confirm password" required>
                                                    <span class="input-group-text" role="button" onclick="togglePassword('create-password_confirmation', 'toggleCreatePasswordConfirm')">
                                                        <i class="bi bi-eye-slash text-primary" id="toggleCreatePasswordConfirm"></i>
                                                    </span>
                                                </div>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Enter the password again
                                                </div>
                                            </div>
                                        </div>

                                        {{-- 用户角色设置区域 --}}
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="submitCreateUser">
                    <i class="bi bi-check-circle me-2"></i>Create User
                </button>
            </div>
        </div>
    </div>
</div>

