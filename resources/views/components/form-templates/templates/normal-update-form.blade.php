{{-- ==========================================
    通用更新表单组件
    功能：可重用的更新表单模板
    参数：
    - $formAction: 表单提交地址
    - $formId: 表单ID
    - $entityName: 实体名称（如 Zone, Brand, Category 等）
    - $entityNameLower: 实体名称小写（如 zone, brand, category 等）
    - $entity: 实体对象
    - $fields: 字段配置数组
    - $hasImage: 是否有图片上传功能
    - $hasLocation: 是否有位置字段（仅Zone需要）
    - $hasColorHex: 是否有颜色代码字段（仅Color需要）
    - $hasCapacity: 是否有容量字段（仅Rack需要）
    - $hasColorRgb: 是否有RGB字段（仅Color需要）
    ========================================== --}}

@php
    $formAction = $formAction ?? '#';
    $formId = $formId ?? 'updateEntityForm';
    $entityName = $entityName ?? 'Entity';
    $entityNameLower = $entityNameLower ?? 'entity';
    $entity = $entity ?? null;
    $fields = $fields ?? [];
    $hasImage = $hasImage ?? false;
    $hasLocation = $hasLocation ?? false;
    $hasColorHex = $hasColorHex ?? false;
    $hasCapacity = $hasCapacity ?? false;
    $hasColorRgb = $hasColorRgb ?? false;
@endphp

