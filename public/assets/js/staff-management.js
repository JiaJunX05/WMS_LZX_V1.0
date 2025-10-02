/**
 * 员工管理系统 JavaScript 类
 *
 * 功能模块：
 * - 用户数据管理：搜索、筛选、分页
 * - 用户操作：编辑、删除、状态管理、角色更改
 * - 事件处理：表单提交、模态框管理
 *
 * @author WMS Team
 * @version 1.0.0
 */
class StaffManagement {
    constructor() {
        // 状态管理
        this.currentPage = 1;
        this.searchTerm = '';
        this.roleFilter = '';
        this.statusFilter = '';

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模块 (Initialization Module)
    // =============================================================================
    init() {
        this.bindEvents();
        this.fetchUsers();
    }

    // =============================================================================
    // 事件绑定模块 (Event Binding Module)
    // =============================================================================
    bindEvents() {
        // 搜索功能
        $('#search-input').on('keyup', (e) => {
            this.searchTerm = $(e.target).val();
            this.handleSearch();
        });

        // 筛选功能
        $('#role-filter').on('change', (e) => {
            this.roleFilter = $(e.target).val();
            this.handleFilter();
        });

        $('#status-filter').on('change', (e) => {
            this.statusFilter = $(e.target).val();
            this.handleFilter();
        });

        // 分页功能
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

        // Bootstrap dropdown 自动处理，无需自定义定位
    }

    // =============================================================================
    // 数据请求模块 (Data Request Module)
    // =============================================================================

    /**
     * 获取搜索参数
     * @param {number} page 页码
     * @returns {Object} 搜索参数对象
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
     * 获取用户数据
     * @param {number} page 页码
     */
    fetchUsers(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.staffManagementRoute;

        $.get(apiRoute, params)
            .done((response) => {
                if (response.data && response.data.length > 0) {
                    this.renderUsers(response.data);
                    this.updatePaginationInfo(response);
                } else {
                    this.showNoResults();
                }
                this.generatePagination(response);
            })
                .fail(() => this.showAlert('Failed to load users, please try again', 'danger'));
    }

    /**
     * 处理搜索
     */
    handleSearch() {
        this.fetchUsers(1);
    }

    /**
     * 处理筛选
     */
    handleFilter() {
        this.fetchUsers(1);
    }

    // =============================================================================
    // 渲染模块 (Rendering Module)
    // =============================================================================

    /**
     * 渲染用户列表
     * @param {Array} users 用户数据数组
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
                ? `<button class="btn-action available" title="Activate Account" onclick="staffManagement.setAvailable(${user.id})">
                       <i class="bi bi-check-circle"></i>
                   </button>`
                : `<button class="btn-action unavailable" title="Deactivate Account" onclick="staffManagement.setUnavailable(${user.id})">
                       <i class="bi bi-slash-circle"></i>
                   </button>`;

            actionButtons = `
                <button class="btn-action" title="Edit" onclick="staffManagement.editUser(${user.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                ${statusButton}
            `;
        }

        if (currentUserRole && currentUserRole.replace(/[_\s]/g, '').toLowerCase() === 'superadmin') {
            const statusMenuItem = user.status === 'Unavailable'
                ? `<a class="dropdown-item" href="javascript:void(0)" onclick="staffManagement.setAvailable(${user.id})">
                       <i class="bi bi-check-circle me-2"></i> Activate Account
                   </a>`
                : `<a class="dropdown-item" href="javascript:void(0)" onclick="staffManagement.setUnavailable(${user.id})">
                       <i class="bi bi-slash-circle me-2"></i> Deactivate Account
                   </a>`;

            actionButtons = `
                <button class="btn-action" title="Edit" onclick="staffManagement.editUser(${user.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <div class="btn-group dropend d-inline">
                    <button class="btn-action dropdown-toggle" title="More" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <a class="dropdown-item" href="javascript:void(0)" onclick="staffManagement.changeRole(${user.id})">
                                <i class="bi bi-arrow-repeat me-2"></i> Change Role
                            </a>
                        </li>
                        <li>
                            ${statusMenuItem}
                        </li>
                        <li>
                            <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="staffManagement.deleteUser(${user.id})">
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

    // ====== 分页模块 ======
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
    // 用户操作模块 (User Operations Module)
    // =============================================================================

    /**
     * 编辑用户
     * @param {number} userId 用户ID
     */
    editUser(userId) {
        if (!window.editUserUrl) {
            alert('You do not have permission to edit users');
            return;
        }
        const url = window.editUserUrl.replace(':id', userId);
        window.location.href = url;
    }

    /**
     * 更改用户角色
     * @param {number} userId 用户ID
     */
    changeRole(userId) {
        if (!window.changeRoleUrl) {
            alert('You do not have permission to change user roles');
            return;
        }
        this.showRoleChangeModal(userId);
    }

    // 显示角色更改模态框
    showRoleChangeModal(userId) {
        // 创建模态框HTML
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
                            <div class="row g-3 role-cards">
                                <div class="col-lg-4 col-md-6 col-sm-12">
                                    <div class="card h-100 border role-option-card" data-role="Staff">
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
                                    <div class="card h-100 border role-option-card" data-role="Admin">
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
                                    <div class="card h-100 border role-option-card" data-role="SuperAdmin">
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

        // 移除已存在的模态框
        $('#roleChangeModal').remove();

        // 添加模态框到页面
        $('body').append(modalHtml);

        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('roleChangeModal'));
        modal.show();

        // 绑定角色选择事件
        this.bindRoleSelectionEvents();

        // 绑定确认按钮事件
        $('#confirmRoleChange').on('click', () => {
            this.confirmRoleChange(userId);
        });
    }

