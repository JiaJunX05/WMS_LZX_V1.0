/**
 * Category Management JavaScript
 * 分類管理統一交互邏輯
 *
 * 功能模塊：
 * - Dashboard 頁面：搜索、篩選、分頁、CRUD 操作、狀態切換
 * - Create Modal：批量創建、表單驗證、狀態管理
 * - Update Modal：編輯更新、表單提交
 * - 通用功能：API 請求、UI 更新、事件綁定、工具函數
 *
 * @author WMS Team
 * @version 3.0.0
 */

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

        // Add Category 彈窗事件
        this.bindModalEvents();

        // Update Category 彈窗事件
        this.bindUpdateModalEvents();
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

        // 隱藏空狀態（有數據時）
        $('#empty-state').addClass('d-none');
    }

    createCategoryRow(category) {
        const statusMenuItem = category.category_status === 'Unavailable'
            ? `<button type="button" class="dropdown-item" onclick="categoryDashboard.setAvailable(${category.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate
               </button>`
            : `<button type="button" class="dropdown-item" onclick="categoryDashboard.setUnavailable(${category.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate
               </button>`;

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
                        <button type="button" class="dropdown-item text-danger" onclick="categoryDashboard.deleteCategory(${category.id})">
                            <i class="bi bi-trash me-2"></i> Delete
                        </button>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr data-category-id="${category.id}"
                data-category-name="${category.category_name || ''}"
                data-category-status="${category.category_status || 'Available'}"
                data-category-image="${category.category_image || ''}">
                <td class="ps-4">
                    <input class="category-checkbox form-check-input" type="checkbox" value="${category.id}" id="category-${category.id}">
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
    // 分類操作模塊 (Category Operations Module)
    // =============================================================================

    /**
     * 編輯分類（打開更新彈窗）
     * @param {number} categoryId 分類ID
     */
    editCategory(categoryId) {
        const url = window.editCategoryUrl.replace(':id', categoryId);

        // 从表格行获取category数据（如果可用，用于快速填充）
        const categoryRow = $(`tr[data-category-id="${categoryId}"]`);
        if (categoryRow.length > 0) {
            // 快速填充基本数据
            const categoryData = {
                id: categoryId,
                category_name: categoryRow.attr('data-category-name') || '',
                category_status: categoryRow.attr('data-category-status') || 'Available',
                category_image: categoryRow.attr('data-category-image') || ''
            };
            this.openUpdateModal(categoryData);
        }

        // 从 API 获取完整category数据
        $.ajax({
            url: url,
            type: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            },
            success: (response) => {
                if (response.success && response.data) {
                    this.openUpdateModal(response.data);
                } else {
                    this.showAlert(response.message || 'Failed to load category data', 'error');
                }
            },
            error: (xhr) => {
                let errorMessage = 'Failed to load category data';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                this.showAlert(errorMessage, 'error');
            }
        });
    }

    /**
     * 刪除分類
     * @param {number} categoryId 分類ID
     */
    deleteCategory(categoryId) {
        if (!confirm('Are you sure you want to delete this category?')) return;

        fetch(window.deleteCategoryUrl.replace(':id', categoryId), {
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
                this.showAlert(data.message || 'Category deleted successfully', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchCategories(1);
                } else {
                    // 重新載入當前頁面的分類列表
                this.fetchCategories(this.currentPage);
            }
            } else {
                this.showAlert(data.message || 'Failed to delete category', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to delete category', 'error');
        });
    }

    /**
     * 更新表格行的狀態顯示和 data 屬性
     * @param {number} categoryId 分類ID
     * @param {string} newStatus 新狀態 ('Available' 或 'Unavailable')
     */
    updateCategoryRowStatus(categoryId, newStatus) {
        const categoryRow = $(`tr[data-category-id="${categoryId}"]`);
        if (categoryRow.length === 0) return;

        // 更新 data 屬性
        categoryRow.attr('data-category-status', newStatus);

        // 更新狀態菜單項（與 createCategoryRow 中的格式完全一致）
        const statusMenuItem = newStatus === 'Unavailable'
            ? `<button type="button" class="dropdown-item" onclick="categoryDashboard.setAvailable(${categoryId})">
                   <i class="bi bi-check-circle me-2"></i> Activate
               </button>`
            : `<button type="button" class="dropdown-item" onclick="categoryDashboard.setUnavailable(${categoryId})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate
               </button>`;

        // 更新操作按鈕區域（與 createCategoryRow 中的格式完全一致）
        const actionButtons = `
            <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="categoryDashboard.editCategory(${categoryId})">
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
                        <button type="button" class="dropdown-item text-danger" onclick="categoryDashboard.deleteCategory(${categoryId})">
                            <i class="bi bi-trash me-2"></i> Delete
                        </button>
                    </li>
                </ul>
            </div>
        `;

        // 更新操作按鈕列
        const actionsCell = categoryRow.find('td:last-child');
        actionsCell.html(actionButtons);

        // 更新狀態標籤顯示（與 createCategoryRow 中的格式完全一致）
        const statusBadge = newStatus === 'Available'
            ? `<span class="badge bg-success px-3 py-2">
                <i class="bi bi-check-circle me-1"></i>${newStatus}
            </span>`
            : `<span class="badge bg-danger px-3 py-2">
                <i class="bi bi-x-circle me-1"></i>${newStatus}
            </span>`;

        // 更新狀態列顯示
        const statusCell = categoryRow.find('td').eq(-2); // 倒數第二列是狀態列
        if (statusCell.length > 0) {
            statusCell.html(statusBadge);
        }
    }

    /**
     * 激活分類
     * @param {number} categoryId 分類ID
     */
    setAvailable(categoryId) {
        if (!confirm('Are you sure you want to activate this category?')) return;

        fetch(window.availableCategoryUrl.replace(':id', categoryId), {
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
                this.showAlert(data.message || 'Category has been set to available status', 'success');
                // 更新 DOM 而不是刷新頁面
                this.updateCategoryRowStatus(categoryId, 'Available');
            } else {
                this.showAlert(data.message || 'Failed to set category available', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set category available', 'error');
        });
    }

    /**
     * 停用分類
     * @param {number} categoryId 分類ID
     */
    setUnavailable(categoryId) {
        if (!confirm('Are you sure you want to deactivate this category?')) return;

        fetch(window.unavailableCategoryUrl.replace(':id', categoryId), {
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
                this.showAlert(data.message || 'Category has been set to unavailable status', 'success');
                // 更新 DOM 而不是刷新頁面
                this.updateCategoryRowStatus(categoryId, 'Unavailable');
            } else {
                this.showAlert(data.message || 'Failed to set category unavailable', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set category unavailable', 'error');
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

    /**
     * 顯示警告消息
     * @param {string} message 消息內容
     * @param {string} type 消息類型
     */
    showAlert(message, type) {
        // 使用統一的 alert 系統（在 header 顯示）
        if (typeof window.showAlert === 'function') {
            window.showAlert(message, type);
        } else {
            // 備用實現 - 直接使用 globalAlertContainer
            const alertClass = type === 'danger' || type === 'error' ? 'alert-danger' : `alert-${type}`;
            const container = document.getElementById('globalAlertContainer');
            
            if (container) {
                // 清除現有 alert
                const existingAlerts = container.querySelectorAll('.alert');
                existingAlerts.forEach(alert => alert.remove());
                
                // 創建新 alert
                const alertHtml = `
                    <div class="alert ${alertClass} alert-dismissible fade show shadow-sm border-0" role="alert" style="border-radius: 0.75rem;">
                        <div class="d-flex align-items-center">
                            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'error' || type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} me-3 fs-5"></i>
                            <div class="flex-grow-1">${message}</div>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', alertHtml);
                
                // 自動消失
                setTimeout(() => {
                    const alertElement = container.querySelector('.alert');
                    if (alertElement) {
                        alertElement.style.opacity = '0';
                        setTimeout(() => alertElement.remove(), 300);
                    }
                }, 5000);
            } else {
                // 如果 globalAlertContainer 不存在，回退到頁面頂部
                console.warn('Global alert container not found. Using fallback.');
                const fallbackContainer = document.getElementById('alertContainer') || document.body;
                const alertHtml = `
                    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                        ${message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
                fallbackContainer.insertAdjacentHTML('afterbegin', alertHtml);
                setTimeout(() => {
                    const alertElement = fallbackContainer.querySelector('.alert');
                    if (alertElement) alertElement.remove();
                }, 5000);
            }
    }
}

// =============================================================================
    // Add Category 彈窗模塊 (Add Category Modal Module)
// =============================================================================

/**
     * 綁定彈窗事件
     */
    bindModalEvents() {
        // 彈窗打開時重置表單並初始化圖片處理
        $('#createCategoryModal').on('show.bs.modal', () => {
            this.resetModalForm();
            this.initModalImageSystem();
        });

        // 彈窗完全顯示後設置焦點
        $('#createCategoryModal').on('shown.bs.modal', () => {
            const categoryNameInput = document.getElementById('category_name');
            if (categoryNameInput) {
                categoryNameInput.focus();
            }
        });

        // 彈窗關閉時清理
        $('#createCategoryModal').on('hidden.bs.modal', () => {
            this.resetModalForm();
        });

        // 提交按鈕事件
        $('#submitCreateCategoryModal').on('click', () => {
            this.submitModalCategory();
        });

        // Enter鍵自動跳轉到下一個輸入框或提交表單
        $('#createCategoryModal').on('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const target = e.target;
                // 排除 image 輸入框
                if (target.type === 'file' || target.id === 'category_image') {
                    return;
                }

                // 如果當前在輸入框中
                if (target.tagName === 'INPUT' && target.type !== 'submit' && target.type !== 'button') {
                    e.preventDefault();
                    // category 只有一個輸入框，直接提交
                    this.submitModalCategory();
                }
            }
        });
    }

/**
     * 初始化彈窗中的圖片處理系統
     */
    initModalImageSystem() {
        if (typeof window.ImageSystem !== 'undefined') {
            const modal = document.getElementById('createCategoryModal');
            if (!modal) return;

            const imageInput = modal.querySelector('#category_image');
            const imageUploadArea = modal.querySelector('#imageUploadArea');

            if (imageInput && imageUploadArea) {
                window.ImageSystem.bindImageUploadEvents({
                    createImageInputId: 'category_image',
                    createImageUploadAreaId: 'imageUploadArea',
                    createPreviewImageId: 'img-preview',
                    createPreviewIconId: 'preview-icon',
                    createImageUploadContentId: 'imageUploadContent'
                });
            }
        }
    }

    /**
     * 重置彈窗表單
     */
    resetModalForm() {
        const form = document.getElementById('createCategoryModalForm');
        if (form) {
            form.reset();
        }

        if (typeof window.ImageSystem !== 'undefined' && window.ImageSystem.resetImage) {
            window.ImageSystem.resetImage('imageUploadArea', {
                imageInputId: 'category_image',
                previewImageId: 'img-preview',
                previewIconId: 'preview-icon',
                imageUploadContentId: 'imageUploadContent'
            });
        }

        const inputs = form?.querySelectorAll('.form-control');
        if (inputs) {
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
            });
    }
}

    /**
     * 显示字段级验证错误
     */
    displayValidationErrors(errors) {
        // 清除之前的错误
        const createForm = document.getElementById('createCategoryModalForm');
        if (createForm) {
            const inputs = createForm.querySelectorAll('.form-control');
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
                const feedback = input.parentElement.querySelector('.invalid-feedback');
                if (feedback) {
                    feedback.textContent = '';
                }
            });
        }

        const updateForm = document.getElementById('updateCategoryModalForm');
        if (updateForm) {
            const inputs = updateForm.querySelectorAll('.form-control');
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
                const feedback = input.parentElement.querySelector('.invalid-feedback');
                if (feedback) {
                    feedback.textContent = '';
                }
            });
        }

        // 为每个字段显示错误
        Object.keys(errors).forEach(field => {
            // 尝试多种可能的字段名格式（先尝试 update，再尝试 create，最后尝试通用）
            let input = document.getElementById(`update_${field}`) ||
                       document.getElementById(`update-${field}`) ||
                       document.getElementById(field) ||
                       document.querySelector(`[name="${field}"]`);
            
            if (input) {
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
                
                // 显示错误消息
                const feedback = input.parentElement.querySelector('.invalid-feedback') ||
                               input.closest('.col-12, .col-md-6')?.querySelector('.invalid-feedback');
                if (feedback) {
                    feedback.textContent = errors[field][0] || `Please enter ${field}.`;
                }
            }
        });
    }

