/**
 * Subcategory Create Page JavaScript
 * 子分类创建页面交互逻辑
 *
 * 功能：
 * - 子分类名称输入和管理
 * - 状态管理
 * - 表单验证和提交
 * - 批量创建支持
 */

// 子分类列表数组
let subcategoryList = [];

document.addEventListener('DOMContentLoaded', function() {
    // 使用通用函數初始化子分類頁面
    initializeSubcategoryPage({
        events: {
            formSubmit: function(e) {
                e.preventDefault();

                // 检查是否有子分类
                if (subcategoryList.length === 0) {
                    showAlert('Please add at least one subcategory', 'warning');
                    return;
                }

                // 预提交重复检查
                const duplicates = [];
                const seen = new Set();
                for (const item of subcategoryList) {
                    const combination = item.subcategoryName.toLowerCase();
                    if (seen.has(combination)) {
                        duplicates.push(item.subcategoryName);
                    } else {
                        seen.add(combination);
                    }
                }

                if (duplicates.length > 0) {
                    showAlert(`Duplicate subcategory names found: ${duplicates.join(', ')}. Please remove duplicates before submitting.`, 'error');
                    return;
                }

                // 准备提交数据
                const formData = new FormData();
                formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

                // 添加子分类数据
                subcategoryList.forEach((item, index) => {
                    // 添加子分类文本数据
                    formData.append(`subcategories[${index}][subcategoryName]`, item.subcategoryName);
                    formData.append(`subcategories[${index}][subcategoryStatus]`, item.subcategoryStatus);

                    // 添加图片文件（如果有）
                    if (item.subcategoryImageFile) {
                        formData.append(`images[${index}]`, item.subcategoryImageFile);
                    }
                });

                // 使用通用函數提交
                createSubcategory(formData, {
                    url: window.createSubcategoryUrl,
                    redirect: window.subcategoryManagementRoute
                });
            }
        },
        onInit: function() {
            // 綁定特定事件
            bindEvents();

            // 初始化狀態
            updateUI();

            // 如果已有子分類數據，顯示子分類區域
            if (subcategoryList.length > 0) {
                showSubcategoryValuesArea();
            }
        }
    });
});

function bindEvents() {
    // 子分类名称输入框回车事件
    const subcategoryNameInput = document.getElementById('subcategory_name');
    if (subcategoryNameInput) {
        subcategoryNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSubcategory();
            }
        });
    }

    // 添加子分类按钮
    const addSubcategoryBtn = document.getElementById('addSubcategory');
    if (addSubcategoryBtn) {
        addSubcategoryBtn.addEventListener('click', addSubcategory);
    }

    // 清除表单按钮
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：删除子分类按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            removeSubcategory(index);
        }
    });

    // 状态卡片选择 - 使用通用函数
    // initializeStatusCardSelection() 在 initializeSubcategoryPage() 中调用

    // 排序按钮
    const sortBtn = document.getElementById('sortSubcategories');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 快速添加按钮
    const addCommonSubcategoriesBtn = document.getElementById('addCommonSubcategories');
    if (addCommonSubcategoriesBtn) {
        addCommonSubcategoriesBtn.addEventListener('click', addCommonSubcategories);
    }

    const addFashionSubcategoriesBtn = document.getElementById('addFashionSubcategories');
    if (addFashionSubcategoriesBtn) {
        addFashionSubcategoriesBtn.addEventListener('click', addFashionSubcategories);
    }

    // 图片上传预览 - 使用通用函数
    // bindSubcategoryEvents() 在 initializeSubcategoryPage() 中调用
}

function addSubcategory() {
    const subcategoryNameInput = document.getElementById('subcategory_name');
    const subcategoryStatus = document.querySelector('input[name="subcategory_status"]:checked');

    const subcategoryName = subcategoryNameInput.value.trim();

    // 验证输入
    if (!subcategoryName) {
        showAlert('Please enter subcategory name', 'warning');
        subcategoryNameInput.focus();
        return;
    }

    if (!subcategoryStatus) {
        showAlert('Please select subcategory status', 'warning');
        return;
    }

    // 获取当前图片文件
    const imageInput = document.getElementById('subcategory_image');
    let subcategoryImageFile = null;
    if (imageInput && imageInput.files && imageInput.files[0]) {
        subcategoryImageFile = imageInput.files[0];
    }

    // 直接添加到子分类数组（允许重复，在提交时检查）
    addSubcategoryToArray(subcategoryName, subcategoryStatus.value, subcategoryImageFile);

    // 检查是否重复并显示相应提示
    if (isSubcategoryExists(subcategoryList, subcategoryName)) {
        showAlert(`Subcategory name "${subcategoryName}" already exists in the list`, 'warning');
        highlightExistingSubcategory(subcategoryName);
    } else {
        showAlert('Subcategory added successfully', 'success');
    }
}

