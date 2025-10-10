/**
 * Auth Management JavaScript
 * 用戶管理統一交互邏輯
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

// 用戶列表數組（用於 Create 頁面）
let userList = [];

// 排序狀態：true = 升序，false = 降序
let isAscending = false; // 默認降序（最新的在上面）

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
        $('#results-count').text(`${count} results`);
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
                ? `<button class="btn-action available" title="Activate Account" onclick="setUserAvailable(${user.id})">
                       <i class="bi bi-check-circle"></i>
                   </button>`
                : `<button class="btn-action unavailable" title="Deactivate Account" onclick="setUserUnavailable(${user.id})">
                       <i class="bi bi-slash-circle"></i>
                   </button>`;

            actionButtons = `
                <button class="btn-action" title="Edit" onclick="authDashboard.editUser(${user.id})">
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
                <button class="btn-action" title="Edit" onclick="authDashboard.editUser(${user.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <div class="btn-group dropend d-inline">
                    <button class="btn-action dropdown-toggle" title="More" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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

        return `
            <tr>
                <td class="ps-4"><span class="text-muted">#${user.id}</span></td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar"><i class="bi bi-person"></i></div>
                        <span class="fw-medium">${user.name.toUpperCase()}</span>
                    </div>
                </td>
                <td><span class="text-muted">${user.email}</span></td>
                <td><span class="role-badge ${this.getRoleClass(user.role)}">${user.role.toUpperCase()}</span></td>
                <td><span class="status-badge ${this.getStatusClass(user.status)}">${user.status}</span></td>
                <td class="text-end pe-4"><div class="action-buttons">${actionButtons}</div></td>
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
                <td colspan="6" class="text-center py-4">
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
        changeUserRole(userId, selectedRole, {
            onSuccess: () => {
                // 關閉模態框
                $('#roleChangeModal').modal('hide');
                // 重新加載數據
                this.loadStats();
                this.fetchUsers(this.currentPage);
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
// Create 頁面功能 (Create Page Functions)
// =============================================================================

/**
 * 添加用戶到數組
 * @param {string} name 用戶名稱
 * @param {string} email 郵箱
 * @param {string} password 密碼
 */
function addUserToArray(name, email, password) {
    // 添加用戶到數組
    const userData = {
        name: name,
        email: email,
        password: password
    };

    userList.push(userData);

    // 更新UI
    updateUserList();
    updateUI();

    // 顯示右邊的用戶表格
    showUserValuesArea();

    // 清空輸入框
    const nameInput = document.getElementById('user_name');
    const emailInput = document.getElementById('user_email');
    const passwordInput = document.getElementById('user_password');
    const passwordConfirmInput = document.getElementById('user_password_confirmation');

    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (passwordConfirmInput) passwordConfirmInput.value = '';
}

/**
 * 檢查郵箱是否已存在（簡化版本，用於當前頁面）
 * @param {string} email 郵箱
 * @returns {boolean} 是否存在
 */
function isUserExists(email) {
    return userList.some(item => item.email.toLowerCase() === email.toLowerCase());
}

/**
 * 添加用戶
 */
