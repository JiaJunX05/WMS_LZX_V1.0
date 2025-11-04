/**
 * Rack Management JavaScript
 * 貨架管理統一交互邏輯
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

// 貨架列表數組（用於 Create 頁面）
let rackList = [];

// 排序狀態：true = 升序，false = 降序
let isAscending = false; // 默認降序（最新的在上面）

// =============================================================================
// Dashboard 頁面功能 (Dashboard Page Functions)
// =============================================================================

/**
 * Rack Dashboard 類
 * 貨架儀表板頁面交互邏輯
 */
class RackDashboard {
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
        this.fetchRacks();
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
            this.fetchRacks(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchRacks(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchRacks(this.currentPage + 1);
            }
        });

        // 全選/取消全選功能
        $('#select-all').on('change', (e) => {
            const isChecked = $(e.target).is(':checked');
            $('.rack-checkbox').prop('checked', isChecked);
            this.updateExportButton();
        });

        // 單個勾選框變化
        $(document).on('change', '.rack-checkbox', () => {
            this.updateSelectAllCheckbox();
            this.updateExportButton();
        });

        // 導出按鈕
        $('#export-racks-btn').on('click', () => {
            this.exportSelectedRacks();
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
     * 獲取貨架數據
     * @param {number} page 頁碼
     */
    fetchRacks(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.rackManagementRoute;

        $.get(apiRoute, params)
            .done((response) => {
                if (response.data && response.data.length > 0) {
                    this.renderRacks(response.data);
                    this.updatePaginationInfo(response);
                } else {
                    this.showNoResults();
                }
                this.updateStatistics(response);
                this.updateResultsCount(response);
                this.generatePagination(response);
            })
            .fail((xhr, status, error) => {
                this.showAlert('Failed to load racks, please try again', 'danger');
            });
    }

    /**
     * 處理搜索
     */
    handleSearch() {
        this.fetchRacks(1);
    }

    /**
     * 處理篩選
     */
    handleFilter() {
        this.fetchRacks(1);
    }

    /**
     * 清除所有篩選條件
     */
    clearFilters() {
        this.statusFilter = '';
        this.searchTerm = '';

        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchRacks(1);
    }

    /**
     * 更新統計數據
     * @param {Object} response API響應數據
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-racks').text(total);

        // 計算活躍和非活躍貨架數量
        if (response.data) {
            const activeCount = response.data.filter(rack => rack.rack_status === 'Available').length;
            const inactiveCount = response.data.filter(rack => rack.rack_status === 'Unavailable').length;
            const withImageCount = response.data.filter(rack => rack.rack_image).length;

            $('#active-racks').text(activeCount);
            $('#inactive-racks').text(inactiveCount);
            $('#racks-with-image').text(withImageCount);
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
     * 渲染貨架列表
     * @param {Array} racks 貨架數據數組
     */
    renderRacks(racks) {
        const $tableBody = $('#table-body');
        const html = racks.map(rack => this.createRackRow(rack)).join('');
        $tableBody.html(html);

        // 重置勾選框狀態
        this.updateSelectAllCheckbox();
        this.updateExportButton();
    }

    createRackRow(rack) {
        const statusMenuItem = rack.rack_status === 'Unavailable'
            ? `<a class="dropdown-item" href="javascript:void(0)" onclick="rackDashboard.setAvailable(${rack.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate Rack
               </a>`
            : `<a class="dropdown-item" href="javascript:void(0)" onclick="rackDashboard.setUnavailable(${rack.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate Rack
               </a>`;

        const actionButtons = `
            <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="rackDashboard.editRack(${rack.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="rackDashboard.deleteRack(${rack.id})">
                            <i class="bi bi-trash me-2"></i> Delete Rack
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4">
                    <input class="rack-checkbox form-check-input" type="checkbox" value="${rack.id}" id="rack-${rack.id}">
                </td>
                <td>
                    ${rack.rack_image ? `
                        <img src="/assets/images/${rack.rack_image}" alt="Rack Image"
                             class="rounded border border-2 border-white shadow-sm" style="width: 2.5rem; height: 2.5rem; object-fit: cover;">
                    ` : `
                        <div class="rounded border border-2 border-white shadow-sm bg-light d-flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem;">
                            <i class="bi bi-image text-muted"></i>
                        </div>
                    `}
                </td>
                <td>
                    <div class="d-flex flex-column">
                        <div class="fw-bold text-dark mb-1">
                            <i class="bi bi-box-seam me-2 text-primary"></i>${rack.rack_number}
                        </div>
                        <div class="text-muted small">
                            <i class="bi bi-boxes me-1"></i>Capacity: <span class="fw-medium">${rack.capacity} items</span>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge ${rack.rack_status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${rack.rack_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${rack.rack_status}
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
                <td colspan="6" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-search fs-1 d-block mb-3"></i>
                        <h5>No racks found</h5>
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
    // 貨架操作模塊 (Rack Operations Module)
    // =============================================================================

    /**
     * 編輯貨架
     * @param {number} rackId 貨架ID
     */
    editRack(rackId) {
        const url = window.editRackUrl.replace(':id', rackId);
        window.location.href = url;
    }

    /**
     * 刪除貨架
     * @param {number} rackId 貨架ID
     */
    deleteRack(rackId) {
        if (!confirm('Are you sure you want to delete this rack?')) return;

        fetch(window.deleteRackUrl.replace(':id', rackId), {
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
                this.showAlert(data.message || 'Rack deleted successfully', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchRacks(1);
                } else {
                    // 重新載入當前頁面的貨架列表
                    this.fetchRacks(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to delete rack', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to delete rack', 'error');
        });
    }

    /**
     * 激活貨架
     * @param {number} rackId 貨架ID
     */
    setAvailable(rackId) {
        if (!confirm('Are you sure you want to activate this rack?')) return;

        fetch(window.availableRackUrl.replace(':id', rackId), {
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
                this.showAlert(data.message || 'Rack has been set to available status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchRacks(1);
                } else {
                    // 重新載入當前頁面的貨架列表
                    this.fetchRacks(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set rack available', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set rack available', 'error');
        });
    }

    /**
     * 停用貨架
     * @param {number} rackId 貨架ID
     */
    setUnavailable(rackId) {
        if (!confirm('Are you sure you want to deactivate this rack?')) return;

        fetch(window.unavailableRackUrl.replace(':id', rackId), {
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
                this.showAlert(data.message || 'Rack has been set to unavailable status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchRacks(1);
                } else {
                    // 重新載入當前頁面的貨架列表
                    this.fetchRacks(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set rack unavailable', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set rack unavailable', 'error');
        });
    }

    // =============================================================================
    // 勾選框管理模塊 (Checkbox Management Module)
    // =============================================================================

    /**
     * 更新全選勾選框狀態
     */
    updateSelectAllCheckbox() {
        const totalCheckboxes = $('.rack-checkbox').length;
        const checkedCheckboxes = $('.rack-checkbox:checked').length;
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
        const checkedCount = $('.rack-checkbox:checked').length;
        const exportBtn = $('#export-racks-btn');

        if (checkedCount > 0) {
            exportBtn.prop('disabled', false);
            exportBtn.html(`<i class="bi bi-download me-2"></i>Export Data (${checkedCount})`);
        } else {
            exportBtn.prop('disabled', true);
            exportBtn.html('<i class="bi bi-download me-2"></i>Export Data');
        }
    }

    /**
     * 導出選中的貨架
     */
    exportSelectedRacks() {
        const selectedIds = $('.rack-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            this.showAlert('Please select at least one rack to export', 'warning');
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
        const exportUrl = `${window.rackExportUrl}?${params}`;

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
 * 添加貨架到數組
 * @param {string} rackNumber 貨架編號
 * @param {string} capacity 容量
 * @param {string} rackStatus 狀態
 * @param {File} rackImageFile 圖片文件
 */
function addRackToArray(rackNumber, capacity, rackStatus, rackImageFile) {
    // 調試信息：檢查傳入的數據
    console.log('addRackToArray called with:', { rackNumber, capacity, rackStatus, rackImageFile });

    // 添加貨架到數組
    const rackData = {
        rackNumber: rackNumber,
        capacity: capacity,
        rackStatus: rackStatus,
        rackImageFile: rackImageFile // 存儲文件對象而不是base64
    };

    rackList.push(rackData);

    // 更新UI
    updateRackList();
    updateUI();

    // 顯示右邊的貨架表格
    showRackValuesArea();

    // 清空輸入框
    const rackNumberInput = document.getElementById('rack_number');
    const capacityInput = document.getElementById('capacity');
    if (rackNumberInput) {
        rackNumberInput.value = '';
    }
    if (capacityInput) {
        capacityInput.value = '';
    }

    // 清空圖片（不顯示消息）
    resetImageWithoutMessage('rack');

    // 調試信息：檢查添加後的狀態選擇
    const currentStatus = document.querySelector('input[name="rack_status"]:checked');
    console.log('After adding rack, current status selection:', currentStatus ? currentStatus.value : 'No status selected');
}

/**
 * 檢查貨架編號是否已存在（簡化版本，用於當前頁面）
 * @param {string} rackNumber 貨架編號
 * @returns {boolean} 是否存在
 */
function isRackExists(rackNumber) {
    return rackList.some(item => item.rackNumber.toLowerCase() === rackNumber.toLowerCase());
}

/**
 * 添加貨架
 */
function addRack() {
    const rackNumberInput = document.getElementById('rack_number');
    const capacityInput = document.getElementById('capacity');

    console.log('rackNumberInput element:', rackNumberInput);
    console.log('capacityInput element:', capacityInput);

    const rackNumber = rackNumberInput ? rackNumberInput.value.trim() : '';
    const capacity = capacityInput ? capacityInput.value.trim() || '50' : '50'; // 默認容量50

    console.log('Rack number:', rackNumber, 'Capacity:', capacity);

    // 驗證輸入
    if (!rackNumber) {
        showAlert('Please enter rack number', 'warning');
        rackNumberInput.focus();
        return;
    }

    // 檢查是否已存在
    if (isRackExists(rackNumber)) {
        showAlert(`Rack number "${rackNumber}" already exists in the list`, 'error');
        highlightExistingRack(rackNumber);
        rackNumberInput.focus();
        return;
    }

    // 獲取當前圖片文件
    const imageInput = document.getElementById('rack_image');
    let rackImageFile = null;
    if (imageInput && imageInput.files && imageInput.files[0]) {
        rackImageFile = imageInput.files[0];
    }

    // 添加到貨架數組（狀態默認為 Available）
    addRackToArray(rackNumber, capacity, 'Available', rackImageFile);

    // 顯示成功提示
    showAlert('Rack added successfully', 'success');
}

/**
 * 移除貨架
 * @param {number} index 索引
 */
function removeRack(index) {
    console.log('Removing rack at index:', index);
    console.log('Rack list before removal:', rackList);

    // 確認機制
    if (!confirm('Are you sure you want to remove this rack?')) {
        return;
    }

    if (index >= 0 && index < rackList.length) {
        rackList.splice(index, 1);
        console.log('Rack list after removal:', rackList);
        updateRackList();
        updateUI();

        // 顯示成功移除的 alert
        showAlert('Rack removed successfully', 'success');
    } else {
        console.error('Invalid index:', index);
        showAlert('Failed to remove rack', 'error');
    }
}

/**
 * 清除表單
 */
function clearForm() {
    // 檢查是否有數據需要清除
    if (rackList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 確認清除
    if (!confirm('Are you sure you want to clear all racks?')) {
        return;
    }

    // 清空數組
    rackList = [];

    // 清空輸入框
    const rackNumberInput = document.getElementById('rack_number');
    if (rackNumberInput) {
        rackNumberInput.value = '';
    }

    // 更新UI
    updateRackList();
    updateUI();

    // 顯示成功提示
    showAlert('All racks cleared successfully', 'success');

    // 隱藏所有區域
    hideAllAreas();
}

/**
 * 更新貨架列表
 */
function updateRackList() {
    const container = document.getElementById('rackValuesList');
    if (!container) return;

    container.innerHTML = '';

    rackList.forEach((item, index) => {
        // 檢查是否為重複項
        const isDuplicate = isRackExists(item.rackNumber) &&
            rackList.filter(i => i.rackNumber.toLowerCase() === item.rackNumber.toLowerCase()).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 bg-light rounded border fade-in';
        const duplicateClasses = isDuplicate ? 'border-warning' : '';

        const rackItem = document.createElement('div');
        rackItem.className = `${baseClasses} ${duplicateClasses}`;

        rackItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-3">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                <div class="me-3 flex-shrink-0">
                    ${item.rackImageFile ?
                        `<img src="${URL.createObjectURL(item.rackImageFile)}" class="img-thumbnail" style="width: 3.125rem; height: 3.125rem; object-fit: cover;" alt="Rack Image">` :
                        `<div class="bg-light border rounded d-flex align-items-center justify-content-center" style="width: 3.125rem; height: 3.125rem;">
                            <i class="bi bi-box text-muted fs-5"></i>
                        </div>`
                    }
                </div>
                <div class="flex-grow-1 min-width-0">
                    <div class="fw-bold text-dark mb-1 text-truncate">
                        <i class="bi bi-box-seam me-2 text-primary"></i>${item.rackNumber}
                    </div>
                    <div class="text-muted small" style="line-height: 1.3; word-wrap: break-word;">
                        <i class="bi bi-boxes me-1"></i>Capacity: <span class="fw-medium">${item.capacity} items</span>
                    </div>
                    ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2 mt-1">Duplicate</span>' : ''}
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;

        container.appendChild(rackItem);
    });
}

/**
 * 高亮顯示列表中已存在的貨架編號
 * @param {string} rackNumber 貨架編號
 */
function highlightExistingRack(rackNumber) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.fw-bold').textContent.trim();
        if (value.toLowerCase() === rackNumber.toLowerCase()) {
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
 * 顯示貨架值區域
 */
function showRackValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }

    // 顯示貨架值區域
    const rackValuesArea = document.getElementById('rackValuesArea');
    if (rackValuesArea) {
        rackValuesArea.classList.remove('d-none');
    }

    // 更新貨架名稱顯示
    updateRackNameDisplay();

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
    // 隱藏貨架值區域
    const rackValuesArea = document.getElementById('rackValuesArea');
    if (rackValuesArea) {
        rackValuesArea.classList.add('d-none');
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


// =============================================================================
// UI 更新功能 (UI Update Functions)
// =============================================================================

/**
 * 更新UI（簡化版本，用於當前頁面）
 */
function updateUI() {
    // 更新貨架值計數
    updateRackValuesCount();

    // 更新貨架範圍顯示
    updateRackRangeDisplay();

    // 更新貨架名稱顯示
    updateRackNameDisplay();

    // 如果沒有貨架，隱藏所有區域並顯示初始狀態
    if (rackList.length === 0) {
        hideAllAreas();
    }
}

/**
 * 更新貨架值計數
 */
function updateRackValuesCount() {
    const count = rackList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('rackValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} racks`;
    }
}


function updateRackNameDisplay() {
    const rackNameSpan = document.getElementById('rackName');
    if (rackNameSpan) {
        if (rackList.length > 0) {
            // 顯示貨架數量
            rackNameSpan.textContent = `- ${rackList.length} racks`;
        } else {
            rackNameSpan.textContent = '';
        }
    }
}

function updateRackRangeDisplay() {
    const rackNumbers = rackList.map(item => item.rackNumber);

    const selectedRackSpan = document.getElementById('selectedRack');
    if (selectedRackSpan) {
        if (rackNumbers.length === 0) {
            selectedRackSpan.textContent = 'None';
        } else if (rackNumbers.length === 1) {
            selectedRackSpan.textContent = rackNumbers[0];
        } else {
            // 按字母順序排序
            const sortedNumbers = rackNumbers.sort();
            const minRack = sortedNumbers[0];
            const maxRack = sortedNumbers[sortedNumbers.length - 1];
            selectedRackSpan.textContent = `${minRack} - ${maxRack}`;
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
    const sortBtn = document.getElementById('sortRacks');

    // 更新圖標
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortRackValuesList();
}

/**
 * 排序貨架值列表
 */
function sortRackValuesList() {
    const rackValuesList = document.getElementById('rackValuesList');
    const items = Array.from(rackValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取貨架編號並排序
    const rackValues = items.map(item => ({
        element: item,
        value: item.querySelector('.fw-bold').textContent.trim()
    }));

    // 按字母順序排序
    rackValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    rackValues.forEach(({ element }) => {
        rackValuesList.appendChild(element);
    });
}

// =============================================================================
// 批量添加功能 (Batch Add Functions)
// =============================================================================

/**
 * 添加貨架到列表
 * @param {string} rackNumber 貨架編號
 * @param {string} capacity 容量
 * @param {string} rackStatus 狀態
 * @param {File} rackImageFile 圖片文件
 */
function addRackToList(rackNumber, capacity, rackStatus = 'Available', rackImageFile = null) {
    // 檢查是否為重複項
    if (isRackExists(rackNumber)) {
        return; // 跳過重複項，不添加到列表
    }

    // 添加到 rackList 數組
    rackList.push({
        rackNumber: rackNumber,
        capacity: capacity,
        rackStatus: rackStatus,
        rackImageFile: rackImageFile
    });

    // 重新渲染整個列表
    updateRackList();
    updateUI();

    // 顯示貨架值區域
    showRackValuesArea();
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
            const message = data.message || 'Rack updated successfully';
            showAlert(message, 'success');

            // 延遲重定向到列表頁面
            setTimeout(() => {
                window.location.href = window.rackManagementRoute || '/admin/storage-locations/rack/index';
            }, 2000);
        } else {
            isRackUpdating = false; // 錯誤時重置標誌
            // 简化错误信息，类似 mapping 页面
            if (data.message && data.message.includes('Some racks failed to create')) {
                showAlert('Some racks failed to create', 'error');
            } else {
                showAlert(data.message || 'Failed to update rack', 'error');
            }
        }
    })
    .catch(error => {
        isRackUpdating = false; // 錯誤時重置標誌
        if (error.message.includes('already been taken') || error.message.includes('rack_number')) {
            showAlert('This rack number already exists. Please choose a different number.', 'warning');
        } else {
            showAlert('Failed to update rack', 'error');
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
    const rackNumberInput = document.getElementById('rack_number');
    const capacityInput = document.getElementById('capacity');

    // 驗證貨架編號
    if (!rackNumberInput.value.trim()) {
        showAlert('Please enter rack number', 'warning');
        rackNumberInput.focus();
        return false;
    }

    // 驗證容量
    const capacity = capacityInput.value.trim();
    if (capacity && (isNaN(capacity) || parseInt(capacity) <= 0)) {
        showAlert('Please enter a valid capacity (positive number)', 'warning');
        capacityInput.focus();
        return false;
    }

    // 驗證狀態選擇
    const selectedStatus = document.querySelector('input[name="rack_status"]:checked');
    if (!selectedStatus) {
        showAlert('Please select rack status', 'warning');
        return false;
    }

    return true;
}

// 图片处理函数已移至 image-system.js

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

// resetImageWithoutMessage 函数已移至 image-system.js

// =============================================================================
// 表單驗證和提交 (Form Validation & Submission)
// =============================================================================

/**
 * 驗證貨架數據
 * @returns {boolean} 驗證結果
 */
function validateRackData() {
    // 檢查是否有重複的貨架編號
    const duplicates = [];
    const seen = new Set();
    for (const item of rackList) {
        const combination = item.rackNumber.toLowerCase();
        if (seen.has(combination)) {
            duplicates.push(item.rackNumber);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        showAlert('Duplicate rack numbers found. Please remove duplicates before submitting.', 'error');
        return false;
    }

    return true;
}

/**
 * 提交貨架表單
 */
function submitRackForm() {
    // 調試信息：檢查要提交的數據
    console.log('Submitting rack data:', rackList);

    // 準備提交數據
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加貨架數據
    rackList.forEach((item, index) => {
        // 調試信息：檢查每個貨架的狀態
        console.log(`Rack ${index + 1}:`, { rackNumber: item.rackNumber, rackStatus: item.rackStatus });

        // 添加貨架文本數據
        formData.append(`racks[${index}][rack_number]`, item.rackNumber);
        formData.append(`racks[${index}][capacity]`, item.capacity);
        formData.append(`racks[${index}][rack_status]`, item.rackStatus);

        // 添加圖片文件（如果有）
        if (item.rackImageFile) {
            formData.append(`images[${index}]`, item.rackImageFile);
        }
    });

    // 提交數據
    fetch(window.createRackUrl, {
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
            showAlert(data.message || 'Racks created successfully', 'success');

            // 延遲重定向到dashboard，讓用戶看到成功消息
            setTimeout(() => {
                window.location.href = window.rackManagementRoute || '/admin/storage-locations/rack/index';
            }, 2000);
        } else {
            // 简化错误信息，类似 mapping 页面
            if (data.message && data.message.includes('Some racks failed to create')) {
                showAlert('Some racks failed to create', 'error');
            } else {
                showAlert(data.message || 'Failed to create racks', 'error');
            }
        }
    })
    .catch(error => {
        // 简化错误信息
        showAlert('Some racks failed to create', 'error');
    });
}

// =============================================================================
// 頁面初始化功能 (Page Initialization Functions)
// =============================================================================

/**
 * 綁定貨架事件
 */
function bindRackEvents() {
    // Create 頁面事件綁定
    bindRackCreateEvents();

    // 使用統一的圖片處理模組（避免重複綁定）
    if (typeof window.ImageSystem !== 'undefined' && !window.ImageSystem._rackEventsBound) {
        window.ImageSystem.bindModuleImageEvents('rack');
        window.ImageSystem._rackEventsBound = true; // 標記已綁定
    } else if (typeof window.ImageSystem === 'undefined') {
        console.warn('ImageSystem not available, image functionality may not work properly');
    }

    // 表單提交事件監聽器
    const rackForm = document.getElementById('rackForm');
    if (rackForm) {
        rackForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 檢查是否有貨架
            if (rackList.length === 0) {
                showAlert('Please add at least one rack', 'warning');
                return;
            }

            // 驗證所有貨架數據
            if (!validateRackData()) {
                return;
            }

            // 提交表單
            submitRackForm();
        });
    }
}

/**
 * 綁定貨架創建頁面事件
 */
function bindRackCreateEvents() {
    // 貨架編號輸入框回車事件
    const rackNumberInput = document.getElementById('rack_number');
    if (rackNumberInput) {
        rackNumberInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addRack();
            }
        });
    }

    // 添加貨架按鈕
    const addRackBtn = document.getElementById('addRack');
    if (addRackBtn) {
        addRackBtn.addEventListener('click', addRack);
    }

    // 事件委托：刪除貨架按鈕
    document.addEventListener('click', function(e) {
        if (e.target.closest('button[data-index]')) {
            const button = e.target.closest('button[data-index]');
            const index = parseInt(button.getAttribute('data-index'));
            removeRack(index);
        }
    });

    // 排序按鈕
    const sortBtn = document.getElementById('sortRacks');
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
 * 初始化貨架更新頁面
 */
