{{-- ==========================================
    货架管理仪表板页面
    功能：货架列表展示、搜索筛选、分页管理、货架操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Rack Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.main-display.dashboard-header.rack-header', ['type' => 'dashboard'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 统计卡片区域 --}}
    @include('components.main-display.stats-cards.rack-stats-cards')

    {{-- 搜索筛选区域 --}}
    @include('components.main-display.search-filter.rack-search-filter')

    {{-- 货架列表表格 --}}
    @include('components.main-display.data-table.rack-table')

    {{-- 分页导航区域 --}}
    @include('components.main-display.pagination-nav.rack-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 货架管理路由配置 --}}
<script>
    // 设置货架管理相关URL
    window.rackManagementRoute = "{{ route('admin.rack.index') }}";
    window.editRackUrl = "{{ route('admin.rack.edit', ['id' => ':id']) }}";
    window.deleteRackUrl = "{{ route('admin.rack.destroy', ['id' => ':id']) }}";
    window.availableRackUrl = "{{ route('admin.rack.available', ['id' => ':id']) }}";
    window.unavailableRackUrl = "{{ route('admin.rack.unavailable', ['id' => ':id']) }}";
    window.rackExportUrl = "{{ route('admin.rack.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/rack-management.js') }}"></script>
@endsection
