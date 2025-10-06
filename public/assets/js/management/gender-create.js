/**
 * Gender Create Page JavaScript
 * 性别创建页面交互逻辑
 *
 * 功能：
 * - 性别名称输入和管理
 * - 状态管理
 * - 表单验证和提交
 * - 批量创建支持
 *
 * @author WMS Team
 * @version 1.0.0
 */

// 性别列表数组
let genderList = [];

document.addEventListener('DOMContentLoaded', function() {
    // 使用通用函數初始化性別頁面
    initializeGenderPage({
        events: {
            formSubmit: function(e) {
                e.preventDefault();

                // 检查是否有性别
                if (genderList.length === 0) {
                    showAlert('Please add at least one gender', 'warning');
                    return;
                }

                // 预提交重复检查
                const duplicates = [];
                const seen = new Set();
                for (const item of genderList) {
                    const combination = item.genderName.toLowerCase();
                    if (seen.has(combination)) {
                        duplicates.push(item.genderName);
                    } else {
                        seen.add(combination);
                    }
                }

                if (duplicates.length > 0) {
                    showAlert(`Duplicate gender names found: ${duplicates.join(', ')}. Please remove duplicates before submitting.`, 'error');
                    return;
                }

                // 准备提交数据
                const formData = new FormData();
                formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

                // 添加性别数据
                genderList.forEach((item, index) => {
                    // 添加性别文本数据
                    formData.append(`genders[${index}][genderName]`, item.genderName);
                    formData.append(`genders[${index}][genderStatus]`, item.genderStatus);
                });

                // 使用通用函數提交
                createGender(formData, {
                    url: window.createGenderUrl,
                    redirect: window.genderManagementRoute
                });
            }
        },
        onInit: function() {
            // 綁定特定事件
            bindEvents();

            // 初始化狀態
            updateUI();

            // 如果已有性別數據，顯示性別區域
            if (genderList.length > 0) {
                showGenderValuesArea();
            }
        }
    });
});

function bindEvents() {
    // 性别名称输入框回车事件
    const genderNameInput = document.getElementById('gender_name');
    if (genderNameInput) {
        genderNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addGender();
            }
        });
    }

    // 添加性别按钮
    const addGenderBtn = document.getElementById('addGender');
    if (addGenderBtn) {
        addGenderBtn.addEventListener('click', addGender);
    }

    // 清除表单按钮
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：删除性别按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            removeGender(index);
        }
    });

    // 状态卡片选择 - 使用通用函数
    // initializeStatusCardSelection() 在 initializeGenderPage() 中调用

    // 排序按钮
    const sortBtn = document.getElementById('sortGenders');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 快速添加按钮
    const addCommonGendersBtn = document.getElementById('addCommonGenders');
    if (addCommonGendersBtn) {
        addCommonGendersBtn.addEventListener('click', addCommonGenders);
    }

    const addFashionGendersBtn = document.getElementById('addFashionGenders');
    if (addFashionGendersBtn) {
        addFashionGendersBtn.addEventListener('click', addFashionGenders);
    }
}

function addGender() {
    const genderNameInput = document.getElementById('gender_name');
    const genderStatus = document.querySelector('input[name="gender_status"]:checked');

    const genderName = genderNameInput.value.trim();

    // 验证输入
    if (!genderName) {
        showAlert('Please enter gender name', 'warning');
        genderNameInput.focus();
        return;
    }

    if (!genderStatus) {
        showAlert('Please select gender status', 'warning');
        return;
    }

    // 检查是否已存在
    if (isGenderExists(genderList, genderName)) {
        showAlert(`Gender name "${genderName}" already exists in the list`, 'error');
        highlightExistingGender(genderName);
        genderNameInput.focus();
        return;
    }

    // 添加到性别数组
    addGenderToArray(genderName, genderStatus.value);
    // 显示成功提示
    showAlert('Gender added successfully', 'success');
}