function addSubcategoryToArray(subcategoryName, subcategoryStatus, subcategoryImageFile) {
    // 添加子分类到数组
    const subcategoryData = {
        subcategoryName: subcategoryName,
        subcategoryStatus: subcategoryStatus,
        subcategoryImageFile: subcategoryImageFile // 存储文件对象而不是base64
    };

    subcategoryList.push(subcategoryData);

    // 更新UI
    updateSubcategoryList();
    updateUI();

    // 显示右边的子分类表格
    showSubcategoryValuesArea();

    // 清空输入框
    const subcategoryNameInput = document.getElementById('subcategory_name');
    if (subcategoryNameInput) {
        subcategoryNameInput.value = '';
        subcategoryNameInput.focus();
    }

    // 清空图片（不显示消息）
    resetImageWithoutMessage();
}

// isSubcategoryExists 函數已移至 subcategory-common.js

function removeSubcategory(index) {
    console.log('Removing subcategory at index:', index);
    console.log('Subcategory list before removal:', subcategoryList);

    if (index >= 0 && index < subcategoryList.length) {
        subcategoryList.splice(index, 1);
        console.log('Subcategory list after removal:', subcategoryList);
        updateSubcategoryList();
        updateUI();
    } else {
        console.error('Invalid index:', index);
        showAlert('Error: Invalid subcategory index', 'error');
    }
}

function updateSubcategoryList() {
    const container = document.getElementById('subcategoryValuesList');
    if (!container) return;

    container.innerHTML = '';

    subcategoryList.forEach((item, index) => {
        const subcategoryItem = document.createElement('div');

        // 检查是否为重复项
        const isDuplicate = isSubcategoryExists(subcategoryList, item.subcategoryName) &&
            subcategoryList.filter(i => i.subcategoryName.toLowerCase() === item.subcategoryName.toLowerCase()).length > 1;

        // 根据是否为重复项设置不同的样式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
        const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

        subcategoryItem.className = `${baseClasses} ${duplicateClasses}`;

        subcategoryItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                ${item.subcategoryImageFile ?
                    `<img src="${URL.createObjectURL(item.subcategoryImageFile)}" alt="${item.subcategoryName}" class="item-image me-2" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;">` :
                    '<div class="item-image-placeholder me-2" style="width: 32px; height: 32px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-image text-muted"></i></div>'
                }
                <span class="item-value-text fw-medium">${item.subcategoryName}</span>
                ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;
        container.appendChild(subcategoryItem);
    });
}

// highlightExistingSubcategory 函數已移至 subcategory-common.js

function addSubcategoryToList(subcategoryName, subcategoryStatus, subcategoryImageFile = null) {
    // 检查是否为重复项
    if (isSubcategoryExists(subcategoryList, subcategoryName)) {
        console.log('Duplicate detected in batch add, skipping:', subcategoryName);
        return; // 跳过重复项，不添加到列表
    }

    // 添加到 subcategoryList 数组
    subcategoryList.push({
        subcategoryName: subcategoryName,
        subcategoryStatus: subcategoryStatus,
        subcategoryImageFile: subcategoryImageFile
    });

    // 重新渲染整个列表
    updateSubcategoryList();
    updateUI();

    // 显示子分类值区域
    showSubcategoryValuesArea();
}

