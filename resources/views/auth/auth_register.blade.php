@extends("layouts.app")

@section("title", "Create User Account")
@section("content")

<!-- CSS -->
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-table-list.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-quick-action.css') }}">
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
                                <i class="bi bi-person-plus-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create User Account</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple user accounts to manage system access</p>
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

    <!-- 主要内容卡片 - 左右布局 -->
    <form action="{{ route('register.submit') }}" method="post" id="userForm">
        @csrf
        <div class="card shadow-sm border-0">
            <div class="row g-0">
                <!-- 左侧配置区域 -->
                <div class="col-md-3">
                    <div class="config-section d-flex flex-column h-100 p-4">
                        <!-- 配置标题 -->
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="mb-0 fw-bold text-primary">
                                <i class="bi bi-gear-fill me-2"></i>Configuration
                            </h6>
                            <span class="badge bg-white text-dark border px-3 py-2">Step 1</span>
                        </div>

                        <!-- 配置内容 -->
                        <div class="config-content flex-grow-1">
                            <!-- 用户信息输入 -->
                            <div class="mb-4">
                                <label for="user_name" class="form-label fw-bold">User Name <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-person text-primary"></i>
                                    </span>
                                    <input type="text" class="form-control border-start-0" id="user_name" name="user_name"
                                           placeholder="Enter user name">
                                    <button type="button" class="btn btn-outline-primary" id="addUser">
                                        <i class="bi bi-plus-circle"></i>
                                    </button>
                                </div>
                                <small class="text-muted">Enter user name and click + to add</small>
                            </div>

                            <div class="mb-4">
                                <label for="user_email" class="form-label fw-bold">Email Address <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-envelope text-primary"></i>
                                    </span>
                                    <input type="email" class="form-control border-start-0" id="user_email" name="user_email"
                                           placeholder="Enter email address">
                                </div>
                            </div>

                            <div class="mb-4">
                                <label for="user_password" class="form-label fw-bold">Password <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-lock text-primary"></i>
                                    </span>
                                    <input type="password" class="form-control border-start-0 border-end-0" id="user_password" name="user_password"
                                           placeholder="Enter password">
                                    <span class="input-group-text bg-white border-start-0" role="button" onclick="togglePassword('user_password', 'togglePassword')">
                                        <i class="bi bi-eye-slash text-primary" id="togglePassword"></i>
                                    </span>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label for="user_password_confirmation" class="form-label fw-bold">Confirm Password <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-shield-lock text-primary"></i>
                                    </span>
                                    <input type="password" class="form-control border-start-0 border-end-0" id="user_password_confirmation" name="user_password_confirmation"
                                           placeholder="Confirm password">
                                    <span class="input-group-text bg-white border-start-0" role="button" onclick="togglePassword('user_password_confirmation', 'togglePasswordConfirm')">
                                        <i class="bi bi-eye-slash text-primary" id="togglePasswordConfirm"></i>
                                    </span>
                                </div>
                            </div>

                            <!-- 配置摘要 -->
                            <div class="config-summary" id="configSummary" style="display: none;">
                                <div class="alert alert-info border-0 bg-white">
                                    <div class="d-flex align-items-center mb-2">
                                        <i class="bi bi-info-circle-fill text-primary me-2"></i>
                                        <strong>Configuration Summary</strong>
                                    </div>
                                    <div class="summary-details">
                                        <div class="mb-1">
                                            <i class="bi bi-person me-2 text-muted"></i>
                                            <span>Users: &nbsp;<strong id="selectedUsers">None</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 快速操作 -->
                            <div class="quick-actions mt-auto">
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-outline-success" id="addCommonUsers">
                                        <i class="bi bi-list-ul me-2"></i>Add Common Users
                                    </button>
                                    <button type="button" class="btn btn-outline-info" id="addAdminUsers">
                                        <i class="bi bi-shield me-2"></i>Add Admin Users
                                    </button>
                                    <hr class="my-2">
                                    <button type="button" class="btn btn-outline-secondary" id="clearForm">
                                        <i class="bi bi-x-circle me-2"></i>Clear All
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧用户列表区域 -->
                <div class="col-md-9">
                    <div class="card-body p-4">
                        <!-- 表单标题 -->
                        <h2 class="text-primary text-center mb-3">User Accounts</h2>
                        <p class="text-muted text-center">Add user accounts to manage system access</p>
                        <hr>

                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-person-plus-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Configure User Accounts</h5>
                            <p class="text-muted">Add user information from the left panel</p>
                        </div>

                        <!-- 用户列表区域 -->
                        <div id="userValuesArea" style="display: none;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">
                                    <i class="bi bi-collection text-primary me-2"></i>Users
                                    <span class="text-muted" id="userName"></span>
                                </h5>
                                <div class="d-flex align-items-center gap-2">
                                    <button type="button" class="btn btn-sm btn-outline-secondary" id="sortUsers" title="Sort users">
                                        <i class="bi bi-sort-down" id="sortIcon"></i>
                                    </button>
                                    <span class="badge bg-info" id="userValuesCount">0 users</span>
                                </div>
                            </div>

                            <div class="values-list" id="userValuesList">
                                <!-- 用户将通过JavaScript动态添加 -->
                            </div>
                        </div>

                        <!-- 用户输入提示 -->
                        <div id="userInputPrompt" class="text-center text-muted py-4" style="display: none;">
                            <i class="bi bi-arrow-up-circle fs-1 text-muted mb-3"></i>
                            <h6 class="text-muted">Add Users</h6>
                            <p class="text-muted small">Enter user information in the left panel</p>
                        </div>

                        <!-- 角色选择 -->
                        <div class="mb-4" id="roleSelection" style="display: none;">
                            <hr class="my-4">
                            <h5 class="mb-3">
                                <i class="bi bi-shield-check text-primary me-2"></i>User Role
                            </h5>
                            <div class="row g-3">
                                @php
                                    $currentUserRole = Auth::user()->getAccountRole();
                                @endphp

                                <!-- Staff Option -->
                                <div class="col-lg-4 col-md-6 col-sm-12">
                                    <div class="card h-100 border role-card selected" data-role="Staff">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="account_role" value="Staff" class="form-check-input me-3" checked>
                                            <div>
                                                <h6 class="card-title mb-1">
                                                    <i class="bi bi-person-badge me-2 text-success"></i>Staff
                                                </h6>
                                                <p class="card-text text-muted small mb-0">Basic user permissions</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                @if($currentUserRole === 'SuperAdmin')
                                    <!-- Admin Option -->
                                    <div class="col-lg-4 col-md-6 col-sm-12">
                                        <div class="card h-100 border role-card" data-role="Admin">
                                            <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                <input type="radio" name="account_role" value="Admin" class="form-check-input me-3">
                                                <div>
                                                    <h6 class="card-title mb-1">
                                                        <i class="bi bi-shield-check me-2 text-warning"></i>Admin
                                                    </h6>
                                                    <p class="card-text text-muted small mb-0">Full management permissions</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <!-- SuperAdmin Option -->
                                    <div class="col-lg-4 col-md-6 col-sm-12">
                                        <div class="card h-100 border role-card" data-role="SuperAdmin">
                                            <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                <input type="radio" name="account_role" value="SuperAdmin" class="form-check-input me-3">
                                                <div>
                                                    <h6 class="card-title mb-1">
                                                        <i class="bi bi-person-fill-gear me-2 text-danger"></i>Super Admin
                                                    </h6>
                                                    <p class="card-text text-muted small mb-0">Highest system permissions</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                @endif
                            </div>
                        </div>

                        <!-- 提交按钮 -->
                        <div id="submitSection" style="display: none;">
                            <hr class="my-4">
                            <button type="submit" class="btn btn-primary w-100 btn-lg">
                                <i class="bi bi-stack me-2"></i>Create Users
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection

@section("scripts")
<!-- JavaScript -->
<script>
    // JavaScript URL definitions
    window.createUserUrl = "{{ route('register.submit') }}";
    window.userManagementRoute = "{{ $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management') }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/auth-common.js') }}"></script>
<script src="{{ asset('assets/js/auth-management.js') }}"></script>
@endsection
