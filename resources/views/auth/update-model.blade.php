{{-- ==========================================
    更新用户 Modal
    功能：在 modal 中编辑用户信息
    ========================================== --}}

<div class="modal fade" id="updateUserModal" tabindex="-1" aria-labelledby="updateUserModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="updateUserModalLabel">
                    <i class="bi bi-pencil-square me-2"></i>Update User Information
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="updateUserForm" enctype="multipart/form-data">
                    @csrf
                    @method('PUT')

                    <div class="row g-0">
                        {{-- 左侧配置面板 --}}
                        <div class="col-md-4">
                            <div class="config-section d-flex flex-column h-100 bg-light p-4">
                                {{-- 配置区域标题 --}}
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <h6 class="mb-0 fw-bold text-primary">
                                        <i class="bi bi-gear-fill me-2"></i>Configuration
                                    </h6>
                                    <span class="badge bg-white text-dark border px-3 py-2">Update</span>
                                </div>

                                {{-- 用户头像上传区域 --}}
                                <div class="mb-4">
                                    <label class="form-label">Profile Image</label>
                                    <div class="img-upload-area" id="update-user-image-preview">
                                        {{-- 初始状态下显示上传占位符 --}}
                                        <div class="upload-placeholder" id="update-user-image-upload-content">
                                            <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                            <h5 class="mt-3">Click to upload image</h5>
                                            <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                        </div>
                                        {{-- 图片预览（初始隐藏） --}}
                                        <img id="update-user-preview-image" class="img-preview d-none" alt="User Preview">
                                        {{-- 删除按钮（初始隐藏） --}}
                                        <button type="button" class="img-remove-btn d-none" id="removeImage" title="Remove image">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                    <input type="file" class="d-none" id="update_user_image" name="user_image" accept="image/*">
                                    <input type="hidden" id="remove_image" name="remove_image" value="0">
                                </div>

                                {{-- 当前用户信息显示 --}}
                                <div class="alert alert-info border-0 mb-0">
                                    <div class="d-flex align-items-center mb-2">
                                        <i class="bi bi-info-circle-fill me-2"></i>
                                        <strong>Current User</strong>
                                    </div>
                                    <div class="small" id="update-user-info-content">
                                        {{-- 动态填充 --}}
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
                                            <i class="bi bi-pencil-square me-2"></i>Update User Information
                                        </h6>
                                        <small class="text-muted">
                                            <i class="bi bi-info-circle me-1"></i>
                                            Modify user configuration below.
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
                                            <input type="text" class="form-control" id="update-username" name="username"
                                                placeholder="Enter username" required>
                                            <div class="form-text">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Enter the user's username
                                            </div>
                                            <div class="invalid-feedback">
                                                Please enter username.
                                            </div>
                                        </div>

                                        {{-- 姓名输入 --}}
                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-person me-2 text-primary"></i>First Name
                                                </label>
                                                <input type="text" class="form-control" id="update-first_name" name="first_name"
                                                    placeholder="Enter first name" required>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Enter the user's first name.
                                                </div>
                                                <div class="invalid-feedback">
                                                    Please enter first name.
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-person me-2 text-primary"></i>Last Name
                                                </label>
                                                <input type="text" class="form-control" id="update-last_name" name="last_name"
                                                    placeholder="Enter last name" required>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Enter the user's last name.
                                                </div>
                                                <div class="invalid-feedback">
                                                    Please enter last name.
                                                </div>
                                            </div>
                                        </div>

                                        {{-- 邮箱地址输入 --}}
                                        <div class="col-12 mb-4">
                                            <label class="form-label fw-bold text-dark mb-2">
                                                <i class="bi bi-envelope me-2 text-primary"></i>Email Address
                                            </label>
                                            <input type="email" class="form-control" id="update-email" name="email"
                                                placeholder="Enter email address" required>
                                            <div class="form-text">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Enter a valid email address
                                            </div>
                                            <div class="invalid-feedback">
                                                Please enter a valid email address.
                                            </div>
                                        </div>

                                        {{-- 密码修改区域 --}}
                                        <div class="row mb-4">
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-lock me-2 text-primary"></i>New Password
                                                </label>
                                                <div class="input-group">
                                                    <input type="password" class="form-control" id="update-password" name="password"
                                                        placeholder="Enter new password">
                                                    <span class="input-group-text" role="button" onclick="togglePassword('update-password', 'toggleUpdatePassword')">
                                                        <i class="bi bi-eye-slash text-primary" id="toggleUpdatePassword"></i>
                                                    </span>
                                                </div>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Leave blank to keep the current password
                                                </div>
                                                <div class="invalid-feedback">
                                                    Password must be at least 6 characters.
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-bold text-dark mb-2">
                                                    <i class="bi bi-shield-lock me-2 text-primary"></i>Confirm New Password
                                                </label>
                                                <div class="input-group">
                                                    <input type="password" class="form-control" id="update-password_confirmation" name="password_confirmation"
                                                        placeholder="Confirm new password">
                                                    <span class="input-group-text" role="button" onclick="togglePassword('update-password_confirmation', 'toggleUpdatePasswordConfirm')">
                                                        <i class="bi bi-eye-slash text-primary" id="toggleUpdatePasswordConfirm"></i>
                                                    </span>
                                                </div>
                                                <div class="form-text">
                                                    <i class="bi bi-info-circle me-1"></i>
                                                    Enter the new password again
                                                </div>
                                                <div class="invalid-feedback">
                                                    Passwords do not match.
                                                </div>
                                            </div>
                                        </div>

                                        {{-- 用户角色设置区域（动态加载） --}}
                                        <div class="mb-4" id="update-role-section">
                                            {{-- 由 JavaScript 动态填充 --}}
                                        </div>

                                        {{-- 账户状态设置区域（动态加载） --}}
                                        <div class="mb-4" id="update-status-section">
                                            {{-- 由 JavaScript 动态填充 --}}
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
                <button type="button" class="btn btn-warning" id="submitUpdateUser">
                    <i class="bi bi-pencil-square me-2"></i>Update User Information
                </button>
            </div>
        </div>
    </div>
</div>

