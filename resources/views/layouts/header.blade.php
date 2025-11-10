<!-- Header -->
<nav class="navbar navbar-expand-lg custom-navbar">
    <div class="container-fluid">
        <!-- Logo部分 -->
        <a class="navbar-brand" href="{{ Auth::check() ? route(Auth::user()->dashboardRoute()) : route('login') }}">
            <div class="brand-icon-wrapper">
                <i class="bi bi-house-door-fill"></i>
            </div>
            <div class="brand-content">
                <span class="brand-text">WMS Dashboard</span>
                <span class="brand-subtitle">Warehouse Management System</span>
            </div>
        </a>

        <!-- 移动端侧边栏触发器 -->
        <button class="navbar-toggler navbar-dark d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSidebar" aria-controls="offcanvasSidebar" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
    </div>
</nav>

<!-- 全局提示信息区域 -->
<div class="global-alert-container" id="globalAlertContainer">
    <!-- Alert 将通过 JavaScript 动态添加 -->
</div>
