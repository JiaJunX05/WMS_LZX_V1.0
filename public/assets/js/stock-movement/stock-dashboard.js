/**
 * Stock Management JavaScript 类
 *
 * 功能模块：
 * - 产品数据管理：搜索、筛选、分页
 * - 库存操作：历史查看、退货处理
 * - 事件处理：表单提交、模态框管理
 *
 * @author WMS Team
 * @version 1.0.0
 */
class StockManagement {
    constructor() {
        // 状态管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.currentProductId = null;
        this.currentProductStock = 0;
        this.totalPages = 1;
        this.totalItems = 0;

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模块 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.loadProducts();
    }

    // =============================================================================
    // 事件绑定模块 (Event Binding Module)
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
    // 數據加載模块 (Data Loading Module)
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
            const currentStock = product.quantity || 0; // 使用 Product 的 quantity 字段

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
        document.getElementById('showing-start').textContent = pagination.from || 0;
        document.getElementById('showing-end').textContent = pagination.to || 0;
        document.getElementById('total-count').textContent = pagination.total || 0;

        // 更新頁碼
        const pageNumber = document.getElementById('page-number');
        if (pageNumber) {
            pageNumber.textContent = pagination.current_page;
        }

        // 更新分頁按鈕狀態
        this.updatePaginationButtons();
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
    updatePaginationButtons() {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            if (this.currentPage <= 1) {
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
            }
        }

        if (nextBtn) {
            if (this.currentPage >= this.totalPages) {
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.classList.remove('disabled');
            }
        }
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

    // =============================================================================
    // 库存历史模块 (Stock History Module)
    // =============================================================================

    /**
     * 查看库存历史
     * @param {number} productId 产品ID
     * @param {string} productName 产品名称
     */
    viewStockHistory(productId, productName) {
        this.currentProductId = productId;

        document.getElementById('history-product-name').textContent = productName;
        document.getElementById('history-current-stock').textContent = this.getCurrentStockForProduct(productId);

        this.loadStockHistory(productId);

        const modal = new bootstrap.Modal(document.getElementById('stockHistoryModal'));
        modal.show();
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

    /**
     * 加载库存历史
     * @param {number} productId 产品ID
     * @param {number} page 页码
     */
    loadStockHistory(productId, page = 1) {
        const movementType = document.getElementById('history-movement-type').value;
        const startDate = document.getElementById('history-start-date').value;
        const endDate = document.getElementById('history-end-date').value;

        const params = new URLSearchParams({
            page: page,
            movement_type: movementType,
            start_date: startDate,
            end_date: endDate
        });

        fetch(window.stockHistoryRoute.replace(':id', productId) + '?' + params, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.renderStockHistory(data.data);
                this.renderHistoryPagination(data.pagination);
            } else {
                this.showAlert(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error loading stock history:', error);
            this.showAlert('Failed to load stock history', 'error');
        });
    }

    /**
     * 渲染库存历史
     * @param {Array} movements 库存变动记录
     */
    renderStockHistory(movements) {
        const tbody = document.getElementById('history-table-body');
        tbody.innerHTML = movements.map(movement => `
            <tr>
                <td>${new Date(movement.movement_date).toLocaleString()}</td>
                <td>
                    <span class="badge ${movement.movement_type === 'stock_in' ? 'bg-success' :
                                          movement.movement_type === 'stock_out' ? 'bg-danger' : 'bg-warning'}">
                        ${movement.movement_type === 'stock_in' ? 'In' :
                          movement.movement_type === 'stock_out' ? 'Out' : 'Return'}
                    </span>
                </td>
                <td class="${movement.quantity > 0 ? 'text-success' : 'text-danger'}">
                    ${movement.quantity > 0 ? '+' : ''}${movement.quantity}
                </td>
                <td>${movement.previous_stock}</td>
                <td>${movement.current_stock}</td>
                <td><span class="badge bg-primary">${movement.user_name || '-'}</span></td>
                <td>${movement.reference_number || '-'}</td>
            </tr>
        `).join('');
    }

    /**
     * 渲染历史分页
     * @param {Object} pagination 分页信息
     */
    renderHistoryPagination(pagination) {
        const paginationEl = document.getElementById('history-pagination');
        let html = '';

        for (let i = 1; i <= pagination.last_page; i++) {
            html += `
                <li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="window.stockManagement.loadStockHistory(${this.currentProductId}, ${i})">${i}</a>
                </li>
            `;
        }

        paginationEl.innerHTML = html;
    }

    // =============================================================================
    // 退货处理模块 (Stock Return Module)
    // =============================================================================

    /**
     * 打开库存退货模态框
     * @param {number|null} productId 产品ID
     * @param {string|null} productName 产品名称
     * @param {number|null} currentStock 当前库存
     */

    // =============================================================================
    // 模态框管理模块 (Modal Management Module)
    // =============================================================================

    /**
     * 处理模态框显示时隐藏分页
     */
    handleModalShow() {
        const paginationSection = document.querySelector('.d-flex.justify-content-between.align-items-center.mt-4');
        if (paginationSection) {
            paginationSection.style.display = 'none';
        }
    }

    /**
     * 处理模态框隐藏时恢复分页
     */
    handleModalHide() {
        const paginationSection = document.querySelector('.d-flex.justify-content-between.align-items-center.mt-4');
        if (paginationSection) {
            paginationSection.style.display = 'flex';
        }
    }

    // =============================================================================
    // 分頁統計模塊 (Pagination Statistics Module)
    // =============================================================================

    /**
     * 更新分頁統計信息
     */
    updatePaginationStats() {
        const rows = document.querySelectorAll('.product-row');
        const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');

        const totalCount = rows.length;
        const visibleCount = visibleRows.length;

        document.getElementById('showing-start').textContent = visibleCount > 0 ? '1' : '0';
        document.getElementById('showing-end').textContent = visibleCount;
        document.getElementById('total-count').textContent = totalCount;

        // 更新分頁按鈕狀態
        this.updatePaginationButtons(totalCount);
    }

    /**
     * 更新分頁按鈕狀態
     */
    updatePaginationButtons(totalCount) {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const currentPageSpan = document.getElementById('page-number');

        // 對於靜態表格，總是顯示第1頁
        if (currentPageSpan) {
            currentPageSpan.textContent = '1';
        }

        // 禁用上一頁按鈕（因為總是第1頁）
        if (prevBtn) {
            prevBtn.classList.add('disabled');
        }

        // 禁用下一頁按鈕（因為沒有分頁）
        if (nextBtn) {
            nextBtn.classList.add('disabled');
        }
    }

    // =============================================================================
    // 工具函数模块 (Utility Functions Module)
    // =============================================================================

    /**
     * 显示提示信息
     * @param {string} message 消息内容
     * @param {string} type 消息类型
     */
    showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('.container-fluid');
        container.insertBefore(alertDiv, container.firstChild);

        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    /**
     * 显示错误信息
     * @param {string} message 错误消息
     */
    showError(message) {
        console.error(message);
        this.showAlert(message, 'error');
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.stockManagement = new StockManagement();

    // 监听模态框事件
    const modals = ['stockHistoryModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('show.bs.modal', () => {
                if (window.stockManagement) {
                    window.stockManagement.handleModalShow();
                }
            });

            modal.addEventListener('hide.bs.modal', () => {
                if (window.stockManagement) {
                    window.stockManagement.handleModalHide();
                }
            });
        }
    });
});

// 全局函数 - 供HTML调用
function viewStockHistory(productId, productName) {
    if (window.stockManagement) {
        window.stockManagement.viewStockHistory(productId, productName);
    }
}

