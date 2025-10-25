{{-- ==========================================
    尺码库管理仪表板
    功能：管理尺码库，查看统计信息和按分类分组的尺码值
    ========================================== --}}

@extends("layouts.app")

@section("title", "Size Library Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-card.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.main-display.dashboard-header.library-header', ['type' => 'dashboard'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 统计卡片区域 --}}
    @include('components.main-display.stats-cards.library-stats-cards')

    {{-- 主要内容区域 --}}
    <div id="dashboard-cards-container" class="row g-4">
        {{-- 按类别分组的尺码库卡片将通过JavaScript动态加载 --}}
    </div>

    {{-- 空状态显示 --}}
    @include('components.main-display.empty-state.library-empty-state')

    {{-- 分页导航区域 --}}
    @include('components.main-display.pagination-nav.library-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 尺码库管理路由配置 --}}
<script>
    // 设置尺码库管理相关路由
    window.sizeLibraryManagementRoute = "{{ route('admin.library.index') }}";
    window.createSizeLibraryUrl = "{{ route('admin.library.create') }}";
    window.editSizeLibraryUrl = "{{ route('admin.library.edit', ['id' => ':id']) }}";
    window.viewSizeLibraryUrl = "{{ route('admin.library.view', ['id' => ':id']) }}";
    window.deleteSizeLibraryUrl = "{{ route('admin.library.destroy', ['id' => ':id']) }}";
    window.availableSizeLibraryUrl = "{{ route('admin.library.available', ['id' => ':id']) }}";
    window.unavailableSizeLibraryUrl = "{{ route('admin.library.unavailable', ['id' => ':id']) }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/library-management.js') }}"></script>
@endsection
