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

        // 全選/取消全選功能
        $('#select-all').on('change', (e) => {
            const isChecked = $(e.target).is(':checked');
            $('.brand-checkbox').prop('checked', isChecked);
            this.updateExportButton();
        });

        // 單個勾選框變化
        $(document).on('change', '.brand-checkbox', () => {
            this.updateSelectAllCheckbox();
            this.updateExportButton();
        });

        // 導出按鈕
        $('#export-brands-btn').on('click', () => {
            this.exportSelectedBrands();
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

        // 重置勾選框狀態
        this.updateSelectAllCheckbox();
        this.updateExportButton();

        // 隱藏空狀態（有數據時）
        $('#empty-state').addClass('d-none');
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
            <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="brandDashboard.editBrand(${brand.id})">
                <i class="bi bi-pencil"></i>
            </button>
            <div class="dropdown d-inline">
                <button class="btn btn-sm btn-outline-secondary" title="More" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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
                <td class="ps-4">
                    <input class="brand-checkbox form-check-input" type="checkbox" value="${brand.id}" id="brand-${brand.id}">
                </td>
                <td>
                    ${brand.brand_image ? `
                        <img src="/assets/images/${brand.brand_image}" alt="Brand Image"
                             class="rounded border border-2 border-white shadow-sm" style="width: 2.5rem; height: 2.5rem; object-fit: cover;">
                    ` : `
                        <div class="rounded border border-2 border-white shadow-sm bg-light d-flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem;">
                            <i class="bi bi-image text-muted"></i>
                        </div>
                    `}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-tag me-2 text-primary"></i>
                        <h6 class="mb-0 fw-bold">${brand.brand_name}</h6>
                    </div>
                </td>
                <td>
                    <span class="badge ${brand.brand_status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${brand.brand_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${brand.brand_status}
                    </span>
                </td>
                <td class="text-end pe-4"><div class="d-flex justify-content-end gap-1">${actionButtons}</div></td>
            </tr>
        `;
    }

    getStatusClass(status) {
        const statusMap = { 'Available': 'available', 'Unavailable': 'unavailable' };
        return statusMap[status] || 'default';
    }

    showNoResults() {
        // 清空表格體
        $('#table-body').empty();

        // 顯示空狀態組件（包含創建按鈕）
        $('#empty-state').removeClass('d-none');

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
            this.showAlert('Failed to delete brand', 'error');
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
            this.showAlert('Failed to set brand available', 'error');
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
            this.showAlert('Failed to set brand unavailable', 'error');
        });
    }

    // =============================================================================
    // 勾選框管理模塊 (Checkbox Management Module)
    // =============================================================================

    /**
     * 更新全選勾選框狀態
     */
    updateSelectAllCheckbox() {
        const totalCheckboxes = $('.brand-checkbox').length;
        const checkedCheckboxes = $('.brand-checkbox:checked').length;
        const selectAllCheckbox = $('#select-all');

        if (totalCheckboxes === 0) {
            selectAllCheckbox.prop('checked', false).prop('indeterminate', false);
        } else if (checkedCheckboxes === totalCheckboxes) {
            selectAllCheckbox.prop('checked', true).prop('indeterminate', false);
        } else if (checkedCheckboxes > 0) {
            selectAllCheckbox.prop('checked', false).prop('indeterminate', true);
        } else {
            selectAllCheckbox.prop('checked', false).prop('indeterminate', false);
        }
    }

    /**
     * 更新導出按鈕狀態
     */
    updateExportButton() {
        const checkedCount = $('.brand-checkbox:checked').length;
        const exportBtn = $('#export-brands-btn');

        if (checkedCount > 0) {
            exportBtn.prop('disabled', false);
            exportBtn.html(`<i class="bi bi-download me-2"></i>Export Data (${checkedCount})`);
        } else {
            exportBtn.prop('disabled', true);
            exportBtn.html('<i class="bi bi-download me-2"></i>Export Data');
        }
    }

    /**
     * 導出選中的品牌
     */
    exportSelectedBrands() {
        const selectedIds = $('.brand-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            this.showAlert('Please select at least one brand to export', 'warning');
            return;
        }

        // 獲取當前篩選條件
        const search = this.searchTerm || '';
        const statusFilter = this.statusFilter || '';

        const params = new URLSearchParams({
            ids: selectedIds.join(','),
            search: search,
            status_filter: statusFilter,
        });

        // 使用新的Excel導出路由
        const exportUrl = `${window.brandExportUrl}?${params}`;

        // 顯示加載提示
        this.showAlert('Generating Excel file, please wait...', 'info');

        // 創建隱藏的鏈接來觸發下載
        const link = document.createElement('a');
        link.href = exportUrl;
        link.download = '';
        link.classList.add('d-none');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 延遲隱藏提示
        setTimeout(() => {
            this.hideAlert();
        }, 2000);
    }

    /**
     * 隱藏提示信息
     */
    hideAlert() {
        const alertElement = document.querySelector('.alert');
        if (alertElement) {
            alertElement.remove();
        }
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
    resetImageWithoutMessage('brand');

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
        showAlert('Failed to remove brand', 'error');
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
        // 檢查是否為重複項
        const isDuplicate = isBrandExists(item.brandName) &&
            brandList.filter(i => i.brandName.toLowerCase() === item.brandName.toLowerCase()).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 bg-light rounded border fade-in';
        const duplicateClasses = isDuplicate ? 'border-warning' : '';

        const brandItem = document.createElement('div');
        brandItem.className = `${baseClasses} ${duplicateClasses}`;

        brandItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-3">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                <div class="me-3 flex-shrink-0">
                    ${item.brandImageFile ?
                        `<img src="${URL.createObjectURL(item.brandImageFile)}" class="img-thumbnail" style="width: 3.125rem; height: 3.125rem; object-fit: cover;" alt="Brand Image">` :
                        `<div class="bg-light border rounded d-flex align-items-center justify-content-center" style="width: 3.125rem; height: 3.125rem;">
                            <i class="bi bi-tag text-muted fs-5"></i>
                        </div>`
                    }
                </div>
                <div class="flex-grow-1 min-width-0">
                    <div class="fw-bold text-dark mb-1 text-truncate">
                        <i class="bi bi-tag me-2 text-primary"></i>${item.brandName}
                    </div>
                    ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2 mt-1">Duplicate</span>' : ''}
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" data-index="${index}">
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
        const value = item.querySelector('.fw-bold').textContent.trim();
        if (value.toLowerCase() === brandName.toLowerCase()) {
            // 添加 Bootstrap 高亮樣式
            item.classList.add('border-warning');

            // 滾動到該元素
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 3秒後移除高亮
            setTimeout(() => {
                item.classList.remove('border-warning');
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
        initialMessage.classList.add('d-none');
    }

    // 顯示品牌值區域
    const brandValuesArea = document.getElementById('brandValuesArea');
    if (brandValuesArea) {
        brandValuesArea.classList.remove('d-none');
    }

    // 更新品牌名稱顯示
    updateBrandNameDisplay();

    // 顯示提交按鈕
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.classList.remove('d-none');
    }
}

/**
 * 隱藏所有區域
 */
function hideAllAreas() {
    // 隱藏品牌值區域
    const brandValuesArea = document.getElementById('brandValuesArea');
    if (brandValuesArea) {
        brandValuesArea.classList.add('d-none');
    }

    // 隱藏提交按鈕
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.classList.add('d-none');
    }

    // 顯示初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.classList.remove('d-none');
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
        value: item.querySelector('.fw-bold').textContent.trim()
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
            const message = data.message || 'Brand updated successfully';
            showAlert(message, 'success');

            // 延遲重定向到列表頁面
            setTimeout(() => {
                window.location.href = window.brandManagementRoute || '/admin/management-tool/brand/index';
            }, 2000);
        } else {
            isBrandUpdating = false; // 錯誤時重置標誌
            showAlert(data.message || 'Failed to update brand', 'error');
        }
    })
    .catch(error => {
        isBrandUpdating = false; // 錯誤時重置標誌
        showAlert('Failed to update brand', 'error');
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

// 图片处理函数已移至 image-system.js

// =============================================================================
// 圖片預覽功能 (Image Preview Functions)
// =============================================================================

/**
 * 圖片預覽函數 - 用於模態框顯示
 * @param {string} src 圖片源
 */

// resetImageWithoutMessage 函数已移至 image-system.js

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
        showAlert('Duplicate brand names found. Please remove duplicates before submitting.', 'error');
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
        showAlert('Some brands failed to create', 'error');
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
        if (e.target.closest('button[data-index]')) {
            const button = e.target.closest('button[data-index]');
            const index = parseInt(button.getAttribute('data-index'));
            removeBrand(index);
        }
    });

    // 排序按鈕
    const sortBtn = document.getElementById('sortBrands');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
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

// 全局變量防止重複請求
let isBrandUpdating = false;
let brandUpdateFormBound = false;

/**
 * 初始化品牌更新頁面
 */
function initializeBrandUpdate() {
    bindBrandEvents();

    // Update 頁面表單提交 - 確保只綁定一次
    if (!brandUpdateFormBound) {
        const updateForm = document.querySelector('form[action*="update"]');
        if (updateForm) {
            updateForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (isBrandUpdating) return false;
                isBrandUpdating = true;
                handleUpdateFormSubmit(this);
            });
            brandUpdateFormBound = true;
        }
    }

    // Update 頁面圖片預覽
    const updateImageInput = document.getElementById('input_image');
    if (updateImageInput) {
        updateImageInput.addEventListener('change', handleUpdateImagePreview);
    }

    // Update 頁面圖片上傳區域點擊事件
    const imagePreviewArea = document.getElementById('image-preview');
    if (imagePreviewArea && updateImageInput) {
        imagePreviewArea.addEventListener('click', function(e) {
            // 只檢查是否點擊了移除按鈕
            if (e.target.closest('.img-remove-btn')) {
                return; // 不觸發文件選擇
            }
            updateImageInput.click();
        });
    }

    // Update 頁面移除圖片按鈕
    const removeImageBtn = document.getElementById('removeImage');
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', handleRemoveImageButton);

        // 檢查初始狀態：如果沒有圖片，隱藏按鈕
        const previewContainer = document.getElementById('image-preview');
        if (previewContainer) {
            const hasImage = previewContainer.querySelector('img');
            if (!hasImage) {
                removeImageBtn.classList.add('d-none');
            }
        }
    }

    // Update 頁面狀態卡片初始化
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

    // Update 頁面表單提交 - 確保只綁定一次
    if (!brandUpdateFormBound) {
        const updateForm = document.querySelector('form[action*="update"]');
        if (updateForm) {
            updateForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (isBrandUpdating) return false;
                isBrandUpdating = true;
                handleUpdateFormSubmit(this);
            });
            brandUpdateFormBound = true;
        }
    }

    // Update 頁面圖片預覽
    const updateImageInput = document.getElementById('input_image');
    if (updateImageInput) {
        updateImageInput.addEventListener('change', handleUpdateImagePreview);
    }

    // Update 頁面移除圖片按鈕
    const removeImageBtn = document.getElementById('removeImage');
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', handleRemoveImageButton);

        // 檢查初始狀態：如果沒有圖片，隱藏按鈕
        const previewContainer = document.getElementById('image-preview');
        if (previewContainer) {
            const hasImage = previewContainer.querySelector('img');
            if (!hasImage) {
                removeImageBtn.classList.add('d-none');
            }
        }
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
window.handleRemoveImageButton = handleRemoveImageButton;
window.removeUpdateImage = removeUpdateImage;
