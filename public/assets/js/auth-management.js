/**
 * Auth Management JavaScript
 * 用戶管理統一交互邏輯
 *
 * 功能模塊：
 * - Dashboard 頁面：搜索、篩選、分頁、CRUD 操作
 * - Create 頁面：單次創建、表單驗證、狀態管理
 * - Update 頁面：編輯更新、表單提交
 * - Register 頁面：用戶註冊、圖片處理
 * - 通用功能：API 請求、UI 更新、事件綁定
 *
 * @author WMS Team
 * @version 1.0.0
 */

// =============================================================================
// Dashboard 頁面功能 (Dashboard Page Functions)
// =============================================================================

/**
 * Auth Dashboard 類
 * 用戶儀表板頁面交互邏輯
 */
class AuthDashboard {
    constructor() {
        // 狀態管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.roleFilter = '';
        this.statusFilter = '';

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模塊 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.loadStats();
        this.fetchUsers();
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
        $('#role-filter').on('change', (e) => {
            this.roleFilter = $(e.target).val();
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
            this.fetchUsers(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchUsers(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchUsers(this.currentPage + 1);
            }
        });

        // 全選功能 (僅SuperAdmin)
        if (window.currentUserRole && window.currentUserRole.replace(/[_\s]/g, '').toLowerCase() === 'superadmin') {
            $('#select-all').on('change', (e) => {
                const isChecked = $(e.target).is(':checked');
                $('.user-checkbox').prop('checked', isChecked);
                this.updateExportButton();
            });

            // 個別勾選框
            $(document).on('change', '.user-checkbox', () => {
                this.updateSelectAllCheckbox();
                this.updateExportButton();
            });

            // 導出按鈕
            $('#export-users-btn').on('click', () => {
                this.exportSelectedUsers();
            });
        }
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
            role: this.roleFilter,
            status: this.statusFilter,
            perPage: 10
        };
    }

    /**
     * 加載統計數據
     */
    loadStats() {
        const apiRoute = window.staffManagementRoute.replace('/management', '/stats');

        $.get(apiRoute)
            .done((response) => {
                if (response.success && response.data) {
                    this.updateStats(response.data);
                }
            })
            .fail(() => {
                console.error('Failed to load user statistics');
            });
    }

    /**
     * 更新統計數據顯示
     * @param {Object} stats 統計數據
     */
    updateStats(stats) {
        $('#total-users').text(stats.total_users || 0);
        $('#active-users').text(stats.available_users || 0);
        $('#inactive-users').text(stats.unavailable_users || 0);
        $('#admin-users').text(stats.admin_users || 0);
    }

    /**
     * 獲取用戶數據
     * @param {number} page 頁碼
     */
    fetchUsers(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.staffManagementRoute;

        $.get(apiRoute, params)
            .done((response) => {
                if (response.success && response.data && response.data.length > 0) {
                    this.renderUsers(response.data);
                    this.updatePaginationInfo(response);
                    this.updateResultsCount(response.pagination.total);
                } else {
                    this.showNoResults();
                    this.updateResultsCount(0);
                }
                this.generatePagination(response);
                this.updateStatistics(response);

                // 更新勾選框狀態 (僅SuperAdmin)
                if (window.currentUserRole && window.currentUserRole.replace(/[_\s]/g, '').toLowerCase() === 'superadmin') {
                    this.updateSelectAllCheckbox();
                    this.updateExportButton();
                }
            })
            .fail((xhr) => {
                const errorMessage = xhr.responseJSON?.message || 'Failed to load users, please try again';
                this.showAlert(errorMessage, 'danger');
            });
    }

    /**
     * 處理搜索
     */
    handleSearch() {
        this.fetchUsers(1);
    }

    /**
     * 處理篩選
     */
    handleFilter() {
        this.fetchUsers(1);
    }

    /**
     * 清除所有篩選
     */
    clearFilters() {
        this.searchTerm = '';
        this.roleFilter = '';
        this.statusFilter = '';

        $('#search-input').val('');
        $('#role-filter').val('');
        $('#status-filter').val('');

        this.fetchUsers(1);
    }

    /**
     * 更新結果計數
     * @param {number} count 結果數量
     */
    updateResultsCount(count) {
        $('#records-count').text(`${count} records`);
    }

