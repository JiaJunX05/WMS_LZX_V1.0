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
    // 绑定事件监听器
    bindEvents();

    // 初始化颜色预览
    setupColorPreview();

    // 初始化状态卡片选择
    setupStatusCardSelection();
}

function bindEvents() {
    // 颜色代码输入框实时预览
    const colorHexInput = document.getElementById('color_hex');
    if (colorHexInput) {
        colorHexInput.addEventListener('input', function() {
            updateColorPreview();
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
// 颜色预览功能 (Color Preview Functions)
// ========================================

function setupColorPreview() {
    const hexInput = document.getElementById('color_hex');
    const rgbInput = document.getElementById('color_rgb');
    const colorPreview = document.getElementById('color-preview');

    if (hexInput && colorPreview) {
        // 实时更新颜色预览
        function updateColorPreview() {
            const hexValue = hexInput.value;
            if (hexValue && /^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
                colorPreview.style.backgroundColor = hexValue;

                // 自动生成RGB代码
                if (rgbInput) {
                    const rgb = hexToRgb(hexValue);
                    if (rgb) {
                        rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                    }
                }
            }
        }

        // 监听输入变化
        hexInput.addEventListener('input', updateColorPreview);

        // 初始化预览
        updateColorPreview();
    }
}

function updateColorPreview() {
    const colorHexInput = document.getElementById('color_hex');
    const colorPreview = document.getElementById('color-preview');

    if (colorHexInput && colorPreview) {
        const colorValue = colorHexInput.value.trim();
        if (colorValue && isValidColorCode(colorValue)) {
            const normalizedColor = colorValue.startsWith('#') ? colorValue : '#' + colorValue;
            colorPreview.style.backgroundColor = normalizedColor;
            colorPreview.style.display = 'block';
        } else {
            colorPreview.style.display = 'none';
        }
    }
}

// HEX转RGB函数
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function isValidColorCode(colorCode) {
    // 移除#号进行验证
    const cleanCode = colorCode.replace('#', '');
    // 验证6位十六进制代码
    return /^[0-9A-Fa-f]{6}$/.test(cleanCode);
}

// ========================================
// 状态卡片选择功能 (Status Card Selection)
// ========================================

function setupStatusCardSelection() {
    const statusCards = document.querySelectorAll('.status-card');
    const statusRadioInputs = document.querySelectorAll('input[name="color_status"]');

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
    const checkedRadio = document.querySelector('input[name="color_status"]:checked');
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
    const colorForm = document.getElementById('colorForm');
    if (colorForm) {
        colorForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 获取表单数据
            const colorName = document.getElementById('color_name').value.trim();
            const colorHex = document.getElementById('color_hex').value.trim();
            const colorStatus = document.querySelector('input[name="color_status"]:checked');

            // 验证输入
            if (!colorName) {
                showAlert('Please enter color name', 'warning');
                document.getElementById('color_name').focus();
                return;
            }

            if (!colorHex) {
                showAlert('Please enter color code', 'warning');
                document.getElementById('color_hex').focus();
                return;
            }

            if (!colorStatus) {
                showAlert('Please select color status', 'warning');
                return;
            }

            // 验证颜色代码格式
            if (!isValidColorCode(colorHex)) {
                showAlert('Please enter a valid color code (e.g., #FF0000 or FF0000)', 'warning');
                document.getElementById('color_hex').focus();
                return;
            }

            // 提交表单
            submitForm();
        });
    }
});

function submitForm() {
    const form = document.getElementById('colorForm');
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
            showAlert(data.message || 'Color updated successfully', 'success');

            // 延迟重定向到dashboard，让用户看到成功消息
            setTimeout(() => {
                window.location.href = window.colorManagementRoute || '/admin/management/colors';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to update color', 'error');
        }
    })
    .catch(error => {
        showAlert('Error updating color: ' + error.message, 'error');
    });
}

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
