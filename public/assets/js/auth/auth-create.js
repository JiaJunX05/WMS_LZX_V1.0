/**
 * 用戶創建 JavaScript
 *
 * 功能模塊：
 * - 用戶信息輸入和驗證
 * - 動態界面更新
 * - 角色和狀態選擇
 * - 表單提交處理
 * - 表格格式顯示
 *
 * @author WMS Team
 * @version 1.0.0
 */
class AuthCreate {
    constructor() {
        this.users = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateConfigSummary();
        this.initializeRoleStatusSelection();
    }

    initializeRoleStatusSelection() {
        // 確保默認選中Staff角色
        if ($('.role-card[data-role="Staff"]').length > 0) {
            $('.role-card[data-role="Staff"]').addClass('selected');
            $('input[name="account_role"][value="Staff"]').prop('checked', true);
        }

        // 確保默認選中Available狀態
        if ($('.status-card[data-status="Available"]').length > 0) {
            $('.status-card[data-status="Available"]').addClass('selected');
            $('input[name="account_status"][value="Available"]').prop('checked', true);
        }
    }

    bindEvents() {
        // 添加用戶按鈕
        $('#addUser').on('click', () => {
            this.addUser();
        });

        // 用戶名稱輸入事件（Enter鍵）
        $('#user_name').on('keypress', (e) => {
            if (e.which === 13) {
                this.addUser();
            }
        });

        // 角色選擇事件 - 使用事件委托
        $(document).on('click', '.role-card', (e) => {
            this.handleRoleSelection(e);
        });

        // 狀態選擇事件 - 使用事件委托
        $(document).on('click', '.status-card', (e) => {
            this.handleStatusSelection(e);
        });

        // 快速操作按鈕
        $('#addCommonUsers').on('click', () => {
            this.addCommonUsers();
        });

        $('#addAdminUsers').on('click', () => {
            this.addAdminUsers();
        });

        $('#clearForm').on('click', () => {
            this.clearForm();
        });

        // 排序按鈕
        $('#sortUsers').on('click', () => {
            this.sortUsers();
        });

        // 表單提交事件
        $('#userForm').on('submit', (e) => {
            this.handleFormSubmit(e);
        });
    }

    addUser() {
        const name = $('#user_name').val().trim();
        const email = $('#user_email').val().trim();
        const password = $('#user_password').val().trim();
        const passwordConfirm = $('#user_password_confirmation').val().trim();

        if (!name) {
            showAlert('Please enter a user name', 'warning');
            return;
        }

        if (!email) {
            showAlert('Please enter an email address', 'warning');
            return;
        }

        if (!password) {
            showAlert('Please enter a password', 'warning');
            return;
        }

        if (!passwordConfirm) {
            showAlert('Please confirm the password', 'warning');
            return;
        }

        if (password !== passwordConfirm) {
            showAlert('Passwords do not match', 'danger');
            return;
        }

        if (password.length < 6) {
            showAlert('Password must be at least 6 characters long', 'warning');
            return;
        }

        // 檢查郵箱是否已存在
        if (this.users.some(user => user.email === email)) {
            showAlert('Email already exists in the list', 'warning');
            return;
        }

        // 添加用戶到列表
        const user = {
            name: name,
            email: email,
            password: password
        };

        this.users.push(user);

        // 清空輸入框
        $('#user_name').val('');
        $('#user_email').val('');
        $('#user_password').val('');
        $('#user_password_confirmation').val('');

        // 更新界面
        this.updateConfigSummary();
        this.updateUserValuesList();
    }

    updateConfigSummary() {
        if (this.users.length > 0) {
            $('#configSummary').show();
            $('#selectedUsers').text(`${this.users.length} users`);

            // 顯示角色選擇
            $('#roleSelection').show();

            // 顯示狀態選擇
            $('#statusSelection').show();

            // 顯示提交按鈕
            $('#submitSection').show();

            // 隱藏初始提示
            $('#initial-message').hide();
            $('#userValuesArea').show();
        } else {
            $('#configSummary').hide();
            $('#roleSelection').hide();
            $('#statusSelection').hide();
            $('#submitSection').hide();
            $('#initial-message').show();
            $('#userValuesArea').hide();
        }
    }

