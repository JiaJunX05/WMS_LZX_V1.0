<!-- Header -->
<nav class="navbar navbar-expand-lg custom-navbar">
    <div class="container-fluid">
        <!-- Logo部分 -->
        <a class="navbar-brand" href="{{ Auth::check() ? route(Auth::user()->dashboardRoute()) : route('login') }}">
            <i class="bi bi-house-door-fill me-2"></i>
            <span class="brand-text">Warehouse Management System</span>
        </a>

        <!-- 移动端触发器 -->
        <button class="navbar-toggler navbar-dark" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebar" aria-controls="sidebar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
    </div>
</nav>
