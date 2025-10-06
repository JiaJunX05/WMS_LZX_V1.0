/**
 * Color Create Page JavaScript
 * 颜色创建页面交互逻辑
 *
 * 功能：
 * - 颜色名称输入和管理
 * - 颜色代码输入和管理
 * - 状态管理
 * - 表单验证和提交
 * - 批量创建支持
 *
 * @author WMS Team
 * @version 1.0.0
 */

// 颜色列表数组
let colorList = [];

/**
 * 将 HEX 颜色转换为 RGB 格式
 * @param {string} hex HEX 颜色代码 (如: #FF0000)
 * @returns {string} RGB 格式字符串 (如: 255,0,0)
 */
function hexToRgb(hex) {
    // 移除 # 前缀
    hex = hex.replace('#', '');

    // 解析 HEX 值
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `${r},${g},${b}`;
}

document.addEventListener('DOMContentLoaded', function() {
    // 使用通用函數初始化顏色頁面
    initializeColorPage({
        events: {
            formSubmit: function(e) {
                e.preventDefault();

                // 检查是否有颜色
                if (colorList.length === 0) {
                    showAlert('Please add at least one color', 'warning');
                    return;
                }

                // 预提交重复检查
                const duplicates = [];
                const seen = new Set();
                for (const item of colorList) {
                    const combination = item.colorName.toLowerCase();
                    if (seen.has(combination)) {
                        duplicates.push(item.colorName);
                    } else {
                        seen.add(combination);
                    }
                }

                if (duplicates.length > 0) {
                    showAlert(`Duplicate color names found: ${duplicates.join(', ')}. Please remove duplicates before submitting.`, 'error');
                    return;
                }

                // 准备提交数据
                const formData = new FormData();
                formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

                // 添加颜色数据
                colorList.forEach((item, index) => {
                    // 添加颜色文本数据
                    formData.append(`colors[${index}][colorName]`, item.colorName);
                    formData.append(`colors[${index}][colorHex]`, item.colorHex);
                    formData.append(`colors[${index}][colorRgb]`, item.colorRgb);
                    formData.append(`colors[${index}][colorStatus]`, item.colorStatus);
                });

                // 使用通用函數提交
                createColor(formData, {
                    url: window.createColorUrl,
                    redirect: window.colorManagementRoute
                });
            }
        },
        onInit: function() {
            // 綁定特定事件
            bindEvents();

            // 初始化狀態
            updateUI();

            // 如果已有顏色數據，顯示顏色區域
            if (colorList.length > 0) {
                showColorValuesArea();
            }
        }
    });
});

function bindEvents() {
    // 颜色名称输入框回车事件
    const colorNameInput = document.getElementById('color_name');
    if (colorNameInput) {
        colorNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addColor();
            }
        });
    }

    // 颜色代码输入框回车事件
    const colorHexInput = document.getElementById('color_hex');
    if (colorHexInput) {
        colorHexInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addColor();
            }
        });
    }

    // 添加颜色按钮
    const addColorBtn = document.getElementById('addColor');
    if (addColorBtn) {
        addColorBtn.addEventListener('click', addColor);
    }

    // 清除表单按钮
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：删除颜色按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            removeColor(index);
        }
    });

    // 状态卡片选择 - 使用通用函数
    // initializeStatusCardSelection() 在 initializeColorPage() 中调用

    // 排序按钮
    const sortBtn = document.getElementById('sortColors');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 快速添加按钮
    const addCommonColorsBtn = document.getElementById('addCommonColors');
    if (addCommonColorsBtn) {
        addCommonColorsBtn.addEventListener('click', addCommonColors);
    }

    const addFashionColorsBtn = document.getElementById('addFashionColors');
    if (addFashionColorsBtn) {
        addFashionColorsBtn.addEventListener('click', addFashionColors);
    }

    // 颜色代码输入框实时预览 - 使用通用函数
    // bindColorEvents() 在 initializeColorPage() 中调用
}

function addColor() {
    const colorNameInput = document.getElementById('color_name');
    const colorHexInput = document.getElementById('color_hex');
    const colorStatus = document.querySelector('input[name="color_status"]:checked');

    const colorName = colorNameInput.value.trim();
    const colorHex = colorHexInput.value.trim();

    // 验证输入
    if (!colorName) {
        showAlert('Please enter color name', 'warning');
        colorNameInput.focus();
        return;
    }

    if (!colorHex) {
        showAlert('Please enter color code', 'warning');
        colorHexInput.focus();
        return;
    }

    if (!colorStatus) {
        showAlert('Please select color status', 'warning');
        return;
    }

    // 验证颜色代码格式
    if (!isValidColorCode(colorHex)) {
        showAlert('Please enter a valid color code (e.g., #FF0000 or FF0000)', 'warning');
        colorHexInput.focus();
        return;
    }

    // 检查是否已存在
    if (isColorExists(colorList, colorName)) {
        showAlert(`Color name "${colorName}" already exists in the list`, 'error');
        highlightExistingColor(colorName);
        colorNameInput.focus();
        return;
    }

    // 添加到颜色数组
    addColorToArray(colorName, colorHex, colorStatus.value);
    // 显示成功提示
    showAlert('Color added successfully', 'success');
}

