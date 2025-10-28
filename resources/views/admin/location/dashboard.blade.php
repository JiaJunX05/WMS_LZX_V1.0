{{-- ==========================================
    位置管理仪表板页面
    功能：位置列表展示、统计信息、分页管理、位置操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Location Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-card.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.location-dashboard-header', ['type' => 'dashboard'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 统计卡片区域 --}}
    @include('components.metric-cards.location-metric-cards')

    {{-- 主要内容区域 --}}
    <div id="dashboard-cards-container" class="row g-4">
        {{-- 按区域分组的位置卡片将通过JavaScript动态加载 --}}
    </div>

    {{-- 空状态显示 --}}
    @include('components.empty-list.location-empty-state')

    {{-- 分页导航区域 --}}
    @include('components.pagination-nav.location-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 位置管理路由配置 --}}
<script>
    // 设置位置管理相关路由
    window.locationManagementRoute = "{{ route('admin.location.index') }}";
    window.viewLocationUrl = "{{ route('admin.location.view', ['id' => ':id']) }}";
    window.editLocationUrl = "{{ route('admin.location.edit', ['id' => ':id']) }}";
    window.deleteLocationUrl = "{{ route('admin.location.destroy', ['id' => ':id']) }}";
    window.availableLocationUrl = "{{ route('admin.location.available', ['id' => ':id']) }}";
    window.unavailableLocationUrl = "{{ route('admin.location.unavailable', ['id' => ':id']) }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/location-management.js') }}"></script>
@endsection
