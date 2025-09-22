@extends("layouts.app")

@section("title", "Staff Management")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/staff-management.css') }}">
<div class="container-fluid py-4">
    <!-- Alert Messages -->
    @if(session("success"))
        <div class="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            <span>{{ session("success") }}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if($errors->any())
        <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-circle-fill me-2"></i>
            <div>
                @foreach ($errors->all() as $error)
                    <div>{{ $error }}</div>
                @endforeach
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <!-- Page Title and Add Button -->
    <div class="card shadow-sm border-0 mb-4">
        <div class="card-body">
            <div class="row justify-content-between align-items-center g-3">
                <div class="col-12 col-md-6">
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                            <i class="bi bi-people-fill text-primary fs-4"></i>
                        </div>
                        <div>
                            <h3 class="mb-0 fw-bold">Staff Management</h3>
                            <p class="text-muted mb-0">Easily manage all staff in the system</p>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-6 text-md-end">
                    <a href="{{ route('register') }}" class="btn btn-primary">
                        <i class="bi bi-person-plus-fill me-2"></i>Add Staff
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="card shadow-sm border-0 mb-4">
        <div class="card-body p-3">
            <div class="row g-3">
                <div class="col-lg-6">
                    <div class="search-box">
                        <i class="bi bi-search search-icon"></i>
                        <input type="search" class="form-control search-input" id="search-input" placeholder="Search by name, email ...">
                    </div>
                </div>
                <div class="col-lg-3">
                    <select class="form-select filter-select" id="role-filter">
                        <option value="">All Roles</option>
                        <option value="SuperAdmin">Super Admin</option>
                        <option value="Admin">Admin</option>
                        <option value="Staff">Staff</option>
                    </select>
                </div>
                <div class="col-lg-3">
                    <select class="form-select filter-select" id="status-filter">
                        <option value="">All Status</option>
                        <option value="Available">Available</option>
                        <option value="Unavailable">Unavailable</option>
                    </select>
                </div>
            </div>
        </div>
    </div>

    <!-- Staff List Table -->
    <div class="card shadow-sm border-0">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table custom-table mb-0">
                    <thead>
                        <tr>
                            <th class="ps-4" style="width: 5%"><div class="table-header">ID</div></th>
                            <th style="width: 25%"><div class="table-header">USERNAME</div></th>
                            <th style="width: 30%"><div class="table-header">EMAIL</div></th>
                            <th style="width: 15%"><div class="table-header">ACCOUNT ROLE</div></th>
                            <th style="width: 15%"><div class="table-header">ACCOUNT STATUS</div></th>
                            <th class="text-end pe-4" style="width: 10%"><div class="table-header">ACTIONS</div></th>
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        <!-- Loading State -->
                        <tr>
                            <td colspan="6" class="text-center py-4">
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
                <!-- Page numbers generated dynamically by JS -->
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
            window.staffManagementRoute = "{{ route('superadmin.staff_management') }}"; {{-- Set to super admin staff management route --}}
        @elseif (Auth::user()->getAccountRole() === 'Admin') {{-- If admin --}}
            window.staffManagementRoute = "{{ route('admin.staff_management') }}"; {{-- Set to admin staff management route --}}
        @else
            window.staffManagementRoute = ""; // Other roles (like regular staff) may not have access to this page or corresponding API routes
        @endif
    @else
        window.staffManagementRoute = ""; // User not authenticated, not allowed to make data requests
    @endif

    // Pass current user role to JavaScript to display different action buttons based on role in JS.
    // `{{ $globalUserRole ?? '' }}`: `?? ''` is to prevent errors when `$globalUserRole` is undefined.
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";

    // User operation related URLs - dynamically set based on current user role
    @if($globalUserRole === 'SuperAdmin')
        window.editUserUrl = "{{ route('superadmin.update_user', ':id') }}";
        window.deleteUserUrl = "{{ route('superadmin.delete_user', ':id') }}";
        window.unavailableUserUrl = "{{ route('superadmin.set_unavailable', ':id') }}";
        window.availableUserUrl = "{{ route('superadmin.set_available', ':id') }}";
        window.changeRoleUrl = "{{ route('superadmin.change_role', ':id') }}";
    @elseif($globalUserRole === 'Admin')
        window.editUserUrl = "{{ route('admin.update_user', ':id') }}";
        window.deleteUserUrl = ""; // Admin cannot delete users
        window.unavailableUserUrl = "{{ route('admin.set_unavailable', ':id') }}";
        window.availableUserUrl = "{{ route('admin.set_available', ':id') }}";
        window.changeRoleUrl = ""; // Admin cannot change roles
    @else
        window.editUserUrl = "";
        window.deleteUserUrl = "";
        window.unavailableUserUrl = "";
        window.availableUserUrl = "";
        window.changeRoleUrl = "";
    @endif
</script>
<script src="{{ asset('assets/js/staff-management.js') }}"></script>
@endsection
