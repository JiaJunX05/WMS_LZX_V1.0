/**
 * 区域管理Dashboard JavaScript 类
 *
 * 功能模块：
 * - 区域数据管理：搜索、筛选、分页
 * - 区域操作：编辑、删除、状态管理
 * - 事件处理：表单提交
 *
 * @author WMS Team
 * @version 1.0.0
 */
class ZoneDashboard {
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
        this.fetchZones();
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
            this.fetchZones(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchZones(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchZones(this.currentPage + 1);
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
     * 获取区域数据
     * @param {number} page 页码
     */
    fetchZones(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.zoneManagementRoute;

        console.log('Fetching zones with params:', params);

        $.get(apiRoute, params)
            .done((response) => {
                console.log('Zones response:', response);
                if (response.data && response.data.length > 0) {
                    this.renderZones(response.data);
                    this.updatePaginationInfo(response);
                } else {
                    this.showNoResults();
                }
                this.updateStatistics(response);
                this.updateResultsCount(response);
                this.generatePagination(response);
            })
            .fail((xhr, status, error) => {
                console.error('Failed to fetch zones:', error);
                this.showAlert('Failed to load zones, please try again', 'danger');
            });
    }

    /**
     * 处理搜索
     */
    handleSearch() {
        console.log('Handling search with term:', this.searchTerm);
        this.fetchZones(1);
    }

    /**
     * 处理筛选
     */
    handleFilter() {
        console.log('Handling filter with status:', this.statusFilter);
        this.fetchZones(1);
    }

    /**
     * 清除所有筛选条件
     */
    clearFilters() {
        this.statusFilter = '';
        this.searchTerm = '';

        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchZones(1);
    }

    /**
     * 更新统计数据
     * @param {Object} response API响应数据
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-zones').text(total);

        // 计算活跃和非活跃区域数量
        if (response.data) {
            const activeCount = response.data.filter(zone => zone.zone_status === 'Available').length;
            const inactiveCount = response.data.filter(zone => zone.zone_status === 'Unavailable').length;
            const withImageCount = response.data.filter(zone => zone.zone_image).length;

            $('#active-zones').text(activeCount);
            $('#inactive-zones').text(inactiveCount);
            $('#zones-with-image').text(withImageCount);
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
     * 渲染区域列表
     * @param {Array} zones 区域数据数组
     */
    renderZones(zones) {
        const $tableBody = $('#table-body');
        const html = zones.map(zone => this.createZoneRow(zone)).join('');
        $tableBody.html(html);
    }

    createZoneRow(zone) {
        const statusMenuItem = zone.zone_status === 'Unavailable'
            ? `<a class="dropdown-item" href="javascript:void(0)" onclick="zoneDashboard.setAvailable(${zone.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate Zone
               </a>`
            : `<a class="dropdown-item" href="javascript:void(0)" onclick="zoneDashboard.setUnavailable(${zone.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate Zone
               </a>`;

        const actionButtons = `
            <button class="btn-action" title="Edit" onclick="zoneDashboard.editZone(${zone.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="zoneDashboard.deleteZone(${zone.id})">
                            <i class="bi bi-trash me-2"></i> Delete Zone
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4"><span class="text-muted">#${zone.id}</span></td>
                <td>
                    ${zone.zone_image ? `
                        <img src="/assets/images/${zone.zone_image}" alt="Zone Image"
                             class="preview-image"
                             onclick="previewImage('/assets/images/${zone.zone_image}')">
                    ` : `
                        <div class="no-image">No Image</div>
                    `}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <h6 class="mb-0 fw-bold">${zone.zone_name}</h6>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="text-muted">${zone.location || 'No location specified'}</span>
                    </div>
                </td>
                <td><span class="status-badge ${this.getStatusClass(zone.zone_status)}">${zone.zone_status}</span></td>
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
                <td colspan="6" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-search fs-1 d-block mb-3"></i>
                        <h5>No zones found</h5>
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
    // 区域操作模块 (Zone Operations Module)
    // =============================================================================

    /**
     * 编辑区域
     * @param {number} zoneId 区域ID
     */
    editZone(zoneId) {
        const url = window.editZoneUrl.replace(':id', zoneId);
        window.location.href = url;
    }

    /**
     * 删除区域
     * @param {number} zoneId 区域ID
     */
    deleteZone(zoneId) {
        this.submitForm(
            window.deleteZoneUrl.replace(':id', zoneId),
            'DELETE',
            'Are you sure you want to delete this zone?'
        );
    }

    /**
     * 激活区域
     * @param {number} zoneId 区域ID
     */
    setAvailable(zoneId) {
        this.submitForm(
            window.availableZoneUrl.replace(':id', zoneId),
            'PATCH',
            'Are you sure you want to activate this zone?'
        );
    }

    /**
     * 停用区域
     * @param {number} zoneId 区域ID
     */
    setUnavailable(zoneId) {
        this.submitForm(
            window.unavailableZoneUrl.replace(':id', zoneId),
            'PATCH',
            'Are you sure you want to deactivate this zone?'
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

    // 显示提示信息
    showAlert(message, type) {
        // 创建提示信息元素
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        // 在页面顶部显示提示信息
        $('.container-fluid').prepend(alertHtml);

        // 3秒后自动隐藏
        setTimeout(() => {
            $('.alert').fadeOut();
        }, 3000);
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
let zoneDashboard;
$(document).ready(function() {
    // 检查当前页面是否是dashboard页面（有table-body元素）
    if ($("#table-body").length > 0) {
        zoneDashboard = new ZoneDashboard();
    }
});

// 使用原生JavaScript的DOMContentLoaded作为备用
document.addEventListener('DOMContentLoaded', function() {
    // 如果jQuery没有加载，使用原生JavaScript初始化
    if (typeof $ === 'undefined') {
        console.warn('jQuery is not loaded. Zone dashboard functionality may not work properly.');
    }
});