function addColorToArray(colorName, colorHex, colorStatus) {
    // 标准化颜色代码（确保有#前缀）
    const normalizedColorHex = normalizeColorHex(colorHex);

    // 将 HEX 转换为 RGB
    const colorRgb = hexToRgb(normalizedColorHex);

    // 添加颜色到数组
    const colorData = {
        colorName: colorName,
        colorHex: normalizedColorHex,
        colorRgb: colorRgb,
        colorStatus: colorStatus
    };

    colorList.push(colorData);

    // 更新UI
    updateColorList();
    updateUI();

    // 显示右边的颜色表格
    showColorValuesArea();

    // 清空输入框
    const colorNameInput = document.getElementById('color_name');
    const colorHexInput = document.getElementById('color_hex');
    if (colorNameInput) {
        colorNameInput.value = '';
        colorNameInput.focus();
    }
    if (colorHexInput) {
        colorHexInput.value = '';
    }
}

// isValidColorCode 函數已移至 color-common.js

// isColorExists 函數已移至 color-common.js

function removeColor(index) {
    console.log('Removing color at index:', index);
    console.log('Color list before removal:', colorList);

    if (index >= 0 && index < colorList.length) {
        colorList.splice(index, 1);
        console.log('Color list after removal:', colorList);
        updateColorList();
        updateUI();
    } else {
        console.error('Invalid index:', index);
        showAlert('Error: Invalid color index', 'error');
    }
}

function updateColorList() {
    const container = document.getElementById('colorValuesList');
    if (!container) return;

    container.innerHTML = '';

    colorList.forEach((item, index) => {
        const colorItem = document.createElement('div');

        // 检查是否为重复项
        const isDuplicate = isColorExists(colorList, item.colorName) &&
            colorList.filter(i => i.colorName.toLowerCase() === item.colorName.toLowerCase()).length > 1;

        // 根据是否为重复项设置不同的样式
        const baseClasses = 'item-value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
        const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

        colorItem.className = `${baseClasses} ${duplicateClasses}`;

        colorItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                <div class="color-preview-small me-2" style="width: 32px; height: 32px; border-radius: 4px; background-color: ${item.colorHex || '#f3f4f6'}; border: 1px solid #ddd;"></div>
                <span class="item-value-text fw-medium">${item.colorName}</span>
                <small class="text-muted ms-2">${item.colorHex}</small>
                ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;
        container.appendChild(colorItem);
    });
}

// highlightExistingColor 函數已移至 color-common.js

function addColorToList(colorName, colorHex, colorStatus) {
    // 检查是否为重复项
    if (isColorExists(colorList, colorName)) {
        console.log('Duplicate detected in batch add, skipping:', colorName);
        return; // 跳过重复项，不添加到列表
    }

    // 标准化颜色代码
    const normalizedColorHex = normalizeColorHex(colorHex);

    // 添加到 colorList 数组
    colorList.push({
        colorName: colorName,
        colorHex: normalizedColorHex,
        colorStatus: colorStatus
    });

    // 重新渲染整个列表
    updateColorList();
    updateUI();

    // 显示颜色值区域
    showColorValuesArea();
}

function showColorValuesArea() {
    // 隐藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 隐藏输入提示
    const colorInputPrompt = document.getElementById('colorInputPrompt');
    if (colorInputPrompt) {
        colorInputPrompt.style.display = 'none';
    }

    // 显示颜色值区域
    const colorValuesArea = document.getElementById('colorValuesArea');
    if (colorValuesArea) {
        colorValuesArea.style.display = 'block';
    }

    // 更新颜色名称显示
    updateColorNameDisplay();

    // 显示状态选择
    const statusSelection = document.getElementById('statusSelection');
    if (statusSelection) {
        statusSelection.style.display = 'block';
    }

    // 显示提交按钮
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.style.display = 'block';
    }
}

function clearForm() {
    // 检查是否有数据需要清除
    if (colorList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 确认清除
    if (!confirm('Are you sure you want to clear all colors?')) {
        return;
    }

    // 清空数组
    colorList = [];

    // 清空输入框
    const colorNameInput = document.getElementById('color_name');
    const colorHexInput = document.getElementById('color_hex');
    if (colorNameInput) {
        colorNameInput.value = '';
    }
    if (colorHexInput) {
        colorHexInput.value = '';
    }

    // 重置状态选择
    const availableStatus = document.querySelector('input[name="color_status"][value="Available"]');
    if (availableStatus) {
        availableStatus.checked = true;
        selectStatusCard(availableStatus.closest('.status-card'));
    }

    // 更新UI
    updateColorList();
    updateUI();

    // 显示成功提示
    showAlert('All colors cleared successfully', 'success');

    // 隐藏所有区域
    hideAllAreas();

    // 更新UI
    updateUI();
}

function hideAllAreas() {
    // 隐藏颜色值区域
    const colorValuesArea = document.getElementById('colorValuesArea');
    if (colorValuesArea) {
        colorValuesArea.style.display = 'none';
    }

    // 隐藏输入提示
    const colorInputPrompt = document.getElementById('colorInputPrompt');
    if (colorInputPrompt) {
        colorInputPrompt.style.display = 'none';
    }

    // 隐藏状态选择
    const statusSelection = document.getElementById('statusSelection');
    if (statusSelection) {
        statusSelection.style.display = 'none';
    }

    // 隐藏提交按钮
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.style.display = 'none';
    }

    // 显示初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'block';
    }
}