function addGenderToArray(genderName, genderStatus) {
    // 添加性别到数组
    const genderData = {
        genderName: genderName,
        genderStatus: genderStatus
    };

    genderList.push(genderData);

    // 更新UI
    updateGenderList();
    updateUI();

    // 显示右边的性别表格
    showGenderValuesArea();

    // 清空输入框
    const genderNameInput = document.getElementById('gender_name');
    if (genderNameInput) {
        genderNameInput.value = '';
        genderNameInput.focus();
    }
}

// isGenderExists 函數已移至 gender-common.js

function removeGender(index) {
    console.log('Removing gender at index:', index);
    console.log('Gender list before removal:', genderList);

    if (index >= 0 && index < genderList.length) {
        genderList.splice(index, 1);
        console.log('Gender list after removal:', genderList);
        updateGenderList();
        updateUI();
    } else {
        console.error('Invalid index:', index);
        showAlert('Error: Invalid gender index', 'error');
    }
}

function updateGenderList() {
    const container = document.getElementById('genderValuesList');
    if (!container) return;

    container.innerHTML = '';

    genderList.forEach((item, index) => {
        const genderItem = document.createElement('div');

        // 检查是否为重复项
        const isDuplicate = isGenderExists(genderList, item.genderName) &&
            genderList.filter(i => i.genderName.toLowerCase() === item.genderName.toLowerCase()).length > 1;

        // 根据是否为重复项设置不同的样式
        const baseClasses = 'item-value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
        const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

        genderItem.className = `${baseClasses} ${duplicateClasses}`;

        genderItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                <div class="me-2" style="width: 32px; height: 32px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-person text-muted"></i></div>
                <span class="item-value-text fw-medium">${item.genderName}</span>
                ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;
        container.appendChild(genderItem);
    });
}

// highlightExistingGender 函數已移至 gender-common.js

function addGenderToList(genderName, genderStatus) {
    // 检查是否为重复项
    if (isGenderExists(genderList, genderName)) {
        console.log('Duplicate detected in batch add, skipping:', genderName);
        return; // 跳过重复项，不添加到列表
    }

    // 添加到 genderList 数组
    genderList.push({
        genderName: genderName,
        genderStatus: genderStatus
    });

    // 重新渲染整个列表
    updateGenderList();
    updateUI();

    // 显示性别值区域
    showGenderValuesArea();
}

