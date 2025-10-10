/**
 * 通用 Auth 操作 JavaScript
 * Common Auth Operations JavaScript
 *
 * 功能模塊：
 * - 用戶CRUD操作 (Create, Read, Update, Delete)
 * - 用戶狀態管理 (Available, Unavailable)
 * - 角色管理 (Role Change)
 * - 統一的錯誤處理和成功提示
 *
 * @author WMS Team
 * @version 1.0.0
 */

/**
 * 通用角色卡片選擇函數
 */
function selectRoleCard(card) {
    console.log('selectRoleCard called', card);

    // 移除所有角色卡片的選中狀態
    document.querySelectorAll('.role-card').forEach(c => {
        c.classList.remove('selected');
        console.log('Removed selected from role card:', c);
    });

    // 添加選中狀態到當前卡片
    card.classList.add('selected');
    console.log('Added selected to role card:', card);

    // 更新對應的radio按鈕
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
        console.log('Role radio checked:', radio.value);
    }
}

/**
 * 通用AJAX請求處理函數
 * @param {string} url - 請求URL
 * @param {string} method - HTTP方法
 * @param {Object} data - 請求數據
 * @param {Object} options - 配置選項
 */
function handleAuthRequest(url, method, data = {}, options = {}) {
    const defaultOptions = {
        successMessage: 'Operation completed successfully',
        errorMessage: 'Operation failed',
        showAlert: true,
        redirect: null,
        redirectDelay: 1500,
        onSuccess: null,
        onError: null
    };

    const config = { ...defaultOptions, ...options };

    console.log('Making request to:', url);
    console.log('Method:', method);
    console.log('Data:', data);

    return fetch(url, {
        method: method,
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 422) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Validation failed');
                });
            }
            throw new Error(`Network response was not ok (${response.status})`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            if (config.showAlert) {
                showAlert(data.message || config.successMessage, 'success');
            }

            if (config.onSuccess && typeof config.onSuccess === 'function') {
                config.onSuccess(data);
            }

            if (config.redirect) {
                setTimeout(() => {
                    window.location.href = config.redirect;
                }, config.redirectDelay);
            }

            return data;
        } else {
            throw new Error(data.message || config.errorMessage);
        }
    })
    .catch(error => {
        console.error('Auth Request Error:', error);

        if (config.showAlert) {
            showAlert(error.message || config.errorMessage, 'error');
        }

        if (config.onError && typeof config.onError === 'function') {
            config.onError(error);
        }

        throw error;
    });
}

/**
 * 創建用戶
 * @param {Object} userData - 用戶數據
 * @param {Object} options - 配置選項
 */
function createUser(userData, options = {}) {
    const defaultOptions = {
        successMessage: 'User created successfully!',
        errorMessage: 'Failed to create user',
        redirect: window.createUserRedirect || null
    };

    return handleAuthRequest(
        window.createUserUrl || '/users',
        'POST',
        userData,
        { ...defaultOptions, ...options }
    );
}

/**
 * 更新用戶
 * @param {number} userId - 用戶ID
 * @param {Object} userData - 用戶數據
 * @param {Object} options - 配置選項
 */
function updateUser(userId, userData, options = {}) {
    const defaultOptions = {
        successMessage: 'User updated successfully!',
        errorMessage: 'Failed to update user',
        redirect: window.updateUserRedirect || null
    };

    const url = (window.updateUserUrl || '/users/:id').replace(':id', userId);

    return handleAuthRequest(
        url,
        'PUT',
        userData,
        { ...defaultOptions, ...options }
    );
}

/**
 * 刪除用戶
 * @param {number} userId - 用戶ID
 * @param {Object} options - 配置選項
 */
function deleteUser(userId, options = {}) {
    const defaultOptions = {
        successMessage: 'User deleted successfully!',
        errorMessage: 'Failed to delete user',
        confirmMessage: 'Are you sure you want to delete this user?',
        onSuccess: (data) => {
            // 重新加載統計和用戶列表
            if (window.authDashboard) {
                window.authDashboard.loadStats();
                window.authDashboard.fetchUsers(window.authDashboard.currentPage);
            }
        }
    };

    const config = { ...defaultOptions, ...options };

    if (!confirm(config.confirmMessage)) {
        return Promise.resolve();
    }

    const url = (window.deleteUserUrl || '/users/:id').replace(':id', userId);

    return handleAuthRequest(
        url,
        'DELETE',
        {},
        config
    );
}

/**
 * 設置用戶為可用狀態
 * @param {number} userId - 用戶ID
 * @param {Object} options - 配置選項
 */
function setUserAvailable(userId, options = {}) {
    const defaultOptions = {
        successMessage: 'User activated successfully!',
        errorMessage: 'Failed to activate user',
        confirmMessage: 'Are you sure you want to activate this user?',
        onSuccess: (data) => {
            // 重新加載統計和用戶列表
            if (window.authDashboard) {
                window.authDashboard.loadStats();
                window.authDashboard.fetchUsers(window.authDashboard.currentPage);
            }
        }
    };

    const config = { ...defaultOptions, ...options };

    if (!confirm(config.confirmMessage)) {
        return Promise.resolve();
    }

    const url = (window.availableUserUrl || '/users/:id/available').replace(':id', userId);

    return handleAuthRequest(
        url,
        'PATCH',
        {},
        config
    );
}

/**
 * 設置用戶為不可用狀態
 * @param {number} userId - 用戶ID
 * @param {Object} options - 配置選項
 */