/**
     * 提交彈窗中的Category
     */
    submitModalCategory() {
        const categoryNameInput = document.getElementById('category_name');
        const imageInput = document.getElementById('category_image');
        const submitBtn = $('#submitCreateCategoryModal');

        const categoryName = categoryNameInput ? categoryNameInput.value.trim() : '';

        let isValid = true;

        if (!categoryName) {
    if (categoryNameInput) {
                categoryNameInput.classList.add('is-invalid');
            }
            isValid = false;
        } else {
            if (categoryNameInput) {
                categoryNameInput.classList.remove('is-invalid');
                categoryNameInput.classList.add('is-valid');
            }
        }

        if (!isValid) {
            this.showAlert('Please fill in all required fields', 'warning');
            return;
        }

    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
        formData.append('category_name', categoryName);

        if (imageInput && imageInput.files && imageInput.files[0]) {
            formData.append('category_image', imageInput.files[0]);
        }

        // 檢查是否有圖片
        const hasImage = imageInput && imageInput.files && imageInput.files[0];

        const originalText = submitBtn.html();
        submitBtn.html('<i class="bi bi-hourglass-split me-2"></i>Creating...');
        submitBtn.prop('disabled', true);

    fetch(window.createCategoryUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 422) {
                return response.json().then(data => {
                    throw { status: 422, errors: data.errors || {} };
                });
            }
            return response.json().then(data => {
                throw new Error(data.message || 'Failed to create category');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
                this.showAlert(data.message || 'Category created successfully', 'success');

                const modal = bootstrap.Modal.getInstance(document.getElementById('createCategoryModal'));
                if (modal) {
                    modal.hide();
                }

                // 如果有圖片，刷新整個頁面；否則只更新 DOM
                if (hasImage) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    // 沒有圖片，重新載入當前頁面以顯示新記錄
                    this.fetchCategories(this.currentPage);
                }
        } else {
                this.showAlert(data.message || 'Failed to create category', 'error');
        }
    })
    .catch(error => {
        // 处理验证错误 (422)
        if (error.status === 422 && error.errors) {
            this.displayValidationErrors(error.errors);
            this.showAlert('Please fill in all required fields', 'warning');
        } else {
            let errorMessage = 'Failed to create category';
            if (error.message) {
                errorMessage = error.message;
            }
            this.showAlert(errorMessage, 'error');
        }
    })
        .finally(() => {
            submitBtn.html(originalText);
            submitBtn.prop('disabled', false);
    });
}

