{{-- ==========================================
    仪表板头部组件
    功能：可重用的仪表板页面头部导航
    参数：
    - $icon: 头部图标类名
    - $title: 页面标题
    - $subtitle: 页面副标题
    - $actionButtonText: 操作按钮文本（单个按钮时使用）
    - $actionButtonUrl: 操作按钮链接（单个按钮时使用）
    - $actionButtonIcon: 操作按钮图标（单个按钮时使用）
    - $customButtonHTML: 自定义按钮HTML（多个按钮或复杂按钮时使用）
    ========================================== --}}

@php
    $icon = $icon ?? 'bi bi-info-circle';
    $title = $title ?? 'Dashboard';
    $subtitle = $subtitle ?? 'Manage your data';
    $actionButtonText = $actionButtonText ?? null;
    $actionButtonUrl = $actionButtonUrl ?? '#';
    $actionButtonIcon = $actionButtonIcon ?? 'bi bi-plus-circle-fill';
    $customButtonHTML = $customButtonHTML ?? null;

    // 判断是否显示按钮区域
    $hasButtons = $actionButtonText || $customButtonHTML;
@endphp

<div class="dashboard-header mb-4">
    <div class="card shadow-sm border-0">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="{{ $hasButtons ? 'col-lg-8' : 'col-12' }}">
                    <div class="d-flex align-items-center">
                        <div class="header-icon-wrapper me-4"><i class="{{ $icon }}"></i></div>
                        <div>
                            <h2 class="dashboard-title mb-1">{{ $title }}</h2>
                            <p class="dashboard-subtitle mb-0" id="{{ $subtitleId ?? 'dashboard-subtitle' }}">{{ $subtitle }}</p>
                        </div>
                    </div>
                </div>

                @if($customButtonHTML)
                    {!! $customButtonHTML !!}
                @elseif($actionButtonText)
                <div class="col-lg-4 text-lg-end">
                    <a href="{{ $actionButtonUrl }}" class="btn btn-primary">
                        <i class="{{ $actionButtonIcon }} me-2"></i>{{ $actionButtonText }}
                    </a>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
