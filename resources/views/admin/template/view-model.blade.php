{{-- ==========================================
    尺码模板查看页面主要内容
    功能：显示尺码模板的详细信息
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
                            @if(isset($category) && isset($gender))
                                Selected Category & Gender
                            @else
                                Current Template
                            @endif
                        </strong>
                    </div>
                    <div class="small">
                        @if(isset($category) && isset($gender))
                            <div class="mb-1">
                                <i class="bi bi-tag me-2 text-muted"></i>
                                <span>Category: <strong>{{ $category->category_name }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-person me-2 text-muted"></i>
                                <span>Gender: <strong>{{ $gender }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-rulers me-2 text-muted"></i>
                                <span>Total Templates: <strong>{{ $sizeTemplates->count() }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-check-circle me-2 text-muted"></i>
                                <span>Available: <strong>{{ $sizeTemplates->where('template_status', 'Available')->count() }}</strong></span>
                            </div>
                        @elseif(isset($sizeTemplate))
                            <div class="mb-1">
                                <i class="bi bi-tag me-2 text-muted"></i>
                                <span>Category: <strong>{{ $sizeTemplate->category->category_name ?? 'N/A' }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-person me-2 text-muted"></i>
                                <span>Gender: <strong>{{ $sizeTemplate->gender ?? 'N/A' }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-rulers me-2 text-muted"></i>
                                <span>Size Value: <strong>{{ $sizeTemplate->sizeLibrary->size_value ?? 'N/A' }}</strong></span>
                            </div>
                            <div class="mb-1">
                                <i class="bi bi-shield-check me-2 text-muted"></i>
                                <span>Status: <strong>{{ $sizeTemplate->template_status ?? 'N/A' }}</strong></span>
                            </div>
                        @endif
                    </div>
                </div>

                {{-- 统计信息 --}}
                <div class="mt-auto">
                    <div class="row text-center">
                        <div class="col-6">
                            <div class="h4 text-success mb-0" id="availableCount">
                                @if(isset($category) && isset($gender))
                                    {{ $sizeTemplates->where('template_status', 'Available')->count() }}
                                @else
                                    0
                                @endif
                            </div>
                            <small class="text-muted">Available</small>
                        </div>
                        <div class="col-6">
                            <div class="h4 text-danger mb-0" id="unavailableCount">
                                @if(isset($category) && isset($gender))
                                    {{ $sizeTemplates->where('template_status', 'Unavailable')->count() }}
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
                            @if(isset($category) && isset($gender))
                                Template Values
                            @else
                                View Template
                            @endif
                        </h6>
                        <small class="text-muted">
                            <i class="bi bi-info-circle me-1"></i>
                            @if(isset($category) && isset($gender))
                                View all template values for this category and gender combination.
                            @else
                                View template details below.
                            @endif
                        </small>
                    </div>
                    @if(isset($category) && isset($gender))
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-info" id="totalCount">
                                {{ $sizeTemplates->count() }} total templates
                            </span>
                        </div>
                    @endif
                </div>

                {{-- 表格内容 --}}
                @if(isset($category) && isset($gender) && $sizeTemplates->count() > 0)
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
                                                <i class="bi {{ $template->template_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle' }} me-1"></i>{{ $template->template_status }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <div class="btn-group" role="group">
                                                <button type="button" class="btn btn-outline-primary btn-sm" onclick="openUpdateTemplateModal({{ $template->id }})"
                                                        data-template-id="{{ $template->id }}"
                                                        data-category-id="{{ $template->category_id }}"
                                                        data-gender="{{ $template->gender }}"
                                                        data-size-library-id="{{ $template->size_library_id }}"
                                                        data-template-status="{{ $template->template_status }}"
                                                        data-category-name="{{ $template->category->category_name ?? '' }}"
                                                        data-size-value="{{ $template->sizeLibrary->size_value ?? '' }}">
                                                    <i class="bi bi-pencil me-2"></i>Update
                                                </button>
                                                <button type="button" class="btn btn-outline-danger btn-sm" data-template-id="{{ $template->id }}" data-action="delete">
                                                    <i class="bi bi-trash me-2"></i>Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @elseif(isset($sizeTemplate))
                    {{-- 单个 template 详情显示 --}}
                    <div class="card border-0 bg-white shadow-sm">
                        <div class="card-body p-4">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-muted">Category</label>
                                        <div class="form-control-plaintext">
                                            <strong>{{ $sizeTemplate->category->category_name ?? 'N/A' }}</strong>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-muted">Gender</label>
                                        <div class="form-control-plaintext">
                                            <strong>{{ $sizeTemplate->gender ?? 'N/A' }}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-muted">Size Value</label>
                                        <div class="form-control-plaintext">
                                            <strong>{{ $sizeTemplate->sizeLibrary->size_value ?? 'N/A' }}</strong>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold text-muted">Status</label>
                                        <div>
                                            <span class="badge {{ $sizeTemplate->template_status === 'Available' ? 'bg-success' : 'bg-danger' }} px-3 py-2">
                                                <i class="bi {{ $sizeTemplate->template_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle' }} me-1"></i>{{ $sizeTemplate->template_status }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                @else
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>No templates found.
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

