@extends("layouts.app")

@section("title", "User Management")
@section("content")

<!-- CSS -->
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-table.css')}}">
<link rel="stylesheet" href="{{ asset('assets/css/role-status.css') }}">

<div class="container-fluid py-4">
    <!-- 页面标题和添加按钮 -->
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-people-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">User Management</h2>
                                <p class="dashboard-subtitle mb-0">Manage and organize system users</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('register') }}" class="btn btn-primary">
                            <i class="bi bi-plus-circle-fill me-2"></i>
                            Add User
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- 提示信息容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    <!-- 统计数据卡片 -->
    <div class="statistics-section mb-4">
        <div class="row g-4">
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="total-users">0</div>
                                <div class="stats-label">Total Users</div>
                            </div>
                            <div class="stats-icon bg-primary">
                                <i class="bi bi-people"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="active-users">0</div>
                                <div class="stats-label">Available Users</div>
                            </div>
                            <div class="stats-icon bg-success">
                                <i class="bi bi-check-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="inactive-users">0</div>
                                <div class="stats-label">Unavailable Users</div>
                            </div>
                            <div class="stats-icon bg-warning">
                                <i class="bi bi-pause-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <div class="stats-number" id="admin-users">0</div>
                                <div class="stats-label">Admin Users</div>
                            </div>
                            <div class="stats-icon bg-info">
                                <i class="bi bi-shield-check"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row g-3 align-items-end">
                    <div class="col-lg-6">
                        <label class="form-label fw-medium">Search Users</label>
                        <div class="search-input-wrapper">
                            <i class="bi bi-search search-icon"></i>
                            <input type="text" class="form-control search-input" id="search-input"
                                   placeholder="Search by name, email...">
                        </div>
                    </div>
                    <div class="col-lg-2">
                        <label class="form-label fw-medium">Filter by Role</label>
                        <select class="form-select" id="role-filter">
                            <option value="">All Roles</option>
                            <option value="SuperAdmin">Super Admin</option>
                            <option value="Admin">Admin</option>
                            <option value="Staff">Staff</option>
                        </select>
                    </div>
                    <div class="col-lg-2">
                        <label class="form-label fw-medium">Filter by Status</label>
                        <select class="form-select" id="status-filter">
                            <option value="">All Status</option>
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                        </select>
                    </div>
                    <div class="col-lg-2">
                        <button class="btn btn-outline-secondary w-100" id="clear-filters">
                            <i class="bi bi-x-circle me-2"></i>
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- User List Table -->
    <div class="card shadow-sm border-0">
        <div class="card-header bg-transparent border-0 pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="mb-0 fw-semibold">User List</h5>
                    <span class="badge bg-light text-dark" id="results-count">Loading...</span>
                </div>
                @if($globalUserRole === 'SuperAdmin')
                <button class="btn btn-outline-success" id="export-users-btn" disabled>
                    <i class="bi bi-download me-2"></i>
                    Export Data
                </button>
                @endif
            </div>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table custom-table mb-0">
                    <thead>
                        <tr>
                            @if($globalUserRole === 'SuperAdmin')
                            <th class="ps-4" style="width: 5%">
                                <div class="table-header">
                                    <input type="checkbox" name="select-all" id="select-all" style="width: 20px; height: 20px;">
                                </div>
                            </th>
                            <th style="width: 30%"><div class="table-header">USER INFO</div></th>
                            <th style="width: 35%"><div class="table-header">EMAIL</div></th>
                            <th style="width: 10%"><div class="table-header">ACCOUNT ROLE</div></th>
                            <th style="width: 10%"><div class="table-header">ACCOUNT STATUS</div></th>
                            <th class="text-end pe-4" style="width: 10%"><div class="table-header">ACTIONS</div></th>
                            @else
                            <th class="ps-4" style="width: 10%"><div class="table-header">ID</div></th>
                            <th style="width: 20%"><div class="table-header">USER INFO</div></th>
                            <th style="width: 40%"><div class="table-header">EMAIL</div></th>
                            <th style="width: 10%"><div class="table-header">ACCOUNT ROLE</div></th>
                            <th style="width: 10%"><div class="table-header">ACCOUNT STATUS</div></th>
                            <th class="text-end pe-4" style="width: 10%"><div class="table-header">ACTIONS</div></th>
                            @endif
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        <!-- Loading State -->
                        <tr>
                            <td colspan="7" class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-2 text-muted">Loading users...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Pagination and Results Statistics -->
    <div class="d-flex justify-content-between align-items-center mt-4">
        <div class="pagination-info text-muted">
            Showing <span class="fw-medium" id="showing-start">0</span>
            to <span class="fw-medium" id="showing-end">0</span>
            of <span class="fw-medium" id="total-count">0</span> entries
        </div>
        <nav aria-label="Page navigation">
            <ul id="pagination" class="pagination pagination-sm mb-0">
                <li class="page-item disabled" id="prev-page">
                    <a class="page-link" href="#" aria-label="Previous">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                </li>
                <li class="page-item active" id="current-page">
                    <span class="page-link" id="page-number">1</span>
                </li>
                <li class="page-item disabled" id="next-page">
                    <a class="page-link" href="#" aria-label="Next">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</div>