    /**
     * 更新統計數據
     * @param {Object} response API響應數據
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-users').text(total);

        // 計算可用和不可用用戶數量
        if (response.data) {
            const activeCount = response.data.filter(user => user.status === 'Available').length;
            const inactiveCount = response.data.filter(user => user.status === 'Unavailable').length;
            const adminCount = response.data.filter(user =>
                user.role === 'Admin' || user.role === 'SuperAdmin'
            ).length;

            $('#active-users').text(activeCount);
            $('#inactive-users').text(inactiveCount);
            $('#admin-users').text(adminCount);
        }
    }

    // =============================================================================
    // 渲染模塊 (Rendering Module)
    // =============================================================================

    /**
     * 渲染用戶列表
     * @param {Array} users 用戶數據數組
     */
    renderUsers(users) {
        const $tableBody = $('#table-body');
        const html = users.map(user => this.createUserRow(user)).join('');
        $tableBody.html(html);
    }

    createUserRow(user) {
        const currentUserRole = window.currentUserRole;
        let actionButtons = '';

        if (currentUserRole && currentUserRole.replace(/[_\s]/g, '').toLowerCase() === 'admin') {
            const statusButton = user.status === 'Unavailable'
                ? `<button class="btn btn-sm btn-outline-success" title="Activate Account" onclick="setUserAvailable(${user.id})">
                       <i class="bi bi-check-circle"></i>
                   </button>`
                : `<button class="btn btn-sm btn-outline-warning" title="Deactivate Account" onclick="setUserUnavailable(${user.id})">
                       <i class="bi bi-slash-circle"></i>
                   </button>`;

            actionButtons = `
                <button class="btn btn-sm btn-outline-primary" title="Edit" onclick="authDashboard.editUser(${user.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                ${statusButton}
            `;
        }

        if (currentUserRole && currentUserRole.replace(/[_\s]/g, '').toLowerCase() === 'superadmin') {
            const statusMenuItem = user.status === 'Unavailable'
                ? `<a class="dropdown-item" href="javascript:void(0)" onclick="setUserAvailable(${user.id})">
                       <i class="bi bi-check-circle me-2"></i> Activate Account
                   </a>`
                : `<a class="dropdown-item" href="javascript:void(0)" onclick="setUserUnavailable(${user.id})">
                       <i class="bi bi-slash-circle me-2"></i> Deactivate Account
                   </a>`;

            actionButtons = `
                <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="authDashboard.editUser(${user.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <div class="dropdown d-inline">
                    <button class="btn btn-sm btn-outline-secondary" title="More" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <a class="dropdown-item" href="javascript:void(0)" onclick="authDashboard.changeRole(${user.id})">
                                <i class="bi bi-arrow-repeat me-2"></i> Change Role
                            </a>
                        </li>
                        <li>
                            ${statusMenuItem}
                        </li>
                        <li>
                            <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="deleteUser(${user.id})">
                                <i class="bi bi-trash me-2"></i> Delete User
                            </a>
                        </li>
                    </ul>
                </div>
            `;
        }

        // SuperAdmin顯示勾選框，其他角色顯示ID
        const firstColumn = currentUserRole && currentUserRole.replace(/[_\s]/g, '').toLowerCase() === 'superadmin'
            ? `<td class="ps-4">
                <input type="checkbox" class="user-checkbox form-check-input" value="${user.id}">
               </td>`
            : `<td class="ps-4"><span class="text-muted">#${user.id}</span></td>`;

        // 获取用户图片URL
        const userImageUrl = user.user_image ? `/assets/images/auth/${user.user_image}` : null;

        return `
            <tr>
                ${firstColumn}
                <td>
                    <div class="d-flex align-items-start">
                        <div class="me-3">
                            ${userImageUrl ?
                                `<img src="${userImageUrl}" alt="User Avatar" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">` :
                                `<div class="bg-light rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                    <i class="bi bi-person text-muted"></i>
                                </div>`
                            }
                        </div>
                        <div class="d-flex flex-column">
                            <span class="fw-medium">${user.name.toUpperCase()}</span>
                            <span class="text-muted small">${user.username}</span>
                        </div>
                    </div>
                </td>
                <td><span class="text-muted small">${user.email}</span></td>
                <td>
                    <span class="badge ${user.role === 'SuperAdmin' ? 'bg-danger' : user.role === 'Admin' ? 'bg-warning' : 'bg-success'} px-3 py-2">
                        <i class="bi ${user.role === 'SuperAdmin' ? 'bi-person-fill-gear' : user.role === 'Admin' ? 'bi-shield-check' : 'bi-person-badge'} me-1"></i>${user.role.toUpperCase()}
                    </span>
                </td>
                <td>
                    <span class="badge ${user.status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${user.status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${user.status}
                    </span>
                </td>
                <td class="text-end pe-4"><div class="d-flex justify-content-end gap-1">${actionButtons}</div></td>
            </tr>
        `;
    }

    getRoleClass(role) {
        const roleMap = { 'SuperAdmin': 'super-admin', 'Admin': 'admin', 'Staff': 'staff' };
        return roleMap[role] || 'default';
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
                        <h5>No users found</h5>
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
    // 勾選框和導出功能 (Checkbox and Export Functions)
    // =============================================================================

    /**
     * 更新全選勾選框狀態
     */
    updateSelectAllCheckbox() {
        const totalCheckboxes = $('.user-checkbox').length;
        const checkedCheckboxes = $('.user-checkbox:checked').length;

        if (totalCheckboxes === 0) {
            $('#select-all').prop('checked', false).prop('indeterminate', false);
        } else if (checkedCheckboxes === totalCheckboxes) {
            $('#select-all').prop('checked', true).prop('indeterminate', false);
        } else if (checkedCheckboxes > 0) {
            $('#select-all').prop('checked', false).prop('indeterminate', true);
        } else {
            $('#select-all').prop('checked', false).prop('indeterminate', false);
        }
    }

    /**
     * 更新導出按鈕狀態
     */
    updateExportButton() {
        const checkedCount = $('.user-checkbox:checked').length;
        const exportBtn = $('#export-users-btn');

        if (checkedCount > 0) {
            exportBtn.prop('disabled', false);
            exportBtn.html(`<i class="bi bi-download me-2"></i>Export Data (${checkedCount})`);
        } else {
            exportBtn.prop('disabled', true);
            exportBtn.html('<i class="bi bi-download me-2"></i>Export Data');
        }
    }

    /**
     * 導出選中的用戶
     */
    exportSelectedUsers() {
        if (!window.userExportUrl) {
            this.showAlert('You do not have permission to export users', 'warning');
            return;
        }

        const selectedIds = $('.user-checkbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            this.showAlert('Please select at least one user to export', 'warning');
            return;
        }

        // 構建導出URL
        const params = new URLSearchParams({
            search: this.searchTerm,
            role: this.roleFilter,
            status: this.statusFilter,
            ids: selectedIds.join(',')
        });

        // 創建下載鏈接
        const downloadUrl = `${window.userExportUrl}?${params.toString()}`;

        // 觸發下載
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showAlert(`Exporting ${selectedIds.length} users...`, 'success');
    }

    // =============================================================================
    // 用戶操作模塊 (User Operations Module)
    // =============================================================================

    /**
     * 編輯用戶
     * @param {number} userId 用戶ID
     */
    editUser(userId) {
        if (!window.editUserUrl) {
            this.showAlert('You do not have permission to edit users', 'warning');
            return;
        }
        const url = window.editUserUrl.replace(':id', userId);
        window.location.href = url;
    }

    /**
     * 更改用戶角色
     * @param {number} userId 用戶ID
     */
    changeRole(userId) {
        // 檢查是否是修改自己
        if (window.currentUserId && parseInt(userId) === parseInt(window.currentUserId)) {
            this.showAlert('You cannot change your own role', 'warning');
            return;
        }

        if (!window.changeRoleUrl) {
            this.showAlert('You do not have permission to change user roles', 'warning');
            return;
        }
        this.showRoleChangeModal(userId);
    }

    // 顯示角色更改模態框
    showRoleChangeModal(userId) {
        // 創建模態框HTML
        const modalHtml = `
            <div class="modal fade" id="roleChangeModal" tabindex="-1" aria-labelledby="roleChangeModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="roleChangeModalLabel">
                                <i class="bi bi-arrow-repeat me-2"></i>Change User Role
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p class="text-muted mb-4">Please select a new user role:</p>
                            <div class="row g-3">
                                <div class="col-lg-4 col-md-6 col-sm-12">
                                    <div class="card h-100 border role-card" data-role="Staff">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="new_role" value="Staff" class="form-check-input me-3">
                                            <div>
                                                <h6 class="card-title mb-1">
                                                    <i class="bi bi-person-badge me-2 text-success"></i>Staff
                                                </h6>
                                                <p class="card-text text-muted small mb-0">Basic user permissions</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div class="col-lg-4 col-md-6 col-sm-12">
                                    <div class="card h-100 border role-card" data-role="Admin">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="new_role" value="Admin" class="form-check-input me-3">
                                            <div>
                                                <h6 class="card-title mb-1">
                                                    <i class="bi bi-shield-check me-2 text-warning"></i>Admin
                                                </h6>
                                                <p class="card-text text-muted small mb-0">Full management permissions</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div class="col-lg-4 col-md-6 col-sm-12">
                                    <div class="card h-100 border role-card" data-role="SuperAdmin">
                                        <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                            <input type="radio" name="new_role" value="SuperAdmin" class="form-check-input me-3">
                                            <div>
                                                <h6 class="card-title mb-1">
                                                    <i class="bi bi-person-fill-gear me-2 text-danger"></i>Super Admin
                                                </h6>
                                                <p class="card-text text-muted small mb-0">Highest system permissions</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-warning" id="confirmRoleChange" data-user-id="${userId}">
                                <i class="bi bi-check-circle me-2"></i>Confirm Change
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 移除已存在的模態框
        $('#roleChangeModal').remove();

