@extends("layouts.app")

@section("title", "View Size Library")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

<div class="container-fluid py-4">

    {{-- ========================================== --}}
    {{-- 页面标题和操作区域 (Page Header & Actions) --}}
    {{-- ========================================== --}}
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    {{-- 标题区域 --}}
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-rulers"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">
                                    @if(isset($category))
                                        View {{ $category->category_name }} Size Library
                                    @else
                                        View Size Library
                                    @endif
                                </h2>
                                <p class="dashboard-subtitle mb-0">
                                    @if(isset($category))
                                        View size library for {{ $category->category_name }} category
                                    @else
                                        View size library configuration and size values
                                    @endif
                                </p>
                            </div>
                        </div>
                    </div>

                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4">
                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ route('admin.library.index') }}" class="btn btn-primary">
                                <i class="bi bi-arrow-left me-2"></i>Back to List
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- 提示信息容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    <!-- 统一的尺码库管理界面 -->
    <div class="card shadow-sm border-0">
        <div class="row g-0">
            <!-- 左侧配置区域 -->
            <div class="col-md-4">
                <div class="config-section d-flex flex-column h-100 bg-light p-4">
                    <!-- 配置标题 -->
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-gear-fill me-2"></i>Configuration
                        </h6>
                        <span class="badge bg-white text-dark border px-3 py-2">View</span>
                    </div>

                    <!-- 信息显示 -->
                    <div class="alert alert-info border-0 mb-4">
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-info-circle-fill me-2"></i>
                            <strong>
                                @if(isset($category))
                                    Selected Category
                                @else
                                    Current Size Library
                                @endif
                            </strong>
                        </div>
                        <div class="small">
                            <div class="mb-1">
                                <i class="bi bi-tag me-2 text-muted"></i>
                                <span>Category: <strong>
                                    @if(isset($category))
                                        {{ $category->category_name }}
                                    @else
                                        {{ $sizeLibrary->category->category_name ?? 'N/A' }}
                                    @endif
                                </strong></span>
                            </div>
                            @if(isset($category))
                                <div class="mb-1">
                                    <i class="bi bi-rulers me-2 text-muted"></i>
                                    <span>Total Sizes: <strong>{{ $sizeLibraries->count() }}</strong></span>
                                </div>
                                <div class="mb-1">
                                    <i class="bi bi-check-circle me-2 text-muted"></i>
                                    <span>Available: <strong>{{ $sizeLibraries->where('size_status', 'Available')->count() }}</strong></span>
                                </div>
                            @else
                                <div class="mb-1">
                                    <i class="bi bi-rulers me-2 text-muted"></i>
                                    <span>Size: <strong>{{ $sizeLibrary->size_value }}</strong></span>
                                </div>
                                <div class="mb-1">
                                    <i class="bi bi-toggle-on me-2 text-muted"></i>
                                    <span>Status: <strong>{{ $sizeLibrary->size_status }}</strong></span>
                                </div>
                            @endif
                        </div>
                    </div>

                    @if(isset($category))
                        <!-- 统计信息 -->
                        <div class="mt-auto">
                            <div class="row text-center">
                                <div class="col-6">
                                    <div class="h4 text-success mb-0" id="availableCount">{{ $sizeLibraries->where('size_status', 'Available')->count() }}</div>
                                    <small class="text-muted">Available</small>
                                </div>
                                <div class="col-6">
                                    <div class="h4 text-danger mb-0" id="unavailableCount">{{ $sizeLibraries->where('size_status', 'Unavailable')->count() }}</div>
                                    <small class="text-muted">Unavailable</small>
                                </div>
                            </div>
                        </div>
                    @else
                        <!-- 统计信息 -->
                        <div class="mt-auto">
                            <div class="row text-center">
                                <div class="col-12">
                                    <div class="h4 text-primary mb-0">1</div>
                                    <small class="text-muted">Size Entry</small>
                                </div>
                            </div>
                        </div>
                    @endif
                </div>
            </div>

            <!-- 右侧尺码值列表区域 -->
            <div class="col-md-8">
                <div class="size-values-section p-4">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <h6 class="mb-0 fw-bold">
                                <i class="bi bi-list-ul me-2"></i>
                                @if(isset($category))
                                    Size Values
                                @else
                                    View Size Library
                                @endif
                            </h6>
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i>
                                @if(isset($category))
                                    View all size values for this category.
                                @else
                                    View size library details below.
                                @endif
                            </small>
                        </div>
                        @if(isset($category))
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-info" id="totalCount">
                                    {{ $sizeLibraries->count() }} total sizes
                                </span>
                            </div>
                        @endif
                    </div>

                    @if(isset($category))
                        <!-- Size Libraries列表显示 -->
                        <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                            <table class="table table-hover table-striped">
                                <thead class="table-light sticky-top">
                                    <tr>
                                        <th class="fw-bold text-center" style="width: 10%;">#</th>
                                        <th class="fw-bold" style="width: 50%;">SIZE VALUE</th>
                                        <th class="fw-bold text-center" style="width: 20%;">STATUS</th>
                                        <th class="fw-bold text-center" style="width: 20%;">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody id="sizeValuesTable">
                                    @foreach($sizeLibraries as $index => $size)
                                        <tr data-size-id="{{ $size->id }}" class="size-row">
                                            <td class="text-center">
                                                <span>{{ $index + 1 }}</span>
                                            </td>
                                            <td>
                                                <span class="value-text">
                                                    {{ $size->size_value }}
                                                </span>
                                            </td>
                                            <td class="text-center">
                                                <span class="badge {{ $size->size_status === 'Available' ? 'bg-success' : 'bg-danger' }} px-3 py-2">
                                                    {{ $size->size_status }}
                                                </span>
                                            </td>
                                            <td class="text-center">
                                                <div class="btn-group" role="group">
                                                    <a href="{{ route('admin.library.edit', $size->id) }}" class="btn btn-outline-primary btn-sm">
                                                        <i class="bi bi-pencil me-2"></i>Update
                                                    </a>
                                                    <button class="btn btn-outline-danger btn-sm" data-library-id="{{ $size->id }}">
                                                        <i class="bi bi-trash me-2"></i>Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <!-- 单个Size Library查看信息 -->
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            View the size library details on the left panel.
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/library-management.js') }}"></script>

<script>
    // 设置全局变量
    window.viewSizeLibraryUrl = "{{ route('admin.library.view', ['id' => ':id']) }}";
    window.sizeLibraryManagementRoute = "{{ route('admin.library.index') }}";
    window.availableSizeLibraryUrl = "{{ route('admin.library.available', ['id' => ':id']) }}";
    window.unavailableSizeLibraryUrl = "{{ route('admin.library.unavailable', ['id' => ':id']) }}";
    window.deleteSizeLibraryUrl = "{{ route('admin.library.destroy', ['id' => ':id']) }}";
</script>

@endsection
