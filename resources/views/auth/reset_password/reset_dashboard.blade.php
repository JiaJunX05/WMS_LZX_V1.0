{{-- ==========================================
    密码重置页面
    功能：用户密码重置，设置新密码
    ========================================== --}}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Warehouse Management System - Reset Password</title>

    {{-- 页面样式文件引入 --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="{{ asset('assets/css/login-page.css') }}">
</head>
<body>

    {{-- 页面主体内容 --}}
    <div class="main-container">

        {{-- 左侧插图区域 --}}
        <div class="illustration-section">
            <div class="illustration-content">
                <div class="illustration-icon"><i class="bi bi-key"></i></div>
                <h1 class="illustration-title">Reset Password</h1>
                <p class="illustration-subtitle">Enter your new password to complete the reset process</p>
            </div>
        </div>

        {{-- 右侧表单区域 --}}
        <div class="form-section">

            {{-- 错误消息显示 --}}
            @if ($errors->any())
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    @foreach ($errors->all() as $error)
                        <div>{{ $error }}</div>
                    @endforeach
                </div>
            @endif

            {{-- 成功消息显示 --}}
            @if(session("success"))
                <div class="alert alert-success" role="alert">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    {{ session("success") }}
                </div>
            @endif

            {{-- 表单标题区域 --}}
            <div class="form-header">
                <h1 class="form-title">Reset Password</h1>
                <p class="form-subtitle">Enter your new password below</p>
            </div>

            {{-- 密码重置表单 --}}
            <form action="{{ route('password.update') }}" method="post" class="needs-validation" novalidate>
                @csrf

                {{-- 隐藏的令牌字段 --}}
                <input type="hidden" name="token" value="{{ request()->route('token') }}">

                {{-- 邮箱地址输入 --}}
                <div class="form-floating mb-4">
                    <input type="email" class="form-control" id="email" name="email" placeholder="Enter email address"
                        value="{{ $email ?? '' }}" required autofocus>
                    <label for="email"><i class="bi bi-envelope me-2"></i>Email Address</label>
                    <div class="invalid-feedback">Please enter a valid email address</div>
                </div>

                {{-- 新密码输入 --}}
                <div class="mb-4">
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-lock"></i></span>
                        <input type="password" class="form-control" id="password" name="password"
                            placeholder="Enter new password" required>
                        <span class="input-group-text password-toggle" role="button" onclick="togglePassword()">
                            <i class="bi bi-eye-slash" id="togglePassword"></i>
                        </span>
                    </div>
                    <div class="invalid-feedback">Please enter a new password</div>
                </div>

                {{-- 确认密码输入 --}}
                <div class="mb-4">
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
                        <input type="password" class="form-control" id="password_confirmation" name="password_confirmation"
                            placeholder="Confirm new password" required>
                        <span class="input-group-text password-toggle" role="button" onclick="togglePasswordConfirmation()">
                            <i class="bi bi-eye-slash" id="togglePasswordConfirmation"></i>
                        </span>
                    </div>
                    <div class="invalid-feedback">
                        Please confirm your password
                    </div>
                </div>

                {{-- 提交按钮 --}}
                <button type="submit" class="btn-login" name="submit" id="resetBtn">
                    <span class="btn-text">
                        <i class="bi bi-key me-1"></i>Reset Password
                    </span>
                    <span class="btn-loading d-none">
                        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Resetting...
                    </span>
                </button>

                {{-- 返回登录链接 --}}
                <div class="text-center mt-4">
                    <a href="{{ route('login') }}" class="text-decoration-none">
                        <i class="bi bi-arrow-left me-1"></i> Back to Login
                    </a>
                </div>

                {{-- 安全提示 --}}
                <div class="text-center mt-4">
                    <small class="text-muted">
                        <i class="bi bi-shield-check me-1"></i> Your data is protected by 256-bit SSL encryption
                    </small>
                </div>
            </form>
        </div>
    </div>

    {{-- 引入必要的 JavaScript 文件 --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('assets/js/auth-management.js') }}"></script>

    {{-- 页面初始化脚本 --}}
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            initializeLoginPage();
            initializeResetFormSubmit();
        });
    </script>
</body>
</html>
