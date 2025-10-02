/**
 * Size Library Create Page JavaScript
 * 尺码库创建页面交互逻辑
 *
 * 功能：
 * - 尺码值输入和管理
 * - 类别选择
 * - 状态管理
 * - 表单验证和提交
 */

// 尺码值列表数组
let sizeList = [];

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeSizeLibraryCreate();
});

function initializeSizeLibraryCreate() {
    // 绑定事件监听器
    bindEvents();

    // 初始化状态
    updateUI();
}

function bindEvents() {
    // 分类选择变化
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
    }

    // 尺码值输入框回车事件
    const sizeValueInput = document.getElementById('size_value');
    if (sizeValueInput) {
        sizeValueInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSizeValue();
            }
        });
    }

    // 添加尺码值按钮
    const addSizeValueBtn = document.getElementById('addSizeValue');
    if (addSizeValueBtn) {
        addSizeValueBtn.addEventListener('click', addSizeValue);
    }

    // 清除表单按钮
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：删除尺码值按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-size-value')) {
            const index = parseInt(e.target.closest('.remove-size-value').getAttribute('onclick').match(/\d+/)[0]);
            removeSizeValue(index);
        }
    });

        // 状态卡片选择
        const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            selectStatusCard(this);
        });
    });

    // 排序按钮
    const sortBtn = document.getElementById('sortSizes');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 自动添加按钮
    const addClothingSizesBtn = document.getElementById('addClothingSizes');
    if (addClothingSizesBtn) {
        addClothingSizesBtn.addEventListener('click', addClothingSizes);
    }

    const addShoeSizesBtn = document.getElementById('addShoeSizes');
    if (addShoeSizesBtn) {
        addShoeSizesBtn.addEventListener('click', addShoeSizes);
    }
}

function handleCategoryChange() {
    const categorySelect = document.getElementById('category_id');
    const selectedCategory = categorySelect.value;

    if (selectedCategory) {
        // 显示尺码值输入提示
        showSizeInputPrompt();
        // 更新配置摘要
        updateConfigSummary();
    } else {
        // 隐藏所有相关区域
        hideAllAreas();
    }

    updateUI();
}

function showSizeInputPrompt() {
    // 隐藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 显示尺码值输入提示
    const sizeInputPrompt = document.getElementById('sizeInputPrompt');
    if (sizeInputPrompt) {
        sizeInputPrompt.style.display = 'block';
    }
}

function addSizeValue() {
    const sizeValueInput = document.getElementById('size_value');
    const categorySelect = document.getElementById('category_id');

    const sizeValue = sizeValueInput.value.trim();
    const categoryId = categorySelect.value;

    // 验证输入
    if (!sizeValue) {
        showAlert('Please enter size value', 'warning');
        sizeValueInput.focus();
        return;
    }

    if (!categoryId) {
        showAlert('Please select a category first', 'warning');
        categorySelect.focus();
        return;
    }

    // 检查是否已存在
    console.log('Checking for duplicates:', { sizeValue, sizeList });
    if (isSizeValueExists(sizeValue)) {
        console.log('Duplicate detected, preventing addition');
        showAlert(`Size value "${sizeValue}" already exists in the list`, 'error');
        highlightExistingSizeValue(sizeValue);
        sizeValueInput.focus();
        return;
    }

    // 添加尺码值到数组
    sizeList.push({
        sizeValue: sizeValue,
        categoryId: categoryId
    });

    // 更新UI
    updateSizeList();
    updateUI();

    // 显示配置摘要
    updateConfigSummary();

    // 显示右边的尺码值表格
    showSizeValuesArea();

    // 清空输入框
    sizeValueInput.value = '';
    sizeValueInput.focus();

    // 显示成功提示
    showAlert('Size value added successfully', 'success');
}

function isSizeValueExists(sizeValue) {
    return sizeList.some(item => item.sizeValue.toLowerCase() === sizeValue.toLowerCase());
}

function removeSizeValue(index) {
    sizeList.splice(index, 1);
    updateSizeList();
    updateUI();
}

function updateSizeList() {
    const container = document.getElementById('sizeValuesList');
    if (!container) return;

    container.innerHTML = '';

    sizeList.forEach((item, index) => {
        const sizeItem = document.createElement('div');

        // 检查是否为重复项
        const isDuplicate = isSizeValueExists(item.sizeValue) &&
            sizeList.filter(i => i.sizeValue.toLowerCase() === item.sizeValue.toLowerCase()).length > 1;

        // 根据是否为重复项设置不同的样式
        const baseClasses = 'size-value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
        const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

        sizeItem.className = `${baseClasses} ${duplicateClasses}`;

        sizeItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                <span class="size-value-text fw-medium">${item.sizeValue}</span>
                ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-size-value" onclick="removeSizeValue(${index})">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;
        container.appendChild(sizeItem);
    });
}

