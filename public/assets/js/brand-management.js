/**
 * Brand Management JavaScript
 * 品牌管理統一交互邏輯
 *
 * 功能模塊：
 * - Dashboard 頁面：搜索、篩選、分頁、CRUD 操作
 * - Create 頁面：批量創建、表單驗證、狀態管理
 * - Update 頁面：編輯更新、圖片處理、表單提交
 * - 通用功能：API 請求、UI 更新、事件綁定
 *
 * @author WMS Team
 * @version 1.0.0
 */

// =============================================================================
// 全局變量和狀態管理 (Global Variables and State Management)
// =============================================================================

// 品牌列表數組（用於 Create 頁面）
let brandList = [];

// 排序狀態：true = 升序，false = 降序
let isAscending = false; // 默認降序（最新的在上面）

// =============================================================================
// Dashboard 頁面功能 (Dashboard Page Functions)
// =============================================================================

/**
 * Brand Dashboard 類
 * 品牌儀表板頁面交互邏輯
 */
class BrandDashboard {
    constructor() {
        // 狀態管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.statusFilter = '';

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模塊 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.fetchBrands();
    }

    // =============================================================================
    // 事件綁定模塊 (Event Binding Module)
    // =============================================================================
    bindEvents() {
        // 搜索功能
        $('#search-input').on('keyup', (e) => {
            this.searchTerm = $(e.target).val();
            this.handleSearch();
        });

        // 篩選功能
        $('#status-filter').on('change', (e) => {
            this.statusFilter = $(e.target).val();
            this.handleFilter();
        });

        // 清除篩選
        $('#clear-filters').on('click', () => {
            this.clearFilters();
        });

        // 分頁功能
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
    // 數據請求模塊 (Data Request Module)
    // =============================================================================

    /**
     * 獲取搜索參數
     * @param {number} page 頁碼
     * @returns {Object} 搜索參數對象
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
     * 獲取品牌數據
     * @param {number} page 頁碼
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
     * 處理搜索
     */
    handleSearch() {
        this.fetchBrands(1);
    }

    /**
     * 處理篩選
     */
    handleFilter() {
        this.fetchBrands(1);
    }

    /**
     * 清除所有篩選條件
     */
    clearFilters() {
        this.statusFilter = '';
        this.searchTerm = '';

        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchBrands(1);
    }

    /**
     * 更新統計數據
     * @param {Object} response API響應數據
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-brands').text(total);

        // 計算活躍和非活躍品牌數量
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
     * 更新結果計數顯示
     * @param {Object} response API響應數據
     */
    updateResultsCount(response) {
        const total = response.pagination?.total || 0;
        $('#results-count').text(`${total} records`);
    }

    // =============================================================================
    // 渲染模塊 (Rendering Module)
    // =============================================================================

    /**
     * 渲染品牌列表
     * @param {Array} brands 品牌數據數組
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
                        <h6 class="mb-0 fw-bold">${brand.brand_name}</h6>
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
    // 分頁模塊 (Pagination Module)
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
    // 品牌操作模塊 (Brand Operations Module)
    // =============================================================================

    /**
     * 編輯品牌
     * @param {number} brandId 品牌ID
     */
    editBrand(brandId) {
        const url = window.editBrandUrl.replace(':id', brandId);
        window.location.href = url;
    }

    /**
     * 刪除品牌
     * @param {number} brandId 品牌ID
     */
    deleteBrand(brandId) {
        if (!confirm('Are you sure you want to delete this brand?')) return;

        fetch(window.deleteBrandUrl.replace(':id', brandId), {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.showAlert(data.message || 'Brand deleted successfully', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchBrands(1);
                } else {
                    // 重新載入當前頁面的品牌列表
                    this.fetchBrands(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to delete brand', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Error deleting brand: ' + error.message, 'error');
        });
    }

    /**
     * 激活品牌
     * @param {number} brandId 品牌ID
     */
    setAvailable(brandId) {
        if (!confirm('Are you sure you want to activate this brand?')) return;

        fetch(window.availableBrandUrl.replace(':id', brandId), {
            method: 'PATCH',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.showAlert(data.message || 'Brand has been set to available status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchBrands(1);
                } else {
                    // 重新載入當前頁面的品牌列表
                    this.fetchBrands(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set brand available', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Error setting brand available: ' + error.message, 'error');
        });
    }

    /**
     * 停用品牌
     * @param {number} brandId 品牌ID
     */
    setUnavailable(brandId) {
        if (!confirm('Are you sure you want to deactivate this brand?')) return;

        fetch(window.unavailableBrandUrl.replace(':id', brandId), {
            method: 'PATCH',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.showAlert(data.message || 'Brand has been set to unavailable status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchBrands(1);
                } else {
                    // 重新載入當前頁面的品牌列表
                    this.fetchBrands(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set brand unavailable', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Error setting brand unavailable: ' + error.message, 'error');
        });
    }

    // 顯示提示信息
    showAlert(message, type) {
        // 使用統一的 alert 系統
        if (typeof window.showAlert === 'function') {
            window.showAlert(message, type);
        } else {
            // 備用實現 - 修復 Bootstrap 5 的 alert 類名
            const alertClass = type === 'danger' ? 'alert-danger' : `alert-${type}`;
            const alertHtml = `
                <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;

            // 插入到頁面頂部
            const container = document.querySelector('.container-fluid') || document.querySelector('.container') || document.body;
            container.insertAdjacentHTML('afterbegin', alertHtml);

            // 自動消失
            setTimeout(() => {
                const alertElement = container.querySelector('.alert');
                if (alertElement) {
                    alertElement.remove();
                }
            }, 5000);
        }
    }
}

// =============================================================================
// Create 頁面功能 (Create Page Functions)
// =============================================================================

/**
 * 添加品牌到數組
 * @param {string} brandName 品牌名稱
 * @param {string} brandStatus 品牌狀態
 * @param {File} brandImageFile 圖片文件
 */
function addBrandToArray(brandName, brandStatus, brandImageFile) {
    // 調試信息：檢查傳入的數據
    console.log('addBrandToArray called with:', { brandName, brandStatus, brandImageFile });

    // 添加品牌到數組
    const brandData = {
        brandName: brandName,
        brandStatus: brandStatus,
        brandImageFile: brandImageFile // 存儲文件對象而不是base64
    };

    brandList.push(brandData);

    // 更新UI
    updateBrandList();
    updateUI();

    // 顯示右邊的品牌表格
    showBrandValuesArea();

    // 清空輸入框
    const brandNameInput = document.getElementById('brand_name');
    if (brandNameInput) {
        brandNameInput.value = '';
    }

    // 清空圖片（不顯示消息）
    resetImageWithoutMessage();

    // 調試信息：檢查添加後的狀態選擇
    const currentStatus = document.querySelector('input[name="brand_status"]:checked');
    console.log('After adding brand, current status selection:', currentStatus ? currentStatus.value : 'No status selected');
}

/**
 * 檢查品牌名稱是否已存在（簡化版本，用於當前頁面）
 * @param {string} brandName 品牌名稱
 * @returns {boolean} 是否存在
 */
function isBrandExists(brandName) {
    return brandList.some(item => item.brandName.toLowerCase() === brandName.toLowerCase());
}

/**
 * 添加品牌
 */
function addBrand() {
    const brandNameInput = document.getElementById('brand_name');

    const brandName = brandNameInput.value.trim();

    // 驗證輸入
    if (!brandName) {
        showAlert('Please enter brand name', 'warning');
        brandNameInput.focus();
        return;
    }

    // 檢查是否已存在
    if (isBrandExists(brandName)) {
        showAlert(`Brand name "${brandName}" already exists in the list`, 'error');
        highlightExistingBrand(brandName);
        brandNameInput.focus();
        return;
    }

    // 獲取當前圖片文件
    const imageInput = document.getElementById('brand_image');
    let brandImageFile = null;
    if (imageInput && imageInput.files && imageInput.files[0]) {
        brandImageFile = imageInput.files[0];
    }

    // 添加到品牌數組（狀態默認為 Available）
    addBrandToArray(brandName, 'Available', brandImageFile);

    // 顯示成功提示
    showAlert('Brand added successfully', 'success');
}

/**
 * 移除品牌
 * @param {number} index 索引
 */
function removeBrand(index) {
    console.log('Removing brand at index:', index);
    console.log('Brand list before removal:', brandList);

    // 確認機制
    if (!confirm('Are you sure you want to remove this brand?')) {
        return;
    }

    if (index >= 0 && index < brandList.length) {
        brandList.splice(index, 1);
        console.log('Brand list after removal:', brandList);
        updateBrandList();
        updateUI();

        // 顯示成功移除的 alert
        showAlert('Brand removed successfully', 'success');
    } else {
        console.error('Invalid index:', index);
        showAlert('Error: Invalid brand index', 'error');
    }
}

/**
 * 更新品牌列表
 */
function updateBrandList() {
    const container = document.getElementById('brandValuesList');
    if (!container) return;

    container.innerHTML = '';

    brandList.forEach((item, index) => {
        const brandItem = document.createElement('div');

        // 檢查是否為重複項
        const isDuplicate = isBrandExists(item.brandName) &&
            brandList.filter(i => i.brandName.toLowerCase() === item.brandName.toLowerCase()).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
        const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

        brandItem.className = `${baseClasses} ${duplicateClasses}`;

        brandItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                ${item.brandImageFile ?
                    `<img src="${URL.createObjectURL(item.brandImageFile)}" alt="${item.brandName}" class="item-image me-2" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;">` :
                    '<div class="item-image-placeholder me-2" style="width: 32px; height: 32px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-tag text-muted"></i></div>'
                }
                <div class="d-flex flex-column">
                    <span class="item-value-text fw-medium">${item.brandName}</span>
                </div>
                ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;
        container.appendChild(brandItem);
    });
}

/**
 * 高亮顯示列表中已存在的品牌名稱
 * @param {string} brandName 品牌名稱
 */
function highlightExistingBrand(brandName) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.item-value-text').textContent.trim();
        if (value.toLowerCase() === brandName.toLowerCase()) {
            // 添加高亮樣式
            item.classList.add('duplicate-highlight');

            // 滾動到該元素
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 3秒後移除高亮
            setTimeout(() => {
                item.classList.remove('duplicate-highlight');
            }, 3000);
            break;
        }
    }
}

/**
 * 顯示品牌值區域
 */
function showBrandValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 隱藏輸入提示
    const brandInputPrompt = document.getElementById('brandInputPrompt');
    if (brandInputPrompt) {
        brandInputPrompt.style.display = 'none';
    }

