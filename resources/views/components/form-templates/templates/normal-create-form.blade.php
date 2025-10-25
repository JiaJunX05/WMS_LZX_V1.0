{{-- ==========================================
    通用创建表单组件
    功能：可重用的创建表单模板
    参数：
    - $formAction: 表单提交地址
    - $formId: 表单ID
    - $entityName: 实体名称（如 Zone, Brand, Category 等）
    - $entityNameLower: 实体名称小写（如 zone, brand, category 等）
    - $fields: 字段配置数组
    - $hasImage: 是否有图片上传功能
    - $hasLocation: 是否有位置字段（仅Zone需要）
    - $hasColorHex: 是否有颜色代码字段（仅Color需要）
    ========================================== --}}

@php
    $formAction = $formAction ?? '#';
    $formId = $formId ?? 'entityForm';
    $entityName = $entityName ?? 'Entity';
    $entityNameLower = $entityNameLower ?? 'entity';
    $fields = $fields ?? [];
    $hasImage = $hasImage ?? false;
    $hasLocation = $hasLocation ?? false;
    $hasColorHex = $hasColorHex ?? false;
@endphp

<form action="{{ $formAction }}" method="post" id="{{ $formId }}" @if($hasImage) enctype="multipart/form-data" @endif>
    @csrf

    <div class="card shadow-sm border-0">
        <div class="row g-0">
            {{-- ==========================================
                左侧配置区域
                ========================================== --}}
            <div class="col-md-4">
                <div class="config-section d-flex flex-column h-100 bg-light p-4">
                    {{-- 配置标题 --}}
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-gear-fill me-2"></i>Configuration
                        </h6>
                        <span class="badge bg-white text-dark border px-3 py-2">Create</span>
                    </div>

                    {{-- 实体名称输入 --}}
                    <div class="mb-4">
                        <label class="form-label">{{ $fields['nameLabel'] ?? $entityName . ' Name' }} <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="{{ $fields['nameField'] ?? $entityNameLower . '_name' }}" id="{{ $fields['nameField'] ?? $entityNameLower . '_name' }}" placeholder="{{ $fields['namePlaceholder'] ?? 'Enter ' . $entityNameLower . ' name' }}">
                    </div>

                    {{-- 额外字段（如rack的capacity） --}}
                    @if(isset($fields['extraFields']))
                        @foreach($fields['extraFields'] as $field)
                        <div class="mb-4">
                            <label class="form-label">{{ $field['label'] }} @if($field['required'] ?? false)<span class="text-danger">*</span>@endif</label>
                            <input type="{{ $field['type'] ?? 'text' }}" class="form-control" name="{{ $field['name'] }}" id="{{ $field['name'] }}" placeholder="{{ $field['placeholder'] ?? '' }}">
                        </div>
                        @endforeach
                    @endif

                    {{-- 位置字段（仅Zone需要） --}}
                    @if($hasLocation)
                    <div class="mb-4">
                        <label class="form-label">{{ $entityName }} Location <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="location" id="location" placeholder="Enter {{ $entityNameLower }} location">
                    </div>
                    @endif

                    {{-- 颜色代码字段（仅Color需要） --}}
                    @if($hasColorHex)
                    <div class="mb-4">
                        <label class="form-label">Color Hex Code</label>
                        <input type="text" class="form-control" name="color_hex" id="color_hex" placeholder="Enter hex code (e.g., #FF0000)">
                        <small class="text-muted">Enter the color's hex code (e.g., #FF0000 for red)</small>
                        {{-- 颜色预览区域 --}}
                        <div class="mt-3">
                            <div class="rounded-3 border border-3 border-white shadow-sm" id="color-preview"
                                style="background-color: #f3f4f6; width: 100%; height: 64px; transition: all 0.3s ease;">
                            </div>
                        </div>
                    </div>
                    @endif

                    {{-- 图片上传（如果有） --}}
                    @if($hasImage)
                    <div class="mb-4">
                        <label class="form-label">{{ $entityName }} Image</label>
                        <div class="img-upload-area" id="imageUploadArea">
                            <div class="img-upload-content" id="imageUploadContent">
                                <i class="bi bi-cloud-upload fs-1 text-muted mb-3" id="preview-icon"></i>
                                <h6 class="text-muted">Click to upload image</h6>
                                <p class="text-muted small">Supports JPG, PNG, GIF formats</p>
                            </div>
                            <img id="img-preview" class="img-preview d-none" alt="{{ $entityName }} preview">
                        </div>
                        <input type="file" class="d-none" id="{{ $entityNameLower }}_image" name="{{ $entityNameLower }}_image" accept="image/*">
                    </div>
                    @endif

                    {{-- 操作按钮区域 --}}
                    <div class="mt-auto card-footer">
                        <div class="d-flex gap-3">
                            <button type="button" class="btn btn-success flex-fill" id="add{{ $entityName }}">
                                <i class="bi bi-plus-circle me-2"></i>Add To List
                            </button>
                            <button type="button" class="btn btn-outline-danger" id="clearForm">
                                <i class="bi bi-x-circle me-2"></i>Clear All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {{-- ==========================================
                右侧实体管理区域
                ========================================== --}}
            <div class="col-md-8">
                <div class="size-values-section p-4">
                    {{-- 管理区域标题 --}}
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h6 class="mb-0 fw-bold">
                                <i class="bi bi-{{ $fields['icon'] ?? 'gear' }} me-2"></i>{{ $entityName }} Management
                            </h6>
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i>
                                Manage and organize your {{ strtolower($entityName) }}s below.
                            </small>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="sort{{ $entityName }}s" title="Sort {{ strtolower($entityName) }}s">
                                <i class="bi bi-sort-down" id="sortIcon"></i>
                            </button>
                            <span class="badge bg-primary" id="{{ $entityNameLower }}ValuesCount">0 {{ strtolower($entityName) }}s</span>
                        </div>
                    </div>

                    {{-- 初始提示信息 --}}
                    <div class="text-center text-muted py-5" id="initial-message">
                        <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                        <h5 class="text-muted">Ready to Configure {{ $entityName }}s</h5>
                        <p class="text-muted mb-0">Fill in the {{ $entityNameLower }} details on the left and click "Add To List"</p>
                    </div>

                    {{-- 实体列表区域 --}}
                    <div id="{{ $entityNameLower }}ValuesArea" class="d-none">
                        <div class="values-list overflow-auto" id="{{ $entityNameLower }}ValuesList" style="max-height: 400px;">
                            {{-- 实体将通过JavaScript动态添加 --}}
                        </div>
                    </div>

                    {{-- 提交按钮区域 --}}
                    <div id="submitSection" class="mt-4 d-none">
                        <div class="d-grid">
                            <button type="submit" class="btn btn-success">
                                <i class="bi bi-stack me-2"></i>Create All {{ $entityName }}s
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
