<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Labels - WMS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="{{ asset('assets/css/print-labels.css') }}" rel="stylesheet">
</head>
<body>
    {{-- 打印头部 --}}
    <div class="container-fluid py-3 border-bottom mb-3">
        <div class="row align-items-center">
            <div class="col">
                <p class="mb-0 fw-bold">WMS_LZX_V1.0</p>
            </div>
            <div class="col-auto">
                <small class="text-muted font-monospace">{{ date('m/d/y') }}, {{ date('h:i A') }}</small>
            </div>
        </div>
    </div>

    {{-- 表格容器 --}}
    <div class="container-fluid">
        <table class="table table-bordered table-striped table-hover" style="border-collapse: collapse; width: 100%; border: 2px solid #000;">
            <thead class="table-dark">
                <tr>
                    <th class="text-center" style="width: 120px; border: 1px solid #000; padding: 8px;">Image</th>
                    <th class="text-center" style="border: 1px solid #000; padding: 8px;">Product Name</th>
                    @if($includeBarcode ?? false)
                        <th class="text-center" style="width: 120px; border: 1px solid #000; padding: 8px;">Barcode</th>
                    @endif
                </tr>
            </thead>
            <tbody>
                @foreach($products as $product)
                    <tr>
                        <td class="text-center" style="border: 1px solid #000; padding: 8px;">
                            @if(($includeImage ?? false) && isset($product['cover_image']) && $product['cover_image'])
                                <img src="{{ asset('assets/images/' . $product['cover_image']) }}"
                                     class="img-thumbnail"
                                     style="width: 100px; height: 100px; object-fit: cover;"
                                     alt="{{ $product['name'] ?? 'No Name' }}">
                            @else
                                <div class="bg-light border rounded d-flex align-items-center justify-content-center" style="width: 100px; height: 100px;">
                                    <i class="bi bi-image text-muted fs-1"></i>
                                </div>
                            @endif
                        </td>
                        <td class="text-center align-middle" style="border: 1px solid #000; padding: 8px;">
                            <div class="fw-medium">{{ $product['name'] ?? 'No Name' }}</div>
                        </td>
                        @if($includeBarcode ?? false)
                            @if(isset($product['barcode']) && $product['barcode'])
                                <td class="text-center align-middle" style="border: 1px solid #000; padding: 8px;">
                                    <div class="d-flex flex-column align-items-center">
                                        <canvas class="border rounded"
                                                data-barcode="{{ $product['barcode']['barcode_number'] ?? '' }}"
                                                style="width: 100px; height: 25px;"></canvas>
                                        <small class="text-muted font-monospace mt-1">{{ $product['barcode']['barcode_number'] ?? '' }}</small>
                                    </div>
                                </td>
                            @endif
                        @endif
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.12.1/dist/JsBarcode.all.min.js"></script>
    <script>
        // 生成条形码
        document.addEventListener('DOMContentLoaded', function() {
            const canvases = document.querySelectorAll('canvas[data-barcode]');
            canvases.forEach(canvas => {
                const barcodeNumber = canvas.getAttribute('data-barcode');
                if (barcodeNumber && typeof JsBarcode !== 'undefined') {
                    JsBarcode(canvas, barcodeNumber, {
                        format: "CODE128",
                        width: 1.5,
                        height: 30,
                        displayValue: false,
                        background: "#ffffff",
                        lineColor: "#000000",
                        margin: 5
                    });
                }
            });
        });
    </script>
</body>
</html>

