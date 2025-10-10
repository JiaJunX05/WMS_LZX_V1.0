/**
 * Color Management JavaScript
 * 顏色管理統一交互邏輯
 *
 * 功能模塊：
 * - Dashboard 頁面：搜索、篩選、分頁、CRUD 操作
 * - Create 頁面：批量創建、表單驗證、狀態管理
 * - Update 頁面：編輯更新、顏色預覽、表單提交
 * - 通用功能：API 請求、UI 更新、事件綁定
 *
 * @author WMS Team
 * @version 1.0.0
 */

// =============================================================================
// 全局變量和狀態管理 (Global Variables and State Management)
// =============================================================================

// 顏色列表數組（用於 Create 頁面）
let colorList = [];

// 排序狀態：true = 升序，false = 降序
let isAscending = false; // 默認降序（最新的在上面）

// =============================================================================
// Dashboard 頁面功能 (Dashboard Page Functions)
// =============================================================================

/**
 * Color Dashboard 類
 * 顏色儀表板頁面交互邏輯
 */
class ColorDashboard {
    constructor() {
        // 狀態管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.colorFilter = '';
        this.statusFilter = '';

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模塊 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.fetchColors();
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
        $('#color-filter').on('change', (e) => {
            this.colorFilter = $(e.target).val();
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
            this.fetchColors(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchColors(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchColors(this.currentPage + 1);
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
            color_id: this.colorFilter,
            color_status: this.statusFilter,
            perPage: 10
        };
    }

    /**
     * 獲取顏色數據
     * @param {number} page 頁碼
     */
    fetchColors(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.colorManagementRoute;

        $.get(apiRoute, params)
            .done((response) => {
                if (response.data && response.data.length > 0) {
                    this.renderColors(response.data);
                    this.updatePaginationInfo(response);
                } else {
                    this.showNoResults();
                }
                this.updateStatistics(response);
                this.updateResultsCount(response);
                this.generatePagination(response);
            })
            .fail((xhr, status, error) => {
                this.showAlert('Failed to load colors, please try again', 'danger');
            });
    }

    /**
     * 處理搜索
     */
    handleSearch() {
        this.fetchColors(1);
    }

    /**
     * 處理篩選
     */
    handleFilter() {
        this.fetchColors(1);
    }

    /**
     * 清除所有篩選條件
     */
    clearFilters() {
        this.colorFilter = '';
        this.statusFilter = '';
        this.searchTerm = '';

        $('#color-filter').val('');
        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchColors(1);
    }

    /**
     * 更新統計數據
     * @param {Object} response API響應數據
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-colors').text(total);

        // 計算活躍和非活躍顏色數量
        if (response.data) {
            const activeCount = response.data.filter(color => color.color_status === 'Available').length;
            const inactiveCount = response.data.filter(color => color.color_status === 'Unavailable').length;
            const hexCount = response.data.filter(color => color.color_hex).length;

            $('#active-colors').text(activeCount);
            $('#inactive-colors').text(inactiveCount);
            $('#hex-colors').text(hexCount);
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
     * 渲染顏色列表
     * @param {Array} colors 顏色數據數組
     */
    renderColors(colors) {
        const $tableBody = $('#table-body');
        const html = colors.map(color => this.createColorRow(color)).join('');
        $tableBody.html(html);
    }

    createColorRow(color) {
        const statusMenuItem = color.color_status === 'Unavailable'
            ? `<a class="dropdown-item" href="javascript:void(0)" onclick="colorDashboard.setAvailable(${color.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate Color
               </a>`
            : `<a class="dropdown-item" href="javascript:void(0)" onclick="colorDashboard.setUnavailable(${color.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate Color
               </a>`;

        const actionButtons = `
            <button class="btn-action" title="Edit" onclick="colorDashboard.editColor(${color.id})">
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
                        <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="colorDashboard.deleteColor(${color.id})">
                            <i class="bi bi-trash me-2"></i> Delete Color
                        </a>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr>
                <td class="ps-4"><span class="text-muted">#${color.id}</span></td>
                <td>
                    <div class="color-preview-small" style="background-color: ${color.color_hex || '#cccccc'}"></div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <h6 class="mb-0 fw-bold">${color.color_name.toUpperCase()}</h6>
                    </div>
                </td>
                <td><span class="text-muted font-monospace">${color.color_hex || 'N/A'}</span></td>
                <td><span class="text-muted font-monospace">${color.color_rgb || 'N/A'}</span></td>
                <td><span class="status-badge ${this.getStatusClass(color.color_status)}">${color.color_status}</span></td>
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
                <td colspan="7" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-search fs-1 d-block mb-3"></i>
                        <h5>No colors found</h5>
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
    // 顏色操作模塊 (Color Operations Module)
    // =============================================================================

    /**
     * 編輯顏色
     * @param {number} colorId 顏色ID
     */
    editColor(colorId) {
        const url = window.editColorUrl.replace(':id', colorId);
        window.location.href = url;
    }

    /**
     * 刪除顏色
     * @param {number} colorId 顏色ID
     */
    deleteColor(colorId) {
        if (!confirm('Are you sure you want to delete this color?')) return;

        fetch(window.deleteColorUrl.replace(':id', colorId), {
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
                this.showAlert(data.message || 'Color deleted successfully', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchColors(1);
                } else {
                    // 重新載入當前頁面的顏色列表
                    this.fetchColors(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to delete color', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Error deleting color: ' + error.message, 'error');
        });
    }

    /**
     * 激活顏色
     * @param {number} colorId 顏色ID
     */
    setAvailable(colorId) {
        if (!confirm('Are you sure you want to activate this color?')) return;

        fetch(window.availableColorUrl.replace(':id', colorId), {
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
                this.showAlert(data.message || 'Color has been set to available status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchColors(1);
                } else {
                    // 重新載入當前頁面的顏色列表
                    this.fetchColors(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set color available', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Error setting color available: ' + error.message, 'error');
        });
    }

    /**
     * 停用顏色
     * @param {number} colorId 顏色ID
     */
    setUnavailable(colorId) {
        if (!confirm('Are you sure you want to deactivate this color?')) return;

        fetch(window.unavailableColorUrl.replace(':id', colorId), {
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
                this.showAlert(data.message || 'Color has been set to unavailable status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchColors(1);
                } else {
                    // 重新載入當前頁面的顏色列表
                    this.fetchColors(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set color unavailable', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Error setting color unavailable: ' + error.message, 'error');
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
 * 將 HEX 顏色轉換為 RGB 格式
 * @param {string} hex HEX 顏色代碼 (如: #FF0000)
 * @returns {string} RGB 格式字符串 (如: 255,0,0)
 */
function hexToRgb(hex) {
    // 移除 # 前綴
    hex = hex.replace('#', '');

    // 解析 HEX 值
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `${r},${g},${b}`;
}

/**
 * 驗證顏色代碼格式
 * @param {string} colorCode 顏色代碼
 * @returns {boolean} 是否有效
 */
function isValidColorCode(colorCode) {
    // 移除#號進行驗證
    const cleanCode = colorCode.replace('#', '');
    // 驗證6位十六進制代碼
    return /^[0-9A-Fa-f]{6}$/.test(cleanCode);
}

/**
 * 標準化顏色代碼
 * @param {string} colorHex 顏色代碼
 * @returns {string} 標準化的顏色代碼
 */
function normalizeColorHex(colorHex) {
    return colorHex.startsWith('#') ? colorHex : '#' + colorHex;
}

/**
 * 添加顏色到數組
 * @param {string} colorName 顏色名稱
 * @param {string} colorHex 顏色代碼
 * @param {string} colorStatus 顏色狀態
 */
function addColorToArray(colorName, colorHex, colorStatus) {
    // 標準化顏色代碼（確保有#前綴）
    const normalizedColorHex = normalizeColorHex(colorHex);

    // 將 HEX 轉換為 RGB
    const colorRgb = hexToRgb(normalizedColorHex);

    // 添加顏色到數組
    const colorData = {
        colorName: colorName,
        colorHex: normalizedColorHex,
        colorRgb: colorRgb,
        colorStatus: colorStatus
    };

    colorList.push(colorData);

    // 更新UI
    updateColorList();
    updateUI();

    // 顯示右邊的顏色表格
    showColorValuesArea();

    // 清空輸入框
    const colorNameInput = document.getElementById('color_name');
    const colorHexInput = document.getElementById('color_hex');
    if (colorNameInput) {
        colorNameInput.value = '';
        colorNameInput.focus();
    }
    if (colorHexInput) {
        colorHexInput.value = '';
    }
}

/**
 * 檢查顏色名稱是否已存在（簡化版本，用於當前頁面）
 * @param {string} colorName 顏色名稱
 * @returns {boolean} 是否存在
 */
function isColorExists(colorName) {
    return colorList.some(item => item.colorName.toLowerCase() === colorName.toLowerCase());
}

/**
 * 添加顏色
 */
function addColor() {
    const colorNameInput = document.getElementById('color_name');
    const colorHexInput = document.getElementById('color_hex');

    const colorName = colorNameInput.value.trim();
    const colorHex = colorHexInput.value.trim();

    // 驗證輸入
    if (!colorName) {
        showAlert('Please enter color name', 'warning');
        colorNameInput.focus();
        return;
    }

    if (!colorHex) {
        showAlert('Please enter color code', 'warning');
        colorHexInput.focus();
        return;
    }

    // 驗證顏色代碼格式
    if (!isValidColorCode(colorHex)) {
        showAlert('Please enter a valid color code (e.g., #FF0000 or FF0000)', 'warning');
        colorHexInput.focus();
        return;
    }

    // 檢查是否已存在
    if (isColorExists(colorName)) {
        showAlert(`Color name "${colorName}" already exists in the list`, 'error');
        highlightExistingColor(colorName);
        colorNameInput.focus();
        return;
    }

    // 添加到顏色數組（狀態默認為 Available）
    addColorToArray(colorName, colorHex, 'Available');

    // 顯示成功提示
    showAlert('Color added successfully', 'success');
}

/**
 * 移除顏色
 * @param {number} index 索引
 */
function removeColor(index) {
    console.log('Removing color at index:', index);
    console.log('Color list before removal:', colorList);

    // 確認機制
    if (!confirm('Are you sure you want to remove this color?')) {
        return;
    }

    if (index >= 0 && index < colorList.length) {
        colorList.splice(index, 1);
        console.log('Color list after removal:', colorList);
        updateColorList();
        updateUI();

        // 顯示成功移除的 alert
        showAlert('Color removed successfully', 'success');
    } else {
        console.error('Invalid index:', index);
        showAlert('Error: Invalid color index', 'error');
    }
}

/**
 * 更新顏色列表
 */
function updateColorList() {
    const container = document.getElementById('colorValuesList');
    if (!container) return;

    container.innerHTML = '';

    colorList.forEach((item, index) => {
        const colorItem = document.createElement('div');

        // 檢查是否為重複項
        const isDuplicate = isColorExists(item.colorName) &&
            colorList.filter(i => i.colorName.toLowerCase() === item.colorName.toLowerCase()).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
        const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

        colorItem.className = `${baseClasses} ${duplicateClasses}`;

        colorItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                <div class="color-preview-small me-2" style="width: 32px; height: 32px; border-radius: 4px; background-color: ${item.colorHex || '#f3f4f6'}; border: 1px solid #ddd;"></div>
                <span class="item-value-text fw-medium">${item.colorName}</span>
                <small class="text-muted ms-2">${item.colorHex}</small>
                ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;
        container.appendChild(colorItem);
    });
}

/**
 * 高亮顯示列表中已存在的顏色名稱
 * @param {string} colorName 顏色名稱
 */
function highlightExistingColor(colorName) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.item-value-text').textContent.trim();
        if (value.toLowerCase() === colorName.toLowerCase()) {
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
 * 顯示顏色值區域
 */
function showColorValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 隱藏輸入提示
    const colorInputPrompt = document.getElementById('colorInputPrompt');
    if (colorInputPrompt) {
        colorInputPrompt.style.display = 'none';
    }

    // 顯示顏色值區域
    const colorValuesArea = document.getElementById('colorValuesArea');
    if (colorValuesArea) {
        colorValuesArea.style.display = 'block';
    }

    // 更新顏色名稱顯示
    updateColorNameDisplay();

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
    // 隱藏顏色值區域
    const colorValuesArea = document.getElementById('colorValuesArea');
    if (colorValuesArea) {
        colorValuesArea.style.display = 'none';
    }

    // 隱藏輸入提示
    const colorInputPrompt = document.getElementById('colorInputPrompt');
    if (colorInputPrompt) {
        colorInputPrompt.style.display = 'none';
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
    if (colorList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 確認清除
    if (!confirm('Are you sure you want to clear all colors?')) {
        return;
    }

    // 清空數組
    colorList = [];

    // 清空輸入框
    const colorNameInput = document.getElementById('color_name');
    const colorHexInput = document.getElementById('color_hex');
    if (colorNameInput) {
        colorNameInput.value = '';
    }
    if (colorHexInput) {
        colorHexInput.value = '';
    }

    // 更新UI
    updateColorList();
    updateUI();

    // 顯示成功提示
    showAlert('All colors cleared successfully', 'success');

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
    // 更新顏色值計數
    updateColorValuesCount();

    // 更新顏色範圍顯示
    updateColorRangeDisplay();

    // 更新顏色名稱顯示
    updateColorNameDisplay();

    // 更新配置摘要
    updateConfigSummary();

    // 如果沒有顏色，隱藏所有區域並顯示初始狀態
    if (colorList.length === 0) {
        hideAllAreas();
    }
}

/**
 * 更新顏色值計數
 */
function updateColorValuesCount() {
    const count = colorList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('colorValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} colors`;
    }
}

function updateConfigSummary() {
    // 更新顏色範圍顯示
    updateColorRangeDisplay();

    // 顯示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (configSummary) {
        configSummary.style.display = 'block';
    }
}

function updateColorNameDisplay() {
    const colorNameSpan = document.getElementById('colorName');
    if (colorNameSpan) {
        if (colorList.length > 0) {
            // 顯示顏色數量
            colorNameSpan.textContent = `- ${colorList.length} colors`;
        } else {
            colorNameSpan.textContent = '';
        }
    }
}

function updateColorRangeDisplay() {
    const colorNames = colorList.map(item => item.colorName);

    const selectedColorSpan = document.getElementById('selectedColor');
    if (selectedColorSpan) {
        if (colorNames.length === 0) {
            selectedColorSpan.textContent = 'None';
        } else if (colorNames.length === 1) {
            selectedColorSpan.textContent = colorNames[0];
        } else {
            // 按字母順序排序
            const sortedNames = colorNames.sort();
            const minColor = sortedNames[0];
            const maxColor = sortedNames[sortedNames.length - 1];
            selectedColorSpan.textContent = `${minColor} - ${maxColor}`;
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
    const sortBtn = document.getElementById('sortColors');

    // 更新圖標
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortColorValuesList();
}

/**
 * 排序顏色值列表
 */
function sortColorValuesList() {
    const colorValuesList = document.getElementById('colorValuesList');
    const items = Array.from(colorValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取顏色名稱並排序
    const colorValues = items.map(item => ({
        element: item,
        value: item.querySelector('.item-value-text').textContent.trim()
    }));

    // 按字母順序排序
    colorValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    colorValues.forEach(({ element }) => {
        colorValuesList.appendChild(element);
    });
}

// =============================================================================
// 批量添加功能 (Batch Add Functions)
// =============================================================================

/**
 * 添加常用顏色
 */
function addCommonColors() {
    // Common colors
    const commonColors = [
        { name: 'Red', hex: '#FF0000' },
        { name: 'Blue', hex: '#0000FF' },
        { name: 'Green', hex: '#00FF00' },
        { name: 'Yellow', hex: '#FFFF00' },
        { name: 'Black', hex: '#000000' },
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Orange', hex: '#FFA500' },
        { name: 'Purple', hex: '#800080' },
        { name: 'Pink', hex: '#FFC0CB' },
        { name: 'Brown', hex: '#A52A2A' }
    ];

    addMultipleColors(commonColors);
}

/**
 * 添加時尚顏色
 */
function addFashionColors() {
    // Fashion colors
    const fashionColors = [
        { name: 'Navy Blue', hex: '#000080' },
        { name: 'Burgundy', hex: '#800020' },
        { name: 'Cream', hex: '#F5F5DC' },
        { name: 'Charcoal', hex: '#36454F' },
        { name: 'Coral', hex: '#FF7F50' },
        { name: 'Turquoise', hex: '#40E0D0' },
        { name: 'Lavender', hex: '#E6E6FA' },
        { name: 'Maroon', hex: '#800000' },
        { name: 'Beige', hex: '#F5F5DC' },
        { name: 'Olive', hex: '#808000' }
    ];

    addMultipleColors(fashionColors);
}

/**
 * 添加多個顏色
 * @param {Array} colors 顏色數組
 */
function addMultipleColors(colors) {
    let addedCount = 0;
    let skippedCount = 0;

    colors.forEach(color => {
        if (!isColorExists(color.name)) {
            addColorToList(color.name, color.hex, 'Available'); // 默認為 Available
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 顯示結果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} colors`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} colors, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All colors already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加顏色，顯示右邊的表格
    if (addedCount > 0) {
        showColorValuesArea();
    }
}

/**
 * 添加顏色到列表
 * @param {string} colorName 顏色名稱
 * @param {string} colorHex 顏色代碼
 * @param {string} colorStatus 狀態（默認為 Available）
 */
function addColorToList(colorName, colorHex, colorStatus = 'Available') {
    // 檢查是否為重複項
    if (isColorExists(colorName)) {
        console.log('Duplicate detected in batch add, skipping:', colorName);
        return; // 跳過重複項，不添加到列表
    }

    // 標準化顏色代碼
    const normalizedColorHex = normalizeColorHex(colorHex);

    // 添加到 colorList 數組
    colorList.push({
        colorName: colorName,
        colorHex: normalizedColorHex,
        colorRgb: hexToRgb(normalizedColorHex),
        colorStatus: colorStatus
    });

    // 重新渲染整個列表
    updateColorList();
    updateUI();

    // 顯示顏色值區域
    showColorValuesArea();
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
            showAlert(data.message || 'Color updated successfully', 'success');

            // 延遲重定向到列表頁面
            setTimeout(() => {
                window.location.href = window.colorManagementRoute || '/admin/colors/index';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to update color', 'error');
        }
    })
    .catch(error => {
        if (error.message.includes('already been taken') || error.message.includes('color_name')) {
            showAlert('This color name already exists. Please choose a different name.', 'warning');
        } else {
            showAlert('Error updating color: ' + error.message, 'error');
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
    const colorNameInput = document.getElementById('color_name');
    const colorHexInput = document.getElementById('color_hex');

    // 驗證顏色名稱
    if (!colorNameInput.value.trim()) {
        showAlert('Please enter color name', 'warning');
        colorNameInput.focus();
        return false;
    }

    // 驗證顏色代碼
    if (!colorHexInput.value.trim()) {
        showAlert('Please enter color code', 'warning');
        colorHexInput.focus();
        return false;
    }

    // 驗證顏色代碼格式
    if (!isValidColorCode(colorHexInput.value.trim())) {
        showAlert('Please enter a valid color code (e.g., #FF0000 or FF0000)', 'warning');
        colorHexInput.focus();
        return false;
    }

    return true;
}

// =============================================================================
// 顏色預覽功能 (Color Preview Functions)
// =============================================================================

/**
 * 更新顏色預覽
 */
function updateColorPreview() {
    const colorHexInput = document.getElementById('color_hex');
    const colorPreview = document.getElementById('color-preview');
    const rgbInput = document.getElementById('color_rgb');

    if (colorHexInput && colorPreview) {
        const colorValue = colorHexInput.value.trim();
        if (colorValue && isValidColorCode(colorValue)) {
            const normalizedColor = colorValue.startsWith('#') ? colorValue : '#' + colorValue;
            colorPreview.style.backgroundColor = normalizedColor;
            colorPreview.style.display = 'block';

            // 自動生成RGB代碼
            if (rgbInput) {
                const rgb = hexToRgb(normalizedColor);
                if (rgb) {
                    rgbInput.value = `${rgb.r},${rgb.g},${rgb.b}`;
                }
            }
        } else {
            colorPreview.style.display = 'none';
        }
    }
}

/**
 * 設置顏色預覽
 */
function setupColorPreview() {
    const hexInput = document.getElementById('color_hex');
    const rgbInput = document.getElementById('color_rgb');
    const colorPreview = document.getElementById('color-preview');

    if (hexInput && colorPreview) {
        // 實時更新顏色預覽
        function updateColorPreviewRealTime() {
            const hexValue = hexInput.value;
            if (hexValue && /^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
                colorPreview.style.backgroundColor = hexValue;

                // 自動生成RGB代碼
                if (rgbInput) {
                    const rgb = hexToRgb(hexValue);
                    if (rgb) {
                        rgbInput.value = `${rgb.r},${rgb.g},${rgb.b}`;
                    }
                }
            }
        }

        // 監聽輸入變化
        hexInput.addEventListener('input', updateColorPreviewRealTime);

        // 初始化預覽
        updateColorPreviewRealTime();
    }
}

// =============================================================================
// 表單驗證和提交 (Form Validation & Submission)
// =============================================================================

/**
 * 驗證顏色數據
 * @returns {boolean} 驗證結果
 */
function validateColorData() {
    // 檢查是否有重複的顏色名稱
    const duplicates = [];
    const seen = new Set();
    for (const item of colorList) {
        const combination = item.colorName.toLowerCase();
        if (seen.has(combination)) {
            duplicates.push(item.colorName);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        showAlert(`Duplicate color names found: ${duplicates.join(', ')}. Please remove duplicates before submitting.`, 'error');
        return false;
    }

    return true;
}

/**
 * 提交顏色表單
 */
function submitColorForm() {
    // 調試信息：檢查要提交的數據
    console.log('Submitting color data:', colorList);

    // 準備提交數據
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加顏色數據
    colorList.forEach((item, index) => {
        // 調試信息：檢查每個顏色的狀態
        console.log(`Color ${index + 1}:`, { colorName: item.colorName, colorStatus: item.colorStatus });

        // 添加顏色文本數據
        formData.append(`colors[${index}][colorName]`, item.colorName);
        formData.append(`colors[${index}][colorHex]`, item.colorHex);
        formData.append(`colors[${index}][colorRgb]`, item.colorRgb);
        formData.append(`colors[${index}][colorStatus]`, item.colorStatus);
    });

    // 提交數據
    fetch(window.createColorUrl, {
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
            showAlert(data.message || 'Colors created successfully', 'success');

            // 延遲重定向到dashboard，讓用戶看到成功消息
            setTimeout(() => {
                window.location.href = window.colorManagementRoute || '/admin/colors/index';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to create colors', 'error');
        }
    })
    .catch(error => {
        showAlert('Error creating colors: ' + error.message, 'error');
    });
}

// =============================================================================
// 頁面初始化功能 (Page Initialization Functions)
// =============================================================================

/**
 * 綁定顏色事件
 */
function bindColorEvents() {
    // Create 頁面事件綁定
    bindColorCreateEvents();

    // 表單提交事件監聽器
    const colorForm = document.getElementById('colorForm');
    if (colorForm) {
        colorForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 檢查是否有顏色
            if (colorList.length === 0) {
                showAlert('Please add at least one color', 'warning');
                return;
            }

            // 驗證所有顏色數據
            if (!validateColorData()) {
                return;
            }

            // 提交表單
            submitColorForm();
        });
    }
}

/**
 * 綁定顏色創建頁面事件
 */
function bindColorCreateEvents() {
    // 顏色名稱輸入框回車事件
    const colorNameInput = document.getElementById('color_name');
    if (colorNameInput) {
        colorNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addColor();
            }
        });
    }

    // 顏色代碼輸入框回車事件
    const colorHexInput = document.getElementById('color_hex');
    if (colorHexInput) {
        colorHexInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addColor();
            }
        });
    }

    // 添加顏色按鈕
    const addColorBtn = document.getElementById('addColor');
    if (addColorBtn) {
        addColorBtn.addEventListener('click', addColor);
    }

    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：刪除顏色按鈕
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            removeColor(index);
        }
    });

    // 排序按鈕
    const sortBtn = document.getElementById('sortColors');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 快速添加按鈕
    const addCommonColorsBtn = document.getElementById('addCommonColors');
    if (addCommonColorsBtn) {
        addCommonColorsBtn.addEventListener('click', addCommonColors);
    }

    const addFashionColorsBtn = document.getElementById('addFashionColors');
    if (addFashionColorsBtn) {
        addFashionColorsBtn.addEventListener('click', addFashionColors);
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
 * 初始化顏色更新頁面
 */
function initializeColorUpdate() {
    bindColorEvents();
    initializeUpdateStatusCards();
    setupColorPreview();
}

/**
 * 初始化顏色頁面
 * @param {Object} config 配置對象
 */
function initializeColorPage(config) {
    bindColorEvents();

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

let colorDashboard;

$(document).ready(function() {
    // 檢查當前頁面是否是dashboard頁面（有table-body元素）
    if ($("#table-body").length > 0) {
        colorDashboard = new ColorDashboard();
    }
});

// =============================================================================
// DOM 內容加載完成後的事件綁定 (DOM Content Loaded Event Binding)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // 初始化顏色事件
    bindColorEvents();

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

    // 初始化顏色預覽
    setupColorPreview();
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

// 導出主要函數到全局作用域
window.addColor = addColor;
window.removeColor = removeColor;
window.clearForm = clearForm;
window.toggleColorStatus = toggleColorStatus;
window.setColorAvailable = setColorAvailable;
window.setColorUnavailable = setColorUnavailable;
window.updateColorStatus = updateColorStatus;
window.viewColorDetails = viewColorDetails;