    // 绑定角色选择事件
    bindRoleSelectionEvents() {
        $('.role-option-card').on('click', function() {
            // 移除所有卡片的选中状态
            $('.role-option-card').removeClass('selected');

            // 添加当前卡片的选中状态
            $(this).addClass('selected');

            // 选中对应的单选按钮
            $(this).find('input[type="radio"]').prop('checked', true);
        });

        // 为单选按钮添加变化事件
        $('input[name="new_role"]').on('change', function() {
            // 移除所有卡片的选中状态
            $('.role-option-card').removeClass('selected');

            // 添加对应卡片的选中状态
            const card = $(this).closest('.role-option-card');
            card.addClass('selected');
        });
    }

    // 确认角色更改
    confirmRoleChange(userId) {
        const selectedRole = $('input[name="new_role"]:checked').val();

        if (!selectedRole) {
            alert('Please select a role');
            return;
        }

        if (!confirm(`Are you sure you want to change the user role to ${selectedRole}?`)) {
            return;
        }

        // 使用表单提交而不是AJAX，这样可以使用Blade的session flash消息
        this.submitRoleChange(userId, selectedRole);
    }

    // 提交角色更改表单
    submitRoleChange(userId, role) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = window.changeRoleUrl.replace(':id', userId);

        // 添加CSRF token
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_token';
        tokenInput.value = $('meta[name="csrf-token"]').attr('content');

        // 添加HTTP方法字段
        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = 'PATCH';

        // 添加角色字段
        const roleInput = document.createElement('input');
        roleInput.type = 'hidden';
        roleInput.name = 'account_role';
        roleInput.value = role;

        form.appendChild(tokenInput);
        form.appendChild(methodInput);
        form.appendChild(roleInput);
        document.body.appendChild(form);
        form.submit();
    }

    // 通用表单提交函数
    submitForm(url, method, confirmMessage) {
        if (!confirm(confirmMessage)) return;

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;

        // 添加CSRF token
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_token';
        tokenInput.value = $('meta[name="csrf-token"]').attr('content');

        // 添加HTTP方法字段
        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = method;

        form.appendChild(tokenInput);
        form.appendChild(methodInput);
        document.body.appendChild(form);
        form.submit();
    }

    deleteUser(userId) {
        if (!window.deleteUserUrl) {
            alert('You do not have permission to delete users');
            return;
        }
        this.submitForm(
            window.deleteUserUrl.replace(':id', userId),
            'DELETE',
            'Are you sure you want to delete this user?'
        );
    }

    setUnavailable(userId) {
        if (!window.unavailableUserUrl) {
            alert('You do not have permission to deactivate users');
            return;
        }
        this.submitForm(
            window.unavailableUserUrl.replace(':id', userId),
            'PATCH',
            'Are you sure you want to deactivate this user?'
        );
    }

    setAvailable(userId) {
        if (!window.availableUserUrl) {
            alert('You do not have permission to activate users');
            return;
        }
        this.submitForm(
            window.availableUserUrl.replace(':id', userId),
            'PATCH',
            'Are you sure you want to activate this user?'
        );
    }


}

// ====== 初始化全局实例 ======
let staffManagement;
$(document).ready(function() {
    staffManagement = new StaffManagement();
});
