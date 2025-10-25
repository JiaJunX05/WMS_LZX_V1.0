{{-- ==========================================
    尺码模板创建表单模板
    功能：专门用于尺码模板的创建，支持选择尺码库
    参数：
        $formAction - 表单提交路由
        $formId - 表单ID
        $categories - 分类数据
        $genders - 性别数据
    ========================================== --}}

<form action="{{ $formAction }}" method="post" id="{{ $formId }}">
    @csrf
    <div class="card shadow-sm border-0">
        <div class="row g-0">
            {{-- ==========================================
                左侧配置区域
                ========================================== --}}
            <div class="col-md-4">
                <div class="config-section d-flex flex-column h-100 bg-light p-4">
                    <div class="mb-4">
                        <h5 class="fw-bold text-dark mb-3">
                            <i class="bi bi-gear me-2"></i>Configuration
                        </h5>

                        {{-- 分类选择 --}}
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

                        {{-- 性别选择 --}}
                        <div class="mb-3">
                            <label class="form-label">Gender <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-white border-end-0">
                                    <i class="bi bi-person text-primary"></i>
                                </span>
                                <select class="form-select border-start-0" id="gender_id" name="gender_id" required>
                                    <option value="">Select gender</option>
                                    @foreach($genders as $gender)
                                        <option value="{{ $gender->id }}">{{ $gender->gender_name }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                    </div>

                    {{-- 操作按钮区域 --}}
                    <div class="mt-auto">
                        <div class="d-flex gap-2 mb-3">
                            <button type="button" class="btn btn-outline-primary flex-fill" id="selectAllBtn">
                                <i class="bi bi-check-all me-2"></i>Select All
                            </button>
                            <button type="button" class="btn btn-outline-danger" id="clearAllBtn">
                                <i class="bi bi-x-circle me-2"></i>Clear All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {{-- ==========================================
                右侧模板管理区域
                ========================================== --}}
            <div class="col-md-8">
                <div class="size-values-section p-4">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h5 class="fw-bold text-dark mb-1">
                                <i class="bi bi-plus-circle me-2"></i>Template Management
                            </h5>
                            <p class="text-muted mb-0">Select size libraries to create templates.</p>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-primary" id="selectionCounter">0 selected</span>
                        </div>
                    </div>

                    {{-- 初始提示信息 --}}
                    <div class="text-center text-muted py-5" id="initial-message">
                        <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                        <h5 class="text-muted">Ready to Configure Templates</h5>
                        <p class="text-muted">Select category and gender on the left to load available size libraries</p>
                    </div>

                    {{-- 尺码库选择区域 --}}
                    <div id="sizeLibrarySelection" class="d-none">
                        <div id="sizeLibraryCardsContainer" class="row g-3 overflow-auto" style="max-height: 400px;">
                            {{-- 尺码库卡片将在这里动态生成 --}}
                        </div>
                    </div>

                    {{-- 提交按钮区域 --}}
                    <div id="submitSection" class="d-none mt-4">
                        <div class="d-grid">
                            <button type="submit" class="btn btn-success">
                                <i class="bi bi-stack me-2"></i>Create All Templates
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
