@extends("layouts.app")

@section("title", "Update Clothing Size")
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
                                <h2 class="dashboard-title mb-1">Update Clothing Size</h2>
                                <p class="dashboard-subtitle mb-0">Modify existing clothing size information</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.attribute_variant.size_clothing.index') }}" class="btn btn-primary">
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
            <!-- 左侧图标区域 -->
            <div class="col-md-5">
                <div class="preview-section d-flex flex-column h-100 bg-light p-3">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-tags me-2"></i>Clothing Size Information
                        </h6>
                    </div>
                    <div class="preview-container flex-grow-1 d-flex align-items-center justify-content-center">
                        <div class="text-center">
                            <i class="bi bi-tags text-primary" style="font-size: 8rem;"></i>
                            <p class="text-muted mt-3">Clothing Size Management</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧表单区域 -->
            <div class="col-md-7">
                <div class="card-body p-4">
            <!-- 表单标题 -->
            <h2 class="text-primary text-center mb-3">Update Clothing Size</h2>
            <p class="text-muted text-center">Modify clothing size information to better manage products</p>
            <hr>

            <!-- 表单内容 -->
            <form action="{{ route('admin.attribute_variant.size_clothing.update', $sizeClothing->id) }}" method="post">
                @csrf
                @method('PUT')

                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-4">
                            <label for="size_value" class="form-label fw-bold">Size Value</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="bi bi-arrows-expand text-primary"></i></span>
                                <input type="text" class="form-control border-start-0" id="size_value" name="size_value"
                                       value="{{ $sizeClothing->size_value }}" required>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="mb-4">
                            <label for="gender_id" class="form-label fw-bold">Gender</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="bi bi-person text-primary"></i></span>
                                <select class="form-control border-start-0" id="gender_id" name="gender_id" required>
                                    <option value="">Select gender</option>
                                    @foreach($genders as $gender)
                                        <option value="{{ $gender->id }}" {{ $sizeClothing->gender_id == $gender->id ? 'selected' : '' }}>{{ $gender->gender_name }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <label for="measurements" class="form-label fw-bold">Measurements <span class="text-muted">(Optional)</span></label>
                    <div class="input-group">
                        <span class="input-group-text bg-light border-end-0"><i class="bi bi-rulers text-primary"></i></span>
                        <textarea class="form-control border-start-0" id="measurements" name="measurements"
                                  placeholder="Enter detailed measurements (e.g., chest: 88-92cm, waist: 74-78cm)" rows="3">{{ is_array($sizeClothing->measurements) && isset($sizeClothing->measurements['description']) ? $sizeClothing->measurements['description'] : '' }}</textarea>
                    </div>
                </div>

                <!-- Size Status Selection -->
                <div class="mb-4">
                    <label class="form-label fw-bold">Size Status</label>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <div class="card h-100 border status-card {{ $sizeClothing->size_status === 'Available' ? 'selected' : '' }}" data-status="Available">
                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                    <input type="radio" name="size_status" value="Available" class="form-check-input me-3" {{ $sizeClothing->size_status === 'Available' ? 'checked' : '' }}>
                                    <div>
                                        <h6 class="card-title mb-1">
                                            <i class="bi bi-check-circle me-2 text-success"></i>Available
                                        </h6>
                                        <p class="card-text text-muted small mb-0">Size is active and can be used</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card h-100 border status-card {{ $sizeClothing->size_status === 'Unavailable' ? 'selected' : '' }}" data-status="Unavailable">
                                <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                    <input type="radio" name="size_status" value="Unavailable" class="form-check-input me-3" {{ $sizeClothing->size_status === 'Unavailable' ? 'checked' : '' }}>
                                    <div>
                                        <h6 class="card-title mb-1">
                                            <i class="bi bi-x-circle me-2 text-danger"></i>Unavailable
                                        </h6>
                                        <p class="card-text text-muted small mb-0">Size is inactive and cannot be used</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <hr class="my-4">
                <button type="submit" class="btn btn-primary w-100">
                    <i class="bi bi-pencil-fill me-2"></i>Update Clothing Size
                </button>
            </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section("scripts")
    <script src="{{ asset('assets/js/size-update.js') }}"></script>
@endsection
