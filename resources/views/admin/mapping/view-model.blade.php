{{-- ==========================================
    分类映射查看页面主要内容
    功能：显示分类映射的详细信息
    ========================================== --}}

{{-- 主要内容卡片 --}}
<div class="card shadow-sm border-0">
    <div class="row g-0">
        {{-- ==========================================
            左侧配置区域
            ========================================== --}}
        <div class="col-md-4">
            <div class="config-section d-flex flex-column h-100 bg-light p-4">
                {{-- 配置标题 --}}
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h6 class="mb-0 fw-bold text-primary">
                        <i class="bi bi-gear-fill me-2"></i>Configuration
                    </h6>
                    <span class="badge bg-white text-dark border px-3 py-2">View</span>
                </div>

                {{-- 左侧面板内容 --}}
                <div class="alert alert-info border-0 mb-4">
                    <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-info-circle-fill me-2"></i>
                        <strong>
                            @if(isset($category))
                                Selected Category
                            @else
                                Current Mapping
                            @endif
                        </strong>
                    </div>
                    <div class="small">
                        @if(isset($category))
                            <div class="mb-1">
                                <i class="bi bi-tag me-2 text-muted"></i>
                                <span>Category: <strong>{{ $category->category_name }}</strong></span>
                            </div>
                            @if(isset($mappings))
                                <div class="mb-1">
                                    <i class="bi bi-diagram-2 me-2 text-muted"></i>
                                    <span>Total Mappings: <strong>{{ $mappings->count() }}</strong></span>
                                </div>
                                <div class="mb-1">
                                    <i class="bi bi-check-circle me-2 text-muted"></i>
                                    <span>Available: <strong>{{ $mappings->where('mapping_status', 'Available')->count() }}</strong></span>
                                </div>
                            @endif
                        @elseif(isset($mapping))
                            <div class="mb-1">
                                <i class="bi bi-tag me-2 text-muted"></i>
                                <span>Category: <strong>{{ $mapping->category->category_name }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-tags me-2 text-muted"></i>
                                <span>Subcategory: <strong>{{ $mapping->subcategory->subcategory_name }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-shield-check me-2 text-muted"></i>
                                <span>Status: <strong>{{ $mapping->mapping_status }}</strong></span>
                            </div>
                        @endif
                    </div>
                </div>

                {{-- 统计信息 --}}
                <div class="mt-auto">
                    <div class="row text-center">
                        <div class="col-6">
                            <div class="h4 text-success mb-0" id="availableCount">
                                @if(isset($category) && isset($mappings))
                                    {{ $mappings->where('mapping_status', 'Available')->count() }}
                                @else
                                    0
                                @endif
                            </div>
                            <small class="text-muted">Available</small>
                        </div>
                        <div class="col-6">
                            <div class="h4 text-danger mb-0" id="unavailableCount">
                                @if(isset($category) && isset($mappings))
                                    {{ $mappings->where('mapping_status', 'Unavailable')->count() }}
                                @else
                                    0
                                @endif
                            </div>
                            <small class="text-muted">Unavailable</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- ==========================================
            右侧查看区域
            ========================================== --}}
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
                    @if(isset($category) && isset($mappings))
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-info" id="totalCount">
                                {{ $mappings->count() }} total mappings
                            </span>
                        </div>
                    @endif
                </div>

                {{-- 表格内容 --}}
                @if(isset($category) && isset($mappings) && $mappings->count() > 0)
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
                                                <i class="bi {{ $mappingItem->mapping_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle' }} me-1"></i>{{ $mappingItem->mapping_status }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <div class="btn-group" role="group">
                                                <button type="button" class="btn btn-outline-primary btn-sm" onclick="openUpdateMappingModal({{ $mappingItem->id }})"
                                                        data-mapping-id="{{ $mappingItem->id }}"
                                                        data-category-id="{{ $mappingItem->category_id }}"
                                                        data-subcategory-id="{{ $mappingItem->subcategory_id }}"
                                                        data-mapping-status="{{ $mappingItem->mapping_status }}"
                                                        data-category-name="{{ $mappingItem->category->category_name }}"
                                                        data-subcategory-name="{{ $mappingItem->subcategory->subcategory_name }}">
                                                    <i class="bi bi-pencil me-2"></i>Update
                                                </button>
                                                <button type="button" class="btn btn-outline-danger btn-sm" data-mapping-id="{{ $mappingItem->id }}" data-action="delete">
                                                    <i class="bi bi-trash me-2"></i>Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @elseif(isset($mapping))
                    {{-- 单个 mapping 详情显示 --}}
                    <div class="card border-0 bg-white shadow-sm">
                        <div class="card-body p-4">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-muted">Category</label>
                                        <div class="form-control-plaintext">
                                            <strong>{{ $mapping->category->category_name }}</strong>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-muted">Subcategory</label>
                                        <div class="form-control-plaintext">
                                            <strong>{{ $mapping->subcategory->subcategory_name }}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-muted">Status</label>
                                        <div>
                                            <span class="badge {{ $mapping->mapping_status === 'Available' ? 'bg-success' : 'bg-danger' }} px-3 py-2">
                                                <i class="bi {{ $mapping->mapping_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle' }} me-1"></i>{{ $mapping->mapping_status }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                @else
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>No mappings found.
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