<form action="{{ $formAction }}" method="post" id="{{ $formId }}" @if($hasImage) enctype="multipart/form-data" @endif>
    @csrf
    @method('PUT')

    <div class="card shadow-sm border-0">
        <div class="row g-0">
            {{-- 左侧配置区域 --}}
            <div class="col-md-4">
                <div class="config-section d-flex flex-column h-100 bg-light p-4">
                    {{-- 配置标题 --}}
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-gear-fill me-2"></i>Configuration
                        </h6>
                        <span class="badge bg-white text-dark border px-3 py-2">Update</span>
                    </div>

                    {{-- 图片上传（如果有） --}}
                    @if($hasImage)
                    <div class="mb-4">
                        <label class="form-label">{{ $entityName }} Image</label>
                        <div class="img-upload-area" id="image-preview">
                            @if($entity->{$entityNameLower . '_image'} && file_exists(public_path('assets/images/' . $entity->{$entityNameLower . '_image'})))
                                {{-- 有现有图片时显示 --}}
                                <div class="upload-placeholder d-none" id="imageUploadContent">
                                    <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                    <h5 class="mt-3">Click to upload image</h5>
                                    <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                </div>
                                <img id="preview-image" class="img-preview" src="{{ asset('assets/images/' . $entity->{$entityNameLower . '_image'}) }}" alt="{{ $entityName }} Preview">
                                <button type="button" class="img-remove-btn" id="removeImage"><i class="bi bi-trash"></i></button>
                            @else
                                {{-- 没有图片时显示上传占位符 --}}
                                <div class="upload-placeholder" id="imageUploadContent">
                                    <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                                    <h5 class="mt-3">Click to upload image</h5>
                                    <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                                </div>
                                <img id="preview-image" class="img-preview d-none" alt="{{ $entityName }} Preview">
                                <button type="button" class="img-remove-btn d-none" id="removeImage"><i class="bi bi-trash"></i></button>
                            @endif
                        </div>
                        <input type="file" class="d-none" id="input_image" name="{{ $entityNameLower }}_image" accept="image/*">
                    </div>
                    @endif

                    {{-- 颜色预览（仅Color需要） --}}
                    @if($hasColorHex)
                    <div class="mb-4">
                        <label class="form-label">Color Preview</label>
                        <div class="rounded-3 border border-3 border-white shadow-sm" id="color-preview"
                            style="background-color: {{ $entity->color_hex }}; width: 100%; height: 80px; transition: all 0.3s ease;">
                        </div>
                    </div>
                    @endif

                    {{-- 当前实体信息显示 --}}
                    <div class="alert alert-info border-0 mb-4">
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi bi-info-circle-fill me-2"></i>
                            <strong>Current {{ $entityName }}</strong>
                        </div>
                        <div class="small">
                            <div class="mb-1">
                                <i class="bi bi-{{ $fields['icon'] ?? 'tag' }} me-2 text-muted"></i>
                                <span>{{ $fields['nameLabel'] ?? 'Name' }}: <strong>{{ $entity->{$fields['nameField'] ?? $entityNameLower . '_name'} }}</strong></span>
                            </div>
                            @if($hasLocation)
                            <div class="mb-1">
                                <i class="bi bi-geo-alt me-2 text-muted"></i>
                                <span>Location: <strong>{{ $entity->location }}</strong></span>
                            </div>
                            @endif
                            @if($hasCapacity)
                            <div class="mb-1">
                                <i class="bi bi-boxes me-2 text-muted"></i>
                                <span>Capacity: <strong>{{ $entity->capacity ?? 50 }}</strong></span>
                            </div>
                            @endif
                            @if($hasColorHex)
                            <div class="mb-1">
                                <i class="bi bi-hash me-2 text-muted"></i>
                                <span>Hex: <strong>{{ $entity->color_hex }}</strong></span>
                            </div>
                            @endif
                            @if($hasColorRgb)
                            <div class="mb-1">
                                <i class="bi bi-circle-fill me-2 text-muted"></i>
                                <span>RGB: <strong>{{ $entity->color_rgb }}</strong></span>
                            </div>
                            @endif
                            <div class="mb-1">
                                <i class="bi bi-shield-check me-2 text-muted"></i>
                                <span>Status: <strong>{{ $entity->{$entityNameLower . '_status'} ?? 'Available' }}</strong></span>
                            </div>
                            <div>
                                <i class="bi bi-calendar me-2 text-muted"></i>
                                <span>Created: <strong>{{ $entity->created_at->format('M d, Y') }}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- 右侧编辑表单区域 --}}
            <div class="col-md-8">
                <div class="size-values-section p-4">
                    {{-- 表单标题 --}}
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h6 class="mb-0 fw-bold">
                                <i class="bi bi-pencil-square me-2"></i>Update {{ $entityName }} Information
                            </h6>
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i>
                                Modify {{ strtolower($entityName) }} configuration below.
                            </small>
                        </div>
                    </div>

                    <div class="card border-0 bg-white shadow-sm">
                        <div class="card-body p-4">

                            {{-- 实体名称字段 --}}
                            <div class="col-12 mb-4">
                                <label class="form-label fw-bold text-dark mb-2">
                                    <i class="bi bi-{{ $fields['icon'] ?? 'tag' }} me-2 text-primary"></i>{{ $fields['nameLabel'] ?? $entityName . ' Name' }}
                                </label>
                                <input type="text" class="form-control" id="{{ $fields['nameField'] ?? $entityNameLower . '_name' }}" name="{{ $fields['nameField'] ?? $entityNameLower . '_name' }}"
                                       value="{{ old($fields['nameField'] ?? $entityNameLower . '_name', $entity->{$fields['nameField'] ?? $entityNameLower . '_name'}) }}"
                                       placeholder="{{ $fields['namePlaceholder'] ?? 'Enter ' . $entityNameLower . ' name' }}" required>
                                <div class="form-text">
                                    <i class="bi bi-info-circle me-1"></i>
                                    {{ $fields['nameHelp'] ?? 'Enter a unique ' . $entityNameLower . ' name' }}
                                </div>
                            </div>

                            {{-- 位置字段（仅Zone需要） --}}
                            @if($hasLocation)
                            <div class="col-12 mb-4">
                                <label class="form-label fw-bold text-dark mb-2">
                                    <i class="bi bi-geo-alt me-2 text-primary"></i>{{ $entityName }} Location
                                </label>
                                <input type="text" class="form-control" id="location" name="location"
                                       value="{{ old('location', $entity->location) }}" placeholder="Enter {{ $entityNameLower }} location" required>
                                <div class="form-text">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Enter the physical location of the {{ $entityNameLower }}
                                </div>
                            </div>
                            @endif

                            {{-- 容量字段（仅Rack需要） --}}
                            @if($hasCapacity)
                            <div class="col-12 mb-4">
                                <label class="form-label fw-bold text-dark mb-2">
                                    <i class="bi bi-boxes me-2 text-primary"></i>{{ $entityName }} Capacity
                                </label>
                                <input type="number" class="form-control" id="capacity" name="capacity"
                                       value="{{ old('capacity', $entity->capacity ?? 50) }}" placeholder="Enter {{ $entityNameLower }} capacity" min="1">
                                <div class="form-text">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Enter the maximum number of items this {{ $entityNameLower }} can hold
                                </div>
                            </div>
                            @endif

                            {{-- 颜色代码字段（仅Color需要） --}}
                            @if($hasColorHex)
                            <div class="col-12 mb-4">
                                <label class="form-label fw-bold text-dark mb-2">
                                    <i class="bi bi-hash me-2 text-primary"></i>Color Hex Code
                                </label>
                                <input type="text" class="form-control" id="color_hex" name="color_hex"
                                       value="{{ old('color_hex', $entity->color_hex) }}" placeholder="Enter hex code (e.g., #FF0000)" required>
                                <div class="form-text">
                                    <i class="bi bi-info-circle me-1"></i>
                                    Enter the color's hex code (e.g., #FF0000 for red)
                                </div>
                            </div>
                            @endif

                            {{-- RGB字段（仅Color需要） --}}
                            @if($hasColorRgb)
                            <div class="col-12 mb-4">
                                <label class="form-label fw-bold text-dark mb-2">
                                    <i class="bi bi-circle-fill me-2 text-primary"></i>Color RGB Code
                                </label>
                                <input type="text" class="form-control bg-light" id="color_rgb" name="color_rgb"
                                       value="{{ old('color_rgb', $entity->color_rgb) }}" readonly>
                                <div class="form-text">
                                    <i class="bi bi-info-circle me-1"></i>
                                    RGB code is automatically generated from hex code
                                </div>
                            </div>
                            @endif

                            {{-- 状态字段 --}}
                            @php
                                $currentStatus = $entity->{$entityNameLower . '_status'} ?? 'Available';
                                $fieldName = $entityNameLower . '_status';
                                $label = $entityName . ' Status';
                                $helpText = $fields['statusHelp'] ?? 'Choose whether the ' . $entityNameLower . ' can be used for management';
                            @endphp
                            @include('components.form-templates.templates.status-selector', [
                                'fieldName' => $fieldName,
                                'currentStatus' => $currentStatus,
                                'label' => $label,
                                'helpText' => $helpText
                            ])

                            {{-- 提交按钮区域 --}}
                            <div class="d-flex gap-3 mt-4">
                                <button type="submit" class="btn btn-warning flex-fill">
                                    <i class="bi bi-pencil-square me-2"></i>Update {{ $entityName }} Information
                                </button>
                                <a href="{{ route('admin.' . $entityNameLower . '.index') }}" class="btn btn-outline-secondary">
                                    <i class="bi bi-x-circle me-2"></i>Cancel
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
