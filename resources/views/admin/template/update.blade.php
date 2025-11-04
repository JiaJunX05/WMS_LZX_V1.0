{{-- ==========================================
    尺码模板更新页面
    功能：修改现有尺码模板信息
    ========================================== --}}

@extends("layouts.app")

@section("title", "Update Size Template")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.template-dashboard-header', ['type' => 'update'])


    {{-- 尺码模板更新表单 --}}
    @include('components.form-templates.template-update-form')
</div>

@endsection

@section("scripts")
{{-- 尺码模板管理路由配置 --}}
<script>
    // 设置尺码模板管理相关路由
    window.updateTemplateUrl = "{{ route('admin.template.update', $sizeTemplate->id) }}";
    window.templateManagementRoute = "{{ route('admin.template.index') }}";
    window.availableSizeLibrariesUrl = "{{ route('admin.template.available-size-libraries') }}";
    window.availableTemplateUrl = "{{ route('admin.template.available', ['id' => ':id']) }}";
    window.unavailableTemplateUrl = "{{ route('admin.template.unavailable', ['id' => ':id']) }}";
    window.deleteTemplateUrl = "{{ route('admin.template.destroy', ['id' => ':id']) }}";
</script>

{{-- 引入尺码模板管理JavaScript文件 --}}
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/template-management.js') }}"></script>
@endsection
