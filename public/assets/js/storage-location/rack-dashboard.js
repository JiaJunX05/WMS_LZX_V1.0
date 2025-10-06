/**
 * 机架管理Dashboard JavaScript 类
 *
 * 功能模块：
 * - 机架数据管理：搜索、筛选、分页
 * - 机架操作：编辑、删除、状态管理
 * - 事件处理：表单提交
 *
 * @author WMS Team
 * @version 1.0.0
 */
class RackDashboard {
    constructor() {
        // 状态管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.statusFilter = '';

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模块 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.fetchRacks();
    }

    // =============================================================================
    // 事件绑定模块 (Event Binding Module)
    // =============================================================================
    bindEvents() {
        // 搜索功能 - 添加防抖
        let searchTimeout;
        $('#search-input').on('keyup', (e) => {
            clearTimeout(searchTimeout);
            this.searchTerm = $(e.target).val();
            searchTimeout = setTimeout(() => {
                this.handleSearch();
            }, 300);
        });

        // 筛选功能
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
            this.fetchRacks(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchRacks(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchRacks(this.currentPage + 1);
            }
        });

        // Bootstrap dropdown 自动处理，无需自定义定位
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
            status_filter: this.statusFilter,
            perPage: 10
        };
    }

    /**
     * 获取机架数据
     * @param {number} page 页码
     */
    fetchRacks(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.rackManagementRoute;

        console.log('Fetching racks with params:', params);

        $.get(apiRoute, params)
            .done((response) => {
                console.log('Racks response:', response);
                if (response.data && response.data.length > 0) {
                    this.renderRacks(response.data);
                    this.updatePaginationInfo(response);
                } else {
                    this.showNoResults();
                }
                this.updateStatistics(response);
                this.updateResultsCount(response);
                this.generatePagination(response);
            })
            .fail((xhr, status, error) => {
                console.error('Failed to fetch racks:', error);
                this.showAlert('Failed to load racks, please try again', 'danger');
            });
    }

    /**
     * 处理搜索
     */
    handleSearch() {
        console.log('Handling search with term:', this.searchTerm);
        this.fetchRacks(1);
    }

    /**
     * 处理筛选
     */
    handleFilter() {
        console.log('Handling filter with status:', this.statusFilter);
        this.fetchRacks(1);
    }

    /**
     * 清除所有筛选条件
     */
    clearFilters() {
        this.statusFilter = '';
        this.searchTerm = '';

        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchRacks(1);
    }

    /**
     * 更新统计数据
     * @param {Object} response API响应数据
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-racks').text(total);

        // 计算活跃和非活跃货架数量
        if (response.data) {
            const activeCount = response.data.filter(rack => rack.rack_status === 'Available').length;
            const inactiveCount = response.data.filter(rack => rack.rack_status === 'Unavailable').length;
            const withImageCount = response.data.filter(rack => rack.rack_image).length;

            $('#active-racks').text(activeCount);
            $('#inactive-racks').text(inactiveCount);
            $('#racks-with-image').text(withImageCount);
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
     * 渲染机架列表
     * @param {Array} racks 机架数据数组
     */
    renderRacks(racks) {
        const $tableBody = $('#table-body');
        const html = racks.map(rack => this.createRackRow(rack)).join('');
        $tableBody.html(html);
    }

    createRackRow(rack) {
        const statusMenuItem = rack.rack_status === 'Unavailable'
            ? `<a class="dropdown-item" href="javascript:void(0)" onclick="rackDashboard.setAvailable(${rack.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate Rack
               </a>`
            : `<a class="dropdown-item" href="javascript:void(0)" onclick="rackDashboard.setUnavailable(${rack.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate Rack
               </a>`;

        const actionButtons = `
            <button class="btn-action" title="Edit" onclick="rackDashboard.editRack(${rack.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="rackDashboard.deleteRack(${rack.id})">
                            <i class="bi bi-trash me-2"></i> Delete Rack
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4"><span class="text-muted">#${rack.id}</span></td>
                <td>
                    ${rack.rack_image ? `
                        <img src="/assets/images/${rack.rack_image}" alt="Rack Image"
                             class="preview-image"
                             onclick="previewImage('/assets/images/${rack.rack_image}')">
                    ` : `
                        <div class="no-image">No Image</div>
                    `}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <h6 class="mb-0 fw-bold">${rack.rack_number}</h6>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="fw-medium">${rack.capacity}</span>
                    </div>
                </td>
                <td><span class="status-badge ${this.getStatusClass(rack.rack_status)}">${rack.rack_status}</span></td>
                <td class="text-end pe-4"><div class="action-buttons">${actionButtons}</div></td>
            </tr>
        `;
    }

    getStatusClass(status) {
        // 使用 rack-common.js 中的狀態映射邏輯
        const statusMap = { 'Available': 'available', 'Unavailable': 'unavailable' };
        return statusMap[status] || 'default';
    }

    showNoResults() {
        $('#table-body').html(`
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-search fs-1 d-block mb-3"></i>
                        <h5>No racks found</h5>
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
    // 机架操作模块 (Rack Operations Module)
    // =============================================================================

    /**
     * 编辑机架
     * @param {number} rackId 机架ID
     */
    editRack(rackId) {
        const url = window.editRackUrl.replace(':id', rackId);
        window.location.href = url;
    }

    /**
     * 删除机架
     * @param {number} rackId 机架ID
     */
    deleteRack(rackId) {
        this.submitForm(
            window.deleteRackUrl.replace(':id', rackId),
            'DELETE',
            'Are you sure you want to delete this rack?'
        );
    }

    /**
     * 激活机架
     * @param {number} rackId 机架ID
     */
    setAvailable(rackId) {
        this.submitForm(
            window.availableRackUrl.replace(':id', rackId),
            'PATCH',
            'Are you sure you want to activate this rack?'
        );
    }

    /**
     * 停用机架
     * @param {number} rackId 机架ID
     */
    setUnavailable(rackId) {
        this.submitForm(
            window.unavailableRackUrl.replace(':id', rackId),
            'PATCH',
            'Are you sure you want to deactivate this rack?'
        );
    }

    // 通用表单提交函数
    submitForm(url, method, confirmMessage) {
        if (!confirm(confirmMessage)) return;

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;

        // 添加CSRF token
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_token';
        tokenInput.value = $('meta[name="csrf-token"]').attr('content');

        // 添加HTTP方法字段
        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = method;

        form.appendChild(tokenInput);
        form.appendChild(methodInput);
        document.body.appendChild(form);
        form.submit();
    }

    // 显示提示信息 - 使用通用函數
    showAlert(message, type) {
        if (typeof window.showAlert === 'function') {
            window.showAlert(message, type);
        } else {
            // 備用實現
            const alertHtml = `
                <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
            $('.container-fluid').prepend(alertHtml);
            setTimeout(() => {
                $('.alert').fadeOut();
            }, 3000);
        }
    }
}

// =============================================================================
// 全局实例初始化 (Global Instance Initialization)
// =============================================================================
let rackDashboard;
$(document).ready(function() {
    // 检查当前页面是否是dashboard页面（有table-body元素）
    if ($("#table-body").length > 0) {
        rackDashboard = new RackDashboard();
    }
});

// 使用原生JavaScript的DOMContentLoaded作为备用
document.addEventListener('DOMContentLoaded', function() {
    // 如果jQuery没有加载，使用原生JavaScript初始化
    if (typeof $ === 'undefined') {
        console.warn('jQuery is not loaded. Rack dashboard functionality may not work properly.');
    }
});
