{{-- ==========================================
    库存入库页面 - 扫描产品并添加到库存
    ========================================== --}}

@extends("layouts.app")

@section("title", "Stock In")
@section("content")

{{-- CSS 文件引入 --}}
<link rel="stylesheet" href="{{ asset('assets/css/components/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

{{-- 主容器 --}}
<div class="container-fluid py-4">
    {{-- 页面标题区域 --}}
    @include('components.dashboard-header.stock-dashboard-header', ['type' => 'stock_in'])

    {{-- 警告信息容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- 扫描器区域 --}}
    @include('components.information-section.stock-scanner-header', ['type' => 'stock_in'])

    {{-- 已扫描产品区域（使用组件） --}}
    <x-form-templates.templates.stock-scanner-form type="stock_in" />
</div>

@endsection
@section("scripts")
{{-- 使用脚本组件 --}}
<x-form-templates.stock-scanner-form type="stock_in" />
@endsection

