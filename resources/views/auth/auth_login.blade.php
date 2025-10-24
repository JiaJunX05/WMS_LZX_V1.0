<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Warehouse Management System - Login</title>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="{{ asset('assets/css/login-page.css') }}">
</head>
<body>
    <div class="main-container">
        <div class="illustration-section">
            <div class="illustration-content">
                <div class="illustration-icon">
                    <i class="bi bi-box"></i>
                </div>
                <h1 class="illustration-title">Welcome to WMS</h1>
                <p class="illustration-subtitle">Streamline your warehouse operations with our comprehensive management system</p>
            </div>
        </div>

        <div class="form-section">
            @if ($errors->any())
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    @foreach ($errors->all() as $error)
                        <div>{{ $error }}</div>
                    @endforeach
                </div>
            @endif

            @if(session("success"))
                <div class="alert alert-success" role="alert">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    {{ session("success") }}
                </div>
            @endif

            <div class="form-header">
                <h1 class="form-title">Sign In</h1>
                <p class="form-subtitle">Enter your credentials to access your account</p>
            </div>

            <form action="{{route('login.submit')}}" method="post" class="needs-validation" novalidate>
                @csrf

                <div class="form-floating mb-4">
                    <input type="email" class="form-control" id="email" name="email" placeholder="Enter email address" required>
                    <label for="email">
                        <i class="bi bi-envelope me-2"></i>Email Address
                    </label>
                    <div class="invalid-feedback">
                        Please enter a valid email address
                    </div>
                </div>

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

                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="remember" name="remember">
                        <label class="form-check-label remember-me" for="remember">
                            Remember Me
                        </label>
                    </div>
                    <a href="{{ route('password.request') }}" class="forgot-password">Forgot Password?</a>
                </div>

                <button type="submit" class="btn-login" name="submit">
                    Login
                    <i class="bi bi-arrow-right"></i>
                </button>

                <div class="text-center mt-4">
                    <small class="text-muted">
                        <i class="bi bi-shield-check me-1"></i>
                        Your data is protected by 256-bit SSL encryption
                    </small>
                </div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('assets/js/auth-management.js') }}"></script>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            initializeLoginPage();
        });
    </script>
</body>
</html>
