@extends("layouts.app")

@section("title", "Edit User Information")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-normal.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/role-status.css') }}">

<div class="container-fluid py-4">
    {{-- ========================================== --}}
    {{-- 页面标题和操作区域 (Page Header & Actions) --}}
    {{-- ========================================== --}}
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    {{-- 标题区域 --}}
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-pencil-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Update User Information</h2>
                                <p class="dashboard-subtitle mb-0">Modify user basic information and permission settings</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management') }}" class="btn btn-primary">
                            <i class="bi bi-arrow-left me-2"></i>
                            Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- 提示信息容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    <!-- 统一的用户管理界面 -->
    <div class="card shadow-sm border-0">
        <div class="row g-0">
            <!-- 左侧配置区域 -->
            <div class="col-md-4">
                <div class="config-section d-flex flex-column h-100 bg-light p-4">
                    <!-- 配置标题 -->
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-gear-fill me-2"></i>Configuration
                        </h6>
                        <span class="badge bg-white text-dark border px-3 py-2">Update</span>
                    </div>

                    <!-- 信息显示 -->
                    <div class="alert alert-info border-0 mb-4">
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-info-circle-fill me-2"></i>
                            <strong>Current User</strong>
                        </div>
                        <div class="small">
                            <div class="mb-1">
                                <i class="bi bi-person me-2 text-muted"></i>
                                <span>Name: <strong>{{ $user->name }}</strong></span>
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

                    <!-- 统计信息 -->
                    <div class="mt-auto">
                        <div class="row text-center">
                            <div class="col-12">
                                <div class="h4 text-primary mb-0">1</div>
                                <small class="text-muted">User Account</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧编辑表单区域 -->
            <div class="col-md-8">
                <div class="size-values-section p-4">
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

                    <!-- 编辑表单 -->
                    <form action="{{ $userRole === 'SuperAdmin' ? route('superadmin.users.update', $user->id) : route('admin.users.update', $user->id) }}" method="post" id="updateUserForm">
                        @csrf
                        @method('PUT')

                        <div class="card border-0 bg-white shadow-sm">
                            <div class="card-body p-4">
                                <!-- Name Field -->
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-person me-2 text-primary"></i>User Name
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light border-end-0">
                                            <i class="bi bi-person text-muted"></i>
                                        </span>
                                        <input type="text" class="form-control border-start-0" id="name" name="name"
                                               value="{{ old('name', $user->name) }}" placeholder="Enter user name" required>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Enter the user's full name
                                    </div>
                                </div>

                                <!-- Email Field -->
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-envelope me-2 text-primary"></i>Email Address
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light border-end-0">
                                            <i class="bi bi-envelope text-muted"></i>
                                        </span>
                                        <input type="email" class="form-control border-start-0" id="email" name="email"
                                               value="{{ old('email', $user->email) }}" placeholder="Enter email address" required>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Enter a valid email address
                                    </div>
                                </div>

                                <!-- Password Field -->
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-lock me-2 text-primary"></i>New Password
                                        <small class="text-muted">(leave blank to keep unchanged)</small>
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light border-end-0">
                                            <i class="bi bi-lock text-muted"></i>
                                        </span>
                                        <input type="password" class="form-control border-start-0 border-end-0" id="password" name="password"
                                               placeholder="Enter new password (leave blank to keep unchanged)">
                                        <span class="input-group-text bg-light border-start-0" role="button" onclick="togglePassword('password', 'togglePassword')">
                                            <i class="bi bi-eye-slash text-primary" id="togglePassword"></i>
                                        </span>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Leave blank to keep the current password
                                    </div>
                                </div>

                                <!-- Confirm Password Field -->
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="bi bi-shield-lock me-2 text-primary"></i>Confirm New Password
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-light border-end-0">
                                            <i class="bi bi-shield-lock text-muted"></i>
                                        </span>
                                        <input type="password" class="form-control border-start-0 border-end-0" id="password_confirmation"
                                               name="password_confirmation" placeholder="Confirm new password">
                                        <span class="input-group-text bg-light border-start-0" role="button" onclick="togglePassword('password_confirmation', 'togglePasswordConfirm')">
                                            <i class="bi bi-eye-slash text-primary" id="togglePasswordConfirm"></i>
                                        </span>
                                    </div>
                                    <div class="form-text">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Confirm the new password
                                    </div>
                                </div>

                                @php
                                    $currentUserRole = auth()->user()->getAccountRole();
                                    $currentUserAccountRole = $user->account->account_role ?? 'Staff';
                                @endphp

                                @if($currentUserRole === 'SuperAdmin')
                                    <!-- Role Selection Field -->
                                    <div class="mb-4">
                                        <label class="form-label fw-bold text-dark mb-3">User Role</label>
                                        <div class="row g-3">
                                            <!-- Staff 选项 -->
                                            <div class="col-lg-4 col-md-6 col-sm-12">
                                                <div class="card h-100 border role-card {{ $currentUserAccountRole === 'Staff' ? 'selected' : '' }}" data-role="Staff">
                                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                        <input type="radio" name="account_role" value="Staff" class="form-check-input me-3"
                                                               {{ old('account_role', $currentUserAccountRole) === 'Staff' ? 'checked' : '' }}>
                                                        <div>
                                                            <h6 class="card-title mb-1">
                                                                <i class="bi bi-person-badge me-2 text-success"></i>Staff
                                                            </h6>
                                                            <p class="card-text text-muted small mb-0">Basic user permissions</p>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            <!-- Admin 选项 -->
                                            <div class="col-lg-4 col-md-6 col-sm-12">
                                                <div class="card h-100 border role-card {{ $currentUserAccountRole === 'Admin' ? 'selected' : '' }}" data-role="Admin">
                                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                        <input type="radio" name="account_role" value="Admin" class="form-check-input me-3"
                                                               {{ old('account_role', $currentUserAccountRole) === 'Admin' ? 'checked' : '' }}>
                                                        <div>
                                                            <h6 class="card-title mb-1">
                                                                <i class="bi bi-shield-check me-2 text-warning"></i>Admin
                                                            </h6>
                                                            <p class="card-text text-muted small mb-0">Full management permissions</p>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            <!-- SuperAdmin 选项 -->
                                            <div class="col-lg-4 col-md-6 col-sm-12">
                                                <div class="card h-100 border role-card {{ $currentUserAccountRole === 'SuperAdmin' ? 'selected' : '' }}" data-role="SuperAdmin">
                                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                        <input type="radio" name="account_role" value="SuperAdmin" class="form-check-input me-3"
                                                               {{ old('account_role', $currentUserAccountRole) === 'SuperAdmin' ? 'checked' : '' }}>
                                                        <div>
                                                            <h6 class="card-title mb-1">
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
                            <!-- Role Display (Read-only for Admin) -->
                            <div class="mb-4">
                                <label class="form-label fw-bold">User Role</label>
                                <div class="row g-3">
                                    <div class="col-12">
                                        <div class="card border">
                                            <div class="card-body d-flex align-items-center">
                                                <div class="me-3">
                                                    @if($currentUserAccountRole === 'SuperAdmin')
                                                        <i class="bi bi-person-fill-gear text-danger fs-4"></i>
                                                    @elseif($currentUserAccountRole === 'Admin')
                                                        <i class="bi bi-shield-check text-warning fs-4"></i>
                                                    @else
                                                        <i class="bi bi-person-badge text-success fs-4"></i>
                                                    @endif
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

                                <!-- Permission Notice -->
                                <div class="mt-3">
                                    <div class="alert alert-info alert-sm d-flex align-items-center" role="alert">
                                        <i class="bi bi-info-circle me-2"></i>
                                        <small>You can only modify user basic information, cannot change user roles</small>
                                    </div>
                                </div>
                            </div>
                        @endif

                                <!-- Account Status Field -->
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-dark mb-3">Account Status</label>
                                    <div class="row g-3">
                                        @php
                                            $currentStatus = $user->account->account_status ?? 'Available';
                                        @endphp

                                        <div class="col-md-6">
                                            <div class="card h-100 border status-card {{ $currentStatus === 'Available' ? 'selected' : '' }}" data-status="Available">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="account_status" value="Available" class="form-check-input me-3"
                                                           {{ old('account_status', $currentStatus) === 'Available' ? 'checked' : '' }}>
                                                    <div>
                                                        <h6 class="card-title mb-1">
                                                            <i class="bi bi-check-circle me-2 text-success"></i>Available
                                                        </h6>
                                                        <p class="card-text text-muted small mb-0">User can login and use normally</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="card h-100 border status-card {{ $currentStatus === 'Unavailable' ? 'selected' : '' }}" data-status="Unavailable">
                                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                    <input type="radio" name="account_status" value="Unavailable" class="form-check-input me-3"
                                                           {{ old('account_status', $currentStatus) === 'Unavailable' ? 'checked' : '' }}>
                                                    <div>
                                                        <h6 class="card-title mb-1">
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

                                <!-- 提交按钮区域 -->
                                <div class="d-flex gap-3 mt-4">
                                    <button type="submit" class="btn btn-warning flex-fill">
                                        <i class="bi bi-pencil-square me-2"></i>Update User Information
                                    </button>
                                    <a href="{{ $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management') }}" class="btn btn-outline-secondary">
                                        <i class="bi bi-x-circle me-2"></i>Cancel
                                    </a>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/auth-common.js') }}"></script>
<script src="{{ asset('assets/js/auth/auth-update.js') }}"></script>
<script>
    // JavaScript URL definitions
    window.updateUserUrl = "{{ $userRole === 'SuperAdmin' ? route('superadmin.users.update', ':id') : route('admin.users.update', ':id') }}";
    window.updateUserRedirect = "{{ $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management') }}";
</script>
@endsection
