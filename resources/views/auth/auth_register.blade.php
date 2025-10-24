@extends("layouts.app")

@section("title", "Create User Account")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">

<div class="container-fluid py-4">
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
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

    <div id="alertContainer" class="mb-4"></div>

    <form action="{{ route('register.submit') }}" method="post" enctype="multipart/form-data" id="userForm">
        @csrf
        <div class="row">
            <div class="col-lg-6">
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="card-title mb-0">User Information</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Username <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="username" id="username" placeholder="Enter username" required>
                        </div>

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

                        <div class="mb-3">
                            <label class="form-label">Email Address <span class="text-danger">*</span></label>
                            <input type="email" class="form-control" name="email" id="email" placeholder="Enter email address" required>
                        </div>

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

                <div class="card mb-4">
                    <div class="card-header"><h5 class="card-title mb-0">User Image</h5></div>
                    <div class="card-body">
                        <div class="mb-4">
                            <label class="form-label">Profile Image</label>
                            <div class="img-upload-area" id="user-image-area">
                                <div class="upload-placeholder" id="user-upload-placeholder">
                                    <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                    <h5 class="mt-3">Click to upload image</h5>
                                    <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                </div>
                                <img id="user-preview" class="img-preview d-none" alt="User Preview">
                                <button type="button" class="img-remove-btn d-none" id="remove-user-image">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                            <input type="file" class="d-none" id="user_image" name="user_image" accept="image/*">
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="card mb-4">
                    <div class="card-header"><h5 class="card-title mb-0">User Role</h5></div>
                    <div class="card-body">
                        @php
                            $currentUserRole = Auth::user()->getAccountRole();
                        @endphp

                        <div class="mb-3">
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

                        @if($currentUserRole === 'SuperAdmin')
                            <div class="mb-3">
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

                            <div class="mb-3">
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
                </div>

                <div class="card mb-4">
                    <div class="card-header"><h5 class="card-title mb-0">Submit User</h5></div>
                    <div class="card-body">
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
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/auth-management.js') }}"></script>

<script>
    window.createUserUrl = "{{ route('register.submit') }}";
    window.userManagementRoute = "{{ $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management') }}";
</script>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        initializeUserRegistration();
    });
</script>
@endsection
