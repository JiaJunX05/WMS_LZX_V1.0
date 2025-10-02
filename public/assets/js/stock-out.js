/**
 * Stock Out JavaScript 类
 *
 * 功能模块：
 * - 产品数据管理：搜索、分页
 * - 库存出库操作
 * - 事件处理：表单提交、产品选择
 *
 * @author WMS Team
 * @version 1.0.0
 */
class StockOutManagement {
    constructor() {
        // 状态管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.selectedProduct = null;

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模块 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.fetchProducts();
    }

    // =============================================================================
    // 事件绑定模块 (Event Binding Module)
    // =============================================================================
    bindEvents() {
        // 搜索功能
        $('#search-input').on('keyup', (e) => {
            this.searchTerm = $(e.target).val();
            this.handleSearch();
        });

        // 清除搜索
        $('#clear-search').on('click', () => {
            $('#search-input').val('');
            this.searchTerm = '';
            this.fetchProducts(1);
        });

        // 分页功能
        $('#pagination').on('click', '.pagination-btn', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            this.fetchProducts(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchProducts(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchProducts(this.currentPage + 1);
            }
        });
    }

    // =============================================================================
    // 搜索模块 (Search Module)
    // =============================================================================
    handleSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.fetchProducts(1);
        }, 300);
    }

    getSearchParams(page = 1) {
        return {
            page: page,
            search: this.searchTerm
        };
    }

    // =============================================================================
    // 数据获取模块 (Data Fetching Module)
    // =============================================================================
    /**
     * 获取产品数据
     * @param {number} page 页码
     */
    fetchProducts(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.stockOutPageRoute;

        $.get(apiRoute, params)
            .done((response) => {
                this.renderProducts(response.data);
                this.updatePaginationInfo(response);
                this.generatePagination(response);
                this.updateResultsCount(response);
            })
            .fail((xhr) => {
                console.error('Failed to fetch products:', xhr);
                this.showError('Failed to load products. Please try again.');
            });
    }

    // =============================================================================
    // 统计模块 (Statistics Module)
    // =============================================================================
    /**
     * 更新结果计数
     * @param {Object} response API响应数据
     */
    updateResultsCount(response) {
        const total = response.pagination?.total || 0;
        $('#results-count').text(`${total} available products`);
    }

    // =============================================================================
    // 渲染模块 (Rendering Module)
    // =============================================================================
    /**
     * 渲染产品列表
     * @param {Array} products 产品数组
     */
    renderProducts(products) {
        if (!products || products.length === 0) {
            this.renderEmptyState();
            return;
        }

        let html = '';
        products.forEach((product, index) => {
            const variant = product.variants?.[0];
            const attributeVariant = variant?.attribute_variant;
            const brand = attributeVariant?.brand;

            html += `
                <tr data-product-id="${product.id}" class="product-row">
                    <td class="ps-4">
                        <span class="fw-medium">#${product.id}</span>
                    </td>
                    <td>
                        ${product.cover_image
                            ? `<img src="/assets/images/products/${product.cover_image}"
                                 alt="Product Image" class="preview-image"
                                 style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">`
                            : `<div class="no-image" style="width: 50px; height: 50px; border-radius: 8px;">
                                 <i class="bi bi-image"></i>
                               </div>`
                        }
                    </td>
                    <td>
                        <div class="fw-medium">${product.name}</div>
                        <div class="text-muted small">${product.category?.category_name || 'N/A'}</div>
                    </td>
                    <td>
                        <code class="bg-light px-2 py-1 rounded">${variant?.sku_code || 'N/A'}</code>
                    </td>
                    <td>
                        <span class="badge bg-primary">${brand?.brand_name || 'N/A'}</span>
                    </td>
                    <td>
                        <span class="fw-bold ${product.quantity > 10 ? 'text-success' : (product.quantity > 0 ? 'text-warning' : 'text-danger')}">
                            ${product.quantity}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${product.product_status === 'Available' ? 'available' : 'unavailable'}">
                            ${product.product_status}
                        </span>
                    </td>
                    <td class="text-end pe-4">
                        <button class="btn btn-danger btn-sm" onclick="selectProductForStockOut(${product.id})" title="Select for Stock Out">
                            <i class="bi bi-dash-circle me-1"></i>
                            Select
                        </button>
                    </td>
                </tr>
            `;
        });

        $('#products-table-body').html(html);
    }

    /**
     * 渲染空状态
     */
    renderEmptyState() {
        $('#products-table-body').html(`
            <tr>
                <td colspan="8" class="text-center py-4">
                    <div class="empty-state">
                        <i class="bi bi-inbox display-4 text-muted mb-3"></i>
                        <h6 class="text-muted">No products with stock found</h6>
                        <p class="text-muted small mb-0">Try adjusting your search criteria</p>
                    </div>
                </td>
            </tr>
        `);
        this.updatePaginationInfo({ pagination: { total: 0, from: 0, to: 0 } });
    }

    // =============================================================================
    // 分页模块 (Pagination Module)
    // =============================================================================
    updatePaginationInfo(response) {
        const pagination = response.pagination || {};
        $('#showing-start').text(pagination.from || 0);
        $('#showing-end').text(pagination.to || 0);
        $('#total-count').text(pagination.total || 0);
    }

    generatePagination(data) {
        $("#pagination li:not(#prev-page):not(#next-page)").remove();
        const pagination = data.pagination || {};
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

    // =============================================================================
    // 表单管理模块 (Form Management Module)
    // =============================================================================

    /**
     * 显示表单时隐藏分页
     */
    hidePageWhenFormShown() {
        const paginationSection = document.getElementById('pagination-section');
        if (paginationSection) {
            paginationSection.style.display = 'none';
        }
    }

    /**
     * 隐藏表单时恢复分页
     */
    showPageWhenFormHidden() {
        const paginationSection = document.getElementById('pagination-section');
        if (paginationSection) {
            paginationSection.style.display = 'flex';
        }
    }

    // =============================================================================
    // 错误处理模块 (Error Handling Module)
    // =============================================================================
    showError(message) {
        console.error(message);
        // 这里可以添加用户友好的错误提示
    }
}

// 初始化
$(document).ready(() => {
    window.stockOutManagement = new StockOutManagement();
});
