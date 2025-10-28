{{-- ==========================================
    通用更新表单模板
    功能：提供统一的更新表单结构
    参数：
        $formAction - 表单提交路由
        $formId - 表单ID
        $entityName - 实体名称
        $entityNameLower - 实体名称小写
        $entity - 实体对象
        $configFields - 配置字段数组
        $currentInfoTitle - 当前信息标题
        $currentInfoIcon - 当前信息图标
        $updateTitle - 更新区域标题
        $updateIcon - 更新区域图标
        $updateDescription - 更新区域描述
        $cancelRoute - 取消按钮路由
    ========================================== --}}

@php
    $formAction = $formAction ?? '#';
    $formId = $formId ?? 'updateEntityForm';
    $entityName = $entityName ?? 'Entity';
    $entityNameLower = $entityNameLower ?? 'entity';
    $entity = $entity ?? null;
    $configFields = $configFields ?? [];
    $currentInfoTitle = $currentInfoTitle ?? 'Current ' . $entityName;
    $currentInfoIcon = $currentInfoIcon ?? 'bi-info-circle-fill';
    $updateTitle = $updateTitle ?? 'Update ' . $entityName;
    $updateIcon = $updateIcon ?? 'bi-pencil-square';
    $updateDescription = $updateDescription ?? 'Modify ' . strtolower($entityName) . ' configuration below.';
    $cancelRoute = $cancelRoute ?? 'admin.' . $entityNameLower . '.index';
@endphp

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

                {{-- 当前实体信息显示 --}}
                <div class="alert alert-info border-0 mb-4">
                    <div class="d-flex align-items-center mb-2">
                        <i class="{{ $currentInfoIcon }} me-2"></i>
                        <strong>{{ $currentInfoTitle }}</strong>
                    </div>
                    <div class="small">
                        @foreach($configFields as $field)
                            <div class="mb-1">
                                <i class="{{ $field['icon'] }} me-2 text-muted"></i>
                                <span>{{ $field['label'] }}: <strong>{{ $field['value'] ?? 'N/A' }}</strong></span>
                            </div>
                        @endforeach
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
                            <i class="{{ $updateIcon }} me-2"></i>{{ $updateTitle }}
                        </h6>
                        <small class="text-muted">
                            <i class="bi bi-info-circle me-1"></i>{{ $updateDescription }}
                        </small>
                    </div>
                </div>

                {{-- 编辑表单 --}}
                <form action="{{ $formAction }}" method="POST" id="{{ $formId }}">
                    @csrf
                    @method('PUT')

                    <div class="card border-0 bg-white shadow-sm">
                        <div class="card-body p-4">
                            {{-- 动态表单字段 --}}
                            @foreach($formFields as $field)
                                <div class="col-12 mb-4">
                                    <label class="form-label fw-bold text-dark mb-2">
                                        <i class="{{ $field['icon'] }} me-2 text-primary"></i>{{ $field['label'] }}
                                    </label>

                                    @if($field['type'] === 'select')
                                        <select class="form-control" name="{{ $field['name'] }}" id="{{ $field['name'] }}" {{ $field['required'] ?? false ? 'required' : '' }}>
                                            <option value="">{{ $field['placeholder'] ?? 'Select ' . strtolower($field['label']) }}</option>
                                            @foreach($field['options'] as $option)
                                                <option value="{{ $option['value'] }}"
                                                        {{ $option['selected'] ?? false ? 'selected' : '' }}>
                                                    {{ $option['text'] }}
                                                </option>
                                            @endforeach
                                        </select>
                                    @elseif($field['type'] === 'input')
                                        <input type="{{ $field['input_type'] ?? 'text' }}"
                                               class="form-control"
                                               name="{{ $field['name'] }}"
                                               id="{{ $field['name'] }}"
                                               value="{{ $field['value'] ?? '' }}"
                                               placeholder="{{ $field['placeholder'] ?? '' }}"
                                               {{ $field['required'] ?? false ? 'required' : '' }}>
                                    @endif

                                    @if(isset($field['help']))
                                        <div class="form-text">
                                            <i class="bi bi-info-circle me-1"></i>{{ $field['help'] }}
                                        </div>
                                    @endif
                                </div>
                            @endforeach

                            {{-- 状态字段 --}}
                            @if(isset($statusField))
                                @php
                                    $currentStatus = $statusField['currentStatus'] ?? 'Available';
                                    $fieldName = $statusField['name'] ?? $entityNameLower . '_status';
                                    $label = $statusField['label'] ?? $entityName . ' Status';
                                    $helpText = $statusField['help'] ?? null;
                                @endphp
                                @include('components.form-templates.templates.status-selector', [
                                    'fieldName' => $fieldName,
                                    'currentStatus' => $currentStatus,
                                    'label' => $label,
                                    'helpText' => $helpText
                                ])
                            @endif

                            {{-- 提交按钮区域 --}}
                            <div class="d-flex gap-3 mt-4">
                                <button type="submit" class="btn btn-warning flex-fill">
                                    <i class="bi bi-pencil-square me-2"></i>{{ $submitButtonText ?? 'Update ' . $entityName . ' Information' }}
                                </button>
                                <a href="{{ route($cancelRoute) }}" class="btn btn-outline-secondary">
                                    <i class="bi bi-x-circle me-2"></i>Cancel
                                </a>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