function updateConfigSummary() {
    // 更新颜色范围显示
    updateColorRangeDisplay();

    // 显示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (configSummary) {
        configSummary.style.display = 'block';
    }
}

function updateColorNameDisplay() {
    const colorNameSpan = document.getElementById('colorName');
    if (colorNameSpan) {
        if (colorList.length > 0) {
            // 显示颜色数量
            colorNameSpan.textContent = `- ${colorList.length} colors`;
        } else {
            colorNameSpan.textContent = '';
        }
    }
}

function updateColorRangeDisplay() {
    const colorNames = colorList.map(item => item.colorName);

    const selectedColorSpan = document.getElementById('selectedColor');
    if (selectedColorSpan) {
        if (colorNames.length === 0) {
            selectedColorSpan.textContent = 'None';
        } else if (colorNames.length === 1) {
            selectedColorSpan.textContent = colorNames[0];
        } else {
            // 按字母顺序排序
            const sortedNames = colorNames.sort();
            const minColor = sortedNames[0];
            const maxColor = sortedNames[sortedNames.length - 1];
            selectedColorSpan.textContent = `${minColor} - ${maxColor}`;
        }
    }
}

function updateUI() {
    // 更新颜色值计数
    updateColorValuesCount();

    // 更新颜色范围显示
    updateColorRangeDisplay();

    // 更新颜色名称显示
    updateColorNameDisplay();

    // 更新配置摘要
    updateConfigSummary();
}

function updateColorValuesCount() {
    const count = colorList.length;

    // 更新右侧计数徽章
    const countBadge = document.getElementById('colorValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} colors`;
    }

    // 更新左侧计数文本
    const countText = document.getElementById('colorCountText');
    if (countText) {
        if (count === 0) {
            countText.textContent = 'No colors added yet';
        } else if (count === 1) {
            countText.textContent = '1 color added';
        } else {
            countText.textContent = `${count} colors added`;
        }
    }
}

// selectStatusCard 函數已移至 color-common.js

// updateColorPreview 函數已移至 color-common.js

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用

// 排序状态：true = 升序，false = 降序
let isAscending = false; // 默认降序（最新的在上面）

function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortColors');

    // 更新图标
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortColorValuesList();
}

function sortColorValuesList() {
    const colorValuesList = document.getElementById('colorValuesList');
    const items = Array.from(colorValuesList.querySelectorAll('.item-value-item'));

    if (items.length <= 1) return;

    // 获取颜色名称并排序
    const colorValues = items.map(item => ({
        element: item,
        value: item.querySelector('.item-value-text').textContent.trim()
    }));

    // 按字母顺序排序
    colorValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    colorValues.forEach(({ element }) => {
        colorValuesList.appendChild(element);
    });
}

function addCommonColors() {
    // Common colors
    const commonColors = [
        { name: 'Red', hex: '#FF0000' },
        { name: 'Blue', hex: '#0000FF' },
        { name: 'Green', hex: '#00FF00' },
        { name: 'Yellow', hex: '#FFFF00' },
        { name: 'Black', hex: '#000000' },
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Orange', hex: '#FFA500' },
        { name: 'Purple', hex: '#800080' },
        { name: 'Pink', hex: '#FFC0CB' },
        { name: 'Brown', hex: '#A52A2A' }
    ];

    addMultipleColors(commonColors);
}

function addFashionColors() {
    // Fashion colors
    const fashionColors = [
        { name: 'Navy Blue', hex: '#000080' },
        { name: 'Burgundy', hex: '#800020' },
        { name: 'Cream', hex: '#F5F5DC' },
        { name: 'Charcoal', hex: '#36454F' },
        { name: 'Coral', hex: '#FF7F50' },
        { name: 'Turquoise', hex: '#40E0D0' },
        { name: 'Lavender', hex: '#E6E6FA' },
        { name: 'Maroon', hex: '#800000' },
        { name: 'Beige', hex: '#F5F5DC' },
        { name: 'Olive', hex: '#808000' }
    ];

    addMultipleColors(fashionColors);
}

function addMultipleColors(colors) {
    let addedCount = 0;
    let skippedCount = 0;
    const selectedStatus = document.querySelector('input[name="color_status"]:checked');

    if (!selectedStatus) {
        showAlert('Please select color status first', 'warning');
        return;
    }

    colors.forEach(color => {
        if (!isColorExists(color.name)) {
            addColorToList(color.name, color.hex, selectedStatus.value);
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 显示结果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} colors`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} colors, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All colors already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加颜色，显示右边的表格
    if (addedCount > 0) {
        showColorValuesArea();
    }
}

// 表單提交處理已移至 initializeColorPage 的 events.formSubmit 中

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
