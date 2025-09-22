@extends("layouts.app")

@section("title", "Create Rack")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/dashboard-template.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-template.css') }}">

<div class="container-fluid py-4">
    <!-- Alert Messages -->
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if($errors->any())
        <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            @foreach ($errors->all() as $error)
                <div>{{ $error }}</div>
            @endforeach
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

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
                                <h2 class="dashboard-title mb-1">Create Rack</h2>
                                <p class="dashboard-subtitle mb-0">Add a new rack to organize and manage stock storage efficiently</p>
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

    <!-- Main Content Card -->
    <div class="card shadow-sm border-0">
        <div class="row g-0">
            <!-- Left Preview Section -->
            <div class="col-md-5">
                <div class="preview-section d-flex flex-column h-100 bg-light p-3">
                    <!-- Preview Title -->
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-image me-2"></i>Preview
                        </h6>
                        <span class="badge bg-white text-dark border px-3 py-2">800 x 600</span>
                    </div>

                    <!-- Preview Image -->
                    <div class="preview-container flex-grow-1 d-flex align-items-center justify-content-center">
                        <div class="text-center">
                            <i class="bi bi-image text-primary" id="preview-icon" style="font-size: 8rem;"></i>
                            <img src="" alt="Preview" id="preview-image" class="img-fluid rounded-3 d-none"
                                style="max-width: 100%; max-height: 280px; object-fit: contain;">
                            <p class="text-muted mt-3">Upload Rack Image</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Form Section -->
            <div class="col-md-7">
                <div class="card-body p-4">
                    <!-- Form Title -->
                    <h2 class="text-primary text-center mb-3">Create Rack</h2>
                    <p class="text-muted text-center">Add a new rack to organize and manage stock storage efficiently</p>
                    <hr>

                    <!-- Form Content -->
                    <form action="{{ route('admin.storage_locations.rack.store') }}" method="post" enctype="multipart/form-data">
                        @csrf

                        <div class="mb-4">
                            <label for="input_image" class="form-label fw-bold">Rack Image <span class="text-muted">(Optional)</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="bi bi-upload text-primary"></i></span>
                                <input type="file" class="form-control border-start-0" id="input_image" name="rack_image" accept="image/*">
                            </div>
                            <div class="form-text">
                                <i class="bi bi-info-circle me-2"></i>
                                Supported formats: JPEG, PNG, JPG, GIF (Optional)
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="rack_number" class="form-label fw-bold">Rack Number</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="bi bi-hash text-primary me-2"></i></span>
                                <input type="text" class="form-control border-start-0" id="rack_number" name="rack_number" placeholder="Enter rack number" required>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="capacity" class="form-label fw-bold">Rack Capacity</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="bi bi-boxes text-primary me-2"></i></span>
                                <input type="number" class="form-control border-start-0" id="capacity" name="capacity" placeholder="Enter rack capacity (default: 50)">
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
                                <div class="col-md-6">
                                    <div class="card h-100 border status-card selected" data-status="Available">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="rack_status" value="Available" class="form-check-input me-3" checked>
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
                                    <div class="card h-100 border status-card" data-status="Unavailable">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="rack_status" value="Unavailable" class="form-check-input me-3">
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
                            <i class="bi bi-plus-circle-fill me-2"></i>Create Rack
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section("scripts")
<script src="{{ asset('assets/js/rack-management.js') }}"></script>
@endsection
