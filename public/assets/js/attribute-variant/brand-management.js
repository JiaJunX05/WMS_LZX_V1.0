/**
 * 品牌管理系统 JavaScript 类
 *
 * 功能模块：
 * - 品牌数据管理：搜索、筛选、分页
 * - 品牌操作：编辑、删除、状态管理
 * - 事件处理：表单提交、模态框管理
 *
 * @author WMS Team
 * @version 1.0.0
 */
class BrandManagement {
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
            const withImageCount = response.data.filter(brand => brand.brand_image).length;

            $('#active-brands').text(activeCount);
            $('#inactive-brands').text(inactiveCount);
            $('#brands-with-image').text(withImageCount);
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
            ? `<a class="dropdown-item" href="javascript:void(0)" onclick="brandManagement.setAvailable(${brand.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate Brand
               </a>`
            : `<a class="dropdown-item" href="javascript:void(0)" onclick="brandManagement.setUnavailable(${brand.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate Brand
               </a>`;

        const actionButtons = `
            <button class="btn-action" title="Edit" onclick="brandManagement.editBrand(${brand.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="brandManagement.deleteBrand(${brand.id})">
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
                        <img src="/${brand.brand_image}" alt="Brand Image"
                             class="preview-image"
                             onclick="previewImage('/${brand.brand_image}')">
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
        const statusMap = { 'Available': 'available', 'Unavailable': 'unavailable' };
        return statusMap[status] || 'default';
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
        this.submitForm(
            window.deleteBrandUrl.replace(':id', brandId),
            'DELETE',
            'Are you sure you want to delete this brand?'
        );
    }

    /**
     * 激活品牌
     * @param {number} brandId 品牌ID
     */
    setAvailable(brandId) {
        this.submitForm(
            window.availableBrandUrl.replace(':id', brandId),
            'PATCH',
            'Are you sure you want to activate this brand?'
        );
    }

    /**
     * 停用品牌
     * @param {number} brandId 品牌ID
     */
    setUnavailable(brandId) {
        this.submitForm(
            window.unavailableBrandUrl.replace(':id', brandId),
            'PATCH',
            'Are you sure you want to deactivate this brand?'
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

// 文件上传预览功能 - 用于create和update页面
function setupImagePreview() {
    const fileInput = document.getElementById('input_image');
    const previewImage = document.getElementById('preview-image');
    const previewIcon = document.getElementById('preview-icon');
    const previewContainer = document.querySelector('.preview-container');

    if (fileInput && previewContainer) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // 如果是create页面（有preview-icon）
                    if (previewIcon) {
                        previewIcon.style.display = 'none';
                        previewImage.src = e.target.result;
                        previewImage.classList.remove('d-none');
                    } else {
                        // 如果是update页面，替换整个容器内容
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = 'Preview';
                        img.id = 'preview-image';
                        img.className = 'img-fluid rounded-3';
                        img.style.cssText = 'max-width: 100%; max-height: 280px; object-fit: contain;';

                        previewContainer.innerHTML = '';
                        previewContainer.appendChild(img);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                // 如果没有选择文件，恢复原始状态
                if (previewIcon) {
                    // create页面：显示图标，隐藏图片
                    previewIcon.style.display = 'block';
                    previewImage.classList.add('d-none');
                } else {
                    // update页面：恢复原始内容
                    const originalContent = previewContainer.getAttribute('data-original-content');
                    if (originalContent) {
                        previewContainer.innerHTML = originalContent;
                    }
                }
            }
        });
    }
}

// ========================================
// 状态卡片选择功能 (Status Card Selection)
// ========================================

// 状态卡片选择效果 - 用于create和update页面
function setupStatusCardSelection() {
    const statusCards = document.querySelectorAll('.status-card');
    const statusRadioInputs = document.querySelectorAll('input[name="brand_status"]');

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
    const checkedRadio = document.querySelector('input[name="brand_status"]:checked');
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

// 初始化所有Brand管理相关功能
function initializeBrandManagement() {
    // 设置图片预览功能
    setupImagePreview();

    // 设置状态卡片选择功能
    setupStatusCardSelection();
}

// =============================================================================
// 全局实例初始化 (Global Instance Initialization)
// =============================================================================
let brandManagement;
$(document).ready(function() {
    // 检查当前页面类型并初始化相应功能

    // 如果是dashboard页面（有table-body元素）
    if ($("#table-body").length > 0) {
        brandManagement = new BrandManagement();
    }

    // 如果是create或update页面（有input_image元素）
    if ($("#input_image").length > 0) {
        initializeBrandManagement();
    }
});

// 使用原生JavaScript的DOMContentLoaded作为备用
document.addEventListener('DOMContentLoaded', function() {
    // 如果jQuery没有加载，使用原生JavaScript初始化
    if (typeof $ === 'undefined') {
        initializeBrandManagement();
    }
});
