{{-- ==========================================
    货架更新页面
    功能：修改货架信息，管理存储位置
    ========================================== --}}

@extends("layouts.app")

@section("title", "Update Rack")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.rack-dashboard-header', ['type' => 'update'])

    {{-- 消息提示容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 货架更新表单 --}}
    @include('components.form-templates.rack-update-form')
</div>

@endsection

@section("scripts")
{{-- 货架管理路由配置 --}}
<script>
    // JavaScript URL定义
    window.rackManagementRoute = "{{ route('admin.rack.index') }}";
    window.updateRackUrl = "{{ route('admin.rack.update', $rack->id) }}";

    // 传递现有货架图片路径给JavaScript
    @if($rack->rack_image)
        window.existingRackImage = '{{ asset('assets/images/' . $rack->rack_image) }}';
    @endif
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/alert-management.js') }}"></script>
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/rack-management.js') }}"></script>

{{-- 页面初始化脚本 --}}
<script>
    // 初始化货架更新页面
    document.addEventListener('DOMContentLoaded', function() {
        // 初始化图片处理功能和表单提交
        initializeRackUpdate();
    });
</script>
@endsection
