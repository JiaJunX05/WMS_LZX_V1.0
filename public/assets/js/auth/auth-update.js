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


// Zone 方式：移除初始化函數，依賴硬編碼的 selected 類

// 初始化
let authUpdate;
$(document).ready(function() {
    authUpdate = new AuthUpdate();

    // 延遲初始化，確保 DOM 完全加載
    setTimeout(() => {
        console.log('Initializing auth update page...');

        // 檢查元素是否存在
        const roleCards = document.querySelectorAll('.role-card');
        const statusCards = document.querySelectorAll('.status-card');
        console.log('Found role cards:', roleCards.length);
        console.log('Found status cards:', statusCards.length);

        // Zone 方式：只綁定點擊事件，依賴硬編碼的 selected 類
        console.log('About to call bindAuthEvents...');
        bindAuthEvents({
            roleCardSelector: '.role-card',
            statusCardSelector: '.status-card',
            formSelector: '#updateUserForm'
        });
        console.log('bindAuthEvents called successfully');

        // 測試點擊事件是否被綁定
        setTimeout(() => {
            console.log('Testing click events...');
            const roleCards = document.querySelectorAll('.role-card');
            const statusCards = document.querySelectorAll('.status-card');
            console.log('Role cards found:', roleCards.length);
            console.log('Status cards found:', statusCards.length);

            // 手動測試點擊
            roleCards.forEach((card, index) => {
                console.log(`Role card ${index}:`, card);
            });
            statusCards.forEach((card, index) => {
                console.log(`Status card ${index}:`, card);
            });
        }, 500);

        // 綁定表單提交事件
        $('#updateUserForm').on('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(e.target);
            const pathParts = window.location.pathname.split('/');
            const userId = pathParts[pathParts.length - 2]; // 獲取倒數第二個部分（用戶ID）

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

            // 調試信息
            console.log('Form data:', userData);
            console.log('User ID:', userId);
            console.log('Update URL:', window.updateUserUrl);

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
        });
    }, 100);
});
