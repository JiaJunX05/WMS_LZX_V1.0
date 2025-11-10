/**
 * Zone Management JavaScript
 * 區域管理統一交互邏輯
 *
 * 功能模塊：
 * - Dashboard 頁面：搜索、篩選、分頁、CRUD 操作、狀態切換
 * - Create Modal：批量創建、表單驗證、狀態管理、圖片上傳
 * - Update Modal：編輯更新、表單提交、圖片管理
 * - 通用功能：API 請求、UI 更新、事件綁定、工具函數
 *
 * @author WMS Team
 * @version 3.0.0
 */

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

        // Add Zone 彈窗事件
        this.bindModalEvents();

        // Update Zone 彈窗事件
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
            ? `<button type="button" class="dropdown-item" onclick="zoneDashboard.setAvailable(${zone.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate
               </button>`
            : `<button type="button" class="dropdown-item" onclick="zoneDashboard.setUnavailable(${zone.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate
               </button>`;

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
                        <button type="button" class="dropdown-item text-danger" onclick="zoneDashboard.deleteZone(${zone.id})">
                            <i class="bi bi-trash me-2"></i> Delete
                        </button>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr data-zone-id="${zone.id}"
                data-zone-name="${zone.zone_name || ''}"
                data-zone-location="${zone.location || ''}"
                data-zone-status="${zone.zone_status || 'Available'}"
                data-zone-image="${zone.zone_image || ''}">
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
     * 編輯區域（打開更新彈窗）
     * @param {number} zoneId 區域ID
     */
    editZone(zoneId) {
        const url = window.editZoneUrl.replace(':id', zoneId);

        // 从表格行获取zone数据（如果可用，用于快速填充）
        const zoneRow = $(`tr[data-zone-id="${zoneId}"]`);
        if (zoneRow.length > 0) {
            // 快速填充基本数据
            const zoneData = {
                id: zoneId,
                zone_name: zoneRow.attr('data-zone-name') || '',
                location: zoneRow.attr('data-zone-location') || '',
                zone_status: zoneRow.attr('data-zone-status') || 'Available',
                zone_image: zoneRow.attr('data-zone-image') || ''
            };
            this.openUpdateModal(zoneData);
        }

        // 从 API 获取完整zone数据
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
                    this.showAlert(response.message || 'Failed to load zone data', 'error');
                }
            },
            error: (xhr) => {
                let errorMessage = 'Failed to load zone data';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                this.showAlert(errorMessage, 'error');
            }
        });
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
     * 更新表格行的所有數據（用於 update 操作後）
     * @param {number} zoneId 區域ID
     * @param {Object} zoneData 更新後的區域數據
     */
    updateZoneRow(zoneId, zoneData) {
        const zoneRow = $(`tr[data-zone-id="${zoneId}"]`);
        if (zoneRow.length === 0) return;

        // 確保圖片路徑正確處理（可能是 null、空字符串或完整路徑）
        // 如果 zone_image 是 null 或 undefined，設置為空字符串；否則保持原值
        const zoneImage = (zoneData.zone_image === null || zoneData.zone_image === undefined) ? '' : zoneData.zone_image;

        // 更新 data 屬性（確保圖片路徑正確保存）
        // 使用 attr() 而不是 data()，因為 data() 會緩存值，導致更新後讀取不到最新值
        zoneRow.attr('data-zone-name', zoneData.zone_name || '');
        zoneRow.attr('data-zone-location', zoneData.location || '');
        zoneRow.attr('data-zone-status', zoneData.zone_status || 'Available');
        zoneRow.attr('data-zone-image', zoneImage);

        // 清除 jQuery 的 data 緩存，確保下次讀取時能獲取最新值
        zoneRow.removeData('zone-name');
        zoneRow.removeData('zone-location');
        zoneRow.removeData('zone-status');
        zoneRow.removeData('zone-image');

        // 更新圖片顯示
        const imageCell = zoneRow.find('td').eq(1);
        if (imageCell.length > 0) {
            if (zoneImage && zoneImage.trim() !== '') {
                // 確保圖片路徑格式正確（如果已經是完整路徑則直接使用，否則添加前綴）
                const imagePath = zoneImage.startsWith('/') ? zoneImage : `/assets/images/${zoneImage}`;
                imageCell.html(`
                    <img src="${imagePath}" alt="Zone Image"
                         class="rounded border border-2 border-white shadow-sm" style="width: 2.5rem; height: 2.5rem; object-fit: cover;">
                `);
            } else {
                // 沒有圖片時顯示占位符
                imageCell.html(`
                    <div class="rounded border border-2 border-white shadow-sm bg-light d-flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem;">
                        <i class="bi bi-image text-muted"></i>
                    </div>
                `);
            }
        }

        // 更新名稱和位置顯示
        const nameCell = zoneRow.find('td').eq(2);
        if (nameCell.length > 0) {
            nameCell.html(`
                <div class="d-flex flex-column">
                    <div class="fw-bold text-dark mb-1">
                        <i class="bi bi-geo-alt me-2 text-primary"></i>${zoneData.zone_name || ''}
                    </div>
                    <div class="text-muted small">
                        <i class="bi bi-geo me-1"></i>${zoneData.location || 'No location specified'}
                    </div>
                </div>
            `);
        }

        // 更新狀態顯示（使用 updateZoneRowStatus 函數）
        this.updateZoneRowStatus(zoneId, zoneData.zone_status || 'Available');
    }

    /**
     * 更新表格行的狀態顯示和 data 屬性
     * @param {number} zoneId 區域ID
     * @param {string} newStatus 新狀態 ('Available' 或 'Unavailable')
     */
    updateZoneRowStatus(zoneId, newStatus) {
        const zoneRow = $(`tr[data-zone-id="${zoneId}"]`);
        if (zoneRow.length === 0) return;

        // 更新 data 屬性
        zoneRow.attr('data-zone-status', newStatus);

        // 更新狀態菜單項（與 createZoneRow 中的格式完全一致）
        const statusMenuItem = newStatus === 'Unavailable'
            ? `<button type="button" class="dropdown-item" onclick="zoneDashboard.setAvailable(${zoneId})">
                   <i class="bi bi-check-circle me-2"></i> Activate
               </button>`
            : `<button type="button" class="dropdown-item" onclick="zoneDashboard.setUnavailable(${zoneId})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate
               </button>`;

        // 更新操作按鈕區域（與 createZoneRow 中的格式完全一致）
        const actionButtons = `
            <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="zoneDashboard.editZone(${zoneId})">
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
                        <button type="button" class="dropdown-item text-danger" onclick="zoneDashboard.deleteZone(${zoneId})">
                            <i class="bi bi-trash me-2"></i> Delete
                        </button>
                    </li>
                </ul>
            </div>
        `;

        // 更新操作按鈕列
        const actionsCell = zoneRow.find('td:last-child');
        actionsCell.html(actionButtons);

        // 更新狀態標籤顯示（與 createZoneRow 中的格式完全一致）
        const statusBadge = newStatus === 'Available'
            ? `<span class="badge bg-success px-3 py-2">
                <i class="bi bi-check-circle me-1"></i>${newStatus}
            </span>`
            : `<span class="badge bg-danger px-3 py-2">
                <i class="bi bi-x-circle me-1"></i>${newStatus}
            </span>`;

        // 更新狀態列顯示
        const statusCell = zoneRow.find('td').eq(-2); // 倒數第二列是狀態列
        if (statusCell.length > 0) {
            statusCell.html(statusBadge);
        }
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
                // 更新 DOM 而不是刷新頁面
                this.updateZoneRowStatus(zoneId, 'Available');
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
                // 更新 DOM 而不是刷新頁面
                this.updateZoneRowStatus(zoneId, 'Unavailable');
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

    /**
     * 显示字段级验证错误（支持 create 和 update 表单）
     */
    displayValidationErrors(errors) {
        // 清除之前的错误
        const createForm = document.getElementById('createZoneModalForm');
        if (createForm) {
            const inputs = createForm.querySelectorAll('.form-control');
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
                const feedback = input.parentElement.querySelector('.invalid-feedback') ||
                               input.closest('.col-12, .col-md-6')?.querySelector('.invalid-feedback');
                if (feedback) {
                    feedback.textContent = '';
                }
            });
        }

        const updateForm = document.getElementById('updateZoneModalForm');
        if (updateForm) {
            const inputs = updateForm.querySelectorAll('.form-control');
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
                const feedback = input.parentElement.querySelector('.invalid-feedback') ||
                               input.closest('.col-12, .col-md-6')?.querySelector('.invalid-feedback');
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

    // 顯示提示信息
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
                const fallbackContainer = document.querySelector('.container-fluid') || document.querySelector('.container') || document.body;
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
    // Add Zone 彈窗模塊 (Add Zone Modal Module)
// =============================================================================

/**
     * 綁定彈窗事件
     */
    bindModalEvents() {
        // 彈窗打開時重置表單並初始化圖片處理
        $('#createZoneModal').on('show.bs.modal', () => {
            this.resetModalForm();
            this.initModalImageSystem();
        });

        // 彈窗完全顯示後設置焦點
        $('#createZoneModal').on('shown.bs.modal', () => {
            const zoneNameInput = document.getElementById('zone_name');
            if (zoneNameInput) {
                zoneNameInput.focus();
            }
        });

        // 彈窗關閉時清理
        $('#createZoneModal').on('hidden.bs.modal', () => {
            this.resetModalForm();
        });

        // 提交按鈕事件
        $('#submitCreateZoneModal').on('click', () => {
            this.submitModalZone();
        });

        // Enter鍵自動跳轉到下一個輸入框或提交表單
        $('#createZoneModal').on('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const target = e.target;
                // 排除 image 輸入框
                if (target.type === 'file' || target.id === 'zone_image') {
                    return;
                }

                // 如果當前在輸入框中
                if (target.tagName === 'INPUT' && target.type !== 'submit' && target.type !== 'button') {
                    e.preventDefault();

                    // 定義輸入框順序
                    const inputOrder = ['zone_name', 'location'];
                    const currentIndex = inputOrder.indexOf(target.id);

                    if (currentIndex !== -1 && currentIndex < inputOrder.length - 1) {
                        // 跳轉到下一個輸入框
                        const nextInput = document.getElementById(inputOrder[currentIndex + 1]);
                        if (nextInput) {
                            nextInput.focus();
                        }
                    } else {
                        // 最後一個輸入框，提交表單
                        this.submitModalZone();
                    }
                }
            }
        });
    }

    /**
     * 初始化彈窗中的圖片處理系統（完全交給ImageSystem處理）
     * 參考其他模組（rack、brand、category）的實現方式
     * 圖片的所有處理（上傳、預覽、刪除、驗證）都由ImageSystem負責
     */
    initModalImageSystem() {
        // 使用統一的圖片處理模組（完全交給ImageSystem處理）
        if (typeof window.ImageSystem !== 'undefined') {
            // 檢查彈窗內是否有圖片元素
            const modal = document.getElementById('createZoneModal');
            if (!modal) return;

            const imageInput = modal.querySelector('#zone_image');
            const imageUploadArea = modal.querySelector('#imageUploadArea');

            // 只綁定彈窗內的元素（避免與create頁面衝突，雖然create頁面JS已關閉）
            if (imageInput && imageUploadArea) {
                // 直接使用ImageSystem綁定事件（所有圖片處理都由ImageSystem負責）
                // bindImageUploadEvents 會自動處理：上傳、預覽、刪除、驗證、拖拽等功能
                window.ImageSystem.bindImageUploadEvents({
                    createImageInputId: 'zone_image',
                    createImageUploadAreaId: 'imageUploadArea',
                    createPreviewImageId: 'img-preview',
                    createPreviewIconId: 'preview-icon',
                    createImageUploadContentId: 'imageUploadContent'
                });
            }
        } else {
            console.warn('ImageSystem not available, image functionality may not work properly');
        }
    }

    /**
     * 重置彈窗表單
     */
    resetModalForm() {
        const form = document.getElementById('createZoneModalForm');
        if (form) {
            form.reset();
        }

        // 使用ImageSystem重置圖片
        if (typeof window.ImageSystem !== 'undefined' && window.ImageSystem.resetImage) {
            window.ImageSystem.resetImage('imageUploadArea', {
                imageInputId: 'zone_image',
                previewImageId: 'img-preview',
                previewIconId: 'preview-icon',
                imageUploadContentId: 'imageUploadContent'
            });
        }

        // 移除驗證類
        const inputs = form?.querySelectorAll('.form-control');
        if (inputs) {
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
            });
        }
    }

    /**
     * 提交彈窗中的Zone
     */
    submitModalZone() {
    const zoneNameInput = document.getElementById('zone_name');
    const locationInput = document.getElementById('location');
        const imageInput = document.getElementById('zone_image');
        const submitBtn = $('#submitCreateZoneModal');

        // 獲取輸入值
    const zoneName = zoneNameInput ? zoneNameInput.value.trim() : '';
    const location = locationInput ? locationInput.value.trim() : '';

    // 驗證輸入
        let isValid = true;

    if (!zoneName) {
            if (zoneNameInput) {
                zoneNameInput.classList.add('is-invalid');
            }
            isValid = false;
        } else {
            if (zoneNameInput) {
                zoneNameInput.classList.remove('is-invalid');
                zoneNameInput.classList.add('is-valid');
            }
    }

    if (!location) {
            if (locationInput) {
                locationInput.classList.add('is-invalid');
            }
            isValid = false;
        } else {
            if (locationInput) {
                locationInput.classList.remove('is-invalid');
                locationInput.classList.add('is-valid');
            }
        }

        if (!isValid) {
            this.showAlert('Please fill in all required fields', 'warning');
        return;
    }

        // 準備表單數據
        const formData = new FormData();
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
        formData.append('zone_name', zoneName);
        formData.append('location', location);

        // 添加圖片（如果有）
    if (imageInput && imageInput.files && imageInput.files[0]) {
            formData.append('zone_image', imageInput.files[0]);
        }

        // 檢查是否有圖片
        const hasImage = imageInput && imageInput.files && imageInput.files[0];

        // 顯示加載狀態
        const originalText = submitBtn.html();
        submitBtn.html('<i class="bi bi-hourglass-split me-2"></i>Creating...');
        submitBtn.prop('disabled', true);

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
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to create zone');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.showAlert(data.message || 'Zone created successfully', 'success');

                // 關閉彈窗
                const modal = bootstrap.Modal.getInstance(document.getElementById('createZoneModal'));
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
                    this.fetchZones(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to create zone', 'error');
            }
        })
        .catch(error => {
            let errorMessage = 'Failed to create zone';
            if (error.message) {
                errorMessage = error.message;
            }
            this.showAlert(errorMessage, 'error');
        })
        .finally(() => {
            // 恢復按鈕狀態
            submitBtn.html(originalText);
            submitBtn.prop('disabled', false);
        });
    }

    // =============================================================================
    // Update Zone 彈窗模塊 (Update Zone Modal Module)
    // =============================================================================

    /**
     * 綁定更新彈窗事件
     */
    bindUpdateModalEvents() {
        // 彈窗打開時初始化圖片處理
        $('#updateZoneModal').on('show.bs.modal', () => {
            this.initUpdateModalImageSystem();
            // 使用統一的狀態管理初始化選擇（交給 status-management）
            if (typeof window.initializeStatusCardSelection === 'function') {
                window.initializeStatusCardSelection('zone_status');
            }
        });

        // 彈窗完全顯示後設置焦點
        $('#updateZoneModal').on('shown.bs.modal', () => {
            const zoneNameInput = document.getElementById('update_zone_name');
            if (zoneNameInput) {
                zoneNameInput.focus();
            }
        });

        // 彈窗關閉時清理
        $('#updateZoneModal').on('hidden.bs.modal', () => {
            this.resetUpdateModalForm();
            // 手动清理 backdrop，确保 modal 完全关闭
            this.cleanupModalBackdrop();
        });

        // 提交按鈕事件
        $('#submitUpdateZoneModal').on('click', () => {
            this.submitUpdateModalZone();
        });

        // Enter鍵自動跳轉到下一個輸入框或提交表單
        $('#updateZoneModal').on('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const target = e.target;
                // 排除 image 輸入框
                if (target.type === 'file' || target.id === 'input_image') {
                    return;
                }

                // 如果當前在輸入框中
                if (target.tagName === 'INPUT' && target.type !== 'submit' && target.type !== 'button' && target.type !== 'radio') {
                    e.preventDefault();

                    // 定義輸入框順序
                    const inputOrder = ['update_zone_name', 'update_location'];
                    const currentIndex = inputOrder.indexOf(target.id);

                    if (currentIndex !== -1 && currentIndex < inputOrder.length - 1) {
                        // 跳轉到下一個輸入框
                        const nextInput = document.getElementById(inputOrder[currentIndex + 1]);
                        if (nextInput) {
                            nextInput.focus();
                        }
                    } else {
                        // 最後一個輸入框，提交表單
                        this.submitUpdateModalZone();
                    }
                }
            }
        });

        // 狀態卡片交互由 status-management 接管，這裡不再自定義事件
    }

    /**
     * 打開更新彈窗並填充數據
     * @param {Object} zoneData Zone數據對象
     */
    openUpdateModal(zoneData) {
        // 填充表單數據
        $('#update_zone_name').val(zoneData.zone_name || '');
        $('#update_location').val(zoneData.location || '');

        // 設置狀態（交給 status-management 初始化後，直接設置單選值）
        const targetStatus = zoneData.zone_status === 'Unavailable' ? 'Unavailable' : 'Available';
        const radioSelector = targetStatus === 'Available' ? '#update_status_available' : '#update_status_unavailable';
        $(radioSelector).prop('checked', true);
        if (typeof window.initializeStatusCardSelection === 'function') {
            window.initializeStatusCardSelection('zone_status');
        }

        // 設置隱藏的zone ID（用於提交）
        const form = $('#updateZoneModalForm');
        form.attr('data-zone-id', zoneData.id);

        // 更新當前Zone信息卡片
        const currentInfo = `
            <div class="mb-1">
                <i class="bi bi-geo-alt me-2 text-muted"></i>
                <span>Name: <strong>${zoneData.zone_name || 'N/A'}</strong></span>
                </div>
            <div class="mb-1">
                <i class="bi bi-geo me-2 text-muted"></i>
                <span>Location: <strong>${zoneData.location || 'N/A'}</strong></span>
                    </div>
            <div class="mb-1">
                <i class="bi bi-shield-check me-2 text-muted"></i>
                <span>Status: <strong>${zoneData.zone_status || 'N/A'}</strong></span>
                    </div>
        `;
        $('#currentZoneInfo').html(currentInfo);

        // 處理圖片
        if (zoneData.zone_image) {
            const imageUrl = `/assets/images/${zoneData.zone_image}`;
            this.setUpdateModalImage(imageUrl);
        } else {
            this.resetUpdateModalImage();
        }

        // 重置移除圖片標記
        $('#remove_image').val('0');

        // 打開彈窗
        const modal = new bootstrap.Modal(document.getElementById('updateZoneModal'));
        modal.show();
    }

    /**
     * 初始化更新彈窗中的圖片處理系統（使用標準ImageSystem配置 - Update模式）
     */
    initUpdateModalImageSystem() {
        // 使用統一的圖片處理模組（完全交給ImageSystem處理）
        // Update modal 使用 Update 模式的配置：input_image 和 image-preview
        if (typeof window.ImageSystem !== 'undefined') {
            const modal = document.getElementById('updateZoneModal');
            if (!modal) return;

            const imageInput = modal.querySelector('#input_image');
            const previewContainer = modal.querySelector('#image-preview');
            const removeImageBtn = modal.querySelector('#removeImage');

            // 只綁定彈窗內的元素（避免與Add Zone Modal衝突）
            if (imageInput && previewContainer) {
                // 使用 Update 模式的配置調用 ImageSystem
                // bindImageUploadEvents 會自動處理：上傳、預覽、刪除、驗證等功能
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
                    // 為 Update modal 點擊預覽區域觸發文件選擇
                    freshPreviewContainer.addEventListener('click', function(e) {
                        if (e.target.closest('.img-remove-btn')) {
                            return; // 不觸發文件選擇
                        }
                        freshImageInput.click();
                    });
                }

                // 綁定靜態移除按鈕事件（參考 rack 的實現方式，只使用靜態按鈕）
                // 重要：先移除所有旧的事件监听器，然后重新绑定，确保只绑定一次
                if (removeImageBtn) {
                    // 克隆按钮以移除所有旧的事件监听器
                    const newRemoveBtn = removeImageBtn.cloneNode(true);
                    removeImageBtn.parentNode.replaceChild(newRemoveBtn, removeImageBtn);

                    // 重新获取按钮引用
                    const freshRemoveBtn = modal.querySelector('#removeImage');

                    // 绑定新的事件监听器（只绑定一次）
                    freshRemoveBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();

                        // 防止重复触发
                        if (freshRemoveBtn.hasAttribute('data-processing')) {
                            return;
                        }
                        freshRemoveBtn.setAttribute('data-processing', 'true');

                        const modal = document.getElementById('updateZoneModal');
                        const form = modal ? document.getElementById('updateZoneModalForm') : null;

                        if (!confirm('Are you sure you want to remove this image?')) {
                            freshRemoveBtn.removeAttribute('data-processing');
                            return;
                        }

                        const imageInput = modal?.querySelector('#input_image');
                        const previewContainer = modal?.querySelector('#image-preview');
                        const imageUploadContent = modal?.querySelector('#imageUploadContent');
                        const removeImageInput = modal?.querySelector('#remove_image');

                        if (imageInput && previewContainer && form) {
                            // 重置文件输入
                            imageInput.value = '';

                            // 設置 remove_image 標記
                            if (removeImageInput) {
                                removeImageInput.value = '1';
                            }

                            // 隐藏图片，显示占位符
                            const previewImg = previewContainer.querySelector('#preview-image') || previewContainer.querySelector('#img-preview');
                            if (previewImg) {
                                previewImg.remove();
                            }

                            // 恢复原始内容（显示占位符）
                            const originalContent = previewContainer.getAttribute('data-original-content');
                            if (originalContent) {
                                // 恢复原始 HTML 结构
                                previewContainer.innerHTML = originalContent;

                                // 确保 preview-image 是隐藏的
                                const restoredPreviewImg = previewContainer.querySelector('#preview-image');
                                if (restoredPreviewImg) {
                                    restoredPreviewImg.classList.add('d-none');
                                }

                                // 确保 removeImage 按钮是隐藏的
                                const restoredRemoveBtn = previewContainer.querySelector('#removeImage');
                                if (restoredRemoveBtn) {
                                    restoredRemoveBtn.classList.add('d-none');
                                }

                                // 确保 imageUploadContent 是显示的
                                const restoredImageUploadContent = previewContainer.querySelector('#imageUploadContent');
                                if (restoredImageUploadContent) {
                                    restoredImageUploadContent.classList.remove('d-none');
                                    restoredImageUploadContent.style.display = '';
                                }
        } else {
                                // 如果没有原始内容，显示默认占位符
                                if (imageUploadContent) {
                                    imageUploadContent.classList.remove('d-none');
                                    imageUploadContent.style.display = '';
                                }
                            }

                            // 隐藏移除按钮
                            freshRemoveBtn.classList.add('d-none');
                            freshRemoveBtn.removeAttribute('data-processing');

                            // 顯示成功提示
                            if (typeof window.showAlert === 'function') {
                                window.showAlert('Image removed successfully', 'success');
    } else {
                                alert('Image removed successfully');
                            }
                        } else {
                            freshRemoveBtn.removeAttribute('data-processing');
                        }
                    });
                }
            }
        } else {
            console.warn('ImageSystem not available, image functionality may not work properly');
        }
    }

    /**
     * 設置更新彈窗中的圖片（使用Update模式標準ID）
     * @param {string} imageUrl 圖片URL
     */
    setUpdateModalImage(imageUrl) {
        const modal = document.getElementById('updateZoneModal');
        if (!modal) return;

        const previewContainer = modal.querySelector('#image-preview');
        const previewImg = modal.querySelector('#preview-image');
        const imageUploadContent = modal.querySelector('#imageUploadContent');
        const removeBtn = modal.querySelector('#removeImage');

        if (previewContainer && previewImg && imageUploadContent) {
            // 顯示圖片，隱藏上傳占位符
            previewImg.src = imageUrl;
            previewImg.classList.remove('d-none');
            previewImg.style.display = 'block';
            imageUploadContent.classList.add('d-none');
            imageUploadContent.style.display = 'none';

            // 顯示移除按鈕（只使用靜態按鈕，參考 rack 的實現）
            if (removeBtn) {
                removeBtn.classList.remove('d-none');
                // 確保事件已綁定（在 initUpdateModalImageSystem 中綁定）
            }
        }
    }

    /**
     * 重置更新彈窗中的圖片（使用Update模式標準ID）
     * 注意：此函數只用於重置UI顯示，不會設置 remove_image 標記
     */
    resetUpdateModalImage() {
        const modal = document.getElementById('updateZoneModal');
        if (!modal) return;

        const previewContainer = modal.querySelector('#image-preview');
        const previewImg = modal.querySelector('#preview-image') || modal.querySelector('#img-preview');
        const imageUploadContent = modal.querySelector('#imageUploadContent');
        const removeBtn = modal.querySelector('#removeImage');
        const imageInput = modal.querySelector('#input_image');

        if (previewContainer) {
            // 隱藏圖片，顯示上傳占位符
            if (previewImg) {
                previewImg.classList.add('d-none');
                previewImg.style.display = 'none';
                previewImg.src = '';
            }

            if (imageUploadContent) {
                imageUploadContent.classList.remove('d-none');
                imageUploadContent.style.display = '';

                // 恢复文本内容显示
                const textElements = imageUploadContent.querySelectorAll('h6, p');
                textElements.forEach(el => {
                    el.style.display = '';
                });
            }

            // 隱藏移除按鈕
            if (removeBtn) {
                removeBtn.classList.add('d-none');
            }

            // 重置文件輸入
            if (imageInput) {
                imageInput.value = '';
            }

            // 注意：不設置 remove_image，因為這應該只在用戶確認移除時設置
        }
    }

    /**
     * 移除更新彈窗中的圖片（已廢棄，改用靜態按鈕直接處理）
     * @deprecated 使用靜態按鈕直接處理移除邏輯，參考 rack 的實現
     */
    removeUpdateModalImage() {
        // 此函數已不再使用，移除邏輯直接在靜態按鈕的事件處理中實現
        console.warn('removeUpdateModalImage is deprecated, use static button handler instead');
    }

    /**
     * 重置更新彈窗表單
     */
    resetUpdateModalForm() {
        const form = document.getElementById('updateZoneModalForm');
        if (form) {
            form.reset();
        }

        // 重置圖片
        this.resetUpdateModalImage();
        $('#remove_image').val('0');

        // 移除驗證類
        const inputs = form?.querySelectorAll('.form-control');
        if (inputs) {
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
            });
        }

        // 重置狀態卡片
        $('#updateZoneModal .status-card').removeClass('selected');
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
     * 提交更新彈窗中的Zone
     */
    submitUpdateModalZone() {
        const form = document.getElementById('updateZoneModalForm');
        const zoneId = form.getAttribute('data-zone-id');

        if (!zoneId) {
            this.showAlert('Zone ID not found', 'error');
            return;
        }

        const modal = document.getElementById('updateZoneModal');
        const zoneNameInput = modal ? modal.querySelector('#update_zone_name') : null;
        const locationInput = modal ? modal.querySelector('#update_location') : null;
        const statusInput = modal ? modal.querySelector('input[name="zone_status"]:checked') : null;
        const imageInput = modal ? modal.querySelector('#input_image') : null;
        const removeImageInput = modal ? modal.querySelector('#remove_image') : null;
        const submitBtn = $('#submitUpdateZoneModal');

        // 獲取輸入值
        const zoneName = zoneNameInput ? zoneNameInput.value.trim() : '';
        const location = locationInput ? locationInput.value.trim() : '';
        const zoneStatus = statusInput ? statusInput.value : '';

        // 驗證輸入
        let isValid = true;

        if (!zoneName) {
            if (zoneNameInput) {
                zoneNameInput.classList.add('is-invalid');
            }
            isValid = false;
        } else {
            if (zoneNameInput) {
                zoneNameInput.classList.remove('is-invalid');
                zoneNameInput.classList.add('is-valid');
            }
        }

        if (!location) {
            if (locationInput) {
                locationInput.classList.add('is-invalid');
            }
            isValid = false;
        } else {
            if (locationInput) {
                locationInput.classList.remove('is-invalid');
                locationInput.classList.add('is-valid');
            }
        }

        if (!zoneStatus) {
            this.showAlert('Please select zone status', 'warning');
            isValid = false;
        }

        if (!isValid) {
            this.showAlert('Please fill in all required fields', 'warning');
            return;
        }

        // 準備表單數據
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
        formData.append('_method', 'PUT');
        formData.append('zone_name', zoneName);
        formData.append('location', location);
        formData.append('zone_status', zoneStatus);

        // 添加圖片（如果有新圖片）
        if (imageInput && imageInput.files && imageInput.files[0]) {
            formData.append('zone_image', imageInput.files[0]);
        }

        // 如果標記了移除圖片
        if (removeImageInput && removeImageInput.value === '1') {
            formData.append('remove_image', '1');
        }

        // 檢查是否有圖片相關的更改
        const hasImageChange = (imageInput && imageInput.files && imageInput.files[0]) ||
                               (removeImageInput && removeImageInput.value === '1');

        // 顯示加載狀態
        const originalText = submitBtn.html();
        submitBtn.html('<i class="bi bi-hourglass-split me-2"></i>Updating...');
        submitBtn.prop('disabled', true);

    // 提交數據
        const updateUrl = window.updateZoneUrl.replace(':id', zoneId);
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
                throw new Error(data.message || 'Failed to update zone');
            });
        }
        return response.json();
    })
        .then(data => {
            if (data.success) {
                this.showAlert(data.message || 'Zone updated successfully', 'success');

                // 關閉彈窗
                const modal = bootstrap.Modal.getInstance(document.getElementById('updateZoneModal'));
                if (modal) {
                    modal.hide();
                }

                // 如果有圖片更改，刷新整個頁面；否則只更新 DOM
                if (hasImageChange) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    // 沒有圖片更改，只更新 DOM
                    if (data.data) {
                        this.updateZoneRow(zoneId, data.data);
                    } else {
                        // 如果沒有返回數據，重新載入當前頁面
                        this.fetchZones(this.currentPage);
                    }
                }
            } else {
                this.showAlert(data.message || 'Failed to update zone', 'error');
            }
        })
        .catch(error => {
            // 处理验证错误 (422)
            if (error.status === 422 && error.errors) {
                this.displayValidationErrors(error.errors);
                this.showAlert('Please fill in all required fields', 'warning');
            } else {
                let errorMessage = 'Failed to update zone';
                if (error.message) {
                    errorMessage = error.message;
                }
                this.showAlert(errorMessage, 'error');
            }
        })
        .finally(() => {
            // 恢復按鈕狀態
            submitBtn.html(originalText);
            submitBtn.prop('disabled', false);
        });
    }
}

// =============================================================================
// 全局實例初始化 (Global Instance Initialization)
// =============================================================================

let zoneDashboard;

$(document).ready(function() {
    if ($("#table-body").length > 0) {
        zoneDashboard = new ZoneDashboard();

        // 導出方法到全局作用域
        window.setZoneAvailable = (zoneId) => zoneDashboard.setAvailable(zoneId);
        window.setZoneUnavailable = (zoneId) => zoneDashboard.setUnavailable(zoneId);
        window.editZone = (zoneId) => zoneDashboard.editZone(zoneId);
        window.deleteZone = (zoneId) => zoneDashboard.deleteZone(zoneId);
    }
});
