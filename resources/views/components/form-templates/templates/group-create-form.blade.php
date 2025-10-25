{{-- ==========================================
    通用创建表单模板
    功能：提供统一的创建表单结构
    参数：
        $formAction - 表单提交路由
        $formId - 表单ID
        $configFields - 配置字段数组
        $managementTitle - 管理区域标题
        $managementIcon - 管理区域图标
        $initialMessage - 初始提示信息
        $submitButtonText - 提交按钮文本
        $addButtonId - 添加按钮ID
        $clearButtonId - 清除按钮ID
        $valuesAreaId - 值列表区域ID
        $valuesListId - 值列表ID
        $countBadgeId - 计数徽章ID
        $submitSectionId - 提交区域ID
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
                    {{-- 配置标题 --}}
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="bi bi-gear-fill me-2"></i>Configuration
                        </h6>
                        <span class="badge bg-white text-dark border px-3 py-2">Create</span>
                    </div>

                    {{-- 动态配置字段 --}}
                    @foreach($configFields as $field)
                        <div class="mb-4">
                            <label class="form-label">{{ $field['label'] }}
                                @if($field['required'] ?? false)
                                    <span class="text-danger">*</span>
                                @endif
                            </label>
                            <div class="input-group">
                                <span class="input-group-text bg-white border-end-0">
                                    <i class="{{ $field['icon'] }} text-primary"></i>
                                </span>
                                @if($field['type'] === 'select')
                                    <select class="form-select border-start-0"
                                            id="{{ $field['id'] }}"
                                            name="{{ $field['name'] }}"
                                            @if($field['required'] ?? false) required @endif>
                                        <option value="">{{ $field['placeholder'] ?? 'Select ' . strtolower($field['label']) }}</option>
                                        @foreach($field['options'] as $option)
                                            <option value="{{ $option['value'] }}"
                                                    @if(isset($option['disabled']) && $option['disabled']) disabled @endif
                                                    @if(isset($option['data_status'])) data-status="{{ $option['data_status'] }}" @endif>
                                                {{ $option['text'] }}
                                                @if(isset($option['disabled']) && $option['disabled'])
                                                    (Unavailable)
                                                @endif
                                            </option>
                                        @endforeach
                                    </select>
                                @elseif($field['type'] === 'input')
                                    <input type="{{ $field['input_type'] ?? 'text' }}"
                                           class="form-control border-start-0"
                                           id="{{ $field['id'] }}"
                                           name="{{ $field['name'] }}"
                                           placeholder="{{ $field['placeholder'] ?? '' }}"
                                           @if($field['required'] ?? false) required @endif>
                                @endif
                            </div>
                        </div>
                    @endforeach

                    {{-- 快速操作按钮（可选） --}}
                    @if(isset($quickActions) && !empty($quickActions))
                        <div class="mb-4">
                            <div class="d-flex gap-2">
                                @foreach($quickActions as $action)
                                    <button type="button" class="btn {{ $action['class'] }} flex-fill" id="{{ $action['id'] }}">
                                        <i class="{{ $action['icon'] }} me-2"></i>{{ $action['text'] }}
                                    </button>
                                @endforeach
                            </div>
                        </div>
                    @endif

                    {{-- 操作按钮区域 --}}
                    <div class="mt-auto card-footer">
                        <div class="d-flex gap-3">
                            <button type="button" class="btn btn-success flex-fill" id="{{ $addButtonId }}">
                                <i class="bi bi-plus-circle me-2"></i>Add To List
                            </button>
                            <button type="button" class="btn btn-outline-danger" id="{{ $clearButtonId }}">
                                <i class="bi bi-x-circle me-2"></i>Clear All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {{-- ==========================================
                右侧管理区域
                ========================================== --}}
            <div class="col-md-8">
                <div class="size-values-section p-4">
                    {{-- 管理区域标题 --}}
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h6 class="mb-0 fw-bold">
                                <i class="{{ $managementIcon }} me-2"></i>{{ $managementTitle }}
                            </h6>
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i>
                                {{ $managementDescription ?? 'Manage and organize your items below.' }}
                            </small>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            @if(isset($sortButtonId))
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="{{ $sortButtonId }}" title="Sort items">
                                    <i class="bi bi-sort-down" id="sortIcon"></i>
                                </button>
                            @endif
                            <span class="badge bg-primary" id="{{ $countBadgeId }}">0 items</span>
                        </div>
                    </div>

                    {{-- 初始提示信息 --}}
                    <div class="text-center text-muted py-5" id="initial-message">
                        <i class="bi bi-gear-fill fs-1 text-muted mb-3"></i>
                        <h5 class="text-muted">{{ $initialMessage['title'] ?? 'Ready to Configure' }}</h5>
                        <p class="text-muted mb-0">{{ $initialMessage['description'] ?? 'Configure your settings on the left and click "Add To List"' }}</p>
                    </div>

                    {{-- 值列表区域 --}}
                    <div id="{{ $valuesAreaId }}" class="d-none">
                        <div class="values-list overflow-auto" id="{{ $valuesListId }}" style="max-height: 400px;">
                            {{-- 值列表将通过JavaScript动态添加 --}}
                        </div>
                    </div>

                    {{-- 提交按钮区域 --}}
                    <div id="{{ $submitSectionId }}" class="mt-4 d-none">
                        <div class="d-grid">
                            <button type="submit" class="btn btn-success">
                                <i class="bi bi-stack me-2"></i>{{ $submitButtonText }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
