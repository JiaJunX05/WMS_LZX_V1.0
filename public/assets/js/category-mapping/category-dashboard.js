/**
 * 分类管理仪表板 JavaScript
 *
 * 功能：
 * - 分类数据管理：搜索、筛选、分页
 * - 分类操作：编辑、删除、状态管理
 * - 事件处理：表单提交、模态框管理
 */

class CategoryDashboard {
    constructor() {
        // 状态管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.categoryFilter = '';
        this.statusFilter = '';

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模块 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.fetchCategories();
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

        // 筛选功能
        $('#category-filter').on('change', (e) => {
            this.categoryFilter = $(e.target).val();
            this.handleFilter();
        });

        $('#status-filter').on('change', (e) => {
            this.statusFilter = $(e.target).val();
            this.handleFilter();
        });

        // 清除筛选
        $('#clear-filters').on('click', () => {
            this.clearFilters();
        });

        // 分页功能
        $('#pagination').on('click', '.pagination-btn', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            this.fetchCategories(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchCategories(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchCategories(this.currentPage + 1);
            }
        });
    }

    // =============================================================================
    // 数据请求模块 (Data Request Module)
    // =============================================================================

    /**
     * 获取搜索参数
     * @param {number} page 页码
     * @returns {Object} 搜索参数对象
     */
    getSearchParams(page = 1) {
        return {
            page: page,
            search: this.searchTerm,
            category_id: this.categoryFilter,
            category_status: this.statusFilter,
            perPage: 10
        };
    }

    /**
     * 获取分类数据
     * @param {number} page 页码
     */
    fetchCategories(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.categoryManagementRoute;

        $.get(apiRoute, params)
            .done((response) => {
                if (response.data && response.data.length > 0) {
                    this.renderCategories(response.data);
                    this.updatePaginationInfo(response);
                } else {
                    this.showNoResults();
                }
                this.updateStatistics(response);
                this.updateResultsCount(response);
                this.generatePagination(response);
            })
            .fail((xhr, status, error) => {
                showAlert('Failed to load categories, please try again', 'danger');
            });
    }

    /**
     * 处理搜索
     */
    handleSearch() {
        this.fetchCategories(1);
    }

    /**
     * 处理筛选
     */
    handleFilter() {
        this.fetchCategories(1);
    }

    /**
     * 清除所有筛选条件
     */
    clearFilters() {
        this.categoryFilter = '';
        this.statusFilter = '';
        this.searchTerm = '';

        $('#category-filter').val('');
        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchCategories(1);
    }

    /**
     * 更新统计数据
     * @param {Object} response API响应数据
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-categories').text(total);

        // 计算活跃和非活跃分类数量
        if (response.data) {
            const activeCount = response.data.filter(cat => cat.category_status === 'Available').length;
            const inactiveCount = response.data.filter(cat => cat.category_status === 'Unavailable').length;
            const withImageCount = response.data.filter(cat => cat.category_image).length;

            $('#active-categories').text(activeCount);
            $('#inactive-categories').text(inactiveCount);
            $('#categories-with-image').text(withImageCount);
        }
    }

    /**
     * 更新结果计数显示
     * @param {Object} response API响应数据
     */
    updateResultsCount(response) {
        const total = response.pagination?.total || 0;
        $('#results-count').text(`${total} records`);
    }

    // =============================================================================
    // 渲染模块 (Rendering Module)
    // =============================================================================

    /**
     * 渲染分类列表
     * @param {Array} categories 分类数据数组
     */
    renderCategories(categories) {
        const $tableBody = $('#table-body');
        const html = categories.map(category => this.createCategoryRow(category)).join('');
        $tableBody.html(html);
    }

    createCategoryRow(category) {
        const statusMenuItem = category.category_status === 'Unavailable'
            ? `<a class="dropdown-item" href="javascript:void(0)" onclick="categoryDashboard.setAvailable(${category.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate Category
               </a>`
            : `<a class="dropdown-item" href="javascript:void(0)" onclick="categoryDashboard.setUnavailable(${category.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate Category
               </a>`;

        const actionButtons = `
            <button class="btn-action" title="Edit" onclick="categoryDashboard.editCategory(${category.id})">
                <i class="bi bi-pencil"></i>
            </button>
            <div class="btn-group dropend d-inline">
                <button class="btn-action dropdown-toggle" title="More" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu">
                    <li>
                        ${statusMenuItem}
                    </li>
                    <li>
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="categoryDashboard.deleteCategory(${category.id})">
                            <i class="bi bi-trash me-2"></i> Delete Category
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4"><span class="text-muted">#${category.id}</span></td>
                <td>
                    ${category.category_image ? `
                        <img src="/assets/images/${category.category_image}" alt="Category Image"
                             class="preview-image"
                             onclick="previewImage('/assets/images/${category.category_image}')">
                    ` : `
                        <div class="no-image">No Image</div>
                    `}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <h6 class="mb-0 fw-bold">${category.category_name}</h6>
                    </div>
                </td>
                <td><span class="status-badge ${this.getStatusClass(category.category_status)}">${category.category_status}</span></td>
                <td class="text-end pe-4"><div class="action-buttons">${actionButtons}</div></td>
            </tr>
        `;
    }

