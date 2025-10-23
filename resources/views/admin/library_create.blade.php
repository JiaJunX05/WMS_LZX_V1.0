@extends("layouts.app")

@section("title", "Create Size Library")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/variables.css') }}">
<link rel="stylesheet" href="{{ asset('assets/css/dashboard-header.css') }}">

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
                                <i class="bi bi-tag-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Size Library</h2>
                                <p class="dashboard-subtitle mb-0">Add single or multiple size values to a specific category</p>
                            </div>
                        </div>
                    </div>
                    {{-- 操作按钮区域 --}}
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.library.index') }}" class="btn btn-primary">
                            <i class="bi bi-arrow-left me-2"></i>Back to List
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- 提示信息容器 --}}
    <div id="alertContainer" class="mb-4"></div>

    {{-- =============================================================================
         主要表單 (Main Form)
         ============================================================================= --}}
    <form action="{{ route('admin.library.store') }}" method="post" id="sizeLibraryForm">
        @csrf

        <div class="card shadow-sm border-0">
            <div class="row g-0">
                {{-- =============================================================================
                     左側配置區域 (Left Configuration Area)
                     ============================================================================= --}}
                <div class="col-md-4">
                    <div class="config-section d-flex flex-column h-100 bg-light p-4">
                        <div class="mb-4">
                            <h5 class="fw-bold text-dark mb-3">
                                <i class="bi bi-gear me-2"></i>Configuration
                            </h5>

                            {{-- 分類選擇 (Category Selection) --}}
                            <div class="mb-3">
                                <label class="form-label">Category <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-tag text-primary"></i>
                                    </span>
                                    <select class="form-select border-start-0" id="category_id" name="category_id" required>
                                        <option value="">Select category</option>
                                        @foreach($categories as $category)
                                            <option value="{{ $category->id }}">{{ $category->category_name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            {{-- 尺碼值輸入 (Size Value Input) --}}
                            <div class="mb-3">
                                <label class="form-label">Size Value <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-rulers text-primary"></i>
                                    </span>
                                    <input type="text" class="form-control border-start-0" id="size_value" name="size_value"
                                           placeholder="Enter size value (e.g., S, M, L, 8, 9, 10)">
                                </div>
                            </div>

                            {{-- 快速操作按钮 --}}
                            <div class="mb-4">
                                <div class="d-flex gap-2">
                                    <button type="button" class="btn btn-outline-primary flex-fill" id="addClothingSizes">
                                        <i class="bi bi-shirt me-2"></i>Add Clothing Sizes
                                    </button>
                                    <button type="button" class="btn btn-outline-warning flex-fill" id="addShoeSizes">
                                        <i class="bi bi-shoe-prints me-2"></i>Add Shoe Sizes
                                    </button>
                                </div>
                            </div>
                        </div>

                        {{-- 操作按钮区域 --}}
                        <div class="mt-auto">
                            <div class="d-flex gap-2 mb-3">
                                <button type="button" class="btn btn-success flex-fill" id="addSizeValue">
                                    <i class="bi bi-plus-circle me-2"></i>Add To List
                                </button>
                                <button type="button" class="btn btn-outline-danger" id="clearForm">
                                    <i class="bi bi-x-circle me-2"></i>Clear All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- =============================================================================
                     右側尺碼值管理區域 (Right Size Values Management Area)
                     ============================================================================= --}}
                <div class="col-md-8">
                    <div class="size-values-section p-4">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h5 class="fw-bold text-dark mb-1">
                                    <i class="bi bi-rulers me-2"></i>Size Library Management
                                </h5>
                                <p class="text-muted mb-0">Manage and organize your size values below.</p>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="sortSizes" title="Sort sizes">
                                    <i class="bi bi-sort-down" id="sortIcon"></i>
                                </button>
                                <span class="badge bg-primary" id="sizeValuesCount">0 values</span>
                            </div>
                        </div>

                        <!-- 初始提示界面 -->
                        <div class="text-center text-muted py-5" id="initial-message">
                            <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                            <h5 class="text-muted">Ready to Configure Size Library</h5>
                            <p class="text-muted">Select category and enter size value on the left and click "Add To List"</p>
                        </div>

                        <!-- 尺碼值列表區域 -->
                        <div id="sizeValuesArea" class="d-none">
                            <div id="sizeValuesList" class="values-list overflow-auto" style="max-height: 400px;">
                                <!-- 尺碼值列表將在這裡動態生成 -->
                            </div>
                        </div>

                        <!-- 提交按鈕區域 -->
                        <div id="submitSection" class="d-none mt-4">
                            <div class="d-grid">
                                <button type="submit" class="btn btn-success">
                                    <i class="bi bi-stack me-2"></i>Create All Size Libraries
                                </button>
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
<script>
    // JavaScript URL definitions
    window.createLibraryUrl = "{{ route('admin.library.store') }}";
    window.libraryManagementRoute = "{{ route('admin.library.index') }}";
</script>
<script src="{{ asset('assets/js/common/alert-system.js') }}"></script>
<script src="{{ asset('assets/js/library-management.js') }}"></script>
@endsection
