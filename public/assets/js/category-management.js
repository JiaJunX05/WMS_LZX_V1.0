/**
 * Category Management JavaScript
 * 分類管理統一 JavaScript 文件
 *
 * 功能模塊：
 * - Dashboard 頁面：搜索、篩選、分頁、CRUD 操作
 * - Create 頁面：批量創建、表單驗證、狀態管理
 * - Update 頁面：編輯更新、圖片處理、表單提交
 * - 通用功能：API 請求、UI 更新、事件綁定
 */

// =============================================================================
// 全局變量和配置 (Global Variables and Configuration)
// =============================================================================

// Category 列表數組（用於 Create 頁面）
let categoryList = [];
let isAscending = false; // 排序狀態：true = 升序，false = 降序

// =============================================================================
// Category Dashboard 類 (Category Dashboard Class)
// =============================================================================

class CategoryDashboard {
    constructor() {
        // 狀態管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.categoryFilter = '';
        this.statusFilter = '';

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模塊 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.fetchCategories();
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
        $('#category-filter').on('change', (e) => {
            this.categoryFilter = $(e.target).val();
            this.handleFilter();
        });

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
            this.fetchCategories(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchCategories(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchCategories(this.currentPage + 1);
            }
        });

        // 全選/取消全選功能
        $('#select-all').on('change', (e) => {
            const isChecked = $(e.target).is(':checked');
            $('.category-checkbox').prop('checked', isChecked);
            this.updateExportButton();
        });

        // 單個勾選框變化
        $(document).on('change', '.category-checkbox', () => {
            this.updateSelectAllCheckbox();
            this.updateExportButton();
        });

        // 導出按鈕
        $('#export-categories-btn').on('click', () => {
            this.exportSelectedCategories();
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
            category_id: this.categoryFilter,
            category_status: this.statusFilter,
            perPage: 10
        };
    }

    /**
     * 獲取分類數據
     * @param {number} page 頁碼
     */
    fetchCategories(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.categoryManagementRoute;

        $.get(apiRoute, params)
            .done((response) => {
                if (response.data && response.data.length > 0) {
                    this.renderCategories(response.data);
                    this.updatePaginationInfo(response);
                } else {
                    this.showNoResults();
                }
                this.updateStatistics(response);
                this.updateResultsCount(response);
                this.generatePagination(response);
            })
            .fail((xhr, status, error) => {
                this.showAlert('Failed to load categories', 'danger');
            });
    }

    /**
     * 處理搜索
     */
    handleSearch() {
        this.fetchCategories(1);
    }

    /**
     * 處理篩選
     */
    handleFilter() {
        this.fetchCategories(1);
    }

    /**
     * 清除所有篩選條件
     */
    clearFilters() {
        this.categoryFilter = '';
        this.statusFilter = '';
        this.searchTerm = '';

        $('#category-filter').val('');
        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchCategories(1);
    }

    /**
     * 更新統計數據
     * @param {Object} response API響應數據
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-categories').text(total);

        // 計算活躍和非活躍分類數量
        if (response.data) {
            const activeCount = response.data.filter(cat => cat.category_status === 'Available').length;
            const inactiveCount = response.data.filter(cat => cat.category_status === 'Unavailable').length;
            const withImageCount = response.data.filter(cat => cat.category_image).length;

            $('#active-categories').text(activeCount);
            $('#inactive-categories').text(inactiveCount);
            $('#categories-with-image').text(withImageCount);
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
     * 渲染分類列表
     * @param {Array} categories 分類數據數組
     */
    renderCategories(categories) {
        const $tableBody = $('#table-body');
        const html = categories.map(category => this.createCategoryRow(category)).join('');
        $tableBody.html(html);

        // 重置勾選框狀態
        this.updateSelectAllCheckbox();
        this.updateExportButton();
    }

