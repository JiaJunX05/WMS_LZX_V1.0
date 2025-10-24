/**
 * Subcategory Management JavaScript
 * 子分類管理統一交互邏輯
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

// 子分類列表數組（用於 Create 頁面）
let subcategoryList = [];

// 排序狀態：true = 升序，false = 降序
let isAscending = false; // 默認降序（最新的在上面）

// =============================================================================
// Dashboard 頁面功能 (Dashboard Page Functions)
// =============================================================================

/**
 * Subcategory Dashboard 類
 * 子分類儀表板頁面交互邏輯
 */
class SubcategoryDashboard {
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
        this.fetchSubcategories();
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

        // 全選/取消全選功能
        $('#select-all').on('change', (e) => {
            const isChecked = $(e.target).is(':checked');
            $('.subcategory-checkbox').prop('checked', isChecked);
            this.updateExportButton();
        });

        // 單個勾選框變化
        $(document).on('change', '.subcategory-checkbox', () => {
            this.updateSelectAllCheckbox();
            this.updateExportButton();
        });

        // 導出按鈕
        $('#export-subcategories-btn').on('click', () => {
            this.exportSelectedSubcategories();
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
     * 獲取子分類數據
     * @param {number} page 頁碼
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
                this.showAlert('Failed to load subcategories', 'danger');
            });
    }

    /**
     * 處理搜索
     */
    handleSearch() {
        this.fetchSubcategories(1);
    }

    /**
     * 處理篩選
     */
    handleFilter() {
        this.fetchSubcategories(1);
    }

    /**
     * 清除所有篩選條件
     */
    clearFilters() {
        this.statusFilter = '';
        this.searchTerm = '';

        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchSubcategories(1);
    }

    /**
     * 更新統計數據
     * @param {Object} response API響應數據
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-subcategories').text(total);

        // 計算活躍和非活躍子分類數量
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
     * 渲染子分類列表
     * @param {Array} subcategories 子分類數據數組
     */
    renderSubcategories(subcategories) {
        const $tableBody = $('#table-body');
        const html = subcategories.map(subcategory => this.createSubcategoryRow(subcategory)).join('');
        $tableBody.html(html);

        // 重置勾選框狀態
        this.updateSelectAllCheckbox();
        this.updateExportButton();
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
            <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="subcategoryDashboard.editSubcategory(${subcategory.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="subcategoryDashboard.deleteSubcategory(${subcategory.id})">
                            <i class="bi bi-trash me-2"></i> Delete Subcategory
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4">
                    <input class="subcategory-checkbox" type="checkbox" value="${subcategory.id}" id="subcategory-${subcategory.id}" style="width: 20px; height: 20px;">
                </td>
                <td>
                    ${subcategory.subcategory_image ? `
                        <img src="/assets/images/${subcategory.subcategory_image}" alt="Subcategory Image"
                             class="rounded border border-2 border-white shadow-sm" style="width: 2.5rem; height: 2.5rem; object-fit: cover;">
                    ` : `
                        <div class="rounded border border-2 border-white shadow-sm bg-light d-flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem;">
                            <i class="bi bi-image text-muted"></i>
                        </div>
                    `}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-collection me-2 text-primary"></i>
                        <h6 class="mb-0 fw-bold">${subcategory.subcategory_name}</h6>
                    </div>
                </td>
                <td>
                    <span class="badge ${subcategory.subcategory_status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${subcategory.subcategory_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${subcategory.subcategory_status}
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
    // 子分類操作模塊 (Subcategory Operations Module)
    // =============================================================================

    /**
     * 編輯子分類
     * @param {number} subcategoryId 子分類ID
     */
    editSubcategory(subcategoryId) {
        const url = window.editSubcategoryUrl.replace(':id', subcategoryId);
        window.location.href = url;
    }

    /**
     * 刪除子分類
     * @param {number} subcategoryId 子分類ID
     */
    deleteSubcategory(subcategoryId) {
        if (!confirm('Are you sure you want to delete this subcategory?')) return;

        fetch(window.deleteSubcategoryUrl.replace(':id', subcategoryId), {
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
                this.showAlert(data.message || 'Subcategory deleted successfully', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchSubcategories(1);
                } else {
                    // 重新載入當前頁面的子分類列表
                    this.fetchSubcategories(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to delete subcategory', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to delete subcategory', 'error');
        });
    }

    /**
     * 激活子分類
     * @param {number} subcategoryId 子分類ID
     */
    setAvailable(subcategoryId) {
        if (!confirm('Are you sure you want to activate this subcategory?')) return;

        fetch(window.availableSubcategoryUrl.replace(':id', subcategoryId), {
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
                this.showAlert(data.message || 'Subcategory has been set to available status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchSubcategories(1);
                } else {
                    // 重新載入當前頁面的子分類列表
                    this.fetchSubcategories(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set subcategory available', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set subcategory available', 'error');
        });
    }

    /**
     * 停用子分類
     * @param {number} subcategoryId 子分類ID
     */
    setUnavailable(subcategoryId) {
        if (!confirm('Are you sure you want to deactivate this subcategory?')) return;

        fetch(window.unavailableSubcategoryUrl.replace(':id', subcategoryId), {
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
                this.showAlert(data.message || 'Subcategory has been set to unavailable status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchSubcategories(1);
                } else {
                    // 重新載入當前頁面的子分類列表
                    this.fetchSubcategories(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set subcategory unavailable', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set subcategory unavailable', 'error');
        });
    }

    // =============================================================================
    // 勾選框管理模塊 (Checkbox Management Module)
    // =============================================================================

    /**
     * 更新全選勾選框狀態
     */
    updateSelectAllCheckbox() {
        const totalCheckboxes = $('.subcategory-checkbox').length;
        const checkedCheckboxes = $('.subcategory-checkbox:checked').length;
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
        const checkedCount = $('.subcategory-checkbox:checked').length;
        const exportBtn = $('#export-subcategories-btn');

        if (checkedCount > 0) {
            exportBtn.prop('disabled', false);
            exportBtn.html(`<i class="bi bi-download me-2"></i>Export Data (${checkedCount})`);
        } else {
            exportBtn.prop('disabled', true);
            exportBtn.html('<i class="bi bi-download me-2"></i>Export Data');
        }
    }

    /**
     * 導出選中的子分類
     */
    exportSelectedSubcategories() {
        const selectedIds = $('.subcategory-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            this.showAlert('Please select at least one subcategory to export', 'warning');
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
        const exportUrl = `${window.subcategoryExportUrl}?${params}`;

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
 * 添加子分類到數組
 * @param {string} subcategoryName 子分類名稱
 * @param {File} subcategoryImageFile 圖片文件
 */
function addSubcategoryToArray(subcategoryName, subcategoryImageFile) {
    // 調試信息：檢查傳入的數據
    console.log('addSubcategoryToArray called with:', { subcategoryName, subcategoryImageFile });

    // 添加子分類到數組
    const subcategoryData = {
        subcategoryName: subcategoryName,
        subcategoryStatus: 'Available', // 默認為 Available
        subcategoryImageFile: subcategoryImageFile // 存儲文件對象而不是base64
    };

    subcategoryList.push(subcategoryData);

    // 更新UI
    updateSubcategoryList();
    updateUI();

    // 顯示右邊的子分類表格
    showSubcategoryValuesArea();

    // 清空輸入框
    const subcategoryNameInput = document.getElementById('subcategory_name');
    if (subcategoryNameInput) {
        subcategoryNameInput.value = '';
    }

    // 清空圖片（不顯示消息）
    resetImageWithoutMessage('subcategory');

    // 調試信息：檢查添加後的狀態
    console.log('After adding subcategory, current list length:', subcategoryList.length);
}

/**
 * 檢查子分類名稱是否已存在（簡化版本，用於當前頁面）
 * @param {string} subcategoryName 子分類名稱
 * @returns {boolean} 是否存在
 */
function isSubcategoryExists(subcategoryName) {
    return subcategoryList.some(item => item.subcategoryName.toLowerCase() === subcategoryName.toLowerCase());
}

/**
 * 添加子分類
 */
function addSubcategory() {
    const subcategoryNameInput = document.getElementById('subcategory_name');

    const subcategoryName = subcategoryNameInput.value.trim();

    // 驗證輸入
    if (!subcategoryName) {
        showAlert('Please enter subcategory name', 'warning');
        subcategoryNameInput.focus();
        return;
    }

    // 檢查是否已存在
    if (isSubcategoryExists(subcategoryName)) {
        showAlert(`Subcategory name "${subcategoryName}" already exists in the list`, 'error');
        highlightExistingSubcategory(subcategoryName);
        subcategoryNameInput.focus();
        return;
    }

    // 獲取當前圖片文件
    const imageInput = document.getElementById('subcategory_image');
    let subcategoryImageFile = null;
    if (imageInput && imageInput.files && imageInput.files[0]) {
        subcategoryImageFile = imageInput.files[0];
    }

    // 添加到子分類數組（狀態默認為 Available）
    addSubcategoryToArray(subcategoryName, subcategoryImageFile);

    // 顯示成功提示
    showAlert('Subcategory added successfully', 'success');
}

/**
 * 移除子分類
 * @param {number} index 索引
 */
function removeSubcategory(index) {
    console.log('Removing subcategory at index:', index);
    console.log('Subcategory list before removal:', subcategoryList);

    // 確認機制
    if (!confirm('Are you sure you want to remove this subcategory?')) {
        return;
    }

    if (index >= 0 && index < subcategoryList.length) {
        subcategoryList.splice(index, 1);
        console.log('Subcategory list after removal:', subcategoryList);
        updateSubcategoryList();
        updateUI();

        // 顯示成功移除的 alert
        showAlert('Subcategory removed successfully', 'success');
    } else {
        console.error('Invalid index:', index);
        showAlert('Failed to remove subcategory', 'error');
    }
}

/**
 * 清除表單
 */
function clearForm() {
    // 檢查是否有數據需要清除
    if (subcategoryList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 確認清除
    if (!confirm('Are you sure you want to clear all subcategories?')) {
        return;
    }

    // 清空數組
    subcategoryList = [];

    // 清空輸入框
    const subcategoryNameInput = document.getElementById('subcategory_name');
    if (subcategoryNameInput) {
        subcategoryNameInput.value = '';
    }

    // 更新UI
    updateSubcategoryList();
    updateUI();

    // 顯示成功提示
    showAlert('All subcategories cleared successfully', 'success');

    // 隱藏所有區域
    hideAllAreas();
}

/**
 * 更新子分類列表
 */
function updateSubcategoryList() {
    const container = document.getElementById('subcategoryValuesList');
    if (!container) return;

    container.innerHTML = '';

    subcategoryList.forEach((item, index) => {
        // 檢查是否為重複項
        const isDuplicate = isSubcategoryExists(item.subcategoryName) &&
            subcategoryList.filter(i => i.subcategoryName.toLowerCase() === item.subcategoryName.toLowerCase()).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 bg-light rounded border fade-in';
        const duplicateClasses = isDuplicate ? 'border-warning' : '';

        const subcategoryItem = document.createElement('div');
        subcategoryItem.className = `${baseClasses} ${duplicateClasses}`;

        subcategoryItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-3">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                <div class="me-3 flex-shrink-0">
                    ${item.subcategoryImageFile ?
                        `<img src="${URL.createObjectURL(item.subcategoryImageFile)}" class="img-thumbnail" style="width: 3.125rem; height: 3.125rem; object-fit: cover;" alt="Subcategory Image">` :
                        `<div class="bg-light border rounded d-flex align-items-center justify-content-center" style="width: 3.125rem; height: 3.125rem;">
                            <i class="bi bi-collection text-muted fs-5"></i>
                        </div>`
                    }
                </div>
                <div class="flex-grow-1 min-width-0">
                    <div class="fw-bold text-dark mb-1 text-truncate">
                        <i class="bi bi-collection me-2 text-primary"></i>${item.subcategoryName}
                    </div>
                    ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2 mt-1">Duplicate</span>' : ''}
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;

        container.appendChild(subcategoryItem);
    });
}

/**
 * 高亮顯示列表中已存在的子分類名稱
 * @param {string} subcategoryName 子分類名稱
 */
function highlightExistingSubcategory(subcategoryName) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.fw-bold').textContent.trim();
        if (value.toLowerCase() === subcategoryName.toLowerCase()) {
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
 * 顯示子分類值區域
 */
function showSubcategoryValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }

    // 顯示子分類值區域
    const subcategoryValuesArea = document.getElementById('subcategoryValuesArea');
    if (subcategoryValuesArea) {
        subcategoryValuesArea.classList.remove('d-none');
    }

    // 更新子分類名稱顯示
    updateSubcategoryNameDisplay();

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
    // 隱藏子分類值區域
    const subcategoryValuesArea = document.getElementById('subcategoryValuesArea');
    if (subcategoryValuesArea) {
        subcategoryValuesArea.classList.add('d-none');
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

// =============================================================================
// UI 更新功能 (UI Update Functions)
// =============================================================================

/**
 * 更新UI（簡化版本，用於當前頁面）
 */
function updateUI() {
    // 更新子分類值計數
    updateSubcategoryValuesCount();

    // 更新子分類範圍顯示
    updateSubcategoryRangeDisplay();

    // 更新子分類名稱顯示
    updateSubcategoryNameDisplay();

    // 如果沒有子分類，隱藏所有區域並顯示初始狀態
    if (subcategoryList.length === 0) {
        hideAllAreas();
    }
}

/**
 * 更新子分類值計數
 */
function updateSubcategoryValuesCount() {
    const count = subcategoryList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('subcategoryValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} subcategories`;
    }
}


function updateSubcategoryNameDisplay() {
    const subcategoryNameSpan = document.getElementById('subcategoryName');
    if (subcategoryNameSpan) {
        if (subcategoryList.length > 0) {
            // 顯示子分類數量
            subcategoryNameSpan.textContent = `- ${subcategoryList.length} subcategories`;
        } else {
            subcategoryNameSpan.textContent = '';
        }
    }
}

function updateSubcategoryRangeDisplay() {
    const subcategoryNames = subcategoryList.map(item => item.subcategoryName);

    const selectedSubcategorySpan = document.getElementById('selectedSubcategory');
    if (selectedSubcategorySpan) {
        if (subcategoryNames.length === 0) {
            selectedSubcategorySpan.textContent = 'None';
        } else if (subcategoryNames.length === 1) {
            selectedSubcategorySpan.textContent = subcategoryNames[0];
        } else {
            // 按字母順序排序
            const sortedNames = subcategoryNames.sort();
            const minSubcategory = sortedNames[0];
            const maxSubcategory = sortedNames[sortedNames.length - 1];
            selectedSubcategorySpan.textContent = `${minSubcategory} - ${maxSubcategory}`;
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
    const sortBtn = document.getElementById('sortSubcategories');

    // 更新圖標
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortSubcategoryValuesList();
}

/**
 * 排序子分類值列表
 */
function sortSubcategoryValuesList() {
    const subcategoryValuesList = document.getElementById('subcategoryValuesList');
    const items = Array.from(subcategoryValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取子分類名稱並排序
    const subcategoryValues = items.map(item => ({
        element: item,
        value: item.querySelector('.fw-bold').textContent.trim()
    }));

    // 按字母順序排序
    subcategoryValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    subcategoryValues.forEach(({ element }) => {
        subcategoryValuesList.appendChild(element);
    });
}

// =============================================================================
// 批量添加功能 (Batch Add Functions)
// =============================================================================


/**
 * 添加子分類到列表
 * @param {string} subcategoryName 子分類名稱
 * @param {string} subcategoryStatus 狀態（默認為 Available）
 * @param {File} subcategoryImageFile 圖片文件
 */
function addSubcategoryToList(subcategoryName, subcategoryStatus = 'Available', subcategoryImageFile = null) {
    // 檢查是否為重複項
    if (isSubcategoryExists(subcategoryName)) {
        console.log('Duplicate detected in batch add, skipping:', subcategoryName);
        return; // 跳過重複項，不添加到列表
    }

    // 添加到 subcategoryList 數組
    subcategoryList.push({
        subcategoryName: subcategoryName,
        subcategoryStatus: subcategoryStatus,
        subcategoryImageFile: subcategoryImageFile
    });

    // 重新渲染整個列表
    updateSubcategoryList();
    updateUI();

    // 顯示子分類值區域
    showSubcategoryValuesArea();
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
            showAlert(data.message || 'Subcategory updated successfully', 'success');

            // 延遲重定向到列表頁面
            setTimeout(() => {
                window.location.href = window.subcategoryManagementRoute || '/admin/category-mapping/subcategory/index';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to update subcategory', 'error');
        }
    })
    .catch(error => {
            showAlert('Failed to update subcategory', 'error');
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
    const subcategoryNameInput = document.getElementById('subcategory_name');

    // 驗證子分類名稱
    if (!subcategoryNameInput.value.trim()) {
        showAlert('Please enter subcategory name', 'warning');
        subcategoryNameInput.focus();
        return false;
    }

    // 驗證狀態選擇
    const selectedStatus = document.querySelector('input[name="subcategory_status"]:checked');
    if (!selectedStatus) {
        showAlert('Please select subcategory status', 'warning');
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
 * 驗證子分類數據
 * @returns {boolean} 驗證結果
 */
function validateSubcategoryData() {
    // 檢查是否有重複的子分類名稱
    const duplicates = [];
    const seen = new Set();
    for (const item of subcategoryList) {
        const combination = item.subcategoryName.toLowerCase();
        if (seen.has(combination)) {
            duplicates.push(item.subcategoryName);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        showAlert('Duplicate subcategory names found. Please remove duplicates before submitting.', 'error');
        return false;
    }

    return true;
}

/**
 * 提交子分類表單
 */
function submitSubcategoryForm() {
    // 調試信息：檢查要提交的數據
    console.log('Submitting subcategory data:', subcategoryList);

    // 準備提交數據
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加子分類數據
    subcategoryList.forEach((item, index) => {
        // 調試信息：檢查每個子分類的狀態
        console.log(`Subcategory ${index + 1}:`, { subcategoryName: item.subcategoryName, subcategoryStatus: item.subcategoryStatus });

        // 添加子分類文本數據
        formData.append(`subcategories[${index}][subcategoryName]`, item.subcategoryName);
        formData.append(`subcategories[${index}][subcategoryStatus]`, item.subcategoryStatus);

        // 添加圖片文件（如果有）
        if (item.subcategoryImageFile) {
            formData.append(`images[${index}]`, item.subcategoryImageFile);
        }
    });

    // 提交數據
    fetch(window.createSubcategoryUrl, {
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
            showAlert(data.message || 'Subcategories created successfully', 'success');

            // 延遲重定向到dashboard，讓用戶看到成功消息
            setTimeout(() => {
                window.location.href = window.subcategoryManagementRoute || '/admin/category-mapping/subcategory/index';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to create subcategories', 'error');
        }
    })
    .catch(error => {
        showAlert('Some subcategories failed to create', 'error');
    });
}

// =============================================================================
// 頁面初始化功能 (Page Initialization Functions)
// =============================================================================

/**
 * 綁定子分類事件
 */
function bindSubcategoryEvents() {
    // Create 頁面事件綁定
    bindSubcategoryCreateEvents();

    // 使用統一的圖片處理模組（避免重複綁定）
    if (typeof window.ImageSystem !== 'undefined' && !window.ImageSystem._subcategoryEventsBound) {
        window.ImageSystem.bindModuleImageEvents('subcategory');
        window.ImageSystem._subcategoryEventsBound = true; // 標記已綁定
    } else if (typeof window.ImageSystem === 'undefined') {
        console.warn('ImageSystem not available, image functionality may not work properly');
    }

    // 表單提交事件監聽器
    const subcategoryForm = document.getElementById('subcategoryForm');
    if (subcategoryForm) {
        subcategoryForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 檢查是否有子分類
            if (subcategoryList.length === 0) {
                showAlert('Please add at least one subcategory', 'warning');
                return;
            }

            // 驗證所有子分類數據
            if (!validateSubcategoryData()) {
                return;
            }

            // 提交表單
            submitSubcategoryForm();
        });
    }
}

/**
 * 綁定子分類創建頁面事件
 */
function bindSubcategoryCreateEvents() {
    // 子分類名稱輸入框回車事件
    const subcategoryNameInput = document.getElementById('subcategory_name');
    if (subcategoryNameInput) {
        subcategoryNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSubcategory();
            }
        });
    }

    // 添加子分類按鈕
    const addSubcategoryBtn = document.getElementById('addSubcategory');
    if (addSubcategoryBtn) {
        addSubcategoryBtn.addEventListener('click', addSubcategory);
    }


    // 事件委托：刪除子分類按鈕
    document.addEventListener('click', function(e) {
        if (e.target.closest('button[data-index]')) {
            const button = e.target.closest('button[data-index]');
            const index = parseInt(button.getAttribute('data-index'));
            removeSubcategory(index);
        }
    });

    // 排序按鈕
    const sortBtn = document.getElementById('sortSubcategories');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

}

/**
 * 初始化子分類更新頁面
 */
function initializeSubcategoryUpdate() {
    bindSubcategoryEvents();

    // Update 頁面表單提交
    const updateForm = document.querySelector('form[action*="update"]');
    if (updateForm) {
        updateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleUpdateFormSubmit(this);
        });
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
    initializeStatusCards();
}

/**
 * 初始化子分類頁面
 * @param {Object} config 配置對象
 */
function initializeSubcategoryPage(config) {
    bindSubcategoryEvents();

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

let subcategoryDashboard;

$(document).ready(function() {
    // 檢查當前頁面是否是dashboard頁面（有table-body元素）
    if ($("#table-body").length > 0) {
        subcategoryDashboard = new SubcategoryDashboard();
    }
});

// =============================================================================
// DOM 內容加載完成後的事件綁定 (DOM Content Loaded Event Binding)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // 初始化子分類事件（包括圖片上傳功能）
    bindSubcategoryEvents();

    // Update 頁面表單提交
    const updateForm = document.querySelector('form[action*="update"]');
    if (updateForm) {
        updateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleUpdateFormSubmit(this);
        });
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
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

// 導出主要函數到全局作用域
window.addSubcategory = addSubcategory;
window.removeSubcategory = removeSubcategory;
window.clearForm = clearForm;
window.toggleSubcategoryStatus = toggleSubcategoryStatus;
window.setSubcategoryAvailable = setSubcategoryAvailable;
window.setSubcategoryUnavailable = setSubcategoryUnavailable;
window.updateSubcategoryStatus = updateSubcategoryStatus;
window.viewSubcategoryDetails = viewSubcategoryDetails;
window.handleRemoveImageButton = handleRemoveImageButton;
window.removeUpdateImage = removeUpdateImage;
