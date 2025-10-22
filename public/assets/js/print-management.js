/**
 * Print Management JavaScript 統一管理文件
 * 整合所有打印管理相關功能
 *
 * 功能模塊：
 * - Print Dashboard: 產品列表展示、搜索、篩選、分頁
 * - Product Selection: 產品選擇、全選功能
 * - Print Settings: 打印設置（條形碼、圖片）
 * - PDF Generation: PDF生成和打印
 * - Barcode Generation: 條形碼生成
 *
 * @author WMS Team
 * @version 1.0.0
 */

// =============================================================================
// 全局變量 (Global Variables)
// =============================================================================

// 頁面狀態
let currentPage = 1;
let totalPages = 1;
let totalItems = 0;

// DOM 元素
let $previewGrid, $pagination, $prevPage, $nextPage;
let $showingStart, $showingEnd, $totalCount;
let printIndexUrl;

// =============================================================================
// Print Dashboard 類 (Print Dashboard Class)
// =============================================================================

class PrintDashboard {
    constructor() {
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.initElements();
        this.bindEvents();
        this.loadProducts();
        this.initPrintSettings();
        this.waitForJsBarcode();
    }

    /**
     * 初始化DOM元素
     */
    initElements() {
        $previewGrid = $('#preview-grid');
        $pagination = $('#pagination');
        $prevPage = $('#prev-page');
        $nextPage = $('#next-page');
        $showingStart = $('#showing-start');
        $showingEnd = $('#showing-end');
        $totalCount = $('#total-count');
        printIndexUrl = $previewGrid.data('url') || '/print';
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 分頁事件
        this.bindPaginationEvents();

        // 選擇事件
        this.bindSelectionEvents();

        // 打印設置事件
        this.bindPrintSettingsEvents();

        // 按鈕事件
        this.bindButtonEvents();
    }