    // 顯示品牌值區域
    const brandValuesArea = document.getElementById('brandValuesArea');
    if (brandValuesArea) {
        brandValuesArea.style.display = 'block';
    }

    // 更新品牌名稱顯示
    updateBrandNameDisplay();

    // 顯示提交按鈕
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.style.display = 'block';
    }
}

/**
 * 隱藏所有區域
 */
function hideAllAreas() {
    // 隱藏品牌值區域
    const brandValuesArea = document.getElementById('brandValuesArea');
    if (brandValuesArea) {
        brandValuesArea.style.display = 'none';
    }

    // 隱藏輸入提示
    const brandInputPrompt = document.getElementById('brandInputPrompt');
    if (brandInputPrompt) {
        brandInputPrompt.style.display = 'none';
    }

    // 隱藏提交按鈕
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.style.display = 'none';
    }

    // 顯示初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'block';
    }
}

/**
 * 清除表單
 */
function clearForm() {
    // 檢查是否有數據需要清除
    if (brandList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 確認清除
    if (!confirm('Are you sure you want to clear all brands?')) {
        return;
    }

    // 清空數組
    brandList = [];

    // 清空輸入框
    const brandNameInput = document.getElementById('brand_name');
    if (brandNameInput) {
        brandNameInput.value = '';
    }

    // 更新UI
    updateBrandList();
    updateUI();

    // 顯示成功提示
    showAlert('All brands cleared successfully', 'success');

    // 隱藏所有區域
    hideAllAreas();
}

// =============================================================================
// UI 更新功能 (UI Update Functions)
// =============================================================================

/**
 * 更新UI（簡化版本，用於當前頁面）
 */
function updateUI() {
    // 更新品牌值計數
    updateBrandValuesCount();

    // 更新品牌範圍顯示
    updateBrandRangeDisplay();

    // 更新品牌名稱顯示
    updateBrandNameDisplay();

    // 更新配置摘要
    updateConfigSummary();

    // 如果沒有品牌，隱藏所有區域並顯示初始狀態
    if (brandList.length === 0) {
        hideAllAreas();
    }
}

/**
 * 更新品牌值計數
 */
function updateBrandValuesCount() {
    const count = brandList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('brandValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} brands`;
    }
}

function updateConfigSummary() {
    // 更新品牌範圍顯示
    updateBrandRangeDisplay();

    // 顯示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (configSummary) {
        configSummary.style.display = 'block';
    }
}