@endsection

@section("scripts")
<script>
    @if (Auth::check()) {{-- Check if user is logged in --}}
        @if (Auth::user()->getAccountRole() === 'SuperAdmin') {{-- If super admin --}}
            window.staffManagementRoute = "{{ route('superadmin.users.management') }}"; {{-- Set to super admin users management route --}}
        @elseif (Auth::user()->getAccountRole() === 'Admin') {{-- If admin --}}
            window.staffManagementRoute = "{{ route('admin.users.management') }}"; {{-- Set to admin users management route --}}
        @else
            window.staffManagementRoute = ""; // Other roles (like regular staff) may not have access to this page or corresponding API routes
        @endif
    @else
        window.staffManagementRoute = ""; // User not authenticated, not allowed to make data requests
    @endif

    // Pass current user role to JavaScript to display different action buttons based on role in JS.
    // `{{ $globalUserRole ?? '' }}`: `?? ''` is to prevent errors when `$globalUserRole` is undefined.
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";

    // Pass current user ID to JavaScript to prevent self-modification
    window.currentUserId = {{ Auth::id() ?? 0 }};

    // User operation related URLs - dynamically set based on current user role
    @if($globalUserRole === 'SuperAdmin')
        window.editUserUrl = "{{ route('superadmin.users.edit', ':id') }}";
        window.deleteUserUrl = "{{ route('superadmin.users.delete', ':id') }}";
        window.unavailableUserUrl = "{{ route('superadmin.users.unavailable', ':id') }}";
        window.availableUserUrl = "{{ route('superadmin.users.available', ':id') }}";
        window.changeRoleUrl = "{{ route('superadmin.users.change_role', ':id') }}";
        window.userExportUrl = "{{ route('superadmin.users.export') }}";
    @elseif($globalUserRole === 'Admin')
        window.editUserUrl = "{{ route('admin.users.edit', ':id') }}";
        window.deleteUserUrl = ""; // Admin cannot delete users
        window.unavailableUserUrl = "{{ route('admin.users.unavailable', ':id') }}";
        window.availableUserUrl = "{{ route('admin.users.available', ':id') }}";
        window.changeRoleUrl = ""; // Admin cannot change roles
        window.userExportUrl = ""; // Admin cannot export users
    @else
        window.editUserUrl = "";
        window.deleteUserUrl = "";
        window.unavailableUserUrl = "";
        window.availableUserUrl = "";
        window.changeRoleUrl = "";
        window.userExportUrl = "";
    @endif
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/auth-common.js') }}"></script>
<script src="{{ asset('assets/js/auth-management.js') }}"></script>
@endsection
