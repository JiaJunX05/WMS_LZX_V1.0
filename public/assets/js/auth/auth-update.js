/**
 * 用戶更新 JavaScript
 *
 * 功能模塊：
 * - 用戶信息編輯和驗證
 * - 角色和狀態更新
 * - 表單提交處理
 * - 動態界面更新
 *
 * @author WMS Team
 * @version 2.0.0 - Using Common Functions
 */
class AuthUpdate {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUserInfoDisplay();
    }

    bindEvents() {
        // 用戶信息輸入事件
        $('#name, #email, #password, #password_confirmation').on('input', () => {
            this.updateUserInfoDisplay();
        });
    }

    updateUserInfoDisplay() {
        const name = $('#name').val();
        const email = $('#email').val();
        const password = $('#password').val();
        const passwordConfirm = $('#password_confirmation').val();

        // 更新員工卡片信息
        if (name) {
            $('.employee-info .info-row:first .value').text(name);
        }
        if (email) {
            $('.employee-info .info-row:nth-child(2) .value').text(email);
        }

        // 檢查密碼匹配
        if (password && passwordConfirm) {
            if (password !== passwordConfirm) {
                this.showPasswordMismatch();
            } else {
                this.hidePasswordMismatch();
            }
        }
    }

    showPasswordMismatch() {
        const passwordConfirm = $('#password_confirmation');
        passwordConfirm.addClass('is-invalid');

        if (!passwordConfirm.siblings('.invalid-feedback').length) {
            passwordConfirm.after('<div class="invalid-feedback">Passwords do not match</div>');
        }
    }

    hidePasswordMismatch() {
        const passwordConfirm = $('#password_confirmation');
        passwordConfirm.removeClass('is-invalid');
        passwordConfirm.siblings('.invalid-feedback').remove();
    }
}


// 初始化角色和狀態卡片選擇狀態
function initializeCardSelection() {
    // 初始化角色卡片選中狀態
    const checkedRoleRadio = document.querySelector('input[name="account_role"]:checked');
    if (checkedRoleRadio) {
        const card = checkedRoleRadio.closest('.role-card');
        if (card) {
            card.classList.add('selected');
        }
    }

    // 初始化狀態卡片選中狀態
    const checkedStatusRadio = document.querySelector('input[name="account_status"]:checked');
    if (checkedStatusRadio) {
        const card = checkedStatusRadio.closest('.status-card');
        if (card) {
            card.classList.add('selected');
        }
    }
}

// 初始化
let authUpdate;
$(document).ready(function() {
    authUpdate = new AuthUpdate();

    // 使用通用函數初始化Auth頁面
    initializeAuthPage({
        events: {
            formSubmitHandler: (e) => {
                e.preventDefault();

                const formData = new FormData(e.target);
                const userId = window.location.pathname.split('/').pop();

                // 轉換為普通對象並添加驗證
                const userData = Object.fromEntries(formData);

                // 使用通用驗證函數
                const validation = validateAuthForm(userData, {
                    password: { minLength: 6, required: false },
                    password_confirmation: { match: 'password', required: false }
                });

                if (!validation.isValid) {
                    showAlert(validation.errors.join(', '), 'warning');
                    return;
                }

                // 顯示提交狀態
                const submitBtn = $(e.target).find('button[type="submit"]');
                submitBtn.prop('disabled', true).html('<i class="bi bi-hourglass-split me-2"></i>Updating User...');

                updateUser(userId, userData, {
                    successMessage: 'User updated successfully!',
                    errorMessage: 'Failed to update user',
                    redirect: window.updateUserRedirect || '/users',
                    onSuccess: () => {
                        submitBtn.prop('disabled', false).html('<i class="bi bi-pencil-square me-2"></i>Update User Information');
                    },
                    onError: () => {
                        submitBtn.prop('disabled', false).html('<i class="bi bi-pencil-square me-2"></i>Update User Information');
                    }
                });
            }
        },
        onInit: () => {
            // 初始化角色和狀態卡片選擇
            bindAuthEvents({
                roleCardSelector: '.role-card',
                statusCardSelector: '.status-card'
            });

            // 初始化選中狀態
            initializeCardSelection();
        }
    });
});