    updateUserValuesList() {
        const userValuesList = $('#userValuesList');
        const userValuesCount = $('#userValuesCount');

        userValuesCount.text(`${this.users.length} users`);

        if (this.users.length === 0) {
            userValuesList.html('<div class="text-center text-muted py-4"><i class="bi bi-person-plus fs-1 mb-3"></i><p>No users added yet</p></div>');
            return;
        }

        let html = '';
        this.users.forEach((user, index) => {
            // 檢查是否為重複項
            const isDuplicate = this.users.filter(u => u.email.toLowerCase() === user.email.toLowerCase()).length > 1;

            // 根據是否為重複項設置不同的樣式
            const baseClasses = 'item-value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
            const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

            html += `
                <div class="${baseClasses} ${duplicateClasses}" data-index="${index}">
                    <div class="d-flex align-items-center">
                        <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                            ${isDuplicate ? '⚠️' : (index + 1)}
                        </span>
                        <div class="me-2" style="width: 32px; height: 32px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                            <i class="bi bi-person text-muted"></i>
                        </div>
                        <div>
                            <div class="item-value-text fw-medium">${user.name}</div>
                            <div class="text-muted small">${user.email}</div>
                            ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                        <i class="bi bi-trash me-1"></i>Remove
                    </button>
                </div>
            `;
        });

        userValuesList.html(html);

        // 綁定刪除按鈕事件
        $('.remove-item').on('click', (e) => {
            const index = parseInt($(e.currentTarget).data('index'));
            this.removeUser(index);
        });
    }

    removeUser(index) {
        this.users.splice(index, 1);
        this.updateConfigSummary();
        this.updateUserValuesList();
    }

    sortUsers() {
        this.users.sort((a, b) => a.name.localeCompare(b.name));
        this.updateUserValuesList();

        // 切換排序圖標
        const sortIcon = $('#sortIcon');
        if (sortIcon.hasClass('bi-sort-down')) {
            sortIcon.removeClass('bi-sort-down').addClass('bi-sort-up');
        } else {
            sortIcon.removeClass('bi-sort-up').addClass('bi-sort-down');
        }
    }

