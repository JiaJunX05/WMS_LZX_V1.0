/**
 * Zone Management JavaScript
 * 區域管理統一交互邏輯
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

// 區域列表數組（用於 Create 頁面）
let zoneList = [];

// 排序狀態：true = 升序，false = 降序
let isAscending = false; // 默認降序（最新的在上面）

// =============================================================================
// Dashboard 頁面功能 (Dashboard Page Functions)
// =============================================================================

/**
 * Zone Dashboard 類
 * 區域儀表板頁面交互邏輯
 */
class ZoneDashboard {
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
        this.fetchZones();
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
            this.fetchZones(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchZones(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchZones(this.currentPage + 1);
            }
        });

        // 全選/取消全選功能
        $('#select-all').on('change', (e) => {
            const isChecked = $(e.target).is(':checked');
            $('.zone-checkbox').prop('checked', isChecked);
            this.updateExportButton();
        });

        // 單個勾選框變化
        $(document).on('change', '.zone-checkbox', () => {
            this.updateSelectAllCheckbox();
            this.updateExportButton();
        });

        // 導出按鈕
        $('#export-zones-btn').on('click', () => {
            this.exportSelectedZones();
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
     * 獲取區域數據
     * @param {number} page 頁碼
     */
    fetchZones(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.zoneManagementRoute;

        $.get(apiRoute, params)
            .done((response) => {
                if (response.data && response.data.length > 0) {
                    this.renderZones(response.data);
                    this.updatePaginationInfo(response);
                } else {
                    this.showNoResults();
                }
                this.updateStatistics(response);
                this.updateResultsCount(response);
                this.generatePagination(response);
            })
            .fail((xhr, status, error) => {
                this.showAlert('Failed to load zones, please try again', 'danger');
            });
    }

    /**
     * 處理搜索
     */
    handleSearch() {
        this.fetchZones(1);
    }

    /**
     * 處理篩選
     */
    handleFilter() {
        this.fetchZones(1);
    }

    /**
     * 清除所有篩選條件
     */
    clearFilters() {
        this.statusFilter = '';
        this.searchTerm = '';

        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchZones(1);
    }

    /**
     * 更新統計數據
     * @param {Object} response API響應數據
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-zones').text(total);

        // 計算活躍和非活躍區域數量
        if (response.data) {
            const activeCount = response.data.filter(zone => zone.zone_status === 'Available').length;
            const inactiveCount = response.data.filter(zone => zone.zone_status === 'Unavailable').length;
            const withImageCount = response.data.filter(zone => zone.zone_image).length;

            $('#active-zones').text(activeCount);
            $('#inactive-zones').text(inactiveCount);
            $('#zones-with-image').text(withImageCount);
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
     * 渲染區域列表
     * @param {Array} zones 區域數據數組
     */
    renderZones(zones) {
        const $tableBody = $('#table-body');
        const html = zones.map(zone => this.createZoneRow(zone)).join('');
        $tableBody.html(html);

        // 重置勾選框狀態
        this.updateSelectAllCheckbox();
        this.updateExportButton();

        // 隱藏空狀態
        $('#empty-state').addClass('d-none');
    }

    createZoneRow(zone) {
        const statusMenuItem = zone.zone_status === 'Unavailable'
            ? `<a class="dropdown-item" href="javascript:void(0)" onclick="zoneDashboard.setAvailable(${zone.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate Zone
               </a>`
            : `<a class="dropdown-item" href="javascript:void(0)" onclick="zoneDashboard.setUnavailable(${zone.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate Zone
               </a>`;

        const actionButtons = `
            <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="zoneDashboard.editZone(${zone.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="zoneDashboard.deleteZone(${zone.id})">
                            <i class="bi bi-trash me-2"></i> Delete Zone
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4">
                    <input class="zone-checkbox form-check-input" type="checkbox" value="${zone.id}" id="zone-${zone.id}">
                </td>
                <td>
                    ${zone.zone_image ? `
                        <img src="/assets/images/${zone.zone_image}" alt="Zone Image"
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
                            <i class="bi bi-geo-alt me-2 text-primary"></i>${zone.zone_name}
                        </div>
                        <div class="text-muted small">
                            <i class="bi bi-geo me-1"></i>${zone.location || 'No location specified'}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge ${zone.zone_status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${zone.zone_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${zone.zone_status}
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
        $('#table-body').empty();
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
    // 區域操作模塊 (Zone Operations Module)
    // =============================================================================

    /**
     * 編輯區域
     * @param {number} zoneId 區域ID
     */
    editZone(zoneId) {
        const url = window.editZoneUrl.replace(':id', zoneId);
        window.location.href = url;
    }

    /**
     * 刪除區域
     * @param {number} zoneId 區域ID
     */
    deleteZone(zoneId) {
        if (!confirm('Are you sure you want to delete this zone?')) return;

        fetch(window.deleteZoneUrl.replace(':id', zoneId), {
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
                this.showAlert(data.message || 'Zone deleted successfully', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchZones(1);
                } else {
                    // 重新載入當前頁面的區域列表
                    this.fetchZones(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to delete zone', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to delete zone', 'error');
        });
    }

    /**
     * 激活區域
     * @param {number} zoneId 區域ID
     */
    setAvailable(zoneId) {
        if (!confirm('Are you sure you want to activate this zone?')) return;

        fetch(window.availableZoneUrl.replace(':id', zoneId), {
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
                this.showAlert(data.message || 'Zone has been set to available status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchZones(1);
                } else {
                    // 重新載入當前頁面的區域列表
                    this.fetchZones(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set zone available', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set zone available', 'error');
        });
    }

    /**
     * 停用區域
     * @param {number} zoneId 區域ID
     */
    setUnavailable(zoneId) {
        if (!confirm('Are you sure you want to deactivate this zone?')) return;

        fetch(window.unavailableZoneUrl.replace(':id', zoneId), {
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
                this.showAlert(data.message || 'Zone has been set to unavailable status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchZones(1);
                } else {
                    // 重新載入當前頁面的區域列表
                    this.fetchZones(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set zone unavailable', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set zone unavailable', 'error');
        });
    }

    // =============================================================================
    // 勾選框管理模塊 (Checkbox Management Module)
    // =============================================================================

    /**
     * 更新全選勾選框狀態
     */
    updateSelectAllCheckbox() {
        const totalCheckboxes = $('.zone-checkbox').length;
        const checkedCheckboxes = $('.zone-checkbox:checked').length;
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
        const checkedCount = $('.zone-checkbox:checked').length;
        const exportBtn = $('#export-zones-btn');

        if (checkedCount > 0) {
            exportBtn.prop('disabled', false);
            exportBtn.html(`<i class="bi bi-download me-2"></i>Export Data (${checkedCount})`);
        } else {
            exportBtn.prop('disabled', true);
            exportBtn.html('<i class="bi bi-download me-2"></i>Export Data');
        }
    }

    /**
     * 導出選中的區域
     */
    exportSelectedZones() {
        const selectedIds = $('.zone-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            this.showAlert('Please select at least one zone to export', 'warning');
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
        const exportUrl = `${window.zoneExportUrl}?${params}`;

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
 * 添加區域到數組
 * @param {string} zoneName 區域名稱
 * @param {string} location 位置
 * @param {File} zoneImageFile 圖片文件
 */
function addZoneToArray(zoneName, location, zoneImageFile) {
    // 調試信息：檢查傳入的數據
    console.log('addZoneToArray called with:', { zoneName, location, zoneImageFile });

    // 添加區域到數組
    const zoneData = {
        zoneName: zoneName,
        location: location,
        zoneStatus: 'Available', // 默認為 Available
        zoneImageFile: zoneImageFile // 存儲文件對象而不是base64
    };

    zoneList.push(zoneData);

    // 更新UI
    updateZoneList();
    updateUI();

    // 顯示右邊的區域表格
    showZoneValuesArea();

    // 清空輸入框
    const zoneNameInput = document.getElementById('zone_name');
    const locationInput = document.getElementById('location');
    if (zoneNameInput) {
        zoneNameInput.value = '';
    }
    if (locationInput) {
        locationInput.value = '';
    }

    // 清空圖片（不顯示消息）
    resetImageWithoutMessage('zone');

    // 調試信息：檢查添加後的狀態選擇
    const currentStatus = document.querySelector('input[name="zone_status"]:checked');
    console.log('After adding zone, current status selection:', currentStatus ? currentStatus.value : 'No status selected');
}

/**
 * 檢查區域名稱是否已存在（簡化版本，用於當前頁面）
 * @param {string} zoneName 區域名稱
 * @returns {boolean} 是否存在
 */
function isZoneExists(zoneName) {
    return zoneList.some(item => item.zoneName.toLowerCase() === zoneName.toLowerCase());
}

/**
 * 添加區域
 */
function addZone() {
    console.log('addZone function called');

    const zoneNameInput = document.getElementById('zone_name');
    const locationInput = document.getElementById('location');

    console.log('zoneNameInput element:', zoneNameInput);
    console.log('locationInput element:', locationInput);

    const zoneName = zoneNameInput ? zoneNameInput.value.trim() : '';
    const location = locationInput ? locationInput.value.trim() : '';

    console.log('Zone name:', zoneName, 'Location:', location);

    // 驗證輸入
    if (!zoneName) {
        showAlert('Please enter zone name', 'warning');
        zoneNameInput.focus();
        return;
    }

    if (!location) {
        showAlert('Please enter zone location', 'warning');
        locationInput.focus();
        return;
    }

    // 檢查是否已存在
    if (isZoneExists(zoneName)) {
        showAlert(`Zone name "${zoneName}" already exists in the list`, 'error');
        highlightExistingZone(zoneName);
        zoneNameInput.focus();
        return;
    }

    // 獲取當前圖片文件
    const imageInput = document.getElementById('zone_image');
    let zoneImageFile = null;
    if (imageInput && imageInput.files && imageInput.files[0]) {
        zoneImageFile = imageInput.files[0];
    }

    // 添加到區域數組（狀態默認為 Available）
    addZoneToArray(zoneName, location, zoneImageFile);

    // 顯示成功提示
    showAlert('Zone added successfully', 'success');
}

/**
 * 移除區域
 * @param {number} index 索引
 */
function removeZone(index) {
    console.log('Removing zone at index:', index);
    console.log('Zone list before removal:', zoneList);

    // 確認機制
    if (!confirm('Are you sure you want to remove this zone?')) {
        return;
    }

    if (index >= 0 && index < zoneList.length) {
        zoneList.splice(index, 1);
        console.log('Zone list after removal:', zoneList);
        updateZoneList();
        updateUI();

        // 顯示成功移除的 alert
        showAlert('Zone removed successfully', 'success');
    } else {
        console.error('Invalid index:', index);
        showAlert('Failed to remove zone', 'error');
    }
}

/**
 * 清除表單
 */
function clearForm() {
    // 檢查是否有數據需要清除
    if (zoneList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 確認清除
    if (!confirm('Are you sure you want to clear all zones?')) {
        return;
    }

    // 清空數組
    zoneList = [];

    // 清空輸入框
    const zoneNameInput = document.getElementById('zone_name');
    const locationInput = document.getElementById('location');
    if (zoneNameInput) {
        zoneNameInput.value = '';
    }
    if (locationInput) {
        locationInput.value = '';
    }

    // 更新UI
    updateZoneList();
    updateUI();

    // 顯示成功提示
    showAlert('All zones cleared successfully', 'success');

    // 隱藏所有區域
    hideAllAreas();
}

/**
 * 更新區域列表
 */
function updateZoneList() {
    const container = document.getElementById('zoneValuesList');
    if (!container) return;

    container.innerHTML = '';

    zoneList.forEach((item, index) => {
        // 檢查是否為重複項
        const isDuplicate = isZoneExists(item.zoneName) &&
            zoneList.filter(i => i.zoneName.toLowerCase() === item.zoneName.toLowerCase()).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 bg-light rounded border fade-in';
        const duplicateClasses = isDuplicate ? 'border-warning' : '';

        const zoneItem = document.createElement('div');
        zoneItem.className = `${baseClasses} ${duplicateClasses}`;

        zoneItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-3">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                <div class="me-3 flex-shrink-0">
                    ${item.zoneImageFile ?
                        `<img src="${URL.createObjectURL(item.zoneImageFile)}" class="rounded border border-2 border-white shadow-sm" style="width: 3.125rem; height: 3.125rem; object-fit: cover;" alt="Zone Image">` :
                        `<div class="bg-light rounded border border-2 border-white shadow-sm d-flex align-items-center justify-content-center"
                            style="width: 3.125rem; height: 3.125rem;">
                            <i class="bi bi-geo-alt text-muted fs-5"></i>
                        </div>`
                    }
                </div>
                <div class="flex-grow-1 min-width-0">
                    <div class="fw-bold text-dark mb-1 text-truncate">
                        <i class="bi bi-geo-alt me-2 text-primary"></i>${item.zoneName}
                    </div>
                    <div class="text-muted small" style="line-height: 1.3; word-wrap: break-word;">
                        <i class="bi bi-geo me-1"></i>${item.location || 'N/A'}
                    </div>
                    ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2 mt-1">Duplicate</span>' : ''}
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;

        container.appendChild(zoneItem);
    });
}

/**
 * 高亮顯示列表中已存在的區域名稱
 * @param {string} zoneName 區域名稱
 */
function highlightExistingZone(zoneName) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.fw-bold').textContent.trim();
        if (value.toLowerCase() === zoneName.toLowerCase()) {
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
 * 顯示區域值區域
 */
function showZoneValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }

    // 顯示區域值區域
    const zoneValuesArea = document.getElementById('zoneValuesArea');
    if (zoneValuesArea) {
        zoneValuesArea.classList.remove('d-none');
    }

    // 更新區域名稱顯示
    updateZoneNameDisplay();

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
    // 隱藏區域值區域
    const zoneValuesArea = document.getElementById('zoneValuesArea');
    if (zoneValuesArea) {
        zoneValuesArea.classList.add('d-none');
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
    // 更新區域值計數
    updateZoneValuesCount();


    // 更新區域名稱顯示
    updateZoneNameDisplay();

    // 如果沒有區域，隱藏所有區域並顯示初始狀態
    if (zoneList.length === 0) {
        hideAllAreas();
    }
}

/**
 * 更新區域值計數
 */
function updateZoneValuesCount() {
    const count = zoneList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('zoneValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} zones`;
    }
}

function updateZoneNameDisplay() {
    const zoneNameSpan = document.getElementById('zoneName');
    if (zoneNameSpan) {
        if (zoneList.length > 0) {
            // 顯示區域數量
            zoneNameSpan.textContent = `- ${zoneList.length} zones`;
        } else {
            zoneNameSpan.textContent = '';
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
    const sortBtn = document.getElementById('sortZones');

    // 更新圖標
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortZoneValuesList();
}

/**
 * 排序區域值列表
 */
function sortZoneValuesList() {
    const zoneValuesList = document.getElementById('zoneValuesList');
    const items = Array.from(zoneValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取區域名稱並排序
    const zoneValues = items.map(item => ({
        element: item,
        value: item.querySelector('.fw-bold').textContent.trim()
    }));

    // 按字母順序排序
    zoneValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    zoneValues.forEach(({ element }) => {
        zoneValuesList.appendChild(element);
    });
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
            showAlert(data.message || 'Zone updated successfully', 'success');

            // 延遲重定向到列表頁面
            setTimeout(() => {
                window.location.href = window.zoneManagementRoute || '/admin/storage-locations/zone/index';
            }, 2000);
        } else {
            // 简化错误信息，类似 mapping 页面
            if (data.message && data.message.includes('Some zones failed to create')) {
                showAlert('Some zones failed to create', 'error');
            } else {
                showAlert(data.message || 'Failed to update zone', 'error');
            }
        }
    })
    .catch(error => {
        if (error.message.includes('already been taken') || error.message.includes('zone_name')) {
            showAlert('This zone name already exists. Please choose a different name.', 'warning');
        } else {
            showAlert('Failed to update zone', 'error');
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
    const zoneNameInput = document.getElementById('zone_name');
    const locationInput = document.getElementById('location');

    // 驗證區域名稱
    if (!zoneNameInput.value.trim()) {
        showAlert('Please enter zone name', 'warning');
        zoneNameInput.focus();
        return false;
    }

    // 驗證區域位置
    if (!locationInput.value.trim()) {
        showAlert('Please enter zone location', 'warning');
        locationInput.focus();
        return false;
    }

    // 驗證狀態選擇
    const selectedStatus = document.querySelector('input[name="zone_status"]:checked');
    if (!selectedStatus) {
        showAlert('Please select zone status', 'warning');
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
 * 驗證區域數據
 * @returns {boolean} 驗證結果
 */
function validateZoneData() {
    // 檢查是否有重複的區域名稱
    const duplicates = [];
    const seen = new Set();
    for (const item of zoneList) {
        const combination = item.zoneName.toLowerCase();
        if (seen.has(combination)) {
            duplicates.push(item.zoneName);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        showAlert('Duplicate zone names found. Please remove duplicates before submitting.', 'error');
        return false;
    }

    return true;
}

/**
 * 提交區域表單
 */
function submitZoneForm() {
    // 調試信息：檢查要提交的數據
    console.log('Submitting zone data:', zoneList);

    // 準備提交數據
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加區域數據
    zoneList.forEach((item, index) => {
        // 調試信息：檢查每個區域的狀態
        console.log(`Zone ${index + 1}:`, { zoneName: item.zoneName, zoneStatus: item.zoneStatus });

        // 添加區域文本數據
        formData.append(`zones[${index}][zone_name]`, item.zoneName);
        formData.append(`zones[${index}][location]`, item.location);
        formData.append(`zones[${index}][zone_status]`, item.zoneStatus);

        // 添加圖片文件（如果有）
        if (item.zoneImageFile) {
            formData.append(`images[${index}]`, item.zoneImageFile);
        }
    });

    // 提交數據
    fetch(window.createZoneUrl, {
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
            showAlert(data.message || 'Zones created successfully', 'success');

            // 延遲重定向到dashboard，讓用戶看到成功消息
            setTimeout(() => {
                window.location.href = window.zoneManagementRoute || '/admin/storage-locations/zone/index';
            }, 2000);
        } else {
            // 简化错误信息，类似 mapping 页面
            if (data.message && data.message.includes('Some zones failed to create')) {
                showAlert('Some zones failed to create', 'error');
            } else {
                showAlert(data.message || 'Failed to create zones', 'error');
            }
        }
    })
    .catch(error => {
        // 简化错误信息
        showAlert('Some zones failed to create', 'error');
    });
}

// =============================================================================
// 頁面初始化功能 (Page Initialization Functions)
// =============================================================================

/**
 * 綁定區域事件
 */
function bindZoneEvents() {
    // Create 頁面事件綁定
    bindZoneCreateEvents();

    // 使用統一的圖片處理模組（避免重複綁定）
    if (typeof window.ImageSystem !== 'undefined' && !window.ImageSystem._zoneEventsBound) {
        window.ImageSystem.bindModuleImageEvents('zone');
        window.ImageSystem._zoneEventsBound = true; // 標記已綁定
    } else if (typeof window.ImageSystem === 'undefined') {
        console.warn('ImageSystem not available, image functionality may not work properly');
    }

    // 表單提交事件監聽器
    const zoneForm = document.getElementById('zoneForm');
    if (zoneForm) {
        zoneForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 檢查是否有區域
            if (zoneList.length === 0) {
                showAlert('Please add at least one zone', 'warning');
                return;
            }

            // 驗證所有區域數據
            if (!validateZoneData()) {
                return;
            }

            // 提交表單
            submitZoneForm();
        });
    }
}

/**
 * 綁定區域創建頁面事件
 */
function bindZoneCreateEvents() {
    // 區域名稱輸入框回車事件
    const zoneNameInput = document.getElementById('zone_name');
    if (zoneNameInput) {
        zoneNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addZone();
            }
        });
    }

    // 事件委托：刪除區域按鈕和 AddToList 按鈕
    document.addEventListener('click', function(e) {
        if (e.target.closest('button[data-index]')) {
            const button = e.target.closest('button[data-index]');
            const index = parseInt(button.getAttribute('data-index'));
            removeZone(index);
        }

        // AddToList 按鈕事件 - 更新選擇器
        if (e.target.closest('#addZone')) {
            e.preventDefault();
            addZone();
        }
    });

    // 排序按鈕
    const sortBtn = document.getElementById('sortZones');
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
 * 初始化區域更新頁面
 */
function initializeZoneUpdate() {
    bindZoneEvents();

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
 * 初始化區域頁面
 * @param {Object} config 配置對象
 */
function initializeZonePage(config) {
    bindZoneEvents();

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

let zoneDashboard;

$(document).ready(function() {
    // 檢查當前頁面是否是dashboard頁面（有table-body元素）
    if ($("#table-body").length > 0) {
        zoneDashboard = new ZoneDashboard();
    }
});

// =============================================================================
// DOM 內容加載完成後的事件綁定 (DOM Content Loaded Event Binding)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // 初始化區域事件（包括圖片上傳功能）
    bindZoneEvents();

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

    // Update 頁面狀態卡片初始化
    initializeUpdateStatusCards();
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

// 導出主要函數到全局作用域
window.addZone = addZone;
window.removeZone = removeZone;
window.clearForm = clearForm;
window.toggleZoneStatus = toggleZoneStatus;
window.setZoneAvailable = setZoneAvailable;
window.setZoneUnavailable = setZoneUnavailable;
window.updateZoneStatus = updateZoneStatus;
window.viewZoneDetails = viewZoneDetails;
window.handleRemoveImageButton = handleRemoveImageButton;
window.removeUpdateImage = removeUpdateImage;
