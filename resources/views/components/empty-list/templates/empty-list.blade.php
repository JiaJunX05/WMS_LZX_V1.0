{{-- ==========================================
    通用空状态组件
    功能：显示空状态提示信息
    参数：
    - $icon: 空状态图标 (e.g., 'bi bi-collection')
    - $title: 空状态标题 (e.g., 'No Data')
    - $description: 空状态描述 (e.g., 'No data has been created yet')
    - $buttonText: 按钮文本 (e.g., 'Create First Item')
    - $buttonUrl: 按钮链接 (e.g., route('admin.item.create'))
    - $buttonIcon: 按钮图标 (e.g., 'bi bi-plus-circle-fill me-2')
    - $buttonSize: 按钮大小 (e.g., 'btn-lg' 或 '')
    ========================================== --}}

@php
    $icon = $icon ?? 'bi bi-collection';
    $title = $title ?? 'No Data';
    $description = $description ?? 'No data has been created yet';
    $buttonText = $buttonText ?? 'Create First Item';
    $buttonUrl = $buttonUrl ?? '#';
    $buttonIcon = $buttonIcon ?? 'bi bi-plus-circle-fill me-2';
    $buttonSize = $buttonSize ?? '';
    $showButton = isset($buttonText) && $buttonText !== null && $buttonText !== '';
@endphp

<div id="empty-state" class="text-center p-5 d-none">
    <div class="mb-4">
        <i class="{{ $icon }} text-muted fs-1"></i>
    </div>
    <h4 class="text-secondary fw-semibold mb-3">{{ $title }}</h4>
    <p class="text-muted small mb-4">{{ $description }}</p>
    @if($showButton)
        <a href="{{ $buttonUrl }}" class="btn btn-primary {{ $buttonSize }}">
            <i class="{{ $buttonIcon }}"></i>{{ $buttonText }}
        </a>
    @endif
</div>
