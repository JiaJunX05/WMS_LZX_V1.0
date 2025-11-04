{{-- ==========================================
    颜色更新页面
    功能：修改现有颜色信息
    ========================================== --}}

@extends("layouts.app")

@section("title", "Update Color")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.color-dashboard-header', ['type' => 'update'])


    {{-- 颜色更新表单 --}}
    @include('components.form-templates.color-update-form')
</div>

@endsection

@section("scripts")
{{-- 颜色管理路由配置 --}}
<script>
    // 设置颜色管理相关路由
    window.colorManagementRoute = "{{ route('admin.color.index') }}";
    window.updateColorUrl = "{{ route('admin.color.update', $color->id) }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('node_modules/colorjs.io/dist/color.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/color-management.js') }}"></script>

{{-- 页面初始化脚本 --}}
    document.addEventListener('DOMContentLoaded', function() {
        {{-- 初始化颜色更新页面 --}}
        initializeColorUpdate();
    });
</script>
@endsection