    /**
     * 綁定分頁事件
     */
    bindPaginationEvents() {
        // 分頁點擊
        $pagination.on('click', '.pagination-btn', (e) => {
            e.preventDefault();
            this.loadProducts($(e.target).data('page'));
        });

        // 上一頁
        $prevPage.on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.target).parent().hasClass('disabled')) {
                const currentPageNum = parseInt($('.page-item.active .page-link').data('page'));
                this.loadProducts(currentPageNum - 1);
            }
        });

        // 下一頁
        $nextPage.on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.target).parent().hasClass('disabled')) {
                const currentPageNum = parseInt($('.page-item.active .page-link').data('page'));
                this.loadProducts(currentPageNum + 1);
            }
        });
    }

    /**
     * 綁定選擇事件
     */
    bindSelectionEvents() {
        // 單個選擇框變化
        $(document).on('change', '.product-select', (e) => {
            console.log('Checkbox changed:', $(e.target).val(), $(e.target).prop('checked'));
            this.updateSelectAllState();
        });

        // 全選/取消全選
        $('#select-all').on('change', (e) => {
            const isChecked = $(e.target).prop('checked');
            $('.product-select').prop('checked', isChecked);
            this.updateSelectAllState();
        });
    }

    /**
     * 綁定打印設置事件
     */
    bindPrintSettingsEvents() {
        $('#include-barcode, #include-image').on('change', (e) => {
            const $card = $(e.target).closest('.status-card');
            if ($(e.target).is(':checked')) {
                $card.addClass('selected');
            } else {
                $card.removeClass('selected');
            }
        });
    }

    /**
     * 綁定按鈕事件
     */
    bindButtonEvents() {
        // 打印按鈕
        $('#print-now').on('click', (e) => {
            e.preventDefault();
            this.handlePrint();
        });

        // PDF生成按鈕
        $('#generate-pdf').on('click', (e) => {
            e.preventDefault();
            this.handleGeneratePDF();
        });

        // 刷新按鈕
        $('#refresh-products').on('click', (e) => {
            e.preventDefault();
            this.loadProducts(currentPage);
        });

        // 全選按鈕
        $('#select-all-products').on('click', (e) => {
            e.preventDefault();
            const isAllSelected = $('.product-select:checked').length === $('.product-select').length;
            $('.product-select').prop('checked', !isAllSelected);
            this.updateSelectAllState();
        });
    }

    /**
     * 加載產品列表
     */
    loadProducts(page = 1) {
        $.get(printIndexUrl, {
            page,
            perPage: 12,
            ajax: true
        }, (response) => {
            if (response.data.length > 0) {
                this.renderProducts(response.data);
                this.updatePaginationInfo(response);
                this.generatePagination(response);
            } else {
                this.showNoResults();
            }
        });
    }

    /**
     * 渲染產品列表
     */
    renderProducts(products) {
        if (!products || products.length === 0) {
            $("#no-results").show();
            $previewGrid.hide();
            return;
        }

        $("#no-results").hide();
        $previewGrid.show().html(products.map(product => `
            <div class="col-sm-12 col-xl-6 mb-3">
                <div class="product-card h-100">
                    <!-- 主要内容区域 -->
                    <div class="d-flex gap-3">
                        <!-- 左侧: 选择框 -->
                        <div class="d-flex align-items-start pt-2">
                            <div class="form-check">
                                <input class="form-check-input product-select" type="checkbox" value="${product.id}">
                            </div>
                        </div>

                        <!-- 中间: 产品图片 -->
                        <div class="product-image-container">
                            ${product.cover_image ? `
                                <img src="${assetPath}assets/images/products/${product.cover_image}"
                                    alt="product-${product.name}">
                            ` : `
                                <i class="bi bi-image text-muted fs-2"></i>
                            `}
                        </div>

                        <!-- 右侧: 产品信息和条形码 -->
                        <div class="flex-grow-1">
                            <!-- 产品名称 -->
                            <div class="product-name">
                                ${product.name || 'No Name'}
                            </div>

                            <!-- 条形码区域 -->
                            ${product.barcode ? `
                                <div class="barcode-container">
                                    <canvas class="barcode-canvas"
                                            data-barcode="${product.barcode.barcode_number}"
                                            style="height: 50px; width: 200px;"></canvas>
                                    <div class="barcode-number">
                                        ${product.barcode.barcode_number}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join(''));

        // 更新全选框状态
        this.updateSelectAllState();

        // 生成条形码
        setTimeout(() => {
            if (typeof JsBarcode !== 'undefined') {
                this.generateAllBarcodes();
            }
        }, 100);
    }

    /**
     * 更新全選狀態
     */
    updateSelectAllState() {
        const totalProducts = $('.product-select').length;
        const checkedProducts = $('.product-select:checked').length;

        // 更新选中计数
        $('#selected-count').text(checkedProducts);

        // 更新产品卡片选中状态
        $('.product-card').removeClass('selected');
        $('.product-select:checked').closest('.product-card').addClass('selected');

        // 更新全选框状态
        if (checkedProducts === 0) {
            $('#select-all').prop('indeterminate', false).prop('checked', false);
        } else if (checkedProducts === totalProducts) {
            $('#select-all').prop('indeterminate', false).prop('checked', true);
        } else {
            $('#select-all').prop('indeterminate', true);
        }
    }

    /**
     * 更新分頁信息
     */
    updatePaginationInfo(response) {
        const start = (response.current_page - 1) * response.per_page + 1;
        const end = Math.min(start + response.per_page - 1, response.total);

        $showingStart.text(response.total > 0 ? start : 0);
        $showingEnd.text(end);
        $totalCount.text(response.total);
    }

    /**
     * 顯示無結果信息
     */
    showNoResults() {
        $previewGrid.hide();
        $("#no-results").show();
    }

    /**
     * 生成分頁
     */
    generatePagination(data) {
        $("#pagination li:not(#prev-page):not(#next-page)").remove();

        let paginationHTML = '';
        $prevPage.toggleClass('disabled', data.current_page === 1);

        if (data.last_page > 7) {
            for (let i = 1; i <= data.last_page; i++) {
                if (i === 1 || i === data.last_page ||
                    (i >= data.current_page - 1 && i <= data.current_page + 1)) {
                    paginationHTML += `
                        <li class="page-item ${i === data.current_page ? 'active' : ''}">
                            <a class="page-link pagination-btn" href="#" data-page="${i}">${i}</a>
                        </li>`;
                } else if (i === data.current_page - 2 || i === data.current_page + 2) {
                    paginationHTML += `
                        <li class="page-item disabled">
                            <span class="page-link">...</span>
                        </li>`;
                }
            }
        } else {
            for (let i = 1; i <= data.last_page; i++) {
                paginationHTML += `
                    <li class="page-item ${i === data.current_page ? 'active' : ''}">
                        <a class="page-link pagination-btn" href="#" data-page="${i}">${i}</a>
                    </li>`;
            }
        }

        $prevPage.after(paginationHTML);
        $nextPage.toggleClass('disabled', data.current_page === data.last_page);
    }

    /**
     * 處理打印
     */
    handlePrint() {
        const selectedProducts = this.getSelectedProducts();

        if (selectedProducts.length === 0) {
            alert('Please select at least one product to print');
            return;
        }

        // 显示加载状态
        const $printBtn = $('#print-now');
        const originalText = $printBtn.html();
        $printBtn.html('<i class="bi bi-hourglass-split me-2"></i>Preparing Print...').prop('disabled', true);

        // 直接打印
        this.printPreviewWithLaravel(selectedProducts);

        // 恢复按钮状态
        setTimeout(() => {
            $printBtn.html(originalText).prop('disabled', false);
        }, 2000);
    }

    /**
     * 處理PDF生成
     */
    handleGeneratePDF() {
        const selectedProducts = this.getSelectedProducts();

        if (selectedProducts.length === 0) {
            alert('Please select at least one product to generate PDF');
            return;
        }

        // 显示加载状态
        const $pdfBtn = $('#generate-pdf');
        const originalText = $pdfBtn.html();
        $pdfBtn.html('<i class="bi bi-hourglass-split me-2"></i>Generating PDF...').prop('disabled', true);

        // 生成PDF
        this.generatePDFWithLaravel(selectedProducts);

        // 恢复按钮状态
        setTimeout(() => {
            $pdfBtn.html(originalText).prop('disabled', false);
        }, 2000);
    }

    /**
     * 獲取選中的產品ID
     */
    getSelectedProducts() {
        return $('.product-select:checked').map(function() {
            return $(this).val();
        }).get();
    }

    /**
     * 初始化打印設置狀態
     */
    initPrintSettings() {
        $('#include-barcode, #include-image').each(function() {
            const $card = $(this).closest('.status-card');
            if ($(this).is(':checked')) {
                $card.addClass('selected');
            }
        });
    }

    /**
     * 等待 JsBarcode 庫加載完成
     */
    waitForJsBarcode() {
        let attempts = 0;
        const maxAttempts = 50; // 最多等待5秒 (50 * 100ms)

        const checkJsBarcode = () => {
            attempts++;
            console.log(`Checking JsBarcode library (attempt ${attempts}/${maxAttempts})...`);

            if (typeof JsBarcode !== 'undefined') {
                console.log('JsBarcode library loaded successfully!');
                this.generateAllBarcodes();
            } else if (attempts < maxAttempts) {
                console.log('JsBarcode not ready, retrying in 100ms...');
                setTimeout(checkJsBarcode, 100);
            } else {
                console.error('JsBarcode library failed to load after maximum attempts');
            }
        };

        checkJsBarcode();
    }

    /**
     * 生成所有條形碼
     */
    generateAllBarcodes() {
        const barcodeCanvases = document.querySelectorAll('.barcode-canvas');
        console.log(`Found ${barcodeCanvases.length} barcode canvases`);

        barcodeCanvases.forEach((canvas, index) => {
            const barcodeNumber = canvas.getAttribute('data-barcode');
            console.log(`Generating barcode ${index + 1}: ${barcodeNumber}`);

            if (barcodeNumber) {
                try {
                    JsBarcode(canvas, barcodeNumber, {
                        format: "CODE128",
                        width: 2,
                        height: 50,
                        displayValue: false,
                        background: "#ffffff",
                        lineColor: "#000000",
                        margin: 10
                    });
                    console.log(`Barcode ${index + 1} generated successfully`);
                } catch (error) {
                    console.error(`Error generating barcode ${index + 1}:`, error);
                }
            }
        });
    }
}

