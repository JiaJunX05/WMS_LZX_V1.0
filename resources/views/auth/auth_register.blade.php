@extends("layouts.app")

@section("title", "Create User Account")
@section("content")

<!-- CSS -->
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/role-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">

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
                                <p class="dashboard-subtitle mb-0">Add a new user account to manage system access</p>
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

    {{-- =============================================================================
         主要表單 (Main Form)
         ============================================================================= --}}
    <form action="{{ route('register.submit') }}" method="post" enctype="multipart/form-data" id="userForm">
        @csrf
        <div class="row">
            {{-- =============================================================================
                 左側主要內容區域 (Left Content Area)
                 ============================================================================= --}}
            <div class="col-lg-6">
                {{-- 用戶基本信息卡片 (User Basic Information Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">User Information</h5>
                    </div>
                    <div class="card-body">
                        {{-- 用戶名 (Username) --}}
                        <div class="mb-3">
                            <label class="form-label">Username <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="username" id="username" placeholder="Enter username" required>
                        </div>

                        {{-- 姓名 (First Name & Last Name) --}}
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">First Name <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" name="first_name" id="first_name" placeholder="Enter first name" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Last Name <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" name="last_name" id="last_name" placeholder="Enter last name" required>
                            </div>
                        </div>

                        {{-- 郵箱 (Email) --}}
                        <div class="mb-3">
                            <label class="form-label">Email Address <span class="text-danger">*</span></label>
                            <input type="email" class="form-control" name="email" id="email" placeholder="Enter email address" required>
                        </div>

                        {{-- 密碼 (Password) --}}
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Password <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <input type="password" class="form-control" name="password" id="password" placeholder="Enter password" required>
                                    <span class="input-group-text" role="button" onclick="togglePassword('password', 'togglePassword')">
                                        <i class="bi bi-eye-slash" id="togglePassword"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Confirm Password <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <input type="password" class="form-control" name="password_confirmation" id="password_confirmation" placeholder="Confirm password" required>
                                    <span class="input-group-text" role="button" onclick="togglePassword('password_confirmation', 'togglePasswordConfirm')">
                                        <i class="bi bi-eye-slash" id="togglePasswordConfirm"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- 用戶圖片卡片 (User Image Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">User Image</h5>
                    </div>
                    <div class="card-body">
                        {{-- 用戶頭像 (User Avatar) --}}
                        <div class="mb-4">
                            <label class="form-label">Profile Image</label>
                            <div class="image-upload-area" id="user-image-area">
                                <div class="upload-placeholder" id="user-upload-placeholder">
                                    <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                    <h5 class="mt-3">Click to upload image</h5>
                                    <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                </div>
                                <img id="user-preview" class="preview-image d-none" alt="User Preview">
                                <button type="button" class="image-remove-btn d-none" id="remove-user-image">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                            <input type="file" class="d-none" id="user_image" name="user_image" accept="image/*">
                        </div>
                    </div>
                </div>
            </div>

            {{-- =============================================================================
                 右側操作面板 (Right Sidebar)
                 ============================================================================= --}}
            <div class="col-lg-6">
                {{-- 角色選擇卡片 (Role Selection Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">User Role</h5>
                    </div>
                    <div class="card-body">
                        @php
                            $currentUserRole = Auth::user()->getAccountRole();
                        @endphp

                        {{-- Staff Option --}}
                        <div class="mb-3">
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
                            {{-- Admin Option --}}
                            <div class="mb-3">
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

                            {{-- SuperAdmin Option --}}
                            <div class="mb-3">
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

                {{-- 用戶提交卡片 (User Submit Card) --}}
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Submit User</h5>
                    </div>
                    <div class="card-body">
                        {{-- 提交按鈕 (Submit Button) --}}
                        <div class="text-center">
                            <button type="submit" class="btn btn-primary btn-lg px-5 w-100">
                                <i class="bi bi-check-circle me-2"></i>Create User
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
{{-- 通用 JavaScript 文件 (Common JavaScript Files) --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/auth-management.js') }}"></script>

{{-- 數據傳遞給 JavaScript (Data for JavaScript) --}}
<script>
    // JavaScript URL definitions
    window.createUserUrl = "{{ route('register.submit') }}";
    window.userManagementRoute = "{{ $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management') }}";
</script>

{{-- 用戶創建 JavaScript (User Creation JavaScript) --}}
<script>
    // 初始化用戶註冊頁面
    document.addEventListener('DOMContentLoaded', function() {
        initializeUserRegistration();
    });
</script>
@endsection
