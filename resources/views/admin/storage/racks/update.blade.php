@extends("layouts.app")

@section("title", "Update Rack")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-normal.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-status.css') }}">

<div class="container-fluid py-4">
    <!-- 页面标题和返回按钮 -->
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-box-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Update Rack</h2>
                                <p class="dashboard-subtitle mb-0">Modify an existing rack to better organize and manage stock storage efficiently</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.storage_locations.rack.index') }}" class="btn btn-primary">
                            <i class="bi bi-arrow-left me-2"></i>
                            Back to List
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- 提示信息容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    <!-- Main Content Card -->
    <div class="card shadow-sm border-0">
        <div class="row g-0">
            <!-- Left Preview Section -->
            <div class="col-md-5">
                <div class="preview-section d-flex flex-column h-100 bg-light p-3">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-image me-2"></i>Preview
                        </h6>
                        <span class="badge bg-white text-dark border px-3 py-2">800 x 600</span>
                    </div>

                    <!-- Preview Image -->
                    <div class="preview-container flex-grow-1 d-flex align-items-center justify-content-center"
                         data-original-content="@if($rack->rack_image && file_exists(public_path('assets/images/' . $rack->rack_image)))<img src='{{ asset('assets/images/' . $rack->rack_image) }}' alt='Preview' id='preview-image' class='img-fluid rounded-3' style='max-width: 100%; max-height: 280px; object-fit: contain;'>@else<div class='text-center text-muted'><i class='bi bi-image fs-1 mb-3 d-block'></i><p class='mb-0'>No image uploaded</p><small>Upload an image to see preview</small></div>@endif">
                        @if($rack->rack_image && file_exists(public_path('assets/images/' . $rack->rack_image)))
                            <img src="{{ asset('assets/images/' . $rack->rack_image) }}" alt="Preview" id="preview-image"
                                class="img-fluid rounded-3" style="max-width: 100%; max-height: 280px; object-fit: contain;">
                        @else
                            <div class="text-center text-muted">
                                <i class="bi bi-image fs-1 mb-3 d-block"></i>
                                <p class="mb-0">No image uploaded</p>
                                <small>Upload an image to see preview</small>
                            </div>
                        @endif
                    </div>
                </div>
            </div>

            <!-- Right Form Section -->
            <div class="col-md-7">
                <div class="card-body p-4">
                    <!-- Form Title -->
                    <h2 class="text-primary text-center mb-3">Update Rack</h2>
                    <p class="text-muted text-center">Modify an existing rack to better organize and manage stock storage efficiently</p>
                    <hr>

                    <!-- Form Content -->
                    <form action="{{ route('admin.storage_locations.rack.update', $rack->id) }}" method="post" enctype="multipart/form-data">
                        @csrf
                        @method('PUT')

                        <div class="mb-4">
                            <label for="input_image" class="form-label fw-bold">Rack Image</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="bi bi-upload text-primary"></i></span>
                                <input type="file" class="form-control border-start-0" id="input_image" name="rack_image">
                            </div>
                            <div class="form-text">
                                <i class="bi bi-info-circle me-2"></i>
                                Supported formats: JPEG, PNG, JPG, GIF. Leave empty to keep current image.
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="rack_number" class="form-label fw-bold">Rack Number</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="bi bi-hash text-primary"></i></span>
                                <input type="text" class="form-control border-start-0" id="rack_number" name="rack_number" value="{{ $rack->rack_number }}" required>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="capacity" class="form-label fw-bold">Rack Capacity</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="bi bi-boxes text-primary"></i></span>
                                <input type="number" class="form-control border-start-0" id="capacity" name="capacity" value="{{ $rack->capacity }}" placeholder="Enter rack capacity (default: 50)">
                            </div>
                            <div class="form-text">
                                <i class="bi bi-info-circle me-2"></i>
                                Leave empty to use default capacity (50)
                            </div>
                        </div>

                        <!-- Rack Status Selection -->
                        <div class="mb-4">
                            <label class="form-label fw-bold">Rack Status</label>
                            <div class="row g-3">
                                @php
                                    $currentStatus = $rack->rack_status ?? 'Available';
                                @endphp

                                <div class="col-md-6">
                                    <div class="card h-100 border status-card {{ $currentStatus === 'Available' ? 'selected' : '' }}" data-status="Available">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="rack_status" value="Available" class="form-check-input me-3"
                                                   {{ old('rack_status', $currentStatus) === 'Available' ? 'checked' : '' }}>
                                            <div>
                                                <h6 class="card-title mb-1">
                                                    <i class="bi bi-check-circle me-2 text-success"></i>Available
                                                </h6>
                                                <p class="card-text text-muted small mb-0">Rack is active and can be used</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="card h-100 border status-card {{ $currentStatus === 'Unavailable' ? 'selected' : '' }}" data-status="Unavailable">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="rack_status" value="Unavailable" class="form-check-input me-3"
                                                   {{ old('rack_status', $currentStatus) === 'Unavailable' ? 'checked' : '' }}>
                                            <div>
                                                <h6 class="card-title mb-1">
                                                    <i class="bi bi-x-circle me-2 text-danger"></i>Unavailable
                                                </h6>
                                                <p class="card-text text-muted small mb-0">Rack is inactive and cannot be used</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr class="my-4">
                        <button type="submit" class="btn btn-primary w-100">
                            <i class="bi bi-check-circle-fill me-2"></i>Update Rack
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section("scripts")
<script>
    // JavaScript URL definitions
    window.rackManagementRoute = "{{ route('admin.storage_locations.rack.index') }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/storage-location/rack-update.js') }}"></script>
@endsection
