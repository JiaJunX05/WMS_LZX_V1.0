{{-- ==========================================
    用户登录页面
    功能：用户身份验证，系统登录入口
    ========================================== --}}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Warehouse Management System - Login</title>

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
                <div class="illustration-icon"><i class="bi bi-box"></i></div>
                <h1 class="illustration-title">Welcome to WMS</h1>
                <p class="illustration-subtitle">Streamline your warehouse operations with our comprehensive management system</p>
            </div>
        </div>

        {{-- 右侧登录表单区域 --}}
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
                <h1 class="form-title">Sign In</h1>
                <p class="form-subtitle">Enter your credentials to access your account</p>
            </div>

            {{-- 登录表单 --}}
            <form action="{{ route('login.submit') }}" method="post" class="needs-validation" novalidate>
                @csrf

                {{-- 邮箱地址输入 --}}
                <div class="form-floating mb-4">
                    <input type="email" class="form-control" id="email" name="email" placeholder="Enter email address" required>
                    <label for="email"><i class="bi bi-envelope me-2"></i>Email Address</label>
                    <div class="invalid-feedback">Please enter a valid email address</div>
                </div>

                {{-- 密码输入 --}}
                <div class="mb-4">
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-lock"></i></span>
                        <input type="password" class="form-control" id="password" name="password"
                            placeholder="Enter password" required autocomplete="current-password">
                        <span class="input-group-text password-toggle" role="button" onclick="togglePassword()">
                            <i class="bi bi-eye-slash" id="togglePassword"></i>
                        </span>
                    </div>
                    <div class="invalid-feedback">Please enter password</div>
                </div>

                {{-- 记住我和忘记密码选项 --}}
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="remember" name="remember">
                        <label class="form-check-label" for="remember">Remember Me</label>
                    </div>
                    <a href="{{ route('password.request') }}" class="text-decoration-none">
                        <i class="bi bi-question-circle me-1"></i>Forgot Password?
                    </a>
                </div>

                {{-- 登录按钮 --}}
                <button type="submit" class="btn-login" name="submit" id="loginBtn">
                    <span class="btn-text">
                        <i class="bi bi-box-arrow-in-right me-1"></i>Login
                    </span>
                    <span class="btn-loading d-none">
                        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                    </span>
                </button>

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
        });
    </script>
</body>
</html>
