@extends("layouts.app")

@section("title", "Create Category Mapping")
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
                                <i class="bi bi-diagram-2-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Create Category Mapping</h2>
                                <p class="dashboard-subtitle mb-0">Create relationships between categories and subcategories</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <a href="{{ route('admin.category_mapping.mapping.index') }}" class="btn btn-primary">
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
                            <i class="bi bi-diagram-2 me-2"></i>Mapping Information
                        </h6>
                    </div>
                    <div class="preview-container flex-grow-1 d-flex align-items-center justify-content-center">
                        <div class="text-center">
                            <i class="bi bi-diagram-2-fill text-primary" style="font-size: 8rem;"></i>
                            <p class="text-muted mt-3">Category Mapping Management</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧表单区域 -->
            <div class="col-md-7">
                <div class="card-body p-4">
                    <!-- 表单标题 -->
                    <h2 class="text-primary text-center mb-3">Create Category Mapping</h2>
                    <p class="text-muted text-center">Create relationships between categories and subcategories</p>
                    <hr>

                    <!-- 表单内容 -->
                    <form action="{{ route('admin.category_mapping.mapping.store') }}" method="post">
                        @csrf

                        <div class="mb-4">
                            <label for="category_id" class="form-label fw-bold">Category</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="bi bi-folder text-primary"></i>
                                </span>
                                <select class="form-select border-start-0" id="category_id" name="category_id" required>
                                    <option selected disabled>Select a category</option>
                                    @foreach($categories as $category)
                                        <option value="{{ $category->id }}"
                                                {{ $category->category_status === 'Unavailable' ? 'disabled' : '' }}
                                                data-status="{{ $category->category_status }}">
                                            {{ strtoupper($category->category_name) }}
                                            @if($category->category_status === 'Unavailable')
                                                (Unavailable)
                                            @endif
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="form-text">
                                <i class="bi bi-info-circle me-2"></i>
                                Only available categories can be selected
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="subcategory_id" class="form-label fw-bold">SubCategory</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="bi bi-folder-plus text-primary"></i>
                                </span>
                                <select class="form-select border-start-0" id="subcategory_id" name="subcategory_id" required>
                                    <option selected disabled>Select a subcategory</option>
                                    @foreach($subcategories as $subcategory)
                                        <option value="{{ $subcategory->id }}"
                                                {{ $subcategory->subcategory_status === 'Unavailable' ? 'disabled' : '' }}
                                                data-status="{{ $subcategory->subcategory_status }}">
                                            {{ strtoupper($subcategory->subcategory_name) }}
                                            @if($subcategory->subcategory_status === 'Unavailable')
                                                (Unavailable)
                                            @endif
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="form-text">
                                <i class="bi bi-info-circle me-2"></i>
                                Only available subcategories can be selected
                            </div>
                        </div>

                        <hr class="my-4">
                        <button type="submit" class="btn btn-primary w-100">
                            <i class="bi bi-diagram-2-fill me-2"></i>Create Mapping
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
