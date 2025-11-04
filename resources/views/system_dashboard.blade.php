@extends("layouts.app")

@section("title", "Dashboard")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

<style>
    /* 5列布局样式 - 每行显示5个卡片 */
    @media (min-width: 1200px) {
        .statistics-section .row {
            display: flex;
            flex-wrap: wrap;
        }

        .statistics-section .row > [class*="col-xl-2"] {
            flex: 0 0 20%;
            max-width: 20%;
        }
    }
</style>


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

    <!-- Dashboard Grid - 10 cards, 5 per row -->
    <main class="statistics-section" role="main" aria-label="Dashboard statistics">
        <div class="row g-4" style="--bs-gutter-y: 1rem;">
            <!-- Staff Card -->
            <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                <div class="stats-card theme-success">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="total-staff">{{ $stats['staff']['total'] ?? 0 }}</div>
                                <div class="small text-muted fw-medium text-uppercase">Total Staff</div>
                            </div>
                            <div class="d-flex align-items-center justify-content-center rounded icon-size-3rem">
                                <i class="bi bi-people text-white fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Products Card -->
            <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                <div class="stats-card theme-primary">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="total-products">{{ $stats['products']['total'] ?? 0 }}</div>
                                <div class="small text-muted fw-medium text-uppercase">Available Products</div>
                            </div>
                            <div class="d-flex align-items-center justify-content-center rounded icon-size-3rem">
                                <i class="bi bi-box-seam text-white fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Category Card -->
            <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                <div class="stats-card theme-info">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="main-categories">{{ $stats['categories']['categories'] ?? 0 }}</div>
                                <div class="small text-muted fw-medium text-uppercase">Categories</div>
                            </div>
                            <div class="d-flex align-items-center justify-content-center rounded icon-size-3rem">
                                <i class="bi bi-tags text-white fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Subcategory Card -->
            <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                <div class="stats-card theme-info">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="subcategories">{{ $stats['categories']['subcategories'] ?? 0 }}</div>
                                <div class="small text-muted fw-medium text-uppercase">Subcategories</div>
                            </div>
                            <div class="d-flex align-items-center justify-content-center rounded icon-size-3rem">
                                <i class="bi bi-tag text-white fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Storage Card -->
            <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                <div class="stats-card theme-purple">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="zones">{{ $stats['locations']['zones'] ?? 0 }}</div>
                                <div class="small text-muted fw-medium text-uppercase">Available Zones</div>
                            </div>
                            <div class="d-flex align-items-center justify-content-center rounded icon-size-3rem">
                                <i class="bi bi-geo-alt text-white fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Size Libraries Card -->
            <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                <div class="stats-card theme-warning">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="size-libraries">{{ $stats['sizes']['size_libraries'] ?? 0 }}</div>
                                <div class="small text-muted fw-medium text-uppercase">Size Libraries</div>
                            </div>
                            <div class="d-flex align-items-center justify-content-center rounded icon-size-3rem">
                                <i class="bi bi-rulers text-white fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Size Templates Card -->
            <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                <div class="stats-card theme-warning">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="size-templates">{{ $stats['sizes']['size_templates'] ?? 0 }}</div>
                                <div class="small text-muted fw-medium text-uppercase">Size Templates</div>
                            </div>
                            <div class="d-flex align-items-center justify-content-center rounded icon-size-3rem">
                                <i class="bi bi-file-earmark-text text-white fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Brand Card -->
            <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                <div class="stats-card theme-purple">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="total-brands">{{ $stats['brands']['total'] ?? 0 }}</div>
                                <div class="small text-muted fw-medium text-uppercase">Available Brands</div>
                            </div>
                            <div class="d-flex align-items-center justify-content-center rounded icon-size-3rem">
                                <i class="bi bi-award text-white fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Color Card -->
            <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                <div class="stats-card theme-purple">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="total-colors">{{ $stats['colors']['total'] ?? 0 }}</div>
                                <div class="small text-muted fw-medium text-uppercase">Available Colors</div>
                            </div>
                            <div class="d-flex align-items-center justify-content-center rounded icon-size-3rem">
                                <i class="bi bi-palette-fill text-white fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gender Card -->
            <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                <div class="stats-card theme-warning">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="total-gender">{{ $stats['gender']['total'] ?? 0 }}</div>
                                <div class="small text-muted fw-medium text-uppercase">Available Gender</div>
                            </div>
                            <div class="d-flex align-items-center justify-content-center rounded icon-size-3rem">
                                <i class="bi bi-gender-ambiguous text-white fs-4"></i>
                            </div>
                        </div>
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
