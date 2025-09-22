<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Warehouse Management System - Login</title>

    <!-- CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .login-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .brand-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: relative;
            overflow: hidden;
        }

        .brand-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }

        .form-section {
            background: white;
            position: relative;
        }

        .form-floating {
            position: relative;
        }

        .form-floating > .form-control {
            height: calc(3.5rem + 2px);
            line-height: 1.25;
            padding: 1rem 0.75rem;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            transition: all 0.3s ease;
        }

        .form-floating > .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .form-floating > label {
            padding: 1rem 0.75rem;
            color: #6c757d;
            transition: all 0.3s ease;
        }

        .form-floating > .form-control:focus ~ label,
        .form-floating > .form-control:not(:placeholder-shown) ~ label {
            opacity: 0.65;
            transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
            color: #667eea;
        }

        .btn-login {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            padding: 12px 24px;
            font-weight: 600;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-login:active {
            transform: translateY(0);
        }

        .btn-login::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .btn-login:hover::before {
            left: 100%;
        }

        .input-group-text {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 12px 0 0 12px;
            color: #667eea;
            transition: all 0.3s ease;
        }

        .form-control {
            border: 2px solid #e9ecef;
            border-radius: 0 12px 12px 0;
            transition: all 0.3s ease;
        }

        .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .password-toggle {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-left: none;
            border-radius: 0 12px 12px 0;
            color: #667eea;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .password-toggle:hover {
            background: #e9ecef;
            color: #5a6fd8;
        }

        .alert {
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .floating-shapes {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
        }

        .shape {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
        }

        .shape:nth-child(1) {
            width: 80px;
            height: 80px;
            top: 20%;
            left: 10%;
            animation-delay: 0s;
        }

        .shape:nth-child(2) {
            width: 120px;
            height: 120px;
            top: 60%;
            right: 10%;
            animation-delay: 2s;
        }

        .shape:nth-child(3) {
            width: 60px;
            height: 60px;
            top: 40%;
            left: 80%;
            animation-delay: 4s;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }

        .brand-icon {
            font-size: 4rem;
            background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
        }

        .remember-me {
            color: #6c757d;
        }

        .forgot-password {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .forgot-password:hover {
            color: #5a6fd8;
            text-decoration: underline;
        }

        .form-check-input:checked {
            background-color: #667eea;
            border-color: #667eea;
        }

        .form-check-input:focus {
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
    </style>
</head>
<body>
    <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3">
        <div class="row w-100 justify-content-center">
            <div class="col-12 col-lg-10 col-xl-8">
                <div class="login-container">
                    <div class="row g-0">
                        <!-- Left: Brand Display Area -->
                        <div class="col-lg-6 brand-section d-flex flex-column justify-content-center align-items-center p-5 position-relative">
                            <div class="floating-shapes">
                                <div class="shape"></div>
                                <div class="shape"></div>
                                <div class="shape"></div>
                            </div>
                            <div class="text-center text-white position-relative z-1">
                                <div class="mb-4">
                                    <i class="bi bi-warehouse brand-icon"></i>
                                </div>
                                <h2 class="fw-bold mb-3">Warehouse Management System</h2>
                                <p class="lead fst-italic opacity-90 mb-4">
                                    Efficient Management, Smart Storage<br>
                                    Take Your Business to the Next Level
                                </p>
                                <div class="d-flex justify-content-center gap-3">
                                    <div class="text-center">
                                        <div class="h4 mb-1">1000+</div>
                                        <small class="opacity-75">Active Users</small>
                                    </div>
                                    <div class="text-center">
                                        <div class="h4 mb-1">99.9%</div>
                                        <small class="opacity-75">System Stability</small>
                                    </div>
                                    <div class="text-center">
                                        <div class="h4 mb-1">24/7</div>
                                        <small class="opacity-75">Technical Support</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right: Login Form Area -->
                        <div class="col-lg-6 form-section p-5 d-flex flex-column justify-content-center">
                            <div class="w-100">
                                <!-- Error Messages -->
                                @if ($errors->any())
                                    <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center mb-4" role="alert">
                                        <i class="bi bi-exclamation-triangle-fill me-3 fs-5"></i>
                                        <div>
                                            @foreach ($errors->all() as $error)
                                                <div class="mb-1">{{ $error }}</div>
                                            @endforeach
                                        </div>
                                        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>
                                @endif

                                <!-- Success Messages -->
                                @if(session("success"))
                                    <div class="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4" role="alert">
                                        <i class="bi bi-check-circle-fill me-3 fs-5"></i>
                                        <div>{{ session("success") }}</div>
                                        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>
                                @endif

                                <!-- Title -->
                                <div class="text-center mb-4">
                                    <h1 class="fw-bold text-dark mb-2">Welcome Back</h1>
                                    <p class="text-muted">Please log in to your account to continue using the system</p>
                                </div>

                                <form action="{{route('login.submit')}}" method="post" class="needs-validation" novalidate>
                                    @csrf

                                    <!-- Email Input -->
                                    <div class="form-floating mb-4">
                                        <input type="email" class="form-control" id="email" name="email" placeholder="Enter email address" required>
                                        <label for="email">
                                            <i class="bi bi-envelope me-2"></i>Email Address
                                        </label>
                                        <div class="invalid-feedback">
                                            Please enter a valid email address
                                        </div>
                                    </div>

                                    <!-- Password Input -->
                                    <div class="mb-4">
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="bi bi-lock"></i>
                                            </span>
                                            <input type="password" class="form-control" id="password" name="password" placeholder="Enter password" required autocomplete="current-password">
                                            <span class="input-group-text password-toggle" role="button" onclick="togglePassword()">
                                                <i class="bi bi-eye-slash" id="togglePassword"></i>
                                            </span>
                                        </div>
                                        <div class="invalid-feedback">
                                            Please enter password
                                        </div>
                                    </div>

                                    <!-- Remember Me and Forgot Password -->
                                    <div class="d-flex justify-content-between align-items-center mb-4">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="remember" name="remember">
                                            <label class="form-check-label remember-me" for="remember">
                                                Remember Me
                                            </label>
                                        </div>
                                        <a href="#" class="forgot-password">Forgot Password?</a>
                                    </div>

                                    <!-- Login Button -->
                                    <button type="submit" class="btn btn-primary btn-login w-100 mb-3" name="submit">
                                        <i class="bi bi-box-arrow-in-right me-2"></i>Login Now
                                    </button>

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
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

    <script>
        // 密码显示切换
        function togglePassword() {
            const password = document.getElementById('password');
            const toggle = document.getElementById('togglePassword');

            if (password.type === 'password') {
                password.type = 'text';
                toggle.classList.replace('bi-eye-slash', 'bi-eye');
            } else {
                password.type = 'password';
                toggle.classList.replace('bi-eye', 'bi-eye-slash');
            }
        }

        // 表单验证
        (function() {
            'use strict';
            window.addEventListener('load', function() {
                var forms = document.getElementsByClassName('needs-validation');
                var validation = Array.prototype.filter.call(forms, function(form) {
                    form.addEventListener('submit', function(event) {
                        if (form.checkValidity() === false) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        form.classList.add('was-validated');
                    }, false);
                });
            }, false);
        })();

        // 输入框动画效果
        document.querySelectorAll('.form-control').forEach(input => {
            // 焦点效果
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
            });

            // 实时验证
            input.addEventListener('input', function() {
                if (this.checkValidity()) {
                    this.classList.add('is-valid');
                    this.classList.remove('is-invalid');
                } else if (this.value) {
                    this.classList.add('is-invalid');
                    this.classList.remove('is-valid');
                }
            });
        });

        // 登录按钮波纹效果
        document.querySelector('.btn-login').addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });

        // 添加波纹动画CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // 自动关闭警告
        setTimeout(function() {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(function(alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            });
        }, 5000);

        // 页面加载动画
        window.addEventListener('load', function() {
            document.querySelector('.login-container').style.opacity = '0';
            document.querySelector('.login-container').style.transform = 'translateY(30px)';

            setTimeout(() => {
                document.querySelector('.login-container').style.transition = 'all 0.6s ease';
                document.querySelector('.login-container').style.opacity = '1';
                document.querySelector('.login-container').style.transform = 'translateY(0)';
            }, 100);
        });

        // 键盘快捷键
        document.addEventListener('keydown', function(e) {
            // Enter键提交表单
            if (e.key === 'Enter' && !e.shiftKey) {
                const form = document.querySelector('form');
                if (form) {
                    form.requestSubmit();
                }
            }
        });

        // 输入框自动聚焦
        document.addEventListener('DOMContentLoaded', function() {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.focus();
            }
        });
    </script>
</body>
</html>
