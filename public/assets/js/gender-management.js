/**
 * Gender Management JavaScript
 * 性別管理統一交互邏輯
 *
 * 功能模塊：
 * - Dashboard 頁面：搜索、篩選、分頁、CRUD 操作
 * - Create 頁面：批量創建、表單驗證、狀態管理
 * - Update 頁面：編輯更新、表單提交
 * - 通用功能：API 請求、UI 更新、事件綁定
 *
 * @author WMS Team
 * @version 1.0.0
 */

// =============================================================================
// 全局變量和狀態管理 (Global Variables and State Management)
// =============================================================================

// 性別列表數組（用於 Create 頁面）
let genderList = [];

// 排序狀態：true = 升序，false = 降序
let isAscending = false; // 默認降序（最新的在上面）

// =============================================================================
// Dashboard 頁面功能 (Dashboard Page Functions)
// =============================================================================

/**
 * Gender Dashboard 類
 * 性別儀表板頁面交互邏輯
 */
class GenderDashboard {
    constructor() {
        // 狀態管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.genderFilter = '';
        this.statusFilter = '';

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模塊 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.fetchGenders();
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
        $('#gender-filter').on('change', (e) => {
            this.genderFilter = $(e.target).val();
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

        // 全選/取消全選功能
        $('#select-all').on('change', (e) => {
            const isChecked = $(e.target).is(':checked');
            $('.gender-checkbox').prop('checked', isChecked);
            this.updateExportButton();
        });

        // 單個勾選框變化
        $(document).on('change', '.gender-checkbox', () => {
            this.updateSelectAllCheckbox();
            this.updateExportButton();
        });

        // 導出按鈕
        $('#export-genders-btn').on('click', () => {
            this.exportSelectedGenders();
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
            gender_id: this.genderFilter,
            gender_status: this.statusFilter,
            perPage: 10
        };
    }

    /**
     * 獲取性別數據
     * @param {number} page 頁碼
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
                this.showAlert('Failed to load genders', 'danger');
            });
    }

    /**
     * 處理搜索
     */
    handleSearch() {
        this.fetchGenders(1);
    }

    /**
     * 處理篩選
     */
    handleFilter() {
        this.fetchGenders(1);
    }

    /**
     * 清除所有篩選條件
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
     * 更新統計數據
     * @param {Object} response API響應數據
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-genders').text(total);

        // 計算活躍和非活躍性別數量
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
     * 渲染性別列表
     * @param {Array} genders 性別數據數組
     */
    renderGenders(genders) {
        const $tableBody = $('#table-body');
        const html = genders.map(gender => this.createGenderRow(gender)).join('');
        $tableBody.html(html);

        // 重置勾選框狀態
        this.updateSelectAllCheckbox();
        this.updateExportButton();
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
            <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="genderDashboard.editGender(${gender.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="genderDashboard.deleteGender(${gender.id})">
                            <i class="bi bi-trash me-2"></i> Delete Gender
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4">
                    <input class="gender-checkbox form-check-input" type="checkbox" value="${gender.id}" id="gender-${gender.id}">
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-person me-2 text-primary"></i>
                        <h6 class="mb-0 fw-bold">${gender.gender_name.toUpperCase()}</h6>
                    </div>
                </td>
                <td>
                    <span class="badge bg-light text-dark">
                        ${gender.sizes_count || 0} sizes
                    </span>
                </td>
                <td>
                    <span class="badge ${gender.gender_status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${gender.gender_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${gender.gender_status}
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
    // 性別操作模塊 (Gender Operations Module)
    // =============================================================================

    /**
     * 編輯性別
     * @param {number} genderId 性別ID
     */
    editGender(genderId) {
        const url = window.editGenderUrl.replace(':id', genderId);
        window.location.href = url;
    }

    /**
     * 刪除性別
     * @param {number} genderId 性別ID
     */
    deleteGender(genderId) {
        if (!confirm('Are you sure you want to delete this gender?')) return;

        fetch(window.deleteGenderUrl.replace(':id', genderId), {
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
                this.showAlert(data.message || 'Gender deleted successfully', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchGenders(1);
                } else {
                    // 重新載入當前頁面的性別列表
                    this.fetchGenders(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to delete gender', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to delete gender', 'error');
        });
    }

    /**
     * 激活性別
     * @param {number} genderId 性別ID
     */
    setAvailable(genderId) {
        if (!confirm('Are you sure you want to activate this gender?')) return;

        fetch(window.availableGenderUrl.replace(':id', genderId), {
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
                this.showAlert(data.message || 'Gender has been set to available status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchGenders(1);
                } else {
                    // 重新載入當前頁面的性別列表
                    this.fetchGenders(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set gender available', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set gender available', 'error');
        });
    }

    /**
     * 停用性別
     * @param {number} genderId 性別ID
     */
    setUnavailable(genderId) {
        if (!confirm('Are you sure you want to deactivate this gender?')) return;

        fetch(window.unavailableGenderUrl.replace(':id', genderId), {
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
                this.showAlert(data.message || 'Gender has been set to unavailable status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchGenders(1);
                } else {
                    // 重新載入當前頁面的性別列表
                    this.fetchGenders(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set gender unavailable', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set gender unavailable', 'error');
        });
    }

    // =============================================================================
    // 勾選框管理模塊 (Checkbox Management Module)
    // =============================================================================

    /**
     * 更新全選勾選框狀態
     */
    updateSelectAllCheckbox() {
        const totalCheckboxes = $('.gender-checkbox').length;
        const checkedCheckboxes = $('.gender-checkbox:checked').length;
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
        const checkedCount = $('.gender-checkbox:checked').length;
        const exportBtn = $('#export-genders-btn');

        if (checkedCount > 0) {
            exportBtn.prop('disabled', false);
            exportBtn.html(`<i class="bi bi-download me-2"></i>Export Data (${checkedCount})`);
        } else {
            exportBtn.prop('disabled', true);
            exportBtn.html('<i class="bi bi-download me-2"></i>Export Data');
        }
    }

    /**
     * 導出選中的性別
     */
    exportSelectedGenders() {
        const selectedIds = $('.gender-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            this.showAlert('Please select at least one gender to export', 'warning');
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
        const exportUrl = `${window.genderExportUrl}?${params}`;

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
 * 添加性別到數組
 * @param {string} genderName 性別名稱
 * @param {string} genderStatus 性別狀態
 */
function addGenderToArray(genderName, genderStatus) {
    // 調試信息：檢查傳入的數據
    console.log('addGenderToArray called with:', { genderName, genderStatus });

    // 添加性別到數組
    const genderData = {
        genderName: genderName,
        genderStatus: genderStatus
    };

    genderList.push(genderData);

    // 更新UI
    updateGenderList();
    updateUI();

    // 顯示右邊的性別表格
    showGenderValuesArea();

    // 清空輸入框
    const genderNameInput = document.getElementById('gender_name');
    if (genderNameInput) {
        genderNameInput.value = '';
        genderNameInput.focus();
    }
}

/**
 * 檢查性別名稱是否已存在（簡化版本，用於當前頁面）
 * @param {string} genderName 性別名稱
 * @returns {boolean} 是否存在
 */
function isGenderExists(genderName) {
    return genderList.some(item => item.genderName.toLowerCase() === genderName.toLowerCase());
}

/**
 * 添加性別
 */
function addGender() {
    const genderNameInput = document.getElementById('gender_name');

    const genderName = genderNameInput.value.trim();

    // 驗證輸入
    if (!genderName) {
        showAlert('Please enter gender name', 'warning');
        genderNameInput.focus();
        return;
    }

    // 檢查是否已存在
    if (isGenderExists(genderName)) {
        showAlert(`Gender name "${genderName}" already exists in the list`, 'error');
        highlightExistingGender(genderName);
        genderNameInput.focus();
        return;
    }

    // 添加到性別數組（默認狀態為 Available）
    addGenderToArray(genderName, 'Available');
    // 顯示成功提示
    showAlert('Gender added successfully', 'success');
}

/**
 * 移除性別
 * @param {number} index 索引
 */
function removeGender(index) {
    console.log('Removing gender at index:', index);
    console.log('Gender list before removal:', genderList);

    if (index >= 0 && index < genderList.length) {
        // 獲取要刪除的性別信息
        const genderToRemove = genderList[index];

        // 確認刪除
        if (!confirm(`Are you sure you want to remove gender "${genderToRemove.genderName}"?`)) {
            return;
        }

        genderList.splice(index, 1);
        console.log('Gender list after removal:', genderList);
        updateGenderList();

        // 如果沒有性別了，隱藏區域
        if (genderList.length === 0) {
            hideAllAreas();
        }

        updateUI();
        showAlert('Gender removed successfully', 'success');
    } else {
        console.error('Invalid index:', index);
        showAlert('Failed to remove gender', 'error');
    }
}

/**
 * 更新性別列表
 */
function updateGenderList() {
    const container = document.getElementById('genderValuesList');
    if (!container) return;

    container.innerHTML = '';

    genderList.forEach((item, index) => {
        // 檢查是否為重複項
        const isDuplicate = isGenderExists(item.genderName) &&
            genderList.filter(i => i.genderName.toLowerCase() === item.genderName.toLowerCase()).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 bg-light rounded border fade-in';
        const duplicateClasses = isDuplicate ? 'border-warning' : '';

        const genderItem = document.createElement('div');
        genderItem.className = `${baseClasses} ${duplicateClasses}`;

        genderItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-3">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                <div class="me-3 flex-shrink-0" style="width: 32px; height: 32px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <i class="bi bi-person text-muted"></i>
                </div>
                <div class="flex-grow-1 min-width-0">
                    <div class="fw-bold text-dark mb-1 text-truncate">
                        ${item.genderName}
                    </div>
                    ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2 mt-1">Duplicate</span>' : ''}
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;

        container.appendChild(genderItem);
    });
}

/**
 * 高亮顯示列表中已存在的性別名稱
 * @param {string} genderName 性別名稱
 */
function highlightExistingGender(genderName) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.fw-bold').textContent.trim();
        if (value.toLowerCase() === genderName.toLowerCase()) {
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
 * 顯示性別值區域
 */
function showGenderValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }

    // 顯示性別值區域
    const genderValuesArea = document.getElementById('genderValuesArea');
    if (genderValuesArea) {
        genderValuesArea.classList.remove('d-none');
    }

    // 更新性別名稱顯示
    updateGenderNameDisplay();

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
    // 隱藏性別值區域
    const genderValuesArea = document.getElementById('genderValuesArea');
    if (genderValuesArea) {
        genderValuesArea.classList.add('d-none');
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
    if (genderList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 確認清除
    if (!confirm('Are you sure you want to clear all genders?')) {
        return;
    }

    // 清空數組
    genderList = [];

    // 清空輸入框
    const genderNameInput = document.getElementById('gender_name');
    if (genderNameInput) {
        genderNameInput.value = '';
    }

    // 更新UI
    updateGenderList();
    updateUI();

    // 顯示成功提示
    showAlert('All genders cleared successfully', 'success');

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
    // 更新性別值計數
    updateGenderValuesCount();

    // 更新性別範圍顯示
    updateGenderRangeDisplay();

    // 更新性別名稱顯示
    updateGenderNameDisplay();

    // 如果沒有性別，隱藏所有區域並顯示初始狀態
    if (genderList.length === 0) {
        hideAllAreas();
    }
}

/**
 * 更新性別值計數
 */
function updateGenderValuesCount() {
    const count = genderList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('genderValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} genders`;
    }
}


function updateGenderNameDisplay() {
    const genderNameSpan = document.getElementById('genderName');
    if (genderNameSpan) {
        if (genderList.length > 0) {
            // 顯示性別數量
            genderNameSpan.textContent = `- ${genderList.length} genders`;
        } else {
            genderNameSpan.textContent = '';
        }
    }
}

function updateGenderRangeDisplay() {
    const genderNames = genderList.map(item => item.genderName);

    const selectedGenderSpan = document.getElementById('selectedGender');
    if (selectedGenderSpan) {
        if (genderNames.length === 0) {
            selectedGenderSpan.textContent = 'None';
        } else if (genderNames.length === 1) {
            selectedGenderSpan.textContent = genderNames[0];
        } else {
            // 按字母順序排序
            const sortedNames = genderNames.sort();
            const minGender = sortedNames[0];
            const maxGender = sortedNames[sortedNames.length - 1];
            selectedGenderSpan.textContent = `${minGender} - ${maxGender}`;
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
    const sortBtn = document.getElementById('sortGenders');

    // 更新圖標
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortGenderValuesList();
}

/**
 * 排序性別值列表
 */
function sortGenderValuesList() {
    const genderValuesList = document.getElementById('genderValuesList');
    const items = Array.from(genderValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取性別名稱並排序
    const genderValues = items.map(item => ({
        element: item,
        value: item.querySelector('.fw-bold').textContent.trim()
    }));

    // 按字母順序排序
    genderValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    genderValues.forEach(({ element }) => {
        genderValuesList.appendChild(element);
    });
}

// =============================================================================
// 批量添加功能 (Batch Add Functions)
// =============================================================================


/**
 * 添加多個性別
 * @param {Array} genders 性別數組
 */
function addMultipleGenders(genders) {
    let addedCount = 0;
    let skippedCount = 0;

    genders.forEach(gender => {
        if (!isGenderExists(gender)) {
            addGenderToList(gender, 'Available'); // 默認狀態為 Available
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 顯示結果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} genders`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} genders, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All genders already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加性別，顯示右邊的表格
    if (addedCount > 0) {
        showGenderValuesArea();
    }
}

/**
 * 添加性別到列表
 * @param {string} genderName 性別名稱
 * @param {string} genderStatus 狀態（默認為 Available）
 */
function addGenderToList(genderName, genderStatus) {
    // 檢查是否為重複項
    if (isGenderExists(genderName)) {
        console.log('Duplicate detected in batch add, skipping:', genderName);
        return; // 跳過重複項，不添加到列表
    }

    // 添加到 genderList 數組
    genderList.push({
        genderName: genderName,
        genderStatus: genderStatus
    });

    // 重新渲染整個列表
    updateGenderList();
    updateUI();

    // 顯示性別值區域
    showGenderValuesArea();
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
            const message = data.message || 'Gender updated successfully';
            showAlert(message, 'success');

            // 延遲重定向到列表頁面
            setTimeout(() => {
                window.location.href = window.genderManagementRoute || '/admin/genders/index';
            }, 2000);
        } else {
            isGenderUpdating = false; // 錯誤時重置標誌
            showAlert(data.message || 'Failed to update gender', 'error');
        }
    })
    .catch(error => {
        isGenderUpdating = false; // 錯誤時重置標誌
        if (error.message.includes('already been taken') || error.message.includes('gender_name')) {
            showAlert('This gender name already exists. Please choose a different name.', 'warning');
        } else {
            showAlert('Failed to update gender', 'error');
        }
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
    const genderNameInput = document.getElementById('gender_name');

    // 驗證性別名稱
    if (!genderNameInput.value.trim()) {
        showAlert('Please enter gender name', 'warning');
        genderNameInput.focus();
        return false;
    }

    // 驗證狀態選擇
    const selectedStatus = document.querySelector('input[name="gender_status"]:checked');
    if (!selectedStatus) {
        showAlert('Please select gender status', 'warning');
        return false;
    }

    return true;
}

// =============================================================================
// 表單驗證和提交 (Form Validation & Submission)
// =============================================================================

/**
 * 驗證性別數據
 * @returns {boolean} 驗證結果
 */
function validateGenderData() {
    // 檢查是否有重複的性別名稱
    const duplicates = [];
    const seen = new Set();
    for (const item of genderList) {
        const combination = item.genderName.toLowerCase();
        if (seen.has(combination)) {
            duplicates.push(item.genderName);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        showAlert('Duplicate gender names found. Please remove duplicates before submitting.', 'error');
        return false;
    }

    return true;
}

/**
 * 提交性別表單
 */
function submitGenderForm() {
    // 調試信息：檢查要提交的數據
    console.log('Submitting gender data:', genderList);

    // 準備提交數據
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加性別數據
    genderList.forEach((item, index) => {
        // 調試信息：檢查每個性別的狀態
        console.log(`Gender ${index + 1}:`, { genderName: item.genderName, genderStatus: item.genderStatus });

        // 添加性別文本數據
        formData.append(`genders[${index}][genderName]`, item.genderName);
        formData.append(`genders[${index}][genderStatus]`, item.genderStatus);
    });

    // 提交數據
    fetch(window.createGenderUrl, {
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
            showAlert(data.message || 'Genders created successfully', 'success');

            // 延遲重定向到dashboard，讓用戶看到成功消息
            setTimeout(() => {
                window.location.href = window.genderManagementRoute || '/admin/genders/index';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to create genders', 'error');
        }
    })
    .catch(error => {
        showAlert('Some genders failed to create', 'error');
    });
}

// =============================================================================
// 頁面初始化功能 (Page Initialization Functions)
// =============================================================================

/**
 * 綁定性別事件
 */
function bindGenderEvents() {
    // Create 頁面事件綁定
    bindGenderCreateEvents();

    // 表單提交事件監聽器
    const genderForm = document.getElementById('genderForm');
    if (genderForm) {
        genderForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 檢查是否有性別
            if (genderList.length === 0) {
                showAlert('Please add at least one gender', 'warning');
                return;
            }

            // 驗證所有性別數據
            if (!validateGenderData()) {
                return;
            }

            // 提交表單
            submitGenderForm();
        });
    }
}

/**
 * 綁定性別創建頁面事件
 */
function bindGenderCreateEvents() {
    // 性別名稱輸入框回車事件
    const genderNameInput = document.getElementById('gender_name');
    if (genderNameInput) {
        genderNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addGender();
            }
        });
    }

    // 添加性別按鈕
    const addGenderBtn = document.getElementById('addGender');
    if (addGenderBtn) {
        addGenderBtn.addEventListener('click', addGender);
    }

    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：刪除性別按鈕
    document.addEventListener('click', function(e) {
        if (e.target.closest('button[data-index]')) {
            const button = e.target.closest('button[data-index]');
            const index = parseInt(button.getAttribute('data-index'));
            removeGender(index);
        }
    });

    // 排序按鈕
    const sortBtn = document.getElementById('sortGenders');
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

/**
 * 初始化性別更新頁面
 */
// 全局變量防止重複請求
let isGenderUpdating = false;
let genderUpdateFormBound = false;

function initializeGenderUpdate() {
    bindGenderEvents();

    // Update 頁面表單提交 - 確保只綁定一次
    if (!genderUpdateFormBound) {
        const updateForm = document.querySelector('form[action*="update"]');
        if (updateForm) {
            updateForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (isGenderUpdating) return false;
                isGenderUpdating = true;
                handleUpdateFormSubmit(this);
            });
            genderUpdateFormBound = true;
        }
    }

    // Update 頁面狀態卡片初始化
    initializeUpdateStatusCards();
}

/**
 * 初始化性別頁面
 * @param {Object} config 配置對象
 */
function initializeGenderPage(config) {
    bindGenderEvents();

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

let genderDashboard;

$(document).ready(function() {
    // 檢查當前頁面是否是dashboard頁面（有table-body元素）
    if ($("#table-body").length > 0) {
        genderDashboard = new GenderDashboard();
    }
});

// =============================================================================
// DOM 內容加載完成後的事件綁定 (DOM Content Loaded Event Binding)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // 初始化性別事件
    bindGenderEvents();

    // Update 頁面表單提交 - 確保只綁定一次
    if (!genderUpdateFormBound) {
        const updateForm = document.querySelector('form[action*="update"]');
        if (updateForm) {
            updateForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (isGenderUpdating) return false;
                isGenderUpdating = true;
                handleUpdateFormSubmit(this);
            });
            genderUpdateFormBound = true;
        }
    }

    // Update 頁面狀態卡片初始化（只在 Update 頁面調用）
    if (updateForm) {
        initializeUpdateStatusCards();
    }
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

// 導出主要函數到全局作用域
window.addGender = addGender;
window.removeGender = removeGender;
window.clearForm = clearForm;
window.toggleGenderStatus = toggleGenderStatus;
window.setGenderAvailable = setGenderAvailable;
window.setGenderUnavailable = setGenderUnavailable;
window.updateGenderStatus = updateGenderStatus;
window.viewGenderDetails = viewGenderDetails;