        // 添加模態框到頁面
        $('body').append(modalHtml);

        // 顯示模態框
        const modal = new bootstrap.Modal(document.getElementById('roleChangeModal'));
        modal.show();

        // 綁定角色選擇事件
        this.bindRoleSelectionEvents();

        // 綁定確認按鈕事件
        $('#confirmRoleChange').on('click', () => {
            this.confirmRoleChange(userId);
        });
    }

    // 綁定角色選擇事件
    bindRoleSelectionEvents() {
        $('.role-card').on('click', function() {
            // 移除所有卡片的選中狀態
            $('.role-card').removeClass('selected');

            // 添加當前卡片的選中狀態
            $(this).addClass('selected');

            // 選中對應的單選按鈕
            $(this).find('input[type="radio"]').prop('checked', true);
        });

        // 為單選按鈕添加變化事件
        $('input[name="new_role"]').on('change', function() {
            // 移除所有卡片的選中狀態
            $('.role-card').removeClass('selected');

            // 添加對應卡片的選中狀態
            const card = $(this).closest('.role-card');
            card.addClass('selected');
        });
    }

    // 確認角色更改
    confirmRoleChange(userId) {
        const selectedRole = $('input[name="new_role"]:checked').val();

        if (!selectedRole) {
            this.showAlert('Please select a role', 'warning');
            return;
        }

        // 使用通用函數
        this.changeUserRole(userId, selectedRole, {
            onSuccess: () => {
                // 關閉模態框
                $('#roleChangeModal').modal('hide');
                // 重新加載數據
                this.loadStats();
                this.fetchUsers(this.currentPage);
            }
        });
    }

    // 更改用户角色
    changeUserRole(userId, newRole, callbacks = {}) {
        if (!window.changeRoleUrl) {
            this.showAlert('You do not have permission to change user roles', 'warning');
            return;
        }

        const url = window.changeRoleUrl.replace(':id', userId);

        $.ajax({
            url: url,
            type: 'PATCH',
            data: {
                account_role: newRole,
                _token: $('meta[name="csrf-token"]').attr('content'),
                _method: 'PATCH'
            },
            success: (response) => {
                if (response.success) {
                    this.showAlert(response.message || 'User role changed successfully', 'success');
                    if (callbacks.onSuccess) {
                        callbacks.onSuccess(response);
                    }
                } else {
                    this.showAlert(response.message || 'Failed to change user role', 'error');
                }
            },
            error: (xhr) => {
                let errorMessage = 'An error occurred while changing user role';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                this.showAlert(errorMessage, 'error');
            }
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

    /**
     * 刪除用戶
     * @param {number} userId 用戶ID
     */
    deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return;

        fetch(window.deleteUserUrl.replace(':id', userId), {
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
                this.showAlert(data.message || 'User deleted successfully', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchUsers(1);
                } else {
                    // 重新載入當前頁面的用戶列表
                    this.fetchUsers(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to delete user', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to delete user', 'error');
        });
    }

    /**
     * 激活用戶
     * @param {number} userId 用戶ID
     */
    setUserAvailable(userId) {
        // 檢查是否是更新自己（雖然激活自己通常沒問題，但保持一致性）
        if (window.currentUserId && parseInt(userId) === parseInt(window.currentUserId)) {
            this.showAlert('You cannot change your own account status', 'warning');
            return;
        }

        if (!confirm('Are you sure you want to activate this user?')) return;

        fetch(window.availableUserUrl.replace(':id', userId), {
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
                this.showAlert(data.message || 'User has been set to available status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchUsers(1);
                } else {
                    // 重新載入當前頁面的用戶列表
                    this.fetchUsers(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set user available', 'error');
            }
        })
        .catch(error => {
            // 檢查是否是 403 錯誤（嘗試修改自己）
            if (error.message.includes('403') && error.message.includes('cannot set yourself')) {
                this.showAlert('You cannot change your own account status', 'warning');
            } else {
                this.showAlert('Failed to set user available', 'error');
            }
        });
    }

    /**
     * 停用用戶
     * @param {number} userId 用戶ID
     */
    setUserUnavailable(userId) {
        // 檢查是否是更新自己
        if (window.currentUserId && parseInt(userId) === parseInt(window.currentUserId)) {
            this.showAlert('You cannot set yourself to unavailable status', 'warning');
            return;
        }

        if (!confirm('Are you sure you want to deactivate this user?')) return;

        fetch(window.unavailableUserUrl.replace(':id', userId), {
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
                this.showAlert(data.message || 'User has been set to unavailable status', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#table-body tr').not(':has(.text-center)').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchUsers(1);
                } else {
                    // 重新載入當前頁面的用戶列表
                    this.fetchUsers(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to set user unavailable', 'error');
            }
        })
        .catch(error => {
            // 檢查是否是 403 錯誤（嘗試修改自己）
            if (error.message.includes('403') && error.message.includes('cannot set yourself')) {
                this.showAlert('You cannot set yourself to unavailable status', 'warning');
            } else {
                this.showAlert('Failed to set user unavailable', 'error');
            }
        });
    }
}

// =============================================================================
// Register 頁面功能 (Register Page Functions)
// =============================================================================

/**
 * 初始化用戶註冊頁面的圖片處理
 */
function initializeUserRegistrationImageHandling() {
    // 使用 image-system.js 的用戶圖片處理邏輯
    bindUserImageEvents();
}

/**
 * 初始化用戶註冊頁面的角色選擇
 */
function initializeUserRegistrationRoleSelection() {
    // 使用統一的角色系統
    if (typeof window.initializeRoleCardSelection === 'function') {
        window.initializeRoleCardSelection('account_role');
    } else {
        // 備用實現
        const roleCards = document.querySelectorAll('.role-card');
        roleCards.forEach(card => {
            card.addEventListener('click', function() {
                // 移除所有選中狀態
                roleCards.forEach(c => c.classList.remove('selected'));
                // 添加選中狀態
                this.classList.add('selected');
                // 選中對應的單選按鈕
                this.querySelector('input[type="radio"]').checked = true;
            });
        });
    }
}

/**
 * 初始化用戶註冊頁面的表單提交
 */
function initializeUserRegistrationFormSubmit() {
    // 表單提交處理
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 基本驗證
            const username = document.getElementById('username').value.trim();
            const firstName = document.getElementById('first_name').value.trim();
            const lastName = document.getElementById('last_name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const passwordConfirmation = document.getElementById('password_confirmation').value;

            if (!username || !firstName || !lastName || !email || !password || !passwordConfirmation) {
                showAlert('Please fill in all required fields', 'warning');
                return;
            }

            if (password !== passwordConfirmation) {
                showAlert('Passwords do not match', 'warning');
                return;
            }

            if (password.length < 6) {
                showAlert('Password must be at least 6 characters long', 'warning');
                return;
            }

            // 提交表單
            const formData = new FormData(this);

            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert(data.message || 'User created successfully', 'success');
                    setTimeout(() => {
                        window.location.href = window.userManagementRoute;
                    }, 2000);
                } else {
                    showAlert(data.message || 'Failed to create user', 'error');
                }
            })
            .catch(error => {
                showAlert('An error occurred while creating the user', 'error');
            });
        });
    }
}

