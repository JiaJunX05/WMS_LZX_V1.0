{{-- ==========================================
    尺码模板创建页面
    功能：创建新的尺码模板，组合分类、性别和尺码库
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Size Template")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.template-dashboard-header', ['type' => 'create'])


    {{-- 尺码模板创建表单 --}}
    @include('components.form-templates.template-create-form')
</div>

@endsection

@section("scripts")
{{-- 尺码模板管理路由配置 --}}
<script>
    // 设置尺码模板管理相关路由
    window.createTemplateUrl = "{{ route('admin.template.store') }}";
    window.templateManagementRoute = "{{ route('admin.template.index') }}";
    window.getAvailableSizeLibrariesUrl = "{{ route('admin.template.available-size-libraries') }}";
    window.availableSizeLibrariesUrl = "{{ route('admin.template.available-size-libraries') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/template-management.js') }}"></script>
@endsection