// 全局變量防止重複請求
let isRackUpdating = false;
let rackUpdateFormBound = false;

function initializeRackUpdate() {
    bindRackEvents();

    // Update 頁面表單提交 - 確保只綁定一次
    if (!rackUpdateFormBound) {
        const updateForm = document.querySelector('form[action*="update"]');
        if (updateForm) {
            updateForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (isRackUpdating) return false;
                isRackUpdating = true;
                handleUpdateFormSubmit(this);
            });
            rackUpdateFormBound = true;
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
    initializeStatusCards();
}

/**
 * 初始化貨架頁面
 * @param {Object} config 配置對象
 */
function initializeRackPage(config) {
    bindRackEvents();

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

let rackDashboard;

$(document).ready(function() {
    // 檢查當前頁面是否是dashboard頁面（有table-body元素）
    if ($("#table-body").length > 0) {
        rackDashboard = new RackDashboard();
    }
});

// =============================================================================
// DOM 內容加載完成後的事件綁定 (DOM Content Loaded Event Binding)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // 初始化貨架事件（包括圖片上傳功能）
    bindRackEvents();

    // Update 頁面表單提交 - 確保只綁定一次
    if (!rackUpdateFormBound) {
        const updateForm = document.querySelector('form[action*="update"]');
        if (updateForm) {
            updateForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (isRackUpdating) return false;
                isRackUpdating = true;
                handleUpdateFormSubmit(this);
            });
            rackUpdateFormBound = true;
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
window.addRack = addRack;
window.removeRack = removeRack;
window.clearForm = clearForm;
window.toggleRackStatus = toggleRackStatus;
window.setRackAvailable = setRackAvailable;
window.setRackUnavailable = setRackUnavailable;
window.updateRackStatus = updateRackStatus;
window.viewRackDetails = viewRackDetails;
window.handleRemoveImageButton = handleRemoveImageButton;
window.removeUpdateImage = removeUpdateImage;