/**
 * 初始化用戶註冊頁面
 */
function initializeUserRegistration() {
    initializeUserRegistrationImageHandling();
    initializeUserRegistrationRoleSelection();
    initializeUserRegistrationFormSubmit();
}

// =============================================================================
// Create 頁面功能 (Create Page Functions)
// =============================================================================

/**
 * 添加單個用戶
 */
function addUser() {
    const firstNameInput = document.getElementById('first_name');
    const lastNameInput = document.getElementById('last_name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password_confirmation');

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();

    // 驗證輸入
    if (!firstName) {
        showAlert('Please enter first name', 'warning');
        firstNameInput.focus();
        return;
    }

    if (!lastName) {
        showAlert('Please enter last name', 'warning');
        lastNameInput.focus();
        return;
    }

    if (!email) {
        showAlert('Please enter an email address', 'warning');
        emailInput.focus();
        return;
    }

    if (!password) {
        showAlert('Please enter a password', 'warning');
        passwordInput.focus();
        return;
    }

    if (!passwordConfirm) {
        showAlert('Please confirm the password', 'warning');
        passwordConfirmInput.focus();
        return;
    }

    if (password !== passwordConfirm) {
        showAlert('Passwords do not match', 'danger');
        passwordConfirmInput.focus();
        return;
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'warning');
        passwordInput.focus();
        return;
    }

    // 提交單個用戶
    submitSingleUser({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password
    });
}