    getStatusClass(status) {
        const statusMap = { 'Available': 'available', 'Unavailable': 'unavailable' };
        return statusMap[status] || 'default';
    }

    showNoResults() {
        $('#table-body').html(`
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-search fs-1 d-block mb-3"></i>
                        <h5>No categories found</h5>
                        <p>Please try adjusting your search criteria</p>
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
    // 分类操作模块 (Category Operations Module)
    // =============================================================================

    /**
     * 编辑分类
     * @param {number} categoryId 分类ID
     */
    editCategory(categoryId) {
        const url = window.editCategoryUrl.replace(':id', categoryId);
        window.location.href = url;
    }

    /**
     * 删除分类
     * @param {number} categoryId 分类ID
     */
    deleteCategory(categoryId) {
        if (!confirm('Are you sure you want to delete this category?')) {
            return;
        }

        const url = window.deleteCategoryUrl.replace(':id', categoryId);

        // 显示加载状态
        showAlert('Deleting category...', 'info');

        fetch(url, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showAlert(data.message || 'Category deleted successfully!', 'success');
                // 重新加载数据
                this.fetchCategories(this.currentPage);
            } else {
                showAlert(data.message || 'Failed to delete category', 'danger');
            }
        })
        .catch(error => {
            console.error('Error deleting category:', error);
            showAlert('Error deleting category: ' + error.message, 'danger');
        });
    }

    /**
     * 激活分类
     * @param {number} categoryId 分类ID
     */
    setAvailable(categoryId) {
        if (!confirm('Are you sure you want to activate this category?')) {
            return;
        }

        const url = window.availableCategoryUrl.replace(':id', categoryId);

        // 显示加载状态
        showAlert('Activating category...', 'info');

        fetch(url, {
            method: 'PATCH',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showAlert(data.message || 'Category activated successfully!', 'success');
                // 重新加载数据
                this.fetchCategories(this.currentPage);
            } else {
                showAlert(data.message || 'Failed to activate category', 'danger');
            }
        })
        .catch(error => {
            console.error('Error activating category:', error);
            showAlert('Error activating category: ' + error.message, 'danger');
        });
    }

    /**
     * 停用分类
     * @param {number} categoryId 分类ID
     */
    setUnavailable(categoryId) {
        if (!confirm('Are you sure you want to deactivate this category?')) {
            return;
        }

        const url = window.unavailableCategoryUrl.replace(':id', categoryId);

        // 显示加载状态
        showAlert('Deactivating category...', 'info');

        fetch(url, {
            method: 'PATCH',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showAlert(data.message || 'Category deactivated successfully!', 'success');
                // 重新加载数据
                this.fetchCategories(this.currentPage);
            } else {
                showAlert(data.message || 'Failed to deactivate category', 'danger');
            }
        })
        .catch(error => {
            console.error('Error deactivating category:', error);
            showAlert('Error deactivating category: ' + error.message, 'danger');
        });
    }
}

// ========================================
// 图片预览功能 (Image Preview Functions)
// ========================================

// 图片预览函数 - 用于模态框显示
function previewImage(src) {
    document.getElementById('previewImage').src = src;
    new bootstrap.Modal(document.getElementById('imagePreviewModal')).show();
}

// =============================================================================
// 全局实例初始化 (Global Instance Initialization)
// =============================================================================
let categoryDashboard;
$(document).ready(function() {
    // 如果是dashboard页面（有table-body元素）
    if ($("#table-body").length > 0) {
        categoryDashboard = new CategoryDashboard();
    }
});

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用

// 使用原生JavaScript的DOMContentLoaded作为备用
document.addEventListener('DOMContentLoaded', function() {
    // 如果jQuery没有加载，使用原生JavaScript初始化
    if (typeof $ === 'undefined') {
        // 这里可以添加原生JavaScript的初始化代码
    }
});
