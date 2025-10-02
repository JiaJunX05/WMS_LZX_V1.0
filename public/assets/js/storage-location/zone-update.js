/**
 * Zone Update Page JavaScript
 * 区域更新页面交互逻辑
 *
 * 功能：
 * - 区域信息更新
 * - 图片预览和上传
 * - 状态管理
 * - 表单验证和提交
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeZoneUpdate();
});

function initializeZoneUpdate() {
    // 绑定事件监听器
    bindEvents();

    // 初始化状态卡片选择
    initializeStatusCards();
}

function bindEvents() {
    // 图片上传预览
    const imageInput = document.getElementById('input_image');
    const previewContainer = document.querySelector('.preview-container');

    if (imageInput && previewContainer) {
        console.log('Image upload elements found');

        imageInput.addEventListener('change', function(e) {
            console.log('Image input changed:', e.target.files);
            handleImagePreview(e);
        });

        // 点击预览区域触发文件选择
        previewContainer.addEventListener('click', function() {
            console.log('Preview container clicked');
            imageInput.click();
        });

        // 拖拽上传支持
        previewContainer.addEventListener('dragover', function(e) {
            e.preventDefault();
            previewContainer.classList.add('dragover');
        });

        previewContainer.addEventListener('dragleave', function(e) {
            e.preventDefault();
            previewContainer.classList.remove('dragover');
        });

        previewContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            previewContainer.classList.remove('dragover');

            const files = e.dataTransfer.files;
            console.log('Files dropped:', files);
            if (files.length > 0) {
                imageInput.files = files;
                handleImagePreview({ target: imageInput });
            }
        });
    } else {
        console.error('Image upload elements not found');
    }

    // 表单提交事件
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(this);
        });
    }
}

function initializeStatusCards() {
    // 状态卡片选择
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            selectStatusCard(this);
        });
    });
}

function selectStatusCard(card) {
    // 移除所有选中状态
    const allCards = document.querySelectorAll('.status-card');
    allCards.forEach(c => c.classList.remove('selected'));

    // 添加选中状态到当前卡片
    card.classList.add('selected');

    // 更新对应的单选按钮
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
    }
}

function handleImagePreview(event) {
    const file = event.target.files[0];
    const previewContainer = document.querySelector('.preview-container');

    if (file) {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            showAlert('Please select a valid image file', 'warning');
            return;
        }

        // 验证文件大小 (5MB限制)
        if (file.size > 5 * 1024 * 1024) {
            showAlert('Image size must be less than 5MB', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" id="preview-image"
                         class="img-fluid rounded-3" style="max-width: 100%; max-height: 280px; object-fit: contain;">
                    <div class="image-remove-btn" title="Remove image">
                        <i class="bi bi-x"></i>
                    </div>
                `;

                // 添加删除按钮事件
                const removeBtn = previewContainer.querySelector('.image-remove-btn');
                if (removeBtn) {
                    removeBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        removeImage();
                    });
                }
            }
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    const imageInput = document.getElementById('input_image');
    const previewContainer = document.querySelector('.preview-container');

    if (imageInput && previewContainer) {
        // 重置文件输入
        imageInput.value = '';

        // 恢复原始内容
        const originalContent = previewContainer.getAttribute('data-original-content');
        if (originalContent) {
            previewContainer.innerHTML = originalContent;
        } else {
            // 如果没有原始内容，显示默认状态
            previewContainer.innerHTML = `
                <div class="text-center text-muted">
                    <i class="bi bi-image fs-1 mb-3 d-block"></i>
                    <p class="mb-0">No image uploaded</p>
                    <small>Upload an image to see preview</small>
                </div>
            `;
        }

        showAlert('Image removed successfully', 'success');
    }
}

function handleFormSubmit(form) {
    // 验证表单
    if (!validateForm()) {
        return;
    }

    // 显示加载状态
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Updating...';
    submitBtn.disabled = true;

    // 准备表单数据
    const formData = new FormData(form);

    // 提交数据
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
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
            showAlert(data.message || 'Zone updated successfully', 'success');

            // 延迟重定向到列表页面
            setTimeout(() => {
                window.location.href = window.zoneManagementRoute || '/admin/storage-locations/zone';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to update zone', 'error');
        }
    })
    .catch(error => {
        showAlert('Error updating zone: ' + error.message, 'error');
    })
    .finally(() => {
        // 恢复按钮状态
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function validateForm() {
    const zoneNameInput = document.getElementById('zone_name');
    const locationInput = document.getElementById('location');

    // 验证区域名称
    if (!zoneNameInput.value.trim()) {
        showAlert('Please enter zone name', 'warning');
        zoneNameInput.focus();
        return false;
    }

    // 验证区域位置
    if (!locationInput.value.trim()) {
        showAlert('Please enter zone location', 'warning');
        locationInput.focus();
        return false;
    }

    // 验证状态选择
    const selectedStatus = document.querySelector('input[name="zone_status"]:checked');
    if (!selectedStatus) {
        showAlert('Please select zone status', 'warning');
        return false;
    }

    return true;
}

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