/**
 * 提交單個用戶
 * @param {Object} userData 用戶數據
 */
function submitSingleUser(userData) {
    // 準備表單數據
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 獲取選中的角色
    const selectedRole = document.querySelector('input[name="account_role"]:checked');

    // 添加用戶數據
    formData.append('first_name', userData.first_name);
    formData.append('last_name', userData.last_name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('account_role', selectedRole ? selectedRole.value : 'Staff');

    // 顯示加載狀態
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Creating...';
    submitBtn.disabled = true;

    // 提交數據
    fetch(window.createUserUrl, {
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
            showAlert(data.message || 'User created successfully', 'success');

            // 清空表單
            clearForm();

            // 延遲重定向到dashboard
            setTimeout(() => {
                window.location.href = window.userManagementRoute || '/admin/users';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to create user', 'error');
        }
    })
    .catch(error => {
        if (error.message.includes('already been taken') || error.message.includes('email')) {
            showAlert('This email already exists. Please choose a different email.', 'warning');
        } else {
            showAlert('Failed to create user', 'error');
        }
    })
    .finally(() => {
        // 恢復按鈕狀態
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

/**
 * 清空表單
 */
function clearForm() {
    const firstNameInput = document.getElementById('first_name');
    const lastNameInput = document.getElementById('last_name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password_confirmation');

    if (firstNameInput) firstNameInput.value = '';
    if (lastNameInput) lastNameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (passwordConfirmInput) passwordConfirmInput.value = '';
}

// =============================================================================
// Update 頁面功能 (Update Page Functions)
// =============================================================================

/**
 * 初始化用戶更新頁面的表單提交
 */
function initializeUserUpdateFormSubmit() {
    // 表單提交處理
    const updateForm = document.getElementById('updateUserForm');
    if (updateForm) {
        updateForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 基本驗證
            const username = document.getElementById('username').value.trim();
            const firstName = document.getElementById('first_name').value.trim();
            const lastName = document.getElementById('last_name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const passwordConfirmation = document.getElementById('password_confirmation').value;

            if (!username || !firstName || !lastName || !email) {
                showAlert('Please fill in all required fields', 'warning');
                return;
            }

            // 如果提供了密码，验证密码匹配
            if (password && passwordConfirmation) {
                if (password !== passwordConfirmation) {
                    showAlert('Passwords do not match', 'warning');
                    return;
                }
                if (password.length < 6) {
                    showAlert('Password must be at least 6 characters long', 'warning');
                    return;
                }
            }

            // 提交表單
            const formData = new FormData(this);

            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert(data.message || 'User updated successfully', 'success');
                    setTimeout(() => {
                        window.location.href = window.updateUserRedirect;
                    }, 2000);
                } else {
                    showAlert(data.message || 'Failed to update user', 'error');
                }
            })
            .catch(error => {
                showAlert('An error occurred while updating the user', 'error');
            });
        });
    }
}

/**
 * 綁定狀態選擇事件
 */
function bindStatusSelectionEvents() {
    // 使用統一的狀態系統
    if (typeof window.initializeStatusCardSelection === 'function') {
        window.initializeStatusCardSelection('account_status');
    } else {
        // 備用實現
        $('.status-card').on('click', function() {
            $('.status-card').removeClass('selected');
            $(this).addClass('selected');
            $(this).find('input[type="radio"]').prop('checked', true);
        });

        $('input[name="account_status"]').on('change', function() {
            $('.status-card').removeClass('selected');
            const statusCard = $(this).closest('.status-card');
            statusCard.addClass('selected');
        });
    }
}

/**
 * 綁定角色選擇事件
 */
function bindRoleSelectionEvents() {
    // 使用統一的角色系統
    if (typeof window.initializeRoleCardSelection === 'function') {
        window.initializeRoleCardSelection('account_role');
    } else {
        // 備用實現
        $('.role-card').on('click', function() {
            // 移除所有卡片的選中狀態
            $('.role-card').removeClass('selected');

            // 添加當前卡片的選中狀態
            $(this).addClass('selected');

            // 選中對應的單選按鈕
            $(this).find('input[type="radio"]').prop('checked', true);
        });

        // 為單選按鈕添加變化事件
        $('input[name="account_role"]').on('change', function() {
            // 移除所有卡片的選中狀態
            $('.role-card').removeClass('selected');

            // 添加對應卡片的選中狀態
            const roleCard = $(this).closest('.role-card');
            roleCard.addClass('selected');
        });
    }
}

/**
 * 初始化用戶更新頁面
 */
function initializeUserUpdate() {
    bindUserImageEvents();
    initializeUserUpdateFormSubmit();
    bindStatusSelectionEvents();
    bindRoleSelectionEvents();
}

// =============================================================================
// Login 頁面功能 (Login Page Functions)
// =============================================================================

/**
 * 密碼顯示切換
 */
function togglePassword() {
    const password = document.getElementById('password');
    const toggle = document.getElementById('togglePassword');

    if (password.type === 'password') {
        password.type = 'text';
        toggle.classList.replace('bi-eye-slash', 'bi-eye');
    } else {
        password.type = 'password';
        toggle.classList.replace('bi-eye', 'bi-eye-slash');
    }
}

/**
 * 確認密碼顯示切換
 */
function togglePasswordConfirmation() {
    const passwordField = document.getElementById('password_confirmation');
    const toggleIcon = document.getElementById('togglePasswordConfirmation');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.remove('bi-eye-slash');
        toggleIcon.classList.add('bi-eye');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.remove('bi-eye');
        toggleIcon.classList.add('bi-eye-slash');
    }
}

