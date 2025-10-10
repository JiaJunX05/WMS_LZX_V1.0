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
            <button class="btn-action" title="Edit" onclick="zoneDashboard.editZone(${zone.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="zoneDashboard.deleteZone(${zone.id})">
                            <i class="bi bi-trash me-2"></i> Delete Zone
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4"><span class="text-muted">#${zone.id}</span></td>
                <td>
                    ${zone.zone_image ? `
                        <img src="/assets/images/${zone.zone_image}" alt="Zone Image"
                             class="preview-image"
                             onclick="previewImage('/assets/images/${zone.zone_image}')">
                    ` : `
                        <div class="no-image">No Image</div>
                    `}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <h6 class="mb-0 fw-bold">${zone.zone_name}</h6>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="text-muted">${zone.location || 'No location specified'}</span>
                    </div>
                </td>
                <td><span class="status-badge ${this.getStatusClass(zone.zone_status)}">${zone.zone_status}</span></td>
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
                <td colspan="6" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-search fs-1 d-block mb-3"></i>
                        <h5>No zones found</h5>
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
    resetImageWithoutMessage();

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
    const zoneNameInput = document.getElementById('zone_name');
    const locationInput = document.getElementById('location');

    const zoneName = zoneNameInput.value.trim();
    const location = locationInput.value.trim();

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
 * 更新區域列表
 */
