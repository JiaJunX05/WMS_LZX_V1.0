/**
 * Gender Update Page JavaScript
 * 性别更新页面交互逻辑
 *
 * 功能：
 * - 性别信息编辑
 * - 状态管理
 * - 表单验证和提交
 *
 * @author WMS Team
 * @version 1.0.0
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化性别更新页面
    initializeGenderUpdate();
});

function initializeGenderUpdate() {
    // 使用通用函數初始化性別頁面
    initializeGenderPage({
        events: {
            formSubmit: function(e) {
                e.preventDefault();

                // 获取表单数据
                const formData = new FormData(e.target);
                const genderData = Object.fromEntries(formData);

                // 獲取當前性別ID
                const genderId = window.location.pathname.split('/').pop();

                // 使用新的驗證函數（包含重複檢查）
                validateGenderUpdateForm(genderData, { currentId: genderId })
                    .then(validation => {
                        if (!validation.isValid) {
                            showAlert(validation.errors.join(', '), 'warning');
                            return;
                        }

                        // 使用通用函數提交
                        updateGender(genderId, formData, {
                            url: window.updateGenderUrl,
                            redirect: window.genderManagementRoute
                        });
                    })
                    .catch(error => {
                        console.error('Validation error:', error);
                        showAlert('Validation failed. Please try again.', 'error');
                    });
            }
        },
        onInit: function() {
            // 綁定特定事件
            bindEvents();
        }
    });
}

function bindEvents() {
    // 状态卡片选择 - 使用通用函数
    // bindGenderEvents() 在 initializeGenderPage() 中调用
}

// ========================================
// 状态卡片选择功能 (Status Card Selection)
// ========================================

// setupStatusCardSelection 和 selectStatusCard 函數已移至 gender-common.js

// ========================================
// 表单验证功能 (Form Validation)
// ========================================

// 表單驗證和提交處理已移至 initializeGenderPage 的 events.formSubmit 中

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函數已移至 alert-system.js
