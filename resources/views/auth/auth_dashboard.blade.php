{{-- ==========================================
    用户管理仪表板页面
    功能：用户列表展示、搜索筛选、分页管理、用户操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "User Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/role-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('auth.components.dashboard-header')

    {{-- 用户统计卡片区域 --}}
    @include('auth.components.metric-cards')

    {{-- 搜索筛选区域 --}}
    @include('auth.components.search-filters')

    {{-- 用户列表表格 --}}
    @include('auth.components.data-table')

    {{-- 分页导航区域 --}}
    @include('auth.components.pagination-nav')
</div>

{{-- 用户操作 Modals --}}
@include('auth.create-model')
@include('auth.update-model')
@include('auth.role-model')

@endsection

@section("scripts")
{{-- 用戶管理路由配置 --}}
<script>
    // 設置用戶管理相關URL
    @if (Auth::check())
        @if (Auth::user()->getAccountRole() === 'SuperAdmin')
            window.staffManagementRoute = "{{ route('superadmin.users.management') }}";
            window.createUserUrl = "{{ route('register.submit') }}";
            window.updateUserUrl = "{{ route('superadmin.users.update', ['id' => ':id']) }}";
            window.editUserUrl = "{{ route('superadmin.users.edit', ':id') }}";
            window.deleteUserUrl = "{{ route('superadmin.users.delete', ':id') }}";
            window.unavailableUserUrl = "{{ route('superadmin.users.unavailable', ':id') }}";
            window.availableUserUrl = "{{ route('superadmin.users.available', ':id') }}";
            window.changeRoleUrl = "{{ route('superadmin.users.change_role', ':id') }}";
            window.userExportUrl = "{{ route('superadmin.users.export') }}";
        @elseif (Auth::user()->getAccountRole() === 'Admin')
            window.staffManagementRoute = "{{ route('admin.users.management') }}";
            window.createUserUrl = "{{ route('register.submit') }}";
            window.updateUserUrl = "{{ route('admin.users.update', ['id' => ':id']) }}";
            window.editUserUrl = "{{ route('admin.users.edit', ':id') }}";
            window.deleteUserUrl = "";
            window.unavailableUserUrl = "{{ route('admin.users.unavailable', ':id') }}";
            window.availableUserUrl = "{{ route('admin.users.available', ':id') }}";
            window.changeRoleUrl = "";
            window.userExportUrl = "";
        @else
            window.staffManagementRoute = "";
            window.createUserUrl = "";
            window.updateUserUrl = "";
            window.deleteUserUrl = "";
            window.unavailableUserUrl = "";
            window.availableUserUrl = "";
            window.changeRoleUrl = "";
            window.userExportUrl = "";
        @endif
    @else
        window.staffManagementRoute = "";
        window.createUserUrl = "";
        window.updateUserUrl = "";
        window.deleteUserUrl = "";
        window.unavailableUserUrl = "";
        window.availableUserUrl = "";
        window.changeRoleUrl = "";
        window.userExportUrl = "";
    @endif

    // 傳遞當前用戶信息給JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
    window.currentUserId = {{ Auth::id() ?? 0 }};
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/role-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/auth-management.js') }}"></script>
@endsection
