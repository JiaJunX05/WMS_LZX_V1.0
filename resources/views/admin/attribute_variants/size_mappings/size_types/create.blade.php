@extends("layouts.app")

@section("title", "Create Size Type")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/dashboard-template.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/size-form-display.css') }}">

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
                                <i class="bi bi-plus-circle-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Size Types</h2>
                                <p class="dashboard-subtitle mb-0">Map clothing or shoe sizes to product categories</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.attribute_variant.size_type.index') }}" class="btn btn-primary">
                            <i class="bi bi-arrow-left me-2"></i>
                            Back to List
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 主要内容卡片 - 左右布局 -->
    <form action="{{ route('admin.attribute_variant.size_type.store') }}" method="post" id="sizesForm">
        @csrf
        <div class="card shadow-sm border-0">
            <div class="row g-0">
                <!-- 左侧配置区域 -->
                <div class="col-md-3">
                    <div class="config-section d-flex flex-column h-100 bg-light p-4">
                        <!-- 配置标题 -->
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="mb-0 fw-bold text-primary">
                                <i class="bi bi-gear-fill me-2"></i>Configuration
                            </h6>
                            <span class="badge bg-white text-dark border px-3 py-2">Step 1</span>
                        </div>

                        <!-- 配置内容 -->
                        <div class="config-content flex-grow-1">
                            <!-- 分类选择 -->
                            <div class="mb-4">
                                <label for="category_id" class="form-label fw-bold">Category <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-tag text-primary"></i>
                                    </span>
                                    <select class="form-control border-start-0" id="category_id" name="category_id" required>
                                        <option value="">Select category</option>
                                        @foreach($categories as $category)
                                            <option value="{{ $category->id }}">{{ $category->category_name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <!-- 性别筛选 -->
                            <div class="mb-4">
                                <label for="gender_filter" class="form-label fw-bold">Gender Filter</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-person text-primary"></i>
                                    </span>
                                    <select class="form-control border-start-0" id="gender_filter">
                                        <option value="">All Genders</option>
                                        @foreach($genders as $gender)
                                            <option value="{{ $gender->id }}">{{ $gender->gender_name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <small class="text-muted">Filter sizes by gender</small>
                            </div>

                            <!-- 尺码类型选择 -->
                            <div class="mb-4" id="sizeTypeSection" style="display: none;">
                                <label for="size_type" class="form-label fw-bold">Size Type <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-diagram-3 text-primary"></i>
                                    </span>
                                    <select class="form-control border-start-0" id="size_type" name="size_type" required>
                                        <option value="">Select Size Type</option>
                                    </select>
                                </div>
                                <small class="text-muted">Available size types for selected category and gender</small>
                            </div>

                            <!-- 配置摘要 -->
                            <div class="config-summary" id="configSummary" style="display: none;">
                                <div class="alert alert-info border-0 bg-white">
                                    <div class="d-flex align-items-center mb-2">
                                        <i class="bi bi-info-circle-fill text-primary me-2"></i>
                                        <strong>Configuration Summary</strong>
                                    </div>
                                    <div class="summary-details">
                                        <div class="mb-1">
                                            <i class="bi bi-tag me-2 text-muted"></i>
                                            <span>Category: <strong id="selectedCategory">None</strong></span>
                                        </div>
                                        <div class="mb-1">
                                            <i class="bi bi-person me-2 text-muted"></i>
                                            <span>Gender: <strong id="selectedGender">All</strong></span>
                                        </div>
                                        <div>
                                            <i class="bi bi-diagram-3 me-2 text-muted"></i>
                                            <span>Type: <strong id="selectedType">None</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 快速操作 -->
                            <div class="quick-actions mt-auto">
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-outline-primary" id="selectAllSizes">
                                        <i class="bi bi-check-all me-2"></i>Select All Visible
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary" id="clearAllSizes">
                                        <i class="bi bi-x-circle me-2"></i>Clear Selection
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧尺码选择区域 -->
                <div class="col-md-9">
                    <div class="card-body p-4">
                        <!-- 表单标题 -->
                        <h2 class="text-primary text-center mb-3">Size Selection</h2>
                        <p class="text-muted text-center">Select sizes to map to the category</p>
                        <hr>

                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Configure Size Mapping</h5>
                            <p class="text-muted">Select category and gender filter from the left panel to auto-generate size type options</p>
                        </div>

                        <!-- 选择提示（隐藏状态） -->
                        <div class="alert alert-warning" id="selectionPrompt" style="display: none;">
                            <i class="bi bi-info-circle me-2"></i>
                            Please select a category and gender filter to auto-generate size type options
                        </div>

                        <!-- 衣服尺码选择区域 -->
                        <div id="clothingSizeArea" style="display: none;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">
                                    <i class="bi bi-person-badge text-primary me-2"></i>Available Clothing Sizes
                                    <span class="text-muted" id="clothingGenderFilter"></span>
                                </h5>
                                <span class="badge bg-info" id="clothingSelectedCount">0 selected</span>
                            </div>

                            <div class="sizes-grid" id="clothingSizesGrid">
                                @foreach($clothingSizes as $clothingSize)
                                    <div class="size-card" data-gender="{{ $clothingSize->gender_id }}" data-size-id="{{ $clothingSize->id }}">
                                        <input type="checkbox" name="clothing_size_ids[]" value="{{ $clothingSize->id }}"
                                               id="clothing_{{ $clothingSize->id }}" class="size-checkbox">
                                        <label for="clothing_{{ $clothingSize->id }}" class="size-label">
                                            <div class="size-value">{{ $clothingSize->size_value }}</div>
                                            <div class="size-gender">{{ $clothingSize->gender->gender_name }}</div>
                                            <div class="size-status available">Available</div>
                                        </label>
                                    </div>
                                @endforeach
                            </div>
                        </div>

                        <!-- 鞋子尺码选择区域 -->
                        <div id="shoeSizeArea" style="display: none;">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">
                                    <i class="bi bi-shoe-prints text-primary me-2"></i>Available Shoe Sizes
                                    <span class="text-muted" id="shoeGenderFilter"></span>
                                </h5>
                                <span class="badge bg-info" id="shoeSelectedCount">0 selected</span>
                            </div>

                            <div class="sizes-grid" id="shoeSizesGrid">
                                @foreach($shoeSizes as $shoeSize)
                                    <div class="size-card" data-gender="{{ $shoeSize->gender_id }}" data-size-id="{{ $shoeSize->id }}">
                                        <input type="checkbox" name="shoe_size_ids[]" value="{{ $shoeSize->id }}"
                                               id="shoe_{{ $shoeSize->id }}" class="size-checkbox">
                                        <label for="shoe_{{ $shoeSize->id }}" class="size-label">
                                            <div class="size-value">{{ $shoeSize->size_value }}</div>
                                            <div class="size-gender">{{ $shoeSize->gender->gender_name }}</div>
                                            <div class="size-status available">Available</div>
                                        </label>
                                    </div>
                                @endforeach
                            </div>
                        </div>

                        <!-- 状态选择 -->
                        <div class="mb-4" id="statusSelection" style="display: none;">
                            <hr class="my-4">
                            <h5 class="mb-3">
                                <i class="bi bi-toggle-on text-primary me-2"></i>Size Type Status
                            </h5>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="card h-100 border status-card selected" data-status="Available">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="size_status" value="Available" class="form-check-input me-3" checked>
                                            <div>
                                                <div class="fw-semibold text-success">
                                                    <i class="bi bi-check-circle-fill me-2"></i>Available
                                                </div>
                                                <small class="text-muted">Size types will be active and usable</small>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card h-100 border status-card" data-status="Unavailable">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="size_status" value="Unavailable" class="form-check-input me-3">
                                            <div>
                                                <div class="fw-semibold text-secondary">
                                                    <i class="bi bi-slash-circle-fill me-2"></i>Unavailable
                                                </div>
                                                <small class="text-muted">Size types will be inactive</small>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 提交按钮 -->
                        <div id="submitSection" style="display: none;">
                            <hr class="my-4">
                            <button type="submit" class="btn btn-primary w-100 btn-lg">
                                <i class="bi bi-stack me-2"></i>Create Size Types
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection

@section("scripts")
<script src="{{ asset('assets/js/size-type-create.js') }}"></script>
@endsection