    createCategoryRow(category) {
        const statusMenuItem = category.category_status === 'Unavailable'
            ? `<a class="dropdown-item" href="javascript:void(0)" onclick="categoryDashboard.setAvailable(${category.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate Category
               </a>`
            : `<a class="dropdown-item" href="javascript:void(0)" onclick="categoryDashboard.setUnavailable(${category.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate Category
               </a>`;

        const actionButtons = `
            <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="categoryDashboard.editCategory(${category.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="categoryDashboard.deleteCategory(${category.id})">
                            <i class="bi bi-trash me-2"></i> Delete Category
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4">
                    <input class="category-checkbox" type="checkbox" value="${category.id}" id="category-${category.id}" style="width: 20px; height: 20px;">
                </td>
                <td>
                    ${category.category_image ? `
                        <img src="/assets/images/${category.category_image}" alt="Category Image"
                             class="rounded border border-2 border-white shadow-sm" style="width: 2.5rem; height: 2.5rem; object-fit: cover;">
                    ` : `
                        <div class="rounded border border-2 border-white shadow-sm bg-light d-flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem;">
                            <i class="bi bi-image text-muted"></i>
                        </div>
                    `}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-tags me-2 text-primary"></i>
                        <h6 class="mb-0 fw-bold">${category.category_name}</h6>
                    </div>
                </td>
                <td>
                    <span class="badge ${category.category_status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${category.category_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${category.category_status}
                    </span>
                </td>
                <td class="text-end pe-4"><div class="d-flex justify-content-end gap-1">${actionButtons}</div></td>
            </tr>
        `;
    }

    getStatusClass(status) {
        return getCategoryStatusClass(status);
    }

    showNoResults() {
        $('#table-body').html(`
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-search fs-1 d-block mb-3"></i>
                        <h5>No categories found</h5>
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
    // 分類操作模塊 (Category Operations Module)
    // =============================================================================

    /**
     * 編輯分類
     * @param {number} categoryId 分類ID
     */
    editCategory(categoryId) {
        const url = window.editCategoryUrl.replace(':id', categoryId);
        window.location.href = url;
    }

    /**
     * 刪除分類
     * @param {number} categoryId 分類ID
     */
    deleteCategory(categoryId) {
        deleteCategory(categoryId, {
            onSuccess: () => {
                this.fetchCategories(this.currentPage);
            }
        });
    }

    /**
     * 激活分類
     * @param {number} categoryId 分類ID
     */
    setAvailable(categoryId) {
        setCategoryAvailable(categoryId, {
            onSuccess: () => {
                this.fetchCategories(this.currentPage);
            }
        });
    }

    /**
     * 停用分類
     * @param {number} categoryId 分類ID
     */
    setUnavailable(categoryId) {
        setCategoryUnavailable(categoryId, {
            onSuccess: () => {
                this.fetchCategories(this.currentPage);
            }
        });
    }

    // =============================================================================
    // 勾選框管理模塊 (Checkbox Management Module)
    // =============================================================================

    /**
     * 更新全選勾選框狀態
     */
    updateSelectAllCheckbox() {
        const totalCheckboxes = $('.category-checkbox').length;
        const checkedCheckboxes = $('.category-checkbox:checked').length;
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
        const checkedCount = $('.category-checkbox:checked').length;
        const exportBtn = $('#export-categories-btn');

        if (checkedCount > 0) {
            exportBtn.prop('disabled', false);
            exportBtn.html(`<i class="bi bi-download me-2"></i>Export Data (${checkedCount})`);
        } else {
            exportBtn.prop('disabled', true);
            exportBtn.html('<i class="bi bi-download me-2"></i>Export Data');
        }
    }

    /**
     * 導出選中的分類
     */
    exportSelectedCategories() {
        const selectedIds = $('.category-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            this.showAlert('Please select at least one category to export', 'warning');
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
        const exportUrl = `${window.categoryExportUrl}?${params}`;

        // 顯示加載提示
        this.showAlert('Generating Excel file, please wait...', 'info');

        // 創建隱藏的鏈接來觸發下載
        const link = document.createElement('a');
        link.href = exportUrl;
        link.download = '';
        link.style.display = 'none';
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

    /**
     * 顯示警告消息
     * @param {string} message 消息內容
     * @param {string} type 消息類型
     */
    showAlert(message, type) {
        if (typeof window.showAlert !== 'undefined') {
            window.showAlert(message, type);
        } else {
            // 備用實現
            const alertContainer = document.getElementById('alertContainer') || document.body;
            const alertHtml = `
                <div class="alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
            alertContainer.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }
}

// =============================================================================
// Category Create 頁面功能 (Category Create Page Functions)
// =============================================================================

/**
 * 綁定 Category Create 頁面事件
 */
function bindCategoryCreateEvents() {
    // 分類名稱輸入框回車事件
    const categoryNameInput = document.getElementById('category_name');
    if (categoryNameInput) {
        categoryNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addCategory();
            }
        });
    }

    // 添加分類按鈕
    const addCategoryBtn = document.getElementById('addCategory');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', addCategory);
    }


    // 排序按鈕
    const sortBtn = document.getElementById('sortCategories');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：刪除分類按鈕
    document.addEventListener('click', function(e) {
        if (e.target.closest('button[data-index]')) {
            const button = e.target.closest('button[data-index]');
            const index = parseInt(button.getAttribute('data-index'));
            removeCategory(index);
        }
    });
}

