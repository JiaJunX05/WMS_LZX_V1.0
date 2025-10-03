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
    // 绑定事件监听器
    bindEvents();

    // 初始化图片预览
    setupImagePreview();

    // 初始化状态卡片选择
    setupStatusCardSelection();
}

function bindEvents() {
    // 图片上传预览
    const imageInput = document.getElementById('brand_image');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            previewUploadedImage(e.target);
        });
    }

    // 状态卡片选择
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            selectStatusCard(this);
        });
    });
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

function previewUploadedImage(input) {
    const file = input.files[0];
    const preview = document.getElementById('image-preview');

    if (file && preview) {
        const reader = new FileReader();

        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" class="img-fluid rounded">
                <div class="mt-2">
                    <small class="text-success">New image selected</small>
                </div>
            `;
        };

        reader.readAsDataURL(file);
    }
}

// ========================================
// 状态卡片选择功能 (Status Card Selection)
// ========================================

function setupStatusCardSelection() {
    const statusCards = document.querySelectorAll('.status-card');
    const statusRadioInputs = document.querySelectorAll('input[name="brand_status"]');

    // 为每个状态卡片添加点击事件
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除所有卡片的选中状态
            statusCards.forEach(c => c.classList.remove('selected'));

            // 添加当前卡片的选中状态
            this.classList.add('selected');

            // 选中对应的单选按钮
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });

    // 为单选按钮添加变化事件
    statusRadioInputs.forEach(radio => {
        radio.addEventListener('change', function() {
            // 移除所有卡片的选中状态
            statusCards.forEach(c => c.classList.remove('selected'));

            // 添加对应卡片的选中状态
            const card = this.closest('.status-card');
            if (card) {
                card.classList.add('selected');
            }
        });
    });

    // 初始化选中状态
    const checkedRadio = document.querySelector('input[name="brand_status"]:checked');
    if (checkedRadio) {
        const card = checkedRadio.closest('.status-card');
        if (card) {
            card.classList.add('selected');
        }
    }
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

// ========================================
// 表单验证功能 (Form Validation)
// ========================================

// 表单提交前验证
document.addEventListener('DOMContentLoaded', function() {
    const brandForm = document.getElementById('brandForm');
    if (brandForm) {
        brandForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 获取表单数据
            const brandName = document.getElementById('brand_name').value.trim();
            const brandStatus = document.querySelector('input[name="brand_status"]:checked');

            // 验证输入
            if (!brandName) {
                showAlert('Please enter brand name', 'warning');
                document.getElementById('brand_name').focus();
                return;
            }

            if (!brandStatus) {
                showAlert('Please select brand status', 'warning');
                return;
            }

            // 提交表单
            submitForm();
        });
    }
});

function submitForm() {
    const form = document.getElementById('brandForm');
    const formData = new FormData(form);

    // 提交数据
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
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
            showAlert(data.message || 'Brand updated successfully', 'success');

            // 延迟重定向到dashboard，让用户看到成功消息
            setTimeout(() => {
                window.location.href = window.brandManagementRoute || '/admin/management/brands';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to update brand', 'error');
        }
    })
    .catch(error => {
        showAlert('Error updating brand: ' + error.message, 'error');
    });
}

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
