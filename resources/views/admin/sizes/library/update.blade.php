@extends("layouts.app")

@section("title", "Update Size Library")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-normal.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

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
                                <i class="bi bi-pencil-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">
                                    @if(isset($category))
                                        Update {{ $category->category_name }} Size Library
                                    @else
                                        Update Size Library
                                    @endif
                                </h2>
                                <p class="dashboard-subtitle mb-0 text-muted">
                                    @if(isset($category))
                                        Manage size values for {{ $category->category_name }} category
                                    @else
                                        Modify existing size library information
                                    @endif
                                </p>
                            </div>
                        </div>
                    </div>

                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4">
                        <div class="d-flex justify-content-end gap-2">
                            <a href="{{ route('admin.size_library.library.index') }}" class="btn btn-primary">
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
                        <span class="badge bg-white text-dark border px-3 py-2">Update</span>
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
                                <div>
                                    <i class="bi bi-check-circle me-2 text-success"></i>
                                    <span>Available: <strong>{{ $sizeLibraries->where('size_status', 'Available')->count() }}</strong></span>
                                </div>
                            @else
                                <div class="mb-1">
                                    <i class="bi bi-rulers me-2 text-muted"></i>
                                    <span>Size: <strong>{{ $sizeLibrary->size_value }}</strong></span>
                                </div>
                                <div>
                                    <i class="bi bi-toggle-on me-2 text-muted"></i>
                                    <span>Status: <strong>{{ $sizeLibrary->size_status }}</strong></span>
                                </div>
                            @endif
                        </div>
                    </div>

                </div>
            </div>

            <!-- 右侧编辑表单区域 -->
            <div class="col-md-8">
                <div class="size-values-section p-4">
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h6 class="mb-0 fw-bold">
                                <i class="bi bi-pencil-square me-2"></i>
                                @if(isset($category))
                                    Manage Size Values
                                @else
                                    Update Size Library
                                @endif
                            </h6>
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i>
                                @if(isset($category))
                                    Click Update button to edit size values for this category.
                                @else
                                    Modify size library configuration below.
                                @endif
                            </small>
                        </div>
                    </div>

                    @if(isset($category))
                        <!-- 类别尺码库管理 -->
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
                                                <span class="size-value-text fw-medium">
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
                                                    <button class="btn btn-outline-primary btn-sm" onclick="openUpdateModal({{ $size->id }}, '{{ $size->size_value }}', '{{ $size->size_status }}')">
                                                        <i class="bi bi-pencil me-2"></i>Update
                                                    </button>
                                                    <button class="btn btn-outline-danger btn-sm" onclick="deleteSize({{ $size->id }}, '{{ $size->size_value }}')">
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
                        <!-- 单个尺码库编辑表单 -->
                        <form action="{{ route('admin.size_library.library.update', $sizeLibrary->id) }}" method="POST" id="updateSizeLibraryForm">
                            @csrf
                            @method('PUT')

                            <div class="card border-0 bg-white shadow-sm">
                                <div class="card-body p-4">
                                    <!-- Category Field -->
                                    <div class="mb-4">
                                        <label class="form-label fw-bold text-dark mb-2">
                                            <i class="bi bi-tag me-2 text-primary"></i>Category
                                        </label>
                                        <div class="input-group">
                                            <span class="input-group-text bg-light border-end-0">
                                                <i class="bi bi-tag text-muted"></i>
                                            </span>
                                            <select class="form-select border-start-0" name="category_id" id="category_id" required>
                                                <option value="">Select category</option>
                                                @foreach($categories as $category)
                                                    <option value="{{ $category->id }}"
                                                        {{ $sizeLibrary->category_id == $category->id ? 'selected' : '' }}>
                                                        {{ $category->category_name }}
                                                    </option>
                                                @endforeach
                                            </select>
                                        </div>
                                        <div class="form-text">
                                            <i class="bi bi-info-circle me-1"></i>
                                            Choose the category for this size library
                                        </div>
                                    </div>

                                    <!-- Size Value Field -->
                                    <div class="mb-4">
                                        <label class="form-label fw-bold text-dark mb-2">
                                            <i class="bi bi-rulers me-2 text-primary"></i>Size Value
                                        </label>
                                        <div class="input-group">
                                            <span class="input-group-text bg-light border-end-0">
                                                <i class="bi bi-rulers text-muted"></i>
                                            </span>
                                            <input type="text" class="form-control border-start-0" name="size_value" id="size_value"
                                                   value="{{ $sizeLibrary->size_value }}" required>
                                        </div>
                                        <div class="form-text">
                                            <i class="bi bi-info-circle me-1"></i>
                                            Enter the size value for this library entry
                                        </div>
                                    </div>

                                    <!-- Size Status Field -->
                                    <div class="mb-4">
                                        <label class="form-label fw-bold text-dark mb-3">Size Status</label>
                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <div class="card h-100 status-card {{ $sizeLibrary->size_status === 'Available' ? 'selected' : '' }}" data-status="Available">
                                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                        <input type="radio" name="size_status" value="Available" class="form-check-input me-3" {{ $sizeLibrary->size_status === 'Available' ? 'checked' : '' }}>
                                                        <div>
                                                            <div class="fw-semibold text-success">
                                                                <i class="bi bi-check-circle-fill me-2"></i>Available
                                                            </div>
                                                            <small class="text-muted">Size is active and can be used</small>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="card h-100 status-card {{ $sizeLibrary->size_status === 'Unavailable' ? 'selected' : '' }}" data-status="Unavailable">
                                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                                        <input type="radio" name="size_status" value="Unavailable" class="form-check-input me-3" {{ $sizeLibrary->size_status === 'Unavailable' ? 'checked' : '' }}>
                                                        <div>
                                                            <div class="fw-semibold text-secondary">
                                                                <i class="bi bi-slash-circle-fill me-2"></i>Unavailable
                                                            </div>
                                                            <small class="text-muted">Size is inactive and cannot be used</small>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Action Button -->
                                    <div class="d-grid">
                                        <button type="submit" class="btn btn-primary btn-lg">
                                            <i class="bi bi-check-lg me-2"></i>Update Size Library
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/size-library/size-library-update.js') }}"></script>

