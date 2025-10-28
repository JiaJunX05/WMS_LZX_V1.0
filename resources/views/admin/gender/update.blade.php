{{-- ==========================================
    性别更新页面
    功能：修改现有性别信息
    ========================================== --}}

@extends("layouts.app")

@section("title", "Update Gender")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.gender-dashboard-header', ['type' => 'update'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 性别更新表单 --}}
    @include('components.form-templates.gender-update-form')
</div>

@endsection

@section("scripts")
{{-- 性别管理路由配置 --}}
<script>
    // 设置性别管理相关路由
    window.genderManagementRoute = "{{ route('admin.gender.index') }}";
    window.updateGenderUrl = "{{ route('admin.gender.update', $gender->id) }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/gender-management.js') }}"></script>

{{-- 页面初始化脚本 --}}
    document.addEventListener('DOMContentLoaded', function() {
        {{-- 初始化性别更新页面 --}}
        initializeGenderUpdate();
    });
</script>
@endsection
