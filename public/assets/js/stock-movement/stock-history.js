/**
 * Stock History JavaScript 類
 * 處理庫存歷史報告頁面的功能
 */

class StockHistory {
    constructor() {
        // 狀態管理
        this.currentPage = 1;
        this.movementType = '';
        this.productSearch = '';
        this.startDate = '';
        this.endDate = '';
        this.isLoading = false;

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模塊 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.loadStockHistory();
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

        // 導出按鈕
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
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
            this.showAlert('Failed to load stock history. Please try again.', 'error');
            this.renderStockHistory([]); // 清空表格
        } finally {
            this.isLoading = false;
        }
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
        const paginationEl = document.getElementById('pagination');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        // 更新上一頁按鈕
        if (pagination.current_page > 1) {
            prevBtn.classList.remove('disabled');
            prevBtn.querySelector('a').onclick = () => this.loadStockHistory(pagination.current_page - 1);
        } else {
            prevBtn.classList.add('disabled');
            prevBtn.querySelector('a').onclick = null;
        }

        // 更新下一頁按鈕
        if (pagination.current_page < pagination.last_page) {
            nextBtn.classList.remove('disabled');
            nextBtn.querySelector('a').onclick = () => this.loadStockHistory(pagination.current_page + 1);
        } else {
            nextBtn.classList.add('disabled');
            nextBtn.querySelector('a').onclick = null;
        }

        // 生成頁碼
        let pageNumbers = '';
        const startPage = Math.max(1, pagination.current_page - 2);
        const endPage = Math.min(pagination.last_page, pagination.current_page + 2);

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers += `
                <li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="window.stockHistory.loadStockHistory(${i})">${i}</a>
                </li>
            `;
        }

        // 插入頁碼到分頁器中
        const prevPageHtml = prevBtn.outerHTML;
        const nextPageHtml = nextBtn.outerHTML;
        paginationEl.innerHTML = prevPageHtml + pageNumbers + nextPageHtml;
    }

    /**
     * 更新結果計數
     * @param {Object} pagination 分頁信息
     */
    updateResultsCount(pagination) {
        document.getElementById('results-count').textContent = `${pagination.total} records`;
        document.getElementById('showing-start').textContent = pagination.from || 0;
        document.getElementById('showing-end').textContent = pagination.to || 0;
        document.getElementById('total-count').textContent = pagination.total || 0;
    }

    // =============================================================================
    // 導出模塊 (Export Module)
    // =============================================================================

    /**
     * 導出數據
     */
    exportData() {
        const params = new URLSearchParams({
            movement_type: this.movementType,
            product_search: this.productSearch,
            start_date: this.startDate,
            end_date: this.endDate,
            export: 'csv'
        });

        const exportUrl = `${window.stockHistoryApiRoute}?${params}`;
        window.open(exportUrl, '_blank');
    }

    // =============================================================================
    // 工具函數模塊 (Utility Functions Module)
    // =============================================================================

    /**
     * 顯示提示信息
     * @param {string} message 消息內容
     * @param {string} type 消息類型
     */
    showAlert(message, type = 'success') {
        if (typeof window.showAlert === 'function') {
            window.showAlert(message, type);
        } else {
            // 備用方案
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
            alertDiv.innerHTML = `
                <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;

            const container = document.getElementById('alertContainer');
            container.appendChild(alertDiv);

            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.stockHistory = new StockHistory();
});