/**
 * 添加分類
 */
function addCategory() {
    const categoryNameInput = document.getElementById('category_name');

    const categoryName = categoryNameInput.value.trim();

    // 驗證輸入
    if (!categoryName) {
        showAlert('Please enter category name', 'warning');
        categoryNameInput.focus();
        return;
    }

    // 檢查是否已存在
    if (isCategoryExists(categoryList, categoryName)) {
        showAlert(`Category name "${categoryName}" already exists in the list`, 'error');
        highlightExistingCategory(categoryName);
        categoryNameInput.focus();
        return;
    }

    // 獲取當前圖片文件
    const imageInput = document.getElementById('category_image');
    let categoryImageFile = null;
    if (imageInput && imageInput.files && imageInput.files[0]) {
        categoryImageFile = imageInput.files[0];
    }

    // 添加到分類數組（狀態默認為 Available）
    addCategoryToArray(categoryName, 'Available', categoryImageFile);

    // 顯示成功提示
    showAlert('Category added successfully', 'success');
}

/**
 * 添加分類到數組
 * @param {string} categoryName 分類名稱
 * @param {string} categoryStatus 分類狀態
 * @param {File} categoryImageFile 分類圖片文件
 */
function addCategoryToArray(categoryName, categoryStatus, categoryImageFile) {
    // 調試信息：檢查傳入的數據
    console.log('addCategoryToArray called with:', { categoryName, categoryStatus, categoryImageFile });

    // 添加分類到數組
    const categoryData = {
        categoryName: categoryName,
        categoryStatus: categoryStatus,
        categoryImageFile: categoryImageFile // 存儲文件對象而不是base64
    };

    categoryList.push(categoryData);

    // 更新UI
    updateCategoryList();
    updateUI();

    // 顯示右邊的分類表格
    showCategoryValuesArea();

    // 清空輸入框
    const categoryNameInput = document.getElementById('category_name');
    if (categoryNameInput) {
        categoryNameInput.value = '';
    }

    // 清空圖片（不顯示消息）
    resetImageWithoutMessage('category');

    // 調試信息：檢查添加後的狀態選擇
    console.log('After adding category, current status selection:', categoryStatus);
}

/**
 * 移除分類
 * @param {number} index 索引
 */
function removeCategory(index) {
    console.log('Removing category at index:', index);
    console.log('Category list before removal:', categoryList);

    // 確認機制
    if (!confirm('Are you sure you want to remove this category?')) {
        return;
    }

    if (index >= 0 && index < categoryList.length) {
        categoryList.splice(index, 1);
        console.log('Category list after removal:', categoryList);
        updateCategoryList();
        updateUI();

        // 顯示成功移除的 alert
        showAlert('Category removed successfully', 'success');
    } else {
        console.error('Invalid index:', index);
        showAlert('Failed to remove category', 'error');
    }
}

/**
 * 更新分類列表顯示
 */
