@extends("layouts.app")

@section("title", "Dashboard")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard.css') }}">


<div class="container-fluid py-4">
    <!-- Dashboard Header -->
    <header class="dashboard-header" role="banner">
        <div class="welcome-banner entering" aria-label="Welcome message">
            <div class="welcome-content">
                <div class="welcome-text">
                    <h1 class="welcome-title" id="welcome-title">
                        Welcome Back, {{ auth()->user()->name }}! 🎉
                    </h1>
                    <p class="welcome-subtitle">
                        You have done great work today. Check your dashboard overview below.
                    </p>
                    <div class="user-role-badge" role="status" aria-label="User role">
                        <i class="bi bi-shield-check me-2" aria-hidden="true"></i>
                        {{ $userRole }} Panel
                    </div>
                </div>
                <div class="welcome-illustration" aria-hidden="true">
                    <div class="illustration-container">
                        <i class="bi bi-person-circle illustration-icon"></i>
                        <div class="floating-shapes">
                            <div class="shape shape-1"></div>
                            <div class="shape shape-2"></div>
                            <div class="shape shape-3"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Dashboard Grid -->
    <main class="row g-4" role="main" aria-label="Dashboard statistics">
        <!-- Staff Card -->
        <div class="col-lg-4 col-md-6 col-sm-12 col-12">
            <div class="dashboard-card theme-success">
                <div class="dashboard-card-header">
                    <div class="dashboard-card-title">
                        <div class="dashboard-card-icon">
                            <i class="bi bi-people"></i>
                        </div>
                        Staff
                    </div>
                    <p class="dashboard-card-subtitle">User management and roles</p>
                </div>
                <div class="dashboard-card-body">
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-info">
                                <i class="bi bi-person-check"></i>
                            </div>
                            <span class="stat-label">Total Users</span>
                        </div>
                        <span class="stat-value" id="total-staff">{{ $stats['staff']['total'] ?? 0 }}</span>
                    </div>
                    @if($userRole === 'SuperAdmin')
                        <div class="stat-item">
                            <div class="d-flex align-items-center">
                                <div class="stat-icon bg-danger">
                                    <i class="bi bi-shield-check"></i>
                                </div>
                                <span class="stat-label">Admins</span>
                            </div>
                            <span class="stat-value" id="admin-staff">{{ $stats['staff']['admin'] ?? 0 }}</span>
                        </div>
                        <div class="stat-item">
                            <div class="d-flex align-items-center">
                                <div class="stat-icon bg-primary">
                                    <i class="bi bi-person"></i>
                                </div>
                                <span class="stat-label">Staff Members</span>
                            </div>
                            <span class="stat-value" id="staff-members">{{ $stats['staff']['staff'] ?? 0 }}</span>
                        </div>
                    @else
                        <div class="stat-item">
                            <div class="d-flex align-items-center">
                                <div class="stat-icon bg-info">
                                    <i class="bi bi-info-circle"></i>
                                </div>
                                <span class="stat-label">Role Details</span>
                            </div>
                            <span class="stat-value" style="color: var(--gray-500); font-size: 0.875rem;">Limited Access</span>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Products Card -->
        <div class="col-lg-4 col-md-6 col-sm-12 col-12">
            <div class="dashboard-card theme-primary">
                <div class="dashboard-card-header">
                    <div class="dashboard-card-title">
                        <div class="dashboard-card-icon">
                            <i class="bi bi-box-seam"></i>
                        </div>
                        Products
                    </div>
                    <p class="dashboard-card-subtitle">Product management and inventory</p>
                </div>
                <div class="dashboard-card-body">
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-primary">
                                <i class="bi bi-collection"></i>
                            </div>
                            <span class="stat-label">Total Products</span>
                        </div>
                        <span class="stat-value" id="total-products">{{ $stats['products']['total'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-success">
                                <i class="bi bi-check-circle"></i>
                            </div>
                            <span class="stat-label">Active</span>
                        </div>
                        <span class="stat-value" id="active-products">{{ $stats['products']['active'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-secondary">
                                <i class="bi bi-pause-circle"></i>
                            </div>
                            <span class="stat-label">Inactive</span>
                        </div>
                        <span class="stat-value" id="inactive-products">{{ $stats['products']['inactive'] ?? 0 }}</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-label">
                            <span>Active Rate</span>
                            <span id="active-rate">{{ $stats['products']['total'] > 0 ? round(($stats['products']['active'] / $stats['products']['total']) * 100, 1) : 0 }}%</span>
                        </div>
                        <div class="progress-bar-custom">
                            <div class="progress-fill" style="width: {{ $stats['products']['total'] > 0 ? ($stats['products']['active'] / $stats['products']['total']) * 100 : 0 }}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stock Movement Card -->
        <div class="col-lg-4 col-md-6 col-sm-12 col-12">
            <div class="dashboard-card theme-danger">
                <div class="dashboard-card-header">
                    <div class="dashboard-card-title">
                        <div class="dashboard-card-icon">
                            <i class="bi bi-arrow-left-right"></i>
                        </div>
                        Stock Movement
                    </div>
                    <p class="dashboard-card-subtitle">Inventory tracking</p>
                </div>
                <div class="dashboard-card-body">
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-info">
                                <i class="bi bi-list-check"></i>
                            </div>
                            <span class="stat-label">Total Movements</span>
                        </div>
                        <span class="stat-value" id="total-movements">{{ $stats['stock']['total_items'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-success">
                                <i class="bi bi-arrow-down-circle"></i>
                            </div>
                            <span class="stat-label">Stock In</span>
                        </div>
                        <span class="stat-value" id="stock-in">{{ $stats['stock']['in_stock'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-danger">
                                <i class="bi bi-arrow-up-circle"></i>
                            </div>
                            <span class="stat-label">Stock Out</span>
                        </div>
                        <span class="stat-value" id="stock-out">{{ $stats['stock']['out_stock'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-warning">
                                <i class="bi bi-arrow-up-circle"></i>
                            </div>
                            <span class="stat-label">Stock Return</span>
                        </div>
                        <span class="stat-value" id="stock-return">{{ $stats['stock']['return_stock'] ?? 0 }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Categories Card -->
        <div class="col-lg-4 col-md-6 col-sm-12 col-12">
            <div class="dashboard-card theme-info">
                <div class="dashboard-card-header">
                    <div class="dashboard-card-title">
                        <div class="dashboard-card-icon">
                            <i class="bi bi-tags"></i>
                        </div>
                        Categories
                    </div>
                    <p class="dashboard-card-subtitle">Product categorization</p>
                </div>
                <div class="dashboard-card-body">
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-primary">
                                <i class="bi bi-folder"></i>
                            </div>
                            <span class="stat-label">Main Categories</span>
                        </div>
                        <span class="stat-value" id="main-categories">{{ $stats['categories']['categories'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-info">
                                <i class="bi bi-folder2-open"></i>
                            </div>
                            <span class="stat-label">Subcategories</span>
                        </div>
                        <span class="stat-value" id="subcategories">{{ $stats['categories']['subcategories'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-warning">
                                <i class="bi bi-diagram-2"></i>
                            </div>
                            <span class="stat-label">Mappings</span>
                        </div>
                        <span class="stat-value" id="mappings">{{ $stats['categories']['mappings'] ?? 0 }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Storage Locations Card -->
        <div class="col-lg-4 col-md-6 col-sm-12 col-12">
            <div class="dashboard-card theme-purple">
                <div class="dashboard-card-header">
                    <div class="dashboard-card-title">
                        <div class="dashboard-card-icon">
                            <i class="bi bi-geo-alt"></i>
                        </div>
                        Storage
                    </div>
                    <p class="dashboard-card-subtitle">Warehouse locations</p>
                </div>
                <div class="dashboard-card-body">
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-primary">
                                <i class="bi bi-building"></i>
                            </div>
                            <span class="stat-label">Zones</span>
                        </div>
                        <span class="stat-value" id="zones">{{ $stats['locations']['zones'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-info">
                                <i class="bi bi-grid-3x3"></i>
                            </div>
                            <span class="stat-label">Racks</span>
                        </div>
                        <span class="stat-value" id="racks">{{ $stats['locations']['racks'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-success">
                                <i class="bi bi-pin-map"></i>
                            </div>
                            <span class="stat-label">Locations</span>
                        </div>
                        <span class="stat-value" id="locations">{{ $stats['locations']['locations'] ?? 0 }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sizes Card -->
        <div class="col-lg-4 col-md-6 col-sm-12 col-12">
            <div class="dashboard-card theme-warning">
                <div class="dashboard-card-header">
                    <div class="dashboard-card-title">
                        <div class="dashboard-card-icon">
                            <i class="bi bi-rulers"></i>
                        </div>
                        Sizes
                    </div>
                    <p class="dashboard-card-subtitle">Size management system</p>
                </div>
                <div class="dashboard-card-body">
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-primary">
                                <i class="bi bi-person-badge"></i>
                            </div>
                            <span class="stat-label">Size Libraries</span>
                        </div>
                        <span class="stat-value" id="size-libraries">{{ $stats['sizes']['size_libraries'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-info">
                                <i class="bi bi-shoe-prints"></i>
                            </div>
                            <span class="stat-label">Size Templates</span>
                        </div>
                        <span class="stat-value" id="size-templates">{{ $stats['sizes']['size_templates'] ?? 0 }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Brand Card -->
        <div class="col-lg-4 col-md-6 col-sm-12 col-12">
            <div class="dashboard-card theme-indigo">
                <div class="dashboard-card-header">
                    <div class="dashboard-card-title">
                        <div class="dashboard-card-icon">
                            <i class="bi bi-award"></i>
                        </div>
                        Brands
                    </div>
                    <p class="dashboard-card-subtitle">Brand management</p>
                </div>
                <div class="dashboard-card-body">
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-primary">
                                <i class="bi bi-trophy"></i>
                            </div>
                            <span class="stat-label">Total Brands</span>
                        </div>
                        <span class="stat-value" id="total-brands">{{ $stats['brands']['total'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-success">
                                <i class="bi bi-check-circle"></i>
                            </div>
                            <span class="stat-label">Active</span>
                        </div>
                        <span class="stat-value" id="active-brands">{{ $stats['brands']['active'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-secondary">
                                <i class="bi bi-pause-circle"></i>
                            </div>
                            <span class="stat-label">Inactive</span>
                        </div>
                        <span class="stat-value" id="inactive-brands">{{ $stats['brands']['inactive'] ?? 0 }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Color Card -->
        <div class="col-lg-4 col-md-6 col-sm-12 col-12">
            <div class="dashboard-card theme-purple">
                <div class="dashboard-card-header">
                    <div class="dashboard-card-title">
                        <div class="dashboard-card-icon">
                            <i class="bi bi-palette"></i>
                        </div>
                        Colors
                    </div>
                    <p class="dashboard-card-subtitle">Color variants</p>
                </div>
                <div class="dashboard-card-body">
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-primary">
                                <i class="bi bi-palette-fill"></i>
                            </div>
                            <span class="stat-label">Total Colors</span>
                        </div>
                        <span class="stat-value" id="total-colors">{{ $stats['colors']['total'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-success">
                                <i class="bi bi-check-circle"></i>
                            </div>
                            <span class="stat-label">Active</span>
                        </div>
                        <span class="stat-value" id="active-colors">{{ $stats['colors']['active'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-secondary">
                                <i class="bi bi-pause-circle"></i>
                            </div>
                            <span class="stat-label">Inactive</span>
                        </div>
                        <span class="stat-value" id="inactive-colors">{{ $stats['colors']['inactive'] ?? 0 }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Gender Card -->
        <div class="col-lg-4 col-md-6 col-sm-12 col-12">
            <div class="dashboard-card theme-warning">
                <div class="dashboard-card-header">
                    <div class="dashboard-card-title">
                        <div class="dashboard-card-icon">
                            <i class="bi bi-person-heart"></i>
                        </div>
                        Gender
                    </div>
                    <p class="dashboard-card-subtitle">Target demographics</p>
                </div>
                <div class="dashboard-card-body">
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-primary">
                                <i class="bi bi-person"></i>
                            </div>
                            <span class="stat-label">Total Gender</span>
                        </div>
                        <span class="stat-value" id="total-gender">{{ $stats['gender']['total'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-success">
                                <i class="bi bi-check-circle"></i>
                            </div>
                            <span class="stat-label">Active</span>
                        </div>
                        <span class="stat-value" id="active-gender">{{ $stats['gender']['active'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-secondary">
                                <i class="bi bi-pause-circle"></i>
                            </div>
                            <span class="stat-label">Inactive</span>
                        </div>
                        <span class="stat-value" id="inactive-gender">{{ $stats['gender']['inactive'] ?? 0 }}</span>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>
@endsection

@section('scripts')
<script>
    // 设置用户角色到全局变量
    window.userRole = '{{ $userRole }}';
</script>
<script src="{{ asset('assets/js/system-dashboard.js') }}"></script>
@endsection
