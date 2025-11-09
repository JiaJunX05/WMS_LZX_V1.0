/**
 * Auth Management JavaScript
 * 用戶管理統一交互邏輯
 *
 * 功能模塊：
 * - Dashboard 頁面：搜索、篩選、分頁、CRUD 操作、狀態切換
 * - View 頁面：查看詳情、刪除操作、Update Modal、角色切換
 * - Create Modal：單次創建、表單驗證、狀態管理、圖片上傳
 * - Update Modal：編輯更新、表單提交、圖片管理
 * - Role Modal：角色切換
 * - 通用功能：API 請求、UI 更新、事件綁定、工具函數
 *
 * @author WMS Team
 * @version 3.0.0
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

        // Modal 事件绑定
        this.bindModalEvents();
        this.bindUpdateModalEvents();

        // 角色更改 Modal 事件绑定（在 Modal 显示时绑定）
        $('#roleChangeModal').on('shown.bs.modal', () => {
            this.bindRoleSelectionEvents();
        });

        // 确认按钮事件
        $('#confirmRoleChange').on('click', () => {
            this.confirmRoleChange();
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
     * 更新統計數據
     * @param {Object} response API響應數據
     */
    updateStatistics(response) {
        const total = response.pagination?.total || 0;
        $('#total-users').text(total);

        // 計算活躍和非活躍用戶數量
        if (response.data) {
            const availableCount = response.data.filter(user => user.status === 'Available').length;
            const unavailableCount = response.data.filter(user => user.status === 'Unavailable').length;

            // 計算管理員數量（僅 SuperAdmin 可見）
            const adminCount = response.data.filter(user =>
                user.role === 'Admin' || user.role === 'SuperAdmin'
            ).length;

            $('#active-users').text(availableCount);
            $('#inactive-users').text(unavailableCount);
            $('#admin-users').text(adminCount);
        }
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
                } else {
                    this.showNoResults();
                }
                this.updateStatistics(response);
                this.updateResultsCount(response);
                this.generatePagination(response);

                // 更新勾選框狀態 (僅SuperAdmin)
                if (window.currentUserRole && window.currentUserRole.replace(/[_\s]/g, '').toLowerCase() === 'superadmin') {
                    this.updateSelectAllCheckbox();
                    this.updateExportButton();
                }
            })
            .fail((xhr, status, error) => {
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
     * 更新結果計數顯示
     * @param {Object} response API響應數據
     */
    updateResultsCount(response) {
        const total = response.pagination?.total || 0;
        $('#records-count').text(`${total} records`);
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

        // 重置勾選框狀態 (僅SuperAdmin)
        if (window.currentUserRole && window.currentUserRole.replace(/[_\s]/g, '').toLowerCase() === 'superadmin') {
            this.updateSelectAllCheckbox();
            this.updateExportButton();
        }

        // 隱藏空狀態
        $('#empty-state').addClass('d-none');
    }

    createUserRow(user) {
        const currentUserRole = window.currentUserRole;
        let actionButtons = '';

        // 转义用户数据用于 data 属性
        const escapeHtml = (str) => {
            if (!str) return '';
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        };

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
                ? `<button type="button" class="dropdown-item" onclick="setUserAvailable(${user.id})">
                       <i class="bi bi-check-circle me-2"></i> Activate Account
                   </button>`
                : `<button type="button" class="dropdown-item" onclick="setUserUnavailable(${user.id})">
                       <i class="bi bi-slash-circle me-2"></i> Deactivate Account
                   </button>`;

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
                            <button type="button" class="dropdown-item text-danger" onclick="deleteUser(${user.id})">
                                <i class="bi bi-trash me-2"></i> Delete User
                            </button>
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
            <tr data-user-id="${user.id}"
                data-username="${escapeHtml(user.username || '')}"
                data-first-name="${escapeHtml(user.first_name || '')}"
                data-last-name="${escapeHtml(user.last_name || '')}"
                data-email="${escapeHtml(user.email || '')}"
                data-role="${escapeHtml(user.role || user.account_role || 'Staff')}"
                data-status="${escapeHtml(user.status || user.account_status || 'Available')}"
                data-user-image="${escapeHtml(user.user_image || '')}">
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
    // 用戶操作模塊 (User Operations Module)
    // =============================================================================

    /**
     * 編輯用戶（打開更新彈窗）
     * @param {number} userId 用戶ID
     */
    editUser(userId) {
        this.openUpdateModal(userId);
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
     * 更新表格行的所有數據（用於 update 操作後）
     * @param {number} userId 用戶ID
     * @param {Object} userData 更新後的用戶數據
     */
    updateUserRow(userId, userData) {
        const userRow = $(`tr[data-user-id="${userId}"]`);
        if (userRow.length === 0) return;

        // 轉义用戶數據用於 data 屬性
        const escapeHtml = (str) => {
            if (!str) return '';
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        };

        // 更新 data 屬性（使用 attr() 而不是 data()，因為 data() 會緩存值）
        userRow.attr('data-username', escapeHtml(userData.username || userData.account?.username || ''));
        userRow.attr('data-first-name', escapeHtml(userData.first_name || ''));
        userRow.attr('data-last-name', escapeHtml(userData.last_name || ''));
        userRow.attr('data-email', escapeHtml(userData.email || ''));
        userRow.attr('data-role', escapeHtml(userData.role || userData.account_role || 'Staff'));
        userRow.attr('data-status', escapeHtml(userData.status || userData.account_status || 'Available'));
        userRow.attr('data-user-image', escapeHtml(userData.user_image || ''));

        // 清除 jQuery 的 data 緩存，確保下次讀取時能獲取最新值
        userRow.removeData('username');
        userRow.removeData('first-name');
        userRow.removeData('last-name');
        userRow.removeData('email');
        userRow.removeData('role');
        userRow.removeData('status');
        userRow.removeData('user-image');

        // 更新用戶圖片顯示
        const imageCell = userRow.find('td').eq(1);
        if (imageCell.length > 0) {
            const userImageUrl = userData.user_image ? `/assets/images/auth/${userData.user_image}` : null;
            if (userImageUrl) {
                imageCell.html(`
                    <div class="d-flex align-items-start">
                        <div class="me-3">
                            <img src="${userImageUrl}" alt="User Avatar" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">
                        </div>
                        <div class="d-flex flex-column">
                            <span class="fw-medium">${(userData.first_name || '') + ' ' + (userData.last_name || '')}</span>
                            <span class="text-muted small">${userData.username || userData.account?.username || ''}</span>
                        </div>
                    </div>
                `);
        } else {
                imageCell.html(`
                    <div class="d-flex align-items-start">
                        <div class="me-3">
                            <div class="bg-light rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                <i class="bi bi-person text-muted"></i>
                            </div>
                        </div>
                        <div class="d-flex flex-column">
                            <span class="fw-medium">${(userData.first_name || '') + ' ' + (userData.last_name || '')}</span>
                            <span class="text-muted small">${userData.username || userData.account?.username || ''}</span>
                        </div>
                    </div>
                `);
            }
        }

        // 更新郵箱顯示
        const emailCell = userRow.find('td').eq(2);
        if (emailCell.length > 0) {
            emailCell.html(`<span class="text-muted small">${userData.email || ''}</span>`);
        }

        // 更新角色顯示
        const roleCell = userRow.find('td').eq(3);
        if (roleCell.length > 0) {
            const role = userData.role || userData.account_role || 'Staff';
            const roleBadge = role === 'SuperAdmin'
                ? 'bg-danger'
                : role === 'Admin'
                    ? 'bg-warning'
                    : 'bg-success';
            const roleIcon = role === 'SuperAdmin'
                ? 'bi-person-fill-gear'
                : role === 'Admin'
                    ? 'bi-shield-check'
                    : 'bi-person-badge';
            roleCell.html(`
                <span class="badge ${roleBadge} px-3 py-2">
                    <i class="bi ${roleIcon} me-1"></i>${role.toUpperCase()}
                </span>
            `);
        }

        // 更新狀態顯示（使用 updateUserRowStatus 函數）
        this.updateUserRowStatus(userId, userData.status || userData.account_status || 'Available');
    }

    /**
     * 更新表格行的狀態顯示和 data 屬性
     * @param {number} userId 用戶ID
     * @param {string} newStatus 新狀態 ('Available' 或 'Unavailable')
     */
    updateUserRowStatus(userId, newStatus) {
        const userRow = $(`tr[data-user-id="${userId}"]`);
        if (userRow.length === 0) return;

        // 更新 data 屬性
        userRow.attr('data-status', newStatus);

        const currentUserRole = window.currentUserRole;
        let actionButtons = '';

        // 根據角色生成操作按鈕
        if (currentUserRole && currentUserRole.replace(/[_\s]/g, '').toLowerCase() === 'admin') {
            const statusButton = newStatus === 'Unavailable'
                ? `<button class="btn btn-sm btn-outline-success" title="Activate Account" onclick="setUserAvailable(${userId})">
                       <i class="bi bi-check-circle"></i>
                   </button>`
                : `<button class="btn btn-sm btn-outline-warning" title="Deactivate Account" onclick="setUserUnavailable(${userId})">
                       <i class="bi bi-slash-circle"></i>
                   </button>`;

            actionButtons = `
                <button class="btn btn-sm btn-outline-primary" title="Edit" onclick="authDashboard.editUser(${userId})">
                    <i class="bi bi-pencil"></i>
                </button>
                ${statusButton}
            `;
        }

        if (currentUserRole && currentUserRole.replace(/[_\s]/g, '').toLowerCase() === 'superadmin') {
            const statusMenuItem = newStatus === 'Unavailable'
                ? `<button type="button" class="dropdown-item" onclick="setUserAvailable(${userId})">
                       <i class="bi bi-check-circle me-2"></i> Activate Account
                   </button>`
                : `<button type="button" class="dropdown-item" onclick="setUserUnavailable(${userId})">
                       <i class="bi bi-slash-circle me-2"></i> Deactivate Account
                   </button>`;

            actionButtons = `
                <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="authDashboard.editUser(${userId})">
                    <i class="bi bi-pencil"></i>
                </button>
                <div class="dropdown d-inline">
                    <button class="btn btn-sm btn-outline-secondary" title="More" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <a class="dropdown-item" href="javascript:void(0)" onclick="authDashboard.changeRole(${userId})">
                                <i class="bi bi-arrow-repeat me-2"></i> Change Role
                            </a>
                        </li>
                        <li>
                            ${statusMenuItem}
                        </li>
                        <li>
                            <button type="button" class="dropdown-item text-danger" onclick="deleteUser(${userId})">
                                <i class="bi bi-trash me-2"></i> Delete User
                            </button>
                        </li>
                    </ul>
                </div>
            `;
        }

        // 更新操作按鈕列
        const actionsCell = userRow.find('td:last-child');
        actionsCell.html(`<div class="d-flex justify-content-end gap-1">${actionButtons}</div>`);

        // 更新狀態標籤顯示（與 createUserRow 中的格式完全一致）
        const statusBadge = newStatus === 'Available'
            ? `<span class="badge bg-success px-3 py-2">
                <i class="bi bi-check-circle me-1"></i>${newStatus}
            </span>`
            : `<span class="badge bg-danger px-3 py-2">
                <i class="bi bi-x-circle me-1"></i>${newStatus}
            </span>`;

        // 更新狀態列顯示（倒數第二列是狀態列）
        const statusCell = userRow.find('td').eq(-2);
        if (statusCell.length > 0) {
            statusCell.html(statusBadge);
        }
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
                // 更新 DOM 而不是刷新頁面
                this.updateUserRowStatus(userId, 'Available');
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
                // 更新 DOM 而不是刷新頁面
                this.updateUserRowStatus(userId, 'Unavailable');
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
        // 重置角色選擇
        $('input[name="new_role"]').prop('checked', false);
        $('.role-card').removeClass('selected');

        // 設置當前用戶ID
        $('#confirmRoleChange').data('user-id', userId);

        // 顯示模態框
        const modal = new bootstrap.Modal(document.getElementById('roleChangeModal'));
        modal.show();
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
    confirmRoleChange() {
        const userId = $('#confirmRoleChange').data('user-id');
        if (!userId) {
            this.showAlert('User ID not found', 'error');
            return;
        }

        const selectedRole = $('input[name="new_role"]:checked').val();

        if (!selectedRole) {
            this.showAlert('Please select a role', 'warning');
            return;
        }

        // 使用通用函數
        this.changeUserRole(userId, selectedRole, {
            onSuccess: () => {
                // 關閉模態框
                const modal = bootstrap.Modal.getInstance(document.getElementById('roleChangeModal'));
                if (modal) {
                    modal.hide();
                }
                // 重新加載數據
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

    // =============================================================================
    // 勾選框管理模塊 (Checkbox Management Module)
    // =============================================================================

    /**
     * 更新全選勾選框狀態
     */
    updateSelectAllCheckbox() {
        const totalCheckboxes = $('.user-checkbox').length;
        const checkedCheckboxes = $('.user-checkbox:checked').length;
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

        // 獲取當前篩選條件
        const search = this.searchTerm || '';
        const roleFilter = this.roleFilter || '';
        const statusFilter = this.statusFilter || '';

        const params = new URLSearchParams({
            ids: selectedIds.join(','),
            search: search,
            role: roleFilter,
            status: statusFilter
        });

        // 使用新的Excel導出路由
        const exportUrl = `${window.userExportUrl}?${params}`;

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
    // Add User 彈窗模塊 (Add User Modal Module)
    // =============================================================================

    /**
     * 綁定彈窗事件
     */
    bindModalEvents() {
        // Modal 打开时重置表单并初始化图片处理
        $('#createUserModal').on('show.bs.modal', () => {
            this.resetCreateModalForm();
            this.initCreateModalImageSystem();
        });

        // Modal 完全显示后设置焦点
        $('#createUserModal').on('shown.bs.modal', () => {
            const usernameInput = document.getElementById('create-username');
            if (usernameInput) {
                usernameInput.focus();
            }
        });

        // Modal 关闭时清理
        $('#createUserModal').on('hidden.bs.modal', () => {
            this.resetCreateModalForm();
        });

        // 提交按鈕事件
        $('#submitCreateUser').on('click', () => {
            this.submitCreateUser();
        });

        // Enter鍵自動跳轉到下一個輸入框或提交表單
        $('#createUserModal').on('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const target = e.target;
                // 排除 image 輸入框
                if (target.type === 'file' || target.id === 'create_user_image') {
                    return;
                }

                // 如果當前在輸入框中
                if (target.tagName === 'INPUT' && target.type !== 'submit' && target.type !== 'button' && target.type !== 'radio') {
                    e.preventDefault();

                    // 定義輸入框順序
                    const inputOrder = ['create-username', 'create-first_name', 'create-last_name', 'create-email', 'create-password', 'create-password_confirmation'];
                    const currentIndex = inputOrder.indexOf(target.id);

                    if (currentIndex !== -1 && currentIndex < inputOrder.length - 1) {
                        // 跳轉到下一個輸入框
                        const nextInput = document.getElementById(inputOrder[currentIndex + 1]);
                        if (nextInput) {
                            nextInput.focus();
                }
            } else {
                        // 最後一個輸入框，提交表單
                        this.submitCreateUser();
            }
                }
            }
        });
    }

    /**
     * 初始化彈窗中的圖片處理系統（完全交給ImageSystem處理）
     */
    initCreateModalImageSystem() {
        // 使用統一的圖片處理模組（完全交給ImageSystem處理）
        if (typeof window.ImageSystem !== 'undefined') {
            // 檢查彈窗內是否有圖片元素
            const modal = document.getElementById('createUserModal');
            if (!modal) return;

            const imageInput = modal.querySelector('#create_user_image');
            const imageUploadArea = modal.querySelector('#create-user-image-area');

            // 只綁定彈窗內的元素
            if (imageInput && imageUploadArea) {
                // 直接使用ImageSystem綁定事件（所有圖片處理都由ImageSystem負責）
                window.ImageSystem.bindImageUploadEvents({
                    createImageInputId: 'create_user_image',
                    createImageUploadAreaId: 'create-user-image-area',
                    createPreviewImageId: 'create-user-preview',
                    createPreviewIconId: 'create-user-preview-icon',
                    createImageUploadContentId: 'create-user-image-upload-content'
                });
            }
                } else {
            console.warn('ImageSystem not available, image functionality may not work properly');
        }
    }

    /**
     * 重置彈窗表單
     */
    resetCreateModalForm() {
        const form = document.getElementById('createUserForm');
        if (form) {
            form.reset();
        }

        // 重置角色选择
        $('input[name="account_role"]').prop('checked', false);
        $('input[name="account_role"][value="Staff"]').prop('checked', true);
        $('.role-card').removeClass('selected');
        $('.role-card[data-role="Staff"]').addClass('selected');

        // 使用ImageSystem重置圖片
        if (typeof window.ImageSystem !== 'undefined' && window.ImageSystem.resetImage) {
            window.ImageSystem.resetImage('create-user-image-area', {
                imageInputId: 'create_user_image',
                previewImageId: 'create-user-preview',
                previewIconId: 'create-user-preview-icon',
                imageUploadContentId: 'create-user-image-upload-content'
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
     * 提交彈窗中的用戶
     */
    submitCreateUser() {
        const form = document.getElementById('createUserForm');
        if (!form) return;

        const formData = new FormData(form);
        const submitBtn = $('#submitCreateUser');
        const originalText = submitBtn.html();

        // 檢查是否有圖片
        const imageInput = document.getElementById('create_user_image');
        const hasImage = imageInput && imageInput.files && imageInput.files[0];

        // 顯示加載狀態
        submitBtn.prop('disabled', true).html('<i class="bi bi-hourglass-split me-2"></i>Creating...');

        // 提交數據
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to create user');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.showAlert(data.message || 'User created successfully', 'success');

                // 關閉彈窗
                const modal = bootstrap.Modal.getInstance(document.getElementById('createUserModal'));
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
                    this.fetchUsers(1);
                }
            } else {
                this.showAlert(data.message || 'Failed to create user', 'error');
            }
        })
        .catch(error => {
            let errorMessage = 'Failed to create user';
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
    // Update User 彈窗模塊 (Update User Modal Module)
// =============================================================================

/**
     * 綁定更新彈窗事件
     */
    bindUpdateModalEvents() {
        // 彈窗打開時初始化圖片處理
        $('#updateUserModal').on('show.bs.modal', () => {
            this.initUpdateModalImageSystem();
        });

        // 彈窗完全顯示後設置焦點
        $('#updateUserModal').on('shown.bs.modal', () => {
            const usernameInput = document.getElementById('update-username');
            if (usernameInput) {
                usernameInput.focus();
            }
        });

        // 彈窗關閉時清理
        $('#updateUserModal').on('hidden.bs.modal', () => {
            this.resetUpdateModalForm();
        });

        // 提交按鈕事件
        $('#submitUpdateUser').on('click', () => {
            this.submitUpdateUser();
        });

        // Enter鍵自動跳轉到下一個輸入框或提交表單
        $('#updateUserModal').on('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const target = e.target;
                // 排除 image 輸入框
                if (target.type === 'file' || target.id === 'update_user_image') {
                return;
            }

                // 如果當前在輸入框中
                if (target.tagName === 'INPUT' && target.type !== 'submit' && target.type !== 'button' && target.type !== 'radio') {
                    e.preventDefault();

                    // 定義輸入框順序
                    const inputOrder = ['update-username', 'update-first_name', 'update-last_name', 'update-email'];
                    const currentIndex = inputOrder.indexOf(target.id);

                    if (currentIndex !== -1 && currentIndex < inputOrder.length - 1) {
                        // 跳轉到下一個輸入框
                        const nextInput = document.getElementById(inputOrder[currentIndex + 1]);
                        if (nextInput) {
                            nextInput.focus();
                        }
                    } else {
                        // 最後一個輸入框，提交表單
                        this.submitUpdateUser();
                    }
                }
            }
        });
    }

    /**
     * 打開更新彈窗並填充數據
     * @param {number} userId 用戶ID
     */
    openUpdateModal(userId) {
        const url = window.editUserUrl.replace(':id', userId);

        // 从表格行获取用户数据（如果可用，用于快速填充）
        const userRow = $(`tr[data-user-id="${userId}"]`);
        if (userRow.length > 0) {
            // 快速填充基本数据
            const userData = {
                id: userId,
                username: userRow.attr('data-username') || '',
                first_name: userRow.attr('data-first-name') || '',
                last_name: userRow.attr('data-last-name') || '',
                email: userRow.attr('data-email') || '',
                account_role: userRow.attr('data-role') || 'Staff',
                account_status: userRow.attr('data-status') || 'Available',
                user_image: userRow.attr('data-user-image') || ''
            };
            this.fillUpdateModalForm(userData);
        }

        // 从 API 获取完整用户数据
        $.ajax({
            url: url,
            type: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            },
            success: (response) => {
                if (response.success && response.data && response.data.user) {
                    this.fillUpdateModalForm(response.data.user);
                    } else {
                    this.showAlert(response.message || 'Failed to load user data', 'error');
                }
            },
            error: (xhr) => {
                let errorMessage = 'Failed to load user data';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                this.showAlert(errorMessage, 'error');
            }
        });

        // 打开 Modal
        const modal = new bootstrap.Modal(document.getElementById('updateUserModal'));
        modal.show();
    }

    /**
     * 填充更新用户 Modal 表单
     * @param {Object} userData 用户数据
     */
    fillUpdateModalForm(userData) {
        // 填充基本信息
        $('#update-username').val(userData.account?.username || userData.username || '');
        $('#update-first_name').val(userData.first_name || '');
        $('#update-last_name').val(userData.last_name || '');
        $('#update-email').val(userData.email || '');

        // 设置用户ID
        $('#updateUserForm').attr('data-user-id', userData.id);

        // 填充当前用户信息
        const userInfoHtml = `
            <div class="mb-1">
                <i class="bi bi-person me-2 text-muted"></i>
                <span>Name: <strong>${(userData.first_name || '') + ' ' + (userData.last_name || '')}</strong></span>
            </div>
            <div class="mb-1">
                <i class="bi bi-at me-2 text-muted"></i>
                <span>Username: <strong>${userData.account?.username || userData.username || 'N/A'}</strong></span>
            </div>
            <div class="mb-1">
                <i class="bi bi-envelope me-2 text-muted"></i>
                <span>Email: <strong>${userData.email || 'N/A'}</strong></span>
            </div>
            <div class="mb-1">
                <i class="bi bi-shield-check me-2 text-muted"></i>
                <span>Role: <strong>${userData.account?.account_role || userData.account_role || 'N/A'}</strong></span>
            </div>
            <div>
                <i class="bi bi-toggle-on me-2 text-muted"></i>
                <span>Status: <strong>${userData.account?.account_status || userData.account_status || 'N/A'}</strong></span>
            </div>
        `;
        $('#update-user-info-content').html(userInfoHtml);
        $('#update-user-info').removeClass('d-none');

        // 填充角色选择（根据权限）
        this.fillRoleSection(userData);

        // 填充状态选择（如果不是更新自己）
        const isUpdatingSelf = window.currentUserId && parseInt(userData.id) === parseInt(window.currentUserId);
        if (!isUpdatingSelf) {
            this.fillStatusSection(userData);
                } else {
            this.fillReadonlyStatusSection(userData);
        }

        // 处理图片
        if (userData.account?.user_image || userData.user_image) {
            const imagePath = userData.account?.user_image || userData.user_image;
            const imageUrl = `/assets/images/auth/${imagePath}`;
            this.setUpdateModalImage(imageUrl);
            } else {
            this.resetUpdateModalImage();
    }
}

/**
     * 填充角色选择区域
     * @param {Object} userData 用户数据
     */
    fillRoleSection(userData) {
        const currentUserRole = window.currentUserRole;
        const userRole = userData.account?.account_role || userData.account_role || 'Staff';
        const isUpdatingSelf = window.currentUserId && parseInt(userData.id) === parseInt(window.currentUserId);

        let roleHtml = '';

        if (currentUserRole === 'SuperAdmin' && !isUpdatingSelf) {
            // 超级管理员可以修改其他用户角色
            roleHtml = `
                <label class="form-label fw-bold text-dark mb-3">User Role</label>
                <div class="row g-3">
                    <div class="col-lg-4 col-md-6 col-sm-12">
                        <div class="card h-100 border role-card ${userRole === 'Staff' ? 'selected' : ''}" data-role="Staff">
                            <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                <input type="radio" name="account_role" value="Staff" class="form-check-input me-3" ${userRole === 'Staff' ? 'checked' : ''}>
                                <div>
                                    <h6 class="card-title mb-1 fw-semibold">
                                        <i class="bi bi-person-badge me-2 text-success"></i>Staff
                                    </h6>
                                    <p class="card-text text-muted small mb-0">Basic user permissions</p>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-6 col-sm-12">
                        <div class="card h-100 border role-card ${userRole === 'Admin' ? 'selected' : ''}" data-role="Admin">
                            <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                <input type="radio" name="account_role" value="Admin" class="form-check-input me-3" ${userRole === 'Admin' ? 'checked' : ''}>
                                <div>
                                    <h6 class="card-title mb-1 fw-semibold">
                                        <i class="bi bi-shield-check me-2 text-warning"></i>Admin
                                    </h6>
                                    <p class="card-text text-muted small mb-0">Full management permissions</p>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-6 col-sm-12">
                        <div class="card h-100 border role-card ${userRole === 'SuperAdmin' ? 'selected' : ''}" data-role="SuperAdmin">
                            <label class="card-body d-flex align-items-center" style="cursor: pointer;">
                                <input type="radio" name="account_role" value="SuperAdmin" class="form-check-input me-3" ${userRole === 'SuperAdmin' ? 'checked' : ''}>
                                <div>
                                    <h6 class="card-title mb-1 fw-semibold">
                                        <i class="bi bi-person-fill-gear me-2 text-danger"></i>Super Admin
                                    </h6>
                                    <p class="card-text text-muted small mb-0">Highest system permissions</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="form-text">
                    <i class="bi bi-info-circle me-1"></i>
                    You can modify user roles to Staff, Admin, or Super Admin
                </div>
            `;
            } else {
            // 只读显示
            const roleBadge = userRole === 'SuperAdmin' ? 'bg-danger' : (userRole === 'Admin' ? 'bg-warning' : 'bg-success');
            const roleIcon = userRole === 'SuperAdmin' ? 'bi-person-fill-gear' : (userRole === 'Admin' ? 'bi-shield-check' : 'bi-person-badge');
            const roleText = userRole === 'SuperAdmin' ? 'SUPER ADMIN' : (userRole === 'Admin' ? 'ADMIN' : 'STAFF');
            const roleDesc = userRole === 'SuperAdmin' ? 'Highest system permissions' : (userRole === 'Admin' ? 'Full management permissions' : 'Basic user permissions');

            roleHtml = `
                <label class="form-label fw-bold text-dark mb-3">User Role</label>
                <div class="row g-3">
                    <div class="col-12">
                        <div class="card border">
                            <div class="card-body d-flex align-items-center">
                                <div class="me-3">
                                    <span class="badge ${roleBadge} px-3 py-2">
                                        <i class="bi ${roleIcon} me-1"></i>${roleText}
                                    </span>
                                </div>
                                <div>
                                    <h6 class="card-title mb-1">${userRole === 'SuperAdmin' ? 'Super Admin' : (userRole === 'Admin' ? 'Admin' : 'Staff')}</h6>
                                    <p class="card-text text-muted small mb-0">${roleDesc}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <div class="alert alert-info alert-sm d-flex align-items-center" role="alert">
                        <i class="bi bi-info-circle me-2"></i>
                        <small>You can only modify user basic information, cannot change user roles</small>
                    </div>
                </div>
            `;
        }

        $('#update-role-section').html(roleHtml);

        // 初始化角色选择事件
        if (currentUserRole === 'SuperAdmin' && !isUpdatingSelf) {
            if (typeof window.initializeRoleCardSelection === 'function') {
                window.initializeRoleCardSelection('account_role');
            }
        }
    }

    /**
     * 填充狀態選擇區域
     * @param {Object} userData 用戶數據
     */
    fillStatusSection(userData) {
        const currentStatus = userData.account?.account_status || userData.account_status || 'Available';

        const statusHtml = `
            <label class="form-label fw-bold text-dark mb-3">
                <i class="bi bi-shield-check me-2 text-primary"></i>Account Status <span class="text-danger">*</span>
            </label>
            <div class="row g-3">
                <div class="col-md-6">
                    <div class="card h-100 border status-card ${currentStatus === 'Available' ? 'selected' : ''}" data-status="Available">
                        <label class="card-body d-flex align-items-center" style="cursor: pointer;" for="update_status_available">
                            <input type="radio" name="account_status" id="update_status_available" value="Available" class="form-check-input me-3" ${currentStatus === 'Available' ? 'checked' : ''}>
                            <div class="flex-grow-1">
                                <h6 class="card-title mb-1">
                                    <i class="bi bi-check-circle me-2 text-success"></i>Available
                                </h6>
                                <p class="card-text text-muted small mb-0">Active and can be used</p>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card h-100 border status-card ${currentStatus === 'Unavailable' ? 'selected' : ''}" data-status="Unavailable">
                        <label class="card-body d-flex align-items-center" style="cursor: pointer;" for="update_status_unavailable">
                            <input type="radio" name="account_status" id="update_status_unavailable" value="Unavailable" class="form-check-input me-3" ${currentStatus === 'Unavailable' ? 'checked' : ''}>
                            <div class="flex-grow-1">
                                <h6 class="card-title mb-1">
                                    <i class="bi bi-x-circle me-2 text-danger"></i>Unavailable
                                </h6>
                                <p class="card-text text-muted small mb-0">Inactive and cannot be used</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            <div class="form-text">
                <i class="bi bi-info-circle me-1"></i>
                Choose whether the user can access the system
            </div>
        `;

        $('#update-status-section').html(statusHtml);

        // 初始化状态选择事件
        if (typeof window.initializeStatusCardSelection === 'function') {
            window.initializeStatusCardSelection('account_status');
        }
    }

    /**
     * 填充只讀狀態區域
     * @param {Object} userData 用戶數據
     */
    fillReadonlyStatusSection(userData) {
        const currentStatus = userData.account?.account_status || userData.account_status || 'Available';

        const statusHtml = `
            <label class="form-label fw-bold text-dark mb-3">Account Status</label>
            <div class="row g-3">
                <div class="col-12">
                    <div class="card border">
                        <div class="card-body d-flex align-items-center">
                            <div class="me-3">
                                ${currentStatus === 'Available'
                                    ? '<i class="bi bi-check-circle text-success fs-4"></i>'
                                    : '<i class="bi bi-x-circle text-danger fs-4"></i>'}
                            </div>
                            <div>
                                <h6 class="card-title mb-1">${currentStatus === 'Available' ? 'Available' : 'Unavailable'}</h6>
                                <p class="card-text text-muted small mb-0">
                                    ${currentStatus === 'Available' ? 'User can login and use normally' : 'User cannot login to the system'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-text">
                <i class="bi bi-info-circle me-1"></i>
                You cannot change your own account status
            </div>
        `;

        $('#update-status-section').html(statusHtml);
    }

    /**
     * 初始化创建 Modal 图片系统
     */
    initCreateModalImageSystem() {
        if (typeof window.ImageSystem !== 'undefined') {
            const modal = document.getElementById('createUserModal');
            if (!modal) return;

            const imageInput = modal.querySelector('#create_user_image');
            const imageUploadArea = modal.querySelector('#create-user-image-area');

            if (imageInput && imageUploadArea) {
                window.ImageSystem.bindImageUploadEvents({
                    createImageInputId: 'create_user_image',
                    createImageUploadAreaId: 'create-user-image-area',
                    createPreviewImageId: 'create-user-preview',
                    createPreviewIconId: 'create-user-preview-icon',
                    createImageUploadContentId: 'create-user-image-upload-content'
                });
            }
        }
    }

    /**
     * 初始化更新 Modal 图片系统
     */
    initUpdateModalImageSystem() {
        if (typeof window.ImageSystem !== 'undefined') {
            const modal = document.getElementById('updateUserModal');
            if (!modal) return;

            const imageInput = modal.querySelector('#update_user_image');
            const previewContainer = modal.querySelector('#update-user-image-preview');
            const removeImageBtn = modal.querySelector('#removeImage');

            if (imageInput && previewContainer) {
                // 使用 Update 模式的配置调用 ImageSystem
                window.ImageSystem.bindImageUploadEvents({
                    updateImageInputId: 'update_user_image',
                    updatePreviewContainerId: 'update-user-image-preview'
                });

                // 为 Update modal 点击预览区域触发文件选择
                previewContainer.addEventListener('click', function(e) {
                    if (e.target.closest('.img-remove-btn')) {
                        return; // 不触发文件选择
                    }
                    imageInput.click();
                });

                // 绑定静态移除按钮事件（参考 zone 的实现方式）
                if (removeImageBtn) {
                    // 克隆按钮以移除所有旧的事件监听器
                    const newRemoveBtn = removeImageBtn.cloneNode(true);
                    removeImageBtn.parentNode.replaceChild(newRemoveBtn, removeImageBtn);

                    // 重新获取按钮引用
                    const freshRemoveBtn = modal.querySelector('#removeImage');

                    // 绑定新的事件监听器
                    freshRemoveBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();

                        // 防止重复触发
                        if (freshRemoveBtn.hasAttribute('data-processing')) {
            return;
        }
                        freshRemoveBtn.setAttribute('data-processing', 'true');

                        const modal = document.getElementById('updateUserModal');
                        const form = modal ? document.getElementById('updateUserForm') : null;

                        if (!confirm('Are you sure you want to remove this image?')) {
                            freshRemoveBtn.removeAttribute('data-processing');
            return;
        }

                        const imageInput = modal?.querySelector('#update_user_image');
                        const previewContainer = modal?.querySelector('#update-user-image-preview');
                        const imageUploadContent = modal?.querySelector('#update-user-image-upload-content');
                        const removeImageInput = modal?.querySelector('#remove_image');

                        if (imageInput && previewContainer && form) {
                            // 重置文件输入
                            imageInput.value = '';

                            // 设置 remove_image 标记
                            if (removeImageInput) {
                                removeImageInput.value = '1';
                            }

                            // 隐藏图片，显示占位符
                            const previewImg = previewContainer.querySelector('#update-user-preview-image');
                            if (previewImg) {
                                previewImg.remove();
                            }

                            // 恢复原始内容（显示占位符）
                            const originalContent = previewContainer.getAttribute('data-original-content');
                            if (originalContent) {
                                // 恢复原始 HTML 结构
                                previewContainer.innerHTML = originalContent;

                                // 确保 preview-image 是隐藏的
                                const restoredPreviewImg = previewContainer.querySelector('#update-user-preview-image');
                                if (restoredPreviewImg) {
                                    restoredPreviewImg.classList.add('d-none');
                                }

                                // 确保 removeImage 按钮是隐藏的
                                const restoredRemoveBtn = previewContainer.querySelector('#removeImage');
                                if (restoredRemoveBtn) {
                                    restoredRemoveBtn.classList.add('d-none');
                                }

                                // 确保 imageUploadContent 是显示的
                                const restoredImageUploadContent = previewContainer.querySelector('#update-user-image-upload-content');
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

                            // 显示成功提示
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
    }
}

/**
     * 设置更新 Modal 图片
     * @param {string} imageUrl 图片URL
     */
    setUpdateModalImage(imageUrl) {
        const modal = document.getElementById('updateUserModal');
        if (!modal) return;

        const previewContainer = modal.querySelector('#update-user-image-preview');
        const previewImg = modal.querySelector('#update-user-preview-image');
        const imageUploadContent = modal.querySelector('#update-user-image-upload-content');
        const removeBtn = modal.querySelector('#removeImage');

        if (previewContainer && previewImg && imageUploadContent) {
            // 保存原始 HTML 结构（如果还没有保存）
            if (!previewContainer.getAttribute('data-original-content')) {
                const originalHTML = previewContainer.innerHTML;
                previewContainer.setAttribute('data-original-content', originalHTML);
            }

            // 显示图片，隐藏上传占位符
            previewImg.src = imageUrl;
            previewImg.classList.remove('d-none');
            previewImg.style.display = 'block';
            imageUploadContent.classList.add('d-none');
            imageUploadContent.style.display = 'none';

            // 显示移除按钮
            if (removeBtn) {
                removeBtn.classList.remove('d-none');
            }
        }
    }

    /**
     * 重置更新 Modal 图片
     * 注意：此函数只用于重置UI显示，不会设置 remove_image 标记
     */
    resetUpdateModalImage() {
        const modal = document.getElementById('updateUserModal');
        if (!modal) return;

        const previewContainer = modal.querySelector('#update-user-image-preview');
        const previewImg = modal.querySelector('#update-user-preview-image');
        const imageUploadContent = modal.querySelector('#update-user-image-upload-content');
        const removeBtn = modal.querySelector('#removeImage');
        const imageInput = modal.querySelector('#update_user_image');

        if (previewContainer) {
            // 隐藏图片，显示上传占位符
            if (previewImg) {
                previewImg.classList.add('d-none');
                previewImg.style.display = 'none';
                previewImg.src = '';
            }

            if (imageUploadContent) {
                imageUploadContent.classList.remove('d-none');
                imageUploadContent.style.display = '';

                // 恢复文本内容显示
                const textElements = imageUploadContent.querySelectorAll('h5, p');
                textElements.forEach(el => {
                    el.style.display = '';
                });
            }

            // 隐藏移除按钮
            if (removeBtn) {
                removeBtn.classList.add('d-none');
            }

            // 重置文件输入
            if (imageInput) {
                imageInput.value = '';
            }

            // 注意：不设置 remove_image，因为这应该只在用户确认移除时设置
        }
    }

    /**
     * 重置创建 Modal 表单
     */
    resetCreateModalForm() {
        const form = document.getElementById('createUserForm');
        if (form) {
            form.reset();
        }

        // 重置角色选择
        $('input[name="account_role"]').prop('checked', false);
        $('input[name="account_role"][value="Staff"]').prop('checked', true);
        $('.role-card').removeClass('selected');
        $('.role-card[data-role="Staff"]').addClass('selected');

        // 重置图片
        if (typeof window.ImageSystem !== 'undefined' && window.ImageSystem.resetImage) {
            window.ImageSystem.resetImage('create-user-image-area', {
                imageInputId: 'create_user_image',
                previewImageId: 'create-user-preview',
                previewIconId: 'create-user-preview-icon',
                imageUploadContentId: 'create-user-image-upload-content'
            });
        }
    }

    /**
     * 重置更新 Modal 表单
     */
    resetUpdateModalForm() {
        const form = document.getElementById('updateUserForm');
        if (form) {
            form.reset();
        }

        // 清空用户信息
        $('#update-user-info-content').html('');

        // 重置图片
        this.resetUpdateModalImage();

        // 重置移除图片标记
        const removeImageInput = document.getElementById('remove_image');
        if (removeImageInput) {
            removeImageInput.value = '0';
    }
}

/**
     * 提交创建用户
     */
    submitCreateUser() {
        const form = document.getElementById('createUserForm');
        if (!form) return;

        const formData = new FormData(form);
        const submitBtn = $('#submitCreateUser');
        const originalText = submitBtn.html();

        // 检查是否有图片
        const imageInput = document.getElementById('create_user_image');
        const hasImage = imageInput && imageInput.files && imageInput.files[0];

        // 禁用提交按钮
        submitBtn.prop('disabled', true).html('<i class="bi bi-hourglass-split me-2"></i>Creating...');

        $.ajax({
            url: form.action,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: (response) => {
                if (response.success) {
                    this.showAlert(response.message || 'User created successfully', 'success');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createUserModal'));
                    if (modal) {
                        modal.hide();
                    }
                    // 如果有图片，刷新整个页面；否则只更新 DOM
                    if (hasImage) {
            setTimeout(() => {
                            window.location.reload();
                        }, 1000);
        } else {
                        // 没有图片，重新载入当前页面以显示新记录
                        this.fetchUsers(1);
        }
        } else {
                    this.showAlert(response.message || 'Failed to create user', 'error');
                }
            },
            error: (xhr) => {
                let errorMessage = 'An error occurred while creating user';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseJSON && xhr.responseJSON.errors) {
                    const errors = Object.values(xhr.responseJSON.errors).flat();
                    errorMessage = errors.join('<br>');
                }
                this.showAlert(errorMessage, 'error');
            },
            complete: () => {
                submitBtn.prop('disabled', false).html(originalText);
            }
    });
}

/**
     * 提交更新用户
     */
    submitUpdateUser() {
        const form = document.getElementById('updateUserForm');
        if (!form) return;

        const userId = form.getAttribute('data-user-id');
        if (!userId) {
            this.showAlert('User ID not found', 'error');
                        return;
                    }

        const updateUrl = window.updateUserUrl || window.editUserUrl;
        if (!updateUrl) {
            this.showAlert('Update URL not configured', 'error');
                return;
            }

        const url = updateUrl.replace(':id', userId);
        const formData = new FormData(form);
        formData.append('_method', 'PUT');

        // 检查是否有图片相关的更改
        const modal = document.getElementById('updateUserModal');
        const imageInput = modal ? modal.querySelector('#update_user_image') : null;
        const removeImageInput = modal ? modal.querySelector('#remove_image') : null;
        const hasImageChange = (imageInput && imageInput.files && imageInput.files[0]) ||
                               (removeImageInput && removeImageInput.value === '1');

        const submitBtn = $('#submitUpdateUser');
        const originalText = submitBtn.html();

        // 禁用提交按钮
        submitBtn.prop('disabled', true).html('<i class="bi bi-hourglass-split me-2"></i>Updating...');

        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: (response) => {
                if (response.success) {
                    this.showAlert(response.message || 'User updated successfully', 'success');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('updateUserModal'));
                    if (modal) {
                        modal.hide();
                    }
                    // 如果有图片更改，刷新整个页面；否则只更新 DOM
                    if (hasImageChange) {
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } else {
                        // 没有图片更改，只更新 DOM
                        this.fetchUsers(this.currentPage);
                    }
                } else {
                    this.showAlert(response.message || 'Failed to update user', 'error');
                }
            },
            error: (xhr) => {
                let errorMessage = 'An error occurred while updating user';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseJSON && xhr.responseJSON.errors) {
                    const errors = Object.values(xhr.responseJSON.errors).flat();
                    errorMessage = errors.join('<br>');
                }
                this.showAlert(errorMessage, 'error');
            },
            complete: () => {
                submitBtn.prop('disabled', false).html(originalText);
            }
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
    if ($("#table-body").length > 0) {
        authDashboard = new AuthDashboard();

        // 導出方法到全局作用域
        window.editUser = (userId) => authDashboard.editUser(userId);
        window.deleteUser = (userId) => authDashboard.deleteUser(userId);
        window.setUserAvailable = (userId) => authDashboard.setUserAvailable(userId);
        window.setUserUnavailable = (userId) => authDashboard.setUserUnavailable(userId);
        window.changeRole = (userId) => authDashboard.changeRole(userId);
    }
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

// 導出主要函數到全局作用域
window.bindStatusSelectionEvents = bindStatusSelectionEvents;
window.bindRoleSelectionEvents = bindRoleSelectionEvents;

// Login 頁面函數
window.togglePassword = togglePassword;
window.togglePasswordConfirmation = togglePasswordConfirmation;
window.initializeLoginPage = initializeLoginPage;
window.initializeLoginFormSubmit = initializeLoginFormSubmit;
window.initializeResetFormSubmit = initializeResetFormSubmit;
window.initializeVerifyFormSubmit = initializeVerifyFormSubmit;
