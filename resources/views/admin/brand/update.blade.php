{{-- ==========================================
    品牌更新页面
    功能：修改品牌信息，管理产品品牌
    ========================================== --}}

@extends("layouts.app")

@section("title", "Update Brand")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.brand-dashboard-header', ['type' => 'update'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 品牌更新表单 --}}
    @include('components.form-templates.brand-update-form')
</div>

@endsection

@section("scripts")
{{-- 品牌管理路由配置 --}}
<script>
    // JavaScript URL定义
    window.brandManagementRoute = "{{ route('admin.brand.index') }}";
    window.updateBrandUrl = "{{ route('admin.brand.update', $brand->id) }}";

    // 传递现有品牌图片路径给JavaScript
    @if($brand->brand_image)
        window.existingBrandImage = '{{ asset('assets/images/' . $brand->brand_image) }}';
    @endif
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/brand-management.js') }}"></script>

{{-- 页面初始化脚本 --}}
<script>
    // 初始化品牌更新页面
    document.addEventListener('DOMContentLoaded', function() {
        // 初始化图片处理功能和表单提交
        initializeBrandUpdate();
    });
</script>
@endsection
