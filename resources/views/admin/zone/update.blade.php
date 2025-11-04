{{-- ==========================================
    区域更新页面
    功能：修改区域信息，管理存储位置
    ========================================== --}}

@extends("layouts.app")

@section("title", "Update Zone")
@section("content")

{{-- 页面样式文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-image.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

{{-- 页面主体内容 --}}
<div class="container-fluid py-4">

    {{-- 页面头部导航 --}}
    @include('components.dashboard-header.zone-dashboard-header', ['type' => 'update'])


    {{-- 区域更新表单 --}}
    @include('components.form-templates.zone-update-form')
</div>

@endsection

@section("scripts")
{{-- 区域管理路由配置 --}}
<script>
    // 设置区域管理相关路由
    window.zoneManagementRoute = "{{ route('admin.zone.index') }}";
    window.updateZoneUrl = "{{ route('admin.zone.update', $zone->id) }}";

    // 传递现有区域图片路径给JavaScript
    @if($zone->zone_image)
        window.existingZoneImage = '{{ asset('assets/images/' . $zone->zone_image) }}';
    @endif
</script>

{{-- 引入必要的 JavaScript 文件 --}}
<script src="{{ asset('assets/js/components/image-management.js') }}"></script>
<script src="{{ asset('assets/js/components/status-management.js') }}"></script>
<script src="{{ asset('assets/js/zone-management.js') }}"></script>

{{-- 页面初始化脚本 --}}
<script>
    // 初始化区域更新页面
    document.addEventListener('DOMContentLoaded', function() {
        // 初始化图片处理功能和表单提交
        initializeZoneUpdate();
    });
</script>
@endsection
