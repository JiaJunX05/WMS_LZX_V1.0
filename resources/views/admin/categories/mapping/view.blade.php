@extends("layouts.app")

@section("title", "View Category Mapping")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-view.css') }}">

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
                            <div class="page-icon me-4">
                                <i class="bi bi-eye-fill"></i>
                            </div>
                            <div>
                                <h2 class="page-title mb-1">
                                    @if(isset($category))
                                        View {{ $category->category_name }} Mappings
                                    @else
                                        View Category Mapping
                                    @endif
                                </h2>
                                <p class="page-subtitle mb-0">
                                    @if(isset($category))
                                        View all subcategory mappings for {{ $category->category_name }}
                                    @else
                                        View category mapping details
                                    @endif
                                </p>
                            </div>
                        </div>
                    </div>

                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4">
                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ route('admin.category_mapping.mapping.index') }}" class="btn btn-primary">
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

    <!-- 统一的映射管理界面 -->
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
                    <div class="info-card">
                        <div class="info-title">
                            <i class="bi bi-info-circle-fill me-2"></i>
                            @if(isset($category))
                                Selected Category
                            @else
                                Current Mapping
                            @endif
                        </div>
                        <div class="info-item">
                            <i class="bi bi-tag"></i>
                            <span>Category: <strong>
                                @if(isset($category))
                                    {{ $category->category_name }}
                                @else
                                    {{ $mapping->category->category_name ?? 'N/A' }}
                                @endif
                            </strong></span>
                        </div>
                        @if(isset($category))
                            <div class="info-item">
                                <i class="bi bi-diagram-2"></i>
                                <span>Total Mappings: <strong>{{ $mappings->count() }}</strong></span>
                            </div>
                            <div class="info-item">
                                <i class="bi bi-check-circle"></i>
                                <span>Available: <strong>{{ $mappings->where('mapping_status', 'Available')->count() }}</strong></span>
                            </div>
                        @else
                            <div class="info-item">
                                <i class="bi bi-tags"></i>
                                <span>Subcategory: <strong>{{ $mapping->subcategory->subcategory_name ?? 'N/A' }}</strong></span>
                            </div>
                            <div class="info-item">
                                <i class="bi bi-toggle-on"></i>
                                <span>Status: <strong>{{ $mapping->mapping_status ?? 'N/A' }}</strong></span>
                            </div>
                        @endif
                    </div>

                    @if(isset($category))
                        <!-- 统计信息 -->
                        <div class="stats-container">
                            <div class="stats-row">
                                <div class="stat-item">
                                    <div class="stat-number text-success" id="availableCount">{{ $mappings->where('mapping_status', 'Available')->count() }}</div>
                                    <div class="stat-label">Available</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-number text-danger" id="unavailableCount">{{ $mappings->where('mapping_status', 'Unavailable')->count() }}</div>
                                    <div class="stat-label">Unavailable</div>
                                </div>
                            </div>
                        </div>
                    @else
                        <!-- 统计信息 -->
                        <div class="stats-container">
                            <div class="stats-row">
                                <div class="stat-item">
                                    <div class="stat-number text-primary">1</div>
                                    <div class="stat-label">Mapping Entry</div>
                                </div>
                            </div>
                        </div>
                    @endif
                </div>
            </div>

            <!-- 右侧映射值列表区域 -->
            <div class="col-md-8">
                <div class="size-values-section p-4">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <h6 class="mb-0 fw-bold">
                                <i class="bi bi-list-ul me-2"></i>
                                @if(isset($category))
                                    Mapping Values
                                @else
                                    View Mapping
                                @endif
                            </h6>
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i>
                                @if(isset($category))
                                    View all mapping values for this category.
                                @else
                                    View mapping details below.
                                @endif
                            </small>
                        </div>
                        @if(isset($category))
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-info" id="totalCount">
                                    {{ $mappings->count() }} total mappings
                                </span>
                            </div>
                        @endif
                    </div>

                    @if(isset($category))
                        <!-- Mappings列表显示 -->
                        <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                            <table class="table table-hover table-striped">
                                <thead class="table-light sticky-top">
                                    <tr>
                                        <th class="fw-bold text-center" style="width: 10%;">#</th>
                                        <th class="fw-bold" style="width: 50%;">MAPPING COMBINATION</th>
                                        <th class="fw-bold text-center" style="width: 20%;">STATUS</th>
                                        <th class="fw-bold text-center" style="width: 20%;">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody id="mappingsTable">
                                    @foreach($mappings as $index => $mappingItem)
                                        <tr data-mapping-id="{{ $mappingItem->id }}" class="mapping-row">
                                            <td class="text-center">
                                                <span>{{ $index + 1 }}</span>
                                            </td>
                                            <td>
                                                <span class="value-text">
                                                    {{ $mappingItem->category->category_name }} - {{ $mappingItem->subcategory->subcategory_name }}
                                                </span>
                                            </td>
                                            <td class="text-center">
                                                <span class="badge {{ $mappingItem->mapping_status === 'Available' ? 'bg-success' : 'bg-danger' }} px-3 py-2">
                                                    {{ $mappingItem->mapping_status }}
                                                </span>
                                            </td>
                                            <td class="text-center">
                                                <div class="btn-group" role="group">
                                                    <a href="{{ route('admin.category_mapping.mapping.edit', $mappingItem->id) }}" class="btn btn-outline-primary btn-sm">
                                                        <i class="bi bi-pencil me-2"></i>Update
                                                    </a>
                                                    <button class="btn btn-outline-danger btn-sm" onclick="deleteMapping({{ $mappingItem->id }}, '{{ $mappingItem->category->category_name }}', '{{ $mappingItem->subcategory->subcategory_name }}')">
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
                        <!-- 单个Mapping查看信息 -->
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            View the mapping details on the left panel.
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

@endsection

@section("scripts")
<script>
    // 设置全局变量
    window.viewMappingUrl = "{{ route('admin.category_mapping.mapping.view', ['id' => ':id']) }}";
    window.mappingManagementRoute = "{{ route('admin.category_mapping.mapping.index') }}";
    window.deleteMappingUrl = "{{ route('admin.category_mapping.mapping.destroy', ['id' => ':id']) }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/category-mapping/category-mapping-view.js') }}"></script>
@endsection
