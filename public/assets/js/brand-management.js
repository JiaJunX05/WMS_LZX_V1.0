/**
 * Brand Management JavaScript
 * 品牌管理統一交互邏輯
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
 * Brand Dashboard 類
 * 品牌儀表板頁面交互邏輯
 */
class BrandDashboard {
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
        this.fetchBrands();
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
            this.fetchBrands(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchBrands(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchBrands(this.currentPage + 1);
            }
        });

        // 全選/取消全選功能
        $('#select-all').on('change', (e) => {
            const isChecked = $(e.target).is(':checked');
            $('.brand-checkbox').prop('checked', isChecked);
            this.updateExportButton();
        });

        // 單個勾選框變化
        $(document).on('change', '.brand-checkbox', () => {
            this.updateSelectAllCheckbox();
            this.updateExportButton();
        });

        // 導出按鈕
        $('#export-brands-btn').on('click', () => {
            this.exportSelectedBrands();
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
            status_filter: this.statusFilter,
            perPage: 10
        };
    }

    /**
     * 獲取品牌數據
     * @param {number} page 頁碼
     */
    fetchBrands(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.brandManagementRoute;

        $.get(apiRoute, params)
            .done((response) => {
                if (response.data && response.data.length > 0) {
                    this.renderBrands(response.data);
                    this.updatePaginationInfo(response);
                } else {
                    this.showNoResults();
                }
                this.updateStatistics(response);
                this.updateResultsCount(response);
                this.generatePagination(response);
            })
            .fail((xhr, status, error) => {
                this.showAlert('Failed to load brands, please try again', 'danger');
            });
    }

    /**
     * 處理搜索
     */
    handleSearch() {
        this.fetchBrands(1);
    }

    /**
     * 處理篩選
     */
    handleFilter() {
        this.fetchBrands(1);
    }

    /**
     * 清除所有篩選條件
     */
    clearFilters() {
        this.statusFilter = '';
        this.searchTerm = '';

        $('#status-filter').val('');
        $('#search-input').val('');

        this.fetchBrands(1);
    }

    /**
     * 更新統計數據
     * @param {Object} response API響應數據
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-brands').text(total);

        // 計算活躍和非活躍品牌數量
        if (response.data) {
            const activeCount = response.data.filter(brand => brand.brand_status === 'Available').length;
            const inactiveCount = response.data.filter(brand => brand.brand_status === 'Unavailable').length;
            const withImageCount = response.data.filter(brand => brand.brand_image).length;

            $('#active-brands').text(activeCount);
            $('#inactive-brands').text(inactiveCount);
            $('#brands-with-image').text(withImageCount);
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
     * 渲染品牌列表
     * @param {Array} brands 品牌數據數組
     */
    renderBrands(brands) {
        const $tableBody = $('#table-body');
        const html = brands.map(brand => this.createBrandRow(brand)).join('');
        $tableBody.html(html);

        // 重置勾選框狀態
        this.updateSelectAllCheckbox();
        this.updateExportButton();

        // 隱藏空狀態（有數據時）
        $('#empty-state').addClass('d-none');
    }

    createBrandRow(brand) {
        const statusMenuItem = brand.brand_status === 'Unavailable'
            ? `<button type="button" class="dropdown-item" onclick="brandDashboard.setAvailable(${brand.id})">
                   <i class="bi bi-check-circle me-2"></i> Activate
               </button>`
            : `<button type="button" class="dropdown-item" onclick="brandDashboard.setUnavailable(${brand.id})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate
               </button>`;

        const actionButtons = `
            <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="brandDashboard.editBrand(${brand.id})">
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
                        <button type="button" class="dropdown-item text-danger" onclick="brandDashboard.deleteBrand(${brand.id})">
                            <i class="bi bi-trash me-2"></i> Delete
                        </button>
                    </li>
                </ul>
            </div>
        `;

        return `
            <tr data-brand-id="${brand.id}"
                data-brand-name="${brand.brand_name || ''}"
                data-brand-status="${brand.brand_status || 'Available'}"
                data-brand-image="${brand.brand_image || ''}">
                <td class="ps-4">
                    <input class="brand-checkbox form-check-input" type="checkbox" value="${brand.id}" id="brand-${brand.id}">
                </td>
                <td>
                    ${brand.brand_image ? `
                        <img src="/assets/images/${brand.brand_image}" alt="Brand Image"
                             class="rounded border border-2 border-white shadow-sm" style="width: 2.5rem; height: 2.5rem; object-fit: cover;">
                    ` : `
                        <div class="rounded border border-2 border-white shadow-sm bg-light d-flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem;">
                            <i class="bi bi-image text-muted"></i>
                        </div>
                    `}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-tag me-2 text-primary"></i>
                        <h6 class="mb-0 fw-bold">${brand.brand_name}</h6>
                    </div>
                </td>
                <td>
                    <span class="badge ${brand.brand_status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${brand.brand_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${brand.brand_status}
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
    // 品牌操作模塊 (Brand Operations Module)
    // =============================================================================

    /**
     * 編輯品牌
     * @param {number} brandId 品牌ID
     */
    editBrand(brandId) {
        const url = window.editBrandUrl.replace(':id', brandId);

        // 从表格行获取brand数据（如果可用，用于快速填充）
        const row = document.querySelector(`tr[data-brand-id="${brandId}"]`);
        if (row) {
            // 快速填充基本数据
            const brandData = {
                id: brandId,
                brand_name: row.getAttribute('data-brand-name') || '',
                brand_status: row.getAttribute('data-brand-status') || 'Available',
                brand_image: row.getAttribute('data-brand-image') || ''
            };
            this.openUpdateModal(brandData);
        }

        // 从 API 获取完整brand数据
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
                    this.showAlert(response.message || 'Failed to load brand data', 'error');
                }
            },
            error: (xhr) => {
                let errorMessage = 'Failed to load brand data';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                this.showAlert(errorMessage, 'error');
            }
        });
    }

    /**
     * 刪除品牌
     * @param {number} brandId 品牌ID
     */
    deleteBrand(brandId) {
        if (!confirm('Are you sure you want to delete this brand?')) return;

        fetch(window.deleteBrandUrl.replace(':id', brandId), {
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
                this.showAlert(data.message || 'Brand deleted successfully', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchBrands(1);
                } else {
                    // 重新載入當前頁面的品牌列表
                    this.fetchBrands(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to delete brand', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to delete brand', 'error');
        });
    }

    /**
     * 更新表格行的狀態顯示和 data 屬性
     * @param {number} brandId 品牌ID
     * @param {string} newStatus 新狀態 ('Available' 或 'Unavailable')
     */
    updateBrandRowStatus(brandId, newStatus) {
        const brandRow = $(`tr[data-brand-id="${brandId}"]`);
        if (brandRow.length === 0) return;

        // 更新 data 屬性
        brandRow.attr('data-brand-status', newStatus);

        // 更新狀態菜單項（與 createBrandRow 中的格式完全一致）
        const statusMenuItem = newStatus === 'Unavailable'
            ? `<button type="button" class="dropdown-item" onclick="brandDashboard.setAvailable(${brandId})">
                   <i class="bi bi-check-circle me-2"></i> Activate
               </button>`
            : `<button type="button" class="dropdown-item" onclick="brandDashboard.setUnavailable(${brandId})">
                   <i class="bi bi-slash-circle me-2"></i> Deactivate
               </button>`;

        // 更新操作按鈕區域（與 createBrandRow 中的格式完全一致）
        const actionButtons = `
            <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="brandDashboard.editBrand(${brandId})">
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
                        <button type="button" class="dropdown-item text-danger" onclick="brandDashboard.deleteBrand(${brandId})">
                            <i class="bi bi-trash me-2"></i> Delete
                        </button>
                    </li>
                </ul>
            </div>
        `;

        // 更新操作按鈕列
        const actionsCell = brandRow.find('td:last-child');
        actionsCell.html(actionButtons);

        // 更新狀態標籤顯示（與 createBrandRow 中的格式完全一致）
        const statusBadge = newStatus === 'Available'
            ? `<span class="badge bg-success px-3 py-2">
                <i class="bi bi-check-circle me-1"></i>${newStatus}
            </span>`
            : `<span class="badge bg-danger px-3 py-2">
                <i class="bi bi-x-circle me-1"></i>${newStatus}
            </span>`;

        // 更新狀態列顯示
        const statusCell = brandRow.find('td').eq(-2); // 倒數第二列是狀態列
        if (statusCell.length > 0) {
            statusCell.html(statusBadge);
        }
    }

    /**
     * 激活品牌
     * @param {number} brandId 品牌ID
     */
    setAvailable(brandId) {
        if (!confirm('Are you sure you want to activate this brand?')) return;

        fetch(window.availableBrandUrl.replace(':id', brandId), {
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
                this.showAlert(data.message || 'Brand has been set to available status', 'success');
                // 更新 DOM 而不是刷新頁面
                this.updateBrandRowStatus(brandId, 'Available');
            } else {
                this.showAlert(data.message || 'Failed to set brand available', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set brand available', 'error');
        });
    }

    /**
     * 停用品牌
     * @param {number} brandId 品牌ID
     */
    setUnavailable(brandId) {
        if (!confirm('Are you sure you want to deactivate this brand?')) return;

        fetch(window.unavailableBrandUrl.replace(':id', brandId), {
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
                this.showAlert(data.message || 'Brand has been set to unavailable status', 'success');
                // 更新 DOM 而不是刷新頁面
                this.updateBrandRowStatus(brandId, 'Unavailable');
            } else {
                this.showAlert(data.message || 'Failed to set brand unavailable', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set brand unavailable', 'error');
        });
    }

    // =============================================================================
    // 勾選框管理模塊 (Checkbox Management Module)
    // =============================================================================

    /**
     * 更新全選勾選框狀態
     */
    updateSelectAllCheckbox() {
        const totalCheckboxes = $('.brand-checkbox').length;
        const checkedCheckboxes = $('.brand-checkbox:checked').length;
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
        const checkedCount = $('.brand-checkbox:checked').length;
        const exportBtn = $('#export-brands-btn');

        if (checkedCount > 0) {
            exportBtn.prop('disabled', false);
            exportBtn.html(`<i class="bi bi-download me-2"></i>Export Data (${checkedCount})`);
        } else {
            exportBtn.prop('disabled', true);
            exportBtn.html('<i class="bi bi-download me-2"></i>Export Data');
        }
    }

    /**
     * 導出選中的品牌
     */
    exportSelectedBrands() {
        const selectedIds = $('.brand-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            this.showAlert('Please select at least one brand to export', 'warning');
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
        const exportUrl = `${window.brandExportUrl}?${params}`;

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
    // Create Brand 彈窗模塊 (Create Brand Modal Module)
    // =============================================================================

    /**
     * 綁定彈窗事件
     */
    bindModalEvents() {
        // 彈窗打開時重置表單並初始化圖片處理
        $('#createBrandModal').on('show.bs.modal', () => {
            this.resetModalForm();
            this.initModalImageSystem();
        });

        // 彈窗完全顯示後設置焦點
        $('#createBrandModal').on('shown.bs.modal', () => {
            const brandNameInput = document.getElementById('brand_name');
            if (brandNameInput) {
                brandNameInput.focus();
            }
        });

        // 彈窗關閉時清理
        $('#createBrandModal').on('hidden.bs.modal', () => {
            this.resetModalForm();
        });

        // 提交按鈕事件
        $('#submitCreateBrandModal').on('click', () => {
            this.submitModalBrand();
        });

        // Enter鍵自動跳轉到下一個輸入框或提交表單
        $('#createBrandModal').on('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const target = e.target;
                // 排除 image 輸入框
                if (target.type === 'file' || target.id === 'brand_image') {
                    return;
                }

                // 如果當前在輸入框中
                if (target.tagName === 'INPUT' && target.type !== 'submit' && target.type !== 'button') {
                    e.preventDefault();
                    // brand 只有一個輸入框，直接提交
                    this.submitModalBrand();
                }
            }
        });
    }

    /**
     * 初始化彈窗中的圖片處理系統
     */
    initModalImageSystem() {
        if (typeof window.ImageSystem !== 'undefined') {
            const modal = document.getElementById('createBrandModal');
            if (!modal) return;

            const imageInput = modal.querySelector('#brand_image');
            const imageUploadArea = modal.querySelector('#imageUploadArea');

            if (imageInput && imageUploadArea) {
                window.ImageSystem.bindImageUploadEvents({
                    createImageInputId: 'brand_image',
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
        const form = document.getElementById('createBrandModalForm');
        if (form) {
            form.reset();
        }

        if (typeof window.ImageSystem !== 'undefined' && window.ImageSystem.resetImage) {
            window.ImageSystem.resetImage('imageUploadArea', {
                imageInputId: 'brand_image',
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
     * 提交彈窗中的Brand
     */
    submitModalBrand() {
        const brandNameInput = document.getElementById('brand_name');
        const imageInput = document.getElementById('brand_image');
        const submitBtn = $('#submitCreateBrandModal');

        const brandName = brandNameInput ? brandNameInput.value.trim() : '';

        let isValid = true;

        if (!brandName) {
            if (brandNameInput) {
                brandNameInput.classList.add('is-invalid');
            }
            isValid = false;
        } else {
            if (brandNameInput) {
                brandNameInput.classList.remove('is-invalid');
                brandNameInput.classList.add('is-valid');
            }
        }

        if (!isValid) {
            this.showAlert('Please fill in all required fields', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
        formData.append('brand_name', brandName);

        if (imageInput && imageInput.files && imageInput.files[0]) {
            formData.append('brand_image', imageInput.files[0]);
        }

        // 檢查是否有圖片
        const hasImage = imageInput && imageInput.files && imageInput.files[0];

        const originalText = submitBtn.html();
        submitBtn.html('<i class="bi bi-hourglass-split me-2"></i>Creating...');
        submitBtn.prop('disabled', true);

        fetch(window.createBrandUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to create brand');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.showAlert(data.message || 'Brand created successfully', 'success');

                const modal = bootstrap.Modal.getInstance(document.getElementById('createBrandModal'));
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
                    this.fetchBrands(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to create brand', 'error');
            }
        })
        .catch(error => {
            let errorMessage = 'Failed to create brand';
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
    // Update Brand 彈窗模塊 (Update Brand Modal Module)
    // =============================================================================

    /**
     * 綁定更新彈窗事件
     */
    bindUpdateModalEvents() {
        $('#updateBrandModal').on('show.bs.modal', () => {
            this.initUpdateModalImageSystem();
            if (typeof window.initializeStatusCardSelection === 'function') {
                window.initializeStatusCardSelection('brand_status');
            }
        });

        // 彈窗完全顯示後設置焦點
        $('#updateBrandModal').on('shown.bs.modal', () => {
            const brandNameInput = document.getElementById('update_brand_name');
            if (brandNameInput) {
                brandNameInput.focus();
            }
        });

        $('#updateBrandModal').on('hidden.bs.modal', () => {
            this.resetUpdateModalForm();
        });

        $('#submitUpdateBrandModal').on('click', () => {
            this.submitUpdateModalBrand();
        });

        // Enter鍵自動跳轉到下一個輸入框或提交表單
        $('#updateBrandModal').on('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const target = e.target;
                // 排除 image 輸入框
                if (target.type === 'file' || target.id === 'input_image') {
                    return;
                }

                // 如果當前在輸入框中
                if (target.tagName === 'INPUT' && target.type !== 'submit' && target.type !== 'button' && target.type !== 'radio') {
                    e.preventDefault();
                    // brand 只有一個輸入框，直接提交
                    this.submitUpdateModalBrand();
                }
            }
        });
    }

    /**
     * 打開更新彈窗並填充數據
     */
    openUpdateModal(brandData) {
        $('#update_brand_name').val(brandData.brand_name || '');

        const targetStatus = brandData.brand_status === 'Unavailable' ? 'Unavailable' : 'Available';
        const radioSelector = targetStatus === 'Available' ? '#update_status_available' : '#update_status_unavailable';
        $(radioSelector).prop('checked', true);
        if (typeof window.initializeStatusCardSelection === 'function') {
            window.initializeStatusCardSelection('brand_status');
        }

        const form = $('#updateBrandModalForm');
        form.attr('data-brand-id', brandData.id);

        const currentInfo = `
            <div class="mb-1">
                <i class="bi bi-tag me-2 text-muted"></i>
                <span>Name: <strong>${brandData.brand_name || 'N/A'}</strong></span>
            </div>
            <div class="mb-1">
                <i class="bi bi-shield-check me-2 text-muted"></i>
                <span>Status: <strong>${brandData.brand_status || 'N/A'}</strong></span>
            </div>
        `;
        $('#currentBrandInfo').html(currentInfo);

        if (brandData.brand_image) {
            const imageUrl = `/assets/images/${brandData.brand_image}`;
            this.setUpdateModalImage(imageUrl);
        } else {
            this.resetUpdateModalImage();
        }

        $('#remove_image').val('0');

        const modal = new bootstrap.Modal(document.getElementById('updateBrandModal'));
        modal.show();
    }

    /**
     * 初始化更新彈窗中的圖片處理系統
     */
    initUpdateModalImageSystem() {
        if (typeof window.ImageSystem !== 'undefined') {
            const modal = document.getElementById('updateBrandModal');
            if (!modal) return;

            const imageInput = modal.querySelector('#input_image');
            const previewContainer = modal.querySelector('#image-preview');
            const removeImageBtn = modal.querySelector('#removeImage');

            if (imageInput && previewContainer) {
                window.ImageSystem.bindImageUploadEvents({
                    updateImageInputId: 'input_image',
                    updatePreviewContainerId: 'image-preview'
                });

                previewContainer.addEventListener('click', function(e) {
                    if (e.target.closest('.img-remove-btn')) {
                        return;
                    }
                    imageInput.click();
                });

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

                        const modal = document.getElementById('updateBrandModal');
                        const form = modal ? document.getElementById('updateBrandModalForm') : null;

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
        const modal = document.getElementById('updateBrandModal');
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
        const modal = document.getElementById('updateBrandModal');
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
        const form = document.getElementById('updateBrandModalForm');
        if (form) {
            form.reset();
        }

        this.resetUpdateModalImage();

        const inputs = form?.querySelectorAll('.form-control');
        if (inputs) {
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
            });
        }

        $('#remove_image').val('0');
    }

    /**
     * 提交更新彈窗中的Brand
     */
    submitUpdateModalBrand() {
        const form = document.getElementById('updateBrandModalForm');
        const brandId = form?.getAttribute('data-brand-id');
        const brandNameInput = document.getElementById('update_brand_name');
        const imageInput = document.getElementById('input_image');
        const removeImageInput = document.getElementById('remove_image');
        const submitBtn = $('#submitUpdateBrandModal');

        if (!brandId) {
            this.showAlert('Brand ID not found', 'error');
            return;
        }

        const brandName = brandNameInput ? brandNameInput.value.trim() : '';
        const brandStatus = form?.querySelector('input[name="brand_status"]:checked')?.value || 'Available';

        let isValid = true;

        if (!brandName) {
            if (brandNameInput) {
                brandNameInput.classList.add('is-invalid');
            }
            isValid = false;
        } else {
            if (brandNameInput) {
                brandNameInput.classList.remove('is-invalid');
                brandNameInput.classList.add('is-valid');
            }
        }

        if (!isValid) {
            this.showAlert('Please fill in all required fields', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
        formData.append('_method', 'PUT');
        formData.append('brand_name', brandName);
        formData.append('brand_status', brandStatus);

        if (imageInput && imageInput.files && imageInput.files[0]) {
            formData.append('brand_image', imageInput.files[0]);
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

        const updateUrl = window.updateBrandUrl.replace(':id', brandId);

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
                    throw new Error(data.message || 'Failed to update brand');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.showAlert(data.message || 'Brand updated successfully', 'success');

                const modal = bootstrap.Modal.getInstance(document.getElementById('updateBrandModal'));
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
                    this.fetchBrands(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to update brand', 'error');
            }
        })
        .catch(error => {
            let errorMessage = 'Failed to update brand';
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
// 全局實例初始化 (Global Instance Initialization)
// =============================================================================

let brandDashboard;

$(document).ready(function() {
    if ($("#table-body").length > 0) {
        brandDashboard = new BrandDashboard();

        // 導出方法到全局作用域
        window.setBrandAvailable = (brandId) => brandDashboard.setAvailable(brandId);
        window.setBrandUnavailable = (brandId) => brandDashboard.setUnavailable(brandId);
        window.editBrand = (brandId) => brandDashboard.editBrand(brandId);
        window.deleteBrand = (brandId) => brandDashboard.deleteBrand(brandId);
    }
});
