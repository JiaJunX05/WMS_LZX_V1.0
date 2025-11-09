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
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">
    <div class="row g-4">

        {{-- 左侧筛选侧边栏 --}}
        <div class="col-3">
            {{-- 产品筛选侧边栏 --}}
            @include('products.components.filter-sidebar')
        </div>

        {{-- 右侧内容区域 --}}
        <div class="col-9">
            {{-- 页面头部 --}}
            @include('products.components.dashboard-header')

            {{-- 搜索区域 --}}
            @include('products.components.search-filters')

            {{-- 产品列表区域 --}}
            @include('products.components.data-cards')

            {{-- 分页区域 --}}
            @include('products.components.pagination-nav')
        </div>
    </div>
</div>

{{-- Product Create Modal --}}
@include('products.create-model')

@endsection

@section("scripts")
{{-- 产品管理路由配置 --}}
<script>
    // 设置产品管理相关URL
    window.productManagementRoute = "{{ route('product.index') }}";
    window.viewProductUrl = "{{ route('product.view', ['id' => ':id']) }}";
    window.createProductUrl = "{{ route('product.store') }}";
    window.editProductUrl = "{{ route('product.edit', ':id') }}";
    window.updateProductUrl = "{{ route('product.update', ':id') }}";

    // 预加载创建产品所需的数据
    @php
        $categories = \App\Models\Category::all();
        $zones = \App\Models\Zone::all();
        $brands = \App\Models\Brand::all();
        $colors = \App\Models\Color::all();
        $sizes = \App\Models\SizeLibrary::with('category')->where('size_status', 'Available')->get();
        $locations = \App\Models\Location::with('zone', 'rack')->get();
        $mappings = \App\Models\Mapping::with('category', 'subcategory')->get();
        $racks = \App\Models\Rack::all();

        // 计算每个rack的可用容量
        $rackCapacities = [];
        foreach ($racks as $rack) {
            $currentUsage = \App\Models\Product::where('rack_id', $rack->id)->count();
            $rackCapacities[$rack->id] = [
                'capacity' => $rack->capacity,
                'used' => $currentUsage,
                'available' => $rack->capacity - $currentUsage
            ];
        }
    @endphp
    window.productModalData = {
        categories: @json($categories),
        zones: @json($zones),
        brands: @json($brands),
        colors: @json($colors),
        sizes: @json($sizes),
        locations: @json($locations),
        mappings: @json($mappings),
        rackCapacities: @json($rackCapacities)
    };
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/product-management.js') }}"></script>
@endsection