function updateCategoryList() {
    const container = document.getElementById('categoryValuesList');
    if (!container) return;

    container.innerHTML = '';

    categoryList.forEach((item, index) => {
        // 檢查是否為重複項
        const isDuplicate = isCategoryExists(categoryList, item.categoryName) &&
            categoryList.filter(i => i.categoryName.toLowerCase() === item.categoryName.toLowerCase()).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 bg-light rounded border fade-in';
        const duplicateClasses = isDuplicate ? 'border-warning' : '';

        const categoryItem = document.createElement('div');
        categoryItem.className = `${baseClasses} ${duplicateClasses}`;

        categoryItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-3">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                <div class="me-3 flex-shrink-0">
                    ${item.categoryImageFile ?
                        `<img src="${URL.createObjectURL(item.categoryImageFile)}" class="img-thumbnail" style="width: 3.125rem; height: 3.125rem; object-fit: cover;" alt="Category Image">` :
                        `<div class="bg-light border rounded d-flex align-items-center justify-content-center" style="width: 3.125rem; height: 3.125rem;">
                            <i class="bi bi-tags text-muted fs-5"></i>
                        </div>`
                    }
                </div>
                <div class="flex-grow-1 min-width-0">
                    <div class="fw-bold text-dark mb-1 text-truncate">
                        <i class="bi bi-tags me-2 text-primary"></i>${item.categoryName}
                    </div>
                    ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2 mt-1">Duplicate</span>' : ''}
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;

        container.appendChild(categoryItem);
    });
}

/**
 * 顯示分類值區域
 */
function showCategoryValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }

    // 顯示分類值區域
    const categoryValuesArea = document.getElementById('categoryValuesArea');
    if (categoryValuesArea) {
        categoryValuesArea.classList.remove('d-none');
    }

    // 更新分類名稱顯示
    updateCategoryNameDisplay();

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
    // 隱藏分類值區域
    const categoryValuesArea = document.getElementById('categoryValuesArea');
    if (categoryValuesArea) {
        categoryValuesArea.classList.add('d-none');
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
    if (categoryList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 確認清除
    if (!confirm('Are you sure you want to clear all categories?')) {
        return;
    }

    // 清空數組
    categoryList = [];

    // 清空輸入框
    const categoryNameInput = document.getElementById('category_name');
    if (categoryNameInput) {
        categoryNameInput.value = '';
    }

    // 更新UI
    updateCategoryList();
    updateUI();

    // 顯示成功提示
    showAlert('All categories cleared successfully', 'success');

    // 隱藏所有區域
    hideAllAreas();
}

/**
 * 更新UI
 */
function updateUI() {
    // 更新分類值計數
    updateCategoryValuesCount();

    // 更新分類範圍顯示
    updateCategoryRangeDisplay();

    // 更新分類名稱顯示
    updateCategoryNameDisplay();

    // 如果沒有分類，隱藏所有區域並顯示初始狀態
    if (categoryList.length === 0) {
        hideAllAreas();
    }
}

/**
 * 更新分類值計數
 */
function updateCategoryValuesCount() {
    const count = categoryList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('categoryValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} categories`;
    }
}

/**
 * 更新分類名稱顯示
 */
function updateCategoryNameDisplay() {
    const categoryNameSpan = document.getElementById('categoryName');
    if (categoryNameSpan) {
        if (categoryList.length > 0) {
            // 顯示分類數量
            categoryNameSpan.textContent = `- ${categoryList.length} categories`;
        } else {
            categoryNameSpan.textContent = '';
        }
    }
}

/**
 * 更新分類範圍顯示
 */
function updateCategoryRangeDisplay() {
    const categoryNames = categoryList.map(item => item.categoryName);

    const selectedCategorySpan = document.getElementById('selectedCategory');
    if (selectedCategorySpan) {
        if (categoryNames.length === 0) {
            selectedCategorySpan.textContent = 'None';
        } else if (categoryNames.length === 1) {
            selectedCategorySpan.textContent = categoryNames[0];
        } else {
            // 按字母順序排序
            const sortedNames = categoryNames.sort();
            const minCategory = sortedNames[0];
            const maxCategory = sortedNames[sortedNames.length - 1];
            selectedCategorySpan.textContent = `${minCategory} - ${maxCategory}`;
        }
    }
}


/**
 * 切換排序順序
 */
function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortCategories');

    // 更新圖標
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortCategoryValuesList();
}

/**
 * 排序分類值列表
 */