/**
 * 初始化登錄頁面表單提交加載狀態
 */
function initializeLoginFormSubmit() {
    const loginForm = document.querySelector('form');
    const loginBtn = document.getElementById('loginBtn');

    if (loginForm && loginBtn) {
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoading = loginBtn.querySelector('.btn-loading');

        loginForm.addEventListener('submit', function() {
            // 显示加载状态
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
            loginBtn.disabled = true;

            // 模拟加载时间（实际项目中会由服务器响应控制）
            setTimeout(() => {
                btnText.classList.remove('d-none');
                btnLoading.classList.add('d-none');
                loginBtn.disabled = false;
            }, 2000);
        });
    }
}

/**
 * 初始化密碼重置頁面表單提交加載狀態
 */
function initializeResetFormSubmit() {
    const resetForm = document.querySelector('form');
    const resetBtn = document.getElementById('resetBtn');

    if (resetForm && resetBtn) {
        const btnText = resetBtn.querySelector('.btn-text');
        const btnLoading = resetBtn.querySelector('.btn-loading');

        resetForm.addEventListener('submit', function() {
            // 显示加载状态
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
            resetBtn.disabled = true;

            // 模拟加载时间（实际项目中会由服务器响应控制）
            setTimeout(() => {
                btnText.classList.remove('d-none');
                btnLoading.classList.add('d-none');
                resetBtn.disabled = false;
            }, 2000);
        });
    }
}

