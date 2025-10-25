{{-- ==========================================
    用户信息更新页面
    功能：编辑用户基本信息、角色权限、账户状态
    ========================================== --}}

@extends("layouts.app")

@section("title", "Edit User Information")
@section("content")

{{-- ==========================================
    页面样式文件引入
    ========================================== --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- ==========================================
    页面主体内容
    ========================================== --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.main-display.dashboard-header.auth-header', ['type' => 'update'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 用户更新表单 --}}
    @include('components.form-templates.auth-update-form')
</div>

@endsection

@section("scripts")
{{-- 设置用户更新相关路由 --}}
<script>
    // 设置用户更新相关路由
    window.updateUserUrl = "{{ $userRole === 'SuperAdmin' ? route('superadmin.users.update', ':id') : route('admin.users.update', ':id') }}";
    window.updateUserRedirect = "{{ $userRole === 'SuperAdmin' ? route('superadmin.users.management') : route('admin.users.management') }}";

    @if($user->account && $user->account->user_image)
        window.existingUserImage = '{{ asset('assets/images/auth/' . $user->account->user_image) }}';
    @endif
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/common/auth-common.js') }}"></script>
<script src="{{ asset('assets/js/auth-management.js') }}"></script>

{{-- 页面初始化脚本 --}}
<script>
    document.addEventListener('DOMContentLoaded', function() {
        initializeUserUpdate();
    });
</script>

@endsection
