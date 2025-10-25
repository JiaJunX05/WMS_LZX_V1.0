{{-- ==========================================
    用户注册页面
    功能：创建新用户账户，设置基本信息、角色权限
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create User Account")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.main-display.dashboard-header.auth-header', ['type' => 'register'])

    {{-- 提示信息区域 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 用户创建表单 --}}
    @include('components.form-templates.auth-create-form')
</div>

@endsection

@section("scripts")
{{-- 设置用户创建相关路由 --}}
<script>
    // 设置用户创建相关路由
    window.createUserUrl = "{{ route('register.submit') }}";
    window.userManagementRoute = "{{ $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/auth-management.js') }}"></script>

{{-- 页面初始化脚本 --}}
<script>
    document.addEventListener('DOMContentLoaded', function() {
        initializeUserRegistration();
    });
</script>

@endsection
