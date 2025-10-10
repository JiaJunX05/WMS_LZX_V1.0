/**
 * Stock In JavaScript 類
 * 使用 alert-system.js 進行提示
 */

class StockIn {
    constructor() {
        this.scannedProducts = [];
        this.referenceNumber = '';
        this.batchNotes = '';
        this.scanTimeout = null;
        this.isScanning = false; // 防止重复扫描
        this.isSubmitting = false; // 防止重复提交
        this.lastInputTime = 0; // 記錄最後輸入時間
        this.inputBuffer = ''; // 輸入緩衝區
        this.init();
    }

    init() {
        this.bindEvents();
        this.focusScanner();
        this.bindReferenceInput();
    }

    bindEvents() {
        // 条码扫描输入框
        const scannerInput = document.getElementById('barcode-scanner');
        if (scannerInput) {
            // 支持 Enter 鍵和掃描槍輸入，但禁用手動輸入
            scannerInput.addEventListener('keydown', (e) => {
                console.log('Key pressed:', e.key, 'Code:', e.code);

                // 只允许 Enter 键
                if (e.key === 'Enter') {
            e.preventDefault();
                    console.log('Enter key detected, triggering scan...');
                    this.scanBarcode();
                } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    // 簡化檢測邏輯：只記錄時間，不阻止輸入
                    const currentTime = Date.now();
                    const timeDiff = currentTime - this.lastInputTime;
                    this.lastInputTime = currentTime;

                    console.log('Input detected:', e.key, 'Time diff:', timeDiff);
                    // 暫時不阻止任何輸入，讓掃描槍可以正常輸入
                }
            });

            // 监听输入事件，只清除样式，不自动扫描
            scannerInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value.length > 0) {
                    // 清除输入框样式
                    e.target.classList.remove('is-valid', 'is-invalid');
                }
                // 移除自動掃描功能，只允許 Enter 鍵觸發
            });

            // 防止粘贴
            scannerInput.addEventListener('paste', (e) => {
            e.preventDefault();
            });
        }

        // 清除所有按钮
        const clearAllBtn = document.getElementById('clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllScanned();
            });
        }
    }

    // 绑定参考编号输入框事件
    bindReferenceInput() {
        // 延迟绑定，确保DOM元素已存在
        setTimeout(() => {
            const referenceInput = document.getElementById('reference-number');
            if (referenceInput && !referenceInput.hasAttribute('data-bound')) {
                // 标记已绑定，防止重复绑定
                referenceInput.setAttribute('data-bound', 'true');

                // 监听输入事件，更新按钮状态
                referenceInput.addEventListener('input', (e) => {
                    // 更新按鈕狀態
                    this.updateCounters();
                });

                // 监听 Enter 键提交
                referenceInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
            e.preventDefault();
                        e.stopPropagation(); // 阻止事件冒泡
                        // 检查是否有扫描的产品和有效的参考编号
                        if (this.scannedProducts.length > 0 && referenceInput.value.trim()) {
                            console.log('Enter key pressed in reference input, submitting...');
                            this.submitStockIn();
                        } else {
                            console.log('Cannot submit: no products scanned or reference number empty');
                        }
                    }
                });

                // 监听粘贴事件（扫描枪输入）
                referenceInput.addEventListener('paste', (e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    // 延迟处理，确保粘贴内容已输入
                    setTimeout(() => {
                        const value = referenceInput.value.trim();
                        if (value && this.scannedProducts.length > 0) {
                            console.log('Paste detected in reference input, auto-submitting...');
                            this.submitStockIn();
                        }
                    }, 100);
                });

                console.log('Reference input bound successfully with Enter and paste support');
            } else if (referenceInput) {
                console.log('Reference input already bound, skipping...');
            } else {
                console.log('Reference input not found, will retry later');
            }
        }, 100);
    }

    // 扫描条码
    async scanBarcode() {
        // 防止重复扫描
        if (this.isScanning) {
            console.log('Already scanning, skipping...');
            return;
        }

        const scannerInput = document.getElementById('barcode-scanner');
        const barcode = scannerInput.value.trim();

        if (!barcode) {
            this.showAlert('Please scan a barcode', 'error');
            return;
        }

        this.isScanning = true; // 设置扫描状态

        try {
            // 搜索产品
            const product = await this.findProduct(barcode);

            if (product) {
                this.addProductToScanned(product);
                scannerInput.value = '';
                scannerInput.classList.add('is-valid');
            } else {
                scannerInput.classList.add('is-invalid');
                this.showAlert(`Product not found for barcode: ${barcode}`, 'error');
                // 清空輸入框讓用戶可以繼續掃描
                scannerInput.value = '';
            }
        } catch (error) {
            console.error('Scan error:', error);
            this.showAlert('Error scanning product', 'error');
        } finally {
            // 重置扫描状态
            this.isScanning = false;

            // 重新聚焦掃描輸入框
            setTimeout(() => {
                scannerInput.focus();
            }, 100);
        }
    }

    // 查找产品（从数据库查询）
    async findProduct(barcode) {
        try {
            console.log('Searching for barcode:', barcode);
            const response = await fetch(`/staff/stock-management?search=${encodeURIComponent(barcode)}`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            console.log('Response status:', response.status);
            if (response.ok) {
                const data = await response.json();
            console.log('Response data:', data);
            if (data.success && data.data && data.data.length > 0) {
                console.log('Found product:', data.data[0]);
                console.log('Product variants:', data.data[0].variants);
                if (data.data[0].variants && data.data[0].variants.length > 0) {
                    console.log('First variant:', data.data[0].variants[0]);
                    if (data.data[0].variants[0].attributeVariant) {
                        console.log('AttributeVariant:', data.data[0].variants[0].attributeVariant);
                        if (data.data[0].variants[0].attributeVariant.brand) {
                            console.log('Brand:', data.data[0].variants[0].attributeVariant.brand);
                        }
                    }
                }
                return data.data[0]; // 返回第一个匹配的产品
                } else {
                    console.log('No products found in response');
                }
            } else {
                console.log('Response not OK:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error searching product:', error);
        }

        return null;
    }

    // 添加产品到扫描列表
    addProductToScanned(product) {
        const existingIndex = this.scannedProducts.findIndex(p => p.id === product.id);

        if (existingIndex !== -1) {
            // 如果產品已存在，增加總數量
            this.scannedProducts[existingIndex].scannedQuantity = (this.scannedProducts[existingIndex].scannedQuantity || 0) + 1;
            this.showAlert(`Increased quantity for ${product.name} to ${this.scannedProducts[existingIndex].scannedQuantity}`, 'success');
        } else {
            // 如果產品不存在，添加新產品
            this.scannedProducts.push({
                ...product,
                scannedQuantity: 1
            });
            this.showAlert(`Added ${product.name} to stock in list`, 'success');
        }

        this.updateScannedProductsDisplay();
        this.updateCounters();
    }

    // 更新扫描产品显示
    updateScannedProductsDisplay() {
        const tbody = document.getElementById('scanned-products-table-body');
        const scannedCard = document.getElementById('scanned-products-card');
        const emptyCard = document.getElementById('empty-state-card');
        const submitSection = document.getElementById('submit-section');

        if (this.scannedProducts.length === 0) {
            scannedCard.style.display = 'none';
            emptyCard.style.display = 'block';
            submitSection.style.display = 'none';
            return;
        }

        scannedCard.style.display = 'block';
        emptyCard.style.display = 'none';
        submitSection.style.display = 'block';

        // 重新绑定参考编号输入框事件（确保在显示时绑定）
        this.bindReferenceInput();

        tbody.innerHTML = this.scannedProducts.map((product, index) => `
            <tr data-product-id="${product.id}">
                    <td class="ps-4">
                    <span class="fw-medium">${index + 1}</span>
                    </td>
                    <td>
                        ${product.cover_image
                            ? `<img src="/assets/images/products/${product.cover_image}"
                                 alt="Product Image" class="preview-image"
                                 style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">`
                        : `<div class="no-image" style="width: 50px; height: 50px; border-radius: 8px; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center;">
                             <i class="bi bi-image text-muted"></i>
                               </div>`
                        }
                    </td>
                    <td>
                        <div class="fw-medium">${product.name}</div>
                        <div class="text-muted small">${product.category?.category_name || 'N/A'}</div>
                    </td>
                    <td>
                    <code class="bg-light px-2 py-1 rounded">${product.variants && product.variants.length > 0 ? product.variants[0].sku_code : 'N/A'}</code>
                    </td>
                    <td>
                        <span class="fw-bold ${product.quantity > 10 ? 'text-success' : (product.quantity > 0 ? 'text-warning' : 'text-danger')}">
                        ${product.quantity || 0}
                        </span>
                    </td>
                    <td>
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary" type="button" onclick="window.stockIn.updateProductQuantity(${product.id}, Math.max(1, ${product.scannedQuantity || 1} - 1))">
                            <i class="bi bi-dash"></i>
                        </button>
                        <input type="number" class="form-control text-center" value="${product.scannedQuantity || 1}"
                               min="1" onchange="window.stockIn.updateProductQuantity(${product.id}, parseInt(this.value) || 1)">
                        <button class="btn btn-outline-secondary" type="button" onclick="window.stockIn.updateProductQuantity(${product.id}, ${product.scannedQuantity || 1} + 1)">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                </td>
                <td class="text-end pe-4">
                    <button class="btn btn-outline-danger btn-sm" onclick="window.stockIn.removeProductFromScanned(${product.id})" title="Remove">
                        <i class="bi bi-trash me-1"></i>
                        Remove
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // 更新产品数量
    updateProductQuantity(productId, quantity) {
        const product = this.scannedProducts.find(p => p.id === productId);
        if (product) {
            if (quantity <= 0) {
                this.removeProductFromScanned(productId);
            } else {
                product.scannedQuantity = quantity;
                this.updateScannedProductsDisplay();
            }
        }
    }

    // 从扫描列表移除产品
    removeProductFromScanned(productId) {
        const index = this.scannedProducts.findIndex(p => p.id === productId);
        if (index !== -1) {
            const product = this.scannedProducts[index];
            this.scannedProducts.splice(index, 1);
            this.showAlert(`Removed ${product.name} from stock in list`, 'info');
            this.updateScannedProductsDisplay();
            this.updateCounters();
        }
    }

    // 更新计数器
    updateCounters() {
        const totalItems = this.scannedProducts.reduce((sum, product) => sum + (product.scannedQuantity || 1), 0);

        document.getElementById('scanned-count').textContent = `${totalItems} items scanned`;
        document.getElementById('scanned-products-count').textContent = `${this.scannedProducts.length} products`;

        // 更新按钮状态
        const clearAllBtn = document.getElementById('clear-all-btn');
        const submitBtn = document.getElementById('submit-btn');
        const referenceInput = document.getElementById('reference-number');

        if (this.scannedProducts.length > 0) {
            clearAllBtn.disabled = false;
            // 只有當有產品且有參考編號時才啟用提交按鈕
            if (referenceInput && referenceInput.value.trim()) {
                submitBtn.disabled = false;
            } else {
                submitBtn.disabled = true;
            }
        } else {
            clearAllBtn.disabled = true;
            submitBtn.disabled = true;
        }
    }

    // 更新提交按钮状态
    updateSubmitButtonState() {
        const submitBtn = document.getElementById('submit-btn');
        const referenceInput = document.getElementById('reference-number');

        if (this.scannedProducts.length > 0 && referenceInput.value.trim()) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }

    // 清除所有扫描的产品
    clearAllScanned() {
        if (confirm('Are you sure you want to clear all scanned products?')) {
            this.scannedProducts = [];
            this.updateScannedProductsDisplay();
            this.updateCounters();
            this.showAlert('All scanned products cleared', 'info');
        }
    }

    // 提交库存入库
    async submitStockIn() {
        // 防止重复提交
        if (this.isSubmitting) {
            console.log('Already submitting, skipping...');
            return;
        }

        if (this.scannedProducts.length === 0) {
            this.showAlert('No products to submit', 'error');
            return;
        }

        const referenceNumber = document.getElementById('reference-number').value.trim();
        if (!referenceNumber) {
            this.showAlert('Please enter a reference number', 'error');
            document.getElementById('reference-number').focus();
            return;
        }

        this.isSubmitting = true; // 设置提交状态

        try {
            // 準備提交數據 - 每個產品只創建一個項目，數量為總掃描數量
            const stockInItems = this.scannedProducts.map(product => ({
                product_id: product.id,
                quantity: product.scannedQuantity || 1, // 使用合併後的數量
                reference_number: referenceNumber
            }));

            console.log('Submitting stock in items:', stockInItems);
            console.log('Scanned products:', this.scannedProducts);
            console.log('Items count:', stockInItems.length);
            console.log('Original scanned products count:', this.scannedProducts.length);

            // 發送 AJAX 請求到後端
            const response = await fetch(window.stockInRoute, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    stock_in_items: stockInItems,
                    reference_number: referenceNumber
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert(`Successfully submitted ${this.scannedProducts.length} products for stock in with reference ${referenceNumber}!`, 'success');

                // 清除扫描列表和参考编号
                setTimeout(() => {
                    this.scannedProducts = [];
                    document.getElementById('reference-number').value = '';
                    this.updateScannedProductsDisplay();
                    this.updateCounters();

                    // 返回 dashboard
                    window.location.href = window.stockManagementRoute || '/staff/stock-management';
                }, 2000);
            } else {
                this.showAlert(result.message || 'Failed to submit stock in', 'error');
            }
        } catch (error) {
            console.error('Submit error:', error);
            this.showAlert('Error submitting stock in. Please try again.', 'error');
        } finally {
            // 重置提交状态
            this.isSubmitting = false;
        }
    }


    // 聚焦掃描輸入框（移除自動聚焦功能）
    focusScanner() {
        const scannerInput = document.getElementById('barcode-scanner');
        if (scannerInput) {
            // 只在頁面加載時聚焦一次，之後不再自動聚焦
            scannerInput.focus();
            console.log('Scanner input focused on page load');
        }
    }


    // 显示提示信息 - 使用 alert-system.js
    showAlert(message, type = 'success') {
        if (typeof window.showAlert === 'function') {
            window.showAlert(message, type);
        } else {
            // 备用方案
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.stockIn = new StockIn();
});

// 全局函数 - 供HTML调用
function scanBarcode() {
    if (window.stockIn) {
        window.stockIn.scanBarcode();
    }
}

function clearAllScanned() {
    if (window.stockIn) {
        window.stockIn.clearAllScanned();
    }
}

function submitStockIn() {
    if (window.stockIn) {
        window.stockIn.submitStockIn();
    }
}

