/**
 * Category Update Page JavaScript
 * 分类更新页面 JavaScript
 */

// ========================================
// 图片预览功能 (Image Preview Functions)
// ========================================

// 图片预览函数 - 用于模态框显示
function previewImage(src) {
    document.getElementById('previewImage').src = src;
    new bootstrap.Modal(document.getElementById('imagePreviewModal')).show();
}

// 文件上传预览功能 - 用于update页面
function setupImagePreview() {
    const fileInput = document.getElementById('input_image');
    const previewImage = document.getElementById('preview-image');
    const previewIcon = document.getElementById('preview-icon');
    const previewContainer = document.querySelector('.preview-container');

    if (fileInput && previewContainer) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // 替换整个容器内容
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = 'Preview';
                    img.id = 'preview-image';
                    img.className = 'img-fluid rounded-3';
                    img.style.cssText = 'max-width: 100%; max-height: 280px; object-fit: contain;';

                    previewContainer.innerHTML = '';
                    previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// ========================================
// 状态卡片选择功能 (Status Card Selection)
// ========================================

function setupStatusCardSelection() {
    const statusCards = document.querySelectorAll('.status-card');

    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除所有卡片的选中状态
            statusCards.forEach(c => c.classList.remove('selected'));

            // 添加选中状态到当前卡片
            this.classList.add('selected');

            // 更新对应的radio按钮
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });

    // 初始化选中状态
    const checkedRadio = document.querySelector('input[name="category_status"]:checked');
    if (checkedRadio) {
        const card = checkedRadio.closest('.status-card');
        if (card) {
            card.classList.add('selected');
        }
    }
}

// ========================================
// 表单提交处理 (Form Submission)
// ========================================

function setupFormSubmission() {
    // 处理 Category Update 表单提交
    const updateForm = document.querySelector('form[action*="update"]');
    if (updateForm) {
        console.log('Category update form found:', updateForm);
        updateForm.addEventListener('submit', handleCategoryUpdateSubmit);
    } else {
        console.log('Category update form not found');
    }
}

function handleCategoryUpdateSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    formData.append('_method', 'PUT');

    const updateUrl = form.action;

    fetch(updateUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 422) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Validation failed');
                });
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showAlert(data.message || 'Category updated successfully', 'success');
            setTimeout(() => {
                window.location.href = window.categoryManagementRoute || '/admin/categories';
            }, 1500);
        } else {
            showAlert(data.message || 'Failed to update category', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (error.message.includes('already exists')) {
            showAlert('This category name already exists. Please choose a different name.', 'warning');
        } else {
            showAlert('Error updating category: ' + error.message, 'error');
        }
    });
}

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用

// ========================================
// 页面初始化功能 (Page Initialization)
// ========================================

function initializeCategoryUpdate() {
    // 设置图片预览功能
    setupImagePreview();

    // 设置状态卡片选择功能
    setupStatusCardSelection();

    // 设置表单提交处理
    setupFormSubmission();
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
