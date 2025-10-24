{{-- ==========================================
    用户信息更新页面
    功能：编辑用户基本信息、角色权限、账户状态
    ========================================== --}}

@extends("layouts.app")

@section("title", "Edit User Information")
@section("content")

{{-- ==========================================
    页面样式文件引入
    ========================================== --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- ==========================================
    页面主体内容
    ========================================== --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    {{-- 左侧标题区域 --}}
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4"><i class="bi bi-pencil-fill"></i></div>
                            <div>
                                <h2 class="dashboard-title mb-1">Update User Information</h2>
                                <p class="dashboard-subtitle mb-0">Modify user basic information and permission settings</p>
                            </div>
                        </div>
                    </div>

                    {{-- 右侧返回按钮 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management') }}"
                           class="btn btn-primary">
                            <i class="bi bi-arrow-left me-2"></i>Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- ==========================================
        用户更新表单
        ========================================== --}}
    <form action="{{ $userRole === 'SuperAdmin' ? route('superadmin.users.update', $user->id) : route('admin.users.update', $user->id) }}"
          method="post" id="updateUserForm" enctype="multipart/form-data">
        @csrf
        @method('PUT')

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
                            <span class="badge bg-white text-dark border px-3 py-2">Update</span>
                        </div>

                        {{-- 用户头像上传区域 --}}
                        <div class="mb-4">
                            <label class="form-label">Profile Image</label>
                            <div class="img-upload-area" id="user-image-area">
                                @if($user->account && $user->account->user_image && file_exists(public_path('assets/images/auth/' . $user->account->user_image)))
                                    {{-- 已存在头像的情况 --}}
                                    <div class="upload-placeholder d-none" id="user-upload-placeholder">
                                        <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                        <h5 class="mt-3">Click to upload image</h5>
                                        <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                    </div>
                                    <img id="user-preview" class="img-preview" src="{{ asset('assets/images/auth/' . $user->account->user_image) }}" alt="User Preview">
                                    <button type="button" class="img-remove-btn" id="remove-user-image"><i class="bi bi-trash"></i></button>
                                @else
                                    {{-- 没有头像的情况 --}}
                                    <div class="upload-placeholder" id="user-upload-placeholder">
                                        <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                        <h5 class="mt-3">Click to upload image</h5>
                                        <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                    </div>
                                    <img id="user-preview" class="img-preview d-none" alt="User Preview">
                                    <button type="button" class="img-remove-btn d-none" id="remove-user-image"><i class="bi bi-trash"></i></button>
                                @endif
                            </div>
                            <input type="file" class="d-none" id="user_image" name="user_image" accept="image/*">
                        </div>

                        {{-- 当前用户信息显示 --}}
                        <div class="alert alert-info border-0 mb-4">
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-info-circle-fill me-2"></i>
                                <strong>Current User</strong>
                            </div>
                            <div class="small">
                                <div class="mb-1">
                                    <i class="bi bi-person me-2 text-muted"></i>
                                    <span>Name: <strong>{{ trim($user->first_name . ' ' . $user->last_name) }}</strong></span>
                                </div>
                                <div class="mb-1">
                                    <i class="bi bi-at me-2 text-muted"></i>
                                    <span>Username: <strong>{{ $user->account->username ?? 'N/A' }}</strong></span>
                                </div>
                                <div class="mb-1">
                                    <i class="bi bi-envelope me-2 text-muted"></i>
                                    <span>Email: <strong>{{ $user->email }}</strong></span>
                                </div>
                                <div class="mb-1">
                                    <i class="bi bi-shield-check me-2 text-muted"></i>
                                    <span>Role: <strong>{{ $user->account->account_role ?? 'N/A' }}</strong></span>
                                </div>
                                <div>
                                    <i class="bi bi-toggle-on me-2 text-muted"></i>
                                    <span>Status: <strong>{{ $user->account->account_status ?? 'N/A' }}</strong></span>
                                </div>
                            </div>
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

                                {{-- ==========================================
                                    基本信息表单字段
                                    ========================================== --}}

                                {{-- 用户名输入 --}}
                                <div class="col-12 mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-at me-2 text-primary"></i>Username
                                    </label>
                                    <input type="text" class="form-control" id="username" name="username"
                                        value="{{ old('username', $user->account->username ?? '') }}" placeholder="Enter username" required>
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
                                            value="{{ old('first_name', $user->first_name) }}" placeholder="Enter first name" required>
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
                                            value="{{ old('last_name', $user->last_name) }}" placeholder="Enter last name" required>
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
                                        value="{{ old('email', $user->email) }}" placeholder="Enter email address" required>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Enter a valid email address
                                    </div>
                                </div>

                                {{-- ==========================================
                                    密码修改区域
                                    ========================================== --}}
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold text-dark mb-2">
                                            <i class="bi bi-lock me-2 text-primary"></i>New Password
                                            <small class="text-muted">(leave blank to keep unchanged)</small>
                                        </label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="password" name="password"
                                                placeholder="Enter new password (leave blank to keep unchanged)">
                                            <span class="input-group-text" role="button" onclick="togglePassword('password', 'togglePassword')">
                                                <i class="bi bi-eye-slash text-primary" id="togglePassword"></i>
                                            </span>
                                            <div class="form-text">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Leave blank to keep the current password
                                            </div>
                                        </div>
                                        <div class="form-text">
                                            <i class="bi bi-info-circle me-1"></i>
                                            Enter the new password
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold text-dark mb-2">
                                            <i class="bi bi-shield-lock me-2 text-primary"></i>Confirm New Password
                                        </label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="password_confirmation" name="password_confirmation"
                                                placeholder="Confirm new password">
                                            <span class="input-group-text" role="button" onclick="togglePassword('password_confirmation', 'togglePasswordConfirm')">
                                                <i class="bi bi-eye-slash text-primary" id="togglePasswordConfirm"></i>
                                            </span>
                                            <div class="form-text">
                                                <i class="bi bi-info-circle me-1"></i>
                                                Enter the new password again
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {{-- ==========================================
                                    用户角色设置区域
                                    ========================================== --}}
                                @php
                                    $currentUserRole = auth()->user()->getAccountRole();
                                    $currentUserAccountRole = $user->account->account_role ?? 'Staff';
                                @endphp

                                @if($currentUserRole === 'SuperAdmin' && !$isUpdatingSelf)
                                    {{-- 超级管理员可以修改其他用户角色 --}}
                                    <div class="mb-4">
                                        <label class="form-label fw-bold text-dark mb-3">User Role</label>
                                        <div class="row g-3">

                                            {{-- 员工角色选项 --}}
                                            <div class="col-lg-4 col-md-6 col-sm-12">
                                                <div class="card h-100 border role-card {{ $currentUserAccountRole === 'Staff' ? 'selected' : '' }}"
                                                     data-role="Staff">
                                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                        <input type="radio" class="form-check-input me-3"
                                                            name="account_role" value="Staff" {{ old('account_role', $currentUserAccountRole) === 'Staff' ? 'checked' : '' }}>
                                                        <div class="flex-fill">
                                                            <h6 class="card-title mb-1 fw-semibold">
                                                                <i class="bi bi-person-badge me-2 text-success"></i>Staff
                                                            </h6>
                                                            <p class="card-text text-muted small mb-0">Basic user permissions</p>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            {{-- 管理员角色选项 --}}
                                            <div class="col-lg-4 col-md-6 col-sm-12">
                                                <div class="card h-100 border role-card {{ $currentUserAccountRole === 'Admin' ? 'selected' : '' }}"
                                                     data-role="Admin">
                                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                        <input type="radio" class="form-check-input me-3"
                                                            name="account_role" value="Admin" {{ old('account_role', $currentUserAccountRole) === 'Admin' ? 'checked' : '' }}>
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
                                                <div class="card h-100 border role-card {{ $currentUserAccountRole === 'SuperAdmin' ? 'selected' : '' }}"
                                                     data-role="SuperAdmin">
                                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                        <input type="radio" class="form-check-input me-3"
                                                            name="account_role" value="SuperAdmin" {{ old('account_role', $currentUserAccountRole) === 'SuperAdmin' ? 'checked' : '' }}>
                                                        <div class="flex-fill">
                                                            <h6 class="card-title mb-1 fw-semibold">
                                                                <i class="bi bi-person-fill-gear me-2 text-danger"></i>Super Admin
                                                            </h6>
                                                            <p class="card-text text-muted small mb-0">Highest system permissions</p>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-text">
                                            <i class="bi bi-info-circle me-1"></i>
                                            You can modify user roles to Staff, Admin, or Super Admin
                                        </div>
                                    </div>
                                @else
                                    {{-- 非超级管理员或更新自己时，只显示当前角色 --}}
                                    <div class="mb-4">
                                        <label class="form-label fw-bold">User Role</label>
                                        <div class="row g-3">
                                            <div class="col-12">
                                                <div class="card border">
                                                    <div class="card-body d-flex align-items-center">
                                                        <div class="me-3">
                                                            <span class="badge {{ $currentUserAccountRole === 'SuperAdmin' ? 'bg-danger' :
                                                                ($currentUserAccountRole === 'Admin' ? 'bg-warning' : 'bg-success') }} px-3 py-2">
                                                                <i class="bi {{ $currentUserAccountRole === 'SuperAdmin' ? 'bi-person-fill-gear' :
                                                                    ($currentUserAccountRole === 'Admin' ? 'bi-shield-check' : 'bi-person-badge') }} me-1"></i>
                                                                {{ $currentUserAccountRole === 'SuperAdmin' ? 'SUPER ADMIN' : ($currentUserAccountRole === 'Admin' ? 'ADMIN' : 'STAFF') }}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h6 class="card-title mb-1">
                                                                @if($currentUserAccountRole === 'SuperAdmin')
                                                                    Super Admin
                                                                @elseif($currentUserAccountRole === 'Admin')
                                                                    Admin
                                                                @else
                                                                    Staff
                                                                @endif
                                                            </h6>
                                                            <p class="card-text text-muted small mb-0">
                                                                @if($currentUserAccountRole === 'SuperAdmin')
                                                                    Highest system permissions
                                                                @elseif($currentUserAccountRole === 'Admin')
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

                                        <div class="mt-3">
                                            <div class="alert alert-info alert-sm d-flex align-items-center" role="alert">
                                                <i class="bi bi-info-circle me-2"></i>
                                                <small>You can only modify user basic information, cannot change user roles</small>
                                            </div>
                                        </div>
                                    </div>
                                @endif

                                {{-- ==========================================
                                    账户状态设置区域
                                    ========================================== --}}
                                @if(!$isUpdatingSelf)
                                    {{-- 可以修改其他用户状态 --}}
                                    <div class="mb-4">
                                        <label class="form-label fw-bold text-dark mb-3">Account Status</label>
                                        <div class="row g-3">
                                            @php
                                                $currentStatus = $user->account->account_status ?? 'Available';
                                            @endphp

                                            {{-- 可用状态选项 --}}
                                            <div class="col-md-6">
                                                <div class="card h-100 border status-card {{ $currentStatus === 'Available' ? 'selected' : '' }}"
                                                     data-status="Available">
                                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                        <input type="radio" class="form-check-input me-3"
                                                            name="account_status" value="Available" {{ old('account_status', $currentStatus) === 'Available' ? 'checked' : '' }}>
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
                                                <div class="card h-100 border status-card {{ $currentStatus === 'Unavailable' ? 'selected' : '' }}"
                                                     data-status="Unavailable">
                                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                        <input type="radio" class="form-check-input me-3"
                                                            name="account_status" value="Unavailable" {{ old('account_status', $currentStatus) === 'Unavailable' ? 'checked' : '' }}>
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
                                @else
                                    {{-- 不能修改自己的状态 --}}
                                    <div class="mb-4">
                                        <label class="form-label fw-bold text-dark mb-3">Account Status</label>
                                        <div class="row g-3">
                                            <div class="col-12">
                                                <div class="card border">
                                                    <div class="card-body d-flex align-items-center">
                                                        <div class="me-3">
                                                            @php
                                                                $currentStatus = $user->account->account_status ?? 'Available';
                                                            @endphp
                                                            @if($currentStatus === 'Available')
                                                                <i class="bi bi-check-circle text-success fs-4"></i>
                                                            @else
                                                                <i class="bi bi-x-circle text-danger fs-4"></i>
                                                            @endif
                                                        </div>
                                                        <div>
                                                            <h6 class="card-title mb-1">
                                                                {{ $currentStatus === 'Available' ? 'Available' : 'Unavailable' }}
                                                            </h6>
                                                            <p class="card-text text-muted small mb-0">
                                                                {{ $currentStatus === 'Available' ? 'User can login and use normally' : 'User cannot login to the system' }}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-text">
                                            <i class="bi bi-info-circle me-1"></i>
                                            You cannot change your own account status
                                        </div>
                                    </div>
                                @endif

                                {{-- ==========================================
                                    表单操作按钮
                                    ========================================== --}}
                                <div class="d-flex gap-3 mt-4">
                                    <button type="submit" class="btn btn-warning flex-fill">
                                        <i class="bi bi-pencil-square me-2"></i>Update User Information
                                    </button>
                                    <a href="{{ $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management') }}"
                                       class="btn btn-outline-secondary">
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
</div>

@endsection

{{-- ==========================================
    页面脚本区域
    ========================================== --}}
@section("scripts")

{{-- 设置全局变量供 JavaScript 使用 --}}
<script>
    window.updateUserUrl = "{{ $userRole === 'SuperAdmin' ? route('superadmin.users.update', ':id') : route('admin.users.update', ':id') }}";
    window.updateUserRedirect = "{{ $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management') }}";

    @if($user->account && $user->account->user_image)
        window.existingUserImage = '{{ asset('assets/images/auth/' . $user->account->user_image) }}';
    @endif
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/common/auth-common.js') }}"></script>
<script src="{{ asset('assets/js/auth-management.js') }}"></script>

{{-- 页面初始化脚本 --}}
<script>
    document.addEventListener('DOMContentLoaded', function() {
        initializeUserUpdate();
    });
</script>
@endsection