// =============================================================================
// PDF 和打印功能 (PDF and Print Functions)
// =============================================================================

class PrintService {
    /**
     * 生成PDF - 使用JavaScript生成HTML并直接打印
     */
    static generatePDFWithLaravel(selectedProducts) {
        const includeBarcode = $('#include-barcode').is(':checked');
        const includeImage = $('#include-image').is(':checked');

        // 构建请求数据
        const requestData = {
            products: selectedProducts,
            include_barcode: includeBarcode,
            include_image: includeImage,
            _token: $('meta[name="csrf-token"]').attr('content')
        };

        // 发送POST请求到Laravel后端获取产品数据
        fetch('/superadmin/print/get-products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 使用JS模板生成PDF内容
                const content = this.createPDFContent(data.products, data.includeBarcode, data.includeImage);
                // 直接打印
                this.printAsPDF(content);
            } else {
                throw new Error(data.error || 'Failed to generate PDF');
            }
        })
        .catch(error => {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        });
    }

    /**
     * 直接打印 - 使用JavaScript生成HTML并直接打印
     */
    static printPreviewWithLaravel(selectedProducts) {
        const includeBarcode = $('#include-barcode').is(':checked');
        const includeImage = $('#include-image').is(':checked');

        // 构建请求数据
        const requestData = {
            products: selectedProducts,
            include_barcode: includeBarcode,
            include_image: includeImage,
            _token: $('meta[name="csrf-token"]').attr('content')
        };

        // 发送POST请求到Laravel后端获取产品数据
        fetch('/superadmin/print/get-products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 使用JS模板生成PDF内容
                const content = this.createPDFContent(data.products, data.includeBarcode, data.includeImage);
                // 直接打印
                this.printAsPDF(content);
            } else {
                throw new Error(data.error || 'Failed to generate print preview');
            }
        })
        .catch(error => {
            console.error('Error generating print preview:', error);
            alert('Failed to generate print preview. Please try again.');
        });
    }

    /**
     * 创建PDF内容 - 生成完整的HTML文档
     */
    static createPDFContent(products, includeBarcode, includeImage) {
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Product Labels</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @media print {
                        @page {
                            margin: 0.5cm;
                            size: A4;
                        }
                        body {
                            background: white;
                            padding: 0;
                            margin: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <!-- 打印头部 -->
                <div class="container-fluid py-3 border-bottom mb-3">
                    <div class="row align-items-center">
                        <div class="col">
                            <p class="mb-0 fw-bold">WMS_LZX_V1.0</p>
                        </div>
                        <div class="col-auto">
                            <small class="text-muted font-monospace">${new Date().toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: '2-digit'})}, ${new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true})}</small>
                        </div>
                    </div>
                </div>

                <!-- 表格容器 -->
                <div class="container-fluid">
                    <table class="table table-bordered table-striped table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th class="text-center" style="width: 120px;">Image</th>
                                <th class="text-center">Product Name</th>
                                ${includeBarcode ? '<th class="text-center" style="width: 120px;">Barcode</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
        `;

        products.forEach(product => {
            const productName = product.name || 'No Name';
            const productImage = product.cover_image ? `${assetPath}assets/images/products/${product.cover_image}` : '';
            const barcodeNumber = product.barcode ? product.barcode.barcode_number : '';

            html += `
                <tr>
                    <td class="text-center">
                        ${includeImage && productImage ? `
                            <img src="${productImage}" class="img-thumbnail" style="width: 100px; height: 100px; object-fit: cover;" alt="${productName}">
                        ` : `
                            <div class="bg-light border rounded d-flex align-items-center justify-content-center" style="width: 100px; height: 100px;">
                                <i class="bi bi-image text-muted fs-1"></i>
                            </div>
                        `}
                    </td>
                    <td class="text-center align-middle">
                        <div class="fw-medium">${productName}</div>
                    </td>
                    ${includeBarcode && barcodeNumber ? `
                        <td class="text-center align-middle">
                            <div class="d-flex flex-column align-items-center">
                                <canvas class="border rounded" data-barcode="${barcodeNumber}" style="width: 100px; height: 25px;"></canvas>
                                <small class="text-muted font-monospace mt-1">${barcodeNumber}</small>
                            </div>
                        </td>
                    ` : ''}
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
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
        `;

        return html;
    }

    /**
     * 直接打印 - 使用隐藏iframe触发浏览器打印对话框
     */
    static printAsPDF(content) {
        // 创建一个隐藏的iframe来生成打印内容
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';

        document.body.appendChild(iframe);

        // 写入内容到iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(content);
        iframeDoc.close();

        // 等待内容加载完成后直接打印
        iframe.onload = function() {
            setTimeout(() => {
                // 尝试禁用浏览器的页眉页脚
                try {
                    iframe.contentWindow.print();
                } catch (e) {
                    console.log('Print function called');
                }

                // 打印完成后移除iframe
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                }, 1000);
            }, 500);
        };
    }
}

// =============================================================================
// 頁面初始化 (Page Initialization)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Print Management JS loaded successfully!');

    try {
        // 初始化打印儀表板
        window.printDashboard = new PrintDashboard();

        // 將打印服務方法添加到儀表板實例
        window.printDashboard.generatePDFWithLaravel = PrintService.generatePDFWithLaravel.bind(PrintService);
        window.printDashboard.printPreviewWithLaravel = PrintService.printPreviewWithLaravel.bind(PrintService);

    } catch (error) {
        console.error('Error during Print Management initialization:', error);
        alert('Print Management initialization error: ' + error.message);
    }
});

// =============================================================================
// 全局函數 (Global Functions) - 向後兼容
// =============================================================================

/**
 * 獲取選中的產品ID
 */
function getSelectedProducts() {
    return $('.product-select:checked').map(function() {
        return $(this).val();
    }).get();
}

/**
 * 生成PDF - 使用JavaScript生成HTML并直接打印
 */
function generatePDFWithLaravel(selectedProducts) {
    PrintService.generatePDFWithLaravel(selectedProducts);
}

/**
 * 直接打印 - 使用JavaScript生成HTML并直接打印
 */
function printPreviewWithLaravel(selectedProducts) {
    PrintService.printPreviewWithLaravel(selectedProducts);
}

/**
 * 創建PDF內容 - 生成完整的HTML文檔
 */
function createPDFContent(products, includeBarcode, includeImage) {
    return PrintService.createPDFContent(products, includeBarcode, includeImage);
}

/**
 * 直接打印 - 使用隱藏iframe觸發瀏覽器打印對話框
 */
function printAsPDF(content) {
    PrintService.printAsPDF(content);
}

/**
 * 等待 JsBarcode 庫加載完成
 */
function waitForJsBarcode() {
    if (window.printDashboard) {
        window.printDashboard.waitForJsBarcode();
    }
}

/**
 * 生成所有條形碼
 */
function generateAllBarcodes() {
    if (window.printDashboard) {
        window.printDashboard.generateAllBarcodes();
    }
}
