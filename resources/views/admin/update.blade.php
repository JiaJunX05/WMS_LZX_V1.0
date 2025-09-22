@extends("layouts.app")

@section("title", "Edit Staff Information")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/staff-management.css') }}">
<div class="container-fluid py-4">
    <!-- Alert Messages -->
    @if(session("success"))
        <div class="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            <span>{{ session("success") }}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if($errors->any())
        <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-circle-fill me-2"></i>
            <div>
                @foreach ($errors->all() as $error)
                    <div>{{ $error }}</div>
                @endforeach
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <!-- Page Title Card -->
    <div class="card shadow-sm border-0 mb-4">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                        <i class="bi bi-person-gear text-warning fs-4"></i>
                    </div>
                    <div>
                        <h4 class="mb-0 fw-bold">Edit Staff Information</h4>
                        <p class="text-muted mb-0">Modify staff basic information and permission settings</p>
                    </div>
                </div>
                <a href="{{ route('admin.staff_management') }}" class="btn btn-primary">
                    <i class="bi bi-arrow-left me-2"></i>Back to Staff Management
                </a>
            </div>
        </div>
    </div>

    <!-- Main Content Card -->
    <div class="card shadow-sm border-0">
        <div class="row g-0">
            <!-- Left User Info Area - Employee Card Style -->
            <div class="col-md-5">
                <div class="preview-section d-flex flex-column h-100 p-0">
                    <!-- Employee Card Container -->
                    <div class="employee-card">
                        <!-- Employee Card Header -->
                        <div class="card-header">
                            <div class="company-logo">
                                <i class="bi bi-building"></i>
                                <span>WMS</span>
                            </div>
                            <div class="card-title">Employee ID Card</div>
                        </div>

                        <!-- Employee Card Body -->
                        <div class="card-body">
                            <!-- Employee Photo Area -->
                            <div class="photo-section">
                                <div class="photo-placeholder">
                                    <i class="bi bi-person-circle"></i>
                                </div>
                            </div>

                            <!-- Employee Information -->
                            <div class="employee-info">
                                <div class="info-row">
                                    <span class="label">Name</span>
                                    <span class="value">{{ $user->name }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Email</span>
                                    <span class="value">{{ $user->email }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Role</span>
                                    <span class="role-badge role-{{ strtolower($user->account->account_role ?? 'staff') }}">
                                        {{ $user->account->account_role ?? 'N/A' }}
                                    </span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Status</span>
                                    <span class="status-badge status-{{ strtolower($user->account->account_status ?? 'unavailable') }}">
                                        {{ $user->account->account_status ?? 'N/A' }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Employee Card Footer -->
                        <div class="card-footer">
                            <div class="footer-text">WMS Warehouse Management System</div>
                            <div class="footer-date">{{ date('Y-m-d') }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Form Area -->
            <div class="col-md-7">
                <div class="card-body p-4">
                    <!-- Form Title -->
                    <h2 class="text-warning text-center mb-3">Edit Staff Information</h2>
                    <p class="text-muted text-center">Modify staff basic information and permission settings</p>
                    <hr>

                    <!-- Edit Form -->
                    <form action="{{ route('admin.update_user_submit', $user->id) }}" method="post">
                        @csrf
                        @method('PUT')

                        <!-- Name Input -->
                        <div class="mb-4">
                            <label for="name" class="form-label fw-bold">Staff Name</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="bi bi-person text-primary"></i>
                                </span>
                                <input type="text" class="form-control border-start-0" id="name" name="name"
                                       value="{{ old('name', $user->name) }}" placeholder="Enter staff name" required>
                            </div>
                        </div>

                        <!-- Email Input -->
                        <div class="mb-4">
                            <label for="email" class="form-label fw-bold">Email Address</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="bi bi-envelope text-primary"></i>
                                </span>
                                <input type="email" class="form-control border-start-0" id="email" name="email"
                                       value="{{ old('email', $user->email) }}" placeholder="Enter email address" required>
                            </div>
                        </div>

                        <!-- Password Input -->
                        <div class="mb-4">
                            <label for="password" class="form-label fw-bold">New Password <small class="text-muted">(leave blank to keep unchanged)</small></label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="bi bi-lock text-primary"></i>
                                </span>
                                <input type="password" class="form-control border-start-0 border-end-0" id="password" name="password"
                                       placeholder="Enter new password (leave blank to keep unchanged)">
                                <span class="input-group-text bg-light border-start-0" role="button" onclick="togglePassword('password', 'togglePassword')">
                                    <i class="bi bi-eye-slash text-primary" id="togglePassword"></i>
                                </span>
                            </div>
                        </div>

                        <!-- Confirm Password Input -->
                        <div class="mb-4">
                            <label for="password_confirmation" class="form-label fw-bold">Confirm New Password</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="bi bi-shield-lock text-primary"></i>
                                </span>
                                <input type="password" class="form-control border-start-0 border-end-0" id="password_confirmation"
                                       name="password_confirmation" placeholder="Confirm new password">
                                <span class="input-group-text bg-light border-start-0" role="button" onclick="togglePassword('password_confirmation', 'togglePasswordConfirm')">
                                    <i class="bi bi-eye-slash text-primary" id="togglePasswordConfirm"></i>
                                </span>
                            </div>
                        </div>

                        <!-- Role Display (Read-only) -->
                        <div class="mb-4">
                            <label class="form-label fw-bold">User Role</label>
                            <div class="row g-3">
                                @php
                                    $currentUserAccountRole = $user->account->account_role ?? 'Staff';
                                @endphp

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
                                    <small>You can only modify staff basic information, cannot change user roles</small>
                                </div>
                            </div>
                        </div>

                        <!-- Account Status Selection -->
                        <div class="mb-4">
                            <label class="form-label fw-bold">Account Status</label>
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
                        </div>

                        <hr class="my-4">
                        <div class="d-flex gap-3">
                            <button type="submit" class="btn btn-warning flex-fill">
                                <i class="bi bi-pencil-square me-2"></i>Update Staff Information
                            </button>
                            <a href="{{ route('admin.staff_management') }}" class="btn btn-outline-secondary">
                                <i class="bi bi-x-circle me-2"></i>Cancel
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    // 密码显示切换
    function togglePassword(passwordId, toggleId) {
        const password = document.getElementById(passwordId);
        const toggle = document.getElementById(toggleId);

        if (password.type === 'password') {
            password.type = 'text';
            toggle.classList.replace('bi-eye-slash', 'bi-eye');
        } else {
            password.type = 'password';
            toggle.classList.replace('bi-eye', 'bi-eye-slash');
        }
    }

    // 状态卡片选择效果
    document.addEventListener('DOMContentLoaded', function() {
        const statusCards = document.querySelectorAll('.status-card');
        const statusRadioInputs = document.querySelectorAll('input[name="account_status"]');

        // 为每个状态卡片添加点击事件
        statusCards.forEach(card => {
            card.addEventListener('click', function() {
                // 移除所有状态卡片的选中状态
                statusCards.forEach(c => c.classList.remove('selected'));

                // 添加当前卡片的选中状态
                this.classList.add('selected');

                // 选中对应的单选按钮
                const radio = this.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
            });
        });

        // 为状态单选按钮添加变化事件
        statusRadioInputs.forEach(radio => {
            radio.addEventListener('change', function() {
                // 移除所有状态卡片的选中状态
                statusCards.forEach(c => c.classList.remove('selected'));

                // 添加对应卡片的选中状态
                const card = this.closest('.status-card');
                if (card) {
                    card.classList.add('selected');
                }
            });
        });

        // 初始化选中状态
        const checkedStatusRadio = document.querySelector('input[name="account_status"]:checked');
        if (checkedStatusRadio) {
            const card = checkedStatusRadio.closest('.status-card');
            if (card) {
                card.classList.add('selected');
            }
        }
    });
</script>
@endsection