function sortCategoryValuesList() {
    const categoryValuesList = document.getElementById('categoryValuesList');
    const items = Array.from(categoryValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取分類名稱並排序
    const categoryValues = items.map(item => ({
        element: item,
        value: item.querySelector('.fw-bold').textContent.trim()
    }));

    // 按字母順序排序
    categoryValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    categoryValues.forEach(({ element }) => {
        categoryValuesList.appendChild(element);
    });
}


/**
 * 添加分類到列表
 * @param {string} categoryName 分類名稱
 * @param {string} categoryStatus 分類狀態
 * @param {File} categoryImageFile 分類圖片文件
 */
function addCategoryToList(categoryName, categoryStatus = 'Available', categoryImageFile = null) {
    // 檢查是否為重複項
    if (isCategoryExists(categoryList, categoryName)) {
        console.log('Duplicate detected in batch add, skipping:', categoryName);
        return; // 跳過重複項，不添加到列表
    }

    // 添加到 categoryList 數組
    categoryList.push({
        categoryName: categoryName,
        categoryStatus: categoryStatus,
        categoryImageFile: categoryImageFile
    });

    // 重新渲染整個列表
    updateCategoryList();
    updateUI();

    // 顯示分類值區域
    showCategoryValuesArea();
}

/**
 * 重置圖片（不顯示消息）
 */
// resetImageWithoutMessage 函数已移至 image-system.js

/**
 * 提交分類表單
 */
function submitCategoryForm() {
    // 調試信息：檢查要提交的數據
    console.log('Submitting category data:', categoryList);

    // 準備提交數據
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加分類數據
    categoryList.forEach((item, index) => {
        // 調試信息：檢查每個分類的狀態
        console.log(`Category ${index + 1}:`, { categoryName: item.categoryName, categoryStatus: item.categoryStatus });

        // 添加分類文本數據
        formData.append(`categories[${index}][categoryName]`, item.categoryName);
        formData.append(`categories[${index}][categoryStatus]`, item.categoryStatus);

        // 添加圖片文件（如果有）
        if (item.categoryImageFile) {
            formData.append(`images[${index}]`, item.categoryImageFile);
        }
    });

    // 提交數據
    fetch(window.createCategoryUrl, {
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
            showAlert(data.message || 'Categories created successfully', 'success');

            // 延遲重定向到dashboard，讓用戶看到成功消息
            setTimeout(() => {
                window.location.href = window.categoryManagementRoute || '/admin/category-mapping/category/index';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to create categories', 'error');
        }
    })
    .catch(error => {
        showAlert('Some categories failed to create', 'error');
    });
}

// =============================================================================
// Category Update 頁面功能 (Category Update Page Functions)
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
            showAlert(data.message || 'Category updated successfully', 'success');

            // 延遲重定向到列表頁面
            setTimeout(() => {
                window.location.href = window.categoryManagementRoute || '/admin/category-mapping/category/index';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to update category', 'error');
        }
    })
    .catch(error => {
        showAlert('Failed to update category', 'error');
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
    const categoryNameInput = document.getElementById('category_name');

    // 驗證分類名稱
    if (!categoryNameInput.value.trim()) {
        showAlert('Please enter category name', 'warning');
        categoryNameInput.focus();
        return false;
    }

    // 驗證狀態選擇
    const selectedStatus = document.querySelector('input[name="category_status"]:checked');
    if (!selectedStatus) {
        showAlert('Please select category status', 'warning');
        return false;
    }

    return true;
}

// 图片处理函数已移至 image-system.js

/**
 * 初始化分類更新頁面
 */
function initializeCategoryUpdate() {
    bindCategoryEvents();

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
                removeImageBtn.style.display = 'none';
            }
        }
    }

    // Update 頁面狀態卡片初始化
    initializeStatusCards();
}

// =============================================================================
// 通用工具函數 (Common Utility Functions)
// =============================================================================

/**
 * 獲取狀態CSS類
 * @param {string} status 狀態
 * @returns {string} CSS類名
 */
function getCategoryStatusClass(status) {
    const statusMap = {
        'Available': 'available',
        'Unavailable': 'unavailable'
    };
    return statusMap[status] || 'default';
}

/**
 * 檢查分類是否存在
 * @param {Array} categoryList 分類列表
 * @param {string} categoryName 分類名稱
 * @returns {boolean} 是否存在
 */
function isCategoryExists(categoryList, categoryName) {
    return categoryList.some(item => item.categoryName.toLowerCase() === categoryName.toLowerCase());
}

/**
 * 高亮現有分類
 * @param {string} categoryName 分類名稱
 */
