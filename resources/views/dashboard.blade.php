@extends("layouts.app")

@section("title", "Dashboard")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/dashboard.css') }}">

<div class="dashboard-container">
    <div class="container">
        <!-- Success Alert -->
        @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>
                {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif

        <!-- Dashboard Header -->
        <div class="dashboard-header">
            <h1 class="dashboard-title">WMS Dashboard</h1>
            <p class="dashboard-subtitle">
                Warehouse Management System Overview
                @if($userRole === 'SuperAdmin')
                    - Super Admin Panel
                @elseif($userRole === 'Admin')
                    - Admin Panel
                @else
                    - Staff Panel
                @endif
            </p>
        </div>

        <!-- Dashboard Grid -->
        <div class="dashboard-grid">
            <!-- Products Card -->
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

            <!-- Staff Card -->
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

            <!-- Categories Card -->
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
                </div>
            </div>

            <!-- Sizes Card -->
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
                            <span class="stat-label">Clothing Sizes</span>
                        </div>
                        <span class="stat-value" id="clothing-sizes">{{ $stats['sizes']['clothing_sizes'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-info">
                                <i class="bi bi-shoe-prints"></i>
                            </div>
                            <span class="stat-label">Shoe Sizes</span>
                        </div>
                        <span class="stat-value" id="shoe-sizes">{{ $stats['sizes']['shoe_sizes'] ?? 0 }}</span>
                    </div>
                    <div class="stat-item">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-success">
                                <i class="bi bi-diagram-3"></i>
                            </div>
                            <span class="stat-label">Size Types</span>
                        </div>
                        <span class="stat-value" id="size-types">{{ $stats['sizes']['size_types'] ?? 0 }}</span>
                    </div>
                </div>
            </div>

            <!-- Storage Locations Card -->
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

            <!-- Stock Movement Card -->
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
                            <div class="stat-icon bg-info">
                                <i class="bi bi-list-check"></i>
                            </div>
                            <span class="stat-label">Total Movements</span>
                        </div>
                        <span class="stat-value" id="total-movements">{{ $stats['stock']['total_items'] ?? 0 }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
$(document).ready(function() {
    // 初始化仪表板
    initializeDashboard();

    // 设置自动刷新（每30秒）
    setInterval(refreshDashboard, 30000);
});

function initializeDashboard() {
    // 添加加载动画
    $('.stat-value').addClass('loading-skeleton');

    // 模拟数据加载完成
    setTimeout(function() {
        $('.stat-value').removeClass('loading-skeleton');
        animateNumbers();
    }, 1000);
}

function refreshDashboard() {
    // 发送AJAX请求获取最新数据
    $.ajax({
        url: "{{ auth()->user()->getAccountRole() === 'SuperAdmin' ? route('superadmin.dashboard.data') : route('admin.dashboard.data') }}",
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                updateDashboardData(response.data);
            }
        },
        error: function(xhr, status, error) {
            console.error('Failed to refresh dashboard data:', error);
        }
    });
}

function updateDashboardData(data) {
    // 更新产品数据
    updateStatValue('total-products', data.products.total);
    updateStatValue('active-products', data.products.active);
    updateStatValue('inactive-products', data.products.inactive);

    // 更新员工数据
    updateStatValue('total-staff', data.staff.total);
    updateStatValue('admin-staff', data.staff.admin);
    updateStatValue('staff-members', data.staff.staff);

    // 更新分类数据
    updateStatValue('main-categories', data.categories.categories);
    updateStatValue('subcategories', data.categories.subcategories);

    // 更新尺码数据
    updateStatValue('clothing-sizes', data.sizes.clothing_sizes);
    updateStatValue('shoe-sizes', data.sizes.shoe_sizes);
    updateStatValue('size-types', data.sizes.size_types);

    // 更新存储位置数据
    updateStatValue('zones', data.locations.zones);
    updateStatValue('racks', data.locations.racks);
    updateStatValue('locations', data.locations.locations);

    // 更新库存数据
    updateStatValue('stock-in', data.stock.in_stock);
    updateStatValue('stock-out', data.stock.out_stock);
    updateStatValue('total-movements', data.stock.total_items);

    // 更新进度条
    updateProgressBar(data.products.total, data.products.active);
}

function updateStatValue(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (element) {
        const currentValue = parseInt(element.textContent) || 0;
        if (currentValue !== newValue) {
            element.textContent = newValue;
            element.classList.add('updated');
            setTimeout(() => {
                element.classList.remove('updated');
            }, 600);
        }
    }
}

function updateProgressBar(total, active) {
    const percentage = total > 0 ? (active / total) * 100 : 0;
    const progressFill = document.querySelector('.progress-fill');
    const activeRate = document.getElementById('active-rate');

    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }

    if (activeRate) {
        activeRate.textContent = percentage.toFixed(1) + '%';
    }
}

function animateNumbers() {
    $('.stat-value').each(function() {
        const $this = $(this);
        const targetValue = parseInt($this.text()) || 0;

        $this.text('0');

        $({ value: 0 }).animate({ value: targetValue }, {
            duration: 1500,
            easing: 'swing',
            step: function() {
                $this.text(Math.floor(this.value));
            },
            complete: function() {
                $this.text(targetValue);
            }
        });
    });
}

// 卡片悬停效果
$('.dashboard-card').hover(
    function() {
        $(this).addClass('shadow-custom');
    },
    function() {
        $(this).removeClass('shadow-custom');
    }
);
</script>
@endsection