function showGenderValuesArea() {
    // 隐藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 隐藏输入提示
    const genderInputPrompt = document.getElementById('genderInputPrompt');
    if (genderInputPrompt) {
        genderInputPrompt.style.display = 'none';
    }

    // 显示性别值区域
    const genderValuesArea = document.getElementById('genderValuesArea');
    if (genderValuesArea) {
        genderValuesArea.style.display = 'block';
    }

    // 更新性别名称显示
    updateGenderNameDisplay();

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
    if (genderList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 确认清除
    if (!confirm('Are you sure you want to clear all genders?')) {
        return;
    }

    // 清空数组
    genderList = [];

    // 清空输入框
    const genderNameInput = document.getElementById('gender_name');
    if (genderNameInput) {
        genderNameInput.value = '';
    }

    // 重置状态选择
    const availableStatus = document.querySelector('input[name="gender_status"][value="Available"]');
    if (availableStatus) {
        availableStatus.checked = true;
        selectStatusCard(availableStatus.closest('.status-card'));
    }

    // 更新UI
    updateGenderList();
    updateUI();

    // 显示成功提示
    showAlert('All genders cleared successfully', 'success');

    // 隐藏所有区域
    hideAllAreas();

    // 更新UI
    updateUI();
}

function hideAllAreas() {
    // 隐藏性别值区域
    const genderValuesArea = document.getElementById('genderValuesArea');
    if (genderValuesArea) {
        genderValuesArea.style.display = 'none';
    }

    // 隐藏输入提示
    const genderInputPrompt = document.getElementById('genderInputPrompt');
    if (genderInputPrompt) {
        genderInputPrompt.style.display = 'none';
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
    // 更新性别范围显示
    updateGenderRangeDisplay();

    // 显示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (configSummary) {
        configSummary.style.display = 'block';
    }
}

function updateGenderNameDisplay() {
    const genderNameSpan = document.getElementById('genderName');
    if (genderNameSpan) {
        if (genderList.length > 0) {
            // 显示性别数量
            genderNameSpan.textContent = `- ${genderList.length} genders`;
        } else {
            genderNameSpan.textContent = '';
        }
    }
}

function updateGenderRangeDisplay() {
    const genderNames = genderList.map(item => item.genderName);

    const selectedGenderSpan = document.getElementById('selectedGender');
    if (selectedGenderSpan) {
        if (genderNames.length === 0) {
            selectedGenderSpan.textContent = 'None';
        } else if (genderNames.length === 1) {
            selectedGenderSpan.textContent = genderNames[0];
        } else {
            // 按字母顺序排序
            const sortedNames = genderNames.sort();
            const minGender = sortedNames[0];
            const maxGender = sortedNames[sortedNames.length - 1];
            selectedGenderSpan.textContent = `${minGender} - ${maxGender}`;
        }
    }
}

function updateUI() {
    // 更新性别值计数
    updateGenderValuesCount();

    // 更新性别范围显示
    updateGenderRangeDisplay();

    // 更新性别名称显示
    updateGenderNameDisplay();

    // 更新配置摘要
    updateConfigSummary();
}

function updateGenderValuesCount() {
    const count = genderList.length;

    // 更新右侧计数徽章
    const countBadge = document.getElementById('genderValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} genders`;
    }

    // 更新左侧计数文本
    const countText = document.getElementById('genderCountText');
    if (countText) {
        if (count === 0) {
            countText.textContent = 'No genders added yet';
        } else if (count === 1) {
            countText.textContent = '1 gender added';
        } else {
            countText.textContent = `${count} genders added`;
        }
    }
}

// selectStatusCard 函數已移至 gender-common.js

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用

// 排序状态：true = 升序，false = 降序
let isAscending = false; // 默认降序（最新的在上面）

function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortGenders');

    // 更新图标
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortGenderValuesList();
}

function sortGenderValuesList() {
    const genderValuesList = document.getElementById('genderValuesList');
    const items = Array.from(genderValuesList.querySelectorAll('.item-value-item'));

    if (items.length <= 1) return;

    // 获取性别名称并排序
    const genderValues = items.map(item => ({
        element: item,
        value: item.querySelector('.item-value-text').textContent.trim()
    }));

    // 按字母顺序排序
    genderValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    genderValues.forEach(({ element }) => {
        genderValuesList.appendChild(element);
    });
}

function addCommonGenders() {
    // Common genders
    const commonGenders = [
        'Men',
        'Women',
        'Unisex',
        'Kids',
        'Baby'
    ];

    addMultipleGenders(commonGenders);
}

function addFashionGenders() {
    // Fashion genders
    const fashionGenders = [
        'Men\'s',
        'Women\'s',
        'Unisex',
        'Kids\'',
        'Baby\'s',
        'Teen\'s',
        'Youth',
        'Adult'
    ];

    addMultipleGenders(fashionGenders);
}

function addMultipleGenders(genders) {
    let addedCount = 0;
    let skippedCount = 0;
    const selectedStatus = document.querySelector('input[name="gender_status"]:checked');

    if (!selectedStatus) {
        showAlert('Please select gender status first', 'warning');
        return;
    }

    genders.forEach(gender => {
        if (!isGenderExists(gender)) {
            addGenderToList(gender, selectedStatus.value);
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 显示结果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} genders`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} genders, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All genders already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加性别，显示右边的表格
    if (addedCount > 0) {
        showGenderValuesArea();
    }
}

// 表單提交處理已移至 initializeGenderPage 的 events.formSubmit 中

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