<script>
    // 设置全局变量
    window.updateSizeLibraryUrl = "{{ route('admin.size_library.library.update', ['id' => ':id']) }}";
    window.libraryManagementRoute = "{{ route('admin.size_library.library.index') }}";
    window.availableSizeLibraryUrl = "{{ route('admin.size_library.library.available', ['id' => ':id']) }}";
    window.unavailableSizeLibraryUrl = "{{ route('admin.size_library.library.unavailable', ['id' => ':id']) }}";
    window.deleteSizeLibraryUrl = "{{ route('admin.size_library.library.destroy', ['id' => ':id']) }}";

    @if(isset($sizeLibrary))
        // 单个尺码库编辑模式
        window.categoryId = {{ $sizeLibrary->category_id }};
        window.currentSizeLibraryId = {{ $sizeLibrary->id }};
    @elseif(isset($category))
        // 类别编辑模式
        window.categoryId = {{ $category->id }};
    @endif
</script>

<!-- Update Modal for Category Mode -->
@if(isset($category))
<div class="modal fade" id="updateModal" tabindex="-1" aria-labelledby="updateModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="updateModalLabel">
                    <i class="bi bi-pencil-square me-2"></i>Update Size Value
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="updateSizeForm">
                    <input type="hidden" id="updateSizeId" name="size_id">

                    <div class="mb-3">
                        <label for="updateSizeValue" class="form-label fw-bold">
                            <i class="bi bi-rulers me-2"></i>Size Value
                        </label>
                        <input type="text" class="form-control" id="updateSizeValue" name="size_value" required>
                    </div>

                    <div class="mb-3">
                        <label for="updateSizeStatus" class="form-label fw-bold">
                            <i class="bi bi-toggle-on me-2"></i>Status
                        </label>
                        <select class="form-select" id="updateSizeStatus" name="size_status" required>
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary w-100" onclick="submitUpdateForm()">
                    <i class="bi bi-check-circle me-1"></i>Update Size
                </button>
            </div>
        </div>
    </div>
</div>
@endif

<!-- Alert Container -->
<div id="alertContainer" class="position-fixed" style="top: 20px; right: 20px; z-index: 9999;"></div>

@endsection
