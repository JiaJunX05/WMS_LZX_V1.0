{{-- ==========================================
    尺码库查看页面
    功能：查看尺码库信息，支持按分类查看或单个尺码库查看
    ========================================== --}}

@extends("layouts.app")

@section("title", "View Size Library")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('admin.library.components.view-header')

    {{-- 主要内容卡片 --}}
    @include('admin.library.view-model')

    {{-- Library Update Modal --}}
    @include('admin.library.update-model')
</div>

@endsection

@section("scripts")
{{-- 尺码库管理路由配置 --}}
<script>
    // 设置尺码库管理相关路由
    window.viewSizeLibraryUrl = "{{ route('admin.library.view', ['id' => ':id']) }}";
    window.sizeLibraryManagementRoute = "{{ route('admin.library.index') }}";
    window.updateSizeLibraryUrl = "{{ route('admin.library.update', ['id' => ':id']) }}";
    window.availableSizeLibraryUrl = "{{ route('admin.library.available', ['id' => ':id']) }}";
    window.unavailableSizeLibraryUrl = "{{ route('admin.library.unavailable', ['id' => ':id']) }}";
    window.deleteSizeLibraryUrl = "{{ route('admin.library.destroy', ['id' => ':id']) }}";
    window.editSizeLibraryUrl = "{{ route('admin.library.edit', ':id') }}";

    // 设置可用的 categories 数据（从后端传递）
    window.availableCategories = @json($categories ?? []);
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/library-management.js') }}"></script>
@endsection
