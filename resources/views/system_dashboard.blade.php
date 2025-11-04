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

            <!-- Stock Movements Card -->
            <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                <div class="stats-card theme-success">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="total-stock-movements">{{ isset($stats['stock']) ? ($stats['stock']['total'] ?? 0) : 0 }}</div>
                                <div class="small text-muted fw-medium text-uppercase">Stock Movements</div>
                            </div>
                            <div class="d-flex align-items-center justify-content-center rounded icon-size-3rem">
                                <i class="bi bi-activity text-white fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Stock History Section -->
    <section class="stock-history-section mt-5" role="region" aria-label="Recent stock movements">
        <div class="card shadow-sm border-0">
            <div class="card-header bg-white border-0 pb-0">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <div class="d-flex align-items-center justify-content-center rounded me-3" style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <i class="bi bi-clock-history text-white fs-5"></i>
                        </div>
                        <div>
                            <h5 class="mb-0 fw-bold">Recent Stock History</h5>
                            <p class="text-muted small mb-0">Latest inventory movements and transactions</p>
                        </div>
                    </div>
                    <a href="{{ route('stock_history') }}" class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-arrow-right me-2"></i>View All
                    </a>
                </div>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4" style="width: 10%;"><div class="fw-bold text-muted small text-uppercase">ID</div></th>
                                <th style="width: 10%;"><div class="fw-bold text-muted small text-uppercase">DATE</div></th>
                                <th style="width: 10%;"><div class="fw-bold text-muted small text-uppercase">TYPE</div></th>
                                <th style="width: 20%;"><div class="fw-bold text-muted small text-uppercase">PRODUCT</div></th>
                                <th style="width: 10%;"><div class="fw-bold text-muted small text-uppercase">QUANTITY</div></th>
                                <th style="width: 10%;"><div class="fw-bold text-muted small text-uppercase">BEFORE</div></th>
                                <th style="width: 10%;"><div class="fw-bold text-muted small text-uppercase">AFTER</div></th>
                                <th style="width: 10%;"><div class="fw-bold text-muted small text-uppercase">USER INFO</div></th>
                                <th class="pe-4" style="width: 10%;"><div class="fw-bold text-muted small text-uppercase">REFERENCE</div></th>
                            </tr>
                        </thead>
                        <tbody id="stock-history-tbody">
                            @forelse($recentStockHistory as $movement)
                                <tr>
                                    <td class="ps-4">
                                        <span class="fw-medium text-muted">#{{ $movement['id'] }}</span>
                                    </td>
                                    <td>
                                        <div class="fw-medium">{{ \Carbon\Carbon::parse($movement['date'])->format('M d, Y') }}</div>
                                        <div class="text-muted small">{{ \Carbon\Carbon::parse($movement['date'])->format('H:i:s') }}</div>
                                    </td>
                                    <td>
                                        @php
                                            $typeClass = match($movement['movement_type']) {
                                                'stock_in' => 'bg-success',
                                                'stock_out' => 'bg-danger',
                                                'stock_return' => 'bg-warning',
                                                default => 'bg-secondary'
                                            };
                                            $typeText = match($movement['movement_type']) {
                                                'stock_in' => 'Stock In',
                                                'stock_out' => 'Stock Out',
                                                'stock_return' => 'Return',
                                                default => ucfirst($movement['movement_type'])
                                            };
                                        @endphp
                                        <span class="badge {{ $typeClass }}">{{ $typeText }}</span>
                                    </td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            @if($movement['product_image'])
                                                <img src="{{ asset('assets/images/' . $movement['product_image']) }}"
                                                     alt="{{ $movement['product_name'] }}"
                                                     class="me-2 rounded"
                                                     style="width: 40px; height: 40px; object-fit: cover;"
                                                     onerror="this.onerror=null; this.src='{{ asset('assets/img/no-image.png') }}';">
                                            @else
                                                <div class="me-2 rounded d-flex align-items-center justify-content-center bg-light" style="width: 40px; height: 40px;">
                                                    <i class="bi bi-image text-muted"></i>
                                                </div>
                                            @endif
                                            <div>
                                                <div class="fw-medium text-truncate" style="max-width: 200px;" title="{{ $movement['product_name'] }}">{{ $movement['product_name'] }}</div>
                                                <div class="text-muted small">SKU: {{ $movement['sku_code'] }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="{{ $movement['movement_type'] === 'stock_out' ? 'text-danger' : 'text-success' }}">
                                        <span class="fw-bold">{{ $movement['movement_type'] === 'stock_out' ? '-' : '+' }}{{ abs($movement['quantity']) }}</span>
                                    </td>
                                    <td>
                                        <span class="fw-medium">{{ $movement['previous_stock'] }}</span>
                                    </td>
                                    <td>
                                        <span class="fw-medium">{{ $movement['current_stock'] }}</span>
                                    </td>
                                    <td>
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="flex-shrink-0">
                                                <div class="bg-light rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                                                    <i class="bi bi-person-fill text-muted"></i>
                                                </div>
                                            </div>
                                            <div class="flex-fill">
                                                <div class="fw-semibold text-dark mb-1">
                                                    {{ $movement['user_name'] }}
                                                </div>
                                                <div class="d-flex align-items-center gap-2">
                                                    <span class="text-muted small">{{ $movement['user_email'] ?? '' }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="pe-4">
                                        <code class="bg-light px-2 py-1 rounded">{{ $movement['reference_number'] ?: '-' }}</code>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="9" class="text-center py-5">
                                        <div class="d-flex flex-column align-items-center">
                                            <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                                            <p class="text-muted mt-3 mb-0">No stock movements yet</p>
                                        </div>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection

@section('scripts')
<script>
    // 设置用户角色到全局变量
    window.userRole = '{{ $userRole }}';
    // 图片路径配置
    window.productImagePath = "{{ asset('assets/images') }}";
    window.defaultProductImage = "{{ asset('assets/img/no-image.png') }}";
</script>
<script src="{{ asset('assets/js/system-dashboard.js') }}"></script>
@endsection
