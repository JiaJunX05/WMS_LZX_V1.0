{{-- ==========================================
    尺码模板查看页面
    功能：查看尺码模板信息，支持按分类和性别查看或单个模板查看
    ========================================== --}}

@extends("layouts.app")

@section("title", "View Size Template")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.template-dashboard-header', ['type' => 'view'])


    @include('components.form-templates.template-view-form')
</div>

@endsection

@section("scripts")
{{-- 尺码模板管理路由配置 --}}
<script>
    // 设置尺码模板管理相关路由
    window.viewTemplateUrl = "{{ route('admin.template.view', ['id' => ':id']) }}";
    window.templateManagementRoute = "{{ route('admin.template.index') }}";
    window.availableTemplateUrl = "{{ route('admin.template.available', ['id' => ':id']) }}";
    window.unavailableTemplateUrl = "{{ route('admin.template.unavailable', ['id' => ':id']) }}";
    window.deleteTemplateUrl = "{{ route('admin.template.destroy', ['id' => ':id']) }}";
</script>

{{-- 引入尺码模板管理JavaScript文件 --}}
<script src="{{ asset('assets/js/template-management.js') }}"></script>
@endsection
