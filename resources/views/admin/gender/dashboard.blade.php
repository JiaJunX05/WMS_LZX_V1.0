{{-- ==========================================
    性别管理仪表板页面
    功能：性别列表展示、搜索筛选、分页管理、性别操作
    ========================================== --}}

@extends("layouts.app")

@section("title", "Gender Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.gender-dashboard-header', ['type' => 'dashboard'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 统计卡片区域 --}}
    @include('components.metric-cards.gender-metric-cards')

    {{-- 搜索筛选区域 --}}
    @include('components.search-filters.gender-search-filters')

    {{-- 性别列表表格 --}}
    @include('components.data-tables.gender-data-tables')

    {{-- 空状态显示 --}}
    @include('components.empty-list.gender-empty-list')

    {{-- 分页导航区域 --}}
    @include('components.pagination-nav.gender-pagination-nav')
</div>

@endsection

@section("scripts")
{{-- 性别管理路由配置 --}}
<script>
    // 设置性别管理相关URL
    window.genderManagementRoute = "{{ route('admin.gender.index') }}";
    window.editGenderUrl = "{{ route('admin.gender.edit', ['id' => ':id']) }}";
    window.deleteGenderUrl = "{{ route('admin.gender.destroy', ['id' => ':id']) }}";
    window.availableGenderUrl = "{{ route('admin.gender.available', ['id' => ':id']) }}";
    window.unavailableGenderUrl = "{{ route('admin.gender.unavailable', ['id' => ':id']) }}";
    window.genderExportUrl = "{{ route('admin.gender.export') }}";

    // 传递当前用户角色给JavaScript
    window.currentUserRole = "{{ $globalUserRole ?? '' }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/gender-management.js') }}"></script>
@endsection