/**
 * 初始化郵箱驗證頁面表單提交加載狀態
 */
function initializeVerifyFormSubmit() {
    const verifyForm = document.querySelector('form');
    const verifyBtn = document.getElementById('verifyBtn');

    if (verifyForm && verifyBtn) {
        const btnText = verifyBtn.querySelector('.btn-text');
        const btnLoading = verifyBtn.querySelector('.btn-loading');

        verifyForm.addEventListener('submit', function() {
            // 显示加载状态
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
            verifyBtn.disabled = true;

            // 模拟加载时间（实际项目中会由服务器响应控制）
            setTimeout(() => {
                btnText.classList.remove('d-none');
                btnLoading.classList.add('d-none');
                verifyBtn.disabled = false;
            }, 2000);
        });
    }
}

/**
 * 初始化登錄頁面
 */
function initializeLoginPage() {
    // 檢查 Bootstrap Icons 是否加載
    if (document.fonts) {
        document.fonts.ready.then(function() {
            console.log('Fonts loaded');
            // 檢查 Bootstrap Icons 字體
            if (document.fonts.check('1em "bootstrap-icons"')) {
                console.log('Bootstrap Icons font is available');
            } else {
                console.log('Bootstrap Icons font is NOT available');
            }
        });
    }

    // 延遲檢查圖標是否顯示
    setTimeout(function() {
        const icon = document.querySelector('.bi-box');
        if (icon) {
            const computedStyle = window.getComputedStyle(icon);
            if (computedStyle.fontFamily.indexOf('bootstrap-icons') === -1) {
                console.log('Bootstrap Icons not loaded');
            }
        }
    }, 2000);

    // 表單驗證
    (function() {
        'use strict';
        window.addEventListener('load', function() {
            var forms = document.getElementsByClassName('needs-validation');
            var validation = Array.prototype.filter.call(forms, function(form) {
                form.addEventListener('submit', function(event) {
                    if (form.checkValidity() === false) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    form.classList.add('was-validated');
                }, false);
            });
        }, false);
    })();

    // 輸入框動畫效果
    document.querySelectorAll('.form-control').forEach(input => {
        // 焦點效果
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });

        // 實時驗證
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            } else if (this.value) {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            }
        });
    });

    // 登錄按鈕波紋效果
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    // 添加波紋動畫CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // 自動關閉警告
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // 頁面加載動畫
    window.addEventListener('load', function() {
        const container = document.querySelector('.main-container');
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(30px)';

            setTimeout(() => {
                container.style.transition = 'all 0.6s ease';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 100);
        }
    });

    // 鍵盤快捷鍵
    document.addEventListener('keydown', function(e) {
        // Enter鍵提交表單
        if (e.key === 'Enter' && !e.shiftKey) {
            const form = document.querySelector('form');
            if (form) {
                form.requestSubmit();
            }
        }
    });

    // 輸入框自動聚焦
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }

    // 初始化表單提交加載狀態
    initializeLoginFormSubmit();
}