// =============================================================================
    // Update Category 彈窗模塊 (Update Category Modal Module)
// =============================================================================

/**
     * 綁定更新彈窗事件
     */
    bindUpdateModalEvents() {
        $('#updateCategoryModal').on('show.bs.modal', () => {
            this.initUpdateModalImageSystem();
            if (typeof window.initializeStatusCardSelection === 'function') {
                window.initializeStatusCardSelection('category_status');
            }
        });

        // 彈窗完全顯示後設置焦點
        $('#updateCategoryModal').on('shown.bs.modal', () => {
            const categoryNameInput = document.getElementById('update_category_name');
            if (categoryNameInput) {
                categoryNameInput.focus();
            }
        });

        $('#updateCategoryModal').on('hidden.bs.modal', () => {
            this.resetUpdateModalForm();
            // 手动清理 backdrop，确保 modal 完全关闭
            this.cleanupModalBackdrop();
        });

        $('#submitUpdateCategoryModal').on('click', () => {
            this.submitUpdateModalCategory();
        });

        // Enter鍵自動跳轉到下一個輸入框或提交表單
        $('#updateCategoryModal').on('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const target = e.target;
                // 排除 image 輸入框
                if (target.type === 'file' || target.id === 'input_image') {
                    return;
                }

                // 如果當前在輸入框中
                if (target.tagName === 'INPUT' && target.type !== 'submit' && target.type !== 'button' && target.type !== 'radio') {
                    e.preventDefault();
                    // category 只有一個輸入框，直接提交
                    this.submitUpdateModalCategory();
                }
            }
        });
    }

    /**
     * 打開更新彈窗並填充數據
     */
    openUpdateModal(categoryData) {
        $('#update_category_name').val(categoryData.category_name || '');

        const targetStatus = categoryData.category_status === 'Unavailable' ? 'Unavailable' : 'Available';
        const radioSelector = targetStatus === 'Available' ? '#update_status_available' : '#update_status_unavailable';
        $(radioSelector).prop('checked', true);
        if (typeof window.initializeStatusCardSelection === 'function') {
            window.initializeStatusCardSelection('category_status');
        }

        const form = $('#updateCategoryModalForm');
        form.attr('data-category-id', categoryData.id);

        const currentInfo = `
            <div class="mb-1">
                <i class="bi bi-tag me-2 text-muted"></i>
                <span>Name: <strong>${categoryData.category_name || 'N/A'}</strong></span>
            </div>
            <div class="mb-1">
                <i class="bi bi-shield-check me-2 text-muted"></i>
                <span>Status: <strong>${categoryData.category_status || 'N/A'}</strong></span>
            </div>
        `;
        $('#currentCategoryInfo').html(currentInfo);

        if (categoryData.category_image) {
            const imageUrl = `/assets/images/${categoryData.category_image}`;
            this.setUpdateModalImage(imageUrl);
        } else {
            this.resetUpdateModalImage();
        }

        $('#remove_image').val('0');

        const modal = new bootstrap.Modal(document.getElementById('updateCategoryModal'));
        modal.show();
    }

    /**
     * 初始化更新彈窗中的圖片處理系統
     */
    initUpdateModalImageSystem() {
        if (typeof window.ImageSystem !== 'undefined') {
            const modal = document.getElementById('updateCategoryModal');
            if (!modal) return;

            const imageInput = modal.querySelector('#input_image');
            const previewContainer = modal.querySelector('#image-preview');
            const removeImageBtn = modal.querySelector('#removeImage');

            if (imageInput && previewContainer) {
                window.ImageSystem.bindImageUploadEvents({
                    updateImageInputId: 'input_image',
                    updatePreviewContainerId: 'image-preview'
                });

                // 移除旧的事件监听器（通过克隆节点）
                const newPreviewContainer = previewContainer.cloneNode(true);
                previewContainer.parentNode.replaceChild(newPreviewContainer, previewContainer);
                const freshPreviewContainer = modal.querySelector('#image-preview');
                const freshImageInput = modal.querySelector('#input_image');

                if (freshPreviewContainer && freshImageInput) {
                    freshPreviewContainer.addEventListener('click', function(e) {
                        if (e.target.closest('.img-remove-btn')) {
                            return;
                        }
                        freshImageInput.click();
                    });
                }

    if (removeImageBtn) {
                    const newRemoveBtn = removeImageBtn.cloneNode(true);
                    removeImageBtn.parentNode.replaceChild(newRemoveBtn, removeImageBtn);
                    const freshRemoveBtn = modal.querySelector('#removeImage');

                    freshRemoveBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();

                        if (freshRemoveBtn.hasAttribute('data-processing')) {
                            return;
                        }
                        freshRemoveBtn.setAttribute('data-processing', 'true');

                        const modal = document.getElementById('updateCategoryModal');
                        const form = modal ? document.getElementById('updateCategoryModalForm') : null;

                        if (!confirm('Are you sure you want to remove this image?')) {
                            freshRemoveBtn.removeAttribute('data-processing');
                            return;
                        }

                        const imageInput = modal?.querySelector('#input_image');
                        const previewContainer = modal?.querySelector('#image-preview');
                        const imageUploadContent = modal?.querySelector('#imageUploadContent');
                        const removeImageInput = modal?.querySelector('#remove_image');

                        if (imageInput && previewContainer && form) {
                            imageInput.value = '';

                            if (removeImageInput) {
                                removeImageInput.value = '1';
                            }

                            const previewImg = previewContainer.querySelector('#preview-image') || previewContainer.querySelector('#img-preview');
                            if (previewImg) {
                                previewImg.remove();
                            }

                            const originalContent = previewContainer.getAttribute('data-original-content');
                            if (originalContent) {
                                previewContainer.innerHTML = originalContent;

                                const restoredPreviewImg = previewContainer.querySelector('#preview-image');
                                if (restoredPreviewImg) {
                                    restoredPreviewImg.classList.add('d-none');
                                }

                                const restoredRemoveBtn = previewContainer.querySelector('#removeImage');
                                if (restoredRemoveBtn) {
                                    restoredRemoveBtn.classList.add('d-none');
                                }

                                const restoredImageUploadContent = previewContainer.querySelector('#imageUploadContent');
                                if (restoredImageUploadContent) {
                                    restoredImageUploadContent.classList.remove('d-none');
                                    restoredImageUploadContent.style.display = '';
                                }
        } else {
                                if (imageUploadContent) {
                                    imageUploadContent.classList.remove('d-none');
                                    imageUploadContent.style.display = '';
                                }
                            }

                            freshRemoveBtn.classList.add('d-none');
                            freshRemoveBtn.removeAttribute('data-processing');

                            if (typeof window.showAlert === 'function') {
                                window.showAlert('Image removed successfully', 'success');
                }
            } else {
                            freshRemoveBtn.removeAttribute('data-processing');
                        }
                    });
                }
            }
        }
    }

    /**
     * 設置更新彈窗中的圖片
     */
    setUpdateModalImage(imageUrl) {
        const modal = document.getElementById('updateCategoryModal');
        if (!modal) return;

        const previewContainer = modal.querySelector('#image-preview');
        const previewImg = modal.querySelector('#preview-image');
        const imageUploadContent = modal.querySelector('#imageUploadContent');
        const removeBtn = modal.querySelector('#removeImage');

        if (previewContainer && previewImg && imageUploadContent) {
            previewImg.src = imageUrl;
            previewImg.classList.remove('d-none');
            previewImg.style.display = 'block';
            imageUploadContent.classList.add('d-none');
            imageUploadContent.style.display = 'none';

            if (removeBtn) {
                removeBtn.classList.remove('d-none');
            }
        }
    }

    /**
     * 重置更新彈窗中的圖片
     */
    resetUpdateModalImage() {
        const modal = document.getElementById('updateCategoryModal');
        if (!modal) return;

        const previewContainer = modal.querySelector('#image-preview');
        const previewImg = modal.querySelector('#preview-image') || modal.querySelector('#img-preview');
        const imageUploadContent = modal.querySelector('#imageUploadContent');
        const removeBtn = modal.querySelector('#removeImage');
        const imageInput = modal.querySelector('#input_image');

        if (previewContainer) {
            if (previewImg) {
                previewImg.classList.add('d-none');
                previewImg.style.display = 'none';
                previewImg.src = '';
            }

            if (imageUploadContent) {
                imageUploadContent.classList.remove('d-none');
                imageUploadContent.style.display = '';
            }

            if (removeBtn) {
                removeBtn.classList.add('d-none');
            }

            if (imageInput) {
                imageInput.value = '';
            }
        }
    }

    /**
     * 重置更新彈窗表單
     */
    resetUpdateModalForm() {
        const form = document.getElementById('updateCategoryModalForm');
        if (form) {
            form.reset();
        }

        this.resetUpdateModalImage();
        $('#remove_image').val('0');

        const inputs = form?.querySelectorAll('.form-control');
        if (inputs) {
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
            });
        }

        $('#updateCategoryModal .status-card').removeClass('selected');
    }

    /**
     * 清理 modal backdrop
     */
    cleanupModalBackdrop() {
        // 移除所有 modal backdrop
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        // 移除 body 上的 modal 相关类
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    /**
     * 提交更新彈窗中的Category
     */
    submitUpdateModalCategory() {
        const form = document.getElementById('updateCategoryModalForm');
        const categoryId = form.getAttribute('data-category-id');

        if (!categoryId) {
            this.showAlert('Category ID not found', 'error');
            return;
        }

        const modal = document.getElementById('updateCategoryModal');
        const categoryNameInput = modal ? modal.querySelector('#update_category_name') : null;
        const statusInput = modal ? modal.querySelector('input[name="category_status"]:checked') : null;
        const imageInput = modal ? modal.querySelector('#input_image') : null;
        const removeImageInput = modal ? modal.querySelector('#remove_image') : null;
        const submitBtn = $('#submitUpdateCategoryModal');

        const categoryName = categoryNameInput ? categoryNameInput.value.trim() : '';
        const categoryStatus = statusInput ? statusInput.value : '';

        let isValid = true;

        if (!categoryName) {
            if (categoryNameInput) {
                categoryNameInput.classList.add('is-invalid');
            }
            isValid = false;
        } else {
            if (categoryNameInput) {
                categoryNameInput.classList.remove('is-invalid');
                categoryNameInput.classList.add('is-valid');
            }
        }

        if (!categoryStatus) {
            this.showAlert('Please select category status', 'warning');
            isValid = false;
        }

        if (!isValid) {
            this.showAlert('Please fill in all required fields', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
        formData.append('_method', 'PUT');
        formData.append('category_name', categoryName);
        formData.append('category_status', categoryStatus);

        if (imageInput && imageInput.files && imageInput.files[0]) {
            formData.append('category_image', imageInput.files[0]);
    }

if (removeImageInput && removeImageInput.value === '1') {
        formData.append('remove_image', '1');
    }

        // 檢查是否有圖片相關的更改
        const hasImageChange = (imageInput && imageInput.files && imageInput.files[0]) ||
                               (removeImageInput && removeImageInput.value === '1');

        const originalText = submitBtn.html();
        submitBtn.html('<i class="bi bi-hourglass-split me-2"></i>Updating...');
        submitBtn.prop('disabled', true);

        const updateUrl = window.updateCategoryUrl.replace(':id', categoryId);
        fetch(updateUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 422) {
                    return response.json().then(data => {
                        throw { status: 422, errors: data.errors || {} };
                    });
                }
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to update category');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.showAlert(data.message || 'Category updated successfully', 'success');

                const modal = bootstrap.Modal.getInstance(document.getElementById('updateCategoryModal'));
                if (modal) {
                    modal.hide();
                }

                // 如果有圖片更改，刷新整個頁面；否則只更新 DOM
                if (hasImageChange) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    // 沒有圖片更改，重新載入當前頁面
                    this.fetchCategories(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to update category', 'error');
            }
        })
        .catch(error => {
            // 处理验证错误 (422)
            if (error.status === 422 && error.errors) {
                this.displayValidationErrors(error.errors);
                this.showAlert('Please fill in all required fields', 'warning');
            } else {
                let errorMessage = 'Failed to update category';
                if (error.message) {
                    errorMessage = error.message;
                }
                this.showAlert(errorMessage, 'error');
            }
        })
        .finally(() => {
            submitBtn.html(originalText);
            submitBtn.prop('disabled', false);
        });
    }
}

// =============================================================================
// 全局實例初始化 (Global Instance Initialization)
// =============================================================================

let categoryDashboard;

$(document).ready(function() {
    if ($("#table-body").length > 0) {
        categoryDashboard = new CategoryDashboard();

        // 導出方法到全局作用域
        window.setCategoryAvailable = (categoryId) => categoryDashboard.setAvailable(categoryId);
        window.setCategoryUnavailable = (categoryId) => categoryDashboard.setUnavailable(categoryId);
        window.editCategory = (categoryId) => categoryDashboard.editCategory(categoryId);
        window.deleteCategory = (categoryId) => categoryDashboard.deleteCategory(categoryId);
    }
});