function highlightExistingCategory(categoryName) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.fw-bold').textContent.trim();
        if (value.toLowerCase() === categoryName.toLowerCase()) {
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
 * 驗證分類表單
 * @param {Object} formData 表單數據
 * @param {Object} options 驗證選項
 * @returns {Object} 驗證結果
 */
function validateCategoryForm(formData, options = {}) {
    const errors = [];
    const { requireStatus = true } = options;

    // 驗證分類名稱
    if (!formData.category_name || formData.category_name.trim() === '') {
        errors.push('Category name is required');
    }

    // 驗證狀態
    if (requireStatus && (!formData.category_status || formData.category_status === '')) {
        errors.push('Category status is required');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}


/**
 * 處理分類請求
 * @param {string} url 請求URL
 * @param {string} method HTTP方法
 * @param {Object} data 請求數據
 * @param {Object} options 選項
 */
function handleCategoryRequest(url, method, data, options = {}) {
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
            showAlert('Operation failed', 'error');
            if (onError) {
                onError(error);
            }
        });
}

/**
 * 創建分類
 * @param {Object} categoryData 分類數據
 * @param {Object} options 選項
 */
function createCategory(categoryData, options = {}) {
    const url = options.url || window.createCategoryUrl;
    const method = 'POST';

    handleCategoryRequest(url, method, categoryData, {
        successMessage: 'Category created successfully',
        errorMessage: 'Failed to create category',
        redirect: window.categoryManagementRoute || '/admin/categories/index',
        ...options
    });
}

/**
 * 更新分類
 * @param {number} categoryId 分類ID
 * @param {Object} categoryData 分類數據
 * @param {Object} options 選項
 */
function updateCategory(categoryId, categoryData, options = {}) {
    const url = (options.url || window.updateCategoryUrl).replace(':id', categoryId);
    const method = 'POST';

    handleCategoryRequest(url, method, categoryData, {
        successMessage: 'Category updated successfully',
        errorMessage: 'Failed to update category',
        redirect: window.categoryManagementRoute || '/admin/categories/index',
        ...options
    });
}

/**
 * 刪除分類
 * @param {number} categoryId 分類ID
 * @param {Object} options 選項
 */