function showSubcategoryValuesArea() {
    // 隐藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 隐藏输入提示
    const subcategoryInputPrompt = document.getElementById('subcategoryInputPrompt');
    if (subcategoryInputPrompt) {
        subcategoryInputPrompt.style.display = 'none';
    }

    // 显示子分类值区域
    const subcategoryValuesArea = document.getElementById('subcategoryValuesArea');
    if (subcategoryValuesArea) {
        subcategoryValuesArea.style.display = 'block';
    }

    // 更新子分类名称显示
    updateSubcategoryNameDisplay();

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
    if (subcategoryList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 确认清除
    if (!confirm('Are you sure you want to clear all subcategories?')) {
        return;
    }

    // 清空数组
    subcategoryList = [];

    // 清空输入框
    const subcategoryNameInput = document.getElementById('subcategory_name');
    if (subcategoryNameInput) {
        subcategoryNameInput.value = '';
    }

    // 重置状态选择
    const availableStatus = document.querySelector('input[name="subcategory_status"][value="Available"]');
    if (availableStatus) {
        availableStatus.checked = true;
        selectStatusCard(availableStatus.closest('.status-card'));
    }

    // 更新UI
    updateSubcategoryList();
    updateUI();

    // 显示成功提示
    showAlert('All subcategories cleared successfully', 'success');

    // 隐藏所有区域
    hideAllAreas();

    // 更新UI
    updateUI();
}

function hideAllAreas() {
    // 隐藏子分类值区域
    const subcategoryValuesArea = document.getElementById('subcategoryValuesArea');
    if (subcategoryValuesArea) {
        subcategoryValuesArea.style.display = 'none';
    }

    // 隐藏输入提示
    const subcategoryInputPrompt = document.getElementById('subcategoryInputPrompt');
    if (subcategoryInputPrompt) {
        subcategoryInputPrompt.style.display = 'none';
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
    // 更新子分类范围显示
    updateSubcategoryRangeDisplay();

    // 显示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (configSummary) {
        configSummary.style.display = 'block';
    }
}

function updateSubcategoryNameDisplay() {
    const subcategoryNameSpan = document.getElementById('subcategoryName');
    if (subcategoryNameSpan) {
        if (subcategoryList.length > 0) {
            // 显示子分类数量
            subcategoryNameSpan.textContent = `- ${subcategoryList.length} subcategories`;
        } else {
            subcategoryNameSpan.textContent = '';
        }
    }
}

function updateSubcategoryRangeDisplay() {
    const subcategoryNames = subcategoryList.map(item => item.subcategoryName);

    const selectedSubcategorySpan = document.getElementById('selectedSubcategory');
    if (selectedSubcategorySpan) {
        if (subcategoryNames.length === 0) {
            selectedSubcategorySpan.textContent = 'None';
        } else if (subcategoryNames.length === 1) {
            selectedSubcategorySpan.textContent = subcategoryNames[0];
        } else {
            // 按字母顺序排序
            const sortedNames = subcategoryNames.sort();
            const minSubcategory = sortedNames[0];
            const maxSubcategory = sortedNames[sortedNames.length - 1];
            selectedSubcategorySpan.textContent = `${minSubcategory} - ${maxSubcategory}`;
        }
    }
}

function updateUI() {
    // 更新子分类值计数
    updateSubcategoryValuesCount();

    // 更新子分类范围显示
    updateSubcategoryRangeDisplay();

    // 更新子分类名称显示
    updateSubcategoryNameDisplay();

    // 更新配置摘要
    updateConfigSummary();
}

function updateSubcategoryValuesCount() {
    const count = subcategoryList.length;

    // 更新右侧计数徽章
    const countBadge = document.getElementById('subcategoryValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} subcategories`;
    }

    // 更新左侧计数文本
    const countText = document.getElementById('subcategoryCountText');
    if (countText) {
        if (count === 0) {
            countText.textContent = 'No subcategories added yet';
        } else if (count === 1) {
            countText.textContent = '1 subcategory added';
        } else {
            countText.textContent = `${count} subcategories added`;
        }
    }
}

// selectStatusCard 函數已移至 subcategory-common.js

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用

// 排序状态：true = 升序，false = 降序
let isAscending = false; // 默认降序（最新的在上面）

function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortSubcategories');

    // 更新图标
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortSubcategoryValuesList();
}

function sortSubcategoryValuesList() {
    const subcategoryValuesList = document.getElementById('subcategoryValuesList');
    const items = Array.from(subcategoryValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 获取子分类名称并排序
    const subcategoryValues = items.map(item => ({
        element: item,
        value: item.querySelector('.item-value-text').textContent.trim()
    }));

    // 按字母顺序排序
    subcategoryValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    subcategoryValues.forEach(({ element }) => {
        subcategoryValuesList.appendChild(element);
    });
}

function addCommonSubcategories() {
    // Common subcategories
    const commonSubcategories = [
        'Smartphones',
        'Laptops',
        'Tablets',
        'Headphones',
        'Cameras',
        'Gaming',
        'Home Appliances',
        'Furniture',
        'Clothing',
        'Shoes'
    ];

    addMultipleSubcategories(commonSubcategories);
}

function addFashionSubcategories() {
    // Fashion subcategories
    const fashionSubcategories = [
        'T-Shirts',
        'Jeans',
        'Dresses',
        'Sneakers',
        'Handbags',
        'Watches',
        'Rings',
        'Necklaces',
        'Sunglasses',
        'Hats',
        'Jackets',
        'Skirts'
    ];

    addMultipleSubcategories(fashionSubcategories);
}

function addMultipleSubcategories(subcategories) {
    let addedCount = 0;
    let skippedCount = 0;
    const selectedStatus = document.querySelector('input[name="subcategory_status"]:checked');

    if (!selectedStatus) {
        showAlert('Please select subcategory status first', 'warning');
        return;
    }

    subcategories.forEach(subcategory => {
        if (!isSubcategoryExists(subcategory)) {
            addSubcategoryToList(subcategory, selectedStatus.value);
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 显示结果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} subcategories`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} subcategories, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All subcategories already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加子分类，显示右边的表格
    if (addedCount > 0) {
        showSubcategoryValuesArea();
    }
}

// 圖片預覽相關函數已移至 subcategory-common.js

// 表單提交處理已移至 initializeSubcategoryPage 的 events.formSubmit 中

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