function updateBrandNameDisplay() {
    const brandNameSpan = document.getElementById('brandName');
    if (brandNameSpan) {
        if (brandList.length > 0) {
            // 顯示品牌數量
            brandNameSpan.textContent = `- ${brandList.length} brands`;
        } else {
            brandNameSpan.textContent = '';
        }
    }
}

function updateBrandRangeDisplay() {
    const brandNames = brandList.map(item => item.brandName);

    const selectedBrandSpan = document.getElementById('selectedBrand');
    if (selectedBrandSpan) {
        if (brandNames.length === 0) {
            selectedBrandSpan.textContent = 'None';
        } else if (brandNames.length === 1) {
            selectedBrandSpan.textContent = brandNames[0];
        } else {
            // 按字母順序排序
            const sortedNames = brandNames.sort();
            const minBrand = sortedNames[0];
            const maxBrand = sortedNames[sortedNames.length - 1];
            selectedBrandSpan.textContent = `${minBrand} - ${maxBrand}`;
        }
    }
}

// =============================================================================
// 排序功能 (Sorting Functions)
// =============================================================================

/**
 * 切換排序順序
 */
function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortBrands');

    // 更新圖標
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortBrandValuesList();
}

/**
 * 排序品牌值列表
 */
function sortBrandValuesList() {
    const brandValuesList = document.getElementById('brandValuesList');
    const items = Array.from(brandValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取品牌名稱並排序
    const brandValues = items.map(item => ({
        element: item,
        value: item.querySelector('.item-value-text').textContent.trim()
    }));

    // 按字母順序排序
    brandValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    brandValues.forEach(({ element }) => {
        brandValuesList.appendChild(element);
    });
}

// =============================================================================
// 批量添加功能 (Batch Add Functions)
// =============================================================================

/**
 * 添加常用品牌
 */
function addCommonBrands() {
    // Common brands
    const commonBrands = [
        'Nike',
        'Adidas',
        'Puma',
        'Under Armour',
        'New Balance',
        'Reebok',
        'Converse',
        'Vans',
        'Skechers',
        'ASICS'
    ];

    addMultipleBrands(commonBrands);
}

/**
 * 添加時尚品牌
 */
function addFashionBrands() {
    // Fashion brands
    const fashionBrands = [
        'Zara',
        'H&M',
        'Uniqlo',
        'Gap',
        'Forever 21',
        'Topshop',
        'Mango',
        'COS',
        'Massimo Dutti',
        'Bershka'
    ];

    addMultipleBrands(fashionBrands);
}

/**
 * 添加多個品牌
 * @param {Array} brands 品牌數組
 */
function addMultipleBrands(brands) {
    let addedCount = 0;
    let skippedCount = 0;

    brands.forEach(brand => {
        if (!isBrandExists(brand)) {
            addBrandToList(brand, 'Available'); // 默認為 Available
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 顯示結果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} brands`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} brands, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All brands already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加品牌，顯示右邊的表格
    if (addedCount > 0) {
        showBrandValuesArea();
    }
}

/**
 * 添加品牌到列表
 * @param {string} brandName 品牌名稱
 * @param {string} brandStatus 狀態（默認為 Available）
 * @param {File} brandImageFile 圖片文件
 */
function addBrandToList(brandName, brandStatus = 'Available', brandImageFile = null) {
    // 檢查是否為重複項
    if (isBrandExists(brandName)) {
        console.log('Duplicate detected in batch add, skipping:', brandName);
        return; // 跳過重複項，不添加到列表
    }

    // 添加到 brandList 數組
    brandList.push({
        brandName: brandName,
        brandStatus: brandStatus,
        brandImageFile: brandImageFile
    });

    // 重新渲染整個列表
    updateBrandList();
    updateUI();

    // 顯示品牌值區域
    showBrandValuesArea();
}

// =============================================================================
// Update 頁面功能 (Update Page Functions)
// =============================================================================

/**
 * Update 頁面表單提交處理
 * @param {HTMLFormElement} form 表單元素
 */
function handleUpdateFormSubmit(form) {
    // 驗證表單
    if (!validateUpdateForm()) {
        return;
    }

    // 顯示加載狀態
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Updating...';
    submitBtn.disabled = true;

    // 準備表單數據
    const formData = new FormData(form);

    // 提交數據
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showAlert(data.message || 'Brand updated successfully', 'success');

            // 延遲重定向到列表頁面
            setTimeout(() => {
                window.location.href = window.brandManagementRoute || '/admin/management-tool/brand/index';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to update brand', 'error');
        }
    })
    .catch(error => {
        showAlert('Error updating brand: ' + error.message, 'error');
    })
    .finally(() => {
        // 恢復按鈕狀態
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

/**
 * Update 頁面表單驗證
 * @returns {boolean} 驗證結果
 */
function validateUpdateForm() {
    const brandNameInput = document.getElementById('brand_name');

    // 驗證品牌名稱
    if (!brandNameInput.value.trim()) {
        showAlert('Please enter brand name', 'warning');
        brandNameInput.focus();
        return false;
    }

    // 驗證狀態選擇
    const selectedStatus = document.querySelector('input[name="brand_status"]:checked');
    if (!selectedStatus) {
        showAlert('Please select brand status', 'warning');
        return false;
    }

    return true;
}

// =============================================================================
// 圖片預覽功能 (Image Preview Functions)
// =============================================================================

/**
 * 圖片預覽函數 - 用於模態框顯示
 * @param {string} src 圖片源
 */
function previewImage(src) {
    document.getElementById('previewImage').src = src;
    new bootstrap.Modal(document.getElementById('imagePreviewModal')).show();
}

/**
 * Create 頁面重置圖片（不顯示消息）
 */
function resetImageWithoutMessage() {
    console.log('resetImageWithoutMessage called');
    if (typeof window.ImageSystem !== 'undefined' && window.ImageSystem.resetImage) {
        console.log('Calling window.ImageSystem.resetImage');
        window.ImageSystem.resetImage('imageUploadArea', {
            showMessage: false,
            imageInputId: 'brand_image',
            previewImageId: 'preview-image',
            previewIconId: 'preview-icon',
            imageUploadContentId: 'imageUploadContent'
        });
    } else {
        console.log('window.ImageSystem.resetImage not available');
    }
}

// =============================================================================
// 表單驗證和提交 (Form Validation & Submission)
// =============================================================================

/**
 * 驗證品牌數據
 * @returns {boolean} 驗證結果
 */
function validateBrandData() {
    // 檢查是否有重複的品牌名稱
    const duplicates = [];
    const seen = new Set();
    for (const item of brandList) {
        const combination = item.brandName.toLowerCase();
        if (seen.has(combination)) {
            duplicates.push(item.brandName);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        showAlert(`Duplicate brand names found: ${duplicates.join(', ')}. Please remove duplicates before submitting.`, 'error');
        return false;
    }

    return true;
}

/**
 * 提交品牌表單
 */
function submitBrandForm() {
    // 調試信息：檢查要提交的數據
    console.log('Submitting brand data:', brandList);

    // 準備提交數據
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加品牌數據
    brandList.forEach((item, index) => {
        // 調試信息：檢查每個品牌的狀態
        console.log(`Brand ${index + 1}:`, { brandName: item.brandName, brandStatus: item.brandStatus });

        // 添加品牌文本數據
        formData.append(`brands[${index}][brandName]`, item.brandName);
        formData.append(`brands[${index}][brandStatus]`, item.brandStatus);

        // 添加圖片文件（如果有）
        if (item.brandImageFile) {
            formData.append(`images[${index}]`, item.brandImageFile);
        }
    });

    // 提交數據
    fetch(window.createBrandUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showAlert(data.message || 'Brands created successfully', 'success');

            // 延遲重定向到dashboard，讓用戶看到成功消息
            setTimeout(() => {
                window.location.href = window.brandManagementRoute || '/admin/management-tool/brand/index';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to create brands', 'error');
        }
    })
    .catch(error => {
        showAlert('Error creating brands: ' + error.message, 'error');
    });
}

// =============================================================================
// 頁面初始化功能 (Page Initialization Functions)
// =============================================================================

/**
 * 綁定品牌事件
 */
function bindBrandEvents() {
    // Create 頁面事件綁定
    bindBrandCreateEvents();

    // 使用統一的圖片處理模組（避免重複綁定）
    if (typeof window.ImageSystem !== 'undefined' && !window.ImageSystem._brandEventsBound) {
        window.ImageSystem.bindModuleImageEvents('brand');
        window.ImageSystem._brandEventsBound = true; // 標記已綁定
    } else if (typeof window.ImageSystem === 'undefined') {
        console.warn('ImageSystem not available, image functionality may not work properly');
    }

    // 表單提交事件監聽器
    const brandForm = document.getElementById('brandForm');
    if (brandForm) {
        brandForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 檢查是否有品牌
            if (brandList.length === 0) {
                showAlert('Please add at least one brand', 'warning');
                return;
            }

            // 驗證所有品牌數據
            if (!validateBrandData()) {
                return;
            }

            // 提交表單
            submitBrandForm();
        });
    }
}

/**
 * 綁定品牌創建頁面事件
 */
function bindBrandCreateEvents() {
    // 品牌名稱輸入框回車事件
    const brandNameInput = document.getElementById('brand_name');
    if (brandNameInput) {
        brandNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addBrand();
            }
        });
    }

    // 添加品牌按鈕
    const addBrandBtn = document.getElementById('addBrand');
    if (addBrandBtn) {
        addBrandBtn.addEventListener('click', addBrand);
    }

    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：刪除品牌按鈕
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            removeBrand(index);
        }
    });

    // 排序按鈕
    const sortBtn = document.getElementById('sortBrands');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 快速添加按鈕
    const addCommonBrandsBtn = document.getElementById('addCommonBrands');
    if (addCommonBrandsBtn) {
        addCommonBrandsBtn.addEventListener('click', addCommonBrands);
    }

    const addFashionBrandsBtn = document.getElementById('addFashionBrands');
    if (addFashionBrandsBtn) {
        addFashionBrandsBtn.addEventListener('click', addFashionBrands);
    }
}

/**
 * Update 頁面狀態卡片初始化
 */
function initializeUpdateStatusCards() {
    // 狀態卡片選擇
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            selectUpdateStatusCard(this);
        });
    });
}

/**
 * Update 頁面狀態卡片選擇
 * @param {HTMLElement} card 狀態卡片元素
 */
function selectUpdateStatusCard(card) {
    // 移除所有選中狀態
    const allCards = document.querySelectorAll('.status-card');
    allCards.forEach(c => c.classList.remove('selected'));

    // 添加選中狀態到當前卡片
    card.classList.add('selected');

    // 更新對應的單選按鈕
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
    }
}

/**
 * 初始化品牌更新頁面
 */
function initializeBrandUpdate() {
    bindBrandEvents();
    initializeUpdateStatusCards();
}

/**
 * 初始化品牌頁面
 * @param {Object} config 配置對象
 */
function initializeBrandPage(config) {
    bindBrandEvents();

    if (config && config.events) {
        // 綁定自定義事件
        Object.keys(config.events).forEach(eventName => {
            if (typeof config.events[eventName] === 'function') {
                // 這裡可以根據需要綁定特定事件
                console.log(`Custom event ${eventName} registered`);
            }
        });
    }
}

// =============================================================================
// 全局實例初始化 (Global Instance Initialization)
// =============================================================================

let brandDashboard;

$(document).ready(function() {
    // 檢查當前頁面是否是dashboard頁面（有table-body元素）
    if ($("#table-body").length > 0) {
        brandDashboard = new BrandDashboard();
    }
});

// =============================================================================
// 品牌操作功能 (Brand Operations)
// =============================================================================

/**
 * 處理品牌請求
 * @param {string} url 請求URL
 * @param {string} method HTTP方法
 * @param {Object} data 請求數據
 * @param {Object} options 選項
 */
function handleBrandRequest(url, method, data, options = {}) {
    const {
        successMessage = 'Operation completed successfully',
        errorMessage = 'Operation failed',
        redirect = null,
        onSuccess = null,
        onError = null
    } = options;

    const requestOptions = {
        method: method,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
    };

    // 添加數據到請求
    if (data) {
        if (data instanceof FormData) {
            requestOptions.body = data;
        } else {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(data);
        }
    }

    fetch(url, requestOptions)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showAlert(data.message || successMessage, 'success');

                if (onSuccess) {
                    onSuccess(data);
                }

                if (redirect) {
                    setTimeout(() => {
                        window.location.href = redirect;
                    }, 2000);
                }
            } else {
                showAlert(data.message || errorMessage, 'error');
                if (onError) {
                    onError(data);
                }
            }
        })
        .catch(error => {
            showAlert('Error: ' + error.message, 'error');
            if (onError) {
                onError(error);
            }
        });
}

/**
 * 創建品牌
 * @param {Object} brandData 品牌數據
 * @param {Object} options 選項
 */
function createBrand(brandData, options = {}) {
    const url = options.url || window.createBrandUrl;
    const method = 'POST';

    handleBrandRequest(url, method, brandData, {
        successMessage: 'Brand created successfully',
        errorMessage: 'Failed to create brand',
        redirect: window.brandManagementRoute,
        ...options
    });
}

/**
 * 更新品牌
 * @param {number} brandId 品牌ID
 * @param {Object} brandData 品牌數據
 * @param {Object} options 選項
 */
function updateBrand(brandId, brandData, options = {}) {
    const url = (options.url || window.updateBrandUrl).replace(':id', brandId);
    const method = 'POST';

    handleBrandRequest(url, method, brandData, {
        successMessage: 'Brand updated successfully',
        errorMessage: 'Failed to update brand',
        redirect: window.brandManagementRoute,
        ...options
    });
}

/**
 * 刪除品牌
 * @param {number} brandId 品牌ID
 * @param {Object} options 選項
 */
function deleteBrand(brandId, options = {}) {
    const url = (options.url || window.deleteBrandUrl).replace(':id', brandId);
    const method = 'DELETE';

    if (!confirm('Are you sure you want to delete this brand?')) {
        return;
    }

    handleBrandRequest(url, method, null, {
        successMessage: 'Brand deleted successfully',
        errorMessage: 'Failed to delete brand',
        redirect: null,
        onSuccess: () => {
            // 重新加載頁面或刷新數據
            if (window.brandDashboard && window.brandDashboard.fetchBrands) {
                window.brandDashboard.fetchBrands();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置品牌可用
 * @param {number} brandId 品牌ID
 * @param {Object} options 選項
 */
function setBrandAvailable(brandId, options = {}) {
    const url = (options.url || window.availableBrandUrl).replace(':id', brandId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to activate this brand?')) {
        return;
    }

    handleBrandRequest(url, method, null, {
        successMessage: 'Brand activated successfully',
        errorMessage: 'Failed to activate brand',
        redirect: null,
        onSuccess: () => {
            if (window.brandDashboard && window.brandDashboard.fetchBrands) {
                window.brandDashboard.fetchBrands();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置品牌不可用
 * @param {number} brandId 品牌ID
 * @param {Object} options 選項
 */
function setBrandUnavailable(brandId, options = {}) {
    const url = (options.url || window.unavailableBrandUrl).replace(':id', brandId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to deactivate this brand?')) {
        return;
    }

    handleBrandRequest(url, method, null, {
        successMessage: 'Brand deactivated successfully',
        errorMessage: 'Failed to deactivate brand',
        redirect: null,
        onSuccess: () => {
            if (window.brandDashboard && window.brandDashboard.fetchBrands) {
                window.brandDashboard.fetchBrands();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

// =============================================================================
// DOM 內容加載完成後的事件綁定 (DOM Content Loaded Event Binding)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // 初始化品牌事件（包括圖片上傳功能）
    bindBrandEvents();

    // Update 頁面表單提交
    const updateForm = document.querySelector('form[action*="update"]');
    if (updateForm) {
        updateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleUpdateFormSubmit(this);
        });
    }

    // Update 頁面狀態卡片初始化
    initializeUpdateStatusCards();
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

// 導出主要函數到全局作用域
window.addBrand = addBrand;
window.removeBrand = removeBrand;
window.clearForm = clearForm;
window.toggleBrandStatus = toggleBrandStatus;
window.setBrandAvailable = setBrandAvailable;
window.setBrandUnavailable = setBrandUnavailable;
window.updateBrandStatus = updateBrandStatus;
window.viewBrandDetails = viewBrandDetails;
