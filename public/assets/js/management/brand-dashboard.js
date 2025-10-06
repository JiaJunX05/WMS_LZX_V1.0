/**
 * Brand Dashboard JavaScript
 * 品牌仪表板页面交互逻辑
 *
 * 功能：
 * - 品牌数据管理：搜索、筛选、分页
 * - 品牌操作：编辑、删除、状态管理
 * - 事件处理：表单提交、图片预览
 *
 * @author WMS Team
 * @version 1.0.0
 */
class BrandDashboard {
    constructor() {
        // 状态管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.brandFilter = '';
        this.statusFilter = '';

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模块 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.fetchBrands();
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
        $('#brand-filter').on('change', (e) => {
            this.brandFilter = $(e.target).val();
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
            this.fetchBrands(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchBrands(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchBrands(this.currentPage + 1);
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
            brand_id: this.brandFilter,
            brand_status: this.statusFilter,
            perPage: 10
        };
    }

    /**
     * 获取品牌数据
     * @param {number} page 页码
     */
    fetchBrands(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.brandManagementRoute;

        $.get(apiRoute, params)
            .done((response) => {
                if (response.data && response.data.length > 0) {
                    this.renderBrands(response.data);
                    this.updatePaginationInfo(response);
                } else {
                    this.showNoResults();
                }
                this.updateStatistics(response);
                this.updateResultsCount(response);
                this.generatePagination(response);
            })
            .fail((xhr, status, error) => {
                this.showAlert('Failed to load brands, please try again', 'danger');
            });
    }

    /**
     * 处理搜索
     */
    handleSearch() {
        this.fetchBrands(1);
    }

    /**
     * 处理筛选
     */
    handleFilter() {
        this.fetchBrands(1);
    }

    /**
     * 清除所有筛选条件
     */
    clearFilters() {
        this.brandFilter = '';
        this.statusFilter = '';
        this.searchTerm = '';

        $('#brand-filter').val('');
        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchBrands(1);
    }

    /**
     * 更新统计数据
     * @param {Object} response API响应数据
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-brands').text(total);

        // 计算活跃和非活跃品牌数量
        if (response.data) {
            const activeCount = response.data.filter(brand => brand.brand_status === 'Available').length;
            const inactiveCount = response.data.filter(brand => brand.brand_status === 'Unavailable').length;

            // 計算有圖片的品牌數量
            const imageCount = response.data.filter(brand => {
                return brand.brand_image && brand.brand_image.trim() !== '' && brand.brand_image !== null;
            }).length;

            $('#active-brands').text(activeCount);
            $('#inactive-brands').text(inactiveCount);
            $('#brands-with-image').text(imageCount);
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
     * 渲染品牌列表
     * @param {Array} brands 品牌数据数组
     */
    renderBrands(brands) {
        const $tableBody = $('#table-body');
        const html = brands.map(brand => this.createBrandRow(brand)).join('');
        $tableBody.html(html);
    }

    createBrandRow(brand) {
        const statusMenuItem = brand.brand_status === 'Unavailable'
            ? `<a class="dropdown-item" href="javascript:void(0)" onclick="brandDashboard.setAvailable(${brand.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate Brand
               </a>`
            : `<a class="dropdown-item" href="javascript:void(0)" onclick="brandDashboard.setUnavailable(${brand.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate Brand
               </a>`;

        const actionButtons = `
            <button class="btn-action" title="Edit" onclick="brandDashboard.editBrand(${brand.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="brandDashboard.deleteBrand(${brand.id})">
                            <i class="bi bi-trash me-2"></i> Delete Brand
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4"><span class="text-muted">#${brand.id}</span></td>
                <td>
                    ${brand.brand_image ? `
                        <img src="/assets/images/${brand.brand_image}" alt="Brand Image"
                             class="preview-image"
                             onclick="previewImage('/assets/images/${brand.brand_image}')">
                    ` : `
                        <div class="no-image">No Image</div>
                    `}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <h6 class="mb-0 fw-bold">${brand.brand_name.toUpperCase()}</h6>
                    </div>
                </td>
                <td><span class="status-badge ${this.getStatusClass(brand.brand_status)}">${brand.brand_status}</span></td>
                <td class="text-end pe-4"><div class="action-buttons">${actionButtons}</div></td>
            </tr>
        `;
    }

    getStatusClass(status) {
        return getBrandStatusClass(status);
    }

    showNoResults() {
        $('#table-body').html(`
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-search fs-1 d-block mb-3"></i>
                        <h5>No brands found</h5>
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
    // 品牌操作模块 (Brand Operations Module)
    // =============================================================================

    /**
     * 编辑品牌
     * @param {number} brandId 品牌ID
     */
    editBrand(brandId) {
        const url = window.editBrandUrl.replace(':id', brandId);
        window.location.href = url;
    }

    /**
     * 删除品牌
     * @param {number} brandId 品牌ID
     */
    deleteBrand(brandId) {
        deleteBrand(brandId, {
            onSuccess: () => {
                this.fetchBrands();
            }
        });
    }

    /**
     * 激活品牌
     * @param {number} brandId 品牌ID
     */
    setAvailable(brandId) {
        setBrandAvailable(brandId, {
            onSuccess: () => {
                this.fetchBrands();
            }
        });
    }

    /**
     * 停用品牌
     * @param {number} brandId 品牌ID
     */
    setUnavailable(brandId) {
        setBrandUnavailable(brandId, {
            onSuccess: () => {
                this.fetchBrands();
            }
        });
    }

// submitForm 函數已移至 brand-common.js 的 handleBrandRequest

// showAlert 函數已移至 alert-system.js
}

// ========================================
// 图片预览功能 (Image Preview Functions)
// ========================================

// previewImage 函數已移至 brand-common.js

// =============================================================================
// 全局实例初始化 (Global Instance Initialization)
// =============================================================================
let brandDashboard;

$(document).ready(function() {
    // 如果是dashboard页面（有table-body元素）
    if ($("#table-body").length > 0) {
        brandDashboard = new BrandDashboard();
    }
});