    updateUserInfoDisplay() {
        const name = $('#user_name').val();
        const email = $('#user_email').val();
        const password = $('#user_password').val();
        const passwordConfirm = $('#user_password_confirmation').val();

        if (name && email && password && passwordConfirm) {
            const passwordMatch = password === passwordConfirm;
            const passwordStrength = this.getPasswordStrength(password);

            let statusClass = 'bg-info';
            let statusText = 'Ready to create';

            if (!passwordMatch) {
                statusClass = 'bg-warning';
                statusText = 'Passwords do not match';
            } else if (passwordStrength === 'weak') {
                statusClass = 'bg-warning';
                statusText = 'Weak password';
            } else if (passwordStrength === 'strong') {
                statusClass = 'bg-success';
                statusText = 'Ready to create';
            }

            $('#userInfoStatus').removeClass('bg-info bg-warning bg-success').addClass(statusClass).text(statusText);

            const userInfoHtml = `
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="card border-0 bg-light">
                            <div class="card-body">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-person-circle text-primary me-3 fs-4"></i>
                                    <div>
                                        <h6 class="mb-1">${name}</h6>
                                        <small class="text-muted">User Name</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card border-0 bg-light">
                            <div class="card-body">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-envelope text-primary me-3 fs-4"></i>
                                    <div>
                                        <h6 class="mb-1">${email}</h6>
                                        <small class="text-muted">Email Address</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card border-0 bg-light">
                            <div class="card-body">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-shield-check text-primary me-3 fs-4"></i>
                                    <div>
                                        <h6 class="mb-1">${this.getSelectedRole()}</h6>
                                        <small class="text-muted">User Role</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card border-0 bg-light">
                            <div class="card-body">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-toggle-on text-primary me-3 fs-4"></i>
                                    <div>
                                        <h6 class="mb-1">${this.getSelectedStatus()}</h6>
                                        <small class="text-muted">Account Status</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            $('#userInfoDisplay').html(userInfoHtml);
        }
    }

    handleRoleSelection(e) {
        // 防止重複觸發
        if ($(e.target).is('input[type="radio"]')) {
            return;
        }

        // 移除所有角色卡片的選中狀態
        $('.role-card').removeClass('selected');

        // 添加當前卡片的選中狀態
        $(e.currentTarget).addClass('selected');

        // 選中對應的單選按鈕
        const radio = $(e.currentTarget).find('input[type="radio"]');
        radio.prop('checked', true);

        this.updateConfigSummary();
    }

    handleStatusSelection(e) {
        // 防止重複觸發
        if ($(e.target).is('input[type="radio"]')) {
            return;
        }

        // 移除所有狀態卡片的選中狀態
        $('.status-card').removeClass('selected');

        // 添加當前卡片的選中狀態
        $(e.currentTarget).addClass('selected');

        // 選中對應的單選按鈕
        const radio = $(e.currentTarget).find('input[type="radio"]');
        radio.prop('checked', true);
    }

    getSelectedRole() {
        const selectedRole = $('input[name="account_role"]:checked').val();
        return selectedRole || 'Staff';
    }

    getSelectedStatus() {
        const selectedStatus = $('input[name="account_status"]:checked').val();
        return selectedStatus || 'Available';
    }

    getPasswordStrength(password) {
        if (password.length < 6) return 'weak';
        if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
        return 'medium';
    }

    addCommonUsers() {
        // 添加常見用戶到表格
        const commonUsers = [
            { name: 'John Smith', email: 'john.smith@company.com', password: 'password123' },
            { name: 'Jane Doe', email: 'jane.doe@company.com', password: 'password123' },
            { name: 'Mike Johnson', email: 'mike.johnson@company.com', password: 'password123' }
        ];

        let addedCount = 0;
        let skippedCount = 0;

        commonUsers.forEach(user => {
            if (!this.users.some(u => u.email === user.email)) {
                this.users.push(user);
                addedCount++;
            } else {
                skippedCount++;
            }
        });

        this.updateConfigSummary();
        this.updateUserValuesList();

        // 顯示結果
        if (addedCount > 0 && skippedCount === 0) {
            showAlert(`Successfully added ${addedCount} common users`, 'success');
        } else if (addedCount > 0 && skippedCount > 0) {
            showAlert(`Added ${addedCount} common users, ${skippedCount} already existed`, 'info');
        } else if (skippedCount > 0) {
            showAlert('All common users already exist in the list', 'warning');
        }
    }

    addAdminUsers() {
        // 添加管理員用戶到表格
        const adminUsers = [
            { name: 'Admin User', email: 'admin@company.com', password: 'admin123' },
            { name: 'Manager User', email: 'manager@company.com', password: 'admin123' }
        ];

        let addedCount = 0;
        let skippedCount = 0;

        adminUsers.forEach(user => {
            if (!this.users.some(u => u.email === user.email)) {
                this.users.push(user);
                addedCount++;
            } else {
                skippedCount++;
            }
        });

        this.updateConfigSummary();
        this.updateUserValuesList();

        // 顯示結果
        if (addedCount > 0 && skippedCount === 0) {
            showAlert(`Successfully added ${addedCount} admin users`, 'success');
        } else if (addedCount > 0 && skippedCount > 0) {
            showAlert(`Added ${addedCount} admin users, ${skippedCount} already existed`, 'info');
        } else if (skippedCount > 0) {
            showAlert('All admin users already exist in the list', 'warning');
        }
    }

    clearForm() {
        this.users = [];
        $('#user_name, #user_email, #user_password, #user_password_confirmation').val('');

        // 重置角色選擇
        $('.role-card').removeClass('selected');
        $('input[name="account_role"]').prop('checked', false);
        $('input[name="account_role"][value="Staff"]').prop('checked', true);
        $('.role-card[data-role="Staff"]').addClass('selected');

        // 重置狀態選擇
        $('.status-card').removeClass('selected');
        $('input[name="account_status"]').prop('checked', false);
        $('input[name="account_status"][value="Available"]').prop('checked', true);
        $('.status-card[data-status="Available"]').addClass('selected');

        this.updateConfigSummary();
        this.updateUserValuesList();
    }

    handleFormSubmit(e) {
        e.preventDefault();

        if (this.users.length === 0) {
            showAlert('Please add at least one user', 'warning');
            return;
        }

        const role = this.getSelectedRole();
        const status = this.getSelectedStatus();

        // 準備批量用戶數據
        const usersData = this.users.map(user => ({
            name: user.name,
            email: user.email,
            password: user.password,
            account_role: role,
            account_status: status
        }));

        // 顯示提交狀態
        const submitBtn = $(e.target).find('button[type="submit"]');
        submitBtn.prop('disabled', true).html('<i class="bi bi-hourglass-split me-2"></i>Creating Users...');

        // 使用通用函數創建用戶
        handleAuthRequest(window.createUserUrl, 'POST', { users: usersData }, {
            successMessage: 'Users created successfully!',
            errorMessage: 'Failed to create users',
            redirect: window.userManagementRoute,
            onSuccess: () => {
                submitBtn.prop('disabled', false).html('<i class="bi bi-stack me-2"></i>Create Users');
            },
            onError: () => {
                submitBtn.prop('disabled', false).html('<i class="bi bi-stack me-2"></i>Create Users');
            }
        });
    }

}


// 初始化
let authCreate;
$(document).ready(function() {
    authCreate = new AuthCreate();
});
