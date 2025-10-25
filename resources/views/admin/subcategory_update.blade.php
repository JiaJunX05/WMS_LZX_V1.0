{{-- ==========================================
    子分类更新页面
    功能：修改子分类信息，管理产品子分类
    ========================================== --}}

@extends("layouts.app")

@section("title", "Update Subcategory")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.main-display.dashboard-header.subcategory-header', ['type' => 'update'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 子分类更新表单 --}}
    @include('components.form-templates.subcategory-update-form')
</div>

@endsection

@section("scripts")
{{-- 子分类管理路由配置 --}}
<script>
    // 设置子分类管理相关路由
    window.subcategoryManagementRoute = "{{ route('admin.subcategory.index') }}";
    window.updateSubcategoryUrl = "{{ route('admin.subcategory.update', $subcategory->id) }}";

    // 传递现有子分类图片路径给JavaScript
    @if($subcategory->subcategory_image)
        window.existingSubcategoryImage = '{{ asset('assets/images/' . $subcategory->subcategory_image) }}';
    @endif
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/common/image-system.js') }}"></script>
<script src="{{ asset('assets/js/common/status-system.js') }}"></script>
<script src="{{ asset('assets/js/subcategory-management.js') }}"></script>

{{-- 页面初始化脚本 --}}
    document.addEventListener('DOMContentLoaded', function() {
        initializeSubcategoryUpdate();
    });
</script>
@endsection
