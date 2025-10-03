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
    // 绑定事件监听器
    bindEvents();

    // 初始化状态卡片选择
    setupStatusCardSelection();
}

function bindEvents() {
    // 状态卡片选择
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            selectStatusCard(this);
        });
    });
}

// ========================================
// 状态卡片选择功能 (Status Card Selection)
// ========================================

function setupStatusCardSelection() {
    const statusCards = document.querySelectorAll('.status-card');
    const statusRadioInputs = document.querySelectorAll('input[name="gender_status"]');

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
    const checkedRadio = document.querySelector('input[name="gender_status"]:checked');
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
    const genderForm = document.getElementById('genderForm');
    if (genderForm) {
        genderForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 获取表单数据
            const genderName = document.getElementById('gender_name').value.trim();
            const genderStatus = document.querySelector('input[name="gender_status"]:checked');

            // 验证输入
            if (!genderName) {
                showAlert('Please enter gender name', 'warning');
                document.getElementById('gender_name').focus();
                return;
            }

            if (!genderStatus) {
                showAlert('Please select gender status', 'warning');
                return;
            }

            // 提交表单
            submitForm();
        });
    }
});

function submitForm() {
    const form = document.getElementById('genderForm');
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
            showAlert(data.message || 'Gender updated successfully', 'success');

            // 延迟重定向到dashboard，让用户看到成功消息
            setTimeout(() => {
                window.location.href = window.genderManagementRoute || '/admin/management/genders';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to update gender', 'error');
        }
    })
    .catch(error => {
        showAlert('Error updating gender: ' + error.message, 'error');
    });
}

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
