{{-- ==========================================
    尺码库创建页面
    功能：创建新的尺码库，为特定分类添加尺码值
    ========================================== --}}

@extends("layouts.app")

@section("title", "Create Size Library")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.library-dashboard-header', ['type' => 'create'])


    {{-- 尺码库创建表单 --}}
    @include('components.form-templates.library-create-form')
</div>

@endsection

@section("scripts")
{{-- 尺码库管理路由配置 --}}
<script>
    // 设置尺码库管理相关路由
    window.createLibraryUrl = "{{ route('admin.library.store') }}";
    window.libraryManagementRoute = "{{ route('admin.library.index') }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/library-management.js') }}"></script>
@endsection