function highlightExistingSizeValue(sizeValue) {
    const existingValues = document.querySelectorAll('.size-value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.size-value-text').textContent.trim();
        if (value.toLowerCase() === sizeValue.toLowerCase()) {
            // 添加高亮样式
            item.classList.add('duplicate-highlight');

            // 滚动到该元素
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 3秒后移除高亮
            setTimeout(() => {
                item.classList.remove('duplicate-highlight');
            }, 3000);
            break;
        }
    }
}

function addSizeValueToList(sizeValue) {
    const categorySelect = document.getElementById('category_id');
    const categoryId = categorySelect.value;

    // 检查是否为重复项
    if (isSizeValueExists(sizeValue)) {
        console.log('Duplicate detected in batch add, skipping:', sizeValue);
        return; // 跳过重复项，不添加到列表
    }

    // 添加到 sizeList 数组
    sizeList.push({
        sizeValue: sizeValue,
        categoryId: categoryId
    });

    // 重新渲染整个列表
    updateSizeList();
    updateUI();

    // 显示尺码值区域
    showSizeValuesArea();
}

function showSizeValuesArea() {
    // 隐藏输入提示
    const sizeInputPrompt = document.getElementById('sizeInputPrompt');
    if (sizeInputPrompt) {
        sizeInputPrompt.style.display = 'none';
    }

    // 显示尺码值区域
    const sizeValuesArea = document.getElementById('sizeValuesArea');
    if (sizeValuesArea) {
        sizeValuesArea.style.display = 'block';
    }

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
    if (sizeList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 确认清除
    if (!confirm('Are you sure you want to clear all size values?')) {
        return;
    }

    // 清空数组
    sizeList = [];

    // 清空输入框
    const sizeValueInput = document.getElementById('size_value');
    if (sizeValueInput) {
        sizeValueInput.value = '';
    }

    // 重置分类选择
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.value = '';
    }

    // 更新UI
    updateSizeList();
    updateUI();

    // 显示成功提示
    showAlert('All size values cleared successfully', 'success');

    // 隐藏所有区域
    hideAllAreas();

    // 更新UI
    updateUI();
}

