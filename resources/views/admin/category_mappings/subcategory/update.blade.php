@extends("layouts.app")

@section("title", "Update Subcategory")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/dashboard-template.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/form-template.css') }}">

<div class="container-fluid py-4">
    <!-- 提示信息 -->
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
                                <i class="bi bi-collection-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Update Subcategory</h2>
                                <p class="dashboard-subtitle mb-0">Modify existing subcategory information</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.category_mapping.subcategory.index') }}" class="btn btn-primary">
                            <i class="bi bi-arrow-left me-2"></i>
                            Back to List
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 主要内容卡片 -->
    <div class="card shadow-sm border-0">
        <div class="row g-0">
            <!-- 左侧预览区域 -->
            <div class="col-md-5">
                <div class="preview-section d-flex flex-column h-100 bg-light p-3">
                    <!-- 预览标题 -->
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-image me-2"></i>Preview
                        </h6>
                        <span class="badge bg-white text-dark border px-3 py-2">800 x 600</span>
                    </div>

                    <!-- 预览图片 -->
                    <div class="preview-container flex-grow-1 d-flex align-items-center justify-content-center" data-original-content="">
                        @if($subcategory->subcategory_image)
                            <img src="{{ asset('assets/images/' . $subcategory->subcategory_image) }}" alt="Preview" id="preview-image"
                                class="img-fluid rounded-3" style="max-width: 100%; max-height: 280px; object-fit: contain;">
                        @else
                            <div class="text-center">
                                <i class="bi bi-image text-primary" style="font-size: 8rem;"></i>
                                <p class="text-muted mt-3">No image available</p>
                            </div>
                        @endif
                    </div>
                </div>
            </div>

            <!-- 右侧表单区域 -->
            <div class="col-md-7">
                <div class="card-body p-4">
                    <!-- 表单标题 -->
                    <h2 class="text-primary text-center mb-3">Update Subcategory</h2>
                    <p class="text-muted text-center">Modify subcategory information to better organize products</p>
                    <hr>

                    <!-- 表单内容 -->
                    <form action="{{ route('admin.category_mapping.subcategory.update', $subcategory->id) }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        @method('PUT')

                        <div class="mb-4">
                            <label for="input_image" class="form-label fw-bold">Subcategory Image</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="bi bi-upload text-primary"></i></span>
                                <input type="file" class="form-control border-start-0" id="input_image" name="subcategory_image">
                            </div>
                            <div class="form-text">
                                <i class="bi bi-info-circle me-2"></i>
                                Supported formats: JPEG, PNG, JPG, GIF (Optional)
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="subcategory_name" class="form-label fw-bold">Subcategory Name</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="bi bi-tag text-primary me-2"></i>
                                </span>
                                <input type="text" class="form-control border-start-0" id="subcategory_name" name="subcategory_name"
                                       value="{{ $subcategory->subcategory_name }}" required>
                            </div>
                        </div>

                        <!-- Subcategory Status Selection -->
                        <div class="mb-4">
                            <label class="form-label fw-bold">Subcategory Status</label>
                            <div class="row g-3">
                                @php
                                    $currentStatus = $subcategory->subcategory_status ?? 'Available';
                                @endphp

                                <div class="col-md-6">
                                    <div class="card h-100 border status-card {{ $currentStatus === 'Available' ? 'selected' : '' }}" data-status="Available">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="subcategory_status" value="Available" class="form-check-input me-3"
                                                   {{ old('subcategory_status', $currentStatus) === 'Available' ? 'checked' : '' }}>
                                            <div>
                                                <h6 class="card-title mb-1">
                                                    <i class="bi bi-check-circle me-2 text-success"></i>Available
                                                </h6>
                                                <p class="card-text text-muted small mb-0">Subcategory is active and can be used</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="card h-100 border status-card {{ $currentStatus === 'Unavailable' ? 'selected' : '' }}" data-status="Unavailable">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="subcategory_status" value="Unavailable" class="form-check-input me-3"
                                                   {{ old('subcategory_status', $currentStatus) === 'Unavailable' ? 'checked' : '' }}>
                                            <div>
                                                <h6 class="card-title mb-1">
                                                    <i class="bi bi-x-circle me-2 text-danger"></i>Unavailable
                                                </h6>
                                                <p class="card-text text-muted small mb-0">Subcategory is inactive and cannot be used</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr class="my-4">
                        <button type="submit" class="btn btn-primary w-100">
                            <i class="bi bi-check-circle-fill me-2"></i>Update Subcategory
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section("scripts")
    <script src="{{ asset('assets/js/subcategory-management.js') }}"></script>
@endsection
