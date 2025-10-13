/**
 * Stock Management JavaScript 統一管理文件
 * 整合所有庫存管理相關功能
 *
 * 功能模塊：
 * - Stock Dashboard: 產品數據管理、搜索、篩選、分頁
 * - Stock History: 庫存歷史報告、導出功能
 * - Stock In: 庫存入庫、條碼掃描
 * - Stock Out: 庫存出庫、條碼掃描
 * - Stock Return: 庫存退貨、條碼掃描
 *
 * @author WMS Team
 * @version 1.0.0
 */

// =============================================================================
// 全局變量 (Global Variables)
// =============================================================================

// 頁面類型檢測
const PAGE_TYPES = {
    DASHBOARD: 'dashboard',
    HISTORY: 'history',
    STOCK_IN: 'stock-in',
    STOCK_OUT: 'stock-out',
    STOCK_RETURN: 'stock-return'
};

// 掃描狀態
const SCAN_STATES = {
    IDLE: 'idle',
    SCANNING: 'scanning',
    SUBMITTING: 'submitting'
};

// =============================================================================
// Stock Dashboard 類 (Stock Dashboard Class)
// =============================================================================

class StockDashboard {
    constructor() {
        // 狀態管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.currentProductId = null;
        this.currentProductStock = 0;
        this.totalPages = 1;
        this.totalItems = 0;
        this.searchTimeout = null;

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模塊 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.loadProducts();
    }

    // =============================================================================
    // 事件綁定模塊 (Event Binding Module)
    // =============================================================================
    bindEvents() {
        // 搜索功能
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keyup', () => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.handleSearch();
                }, 300);
            });
        }

        // 清除搜索
        const clearSearchBtn = document.getElementById('clear-search');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // 分頁功能
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadProducts();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.loadProducts();
                }
            });
        }

        // 历史筛选器变化时重新加载
        ['history-movement-type', 'history-start-date', 'history-end-date'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    if (this.currentProductId) {
                        this.loadStockHistory(this.currentProductId);
                    }
                });
            }
        });
    }

    // =============================================================================
    // 數據加載模塊 (Data Loading Module)
    // =============================================================================

    /**
     * 加載產品數據
     */
    async loadProducts() {
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                search: this.searchTerm
            });

            const response = await fetch(`${window.stockManagementRoute}?${params}`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load products');
            }

            const data = await response.json();

            if (data.success) {
                this.renderProducts(data.data);
                this.updatePagination(data.pagination);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    /**
     * 渲染產品列表
     */
    renderProducts(products) {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <i class="bi bi-box display-1 text-muted mb-3"></i>
                        <h5 class="text-muted mb-2">No Products Found</h5>
                        <p class="text-muted mb-0">No products match your current search criteria</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = products.map(product => {
            const variant = product.variants && product.variants[0];
            const skuCode = variant?.sku_code || 'N/A';
            const barcode = variant?.barcode_number || 'N/A';
            const currentStock = product.quantity || 0;

            return `
                <tr class="product-row">
                    <td class="ps-4">
                        <span class="fw-medium">#${product.id}</span>
                    </td>
                    <td>
                        <img src="${product.cover_image ? `${window.productImagePath}/${product.cover_image}` : window.defaultProductImage}"
                             alt="${product.name}"
                             class="rounded"
                             style="width: 50px; height: 50px; object-fit: cover;"
                             onerror="this.src='${window.defaultProductImage}'">
                    </td>
                    <td>
                        <div class="fw-medium">${product.name}</div>
                        <div class="d-flex align-items-center gap-2 mt-1">
                            <span class="text-muted small">${product.category?.category_name || 'N/A'}</span>
                        </div>
                    </td>
                    <td>
                        <code class="bg-light px-2 py-1 rounded">${skuCode}</code>
                    </td>
                    <td>
                        <span class="fw-bold ${currentStock > 10 ? 'text-success' : (currentStock > 0 ? 'text-warning' : 'text-danger')}">
                            ${currentStock}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${product.product_status === 'Available' ? 'available' : 'unavailable'}">
                            ${product.product_status}
                        </span>
                    </td>
                    <td class="text-end pe-4">
                        <div class="action-buttons">
                            <button class="btn-action" title="View History" onclick="viewStockHistory(${product.id}, '${product.name}')">
                                <i class="bi bi-clock-history"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * 更新分頁信息
     */
    updatePagination(pagination) {
        this.totalPages = pagination.last_page;
        this.totalItems = pagination.total;

        // 更新分頁統計
        document.getElementById('dashboard-showing-start').textContent = pagination.from || 0;
        document.getElementById('dashboard-showing-end').textContent = pagination.to || 0;
        document.getElementById('dashboard-total-count').textContent = pagination.total || 0;

        // 更新頁碼
        const pageNumber = document.getElementById('dashboard-page-number');
        if (pageNumber) {
            pageNumber.textContent = pagination.current_page;
        }

        // 更新分頁按鈕狀態
        this.updatePaginationButtons(pagination);
    }

    /**
     * 处理搜索功能
     */
    handleSearch() {
        const searchInput = document.getElementById('search-input');
        this.searchTerm = searchInput.value;
        this.currentPage = 1; // 重置到第一页
        this.loadProducts();
    }

    /**
     * 清除搜索
     */
    clearSearch() {
        const searchInput = document.getElementById('search-input');
        searchInput.value = '';
        this.searchTerm = '';
        this.currentPage = 1; // 重置到第一页
        this.loadProducts();
    }

    /**
     * 更新分頁按鈕狀態
     */
    updatePaginationButtons(pagination) {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            if (pagination.current_page <= 1) {
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
            }
        }

        if (nextBtn) {
            if (pagination.current_page >= pagination.last_page) {
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.classList.remove('disabled');
            }
        }
    }

    // =============================================================================
    // 库存历史模块 (Stock History Module)
    // =============================================================================

    /**
     * 查看库存历史
     * @param {number} productId 产品ID
     * @param {string} productName 产品名称
     */
    viewStockHistory(productId, productName) {
        // 跳转到 stock detail 页面
        const stockDetailUrl = `/staff/stock-detail?id=${productId}`;
        window.location.href = stockDetailUrl;
    }

    /**
     * 获取当前库存
     * @param {number} productId 产品ID
     * @returns {string} 当前库存数量
     */
    getCurrentStockForProduct(productId) {
        const row = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (row) {
            const stockCell = row.querySelector('td:nth-child(5) span');
            return stockCell ? stockCell.textContent : '0';
        }
        return '0';
    }

    // Dashboard 庫存歷史加載由後端處理，不再需要前端加載

    // Dashboard 庫存歷史渲染由後端處理，不再需要前端渲染

    // Dashboard 歷史分頁渲染由後端處理，不再需要前端渲染

    // =============================================================================
    // 模态框管理模块 (Modal Management Module)
    // =============================================================================


    // =============================================================================
    // 工具函数模块 (Utility Functions Module)
    // =============================================================================

    /**
     * 显示提示信息
     * @param {string} message 消息内容
     * @param {string} type 消息类型
     */
    showAlert(message, type = 'success') {
        if (typeof window.showAlert === 'function') {
            window.showAlert(message, type);
        } else {
            // 备用方案 - 使用 alertContainer
            const alertContainer = document.getElementById('alertContainer');
            if (alertContainer) {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
                alertDiv.innerHTML = `
                    <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;

                alertContainer.appendChild(alertDiv);

                setTimeout(() => {
                    alertDiv.remove();
                }, 5000);
            } else {
                console.error('Alert container not found');
            }
        }
    }
}