function hideAllAreas() {
    // 隐藏尺码值区域
    const sizeValuesArea = document.getElementById('sizeValuesArea');
    if (sizeValuesArea) {
        sizeValuesArea.style.display = 'none';
    }

    // 隐藏输入提示
    const sizeInputPrompt = document.getElementById('sizeInputPrompt');
    if (sizeInputPrompt) {
        sizeInputPrompt.style.display = 'none';
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
    const categorySelect = document.getElementById('category_id');
    const selectedCategory = categorySelect.value;

    if (selectedCategory) {
        const categoryText = categorySelect.options[categorySelect.selectedIndex].text;

        // 更新配置摘要
        const selectedCategorySpan = document.getElementById('selectedCategory');
        if (selectedCategorySpan) {
            selectedCategorySpan.textContent = categoryText;
        }

        // 更新尺码范围显示
        updateSizeRangeDisplay();

        // 显示配置摘要
        const configSummary = document.getElementById('configSummary');
        if (configSummary) {
            configSummary.style.display = 'block';
        }

        // 更新分类名称
        const categoryName = document.getElementById('categoryName');
        if (categoryName) {
            categoryName.textContent = `- ${categoryText}`;
        }
    }
}


function updateSizeRangeDisplay() {
    const sizeValues = sizeList.map(item => item.sizeValue);

    const selectedSizeSpan = document.getElementById('selectedSize');
    if (selectedSizeSpan) {
        if (sizeValues.length === 0) {
            selectedSizeSpan.textContent = 'None';
        } else if (sizeValues.length === 1) {
            selectedSizeSpan.textContent = sizeValues[0];
        } else {
            // 尝试按数字排序
            const numericValues = sizeValues.filter(val => !isNaN(val)).map(val => parseFloat(val)).sort((a, b) => a - b);
            const textValues = sizeValues.filter(val => isNaN(val));

            if (numericValues.length > 0) {
                const min = Math.min(...numericValues);
                const max = Math.max(...numericValues);
                selectedSizeSpan.textContent = `${min} - ${max}`;
            } else {
                // 如果都是文本，按字母顺序排序
                const sortedTextValues = textValues.sort();
                const minSize = sortedTextValues[0];
                const maxSize = sortedTextValues[sortedTextValues.length - 1];

                // 特殊处理：如果包含 FREE SIZE 等，显示更合理的范围
                if (minSize === 'FREE SIZE' || minSize === 'ONE SIZE' || minSize === 'OS') {
                    selectedSizeSpan.textContent = minSize;
                } else {
                    selectedSizeSpan.textContent = `${minSize} - ${maxSize}`;
                }
            }
        }
    }
}

function updateUI() {
    // 更新尺码值计数
    updateSizeValuesCount();

    // 更新尺码范围显示
    updateSizeRangeDisplay();

    // 更新配置摘要
    updateConfigSummary();
}

function updateSizeValuesCount() {
    const count = sizeList.length;

    // 更新右侧计数徽章
    const countBadge = document.getElementById('sizeValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} values`;
    }

    // 更新左侧计数文本
    const countText = document.getElementById('sizeCountText');
    if (countText) {
        if (count === 0) {
            countText.textContent = 'No size values added yet';
        } else if (count === 1) {
            countText.textContent = '1 size value added';
        } else {
            countText.textContent = `${count} size values added`;
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

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用

// 表单提交前验证
document.getElementById('sizeLibraryForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // 检查是否有尺码值
    if (sizeList.length === 0) {
        showAlert('Please add at least one size value', 'warning');
        return;
    }

    // 预提交重复检查
    const duplicates = [];
    const seen = new Set();
    for (const item of sizeList) {
        const combination = item.sizeValue.toLowerCase();
        if (seen.has(combination)) {
            duplicates.push(item.sizeValue);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        showAlert(`Duplicate size values found: ${duplicates.join(', ')}. Please remove duplicates before submitting.`, 'error');
        return;
    }

    // 准备提交数据
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
    formData.append('category_id', document.getElementById('category_id').value);

    // 添加尺码值
    sizeList.forEach(item => {
        formData.append('size_values[]', item.sizeValue);
    });

    // 添加状态
    const selectedStatus = document.querySelector('input[name="size_status"]:checked');
    if (selectedStatus) {
        formData.append('size_status', selectedStatus.value);
    }

    // 提交数据
    fetch(window.createSizeLibraryUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            // 尝试获取错误响应内容
            return response.text().then(text => {
                console.error('Error response body:', text);
                throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Server response:', data);
        if (data.success) {
            showAlert(data.message || 'Size library created successfully', 'success');

            // 延迟重定向到dashboard，让用户看到成功消息
            setTimeout(() => {
                window.location.href = window.sizeLibraryManagementRoute || '/admin/sizes/library';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to create size library', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error creating size library: ' + error.message, 'error');
    });
});

// 排序状态：true = 升序，false = 降序
let isAscending = false; // 默认降序（最新的在上面）

function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortSizes');

    // 更新图标
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortSizeValuesList();
}

function sortSizeValuesList() {
    const sizeValuesList = document.getElementById('sizeValuesList');
    const items = Array.from(sizeValuesList.querySelectorAll('.size-value-item'));

    if (items.length <= 1) return;

    // 获取尺码值并排序
    const sizeValues = items.map(item => ({
        element: item,
        value: item.querySelector('.size-value-text').textContent.trim()
    }));

    // 按字母顺序排序（简单排序）
    sizeValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    sizeValues.forEach(({ element }) => {
        sizeValuesList.appendChild(element);
    });
}


function addClothingSizes() {
    const categorySelect = document.getElementById('category_id');
    const selectedCategory = categorySelect.value;

    if (!selectedCategory) {
        showAlert('Please select a category first', 'warning');
        categorySelect.focus();
        return;
    }

    // 服装尺码：XXS 到 8XL + FREE SIZE
    const clothingSizes = [
        'FREE SIZE',
        'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL',
        '3XL', '4XL', '5XL', '6XL', '7XL', '8XL'
    ];

    addMultipleSizes(clothingSizes);
}

function addShoeSizes() {
    const categorySelect = document.getElementById('category_id');
    const selectedCategory = categorySelect.value;

    if (!selectedCategory) {
        showAlert('Please select a category first', 'warning');
        categorySelect.focus();
        return;
    }

    // 鞋子尺码：4-14 整码和半码 + FREE SIZE
    const shoeSizes = [
        'FREE SIZE',
        '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5',
        '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5',
        '12', '12.5', '13', '13.5', '14'
    ];

    addMultipleSizes(shoeSizes);
}

function addMultipleSizes(sizes) {
    let addedCount = 0;
    let skippedCount = 0;

    sizes.forEach(size => {
        if (!isSizeValueExists(size)) {
            addSizeValueToList(size);
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 显示结果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} size values`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} size values, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All size values already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加尺码值，显示右边的表格
    if (addedCount > 0) {
        showSizeValuesArea();
    }
}

function addSizeValuesToForm() {
    const form = document.getElementById('sizeLibraryForm');

    // 移除现有的隐藏输入
    const existingInputs = form.querySelectorAll('input[name="size_values[]"]');
    existingInputs.forEach(input => input.remove());

    // 添加新的隐藏输入
    sizeList.forEach(item => {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'size_values[]';
        hiddenInput.value = item.sizeValue;
        form.appendChild(hiddenInput);
    });
}