function addUser() {
    const nameInput = document.getElementById('user_name');
    const emailInput = document.getElementById('user_email');
    const passwordInput = document.getElementById('user_password');
    const passwordConfirmInput = document.getElementById('user_password_confirmation');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const passwordConfirm = passwordConfirmInput.value.trim();

    // 驗證輸入
    if (!name) {
        showAlert('Please enter a user name', 'warning');
        nameInput.focus();
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

    // 檢查是否已存在
    if (isUserExists(email)) {
        showAlert(`Email "${email}" already exists in the list`, 'warning');
        highlightExistingUser(email);
        emailInput.focus();
        return;
    }

    // 添加到用戶數組
    addUserToArray(name, email, password);

    // 顯示成功提示
    showAlert('User added successfully', 'success');
}

/**
 * 移除用戶
 * @param {number} index 索引
 */
function removeUser(index) {
    console.log('Removing user at index:', index);
    console.log('User list before removal:', userList);

    // 確認機制
    if (!confirm('Are you sure you want to remove this user?')) {
        return;
    }

    if (index >= 0 && index < userList.length) {
        userList.splice(index, 1);
        console.log('User list after removal:', userList);
        updateUserList();
        updateUI();

        // 顯示成功移除的 alert
        showAlert('User removed successfully', 'success');
    } else {
        console.error('Invalid index:', index);
        showAlert('Failed to remove user', 'error');
    }
}

/**
 * 更新用戶列表
 */
function updateUserList() {
    const container = document.getElementById('userValuesList');
    if (!container) return;

    container.innerHTML = '';

    userList.forEach((item, index) => {
        const userItem = document.createElement('div');

        // 檢查是否為重複項
        const isDuplicate = isUserExists(item.email) &&
            userList.filter(i => i.email.toLowerCase() === item.email.toLowerCase()).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
        const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

        userItem.className = `${baseClasses} ${duplicateClasses}`;

        userItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                <div class="me-2" style="width: 32px; height: 32px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <i class="bi bi-person text-muted"></i>
                </div>
                <div class="d-flex flex-column">
                    <span class="item-value-text fw-medium">${item.name}</span>
                    <small class="text-muted">${item.email}</small>
                </div>
                ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;
        container.appendChild(userItem);
    });
}

/**
 * 高亮顯示列表中已存在的用戶郵箱
 * @param {string} email 用戶郵箱
 */
function highlightExistingUser(email) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const emailElement = item.querySelector('small.text-muted');

        if (emailElement) {
            const emailText = emailElement.textContent.trim().toLowerCase();

            if (emailText === email.toLowerCase()) {
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
}

/**
 * 顯示用戶值區域
 */
function showUserValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 顯示用戶值區域
    const userValuesArea = document.getElementById('userValuesArea');
    if (userValuesArea) {
        userValuesArea.style.display = 'block';
    }

    // 顯示角色選擇區域
    const roleSelection = document.getElementById('roleSelection');
    if (roleSelection) {
        roleSelection.style.display = 'block';
    }

    // 更新用戶名稱顯示
    updateUserNameDisplay();

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
    // 隱藏用戶值區域
    const userValuesArea = document.getElementById('userValuesArea');
    if (userValuesArea) {
        userValuesArea.style.display = 'none';
    }

    // 隱藏角色選擇區域
    const roleSelection = document.getElementById('roleSelection');
    if (roleSelection) {
        roleSelection.style.display = 'none';
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
    if (userList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 確認清除
    if (!confirm('Are you sure you want to clear all users?')) {
        return;
    }

    // 清空數組
    userList = [];

    // 清空輸入框
    const nameInput = document.getElementById('user_name');
    const emailInput = document.getElementById('user_email');
    const passwordInput = document.getElementById('user_password');
    const passwordConfirmInput = document.getElementById('user_password_confirmation');

    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (passwordConfirmInput) passwordConfirmInput.value = '';

    // 更新UI
    updateUserList();
    updateUI();

    // 顯示成功提示
    showAlert('All users cleared successfully', 'success');

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
    // 更新用戶值計數
    updateUserValuesCount();

    // 更新用戶範圍顯示
    updateUserRangeDisplay();

    // 更新用戶名稱顯示
    updateUserNameDisplay();

    // 更新配置摘要
    updateConfigSummary();

    // 如果沒有用戶，隱藏所有區域並顯示初始狀態
    if (userList.length === 0) {
        hideAllAreas();
    }
}

/**
 * 更新用戶值計數
 */
function updateUserValuesCount() {
    const count = userList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('userValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} users`;
    }
}

function updateConfigSummary() {
    // 更新用戶範圍顯示
    updateUserRangeDisplay();

    // 顯示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (configSummary) {
        configSummary.style.display = 'block';
    }
}

function updateUserNameDisplay() {
    const userNameSpan = document.getElementById('selectedUsers');
    if (userNameSpan) {
        if (userList.length > 0) {
            // 顯示用戶數量
            userNameSpan.textContent = `${userList.length} users`;
        } else {
            userNameSpan.textContent = '';
        }
    }
}

function updateUserRangeDisplay() {
    const userNames = userList.map(item => item.name);

    const selectedUserSpan = document.getElementById('selectedUsers');
    if (selectedUserSpan) {
        if (userNames.length === 0) {
            selectedUserSpan.textContent = 'None';
        } else if (userNames.length === 1) {
            selectedUserSpan.textContent = userNames[0];
        } else {
            // 按字母順序排序
            const sortedNames = userNames.sort();
            const minUser = sortedNames[0];
            const maxUser = sortedNames[sortedNames.length - 1];
            selectedUserSpan.textContent = `${minUser} - ${maxUser}`;
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
    const sortBtn = document.getElementById('sortUsers');

    // 更新圖標
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortUserValuesList();
}

/**
 * 排序用戶值列表
 */
function sortUserValuesList() {
    const userValuesList = document.getElementById('userValuesList');
    const items = Array.from(userValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取用戶名稱並排序
    const userValues = items.map(item => ({
        element: item,
        value: item.querySelector('.item-value-text').textContent.trim()
    }));

    // 按字母順序排序
    userValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    userValues.forEach(({ element }) => {
        userValuesList.appendChild(element);
    });
}

// =============================================================================
// 批量添加功能 (Batch Add Functions)
// =============================================================================

/**
 * 添加常用用戶
 */
function addCommonUsers() {
    // Common users
    const commonUsers = [
        { name: 'John Smith', email: 'john.smith@company.com', password: 'password123' },
        { name: 'Jane Doe', email: 'jane.doe@company.com', password: 'password123' },
        { name: 'Mike Johnson', email: 'mike.johnson@company.com', password: 'password123' }
    ];

    addMultipleUsers(commonUsers);
}

/**
 * 添加管理員用戶
 */
function addAdminUsers() {
    // Admin users
    const adminUsers = [
        { name: 'Admin User', email: 'admin@company.com', password: 'admin123' },
        { name: 'Manager User', email: 'manager@company.com', password: 'admin123' }
    ];

    addMultipleUsers(adminUsers);
}

/**
 * 添加多個用戶
 * @param {Array} users 用戶數組
 */
function addMultipleUsers(users) {
    let addedCount = 0;
    let skippedCount = 0;

    users.forEach(user => {
        if (!isUserExists(user.email)) {
            addUserToList(user.name, user.email, user.password);
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 顯示結果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} users`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} users, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All users already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加用戶，顯示右邊的表格
    if (addedCount > 0) {
        showUserValuesArea();
    }
}

/**
 * 添加用戶到列表
 * @param {string} name 用戶名稱
 * @param {string} email 郵箱
 * @param {string} password 密碼
 */
function addUserToList(name, email, password) {
    // 檢查是否為重複項
    if (isUserExists(email)) {
        console.log('Duplicate detected in batch add, skipping:', email);
        return; // 跳過重複項，不添加到列表
    }

    // 添加到 userList 數組
    userList.push({
        name: name,
        email: email,
        password: password
    });

    // 重新渲染整個列表
    updateUserList();
    updateUI();

    // 顯示用戶值區域
    showUserValuesArea();
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
            showAlert(data.message || 'User updated successfully', 'success');

            // 延遲重定向到列表頁面
            setTimeout(() => {
                window.location.href = window.userManagementRoute || '/admin/users';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to update user', 'error');
        }
    })
    .catch(error => {
        if (error.message.includes('already been taken') || error.message.includes('email')) {
            showAlert('This email already exists. Please choose a different email.', 'warning');
        } else {
            showAlert('Failed to update user', 'error');
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
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');

    // 驗證用戶名稱
    if (!nameInput.value.trim()) {
        showAlert('Please enter user name', 'warning');
        nameInput.focus();
        return false;
    }

    // 驗證郵箱
    if (!emailInput.value.trim()) {
        showAlert('Please enter email address', 'warning');
        emailInput.focus();
        return false;
    }

    // 驗證密碼匹配（如果提供了密碼）
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password_confirmation');

    if (passwordInput.value && passwordConfirmInput.value) {
        if (passwordInput.value !== passwordConfirmInput.value) {
            showAlert('Passwords do not match', 'warning');
            passwordConfirmInput.focus();
            return false;
        }
    }

    return true;
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
// 表單驗證和提交 (Form Validation & Submission)
// =============================================================================

/**
 * 驗證用戶數據
 * @returns {boolean} 驗證結果
 */
function validateUserData() {
    // 檢查是否有重複的郵箱
    const duplicates = [];
    const seen = new Set();
    for (const item of userList) {
        const combination = item.email.toLowerCase();
        if (seen.has(combination)) {
            duplicates.push(item.email);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        showAlert('Duplicate emails found. Please remove duplicates before submitting.', 'error');
        return false;
    }

    return true;
}

/**
 * 提交用戶表單
 */
function submitUserForm() {
    // 調試信息：檢查要提交的數據
    console.log('Submitting user data:', userList);

    // 準備提交數據
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 獲取選中的角色（狀態由 controller 默認設置為 Available）
    const selectedRole = document.querySelector('input[name="account_role"]:checked');

    // 添加用戶數據
    userList.forEach((item, index) => {
        // 調試信息：檢查每個用戶的狀態
        console.log(`User ${index + 1}:`, { name: item.name, email: item.email });

        // 添加用戶文本數據
        formData.append(`users[${index}][name]`, item.name);
        formData.append(`users[${index}][email]`, item.email);
        formData.append(`users[${index}][password]`, item.password);
        formData.append(`users[${index}][account_role]`, selectedRole ? selectedRole.value : 'Staff');
        // 狀態由 controller 默認設置為 Available，不需要傳遞
    });

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
            showAlert(data.message || 'Users created successfully', 'success');

            // 延遲重定向到dashboard，讓用戶看到成功消息
            setTimeout(() => {
                window.location.href = window.userManagementRoute || '/admin/users';
            }, 2000);
        } else {
            // 简化错误信息，类似 mapping 页面
            if (data.message && data.message.includes('Some users failed to create')) {
                showAlert('Some users failed to create', 'error');
            } else {
                showAlert(data.message || 'Failed to create users', 'error');
            }
        }
    })
    .catch(error => {
        // 简化错误信息
        showAlert('Some users failed to create', 'error');
    });
}

// =============================================================================
// 頁面初始化功能 (Page Initialization Functions)
// =============================================================================

/**
 * 綁定用戶事件
 */
function bindUserEvents() {
    // Create 頁面事件綁定
    bindUserCreateEvents();

    // 表單提交事件監聽器
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 檢查是否有用戶
            if (userList.length === 0) {
                showAlert('Please add at least one user', 'warning');
                return;
            }

            // 驗證所有用戶數據
            if (!validateUserData()) {
                return;
            }

            // 提交表單
            submitUserForm();
        });
    }
}

/**
 * 綁定用戶創建頁面事件
 */
function bindUserCreateEvents() {
    // 用戶名稱輸入框回車事件
    const userNameInput = document.getElementById('user_name');
    if (userNameInput) {
        userNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addUser();
            }
        });
    }

    // 添加用戶按鈕
    const addUserBtn = document.getElementById('addUser');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', addUser);
    }

    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：刪除用戶按鈕
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            removeUser(index);
        }
    });

    // 排序按鈕
    const sortBtn = document.getElementById('sortUsers');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 快速添加按鈕
    const addCommonUsersBtn = document.getElementById('addCommonUsers');
    if (addCommonUsersBtn) {
        addCommonUsersBtn.addEventListener('click', addCommonUsers);
    }

    const addAdminUsersBtn = document.getElementById('addAdminUsers');
    if (addAdminUsersBtn) {
        addAdminUsersBtn.addEventListener('click', addAdminUsers);
    }

    // 角色選擇卡片事件綁定
    bindRoleCardEvents();
}

/**
 * 綁定角色選擇卡片事件
 */
function bindRoleCardEvents() {
    // 角色卡片點擊事件
    document.addEventListener('click', function(e) {
        const roleCard = e.target.closest('.role-card');
        if (roleCard) {
            selectRoleCard(roleCard);
        }
    });

    // 單選按鈕變化事件
    document.addEventListener('change', function(e) {
        if (e.target.name === 'account_role') {
            const card = e.target.closest('.role-card');
            if (card) {
                selectRoleCard(card);
            }
        }
    });
}

/**
 * 選擇角色卡片
 * @param {HTMLElement} card 角色卡片元素
 */
function selectRoleCard(card) {
    // 移除所有卡片的選中狀態
    const allCards = document.querySelectorAll('.role-card');
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
 * 初始化用戶更新頁面
 */
function initializeUserUpdate() {
    bindUserEvents();
}

/**
 * 初始化用戶頁面
 * @param {Object} config 配置對象
 */
function initializeUserPage(config) {
    bindUserEvents();

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

let authDashboard;

$(document).ready(function() {
    // 檢查當前頁面是否是dashboard頁面（有table-body元素）
    if ($("#table-body").length > 0) {
        authDashboard = new AuthDashboard();
    }
});

// =============================================================================
// DOM 內容加載完成後的事件綁定 (DOM Content Loaded Event Binding)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // 初始化用戶事件
    bindUserEvents();

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
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

// 導出主要函數到全局作用域
window.addUser = addUser;
window.removeUser = removeUser;
window.clearForm = clearForm;
window.addCommonUsers = addCommonUsers;
window.addAdminUsers = addAdminUsers;
window.toggleSortOrder = toggleSortOrder;
window.handleUpdateFormSubmit = handleUpdateFormSubmit;
window.initializeUpdateStatusCards = initializeUpdateStatusCards;
window.selectUpdateStatusCard = selectUpdateStatusCard;

// Dashboard 相關函數
window.deleteUser = (userId) => authDashboard.deleteUser(userId);
window.setUserAvailable = (userId) => authDashboard.setUserAvailable(userId);
window.setUserUnavailable = (userId) => authDashboard.setUserUnavailable(userId);
