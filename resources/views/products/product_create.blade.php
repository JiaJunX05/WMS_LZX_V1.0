{{-- ==========================================
    产品创建页面
    功能：创建新产品，包含基本信息、图片、代码、位置和属性
    ========================================== --}}

@extends('layouts.app')

@section('title', 'Create Product')
@section('content')

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.product-dashboard-header', ['type' => 'create'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 产品创建表单 --}}
    @include('components.form-templates.product-create-form')
</div>

@endsection

@section('scripts')
{{-- 产品管理路由配置 --}}
<script>
    // 设置产品管理相关URL
    window.mappingsData = @json($mappings);
    window.locationsData = @json($locations);
    window.sizesData = @json($sizes);
    window.rackCapacitiesData = @json($rackCapacities);
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/product-management.js') }}"></script>
@endsection