// =============================================================================
// Stock History 類 (Stock History Class)
// =============================================================================

class StockHistory {
    constructor() {
        // 狀態管理
        this.currentPage = 1;
        this.totalPages = 1;
        this.movementType = '';
        this.productSearch = '';
        this.startDate = '';
        this.endDate = '';
        this.isLoading = false;
        this.searchTimeout = null;

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模塊 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.loadStockHistory();
        this.loadStockStatistics();
    }

    // =============================================================================
    // 事件綁定模塊 (Event Binding Module)
    // =============================================================================
    bindEvents() {
        // 篩選器變化事件
        ['movement-type-filter', 'product-search', 'start-date-filter', 'end-date-filter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'product-search') {
                    element.addEventListener('keyup', () => {
                        clearTimeout(this.searchTimeout);
                        this.searchTimeout = setTimeout(() => {
                            this.handleFilterChange();
                        }, 500);
                    });
                } else {
                    element.addEventListener('change', () => {
                        this.handleFilterChange();
                    });
                }
            }
        });

        // 清除篩選器
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // 分頁功能
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadStockHistory(this.currentPage);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.loadStockHistory(this.currentPage);
                }
            });
        }

        // 分页按钮点击事件 - 使用 AJAX
        $(document).on('click', '.pagination-btn', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            console.log('StockHistory: Pagination button clicked, page:', page);
            this.loadStockHistory(page);
        });
    }

    // =============================================================================
    // 篩選模塊 (Filter Module)
    // =============================================================================

    /**
     * 處理篩選器變化
     */
    handleFilterChange() {
        this.movementType = document.getElementById('movement-type-filter').value;
        this.productSearch = document.getElementById('product-search').value;
        this.startDate = document.getElementById('start-date-filter').value;
        this.endDate = document.getElementById('end-date-filter').value;

        this.currentPage = 1;
        this.loadStockHistory();
        this.loadStockStatistics(); // 重新加載統計數據
    }

    /**
     * 清除所有篩選器
     */
    clearFilters() {
        document.getElementById('movement-type-filter').value = '';
        document.getElementById('product-search').value = '';
        document.getElementById('start-date-filter').value = '';
        document.getElementById('end-date-filter').value = '';

        this.movementType = '';
        this.productSearch = '';
        this.startDate = '';
        this.endDate = '';
        this.currentPage = 1;

        this.loadStockHistory();
        this.loadStockStatistics(); // 重新加載統計數據
    }

    // =============================================================================
    // 數據加載模塊 (Data Loading Module)
    // =============================================================================

    /**
     * 加載庫存歷史數據
     * @param {number} page 頁碼
     */
    async loadStockHistory(page = 1) {
        if (this.isLoading) return;

        this.isLoading = true;
        this.currentPage = page;

        console.log('StockHistory: Loading page:', page, 'currentPage:', this.currentPage);

        const params = new URLSearchParams({
            page: page,
            movement_type: this.movementType,
            product_search: this.productSearch,
            start_date: this.startDate,
            end_date: this.endDate
        });

        try {
            console.log('Loading stock history for page:', page);
            console.log('API Route:', window.stockHistoryApiRoute);
            console.log('Params:', params.toString());

            const response = await fetch(`${window.stockHistoryApiRoute}?${params}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (data.success) {
                console.log('Movements count:', data.data?.length || 0);
                console.log('Pagination:', data.pagination);
                this.totalPages = data.pagination.last_page;
                this.renderStockHistory(data.data || []);
                this.renderPagination(data.pagination);
                this.updateResultsCount(data.pagination);
            } else {
                console.error('API returned error:', data.message);
                this.showAlert(data.message || 'Failed to load stock history', 'error');
                this.renderStockHistory([]); // 清空表格
            }
        } catch (error) {
            console.error('Error loading stock history:', error);
            this.showAlert('Failed to load stock history', 'error');
            this.renderStockHistory([]); // 清空表格
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 加載庫存統計數據
     */
    async loadStockStatistics() {
        // 檢查統計卡片是否存在（僅管理員和超級管理員可見）
        const statisticsCards = document.querySelector('.statistics-section');
        if (!statisticsCards) {
            console.log('Statistics cards not found, skipping statistics load');
            return; // 如果統計卡片不存在，則不執行
        }

        console.log('Loading stock statistics...');
        const params = new URLSearchParams({
            start_date: this.startDate,
            end_date: this.endDate
        });

        try {
            console.log('Fetching statistics from:', `/api/stock-statistics?${params}`);
            const response = await fetch(`/api/stock-statistics?${params}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });

            console.log('Statistics response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Statistics response data:', data);

            if (data.success) {
                this.updateStatisticsCards(data.statistics);
                console.log('Statistics updated successfully');
            } else {
                console.error('Failed to load statistics:', data.message);
            }
        } catch (error) {
            console.error('Error loading stock statistics:', error);
        }
    }

    /**
     * 更新統計卡片數據
     * @param {Object} statistics 統計數據
     */
    updateStatisticsCards(statistics) {
        console.log('Updating statistics cards with data:', statistics);
        const elements = {
            'totalStockIn': statistics.total_stock_in,
            'totalStockOut': statistics.total_stock_out,
            'netChange': statistics.net_change,
            'totalMovements': statistics.total_movements,
            'currentTotalStock': statistics.current_total_stock,
            'lowStockCount': statistics.low_stock_count
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            console.log(`Updating element ${id}:`, element, 'with value:', value);
            if (element) {
                element.textContent = value || 0;
                console.log(`Updated ${id} to:`, element.textContent);
            } else {
                console.error(`Element with id ${id} not found`);
            }
        });
    }

    // =============================================================================
    // 渲染模塊 (Rendering Module)
    // =============================================================================

    /**
     * 渲染庫存歷史表格
     * @param {Array} movements 庫存變動記錄
     */
    renderStockHistory(movements) {
        const tbody = document.getElementById('history-table-body');

        if (movements.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-4">
                        <i class="bi bi-clock-history display-1 text-muted mb-3"></i>
                        <h5 class="text-muted mb-2">No Stock Movements Found</h5>
                        <p class="text-muted mb-0">No stock movement records match your current filters</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = movements.map(movement => `
            <tr>
                <td class="ps-4">
                    <span class="fw-medium">#${movement.id}</span>
                </td>
                <td>
                    <div class="fw-medium">${new Date(movement.date).toLocaleDateString()}</div>
                    <div class="text-muted small">${new Date(movement.date).toLocaleTimeString()}</div>
                </td>
                <td>
                    <span class="badge ${movement.movement_type === 'stock_in' ? 'bg-success' :
                                          movement.movement_type === 'stock_out' ? 'bg-danger' : 'bg-warning'}">
                        ${movement.movement_type === 'stock_in' ? 'Stock In' :
                          movement.movement_type === 'stock_out' ? 'Stock Out' : 'Stock Return'}
                    </span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        ${movement.product_image ?
                            `<img src="${window.productImagePath}/${movement.product_image}" alt="${movement.product_name}" class="me-2 rounded" style="width: 40px; height: 40px; object-fit: cover;" onerror="this.src='${window.defaultProductImage}'">` :
                            `<div class="me-2 rounded d-flex align-items-center justify-content-center bg-light" style="width: 40px; height: 40px;"><i class="bi bi-image text-muted"></i></div>`
                        }
                        <div>
                            <div class="fw-medium">${movement.product_name || 'N/A'}</div>
                            <div class="text-muted small">SKU: ${movement.sku_code || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td class="${movement.movement_type === 'stock_out' ? 'text-danger' : 'text-success'}">
                    <span class="fw-bold">${movement.movement_type === 'stock_out' ? '-' : '+'}${Math.abs(movement.quantity)}</span>
                </td>
                <td>
                    <span class="fw-medium">${movement.previous_stock}</span>
                </td>
                <td>
                    <span class="fw-medium">${movement.current_stock}</span>
                </td>
                <td>
                    <span class="badge bg-primary">${movement.user_name || '-'}</span>
                </td>
                <td>
                    <code class="bg-light px-2 py-1 rounded">${movement.reference_number || '-'}</code>
                </td>
            </tr>
        `).join('');
    }

    /**
     * 渲染分頁
     * @param {Object} pagination 分頁信息
     */
    renderPagination(pagination) {
        console.log('StockHistory: Rendering pagination:', pagination);

        // 清除现有的分页按钮（除了 prev-page 和 next-page）
        $("#pagination li:not(#prev-page):not(#next-page)").remove();

        if (!pagination.last_page) {
            console.log('StockHistory: No pagination to render');
            return;
        }

        let paginationHTML = '';
        $('#prev-page').toggleClass('disabled', pagination.current_page <= 1);

        if (pagination.last_page > 7) {
            for (let i = 1; i <= pagination.last_page; i++) {
                if (i === 1 || i === pagination.last_page || (i >= pagination.current_page - 1 && i <= pagination.current_page + 1)) {
                    paginationHTML += `<li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                        <a class="page-link pagination-btn" href="#" data-page="${i}">${i}</a>
                    </li>`;
                } else if (i === pagination.current_page - 2 || i === pagination.current_page + 2) {
                    paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
            }
        } else {
            for (let i = 1; i <= pagination.last_page; i++) {
                paginationHTML += `<li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                    <a class="page-link pagination-btn" href="#" data-page="${i}">${i}</a>
                </li>`;
            }
        }

        $('#next-page').toggleClass('disabled', pagination.current_page >= pagination.last_page);
        $('#prev-page').after(paginationHTML);

        console.log('StockHistory: Pagination HTML generated:', paginationHTML);
    }

    /**
     * 更新結果計數
     * @param {Object} pagination 分頁信息
     */
    updateResultsCount(pagination) {
        document.getElementById('history-results-count').textContent = `${pagination.total} records`;
        document.getElementById('history-showing-start').textContent = pagination.from || 0;
        document.getElementById('history-showing-end').textContent = pagination.to || 0;
        document.getElementById('history-total-count').textContent = pagination.total || 0;
    }

    /**
     * 顯示提示信息
     * @param {string} message 消息內容
     * @param {string} type 消息類型
     */
    showAlert(message, type = 'success') {
        if (typeof window.showAlert === 'function') {
            window.showAlert(message, type);
        } else {
            // 備用方案 - 使用 alertContainer
            const alertContainer = document.getElementById('alertContainer');
            if (alertContainer) {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
                alertDiv.innerHTML = `
                    <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;

                alertContainer.appendChild(alertDiv);

                setTimeout(() => {
                    alertDiv.remove();
                }, 5000);
            } else {
                console.error('Alert container not found');
            }
        }
    }
}

// =============================================================================
// Stock In 類 (Stock In Class)
// =============================================================================

class StockIn {
    constructor() {
        // 產品管理
        this.scannedProducts = [];

        // 狀態管理
        this.scanState = SCAN_STATES.IDLE;
        this.lastInputTime = 0;
        this.inputBuffer = '';

        // 表單數據
        this.referenceNumber = '';
        this.batchNotes = '';

        // 初始化
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
            // 移除可能存在的 onclick 属性，防止双重触发
            clearAllBtn.removeAttribute('onclick');
            clearAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
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
        if (this.scanState === SCAN_STATES.SCANNING) {
            console.log('Already scanning, skipping...');
            return;
        }

        const scannerInput = document.getElementById('barcode-scanner');
        const barcode = scannerInput.value.trim();

        if (!barcode) {
            this.showAlert('Please scan a barcode', 'error');
            return;
        }

        this.scanState = SCAN_STATES.SCANNING; // 设置扫描状态

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
            this.showAlert('Failed to scan product', 'error');
        } finally {
            // 重置扫描状态
            this.scanState = SCAN_STATES.IDLE;

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
        const product = this.scannedProducts.find(p => p.id === productId);
        if (product && confirm(`Are you sure you want to remove ${product.name} from the list?`)) {
            const index = this.scannedProducts.findIndex(p => p.id === productId);
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
        if (this.scanState === SCAN_STATES.SUBMITTING) {
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

        this.scanState = SCAN_STATES.SUBMITTING; // 设置提交状态

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
            this.showAlert('Failed to submit stock in', 'error');
        } finally {
            // 重置提交状态
            this.scanState = SCAN_STATES.IDLE;
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
            // 备用方案 - 使用 alertContainer
            const alertContainer = document.getElementById('alertContainer');
            if (alertContainer) {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
                alertDiv.innerHTML = `
                    <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;

                alertContainer.appendChild(alertDiv);

                setTimeout(() => {
                    alertDiv.remove();
                }, 5000);
            } else {
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        }
    }
}

// =============================================================================
// Stock Out 類 (Stock Out Class)
// =============================================================================

class StockOut {
    constructor() {
        // 產品管理
        this.scannedProducts = [];

        // 狀態管理
        this.scanState = SCAN_STATES.IDLE;
        this.lastInputTime = 0;
        this.inputBuffer = '';

        // 表單數據
        this.referenceNumber = '';
        this.batchNotes = '';

        // 初始化
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
            // 移除可能存在的 onclick 属性，防止双重触发
            clearAllBtn.removeAttribute('onclick');
            clearAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
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
                            this.submitStockOut();
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
                            this.submitStockOut();
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
        if (this.scanState === SCAN_STATES.SCANNING) {
            console.log('Already scanning, skipping...');
            return;
        }

        const scannerInput = document.getElementById('barcode-scanner');
        const barcode = scannerInput.value.trim();

        if (!barcode) {
            this.showAlert('Please scan a barcode', 'error');
            return;
        }

        this.scanState = SCAN_STATES.SCANNING; // 设置扫描状态

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
            this.showAlert('Failed to scan product', 'error');
        } finally {
            // 重置扫描状态
            this.scanState = SCAN_STATES.IDLE;

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
            this.showAlert(`Added ${product.name} to stock out list`, 'success');
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
                        <button class="btn btn-outline-secondary" type="button" onclick="window.stockOut.updateProductQuantity(${product.id}, Math.max(1, ${product.scannedQuantity || 1} - 1))">
                            <i class="bi bi-dash"></i>
                        </button>
                        <input type="number" class="form-control text-center" value="${product.scannedQuantity || 1}"
                               min="1" onchange="window.stockOut.updateProductQuantity(${product.id}, parseInt(this.value) || 1)">
                        <button class="btn btn-outline-secondary" type="button" onclick="window.stockOut.updateProductQuantity(${product.id}, ${product.scannedQuantity || 1} + 1)">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                </td>
                <td class="text-end pe-4">
                    <button class="btn btn-outline-danger btn-sm" onclick="window.stockOut.removeProductFromScanned(${product.id})" title="Remove">
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
        const product = this.scannedProducts.find(p => p.id === productId);
        if (product && confirm(`Are you sure you want to remove ${product.name} from the list?`)) {
            const index = this.scannedProducts.findIndex(p => p.id === productId);
            this.scannedProducts.splice(index, 1);
            this.showAlert(`Removed ${product.name} from stock out list`, 'info');
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

    // 清除所有扫描的产品
    clearAllScanned() {
        if (confirm('Are you sure you want to clear all scanned products?')) {
            this.scannedProducts = [];
            this.updateScannedProductsDisplay();
            this.updateCounters();
            this.showAlert('All scanned products cleared', 'info');
        }
    }

    // 提交库存出库
    async submitStockOut() {
        // 防止重复提交
        if (this.scanState === SCAN_STATES.SUBMITTING) {
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

        this.scanState = SCAN_STATES.SUBMITTING; // 设置提交状态

        try {
            // 準備提交數據 - 每個產品只創建一個項目，數量為總掃描數量
            const stockOutItems = this.scannedProducts.map(product => ({
                product_id: product.id,
                quantity: product.scannedQuantity || 1, // 使用合併後的數量
                reference_number: referenceNumber
            }));

            console.log('Submitting stock out items:', stockOutItems);
            console.log('Scanned products:', this.scannedProducts);
            console.log('Items count:', stockOutItems.length);
            console.log('Original scanned products count:', this.scannedProducts.length);

            // 發送 AJAX 請求到後端
            const response = await fetch(window.stockOutRoute, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    stock_out_items: stockOutItems,
                    reference_number: referenceNumber
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert(`Successfully submitted ${this.scannedProducts.length} products for stock out with reference ${referenceNumber}!`, 'success');

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
                this.showAlert(result.message || 'Failed to submit stock out', 'error');
            }
        } catch (error) {
            console.error('Submit error:', error);
            this.showAlert('Failed to submit stock out', 'error');
        } finally {
            // 重置提交状态
            this.scanState = SCAN_STATES.IDLE;
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
            // 备用方案 - 使用 alertContainer
            const alertContainer = document.getElementById('alertContainer');
            if (alertContainer) {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
                alertDiv.innerHTML = `
                    <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;

                alertContainer.appendChild(alertDiv);

                setTimeout(() => {
                    alertDiv.remove();
                }, 5000);
            } else {
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        }
    }
}

// =============================================================================
// Stock Return 類 (Stock Return Class)
// =============================================================================

class StockReturn {
    constructor() {
        // 產品管理
        this.scannedProducts = [];

        // 狀態管理
        this.scanState = SCAN_STATES.IDLE;
        this.lastInputTime = 0;
        this.inputBuffer = '';

        // 表單數據
        this.referenceNumber = '';
        this.batchNotes = '';

        // 初始化
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
            // 移除可能存在的 onclick 属性，防止双重触发
            clearAllBtn.removeAttribute('onclick');
            clearAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
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
                            this.submitStockReturn();
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
                            this.submitStockReturn();
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
        if (this.scanState === SCAN_STATES.SCANNING) {
            console.log('Already scanning, skipping...');
            return;
        }

        const scannerInput = document.getElementById('barcode-scanner');
        const barcode = scannerInput.value.trim();

        if (!barcode) {
            this.showAlert('Please scan a barcode', 'error');
            return;
        }

        this.scanState = SCAN_STATES.SCANNING; // 设置扫描状态

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
            this.showAlert('Failed to scan product', 'error');
        } finally {
            // 重置扫描状态
            this.scanState = SCAN_STATES.IDLE;

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
            this.showAlert(`Added ${product.name} to stock return list`, 'success');
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
                        <button class="btn btn-outline-secondary" type="button" onclick="window.stockReturn.updateProductQuantity(${product.id}, Math.max(1, ${product.scannedQuantity || 1} - 1))">
                            <i class="bi bi-dash"></i>
                        </button>
                        <input type="number" class="form-control text-center" value="${product.scannedQuantity || 1}"
                               min="1" onchange="window.stockReturn.updateProductQuantity(${product.id}, parseInt(this.value) || 1)">
                        <button class="btn btn-outline-secondary" type="button" onclick="window.stockReturn.updateProductQuantity(${product.id}, ${product.scannedQuantity || 1} + 1)">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                </td>
                <td class="text-end pe-4">
                    <button class="btn btn-outline-danger btn-sm" onclick="window.stockReturn.removeProductFromScanned(${product.id})" title="Remove">
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
        const product = this.scannedProducts.find(p => p.id === productId);
        if (product && confirm(`Are you sure you want to remove ${product.name} from the list?`)) {
            const index = this.scannedProducts.findIndex(p => p.id === productId);
            this.scannedProducts.splice(index, 1);
            this.showAlert(`Removed ${product.name} from stock return list`, 'info');
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

    // 清除所有扫描的产品
    clearAllScanned() {
        if (confirm('Are you sure you want to clear all scanned products?')) {
            this.scannedProducts = [];
            this.updateScannedProductsDisplay();
            this.updateCounters();
            this.showAlert('All scanned products cleared', 'info');
        }
    }

    // 提交库存退货
    async submitStockReturn() {
        // 防止重复提交
        if (this.scanState === SCAN_STATES.SUBMITTING) {
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

        this.scanState = SCAN_STATES.SUBMITTING; // 设置提交状态

        try {
            // 準備提交數據 - 每個產品只創建一個項目，數量為總掃描數量
            const stockReturnItems = this.scannedProducts.map(product => ({
                product_id: product.id,
                quantity: product.scannedQuantity || 1, // 使用合併後的數量
                reference_number: referenceNumber
            }));

            console.log('Submitting stock return items:', stockReturnItems);
            console.log('Scanned products:', this.scannedProducts);
            console.log('Items count:', stockReturnItems.length);
            console.log('Original scanned products count:', this.scannedProducts.length);

            // 發送 AJAX 請求到後端
            const response = await fetch(window.stockReturnRoute, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    stock_return_items: stockReturnItems,
                    reference_number: referenceNumber
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert(`Successfully submitted ${this.scannedProducts.length} products for stock return with reference ${referenceNumber}!`, 'success');

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
                this.showAlert(result.message || 'Failed to submit stock return', 'error');
            }
        } catch (error) {
            console.error('Submit error:', error);
            this.showAlert('Failed to submit stock return', 'error');
        } finally {
            // 重置提交状态
            this.scanState = SCAN_STATES.IDLE;
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
            // 备用方案 - 使用 alertContainer
            const alertContainer = document.getElementById('alertContainer');
            if (alertContainer) {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
                alertDiv.innerHTML = `
                    <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;

                alertContainer.appendChild(alertDiv);

                setTimeout(() => {
                    alertDiv.remove();
                }, 5000);
            } else {
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        }
    }
}

// =============================================================================
// Stock Detail 類 (Stock Detail Class)
// =============================================================================

class StockDetail {
    constructor() {
        // 狀態管理
        this.currentPage = 1;
        this.totalPages = 1;
        this.productId = null;
        this.isLoading = false;

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模塊 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.loadProductDetail();
        this.loadStockHistory();
    }

    // =============================================================================
    // 事件綁定模塊 (Event Binding Module)
    // =============================================================================
    bindEvents() {
        // 分頁功能
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadStockHistory();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.loadStockHistory();
                }
            });
        }

        // 分页按钮点击事件 - 使用 AJAX
        $(document).on('click', '.pagination-btn', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            console.log('StockDetail: Pagination button clicked, page:', page);
            this.currentPage = page;
            this.loadStockHistory();
        });
    }

    // =============================================================================
    // 數據加載模塊 (Data Loading Module)
    // =============================================================================

    /**
     * 加載產品詳情
     */
    async loadProductDetail() {
        if (!window.currentProductId) {
            console.error('No product ID available');
            return;
        }

        try {
            const response = await fetch(`/staff/stock-management?search=${window.currentProductId}`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load product detail');
            }

            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                this.renderProductDetail(data.data[0]);
            } else {
                this.showAlert('Product not found', 'error');
            }
        } catch (error) {
            console.error('Error loading product detail:', error);
            this.showAlert('Failed to load product detail', 'error');
        }
    }

    /**
     * 加載庫存歷史
     */
    async loadStockHistory() {
        if (!window.currentProductId || this.isLoading) return;

        this.isLoading = true;

        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                product_id: window.currentProductId
            });

            const response = await fetch(`${window.stockHistoryApiRoute}?${params}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                this.totalPages = data.pagination.last_page;
                this.renderStockHistory(data.data || []);
                this.renderPagination(data.pagination);
                this.updateResultsCount(data.pagination);
            } else {
                this.showAlert(data.message || 'Failed to load stock history', 'error');
                this.renderStockHistory([]);
            }
        } catch (error) {
            console.error('Error loading stock history:', error);
            this.showAlert('Failed to load stock history', 'error');
            this.renderStockHistory([]);
        } finally {
            this.isLoading = false;
        }
    }

    // =============================================================================
    // 渲染模塊 (Rendering Module)
    // =============================================================================

    /**
     * 渲染產品詳情
     * @param {Object} product 產品信息
     */
    renderProductDetail(product) {
        const currentStock = product.quantity || 0;

        // 更新頁面標題
        document.getElementById('product-detail-subtitle').textContent =
            `Stock information for ${product.name}`;

        // 更新產品圖片
        const productImage = document.getElementById('product-image');
        if (product.cover_image) {
            productImage.src = `${window.productImagePath}/${product.cover_image}`;
        } else {
            productImage.src = window.defaultProductImage;
        }

        // 更新產品信息
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('current-stock').textContent = currentStock;

        // 更新庫存狀態
        const stockElement = document.getElementById('current-stock');
        stockElement.className = `fw-bold ${currentStock > 10 ? 'text-success' : (currentStock > 0 ? 'text-warning' : 'text-danger')}`;

        // 更新產品狀態
        const statusElement = document.getElementById('product-status');
        statusElement.textContent = product.product_status;
        statusElement.className = `status-badge ${product.product_status === 'Available' ? 'available' : 'unavailable'}`;
    }

    /**
     * 渲染庫存歷史表格
     * @param {Array} movements 庫存變動記錄
     */
    renderStockHistory(movements) {
        const tbody = document.getElementById('history-table-body');

        if (movements.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <i class="bi bi-clock-history display-1 text-muted mb-3"></i>
                        <h5 class="text-muted mb-2">No Stock Movements Found</h5>
                        <p class="text-muted mb-0">No stock movement records for this product</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = movements.map(movement => `
            <tr>
                <td class="ps-4">
                    <span class="fw-medium">#${movement.id}</span>
                </td>
                <td>
                    <div class="fw-medium">${new Date(movement.date).toLocaleDateString()}</div>
                    <div class="text-muted small">${new Date(movement.date).toLocaleTimeString()}</div>
                </td>
                <td>
                    <span class="badge ${movement.movement_type === 'stock_in' ? 'bg-success' :
                                          movement.movement_type === 'stock_out' ? 'bg-danger' : 'bg-warning'}">
                        ${movement.movement_type === 'stock_in' ? 'Stock In' :
                          movement.movement_type === 'stock_out' ? 'Stock Out' : 'Stock Return'}
                    </span>
                </td>
                <td class="${movement.movement_type === 'stock_out' ? 'text-danger' : 'text-success'}">
                    <span class="fw-bold">${movement.movement_type === 'stock_out' ? '-' : '+'}${Math.abs(movement.quantity)}</span>
                </td>
                <td>
                    <span class="fw-medium">${movement.previous_stock}</span>
                </td>
                <td>
                    <span class="fw-medium">${movement.current_stock}</span>
                </td>
                <td>
                    <span class="badge bg-primary">${movement.user_name || '-'}</span>
                </td>
                <td>
                    <code class="bg-light px-2 py-1 rounded">${movement.reference_number || '-'}</code>
                </td>
            </tr>
        `).join('');
    }

    /**
     * 渲染分頁
     * @param {Object} pagination 分頁信息
     */
    renderPagination(pagination) {
        // 清除现有的分页按钮（除了 prev-page 和 next-page）
        $("#pagination li:not(#prev-page):not(#next-page)").remove();

        if (!pagination.last_page) return;

        let paginationHTML = '';
        $('#prev-page').toggleClass('disabled', pagination.current_page <= 1);

        if (pagination.last_page > 7) {
            for (let i = 1; i <= pagination.last_page; i++) {
                if (i === 1 || i === pagination.last_page || (i >= pagination.current_page - 1 && i <= pagination.current_page + 1)) {
                    paginationHTML += `<li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                        <a class="page-link pagination-btn" href="#" data-page="${i}">${i}</a>
                    </li>`;
                } else if (i === pagination.current_page - 2 || i === pagination.current_page + 2) {
                    paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
            }
        } else {
            for (let i = 1; i <= pagination.last_page; i++) {
                paginationHTML += `<li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                    <a class="page-link pagination-btn" href="#" data-page="${i}">${i}</a>
                </li>`;
            }
        }

        $('#next-page').toggleClass('disabled', pagination.current_page >= pagination.last_page);
        $('#prev-page').after(paginationHTML);
    }

    /**
     * 更新結果計數
     * @param {Object} pagination 分頁信息
     */
    updateResultsCount(pagination) {
        document.getElementById('detail-history-count').textContent = `${pagination.total} records`;
        document.getElementById('detail-showing-start').textContent = pagination.from || 0;
        document.getElementById('detail-showing-end').textContent = pagination.to || 0;
        document.getElementById('detail-total-count').textContent = pagination.total || 0;
    }

    /**
     * 顯示提示信息
     * @param {string} message 消息內容
     * @param {string} type 消息類型
     */
    showAlert(message, type = 'success') {
        if (typeof window.showAlert === 'function') {
            window.showAlert(message, type);
        } else {
            // 備用方案 - 使用 alertContainer
            const alertContainer = document.getElementById('alertContainer');
            if (alertContainer) {
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
                alertDiv.innerHTML = `
                    <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;

                alertContainer.appendChild(alertDiv);

                setTimeout(() => {
                    alertDiv.remove();
                }, 5000);
            } else {
                console.error('Alert container not found');
            }
        }
    }
}

