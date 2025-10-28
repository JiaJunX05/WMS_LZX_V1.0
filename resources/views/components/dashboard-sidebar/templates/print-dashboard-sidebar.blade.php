{{-- ==========================================
    打印選項側邊欄模板組件
    功能：可重用的打印選項側邊欄模板
    参数：
    - $title: 標題 (默認 "Print Options")
    - $subtitle: 副標題 (默認 "Configure your print settings")
    - $icon: 圖標 (默認 "bi-printer-fill")
    - $printRangeOptions: 打印範圍選項
    - $settings: 打印設置選項
    - $actions: 操作按鈕數組
    ========================================== --}}

@php
    $title = $title ?? 'Print Options';
    $subtitle = $subtitle ?? 'Configure your print settings';
    $icon = $icon ?? 'bi-printer-fill';
    $printRangeOptions = $printRangeOptions ?? [
        ['value' => 'all', 'text' => 'All products'],
        ['value' => 'selected', 'text' => 'Selected products only']
    ];
    $settings = $settings ?? [
        [
            'id' => 'include-barcode',
            'name' => 'Include Barcode',
            'icon' => 'bi-upc-scan',
            'description' => 'Print product barcode on labels',
            'checked' => true
        ],
        [
            'id' => 'include-image',
            'name' => 'Include Product Image',
            'icon' => 'bi-image',
            'description' => 'Print product image on labels',
            'checked' => true
        ]
    ];
    $actions = $actions ?? [
        ['id' => 'generate-pdf', 'text' => 'Generate PDF', 'icon' => 'bi-file-earmark-pdf-fill', 'style' => 'btn-outline-danger'],
        ['id' => 'print-now', 'text' => 'Print Now', 'icon' => 'bi-printer-fill', 'style' => 'btn-primary']
    ];
@endphp

<div class="card shadow-sm border-0 h-100">
    <div class="card-header bg-gradient-primary text-white border-0">
        <div class="d-flex align-items-center">
            <div class="me-3">
                <i class="bi {{ $icon }} fs-4"></i>
            </div>
            <div>
                <h5 class="mb-0 fw-bold">{{ $title }}</h5>
                <small class="opacity-75">{{ $subtitle }}</small>
            </div>
        </div>
    </div>
    <div class="card-body d-flex flex-column p-0">
        {{-- 打印範圍選項 --}}
        <div class="border-bottom">
            <div class="p-3 bg-light d-flex justify-content-between align-items-center">
                <h6 class="mb-0 text-dark fw-semibold">
                    <i class="bi bi-funnel me-2 text-primary"></i>Print Range
                </h6>
            </div>
            <div class="p-3">
                <div class="mb-3">
                    <label class="form-label fw-medium text-muted small">Select Products</label>
                    <select class="form-select" id="print-range">
                        @foreach($printRangeOptions as $option)
                            <option value="{{ $option['value'] }}">{{ $option['text'] }}</option>
                        @endforeach
                    </select>
                </div>

                {{-- 打印設置 --}}
                <div class="mb-3">
                    <label class="form-label fw-bold">Print Settings</label>
                    <div class="row g-2">
                        @foreach($settings as $setting)
                            <div class="col-12">
                                <div class="card h-100 border status-card" data-setting="{{ $setting['id'] }}">
                                    <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                        <input type="checkbox"
                                               id="{{ $setting['id'] }}"
                                               class="form-check-input me-3"
                                               {{ $setting['checked'] ?? false ? 'checked' : '' }}>
                                        <div>
                                            <h6 class="card-title mb-1">
                                                <i class="bi {{ $setting['icon'] }} me-2 text-primary"></i>{{ $setting['name'] }}
                                            </h6>
                                            <p class="card-text text-muted small mb-0">{{ $setting['description'] }}</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>

        {{-- 快捷操作按鈕 --}}
        <div class="mt-auto p-3 bg-light">
            <div class="d-grid gap-2">
                @foreach($actions as $action)
                    <button type="button" class="btn {{ $action['style'] }} w-100" id="{{ $action['id'] }}">
                        <i class="bi {{ $action['icon'] }} me-2"></i>{{ $action['text'] }}
                    </button>
                @endforeach
            </div>
        </div>
    </div>
</div>

