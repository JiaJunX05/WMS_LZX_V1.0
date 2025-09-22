@extends("layouts.app")

@section("title", "Create Shoe Size")
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
                                <h2 class="dashboard-title mb-1">Create Shoe Sizes</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple shoe sizes to categorize and manage products</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.attribute_variant.size_shoes.index') }}" class="btn btn-primary">
                            <i class="bi bi-arrow-left me-2"></i>
                            Back to List
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 主要内容卡片 - 左右布局 -->
    <form action="{{ route('admin.attribute_variant.size_shoes.store') }}" method="post" id="sizesForm">
        @csrf
        <div class="card shadow-sm border-0">
            <div class="row g-0">
                <!-- 左侧配置区域 -->
                <div class="col-md-3">
                    <div class="config-section d-flex flex-column h-100 p-4">
                        <!-- 配置标题 -->
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="mb-0 fw-bold text-primary">
                                <i class="bi bi-gear-fill me-2"></i>Configuration
                            </h6>
                            <span class="badge bg-white text-dark border px-3 py-2">Step 1</span>
                        </div>

                        <!-- 配置内容 -->
                        <div class="config-content flex-grow-1">
                            <!-- 性别选择 -->
                            <div class="mb-4">
                                <label for="gender_id" class="form-label fw-bold">Gender <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-person text-primary"></i>
                                    </span>
                                    <select class="form-control border-start-0" id="gender_id" name="gender_id" required>
                                        <option value="">Select gender</option>
                                        @foreach($genders as $gender)
                                            <option value="{{ $gender->id }}">{{ $gender->gender_name }}</option>
                                        @endforeach
                                    </select>
                                </div>
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
                                            <i class="bi bi-person me-2 text-muted"></i>
                                            <span>Gender: <strong id="selectedGender">None</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 快速操作 -->
                            <div class="quick-actions mt-auto">
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-outline-primary" id="addCommonShoeSizes">
                                        <i class="bi bi-lightning-fill me-2"></i>Add Common Sizes
                                    </button>
                                    <button type="button" class="btn btn-outline-success" id="addSizeRow">
                                        <i class="bi bi-plus-circle me-2"></i>Add Size Row
                                    </button>
                                    <button type="button" class="btn btn-outline-warning" id="clearAllSizes">
                                        <i class="bi bi-trash me-2"></i>Clear All
                                    </button>
                                    <hr class="my-3">
                                    <!-- 主要提交按钮 -->
                                    <button type="submit" class="btn btn-primary w-100 btn-lg">
                                        <i class="bi bi-plus-circle-fill me-2"></i>Create Shoe Sizes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧表单区域 -->
                <div class="col-md-9">
                    <div class="sizes-section p-4">
                        <!-- 初始提示信息 -->
                        <div id="initial-message" class="text-center py-5">
                            <i class="bi bi-shoe-prints text-muted" style="font-size: 4rem;"></i>
                            <h5 class="text-muted mt-3">Select Gender to Start</h5>
                            <p class="text-muted">Choose a gender from the left panel to begin adding shoe sizes</p>
                        </div>

                        <!-- 尺寸表格容器 -->
                        <div id="sizes-table-container" style="display: none;">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h6 class="mb-0 fw-bold text-primary">
                                    <i class="bi bi-table me-2"></i>Size Details
                                </h6>
                                <span class="badge bg-primary px-3 py-2">
                                    <i class="bi bi-list-ol me-1"></i>
                                    <span id="rowCount">1</span> size(s)
                                </span>
                            </div>

                            <div class="table-responsive">
                                <table class="table table-hover align-middle" id="sizesTable">
                                    <thead class="table-primary">
                                        <tr>
                                            <th width="30%">Size Value <span class="text-danger">*</span></th>
                                            <th width="35%">Measurements</th>
                                            <th width="20%">Status</th>
                                            <th width="15%" class="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="size-row">
                                            <td class="px-3 py-3 align-middle">
                                                <div class="input-wrapper-compact">
                                                    <input type="text" class="form-input-compact" name="sizes[0][size_value]"
                                                           placeholder="36, 37, 38, 39, 40" required>
                                                    <div class="input-icon-compact">
                                                        <i class="bi bi-bootstrap"></i>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-3 py-3 align-middle">
                                                <div class="input-wrapper-compact">
                                                    <textarea class="form-textarea-compact" name="sizes[0][measurements]"
                                                              placeholder="Length: 25cm, Width: 9cm" rows="2"></textarea>
                                                    <div class="input-icon-compact">
                                                        <i class="bi bi-rulers"></i>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-3 py-3 align-middle">
                                                <select class="form-select-compact" name="sizes[0][size_status]">
                                                    <option value="Available" selected>Available</option>
                                                    <option value="Unavailable">Unavailable</option>
                                                </select>
                                            </td>
                                            <td class="px-3 py-3 align-middle text-center">
                                                <button type="button" class="btn btn-danger btn-sm" onclick="removeRowGlobal(this)" disabled>
                                                    <i class="bi bi-trash me-1"></i>
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </form>
</div>
@endsection

@section("scripts")
    <script src="{{ asset('assets/js/size-shoes-create.js') }}"></script>
@endsection
