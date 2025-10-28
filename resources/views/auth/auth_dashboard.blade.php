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

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.auth-dashboard-header', ['type' => 'dashboard'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 用户统计卡片区域 --}}
    @include('components.metric-cards.user-metric-cards')

    {{-- 搜索筛选区域 --}}
    @include('components.search-filters.user-search-filters')

    {{-- 用户列表表格 --}}
    @include('components.data-tables.user-data-tables')

    {{-- 空状态显示 --}}
    @include('components.empty-list.auth-empty-list')

    {{-- 分页导航区域 --}}
    @include('components.pagination-nav.user-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 用户管理路由配置 --}}
<script>
    @if (Auth::check())
        @if (Auth::user()->getAccountRole() === 'SuperAdmin')
            window.staffManagementRoute = "{{ route('superadmin.users.management') }}";
        @elseif (Auth::user()->getAccountRole() === 'Admin')
            window.staffManagementRoute = "{{ route('admin.users.management') }}";
        @else
            window.staffManagementRoute = "";
        @endif
    @else
        window.staffManagementRoute = "";
    @endif

    {{-- 当前用户信息 --}}
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
    window.currentUserId = {{ Auth::id() ?? 0 }};

    {{-- 用户操作路由配置 --}}
    @if($globalUserRole === 'SuperAdmin')
        window.editUserUrl = "{{ route('superadmin.users.edit', ':id') }}";
        window.deleteUserUrl = "{{ route('superadmin.users.delete', ':id') }}";
        window.unavailableUserUrl = "{{ route('superadmin.users.unavailable', ':id') }}";
        window.availableUserUrl = "{{ route('superadmin.users.available', ':id') }}";
        window.changeRoleUrl = "{{ route('superadmin.users.change_role', ':id') }}";
        window.userExportUrl = "{{ route('superadmin.users.export') }}";
    @elseif($globalUserRole === 'Admin')
        window.editUserUrl = "{{ route('admin.users.edit', ':id') }}";
        window.deleteUserUrl = "";
        window.unavailableUserUrl = "{{ route('admin.users.unavailable', ':id') }}";
        window.availableUserUrl = "{{ route('admin.users.available', ':id') }}";
        window.changeRoleUrl = "";
        window.userExportUrl = "";
    @else
        window.editUserUrl = "";
        window.deleteUserUrl = "";
        window.unavailableUserUrl = "";
        window.availableUserUrl = "";
        window.changeRoleUrl = "";
        window.userExportUrl = "";
    @endif
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/components/auth-common.js') }}"></script>
<script src="{{ asset('assets/js/auth-management.js') }}"></script>
@endsection