// =============================================================================
// 全局實例初始化 (Global Instance Initialization)
// =============================================================================

let authDashboard;

$(document).ready(function() {
    // 檢查當前頁面是否是dashboard頁面（有table-body元素）
    if ($("#table-body").length > 0) {
        authDashboard = new AuthDashboard();
    }
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

// 導出主要函數到全局作用域
window.addUser = addUser;
window.clearForm = clearForm;
window.initializeUserRegistration = initializeUserRegistration;
window.initializeUserUpdate = initializeUserUpdate;
window.bindStatusSelectionEvents = bindStatusSelectionEvents;
window.bindRoleSelectionEvents = bindRoleSelectionEvents;

// Login 頁面函數
window.togglePassword = togglePassword;
window.togglePasswordConfirmation = togglePasswordConfirmation;
window.initializeLoginPage = initializeLoginPage;
window.initializeLoginFormSubmit = initializeLoginFormSubmit;
window.initializeResetFormSubmit = initializeResetFormSubmit;
window.initializeVerifyFormSubmit = initializeVerifyFormSubmit;

// Dashboard 相關函數
window.deleteUser = (userId) => authDashboard.deleteUser(userId);
window.setUserAvailable = (userId) => authDashboard.setUserAvailable(userId);
window.setUserUnavailable = (userId) => authDashboard.setUserUnavailable(userId);
