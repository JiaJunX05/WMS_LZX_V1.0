/**
 * Category Update Page JavaScript
 * 分类更新页面 JavaScript
 */

// ========================================
// 图片预览功能 (Image Preview Functions)
// ========================================

// previewImage 函數已移至 category-common.js

// setupImagePreview, setupStatusCardSelection, setupFormSubmission 函數已移至 category-common.js

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函數已移至 alert-system.js

// ========================================
// 页面初始化功能 (Page Initialization)
// ========================================

function initializeCategoryUpdate() {
    // 使用通用函數初始化分類頁面
    initializeCategoryPage({
        events: {
            formSubmit: function(e) {
                e.preventDefault();

                // 获取表单数据
                const formData = new FormData(e.target);
                const categoryData = Object.fromEntries(formData);

                // 獲取當前分類ID
                const categoryId = window.location.pathname.split('/').pop();

                // 使用新的驗證函數（包含重複檢查）
                validateCategoryUpdateForm(categoryData, { currentId: categoryId })
                    .then(validation => {
                        if (!validation.isValid) {
                            showAlert(validation.errors.join(', '), 'warning');
                            return;
                        }

                        // 使用通用函數提交
                        updateCategory(categoryId, formData, {
                            url: window.updateCategoryUrl,
                            redirect: window.categoryManagementRoute
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

// ========================================
// 全局初始化 (Global Initialization)
// ========================================

$(document).ready(function() {
    // 如果是update页面（有input_image元素）
    if ($("#input_image").length > 0) {
        console.log('Initializing category update page');
        initializeCategoryUpdate();
    }
});

// 使用原生JavaScript的DOMContentLoaded作为备用
document.addEventListener('DOMContentLoaded', function() {
    // 如果jQuery没有加载，使用原生JavaScript初始化
    if (typeof $ === 'undefined') {
        initializeCategoryUpdate();
    }
});
