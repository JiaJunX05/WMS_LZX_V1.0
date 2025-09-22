@extends("layouts.app")

@section("title", "Update Size Type")
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
                                <i class="bi bi-pencil-fill"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Update Size Type</h2>
                                <p class="dashboard-subtitle mb-0">Modify existing size type mapping</p>
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

    <!-- 主要内容卡片 -->
    <form action="{{ route('admin.attribute_variant.size_type.update', $sizeType->id) }}" method="post" id="updateForm">
        @csrf
        @method('PUT')
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

                        <!-- 当前信息显示 -->
                        <div class="alert alert-info border-0 mb-4">
                            <div class="d-flex align-items-center mb-2">
                                <i class="bi bi-info-circle-fill me-2"></i>
                                <strong>Current Size Type</strong>
                            </div>
                            <div class="small">
                                <div class="mb-1">
                                    <i class="bi bi-tag me-2 text-muted"></i>
                                    <span>Size: <strong>{{ $sizeType->size_value }}</strong></span>
                                </div>
                                <div class="mb-1">
                                    <i class="bi bi-diagram-3 me-2 text-muted"></i>
                                    <span>Type: <strong>{{ ucfirst($sizeType->type) }}</strong></span>
                                </div>
                                <div>
                                    <i class="bi bi-person me-2 text-muted"></i>
                                    <span>Gender: <strong>{{ $sizeType->gender ? $sizeType->gender->gender_name : 'N/A' }}</strong></span>
                                </div>
                            </div>
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
                                            <option value="{{ $category->id }}" {{ $sizeType->category_id == $category->id ? 'selected' : '' }}>
                                                {{ $category->category_name }}
                                            </option>
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
                                            <option value="{{ $gender->id }}" {{ ($sizeType->gender && $sizeType->gender->id == $gender->id) ? 'selected' : '' }}>
                                                {{ $gender->gender_name }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                                <small class="text-muted">Filter sizes by gender</small>
                            </div>

                            <!-- 尺码类型选择 -->
                            <div class="mb-4">
                                <label for="size_type" class="form-label fw-bold">Size Type <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-diagram-3 text-primary"></i>
                                    </span>
                                    <select class="form-control border-start-0" id="size_type" name="size_type" required>
                                        <option value="">Select Size Type</option>
                                        <option value="clothing" {{ $sizeType->clothing_size_id ? 'selected' : '' }}>
                                            Clothing Sizes
                                        </option>
                                        <option value="shoes" {{ $sizeType->shoe_size_id ? 'selected' : '' }}>
                                            Shoe Sizes
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <!-- 状态选择 -->
                            <div class="mb-4">
                                <label for="size_status" class="form-label fw-bold">Status <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="bi bi-toggle-on text-primary"></i>
                                    </span>
                                    <select class="form-control border-start-0" id="size_status" name="size_status" required>
                                        <option value="Available" {{ $sizeType->size_status === 'Available' ? 'selected' : '' }}>
                                            Available
                                        </option>
                                        <option value="Unavailable" {{ $sizeType->size_status === 'Unavailable' ? 'selected' : '' }}>
                                            Unavailable
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧尺码选择区域 -->
                <div class="col-md-8">
                    <div class="card-body p-4">
                        <!-- 表单标题 -->
                        <h2 class="text-primary text-center mb-3">Size Selection</h2>
                        <p class="text-muted text-center">Select the specific size for this type mapping</p>
                        <hr>

                        <!-- 选择提示 -->
                        <div class="alert alert-warning" id="selectionPrompt" style="display: none;">
                            <i class="bi bi-info-circle me-2"></i>
                            Please select a size type to view available sizes
                        </div>

                        <!-- 衣服尺码选择区域 -->
                        <div id="clothingSizeArea" style="display: {{ $sizeType->clothing_size_id ? 'block' : 'none' }};">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">
                                    <i class="bi bi-person-badge text-primary me-2"></i>Available Clothing Sizes
                                </h5>
                                <span class="badge bg-info" id="clothingSelectedCount">0 selected</span>
                            </div>

                            <div class="sizes-grid" id="clothingSizesGrid">
                                @foreach($clothingSizes as $clothingSize)
                                    <div class="size-card" data-gender="{{ $clothingSize->gender_id }}" data-size-id="{{ $clothingSize->id }}">
                                        <input type="radio" name="clothing_size_id" value="{{ $clothingSize->id }}"
                                               id="clothing_{{ $clothingSize->id }}" class="size-checkbox"
                                               {{ $sizeType->clothing_size_id == $clothingSize->id ? 'checked' : '' }}>
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
                        <div id="shoeSizeArea" style="display: {{ $sizeType->shoe_size_id ? 'block' : 'none' }};">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">
                                    <i class="bi bi-bootstrap text-primary me-2"></i>Available Shoe Sizes
                                </h5>
                                <span class="badge bg-info" id="shoeSelectedCount">0 selected</span>
                            </div>

                            <div class="sizes-grid" id="shoeSizesGrid">
                                @foreach($shoeSizes as $shoeSize)
                                    <div class="size-card" data-gender="{{ $shoeSize->gender_id }}" data-size-id="{{ $shoeSize->id }}">
                                        <input type="radio" name="shoe_size_id" value="{{ $shoeSize->id }}"
                                               id="shoe_{{ $shoeSize->id }}" class="size-checkbox"
                                               {{ $sizeType->shoe_size_id == $shoeSize->id ? 'checked' : '' }}>
                                        <label for="shoe_{{ $shoeSize->id }}" class="size-label">
                                            <div class="size-value">{{ $shoeSize->size_value }}</div>
                                            <div class="size-gender">{{ $shoeSize->gender->gender_name }}</div>
                                            <div class="size-status available">Available</div>
                                        </label>
                                    </div>
                                @endforeach
                            </div>
                        </div>

                        <!-- 提交按钮 -->
                        <div id="submitSection">
                            <hr class="my-4">
                            <button type="submit" class="btn btn-primary w-100 btn-lg">
                                <i class="bi bi-check-circle-fill me-2"></i>Update Size Type
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
<style>
/* 优化尺码卡片设计 */
.sizes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    padding: 0;
}