function updateZoneList() {
    const container = document.getElementById('zoneValuesList');
    if (!container) return;

    container.innerHTML = '';

    zoneList.forEach((item, index) => {
        const zoneItem = document.createElement('div');

        // 檢查是否為重複項
        const isDuplicate = isZoneExists(item.zoneName) &&
            zoneList.filter(i => i.zoneName.toLowerCase() === item.zoneName.toLowerCase()).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
        const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

        zoneItem.className = `${baseClasses} ${duplicateClasses}`;

        zoneItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                ${item.zoneImageFile ?
                    `<img src="${URL.createObjectURL(item.zoneImageFile)}" alt="${item.zoneName}" class="item-image me-2" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;">` :
                    '<div class="item-image-placeholder me-2" style="width: 32px; height: 32px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-geo-alt text-muted"></i></div>'
                }
                <div class="d-flex flex-column">
                    <span class="item-value-text fw-medium">${item.zoneName}</span>
                    <small class="text-muted">${item.location}</small>
                </div>
                ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
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
        const value = item.querySelector('.item-value-text').textContent.trim();
        if (value.toLowerCase() === zoneName.toLowerCase()) {
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
 * 顯示區域值區域
 */
function showZoneValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 隱藏輸入提示
    const zoneInputPrompt = document.getElementById('zoneInputPrompt');
    if (zoneInputPrompt) {
        zoneInputPrompt.style.display = 'none';
    }

    // 顯示區域值區域
    const zoneValuesArea = document.getElementById('zoneValuesArea');
    if (zoneValuesArea) {
        zoneValuesArea.style.display = 'block';
    }

    // 更新區域名稱顯示
    updateZoneNameDisplay();

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
    // 隱藏區域值區域
    const zoneValuesArea = document.getElementById('zoneValuesArea');
    if (zoneValuesArea) {
        zoneValuesArea.style.display = 'none';
    }

    // 隱藏輸入提示
    const zoneInputPrompt = document.getElementById('zoneInputPrompt');
    if (zoneInputPrompt) {
        zoneInputPrompt.style.display = 'none';
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

// =============================================================================
// UI 更新功能 (UI Update Functions)
// =============================================================================

/**
 * 更新UI（簡化版本，用於當前頁面）
 */
function updateUI() {
    // 更新區域值計數
    updateZoneValuesCount();

    // 更新區域範圍顯示
    updateZoneRangeDisplay();

    // 更新區域名稱顯示
    updateZoneNameDisplay();

    // 更新配置摘要
    updateConfigSummary();

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

function updateConfigSummary() {
    // 更新區域範圍顯示
    updateZoneRangeDisplay();

    // 顯示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (configSummary) {
        configSummary.style.display = 'block';
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

function updateZoneRangeDisplay() {
    const zoneNames = zoneList.map(item => item.zoneName);

    const selectedZoneSpan = document.getElementById('selectedZone');
    if (selectedZoneSpan) {
        if (zoneNames.length === 0) {
            selectedZoneSpan.textContent = 'None';
        } else if (zoneNames.length === 1) {
            selectedZoneSpan.textContent = zoneNames[0];
        } else {
            // 按字母順序排序
            const sortedNames = zoneNames.sort();
            const minZone = sortedNames[0];
            const maxZone = sortedNames[sortedNames.length - 1];
            selectedZoneSpan.textContent = `${minZone} - ${maxZone}`;
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
        value: item.querySelector('.item-value-text').textContent.trim()
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
// 批量添加功能 (Batch Add Functions)
// =============================================================================

/**
 * 添加常用區域
 */
function addCommonZones() {
    // Common zones
    const commonZones = [
        'A Zone',
        'B Zone',
        'C Zone',
        'D Zone',
        'E Zone',
        'F Zone',
        'G Zone',
        'H Zone',
        'I Zone',
        'J Zone'
    ];

    addMultipleZones(commonZones);
}

/**
 * 添加倉庫區域
 */
function addWarehouseZones() {
    // Warehouse zones
    const warehouseZones = [
        'Receiving Zone',
        'Storage Zone A',
        'Storage Zone B',
        'Storage Zone C',
        'Picking Zone',
        'Packing Zone',
        'Shipping Zone',
        'Returns Zone',
        'Quality Control Zone',
        'Cold Storage Zone',
        'Hazardous Materials Zone',
        'Overflow Zone'
    ];

    addMultipleZones(warehouseZones);
}

/**
 * 添加多個區域
 * @param {Array} zones 區域數組
 */
function addMultipleZones(zones) {
    let addedCount = 0;
    let skippedCount = 0;
    const locationInput = document.getElementById('location');
    const defaultLocation = locationInput.value.trim() || 'Warehouse';

    zones.forEach(zone => {
        if (!isZoneExists(zone)) {
            addZoneToList(zone, defaultLocation, 'Available'); // 默認為 Available
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 顯示結果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} zones`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} zones, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All zones already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加區域，顯示右邊的表格
    if (addedCount > 0) {
        showZoneValuesArea();
    }
}

/**
 * 添加區域到列表
 * @param {string} zoneName 區域名稱
 * @param {string} location 位置
 * @param {string} zoneStatus 狀態（默認為 Available）
 * @param {File} zoneImageFile 圖片文件
 */
function addZoneToList(zoneName, location, zoneStatus = 'Available', zoneImageFile = null) {
    // 檢查是否為重複項
    if (isZoneExists(zoneName)) {
        console.log('Duplicate detected in batch add, skipping:', zoneName);
        return; // 跳過重複項，不添加到列表
    }

    // 添加到 zoneList 數組
    zoneList.push({
        zoneName: zoneName,
        location: location,
        zoneStatus: zoneStatus,
        zoneImageFile: zoneImageFile
    });

    // 重新渲染整個列表
    updateZoneList();
    updateUI();

    // 顯示區域值區域
    showZoneValuesArea();
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

/**
 * Update 頁面圖片預覽處理
 * @param {Event} event 文件選擇事件
 */
function handleUpdateImagePreview(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('image-preview');

    if (file) {
        // 驗證文件類型
        if (!file.type.startsWith('image/')) {
            showAlert('Please select a valid image file', 'warning');
            return;
        }

        // 驗證文件大小 (5MB限制)
        if (file.size > 5 * 1024 * 1024) {
            showAlert('Image size must be less than 5MB', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" id="preview-image"
                         class="img-fluid rounded-3" style="max-width: 100%; max-height: 280px; object-fit: contain;">
                    <div class="image-remove-btn" title="Remove image">
                        <i class="bi bi-x"></i>
                    </div>
                `;

                // 添加刪除按鈕事件
                const removeBtn = previewContainer.querySelector('.image-remove-btn');
                if (removeBtn) {
                    removeBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        removeUpdateImage();
                    });
                }
            }
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Update 頁面圖片移除
 */
function removeUpdateImage() {
    // 確認是否要移除圖片
    if (!confirm('Are you sure you want to remove this image?')) {
        return;
    }

    const imageInput = document.getElementById('input_image');
    const previewContainer = document.getElementById('image-preview');

    if (imageInput && previewContainer) {
        // 重置文件輸入
        imageInput.value = '';

        // 恢復原始內容
        const originalContent = previewContainer.getAttribute('data-original-content');
        if (originalContent) {
            previewContainer.innerHTML = originalContent;
        } else {
            // 如果沒有原始內容，顯示默認狀態
            previewContainer.innerHTML = `
                <div class="text-center text-muted">
                    <i class="bi bi-image fs-1 mb-3 d-block"></i>
                    <p class="mb-0">No image uploaded</p>
                    <small>Upload an image to see preview</small>
                </div>
            `;
        }

        showAlert('Image removed successfully', 'success');
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
            imageInputId: 'zone_image',
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
        formData.append(`zones[${index}][zoneName]`, item.zoneName);
        formData.append(`zones[${index}][location]`, item.location);
        formData.append(`zones[${index}][zoneStatus]`, item.zoneStatus);

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

    // 添加區域按鈕
    const addZoneBtn = document.getElementById('addZone');
    if (addZoneBtn) {
        addZoneBtn.addEventListener('click', addZone);
    }

    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：刪除區域按鈕
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            removeZone(index);
        }
    });

    // 排序按鈕
    const sortBtn = document.getElementById('sortZones');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 快速添加按鈕
    const addCommonZonesBtn = document.getElementById('addCommonZones');
    if (addCommonZonesBtn) {
        addCommonZonesBtn.addEventListener('click', addCommonZones);
    }

    const addWarehouseZonesBtn = document.getElementById('addWarehouseZones');
    if (addWarehouseZonesBtn) {
        addWarehouseZonesBtn.addEventListener('click', addWarehouseZones);
    }
}

/**
 * 初始化區域更新頁面
 */
function initializeZoneUpdate() {
    bindZoneEvents();
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