function setUserUnavailable(userId, options = {}) {
    const defaultOptions = {
        successMessage: 'User deactivated successfully!',
        errorMessage: 'Failed to deactivate user',
        confirmMessage: 'Are you sure you want to deactivate this user?',
        onSuccess: (data) => {
            // 重新加載統計和用戶列表
            if (window.authDashboard) {
                window.authDashboard.loadStats();
                window.authDashboard.fetchUsers(window.authDashboard.currentPage);
            }
        }
    };

    const config = { ...defaultOptions, ...options };

    if (!confirm(config.confirmMessage)) {
        return Promise.resolve();
    }

    const url = (window.unavailableUserUrl || '/users/:id/unavailable').replace(':id', userId);

    return handleAuthRequest(
        url,
        'PATCH',
        {},
        config
    );
}

/**
 * 更改用戶角色
 * @param {number} userId - 用戶ID
 * @param {string} newRole - 新角色
 * @param {Object} options - 配置選項
 */
function changeUserRole(userId, newRole, options = {}) {
    // 檢查是否是修改自己
    if (window.currentUserId && parseInt(userId) === parseInt(window.currentUserId)) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('You cannot change your own role', 'warning');
        } else {
            alert('You cannot change your own role');
        }
        return Promise.resolve();
    }

    const defaultOptions = {
        successMessage: 'User role changed successfully!',
        errorMessage: 'Failed to change user role',
        confirmMessage: `Are you sure you want to change the user role to ${newRole}?`,
        onSuccess: (data) => {
            // 關閉模態框
            const modal = document.getElementById('roleChangeModal');
            if (modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            }

            // 重新加載統計和用戶列表
            if (window.authDashboard) {
                window.authDashboard.loadStats();
                window.authDashboard.fetchUsers(window.authDashboard.currentPage);
            }
        }
    };

    const config = { ...defaultOptions, ...options };

    if (!confirm(config.confirmMessage)) {
        return Promise.resolve();
    }

    const url = (window.changeRoleUrl || '/users/:id/change-role').replace(':id', userId);

    return handleAuthRequest(
        url,
        'PATCH',
        { account_role: newRole },
        config
    );
}

/**
 * 通用表單驗證函數
 * @param {Object} formData - 表單數據
 * @param {Object} rules - 驗證規則
 */
function validateAuthForm(formData, rules = {}) {
    const defaultRules = {
        name: { required: true, minLength: 2 },
        email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        password: { minLength: 6 },
        password_confirmation: { match: 'password' }
    };

    const validationRules = { ...defaultRules, ...rules };
    const errors = [];

    for (const [field, rule] of Object.entries(validationRules)) {
        const value = formData[field];

        if (rule.required && (!value || value.trim() === '')) {
            errors.push(`${field} is required`);
            continue;
        }

        if (rule.minLength && value && value.length < rule.minLength) {
            errors.push(`${field} must be at least ${rule.minLength} characters long`);
        }

        if (rule.pattern && value && !rule.pattern.test(value)) {
            errors.push(`${field} format is invalid`);
        }

        if (rule.match && value && value !== formData[rule.match]) {
            errors.push(`${rule.match} and ${field} do not match`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 通用事件綁定函數
 * @param {Object} config - 配置對象
 */
function bindAuthEvents(config = {}) {
    const defaultConfig = {
        roleCardSelector: '.role-card',
        statusCardSelector: '.status-card',
        formSelector: 'form',
        additionalEvents: []
    };

    const eventConfig = { ...defaultConfig, ...config };

    // 角色卡片選擇
    const roleCards = document.querySelectorAll(eventConfig.roleCardSelector);
    console.log('Binding events to role cards:', roleCards.length);
    roleCards.forEach(card => {
        card.addEventListener('click', () => {
            console.log('Role card clicked');
            selectRoleCard(card);
        });

        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
            radio.addEventListener('change', () => {
                console.log('Role radio changed');
                selectRoleCard(card);
            });
        }
    });

    // 狀態卡片選擇
    const statusCards = document.querySelectorAll(eventConfig.statusCardSelector);
    console.log('Binding events to status cards:', statusCards.length);
    statusCards.forEach(card => {
        card.addEventListener('click', () => {
            console.log('Status card clicked');
            selectStatusCard(card);
        });

        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
            radio.addEventListener('change', () => {
                console.log('Status radio changed');
                selectStatusCard(card);
            });
        }
    });

    // 表單提交
    const form = document.querySelector(eventConfig.formSelector);
    if (form && eventConfig.formSubmitHandler) {
        form.addEventListener('submit', eventConfig.formSubmitHandler);
    }

    // 綁定額外事件
    eventConfig.additionalEvents.forEach(event => {
        const element = document.querySelector(event.selector);
        if (element && event.handler) {
            element.addEventListener(event.event, event.handler);
        }
    });
}

/**
 * 密碼顯示切換函數
 */
function togglePassword(passwordId, toggleId) {
    const password = document.getElementById(passwordId);
    const toggle = document.getElementById(toggleId);

    if (password.type === 'password') {
        password.type = 'text';
        toggle.classList.replace('bi-eye-slash', 'bi-eye');
    } else {
        password.type = 'password';
        toggle.classList.replace('bi-eye', 'bi-eye-slash');
    }
}

/**
 * 初始化Auth頁面
 * @param {Object} config - 配置對象
 */
function initializeAuthPage(config = {}) {
    // 綁定事件
    bindAuthEvents(config.events || {});

    // 執行初始化回調
    if (config.onInit && typeof config.onInit === 'function') {
        config.onInit();
    }
}
