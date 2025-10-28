{{-- ==========================================
    产品管理仪表板
    功能：管理产品，查看统计信息和按分类筛选的产品
    ========================================== --}}

@extends("layouts.app")

@section("title", "Product Management")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/product-dashboard.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">
    <div class="row g-4">

        {{-- 左侧筛选侧边栏 --}}
        <div class="col-3">
            {{-- 产品筛选侧边栏 --}}
            @include('components.dashboard-sidebar.product-dashboard-sidebar')
        </div>

        {{-- 右侧内容区域 --}}
        <div class="col-9">
            {{-- 页面头部 --}}
            @include('components.dashboard-header.product-dashboard-header', ['type' => 'dashboard'])

            {{-- 消息提示容器 --}}
            <div id="alertContainer" class="mb-4"></div>

            {{-- 搜索区域 --}}
            @include('components.search-filters.product-search-filters')

            {{-- 产品列表区域 --}}
            <div id="product-card-container" class="row g-4" data-url="{{ route('product.index') }}" data-view-url="{{ route('product.view', ['id' => ':id']) }}">
                {{-- 产品卡片将通过JavaScript动态加载 --}}
            </div>

            {{-- 空状态显示 --}}
            @include('components.empty-list.product-empty-list')

            {{-- 分页区域 --}}
            @include('components.pagination-nav.product-pagination-nav')
        </div>
    </div>
</div>

@endsection

@section("scripts")
{{-- 产品管理路由配置 --}}
<script>
    // 设置产品管理相关URL
    window.productManagementRoute = "{{ route('product.index') }}";
    window.viewProductUrl = "{{ route('product.view', ['id' => ':id']) }}";
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/product-management.js') }}"></script>
@endsection
