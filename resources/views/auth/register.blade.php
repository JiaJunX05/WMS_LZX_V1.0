@extends("layouts.app")

@section("title", "Create Account")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/auth/register.css') }}">
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
                    <div class="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                        <i class="bi bi-person-plus-fill text-primary fs-4"></i>
                    </div>
                    <div>
                        <h4 class="mb-0 fw-bold">Staff Registration</h4>
                        <p class="text-muted mb-0">Fill in the information to create a new account and start using the system</p>
                    </div>
                </div>
                <a href="{{ route('staff_management') }}" class="btn btn-primary">
                    <i class="bi bi-arrow-left me-2"></i>Back to Home
                </a>
            </div>
        </div>
    </div>

    <!-- Main Content Card -->
    <div class="card shadow-sm border-0">
        <div class="row g-0">
            <!-- Left Icon Area -->
            <div class="col-md-5">
                <div class="preview-section d-flex flex-column h-100 bg-light p-3">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-person-badge me-2"></i>Account Information
                        </h6>
                    </div>
                    <div class="preview-container flex-grow-1 d-flex align-items-center justify-content-center">
                        <div class="text-center">
                            <i class="bi bi-person-circle text-primary" style="font-size: 8rem;"></i>
                            <p class="text-muted mt-3">User Account Management</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Form Area -->
            <div class="col-md-7">
                <div class="card-body p-4">
                    <!-- Form Title -->
                    <h2 class="text-primary text-center mb-3">Create Account</h2>
                    <p class="text-muted text-center">Fill in your information to create a new account</p>
                    <hr>

                    <!-- Registration Form -->
                    <form action="{{ route('register.submit') }}" method="post">
                        @csrf

                        <!-- Name Input -->
                        <div class="mb-4">
                            <label for="name" class="form-label fw-bold">Staff Name</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="bi bi-person text-primary"></i>
                                </span>
                                <input type="text" class="form-control border-start-0" id="name" name="name"
                                       placeholder="Enter your name" required>
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
                                       placeholder="Enter your email" required>
                            </div>
                        </div>

                        <!-- Password Input -->
                        <div class="mb-4">
                            <label for="password" class="form-label fw-bold">Password</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="bi bi-lock text-primary"></i>
                                </span>
                                <input type="password" class="form-control border-start-0 border-end-0" id="password" name="password"
                                       placeholder="Enter password" required>
                                <span class="input-group-text bg-light border-start-0" role="button" onclick="togglePassword('password', 'togglePassword')">
                                    <i class="bi bi-eye-slash text-primary" id="togglePassword"></i>
                                </span>
                            </div>
                        </div>

                        <!-- Confirm Password Input -->
                        <div class="mb-4">
                            <label for="password_confirmation" class="form-label fw-bold">Confirm Password</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="bi bi-shield-lock text-primary"></i>
                                </span>
                                <input type="password" class="form-control border-start-0 border-end-0" id="password_confirmation"
                                       name="password_confirmation" placeholder="Confirm password" required>
                                <span class="input-group-text bg-light border-start-0" role="button" onclick="togglePassword('password_confirmation', 'togglePasswordConfirm')">
                                    <i class="bi bi-eye-slash text-primary" id="togglePasswordConfirm"></i>
                                </span>
                            </div>
                        </div>

                        <!-- Role Selection -->
                        <div class="mb-4">
                            <label class="form-label fw-bold">Select Role</label>
                            <div class="row g-3 role-cards">
                                @php
                                    $currentUserRole = Auth::user()->getAccountRole();
                                @endphp

                                <!-- Staff Option - All roles can create -->
                                <div class="col-lg-4 col-md-6 col-sm-12">
                                    <div class="card h-100 border role-card" data-role="Staff">
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

                                <!-- Admin Option - Only SuperAdmin can create -->
                                @if($currentUserRole === 'SuperAdmin')
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
                                @endif

                                <!-- SuperAdmin Option - Only SuperAdmin can create -->
                                @if($currentUserRole === 'SuperAdmin')
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

                            <!-- Permission Notice -->
                            <div class="mt-3">
                                <div class="alert alert-info alert-sm d-flex align-items-center" role="alert">
                                    <i class="bi bi-info-circle me-2"></i>
                                    <small>
                                        @if($currentUserRole === 'SuperAdmin')
                                            You can create Staff, Admin, and SuperAdmin accounts.
                                        @elseif($currentUserRole === 'Admin')
                                            You can only create Staff accounts.
                                        @else
                                            You don't have permission to create accounts.
                                        @endif
                                    </small>
                                </div>
                            </div>
                        </div>

                        <hr class="my-4">
                        <button type="submit" class="btn btn-primary w-100">
                            <i class="bi bi-person-plus-fill me-2"></i>Create Account
                        </button>
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

    // 角色卡片选择效果
    document.addEventListener('DOMContentLoaded', function() {
        const roleCards = document.querySelectorAll('.role-card');
        const radioInputs = document.querySelectorAll('input[name="account_role"]');

        // 为每个角色卡片添加点击事件
        roleCards.forEach(card => {
            card.addEventListener('click', function() {
                // 移除所有卡片的选中状态
                roleCards.forEach(c => c.classList.remove('selected'));

                // 添加当前卡片的选中状态
                this.classList.add('selected');

                // 选中对应的单选按钮
                const radio = this.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
            });
        });

        // 为单选按钮添加变化事件
        radioInputs.forEach(radio => {
            radio.addEventListener('change', function() {
                // 移除所有卡片的选中状态
                roleCards.forEach(c => c.classList.remove('selected'));

                // 添加对应卡片的选中状态
                const card = this.closest('.role-card');
                if (card) {
                    card.classList.add('selected');
                }
            });
        });

        // 初始化选中状态
        const checkedRadio = document.querySelector('input[name="account_role"]:checked');
        if (checkedRadio) {
            const card = checkedRadio.closest('.role-card');
            if (card) {
                card.classList.add('selected');
            }
        }
    });
</script>

<style>
    /* 角色卡片选中效果 */
    .role-card {
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .role-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .role-card.selected {
        border-color: #0d6efd !important;
        background-color: rgba(13, 110, 253, 0.05);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
    }

    .role-card.selected .card-title {
        color: #0d6efd;
    }

    /* 权限提示样式 */
    .alert-sm {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
    }
</style>
@endsection
