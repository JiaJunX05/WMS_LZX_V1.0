/**
 * Color Management JavaScript
 * 顏色管理統一交互邏輯
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

        // 全選/取消全選功能
        $('#select-all').on('change', (e) => {
            const isChecked = $(e.target).is(':checked');
            $('.color-checkbox').prop('checked', isChecked);
            this.updateExportButton();
        });

        // 單個勾選框變化
        $(document).on('change', '.color-checkbox', () => {
            this.updateSelectAllCheckbox();
            this.updateExportButton();
        });

        // 導出按鈕
        $('#export-colors-btn').on('click', () => {
            this.exportSelectedColors();
        });

        // Modal 事件绑定
        this.bindModalEvents();
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
                this.showAlert('Failed to load colors', 'danger');
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

        // 重置勾選框狀態
        this.updateSelectAllCheckbox();
        this.updateExportButton();

        // 隱藏空狀態（有數據時）
        $('#empty-state').addClass('d-none');
    }

    createColorRow(color) {
        const statusMenuItem = color.color_status === 'Unavailable'
            ? `<button type="button" class="dropdown-item" onclick="colorDashboard.setAvailable(${color.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate
               </button>`
            : `<button type="button" class="dropdown-item" onclick="colorDashboard.setUnavailable(${color.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate
               </button>`;

        const actionButtons = `
            <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="colorDashboard.editColor(${color.id})">
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
                        <button type="button" class="dropdown-item text-danger" onclick="colorDashboard.deleteColor(${color.id})">
                            <i class="bi bi-trash me-2"></i> Delete
                        </button>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr data-color-id="${color.id}"
                data-color-name="${color.color_name || ''}"
                data-color-hex="${color.color_hex || ''}"
                data-color-rgb="${color.color_rgb || ''}"
                data-color-status="${color.color_status || 'Available'}">
                <td class="ps-4">
                    <input class="color-checkbox form-check-input" type="checkbox" value="${color.id}" id="color-${color.id}">
                </td>
                <td>
                    <div class="rounded border border-2 border-white shadow-sm" style="background-color: ${color.color_hex || '#cccccc'}; width: 2.5rem; height: 2.5rem;"></div>
                </td>
                <td>
                    <div class="fw-bold text-dark mb-1 text-truncate">
                        <i class="bi bi-palette me-2 text-primary"></i>${color.color_name}
                    </div>
                    <div class="text-muted small" style="line-height: 1.3;">
                        <i class="bi bi-hash me-1"></i>Hex: <span class="fw-medium">${color.color_hex || 'N/A'}</span>
                        <span class="mx-2">|</span>
                        <i class="bi bi-circle-fill me-1"></i>RGB: <span class="fw-medium">${color.color_rgb || 'N/A'}</span>
                    </div>
                </td>
                <td>
                    <span class="badge ${color.color_status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${color.color_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${color.color_status}
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
    // 顏色操作模塊 (Color Operations Module)
    // =============================================================================

    /**
     * 編輯顏色
     * @param {number} colorId 顏色ID
     */
    editColor(colorId) {
        const url = window.editColorUrl.replace(':id', colorId);

        // 从表格行获取color数据（如果可用，用于快速填充）
        const row = document.querySelector(`tr[data-color-id="${colorId}"]`);
        if (row) {
            // 快速填充基本数据
            const colorData = {
                id: colorId,
                color_name: row.getAttribute('data-color-name') || '',
                color_hex: row.getAttribute('data-color-hex') || '',
                color_rgb: row.getAttribute('data-color-rgb') || '',
                color_status: row.getAttribute('data-color-status') || 'Available'
            };
            this.openUpdateModal(colorData);
        }

        // 从 API 获取完整color数据
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
                    this.showAlert(response.message || 'Failed to load color data', 'error');
                }
            },
            error: (xhr) => {
                let errorMessage = 'Failed to load color data';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                this.showAlert(errorMessage, 'error');
            }
        });
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
            this.showAlert('Failed to delete color', 'error');
        });
    }

    /**
     * 更新表格行的狀態顯示和 data 屬性
     * @param {number} colorId 顏色ID
     * @param {string} newStatus 新狀態 ('Available' 或 'Unavailable')
     */
    updateColorRowStatus(colorId, newStatus) {
        const colorRow = $(`tr[data-color-id="${colorId}"]`);
        if (colorRow.length === 0) return;

        // 更新 data 屬性
        colorRow.attr('data-color-status', newStatus);

        // 更新狀態菜單項（與 createColorRow 中的格式完全一致）
        const statusMenuItem = newStatus === 'Unavailable'
            ? `<button type="button" class="dropdown-item" onclick="colorDashboard.setAvailable(${colorId})">
                   <i class="bi bi-check-circle me-2"></i> Activate
               </button>`
            : `<button type="button" class="dropdown-item" onclick="colorDashboard.setUnavailable(${colorId})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate
               </button>`;

        // 更新操作按鈕區域（與 createColorRow 中的格式完全一致）
        const actionButtons = `
            <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="colorDashboard.editColor(${colorId})">
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
                        <button type="button" class="dropdown-item text-danger" onclick="colorDashboard.deleteColor(${colorId})">
                            <i class="bi bi-trash me-2"></i> Delete
                        </button>
                    </li>
                </ul>
            </div>
        `;

        // 更新操作按鈕列
        const actionsCell = colorRow.find('td:last-child');
        actionsCell.html(actionButtons);

        // 更新狀態標籤顯示（與 createColorRow 中的格式完全一致）
        const statusBadge = newStatus === 'Available'
            ? `<span class="badge bg-success px-3 py-2">
                <i class="bi bi-check-circle me-1"></i>${newStatus}
            </span>`
            : `<span class="badge bg-danger px-3 py-2">
                <i class="bi bi-x-circle me-1"></i>${newStatus}
            </span>`;

        // 更新狀態列顯示
        const statusCell = colorRow.find('td').eq(-2); // 倒數第二列是狀態列
        if (statusCell.length > 0) {
            statusCell.html(statusBadge);
        }
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
                // 更新 DOM 而不是刷新頁面
                this.updateColorRowStatus(colorId, 'Available');
            } else {
                this.showAlert(data.message || 'Failed to set color available', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set color available', 'error');
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
                // 更新 DOM 而不是刷新頁面
                this.updateColorRowStatus(colorId, 'Unavailable');
            } else {
                this.showAlert(data.message || 'Failed to set color unavailable', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set color unavailable', 'error');
        });
    }

    // =============================================================================
    // 勾選框管理模塊 (Checkbox Management Module)
    // =============================================================================

    /**
     * 更新全選勾選框狀態
     */
    updateSelectAllCheckbox() {
        const totalCheckboxes = $('.color-checkbox').length;
        const checkedCheckboxes = $('.color-checkbox:checked').length;
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
        const checkedCount = $('.color-checkbox:checked').length;
        const exportBtn = $('#export-colors-btn');

        if (checkedCount > 0) {
            exportBtn.prop('disabled', false);
            exportBtn.html(`<i class="bi bi-download me-2"></i>Export Data (${checkedCount})`);
        } else {
            exportBtn.prop('disabled', true);
            exportBtn.html('<i class="bi bi-download me-2"></i>Export Data');
        }
    }

    /**
     * 導出選中的顏色
     */
    exportSelectedColors() {
        const selectedIds = $('.color-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            this.showAlert('Please select at least one color to export', 'warning');
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
        const exportUrl = `${window.colorExportUrl}?${params}`;

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

    // =============================================================================
    // Create Color 彈窗模塊 (Create Color Modal Module)
    // =============================================================================

    /**
     * 綁定彈窗事件
     */
    bindModalEvents() {
        // 彈窗打開時重置表單
        $('#createColorModal').on('show.bs.modal', () => {
            this.resetModalForm();
            this.initColorPreview();
        });

        // 彈窗完全顯示後設置焦點
        $('#createColorModal').on('shown.bs.modal', () => {
            const colorNameInput = document.getElementById('color_name');
            if (colorNameInput) {
                colorNameInput.focus();
            }
        });

        // 彈窗關閉時清理
        $('#createColorModal').on('hidden.bs.modal', () => {
            this.resetModalForm();
        });

        // 提交按鈕事件
        $('#submitCreateColorModal').on('click', () => {
            this.submitModalColor();
        });

        // Enter鍵提交表單
        $('#createColorModal').on('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.submitModalColor();
            }
        });

        // Hex 輸入框變化時更新預覽和 RGB（使用事件委托，確保動態元素也能觸發）
        $(document).on('input', '#color_hex', () => {
            this.updateColorPreview('#color_hex', '#color-preview', '#color_rgb');
        });

        // 顏色名稱輸入框變化時自動填充 hex code（使用事件委托）
        $(document).on('input', '#color_name', () => {
            // 延遲執行，確保輸入完成
            clearTimeout(this.colorNameInputTimeout);
            this.colorNameInputTimeout = setTimeout(() => {
                this.autoFillHexFromColorName('#color_name', '#color_hex');
            }, 300);
        });
    }

    /**
     * 初始化顏色預覽
     */
    initColorPreview() {
        const hexInput = document.getElementById('color_hex');
        const preview = document.getElementById('color-preview');
        if (hexInput && preview) {
            preview.style.backgroundColor = '#f3f4f6';
        }
    }

    /**
     * 根據顏色名稱自動填充 hex code
     * 在 modal 模式下直接使用顏色映射表
     */
    autoFillHexFromColorName(colorNameInputId, hexInputId) {
        const colorNameInput = document.getElementById(colorNameInputId.startsWith('#') ? colorNameInputId.substring(1) : colorNameInputId);
        const hexInput = document.getElementById(hexInputId.startsWith('#') ? hexInputId.substring(1) : hexInputId);

        if (!colorNameInput || !hexInput) return;

        const colorName = colorNameInput.value.trim();
        if (!colorName) {
            // 如果顏色名稱為空，清空 hex code
            hexInput.value = '';
            hexInput.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }

        // 直接使用顏色映射表（modal 模式下 Color.js 不可用）
        this.fallbackColorMapping(colorName, hexInput);
    }

    /**
     * 顏色映射表（根據顏色名稱自動填充 hex code）
     */
    fallbackColorMapping(colorName, hexInput) {
        // 嘗試一些常見的顏色名稱映射
        const colorMap = {
            'red': '#FF0000', 'green': '#008000', 'blue': '#0000FF', 'yellow': '#FFFF00', 'orange': '#FFA500',
            'purple': '#800080', 'pink': '#FFC0CB', 'brown': '#A52A2A', 'black': '#000000', 'white': '#FFFFFF',
            'gray': '#808080', 'grey': '#808080',
            'light red': '#FFB6C1', 'dark red': '#8B0000', 'light blue': '#ADD8E6', 'dark blue': '#00008B',
            'light green': '#90EE90', 'dark green': '#006400', 'light yellow': '#FFFFE0', 'dark yellow': '#B8860B',
            'light pink': '#FFB6C1', 'dark pink': '#FF1493', 'light gray': '#D3D3D3', 'dark gray': '#696969',
            'light grey': '#D3D3D3', 'dark grey': '#696969',
            'navy': '#000080', 'teal': '#008080', 'lime': '#00FF00', 'cyan': '#00FFFF', 'magenta': '#FF00FF',
            'silver': '#C0C0C0', 'gold': '#FFD700', 'maroon': '#800000', 'olive': '#808000', 'aqua': '#00FFFF',
            'fuchsia': '#FF00FF',
        };

        const normalizedName = colorName.toLowerCase().trim();

        // 直接匹配
        if (colorMap[normalizedName]) {
            const hexCode = colorMap[normalizedName];
            hexInput.value = hexCode;
            // 觸發 hex 輸入框的 input 事件以更新預覽和 RGB
            hexInput.dispatchEvent(new Event('input', { bubbles: true }));
            // 顯示成功提示
            this.showInfo(`Auto-filled Hex code: ${hexCode}`);
            return;
        }

        // 模糊匹配
        for (const [name, hex] of Object.entries(colorMap)) {
            if (name.includes(normalizedName) || normalizedName.includes(name)) {
                hexInput.value = hex;
                // 觸發 hex 輸入框的 input 事件以更新預覽和 RGB
                hexInput.dispatchEvent(new Event('input', { bubbles: true }));
                // 顯示成功提示
                this.showInfo(`Auto-filled Hex code: ${hex} (matched: ${name})`);
                return;
            }
        }
    }

    /**
     * 顯示信息提示
     * @param {string} message 提示信息
     */
    showInfo(message) {
        if (typeof window.showAlert === 'function') {
            window.showAlert(message, 'info');
        } else {
            // 備用實現
            this.showAlert(message, 'info');
        }
    }

    /**
     * 更新顏色預覽和 RGB
     */
    updateColorPreview(hexInputId, previewId, rgbInputId) {
        // 移除 # 前綴以獲取實際的 ID
        const hexInputIdClean = hexInputId.startsWith('#') ? hexInputId.substring(1) : hexInputId;
        const previewIdClean = previewId.startsWith('#') ? previewId.substring(1) : previewId;
        const rgbInputIdClean = rgbInputId ? (rgbInputId.startsWith('#') ? rgbInputId.substring(1) : rgbInputId) : null;

        // 確定在哪個 modal 中查找元素
        let modal = null;
        let hexInput = null;
        let preview = null;
        let rgbInput = null;

        // 檢查是否在 update modal 中
        if (hexInputIdClean === 'update_color_hex') {
            modal = document.getElementById('updateColorModal');
            if (modal) {
                hexInput = modal.querySelector(`#${hexInputIdClean}`);
                preview = modal.querySelector(`#${previewIdClean}`);
                rgbInput = rgbInputIdClean ? modal.querySelector(`#${rgbInputIdClean}`) : null;
            }
        } else {
            // 在 create modal 中
            modal = document.getElementById('createColorModal');
            if (modal) {
                hexInput = modal.querySelector(`#${hexInputIdClean}`);
                preview = modal.querySelector(`#${previewIdClean}`);
                rgbInput = rgbInputIdClean ? modal.querySelector(`#${rgbInputIdClean}`) : null;
            }
        }

        // 如果找不到，嘗試全局查找（向後兼容）
        if (!hexInput) {
            hexInput = document.getElementById(hexInputIdClean);
        }
        if (!preview) {
            preview = document.getElementById(previewIdClean);
        }
        if (!rgbInput && rgbInputIdClean) {
            rgbInput = document.getElementById(rgbInputIdClean);
        }

        if (!hexInput || !preview) return;

        const hexValue = hexInput.value.trim();

        // 如果 hex code 格式正確（完整的 6 位 hex code）
        if (hexValue && /^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
            preview.style.backgroundColor = hexValue;
            if (rgbInput) {
                if (typeof window.hexToRgb === 'function') {
                    const rgb = window.hexToRgb(hexValue);
                    rgbInput.value = `RGB(${rgb})`;
                } else if (typeof hexToRgb === 'function') {
                    const rgb = hexToRgb(hexValue);
                    rgbInput.value = `RGB(${rgb})`;
                }
            }
        } else if (hexValue && /^#[0-9A-Fa-f]{0,6}$/i.test(hexValue)) {
            // 如果正在輸入中（部分 hex code），嘗試顯示預覽
            // 補全到 6 位（用 0 填充）
            let paddedHex = hexValue;
            if (hexValue.length < 7) {
                const hexPart = hexValue.substring(1); // 移除 #
                const padded = hexPart.padEnd(6, '0');
                paddedHex = '#' + padded;
            }
            preview.style.backgroundColor = paddedHex;
            if (rgbInput) {
                rgbInput.value = '';
            }
        } else {
            // 無效的 hex code，重置預覽
            preview.style.backgroundColor = '#f3f4f6';
            if (rgbInput) {
                rgbInput.value = '';
            }
        }
    }

    /**
     * 重置彈窗表單
     */
    resetModalForm() {
        const form = document.getElementById('createColorModalForm');
        if (form) {
            form.reset();
        }

        const preview = document.getElementById('color-preview');
        if (preview) {
            preview.style.backgroundColor = '#f3f4f6';
        }

        const rgbInput = document.getElementById('color_rgb');
        if (rgbInput) {
            rgbInput.value = '';
        }

        const inputs = form?.querySelectorAll('.form-control');
        if (inputs) {
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
            });
        }
    }

    /**
     * 提交彈窗中的Color
     */
    submitModalColor() {
        const colorNameInput = document.getElementById('color_name');
        const colorHexInput = document.getElementById('color_hex');
        const submitBtn = $('#submitCreateColorModal');

        const colorName = colorNameInput ? colorNameInput.value.trim() : '';
        const colorHex = colorHexInput ? colorHexInput.value.trim() : '';

        let isValid = true;

        if (!colorName) {
            if (colorNameInput) {
                colorNameInput.classList.add('is-invalid');
            }
            isValid = false;
        } else {
            if (colorNameInput) {
                colorNameInput.classList.remove('is-invalid');
                colorNameInput.classList.add('is-valid');
            }
        }

        if (!colorHex) {
            if (colorHexInput) {
                colorHexInput.classList.add('is-invalid');
            }
            isValid = false;
        } else if (!/^#[0-9A-Fa-f]{6}$/.test(colorHex)) {
            if (colorHexInput) {
                colorHexInput.classList.add('is-invalid');
            }
            isValid = false;
        } else {
            if (colorHexInput) {
                colorHexInput.classList.remove('is-invalid');
                colorHexInput.classList.add('is-valid');
            }
        }

        if (!isValid) {
            this.showAlert('Please fill in all required fields with valid values', 'warning');
            return;
        }

        // 轉換 HEX 為 RGB
        let colorRgb = '';
        let rgbValue = '';
        if (typeof window.hexToRgb === 'function') {
            colorRgb = window.hexToRgb(colorHex);
            rgbValue = `RGB(${colorRgb})`;
        } else if (typeof hexToRgb === 'function') {
            colorRgb = hexToRgb(colorHex);
            rgbValue = `RGB(${colorRgb})`;
        } else {
            // 備用方案：手動轉換
            const hex = colorHex.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            rgbValue = `RGB(${r},${g},${b})`;
        }

        const formData = new FormData();
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
        formData.append('color_name', colorName);
        formData.append('color_hex', colorHex);
        formData.append('color_rgb', rgbValue);

        const originalText = submitBtn.html();
        submitBtn.html('<i class="bi bi-hourglass-split me-2"></i>Creating...');
        submitBtn.prop('disabled', true);

        fetch(window.createColorUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to create color');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.showAlert(data.message || 'Color created successfully', 'success');

                const modal = bootstrap.Modal.getInstance(document.getElementById('createColorModal'));
                if (modal) {
                    modal.hide();
                }

                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                this.showAlert(data.message || 'Failed to create color', 'error');
            }
        })
        .catch(error => {
            let errorMessage = 'Failed to create color';
            if (error.message) {
                errorMessage = error.message;
            }
            this.showAlert(errorMessage, 'error');
        })
        .finally(() => {
            submitBtn.html(originalText);
            submitBtn.prop('disabled', false);
        });
    }

    // =============================================================================
    // Update Color 彈窗模塊 (Update Color Modal Module)
    // =============================================================================

    /**
     * 綁定更新彈窗事件
     */
    bindUpdateModalEvents() {
        $('#updateColorModal').on('show.bs.modal', () => {
            this.initUpdateColorPreview();
            if (typeof window.initializeStatusCardSelection === 'function') {
                window.initializeStatusCardSelection('color_status');
            }
        });

        // 彈窗完全顯示後設置焦點並更新預覽
        $('#updateColorModal').on('shown.bs.modal', () => {
            // 使用 setTimeout 確保 DOM 完全準備好
            setTimeout(() => {
                // 更新顏色預覽
                this.updateColorPreview('#update_color_hex', '#color-preview', '#update_color_rgb');

                // 設置焦點
                const colorNameInput = document.getElementById('update_color_name');
                if (colorNameInput) {
                    colorNameInput.focus();
                }
            }, 100);
        });

        $('#updateColorModal').on('hidden.bs.modal', () => {
            this.resetUpdateModalForm();
        });

        $('#submitUpdateColorModal').on('click', () => {
            this.submitUpdateModalColor();
        });

        // Enter鍵提交表單
        $('#updateColorModal').on('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.submitUpdateModalColor();
            }
        });

        // Hex 輸入框變化時更新預覽和 RGB（使用事件委托）
        $(document).on('input', '#update_color_hex', () => {
            this.updateColorPreview('#update_color_hex', '#color-preview', '#update_color_rgb');
        });

        // 顏色名稱輸入框變化時自動填充 hex code（使用事件委托）
        $(document).on('input', '#update_color_name', () => {
            // 延遲執行，確保輸入完成
            clearTimeout(this.updateColorNameInputTimeout);
            this.updateColorNameInputTimeout = setTimeout(() => {
                this.autoFillHexFromColorName('#update_color_name', '#update_color_hex');
            }, 300);
        });
    }

    /**
     * 打開更新彈窗並填充數據
     */
    openUpdateModal(colorData) {
        $('#update_color_name').val(colorData.color_name || '');
        $('#update_color_hex').val(colorData.color_hex || '');

        const targetStatus = colorData.color_status === 'Unavailable' ? 'Unavailable' : 'Available';
        const radioSelector = targetStatus === 'Available' ? '#update_status_available' : '#update_status_unavailable';
        $(radioSelector).prop('checked', true);
        if (typeof window.initializeStatusCardSelection === 'function') {
            window.initializeStatusCardSelection('color_status');
        }

        const form = $('#updateColorModalForm');
        form.attr('data-color-id', colorData.id);

        const currentInfo = `
            <div class="mb-1">
                <i class="bi bi-palette me-2 text-muted"></i>
                <span>Name: <strong>${colorData.color_name || 'N/A'}</strong></span>
            </div>
            <div class="mb-1">
                <i class="bi bi-hash me-2 text-muted"></i>
                <span>Hex: <strong>${colorData.color_hex || 'N/A'}</strong></span>
            </div>
            <div class="mb-1">
                <i class="bi bi-shield-check me-2 text-muted"></i>
                <span>Status: <strong>${colorData.color_status || 'N/A'}</strong></span>
            </div>
        `;
        $('#currentColorInfo').html(currentInfo);

        const modal = new bootstrap.Modal(document.getElementById('updateColorModal'));
        modal.show();

        // 在 modal 顯示後立即更新預覽（備用方案）
        setTimeout(() => {
            this.updateColorPreview('#update_color_hex', '#color-preview', '#update_color_rgb');
        }, 150);
    }

    /**
     * 初始化更新彈窗中的顏色預覽
     */
    initUpdateColorPreview() {
        const hexInput = document.getElementById('update_color_hex');
        const preview = document.getElementById('color-preview');
        if (hexInput && preview) {
            const hexValue = hexInput.value.trim();
            if (hexValue && /^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
                preview.style.backgroundColor = hexValue;
            } else {
                preview.style.backgroundColor = '#f3f4f6';
            }
        }
    }

    /**
     * 重置更新彈窗表單
     */
    resetUpdateModalForm() {
        const form = document.getElementById('updateColorModalForm');
        if (form) {
            form.reset();
        }

        const preview = document.getElementById('color-preview');
        if (preview) {
            preview.style.backgroundColor = '#f3f4f6';
        }

        const inputs = form?.querySelectorAll('.form-control');
        if (inputs) {
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
            });
        }
    }

    /**
     * 提交更新彈窗中的Color
     */
    submitUpdateModalColor() {
        const form = document.getElementById('updateColorModalForm');
        const colorId = form?.getAttribute('data-color-id');
        const colorNameInput = document.getElementById('update_color_name');
        const colorHexInput = document.getElementById('update_color_hex');
        const submitBtn = $('#submitUpdateColorModal');

        if (!colorId) {
            this.showAlert('Color ID not found', 'error');
            return;
        }

        const colorName = colorNameInput ? colorNameInput.value.trim() : '';
        const colorHex = colorHexInput ? colorHexInput.value.trim() : '';
        const colorStatus = form?.querySelector('input[name="color_status"]:checked')?.value || 'Available';

        let isValid = true;

        if (!colorName) {
            if (colorNameInput) {
                colorNameInput.classList.add('is-invalid');
            }
            isValid = false;
        } else {
            if (colorNameInput) {
                colorNameInput.classList.remove('is-invalid');
                colorNameInput.classList.add('is-valid');
            }
        }

        if (!colorHex) {
            if (colorHexInput) {
                colorHexInput.classList.add('is-invalid');
            }
            isValid = false;
        } else if (!/^#[0-9A-Fa-f]{6}$/.test(colorHex)) {
            if (colorHexInput) {
                colorHexInput.classList.add('is-invalid');
            }
            isValid = false;
        } else {
            if (colorHexInput) {
                colorHexInput.classList.remove('is-invalid');
                colorHexInput.classList.add('is-valid');
            }
        }

        if (!isValid) {
            this.showAlert('Please fill in all required fields with valid values', 'warning');
            return;
        }

        // 轉換 HEX 為 RGB
        let colorRgb = '';
        let rgbValue = '';
        if (typeof window.hexToRgb === 'function') {
            colorRgb = window.hexToRgb(colorHex);
            rgbValue = `RGB(${colorRgb})`;
        } else if (typeof hexToRgb === 'function') {
            colorRgb = hexToRgb(colorHex);
            rgbValue = `RGB(${colorRgb})`;
        } else {
            // 備用方案：手動轉換
            const hex = colorHex.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            rgbValue = `RGB(${r},${g},${b})`;
        }

        const formData = new FormData();
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
        formData.append('_method', 'PUT');
        formData.append('color_name', colorName);
        formData.append('color_hex', colorHex);
        formData.append('color_rgb', rgbValue);
        formData.append('color_status', colorStatus);

        const originalText = submitBtn.html();
        submitBtn.html('<i class="bi bi-hourglass-split me-2"></i>Updating...');
        submitBtn.prop('disabled', true);

        const updateUrl = window.updateColorUrl.replace(':id', colorId);

        fetch(updateUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to update color');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.showAlert(data.message || 'Color updated successfully', 'success');

                const modal = bootstrap.Modal.getInstance(document.getElementById('updateColorModal'));
                if (modal) {
                    modal.hide();
                }

                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                this.showAlert(data.message || 'Failed to update color', 'error');
            }
        })
        .catch(error => {
            let errorMessage = 'Failed to update color';
            if (error.message) {
                errorMessage = error.message;
            }
            this.showAlert(errorMessage, 'error');
        })
        .finally(() => {
            submitBtn.html(originalText);
            submitBtn.prop('disabled', false);
        });
    }
}

// =============================================================================
// 工具函數 (Utility Functions)
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

// =============================================================================
// 全局實例初始化 (Global Instance Initialization)
// =============================================================================

let colorDashboard;

$(document).ready(function() {
    if ($("#table-body").length > 0) {
        colorDashboard = new ColorDashboard();

        // 導出方法到全局作用域
        window.setColorAvailable = (colorId) => colorDashboard.setAvailable(colorId);
        window.setColorUnavailable = (colorId) => colorDashboard.setUnavailable(colorId);
        window.editColor = (colorId) => colorDashboard.editColor(colorId);
        window.deleteColor = (colorId) => colorDashboard.deleteColor(colorId);
    }
});
