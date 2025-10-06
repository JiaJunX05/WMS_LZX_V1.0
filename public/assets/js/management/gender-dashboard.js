/**
 * Gender Dashboard JavaScript
 * 性别仪表板页面交互逻辑
 *
 * 功能：
 * - 性别数据管理：搜索、筛选、分页
 * - 性别操作：编辑、删除、状态管理
 * - 事件处理：表单提交
 *
 * @author WMS Team
 * @version 1.0.0
 */
class GenderDashboard {
    constructor() {
        // 状态管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.genderFilter = '';
        this.statusFilter = '';

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模块 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.fetchGenders();
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
        $('#gender-filter').on('change', (e) => {
            this.genderFilter = $(e.target).val();
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
            this.fetchGenders(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchGenders(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchGenders(this.currentPage + 1);
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
            gender_id: this.genderFilter,
            gender_status: this.statusFilter,
            perPage: 10
        };
    }

    /**
     * 获取性别数据
     * @param {number} page 页码
     */
    fetchGenders(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.genderManagementRoute;

        $.get(apiRoute, params)
            .done((response) => {
                if (response.data && response.data.length > 0) {
                    this.renderGenders(response.data);
                    this.updatePaginationInfo(response);
                } else {
                    this.showNoResults();
                }
                this.updateStatistics(response);
                this.updateResultsCount(response);
                this.generatePagination(response);
            })
            .fail((xhr, status, error) => {
                this.showAlert('Failed to load genders, please try again', 'danger');
            });
    }

    /**
     * 处理搜索
     */
    handleSearch() {
        this.fetchGenders(1);
    }

    /**
     * 处理筛选
     */
    handleFilter() {
        this.fetchGenders(1);
    }

    /**
     * 清除所有筛选条件
     */
    clearFilters() {
        this.genderFilter = '';
        this.statusFilter = '';
        this.searchTerm = '';

        $('#gender-filter').val('');
        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchGenders(1);
    }

    /**
     * 更新统计数据
     * @param {Object} response API响应数据
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-genders').text(total);

        // 计算活跃和非活跃性别数量
        if (response.data) {
            const activeCount = response.data.filter(gender => gender.gender_status === 'Available').length;
            const inactiveCount = response.data.filter(gender => gender.gender_status === 'Unavailable').length;
            const withSizesCount = response.data.filter(gender => (gender.sizes_count || 0) > 0).length;

            $('#active-genders').text(activeCount);
            $('#inactive-genders').text(inactiveCount);
            $('#genders-with-sizes').text(withSizesCount);
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
     * 渲染性别列表
     * @param {Array} genders 性别数据数组
     */
    renderGenders(genders) {
        const $tableBody = $('#table-body');
        const html = genders.map(gender => this.createGenderRow(gender)).join('');
        $tableBody.html(html);
    }

    createGenderRow(gender) {
        const statusMenuItem = gender.gender_status === 'Unavailable'
            ? `<a class="dropdown-item" href="javascript:void(0)" onclick="genderDashboard.setAvailable(${gender.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate Gender
               </a>`
            : `<a class="dropdown-item" href="javascript:void(0)" onclick="genderDashboard.setUnavailable(${gender.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate Gender
               </a>`;

        const actionButtons = `
            <button class="btn-action" title="Edit" onclick="genderDashboard.editGender(${gender.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="genderDashboard.deleteGender(${gender.id})">
                            <i class="bi bi-trash me-2"></i> Delete Gender
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4"><span class="text-muted">#${gender.id}</span></td>
                <td>
                    <div class="d-flex align-items-center">
                        <h6 class="mb-0 fw-bold">${gender.gender_name.toUpperCase()}</h6>
                    </div>
                </td>
                <td>
                    <span class="badge bg-light text-dark">
                        ${gender.sizes_count || 0} sizes
                    </span>
                </td>
                <td><span class="status-badge ${this.getStatusClass(gender.gender_status)}">${gender.gender_status}</span></td>
                <td class="text-end pe-4"><div class="action-buttons">${actionButtons}</div></td>
            </tr>
        `;
    }

    getStatusClass(status) {
        return getGenderStatusClass(status);
    }

    showNoResults() {
        $('#table-body').html(`
            <tr>
                <td colspan="4" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-search fs-1 d-block mb-3"></i>
                        <h5>No genders found</h5>
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
    // 性别操作模块 (Gender Operations Module)
    // =============================================================================

    /**
     * 编辑性别
     * @param {number} genderId 性别ID
     */
    editGender(genderId) {
        const url = window.editGenderUrl.replace(':id', genderId);
        window.location.href = url;
    }

    /**
     * 删除性别
     * @param {number} genderId 性别ID
     */
    deleteGender(genderId) {
        deleteGender(genderId, {
            onSuccess: () => {
                this.fetchGenders();
            }
        });
    }

    /**
     * 激活性别
     * @param {number} genderId 性别ID
     */
    setAvailable(genderId) {
        setGenderAvailable(genderId, {
            onSuccess: () => {
                this.fetchGenders();
            }
        });
    }

    /**
     * 停用性别
     * @param {number} genderId 性别ID
     */
    setUnavailable(genderId) {
        setGenderUnavailable(genderId, {
            onSuccess: () => {
                this.fetchGenders();
            }
        });
    }

// submitForm 函數已移至 gender-common.js 的 handleGenderRequest

// showAlert 函數已移至 alert-system.js
}

// =============================================================================
// 全局实例初始化 (Global Instance Initialization)
// =============================================================================
let genderDashboard;

$(document).ready(function() {
    // 如果是dashboard页面（有table-body元素）
    if ($("#table-body").length > 0) {
        genderDashboard = new GenderDashboard();
    }
});