// =============================================================================
// 全局函數 (Global Functions)
// =============================================================================

/**
 * 導出庫存歷史數據到Excel
 */
function exportStockHistory() {
    // 獲取當前篩選條件
    const movementType = document.getElementById('movement-type-filter')?.value || '';
    const productSearch = document.getElementById('product-search')?.value || '';
    const startDate = document.getElementById('start-date-filter')?.value || '';
    const endDate = document.getElementById('end-date-filter')?.value || '';

    const params = new URLSearchParams({
        movement_type: movementType,
        product_search: productSearch,
        start_date: startDate,
        end_date: endDate,
    });

    // 使用新的Excel导出路由
    const exportUrl = `/stock-history/export?${params}`;

    // 显示加载提示
    showAlert('Generating Excel file, please wait...', 'info');

    // 创建隐藏的链接来触发下载
    const link = document.createElement('a');
    link.href = exportUrl;
    link.download = '';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 延迟隐藏提示
    setTimeout(() => {
        hideAlert();
    }, 2000);
}

// =============================================================================
// 初始化模塊 (Initialization Module)
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 檢查當前頁面類型並初始化相應功能
    const dashboardCardsContainer = document.getElementById('dashboard-cards-container');
    const productsTableBody = document.getElementById('products-table-body');
    const historyTableBody = document.getElementById('history-table-body');
    const barcodeScanner = document.getElementById('barcode-scanner');
    const productDetailSubtitle = document.getElementById('product-detail-subtitle');

    if (productsTableBody) {
        // Stock Dashboard 頁面
        window.stockManagement = new StockDashboard();

    } else if (historyTableBody && !productDetailSubtitle) {
        // Stock History 頁面（不是 stock detail 頁面）
        window.stockHistory = new StockHistory();
    } else if (productDetailSubtitle) {
        // Stock Detail 頁面
        console.log('Initializing StockDetail...');
        window.stockDetail = new StockDetail();
    } else if (barcodeScanner) {
        // 檢查是哪種庫存操作頁面 - 通過 URL 路徑判斷
        const currentPath = window.location.pathname;
        console.log('Barcode scanner found, current path:', currentPath);

        if (currentPath.includes('stock-in')) {
            // Stock In 頁面
            console.log('Initializing StockIn...');
            window.stockIn = new StockIn();
        } else if (currentPath.includes('stock-out')) {
            // Stock Out 頁面
            console.log('Initializing StockOut...');
            window.stockOut = new StockOut();
        } else if (currentPath.includes('stock-return')) {
            // Stock Return 頁面
            console.log('Initializing StockReturn...');
            window.stockReturn = new StockReturn();
        } else {
            console.log('Unknown stock page type, path:', currentPath);
        }
    }
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