function deleteCategory(categoryId, options = {}) {
    const url = (options.url || window.deleteCategoryUrl).replace(':id', categoryId);
    const method = 'DELETE';

    if (!confirm('Are you sure you want to delete this category?')) {
        return;
    }

    handleCategoryRequest(url, method, null, {
        successMessage: 'Category deleted successfully',
        errorMessage: 'Failed to delete category',
        redirect: null,
        onSuccess: () => {
            // 重新加載頁面或刷新數據
            if (window.categoryDashboard && window.categoryDashboard.fetchCategories) {
                window.categoryDashboard.fetchCategories();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置分類可用
 * @param {number} categoryId 分類ID
 * @param {Object} options 選項
 */
function setCategoryAvailable(categoryId, options = {}) {
    const url = (options.url || window.availableCategoryUrl).replace(':id', categoryId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to activate this category?')) {
        return;
    }

    handleCategoryRequest(url, method, null, {
        successMessage: 'Category activated successfully',
        errorMessage: 'Failed to activate category',
        redirect: null,
        onSuccess: () => {
            if (window.categoryDashboard && window.categoryDashboard.fetchCategories) {
                window.categoryDashboard.fetchCategories();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置分類不可用
 * @param {number} categoryId 分類ID
 * @param {Object} options 選項
 */
function setCategoryUnavailable(categoryId, options = {}) {
    const url = (options.url || window.unavailableCategoryUrl).replace(':id', categoryId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to deactivate this category?')) {
        return;
    }

    handleCategoryRequest(url, method, null, {
        successMessage: 'Category deactivated successfully',
        errorMessage: 'Failed to deactivate category',
        redirect: null,
        onSuccess: () => {
            if (window.categoryDashboard && window.categoryDashboard.fetchCategories) {
                window.categoryDashboard.fetchCategories();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 綁定分類相關事件
 * @param {Object} config 配置選項
 */
function bindCategoryEvents(config = {}) {
    const {
        statusCardSelector = '.status-card',
        imageInputSelector = '#category_image',
        imageUploadAreaSelector = '#imageUploadArea'
    } = config;

    // Create 頁面事件綁定
    bindCategoryCreateEvents();

    // 使用統一的圖片處理模組（避免重複綁定）
    if (typeof window.ImageSystem !== 'undefined' && !window.ImageSystem._categoryEventsBound) {
        window.ImageSystem.bindModuleImageEvents('category');
        window.ImageSystem._categoryEventsBound = true; // 標記已綁定
    } else if (typeof window.ImageSystem === 'undefined') {
        console.warn('ImageSystem not available, image functionality may not work properly');
    }

    // 表單提交事件監聽器
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 檢查是否有分類
            if (categoryList.length === 0) {
                showAlert('Please add at least one category', 'warning');
                return;
            }

            // 預提交重複檢查
            const duplicates = [];
            const seen = new Set();
            for (const item of categoryList) {
                const combination = item.categoryName.toLowerCase();
                if (seen.has(combination)) {
                    duplicates.push(item.categoryName);
                } else {
                    seen.add(combination);
                }
            }

            if (duplicates.length > 0) {
                showAlert('Duplicate category names found. Please remove duplicates before submitting.', 'error');
                return;
            }

            submitCategoryForm();
        });
    }

    // 狀態卡片選擇事件
    if (statusCardSelector) {
        $(document).on('click', statusCardSelector, function(e) {
            if (!$(e.target).is('input[type="radio"]')) {
                selectStatusCard(this);
            }
        });
    }
}

/**
 * 初始化分類頁面
 * @param {Object} config 配置選項
 */
function initializeCategoryPage(config = {}) {
    const {
        events = {},
        onInit = null
    } = config;

    // 綁定通用事件
    bindCategoryEvents();

    // 初始化狀態卡片選擇
    if (typeof window.StatusSystem !== 'undefined') {
        window.StatusSystem.initializeStatusCardSelection();
    }

    // 執行自定義初始化
    if (onInit) {
        onInit();
    }

    // 綁定自定義事件
    Object.keys(events).forEach(eventName => {
        const handler = events[eventName];
        if (typeof handler === 'function') {
            // 根據事件名稱綁定到相應元素
            switch (eventName) {
                case 'formSubmit':
                    const form = document.getElementById('categoryForm');
                    if (form) {
                        form.addEventListener('submit', handler);
                    }
                    break;
                default:
                    console.warn(`Unknown event: ${eventName}`);
            }
        }
    });
}

/**
 * 選擇狀態卡片
 * @param {HTMLElement} cardElement 卡片元素
 */
function selectStatusCard(cardElement) {
    if (typeof window.StatusSystem !== 'undefined' && window.StatusSystem.selectStatusCard) {
        window.StatusSystem.selectStatusCard(cardElement);
    }
}

/**
 * 預覽圖片
 * @param {string} imageSrc 圖片源
 */

// =============================================================================
// 頁面初始化 (Page Initialization)
// =============================================================================

/**
 * 綁定所有事件
 */
function bindEvents() {
    // 根據頁面類型綁定不同的事件
    if (document.getElementById('categoryForm')) {
        // Create 頁面
        bindCategoryEvents();
    }

    if (document.getElementById('input_image')) {
        // Update 頁面
        initializeCategoryUpdate();
    }
}

// 全局初始化
document.addEventListener('DOMContentLoaded', function() {
    // 綁定事件
    bindEvents();

    // 初始化 Dashboard（如果存在）
    if (document.getElementById('table-body')) {
        window.categoryDashboard = new CategoryDashboard();
    }

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
                removeImageBtn.style.display = 'none';
            }
        }
    }

    // 初始化 Create 頁面
    if (document.getElementById('categoryForm')) {
        // 如果已有分類數據，顯示分類區域
        if (categoryList.length > 0) {
            showCategoryValuesArea();
        }
        updateUI();
    }
});

// jQuery 備用初始化
$(document).ready(function() {
    // 如果是update頁面（有input_image元素）
    if ($("#input_image").length > 0) {
        console.log('Initializing category update page');
        initializeCategoryUpdate();
    }
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

// 導出主要函數到全局作用域
window.addCategory = addCategory;
window.removeCategory = removeCategory;
window.clearForm = clearForm;
window.toggleCategoryStatus = toggleCategoryStatus;
window.setCategoryAvailable = setCategoryAvailable;
window.setCategoryUnavailable = setCategoryUnavailable;
window.updateCategoryStatus = updateCategoryStatus;
window.viewCategoryDetails = viewCategoryDetails;
window.handleRemoveImageButton = handleRemoveImageButton;
window.removeUpdateImage = removeUpdateImage;
