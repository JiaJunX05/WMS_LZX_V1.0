{{-- ==========================================
    分类更新页面
    功能：修改分类信息，管理产品分类
    ========================================== --}}

@extends("layouts.app")

@section("title", "Update Category")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.category-dashboard-header', ['type' => 'update'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 分类更新表单 --}}
    @include('components.form-templates.category-update-form')
</div>

@endsection

@section("scripts")
{{-- 分类管理路由配置 --}}
<script>
    // JavaScript URL定义
    window.categoryManagementRoute = "{{ route('admin.category.index') }}";
    window.updateCategoryUrl = "{{ route('admin.category.update', $category->id) }}";

    // 传递现有分类图片路径给JavaScript
    @if($category->category_image)
        window.existingCategoryImage = '{{ asset('assets/images/' . $category->category_image) }}';
    @endif
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/category-management.js') }}"></script>

{{-- 页面初始化脚本 --}}
<script>
    // 初始化分类更新页面
    document.addEventListener('DOMContentLoaded', function() {
        // 初始化图片处理功能和表单提交
        initializeCategoryUpdate();
    });
</script>
@endsection
