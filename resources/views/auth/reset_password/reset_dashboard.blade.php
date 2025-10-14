<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Warehouse Management System - Reset Password</title>

    <!-- CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="{{ asset('assets/css/login-page.css') }}">
</head>
<body>
    <div class="main-container">
        <!-- 左侧插图区域 -->
        <div class="illustration-section">
            <div class="illustration-content">
                <div class="illustration-icon">
                    <i class="bi bi-key"></i>
                </div>
                <h1 class="illustration-title">Reset Password</h1>
                <p class="illustration-subtitle">Enter your new password to complete the reset process</p>
            </div>
        </div>

        <!-- 右侧表单区域 -->
        <div class="form-section">
            <!-- 错误消息 -->
            @if ($errors->any())
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    @foreach ($errors->all() as $error)
                        <div>{{ $error }}</div>
                    @endforeach
                </div>
            @endif

            <!-- 成功消息 -->
            @if(session("success"))
                <div class="alert alert-success" role="alert">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    {{ session("success") }}
                </div>
            @endif

            <!-- 表单标题 -->
            <div class="form-header">
                <h1 class="form-title">Reset Password</h1>
                <p class="form-subtitle">Enter your new password below</p>
            </div>

            <form action="{{ route('password.update') }}" method="post" class="needs-validation" novalidate>
                @csrf

                <!-- Hidden Token -->
                <input type="hidden" name="token" value="{{ request()->route('token') }}">

                <!-- Email Input -->
                <div class="form-floating mb-4">
                    <input type="email" class="form-control" id="email" name="email" placeholder="Enter email address" value="{{ $email ?? '' }}" required autofocus>
                    <label for="email">
                        <i class="bi bi-envelope me-2"></i>Email Address
                    </label>
                    <div class="invalid-feedback">
                        Please enter a valid email address
                    </div>
                </div>

                <!-- New Password Input -->
                <div class="mb-4">
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="bi bi-lock"></i>
                        </span>
                        <input type="password" class="form-control" id="password" name="password" placeholder="Enter new password" required>
                        <span class="input-group-text password-toggle" role="button" onclick="togglePassword()">
                            <i class="bi bi-eye-slash" id="togglePassword"></i>
                        </span>
                    </div>
                    <div class="invalid-feedback">
                        Please enter a new password
                    </div>
                </div>

                <!-- Confirm Password Input -->
                <div class="mb-4">
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="bi bi-lock-fill"></i>
                        </span>
                        <input type="password" class="form-control" id="password_confirmation" name="password_confirmation" placeholder="Confirm new password" required>
                        <span class="input-group-text password-toggle" role="button" onclick="togglePasswordConfirmation()">
                            <i class="bi bi-eye-slash" id="togglePasswordConfirmation"></i>
                        </span>
                    </div>
                    <div class="invalid-feedback">
                        Please confirm your password
                    </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn-login" name="submit">
                    Reset Password
                    <i class="bi bi-arrow-right"></i>
                </button>

                <!-- Back to Login -->
                <div class="text-center mt-4">
                    <a href="{{ route('login') }}" class="text-decoration-none">
                        <i class="bi bi-arrow-left me-1"></i>
                        Back to Login
                    </a>
                </div>

                <!-- System Information -->
                <div class="text-center mt-4">
                    <small class="text-muted">
                        <i class="bi bi-shield-check me-1"></i>
                        Your data is protected by 256-bit SSL encryption
                    </small>
                </div>
            </form>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Auth Management JS -->
    <script src="{{ asset('assets/js/auth-management.js') }}"></script>

    <script>
        // 页面初始化由 auth-management.js 处理
        document.addEventListener('DOMContentLoaded', function() {
            initializeLoginPage();
        });
    </script>
</body>
</html>
