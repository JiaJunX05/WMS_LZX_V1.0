/**
 * 颜色管理系统 JavaScript 类
 *
 * 功能模块：
 * - 颜色数据管理：搜索、筛选、分页
 * - 颜色操作：编辑、删除、状态管理
 * - 事件处理：表单提交、颜色预览
 *
 * @author WMS Team
 * @version 1.0.0
 */
class ColorManagement {
    constructor() {
        // 状态管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.colorFilter = '';
        this.statusFilter = '';

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模块 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.fetchColors();
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
        $('#color-filter').on('change', (e) => {
            this.colorFilter = $(e.target).val();
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
            this.fetchColors(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchColors(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchColors(this.currentPage + 1);
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
            color_id: this.colorFilter,
            color_status: this.statusFilter,
            perPage: 10
        };
    }

    /**
     * 获取颜色数据
     * @param {number} page 页码
     */
    fetchColors(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.colorManagementRoute;

        $.get(apiRoute, params)
            .done((response) => {
                if (response.data && response.data.length > 0) {
                    this.renderColors(response.data);
                    this.updatePaginationInfo(response);
                } else {
                    this.showNoResults();
                }
                this.updateStatistics(response);
                this.updateResultsCount(response);
                this.generatePagination(response);
            })
            .fail((xhr, status, error) => {
                this.showAlert('Failed to load colors, please try again', 'danger');
            });
    }

    /**
     * 处理搜索
     */
    handleSearch() {
        this.fetchColors(1);
    }

    /**
     * 处理筛选
     */
    handleFilter() {
        this.fetchColors(1);
    }

    /**
     * 清除所有筛选条件
     */
    clearFilters() {
        this.colorFilter = '';
        this.statusFilter = '';
        this.searchTerm = '';

        $('#color-filter').val('');
        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchColors(1);
    }

    /**
     * 更新统计数据
     * @param {Object} response API响应数据
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-colors').text(total);

        // 计算活跃和非活跃颜色数量
        if (response.data) {
            const activeCount = response.data.filter(color => color.color_status === 'Available').length;
            const inactiveCount = response.data.filter(color => color.color_status === 'Unavailable').length;
            const hexCount = response.data.filter(color => color.color_hex).length;

            $('#active-colors').text(activeCount);
            $('#inactive-colors').text(inactiveCount);
            $('#hex-colors').text(hexCount);
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
     * 渲染颜色列表
     * @param {Array} colors 颜色数据数组
     */
    renderColors(colors) {
        const $tableBody = $('#table-body');
        // 調試：輸出顏色數據
        console.log('Colors data:', colors);
        const html = colors.map(color => this.createColorRow(color)).join('');
        $tableBody.html(html);
    }

    createColorRow(color) {
        // 調試：輸出單個顏色數據
        console.log('Creating row for color:', color);
        const statusMenuItem = color.color_status === 'Unavailable'
            ? `<a class="dropdown-item" href="javascript:void(0)" onclick="colorManagement.setAvailable(${color.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate Color
               </a>`
            : `<a class="dropdown-item" href="javascript:void(0)" onclick="colorManagement.setUnavailable(${color.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate Color
               </a>`;

        const actionButtons = `
            <button class="btn-action" title="Edit" onclick="colorManagement.editColor(${color.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="colorManagement.deleteColor(${color.id})">
                            <i class="bi bi-trash me-2"></i> Delete Color
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4"><span class="text-muted">#${color.id}</span></td>
                <td>
                    <div class="color-preview-small" style="background-color: ${color.color_hex || '#cccccc'}"></div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <h6 class="mb-0 fw-bold">${color.color_name.toUpperCase()}</h6>
                    </div>
                </td>
                <td><span class="text-muted font-monospace">${color.color_hex || 'N/A'}</span></td>
                <td><span class="text-muted font-monospace">${color.color_rgb || 'N/A'}</span></td>
                <td><span class="status-badge ${this.getStatusClass(color.color_status)}">${color.color_status}</span></td>
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
                <td colspan="7" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-search fs-1 d-block mb-3"></i>
                        <h5>No colors found</h5>
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
    // 颜色操作模块 (Color Operations Module)
    // =============================================================================

    /**
     * 编辑颜色
     * @param {number} colorId 颜色ID
     */
    editColor(colorId) {
        const url = window.editColorUrl.replace(':id', colorId);
        window.location.href = url;
    }

    /**
     * 删除颜色
     * @param {number} colorId 颜色ID
     */
    deleteColor(colorId) {
        this.submitForm(
            window.deleteColorUrl.replace(':id', colorId),
            'DELETE',
            'Are you sure you want to delete this color?'
        );
    }

    /**
     * 激活颜色
     * @param {number} colorId 颜色ID
     */
    setAvailable(colorId) {
        this.submitForm(
            window.availableColorUrl.replace(':id', colorId),
            'PATCH',
            'Are you sure you want to activate this color?'
        );
    }

    /**
     * 停用颜色
     * @param {number} colorId 颜色ID
     */
    setUnavailable(colorId) {
        this.submitForm(
            window.unavailableColorUrl.replace(':id', colorId),
            'PATCH',
            'Are you sure you want to deactivate this color?'
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
// 颜色预览功能 (Color Preview Functions)
// ========================================

// 颜色预览功能 - 用于create和update页面
function setupColorPreview() {
    const hexInput = document.getElementById('color_hex');
    const rgbInput = document.getElementById('color_rgb');
    const colorPreview = document.getElementById('color-preview');

    if (hexInput && colorPreview) {
        // 实时更新颜色预览
        function updateColorPreview() {
            const hexValue = hexInput.value;
            if (hexValue && /^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
                colorPreview.style.backgroundColor = hexValue;

                // 自动生成RGB代码
                if (rgbInput) {
                    const rgb = hexToRgb(hexValue);
                    if (rgb) {
                        rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                    }
                }
            }
        }

        // 监听输入变化
        hexInput.addEventListener('input', updateColorPreview);

        // 初始化预览
        updateColorPreview();
    }
}

// HEX转RGB函数
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// ========================================
// 状态卡片选择功能 (Status Card Selection)
// ========================================

// 状态卡片选择效果 - 用于create和update页面
function setupStatusCardSelection() {
    const statusCards = document.querySelectorAll('.status-card');
    const statusRadioInputs = document.querySelectorAll('input[name="color_status"]');

    // 为每个状态卡片添加点击事件
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除所有卡片的选中状态
            statusCards.forEach(c => c.classList.remove('selected'));

            // 添加当前卡片的选中状态
            this.classList.add('selected');

            // 选中对应的单选按钮
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });

    // 为单选按钮添加变化事件
    statusRadioInputs.forEach(radio => {
        radio.addEventListener('change', function() {
            // 移除所有卡片的选中状态
            statusCards.forEach(c => c.classList.remove('selected'));

            // 添加对应卡片的选中状态
            const card = this.closest('.status-card');
            if (card) {
                card.classList.add('selected');
            }
        });
    });

    // 初始化选中状态
    const checkedRadio = document.querySelector('input[name="color_status"]:checked');
    if (checkedRadio) {
        const card = checkedRadio.closest('.status-card');
        if (card) {
            card.classList.add('selected');
        }
    }
}

// ========================================
// 页面初始化功能 (Page Initialization)
// ========================================

// 初始化所有Color管理相关功能
function initializeColorManagement() {
    // 设置颜色预览功能
    setupColorPreview();

    // 设置状态卡片选择功能
    setupStatusCardSelection();
}

// =============================================================================
// 全局实例初始化 (Global Instance Initialization)
// =============================================================================
let colorManagement;
$(document).ready(function() {
    // 检查当前页面类型并初始化相应功能

    // 如果是dashboard页面（有table-body元素）
    if ($("#table-body").length > 0) {
        colorManagement = new ColorManagement();
    }

    // 如果是create或update页面（有color_hex元素）
    if ($("#color_hex").length > 0) {
        initializeColorManagement();
    }
});

// 使用原生JavaScript的DOMContentLoaded作为备用
document.addEventListener('DOMContentLoaded', function() {
    // 如果jQuery没有加载，使用原生JavaScript初始化
    if (typeof $ === 'undefined') {
        initializeColorManagement();
    }
});
