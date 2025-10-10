/**
 * 用戶管理儀表板 JavaScript
 *
 * 功能模塊：
 * - 用戶數據管理：搜索、篩選、分頁
 * - 用戶操作：編輯、刪除、狀態管理、角色更改
 * - 統計數據：動態加載和更新統計信息
 * - 事件處理：表單提交、模態框管理
 *
 * @author WMS Team
 * @version 2.0.0 - JSON API Integration with Common Functions
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
                showAlert(errorMessage, 'danger');
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
            showAlert('You do not have permission to edit users', 'warning');
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
        if (!window.changeRoleUrl) {
            showAlert('You do not have permission to change user roles', 'warning');
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
            showAlert('Please select a role', 'warning');
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
}

// ====== 初始化全局實例 ======
let authDashboard;
$(document).ready(function() {
    authDashboard = new AuthDashboard();
    // 設置全局變量以便其他腳本可以訪問
    window.authDashboard = authDashboard;
});