.size-card {
    position: relative;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    transition: all 0.3s ease;
    background: white;
    overflow: hidden;
    cursor: pointer;
}

.size-card:hover {
    border-color: #0d6efd;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.15);
}

.size-checkbox {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    z-index: 2;
}

.size-label {
    display: block;
    padding: 16px 12px;
    text-align: center;
    cursor: pointer;
    margin: 0;
    height: 100%;
    position: relative;
}

.size-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #495057;
    margin-bottom: 4px;
}

.size-gender {
    font-size: 0.75rem;
    color: #6c757d;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.size-status {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
}

.size-status.available {
    background-color: #d1edff;
    color: #0969da;
}

/* 选中状态样式 - 简单设计 */
.size-checkbox:checked + .size-label {
    background-color: #f8f9fa;
    border-color: #0d6efd;
    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
}

.size-checkbox:checked + .size-label .size-value {
    color: #0d6efd;
}

/* 选中后的简单标记 */
.size-checkbox:checked + .size-label::after {
    content: '✓';
    position: absolute;
    top: 8px;
    right: 8px;
    color: #0d6efd;
    font-size: 16px;
    font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .sizes-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 8px;
    }

    .size-label {
        padding: 12px 8px;
    }

    .size-value {
        font-size: 1.25rem;
    }
}
</style>
<script>
$(document).ready(function() {
    // 配置变化处理
    $('#category_id, #gender_filter, #size_type').on('change', function() {
        updateSizeSelection();
    });

    // 尺码选择变化处理
    $(document).on('change', '.size-checkbox', function() {
        updateSelectedCount();
    });

    function updateSizeSelection() {
        const categoryId = $('#category_id').val();
        const genderFilter = $('#gender_filter').val();
        const sizeType = $('#size_type').val();

        if (!categoryId || !sizeType) {
            $('#selectionPrompt').show();
            $('#clothingSizeArea').hide();
            $('#shoeSizeArea').hide();
            return;
        }

        $('#selectionPrompt').hide();

        if (sizeType === 'clothing') {
            $('#clothingSizeArea').show();
            $('#shoeSizeArea').hide();
            filterSizes('#clothingSizesGrid', genderFilter);
            // 清除鞋子选择
            $('input[name="shoe_size_id"]').prop('checked', false);
        } else if (sizeType === 'shoes') {
            $('#shoeSizeArea').show();
            $('#clothingSizeArea').hide();
            filterSizes('#shoeSizesGrid', genderFilter);
            // 清除衣服选择
            $('input[name="clothing_size_id"]').prop('checked', false);
        }

        updateSelectedCount();
    }

    function filterSizes(gridSelector, genderId) {
        const grid = $(gridSelector);
        const sizeCards = grid.find('.size-card');

        if (genderId) {
            sizeCards.hide();
            sizeCards.filter(`[data-gender="${genderId}"]`).show();
        } else {
            sizeCards.show();
        }

        // 清除隐藏卡片的选择
        sizeCards.filter(':hidden').find('.size-checkbox').prop('checked', false);
    }

    function updateSelectedCount() {
        const clothingSelected = $('#clothingSizeArea .size-checkbox:checked').length;
        const shoeSelected = $('#shoeSizeArea .size-checkbox:checked').length;

        $('#clothingSelectedCount').text(`${clothingSelected} selected`);
        $('#shoeSelectedCount').text(`${shoeSelected} selected`);
    }

    // 表单验证
    $('#updateForm').on('submit', function(e) {
        const categoryId = $('#category_id').val();
        const sizeType = $('#size_type').val();
        const hasClothingSelection = $('input[name="clothing_size_id"]:checked').length > 0;
        const hasShoeSelection = $('input[name="shoe_size_id"]:checked').length > 0;

        if (!categoryId) {
            e.preventDefault();
            alert('Please select a category');
            $('#category_id').focus();
            return false;
        }

        if (!sizeType) {
            e.preventDefault();
            alert('Please select a size type');
            return false;
        }

        if (sizeType === 'clothing' && !hasClothingSelection) {
            e.preventDefault();
            alert('Please select a clothing size');
            return false;
        }

        if (sizeType === 'shoes' && !hasShoeSelection) {
            e.preventDefault();
            alert('Please select a shoe size');
            return false;
        }
    });

    // 初始化
    updateSizeSelection();
    updateSelectedCount();
});
</script>
@endsection