// 導出主要函數到全局作用域
window.viewStockHistory = function(productId, productName) {
    if (window.stockManagement) {
        window.stockManagement.viewStockHistory(productId, productName);
    }
};

window.scanBarcode = function() {
    if (window.stockIn) {
        window.stockIn.scanBarcode();
    } else if (window.stockOut) {
        window.stockOut.scanBarcode();
    } else if (window.stockReturn) {
        window.stockReturn.scanBarcode();
    }
};

window.clearAllScanned = function() {
    if (window.stockIn) {
        window.stockIn.clearAllScanned();
    } else if (window.stockOut) {
        window.stockOut.clearAllScanned();
    } else if (window.stockReturn) {
        window.stockReturn.clearAllScanned();
    }
};

window.submitStockIn = function() {
    if (window.stockIn) {
        window.stockIn.submitStockIn();
    }
};

window.submitStockOut = function() {
    if (window.stockOut) {
        window.stockOut.submitStockOut();
    }
};

window.submitStockReturn = function() {
    if (window.stockReturn) {
        window.stockReturn.submitStockReturn();
    }
};

// 添加缺失的函數
window.updateProductQuantity = function(productId, quantity) {
    if (window.stockIn) {
        window.stockIn.updateProductQuantity(productId, quantity);
    } else if (window.stockOut) {
        window.stockOut.updateProductQuantity(productId, quantity);
    } else if (window.stockReturn) {
        window.stockReturn.updateProductQuantity(productId, quantity);
    }
};

window.removeProductFromScanned = function(productId) {
    if (window.stockIn) {
        window.stockIn.removeProductFromScanned(productId);
    } else if (window.stockOut) {
        window.stockOut.removeProductFromScanned(productId);
    } else if (window.stockReturn) {
        window.stockReturn.removeProductFromScanned(productId);
    }
};
