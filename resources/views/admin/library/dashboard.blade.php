{{-- ==========================================
    尺码库管理仪表板
    功能：管理尺码库，查看统计信息和按分类分组的尺码值
    ========================================== --}}

@extends("layouts.app")

@section("title", "Size Library Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('admin.library.components.dashboard-header')

    {{-- 统计卡片区域 --}}
    @include('admin.library.components.metric-cards')

    {{-- 主要内容区域 --}}
    @include('admin.library.components.data-cards')

    {{-- 分页导航区域 --}}
    @include('admin.library.components.pagination-nav')

    {{-- Library Create Modal --}}
    @include('admin.library.create-model')
</div>

@endsection

@section("scripts")
{{-- 尺码库管理路由配置 --}}
<script>
    // 设置尺码库管理相关路由
    window.sizeLibraryManagementRoute = "{{ route('admin.library.index') }}";
    window.createSizeLibraryUrl = "{{ route('admin.library.store') }}";
    window.storeSizeLibraryUrl = "{{ route('admin.library.store') }}";
    window.editSizeLibraryUrl = "{{ route('admin.library.edit', ['id' => ':id']) }}";
    window.viewSizeLibraryUrl = "{{ route('admin.library.view', ['id' => ':id']) }}";
    window.deleteSizeLibraryUrl = "{{ route('admin.library.destroy', ['id' => ':id']) }}";
    window.availableSizeLibraryUrl = "{{ route('admin.library.available', ['id' => ':id']) }}";
    window.unavailableSizeLibraryUrl = "{{ route('admin.library.unavailable', ['id' => ':id']) }}";

    // 设置可用的 categories 数据（从后端传递）
    window.availableCategories = @json($categories);
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/library-management.js') }}"></script>
@endsection
