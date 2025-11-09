{{-- ==========================================
    位置查看页面主要内容
    功能：显示位置的详细信息
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
                            @if(isset($zone))
                                Selected Zone
                            @else
                                Current Location
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
                        @elseif(isset($location))
                            <div class="mb-1">
                                <i class="bi bi-geo-alt me-2 text-muted"></i>
                                <span>Zone: <strong>{{ $location->zone->zone_name }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-box me-2 text-muted"></i>
                                <span>Rack: <strong>{{ $location->rack->rack_number }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-shield-check me-2 text-muted"></i>
                                <span>Status: <strong>{{ $location->location_status }}</strong></span>
                            </div>
                        @endif
                    </div>
                </div>

                {{-- 统计信息 --}}
                <div class="mt-auto">
                    <div class="row text-center">
                        <div class="col-6">
                            <div class="h4 text-success mb-0" id="availableCount">
                                @if(isset($zone) && isset($locations))
                                    {{ $locations->where('location_status', 'Available')->count() }}
                                @else
                                    0
                                @endif
                            </div>
                            <small class="text-muted">Available</small>
                        </div>
                        <div class="col-6">
                            <div class="h4 text-danger mb-0" id="unavailableCount">
                                @if(isset($zone) && isset($locations))
                                    {{ $locations->where('location_status', 'Unavailable')->count() }}
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
                            @if(isset($zone))
                                Location Values
                            @else
                                View Location
                            @endif
                        </h6>
                        <small class="text-muted">
                            <i class="bi bi-info-circle me-1"></i>
                            @if(isset($zone))
                                View all storage locations in this zone.
                            @else
                                View location details below.
                            @endif
                        </small>
                    </div>
                    @if(isset($zone) && isset($locations))
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-info" id="totalCount">
                                {{ $locations->count() }} total locations
                            </span>
                        </div>
                    @endif
                </div>

                {{-- 表格内容 --}}
                @if(isset($zone) && isset($locations) && $locations->count() > 0)
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
                                                <i class="bi {{ $locationItem->location_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle' }} me-1"></i>{{ $locationItem->location_status }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <div class="btn-group" role="group">
                                                <button type="button" class="btn btn-outline-primary btn-sm" onclick="openUpdateLocationModal({{ $locationItem->id }})"
                                                        data-location-id="{{ $locationItem->id }}"
                                                        data-zone-id="{{ $locationItem->zone_id }}"
                                                        data-rack-id="{{ $locationItem->rack_id }}"
                                                        data-location-status="{{ $locationItem->location_status }}"
                                                        data-zone-name="{{ $locationItem->zone->zone_name }}"
                                                        data-rack-number="{{ $locationItem->rack->rack_number }}">
                                                    <i class="bi bi-pencil me-2"></i>Update
                                                </button>
                                                <button type="button" class="btn btn-outline-danger btn-sm" data-location-id="{{ $locationItem->id }}" data-action="delete">
                                                    <i class="bi bi-trash me-2"></i>Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @elseif(isset($location))
                    {{-- 单个 location 详情显示 --}}
                    <div class="card border-0 bg-white shadow-sm">
                        <div class="card-body p-4">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-muted">Zone</label>
                                        <div class="form-control-plaintext">
                                            <strong>{{ $location->zone->zone_name }}</strong>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-muted">Rack</label>
                                        <div class="form-control-plaintext">
                                            <strong>{{ $location->rack->rack_number }}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-muted">Status</label>
                                        <div>
                                            <span class="badge {{ $location->location_status === 'Available' ? 'bg-success' : 'bg-danger' }} px-3 py-2">
                                                <i class="bi {{ $location->location_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle' }} me-1"></i>{{ $location->location_status }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                @else
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>No locations found.
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

