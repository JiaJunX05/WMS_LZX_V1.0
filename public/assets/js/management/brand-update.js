/**
 * Brand Update Page JavaScript
 * 品牌更新页面交互逻辑
 *
 * 功能：
 * - 品牌信息编辑
 * - 图片上传和预览
 * - 状态管理
 * - 表单验证和提交
 *
 * @author WMS Team
 * @version 1.0.0
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化品牌更新页面
    initializeBrandUpdate();
});

function initializeBrandUpdate() {
    // 使用通用函數初始化品牌頁面
    initializeBrandPage({
        events: {
            formSubmit: function(e) {
                e.preventDefault();

                // 获取表单数据
                const formData = new FormData(e.target);
                const brandData = Object.fromEntries(formData);

                // 獲取當前品牌ID
                const brandId = window.location.pathname.split('/').pop();

                // 使用新的驗證函數（包含重複檢查）
                validateBrandUpdateForm(brandData, { currentId: brandId })
                    .then(validation => {
                        if (!validation.isValid) {
                            showAlert(validation.errors.join(', '), 'warning');
                            return;
                        }

                        // 使用通用函數提交
                        updateBrand(brandId, formData, {
                            url: window.updateBrandUrl,
                            redirect: window.brandManagementRoute
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

            // 初始化圖片預覽
            setupImagePreview();
        }
    });
}

function bindEvents() {
    // 綁定圖片文件選擇事件
    const imageInput = document.getElementById('input_image');
    if (imageInput) {
        imageInput.addEventListener('change', function(event) {
            previewUploadedImage(this);
        });
    }
}

// ========================================
// 图片预览功能 (Image Preview Functions)
// ========================================

function setupImagePreview() {
    // 如果有现有图片，显示预览
    const existingImage = document.getElementById('existing-image');
    if (existingImage) {
        const imageSrc = existingImage.getAttribute('data-src');
        if (imageSrc) {
            const preview = document.getElementById('image-preview');
            if (preview) {
                preview.innerHTML = `
                    <img src="${imageSrc}" alt="Current Brand Image" class="img-fluid rounded">
                    <div class="mt-2">
                        <small class="text-muted">Current image</small>
                    </div>
                `;
            }
        }
    }
}

// previewUploadedImage 函數已移至 brand-common.js

// ========================================
// 状态卡片选择功能 (Status Card Selection)
// ========================================

// setupStatusCardSelection 和 selectStatusCard 函數已移至 brand-common.js

// ========================================
// 表单验证功能 (Form Validation)
// ========================================

// 表單驗證和提交處理已移至 initializeBrandPage 的 events.formSubmit 中

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函數已移至 alert-system.js
