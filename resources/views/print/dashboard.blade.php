{{-- ==========================================
    打印管理页面 - 预览和打印产品标签
    ========================================== --}}

@extends("layouts.app")

@section("title", "Print Labels")
@section("content")

{{-- Meta 标签 --}}
<meta name="print-index-url" content="{{ route('superadmin.print.index') }}">

{{-- CSS 文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/print-form.css') }}">

{{-- 主容器 --}}
<div class="container-fluid py-4">
    {{-- 页面头部导航 --}}
    @include('print.components.dashboard-header')

    <div class="row">
        {{-- 左侧打印选项 --}}
        @include('print.components.filter-sidebar')

        {{-- 右侧内容区 --}}
        <div class="col-lg-9 col-md-8">
            {{-- 预览网格 --}}
            @include('print.components.data-cards')

            {{-- 分页和结果统计 --}}
            @include('print.components.pagination-nav')
        </div>
    </div>
</div>

@endsection

@section("scripts")
{{-- 只添加打印相关的库 --}}
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.12.1/dist/JsBarcode.all.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>

<script>
    const assetPath = '{{ asset('') }}';
</script>

{{-- 打印管理 JavaScript --}}
<script src="{{ asset('assets/js/print-management.js') }}"></script>
@endsection

