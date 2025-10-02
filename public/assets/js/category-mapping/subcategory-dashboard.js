/**
 * 子分类管理仪表板 JavaScript
 *
 * 功能：
 * - 子分类数据管理：搜索、筛选、分页
 * - 子分类操作：编辑、删除、状态管理
 * - 事件处理：表单提交、模态框管理
 */

class SubcategoryDashboard {
    constructor() {
        // 状态管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.subcategoryFilter = '';
        this.statusFilter = '';

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模块 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.fetchSubcategories();
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
        $('#subcategory-filter').on('change', (e) => {
            this.subcategoryFilter = $(e.target).val();
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
            this.fetchSubcategories(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchSubcategories(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchSubcategories(this.currentPage + 1);
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
            subcategory_id: this.subcategoryFilter,
            subcategory_status: this.statusFilter,
            perPage: 10
        };
    }

    /**
     * 获取子分类数据
     * @param {number} page 页码
     */
    fetchSubcategories(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.subcategoryManagementRoute;

        $.get(apiRoute, params)
            .done((response) => {
                if (response.data && response.data.length > 0) {
                    this.renderSubcategories(response.data);
                    this.updatePaginationInfo(response);
                } else {
                    this.showNoResults();
                }
                this.updateStatistics(response);
                this.updateResultsCount(response);
                this.generatePagination(response);
            })
            .fail((xhr, status, error) => {
                showAlert('Failed to load subcategories, please try again', 'danger');
            });
    }

    /**
     * 处理搜索
     */
    handleSearch() {
        this.fetchSubcategories(1);
    }

    /**
     * 处理筛选
     */
    handleFilter() {
        this.fetchSubcategories(1);
    }

    /**
     * 清除所有筛选条件
     */
    clearFilters() {
        this.subcategoryFilter = '';
        this.statusFilter = '';
        this.searchTerm = '';

        $('#subcategory-filter').val('');
        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchSubcategories(1);
    }

    /**
     * 更新统计数据
     * @param {Object} response API响应数据
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-subcategories').text(total);

        // 计算活跃和非活跃子分类数量
        if (response.data) {
            const activeCount = response.data.filter(sub => sub.subcategory_status === 'Available').length;
            const inactiveCount = response.data.filter(sub => sub.subcategory_status === 'Unavailable').length;
            const withImageCount = response.data.filter(sub => sub.subcategory_image).length;

            $('#active-subcategories').text(activeCount);
            $('#inactive-subcategories').text(inactiveCount);
            $('#subcategories-with-image').text(withImageCount);
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
     * 渲染子分类列表
     * @param {Array} subcategories 子分类数据数组
     */
    renderSubcategories(subcategories) {
        const $tableBody = $('#table-body');
        const html = subcategories.map(subcategory => this.createSubcategoryRow(subcategory)).join('');
        $tableBody.html(html);
    }

    createSubcategoryRow(subcategory) {
        const statusMenuItem = subcategory.subcategory_status === 'Unavailable'
            ? `<a class="dropdown-item" href="javascript:void(0)" onclick="subcategoryDashboard.setAvailable(${subcategory.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate Subcategory
               </a>`
            : `<a class="dropdown-item" href="javascript:void(0)" onclick="subcategoryDashboard.setUnavailable(${subcategory.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate Subcategory
               </a>`;

        const actionButtons = `
            <button class="btn-action" title="Edit" onclick="subcategoryDashboard.editSubcategory(${subcategory.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="subcategoryDashboard.deleteSubcategory(${subcategory.id})">
                            <i class="bi bi-trash me-2"></i> Delete Subcategory
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4"><span class="text-muted">#${subcategory.id}</span></td>
                <td>
                    ${subcategory.subcategory_image ? `
                        <img src="/assets/images/${subcategory.subcategory_image}" alt="Subcategory Image"
                             class="preview-image"
                             onclick="previewImage('/assets/images/${subcategory.subcategory_image}')">
                    ` : `
                        <div class="no-image">No Image</div>
                    `}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <h6 class="mb-0 fw-bold">${subcategory.subcategory_name}</h6>
                    </div>
                </td>
                <td><span class="status-badge ${this.getStatusClass(subcategory.subcategory_status)}">${subcategory.subcategory_status}</span></td>
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
                        <h5>No subcategories found</h5>
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
    // 子分类操作模块 (Subcategory Operations Module)
    // =============================================================================

    /**
     * 编辑子分类
     * @param {number} subcategoryId 子分类ID
     */
    editSubcategory(subcategoryId) {
        const url = window.editSubcategoryUrl.replace(':id', subcategoryId);
        window.location.href = url;
    }

    /**
     * 删除子分类
     * @param {number} subcategoryId 子分类ID
     */
    deleteSubcategory(subcategoryId) {
        if (!confirm('Are you sure you want to delete this subcategory?')) {
            return;
        }

        const url = window.deleteSubcategoryUrl.replace(':id', subcategoryId);

        // 显示加载状态
        showAlert('Deleting subcategory...', 'info');

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
                showAlert(data.message || 'Subcategory deleted successfully!', 'success');
                // 重新加载数据
                this.fetchSubcategories(this.currentPage);
            } else {
                showAlert(data.message || 'Failed to delete subcategory', 'danger');
            }
        })
        .catch(error => {
            console.error('Error deleting subcategory:', error);
            showAlert('Error deleting subcategory: ' + error.message, 'danger');
        });
    }

    /**
     * 激活子分类
     * @param {number} subcategoryId 子分类ID
     */
    setAvailable(subcategoryId) {
        if (!confirm('Are you sure you want to activate this subcategory?')) {
            return;
        }

        const url = window.availableSubcategoryUrl.replace(':id', subcategoryId);

        // 显示加载状态
        showAlert('Activating subcategory...', 'info');

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
                showAlert(data.message || 'Subcategory activated successfully!', 'success');
                // 重新加载数据
                this.fetchSubcategories(this.currentPage);
            } else {
                showAlert(data.message || 'Failed to activate subcategory', 'danger');
            }
        })
        .catch(error => {
            console.error('Error activating subcategory:', error);
            showAlert('Error activating subcategory: ' + error.message, 'danger');
        });
    }

    /**
     * 停用子分类
     * @param {number} subcategoryId 子分类ID
     */
    setUnavailable(subcategoryId) {
        if (!confirm('Are you sure you want to deactivate this subcategory?')) {
            return;
        }

        const url = window.unavailableSubcategoryUrl.replace(':id', subcategoryId);

        // 显示加载状态
        showAlert('Deactivating subcategory...', 'info');

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
                showAlert(data.message || 'Subcategory deactivated successfully!', 'success');
                // 重新加载数据
                this.fetchSubcategories(this.currentPage);
            } else {
                showAlert(data.message || 'Failed to deactivate subcategory', 'danger');
            }
        })
        .catch(error => {
            console.error('Error deactivating subcategory:', error);
            showAlert('Error deactivating subcategory: ' + error.message, 'danger');
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
let subcategoryDashboard;
$(document).ready(function() {
    // 如果是dashboard页面（有table-body元素）
    if ($("#table-body").length > 0) {
        subcategoryDashboard = new SubcategoryDashboard();
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
