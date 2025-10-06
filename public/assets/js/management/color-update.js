/**
 * Color Update Page JavaScript
 * 颜色更新页面交互逻辑
 *
 * 功能：
 * - 颜色信息编辑
 * - 颜色预览功能
 * - 状态管理
 * - 表单验证和提交
 *
 * @author WMS Team
 * @version 1.0.0
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化颜色更新页面
    initializeColorUpdate();
});

function initializeColorUpdate() {
    // 使用通用函數初始化顏色頁面
    initializeColorPage({
        events: {
            formSubmit: function(e) {
                e.preventDefault();

                // 获取表单数据
                const formData = new FormData(e.target);
                const colorData = Object.fromEntries(formData);

                // 獲取當前顏色ID
                const colorId = window.location.pathname.split('/').pop();

                // 使用新的驗證函數（包含重複檢查）
                validateColorUpdateForm(colorData, { currentId: colorId })
                    .then(validation => {
                        if (!validation.isValid) {
                            showAlert(validation.errors.join(', '), 'warning');
                            return;
                        }

                        // 使用通用函數提交
                        updateColor(colorId, formData, {
                            url: window.updateColorUrl,
                            redirect: window.colorManagementRoute
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
    // 颜色代码输入框实时预览 - 使用通用函数
    // bindColorEvents() 在 initializeColorPage() 中调用

    // 確保頁面加載時初始化 RGB 值
    const hexInput = document.getElementById('color_hex');
    const rgbInput = document.getElementById('color_rgb');

    if (hexInput && rgbInput && hexInput.value) {
        // 如果 HEX 欄位有值，自動生成 RGB
        const rgb = hexToRgb(hexInput.value);
        if (rgb) {
            rgbInput.value = `${rgb.r},${rgb.g},${rgb.b}`;
        }
    }
}

// ========================================
// 颜色预览功能 (Color Preview Functions)
// ========================================

// setupColorPreview, updateColorPreview, hexToRgb, isValidColorCode 函數已移至 color-common.js

// ========================================
// 状态卡片选择功能 (Status Card Selection)
// ========================================

// setupStatusCardSelection 和 selectStatusCard 函數已移至 color-common.js

// ========================================
// 表单验证功能 (Form Validation)
// ========================================

// 表單驗證和提交處理已移至 initializeColorPage 的 events.formSubmit 中

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函數已移至 alert-system.js
