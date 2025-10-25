{{-- ==========================================
    通用查看表单模板
    功能：提供统一的查看界面结构
    参数：
        $viewTitle - 查看区域标题
        $viewIcon - 查看区域图标
        $viewDescription - 查看区域描述
        $totalCount - 总数量
        $availableCount - 可用数量
        $unavailableCount - 不可用数量
        $statusField - 状态字段名
        $itemName - 项目名称
        $itemNamePlural - 项目名称复数
    ========================================== --}}

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
                            @if(isset($zone))
                                Selected Zone
                            @elseif(isset($category) && isset($gender))
                                Selected Category
                            @elseif(isset($category))
                                Selected Category
                            @else
                                Current Item
                            @endif
                        </strong>
                    </div>
                    <div class="small">
                        @if(isset($zone))
                            <div class="mb-1">
                                <i class="bi bi-geo-alt me-2 text-muted"></i>
                                <span>Zone: <strong>{{ $zone->zone_name }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-diagram-3 me-2 text-muted"></i>
                                <span>Total Locations: <strong>{{ $locations->count() }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-check-circle me-2 text-muted"></i>
                                <span>Available: <strong>{{ $locations->where('location_status', 'Available')->count() }}</strong></span>
                            </div>
                        @elseif(isset($category) && isset($gender))
                            <div class="mb-1">
                                <i class="bi bi-tag me-2 text-muted"></i>
                                <span>Category: <strong>{{ $category->category_name }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-person me-2 text-muted"></i>
                                <span>Gender: <strong>{{ $gender->gender_name }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-rulers me-2 text-muted"></i>
                                <span>Total Templates: <strong>{{ $sizeTemplates->count() }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-check-circle me-2 text-muted"></i>
                                <span>Available: <strong>{{ $sizeTemplates->where('template_status', 'Available')->count() }}</strong></span>
                            </div>
                        @elseif(isset($category))
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
                            @elseif(isset($sizeLibraries))
                                <div class="mb-1">
                                    <i class="bi bi-rulers me-2 text-muted"></i>
                                    <span>Total Sizes: <strong>{{ $sizeLibraries->count() }}</strong></span>
                                </div>
                                <div class="mb-1">
                                    <i class="bi bi-check-circle me-2 text-muted"></i>
                                    <span>Available: <strong>{{ $sizeLibraries->where('size_status', 'Available')->count() }}</strong></span>
                                </div>
                            @endif
                        @else
                            <div class="mb-1">
                                <i class="bi bi-info-circle me-2 text-muted"></i>
                                <span>View details below</span>
                            </div>
                        @endif
                    </div>
                </div>

                {{-- 统计信息 --}}
                <div class="mt-auto">
                    <div class="row text-center">
                        <div class="col-6">
                            <div class="h4 text-success mb-0" id="availableCount">{{ $availableCount ?? 0 }}</div>
                            <small class="text-muted">Available</small>
                        </div>
                        <div class="col-6">
                            <div class="h4 text-danger mb-0" id="unavailableCount">{{ $unavailableCount ?? 0 }}</div>
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
                            <i class="{{ $viewIcon ?? 'bi bi-list-ul' }} me-2"></i>{{ $viewTitle ?? 'View Items' }}
                        </h6>
                        <small class="text-muted">
                            <i class="bi bi-info-circle me-1"></i>
                            {{ $viewDescription ?? 'View item details below.' }}
                        </small>
                    </div>
                    @if(isset($totalCount))
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-info" id="totalCount">
                                {{ $totalCount }} total {{ $itemNamePlural ?? 'items' }}
                            </span>
                        </div>
                    @endif
                </div>

                {{-- 右侧面板内容 --}}
                @if(isset($zone))
                    <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                        <table class="table table-hover table-striped">
                            <thead class="table-light sticky-top">
                                <tr>
                                    <th class="fw-bold text-center" style="width: 10%;">#</th>
                                    <th class="fw-bold" style="width: 50%;">LOCATION COMBINATION</th>
                                    <th class="fw-bold text-center" style="width: 20%;">STATUS</th>
                                    <th class="fw-bold text-center" style="width: 20%;">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody id="locationsTable">
                                @foreach($locations as $index => $locationItem)
                                    <tr data-location-id="{{ $locationItem->id }}" class="location-row">
                                        <td class="text-center">
                                            <span>{{ $index + 1 }}</span>
                                        </td>
                                        <td>
                                            <span class="value-text">
                                                {{ $locationItem->zone->zone_name }} - {{ $locationItem->rack->rack_number }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <span class="badge {{ $locationItem->location_status === 'Available' ? 'bg-success' : 'bg-danger' }} px-3 py-2">
                                                {{ $locationItem->location_status }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <div class="btn-group" role="group">
                                                <a href="{{ route('admin.location.edit', $locationItem->id) }}" class="btn btn-outline-primary btn-sm">
                                                    <i class="bi bi-pencil me-2"></i>Update
                                                </a>
                                                <button class="btn btn-outline-danger btn-sm" data-location-id="{{ $locationItem->id }}">
                                                    <i class="bi bi-trash me-2"></i>Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @elseif(isset($category) && isset($gender))
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
                                @foreach($sizeTemplates as $index => $template)
                                    <tr data-template-id="{{ $template->id }}" class="size-row">
                                        <td class="text-center">
                                            <span>{{ $index + 1 }}</span>
                                        </td>
                                        <td>
                                            <span class="value-text">
                                                {{ $template->sizeLibrary->size_value }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <span class="badge {{ $template->template_status === 'Available' ? 'bg-success' : 'bg-danger' }} px-3 py-2">
                                                {{ $template->template_status }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <div class="btn-group" role="group">
                                                <a href="{{ route('admin.template.edit', $template->id) }}" class="btn btn-outline-primary btn-sm">
                                                    <i class="bi bi-pencil me-2"></i>Update
                                                </a>
                                                <button class="btn btn-outline-danger btn-sm" data-template-id="{{ $template->id }}">
                                                    <i class="bi bi-trash me-2"></i>Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @elseif(isset($category))
                    @if(isset($mappings))
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
                                                    <a href="{{ route('admin.mapping.edit', $mappingItem->id) }}" class="btn btn-outline-primary btn-sm">
                                                        <i class="bi bi-pencil me-2"></i>Update
                                                    </a>
                                                    <button class="btn btn-outline-danger btn-sm" data-mapping-id="{{ $mappingItem->id }}">
                                                        <i class="bi bi-trash me-2"></i>Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @elseif(isset($sizeLibraries))
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
                    @endif
                @else
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>View the details on the left panel.
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
