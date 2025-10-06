/**
 * Category Create Page JavaScript
 * 分类创建页面交互逻辑
 *
 * 功能：
 * - 分类名称输入和管理
 * - 状态管理
 * - 表单验证和提交
 * - 批量创建支持
 */

// 分类列表数组
let categoryList = [];

document.addEventListener('DOMContentLoaded', function() {
    // 使用通用函數初始化分類頁面
    initializeCategoryPage({
        events: {
            formSubmit: function(e) {
                e.preventDefault();

                // 检查是否有分类
                if (categoryList.length === 0) {
                    showAlert('Please add at least one category', 'warning');
                    return;
                }

                // 预提交重复检查
                const duplicates = [];
                const seen = new Set();
                for (const item of categoryList) {
                    const combination = item.categoryName.toLowerCase();
                    if (seen.has(combination)) {
                        duplicates.push(item.categoryName);
                    } else {
                        seen.add(combination);
                    }
                }

                if (duplicates.length > 0) {
                    showAlert(`Duplicate category names found: ${duplicates.join(', ')}. Please remove duplicates before submitting.`, 'error');
                    return;
                }

                // 准备提交数据
                const formData = new FormData();
                formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

                // 添加分类数据
                categoryList.forEach((item, index) => {
                    // 添加分类文本数据
                    formData.append(`categories[${index}][categoryName]`, item.categoryName);
                    formData.append(`categories[${index}][categoryStatus]`, item.categoryStatus);

                    // 添加图片文件（如果有）
                    if (item.categoryImageFile) {
                        formData.append(`images[${index}]`, item.categoryImageFile);
                    }
                });

                // 使用通用函數提交
                createCategory(formData, {
                    url: window.createCategoryUrl,
                    redirect: window.categoryManagementRoute
                });
            }
        },
        onInit: function() {
            // 綁定特定事件
            bindEvents();

            // 初始化狀態
            updateUI();

            // 如果已有分類數據，顯示分類區域
            if (categoryList.length > 0) {
                showCategoryValuesArea();
            }
        }
    });
});

function bindEvents() {
    // 分类名称输入框回车事件
    const categoryNameInput = document.getElementById('category_name');
    if (categoryNameInput) {
        categoryNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addCategory();
            }
        });
    }

    // 添加分类按钮
    const addCategoryBtn = document.getElementById('addCategory');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', addCategory);
    }

    // 清除表单按钮
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：删除分类按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            removeCategory(index);
        }
    });

    // 状态卡片选择 - 使用通用函数
    // initializeStatusCardSelection() 在 initializeCategoryPage() 中调用

    // 排序按钮
    const sortBtn = document.getElementById('sortCategories');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 快速添加按钮
    const addCommonCategoriesBtn = document.getElementById('addCommonCategories');
    if (addCommonCategoriesBtn) {
        addCommonCategoriesBtn.addEventListener('click', addCommonCategories);
    }

    const addFashionCategoriesBtn = document.getElementById('addFashionCategories');
    if (addFashionCategoriesBtn) {
        addFashionCategoriesBtn.addEventListener('click', addFashionCategories);
    }

    // 图片上传预览 - 使用通用函数
    // bindCategoryEvents() 在 initializeCategoryPage() 中调用
}

function addCategory() {
    const categoryNameInput = document.getElementById('category_name');
    const categoryStatus = document.querySelector('input[name="category_status"]:checked');

    const categoryName = categoryNameInput.value.trim();

    // 验证输入
    if (!categoryName) {
        showAlert('Please enter category name', 'warning');
        categoryNameInput.focus();
        return;
    }

    if (!categoryStatus) {
        showAlert('Please select category status', 'warning');
        return;
    }

    // 检查是否已存在
    if (isCategoryExists(categoryList, categoryName)) {
        showAlert(`Category name "${categoryName}" already exists in the list`, 'error');
        highlightExistingCategory(categoryName);
        categoryNameInput.focus();
        return;
    }

    // 获取当前图片文件
    const imageInput = document.getElementById('category_image');
    let categoryImageFile = null;
    if (imageInput && imageInput.files && imageInput.files[0]) {
        categoryImageFile = imageInput.files[0];
    }

    // 添加到分类数组
    addCategoryToArray(categoryName, categoryStatus.value, categoryImageFile);
    // 显示成功提示
    showAlert('Category added successfully', 'success');
}

function addCategoryToArray(categoryName, categoryStatus, categoryImageFile) {
    // 添加分类到数组
    const categoryData = {
        categoryName: categoryName,
        categoryStatus: categoryStatus,
        categoryImageFile: categoryImageFile // 存储文件对象而不是base64
    };


    categoryList.push(categoryData);

    // 更新UI
    updateCategoryList();
    updateUI();

    // 显示右边的分类表格
    showCategoryValuesArea();

    // 清空输入框
    const categoryNameInput = document.getElementById('category_name');
    if (categoryNameInput) {
        categoryNameInput.value = '';
        categoryNameInput.focus();
    }

    // 清空图片（不显示消息）
    resetImageWithoutMessage();
}

// isCategoryExists 函數已移至 category-common.js

function removeCategory(index) {
    console.log('Removing category at index:', index);
    console.log('Category list before removal:', categoryList);

    if (index >= 0 && index < categoryList.length) {
        categoryList.splice(index, 1);
        console.log('Category list after removal:', categoryList);
        updateCategoryList();
        updateUI();
    } else {
        console.error('Invalid index:', index);
        showAlert('Error: Invalid category index', 'error');
    }
}

function updateCategoryList() {
    const container = document.getElementById('categoryValuesList');
    if (!container) return;

    container.innerHTML = '';

    categoryList.forEach((item, index) => {
        const categoryItem = document.createElement('div');

        // 检查是否为重复项
        const isDuplicate = isCategoryExists(categoryList, item.categoryName) &&
            categoryList.filter(i => i.categoryName.toLowerCase() === item.categoryName.toLowerCase()).length > 1;

        // 根据是否为重复项设置不同的样式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
        const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

        categoryItem.className = `${baseClasses} ${duplicateClasses}`;

        categoryItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                ${item.categoryImageFile ?
                    `<img src="${URL.createObjectURL(item.categoryImageFile)}" alt="${item.categoryName}" class="item-image me-2" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;">` :
                    '<div class="item-image-placeholder me-2" style="width: 32px; height: 32px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-image text-muted"></i></div>'
                }
                <span class="item-value-text fw-medium">${item.categoryName}</span>
                ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;
        container.appendChild(categoryItem);
    });
}

// highlightExistingCategory 函數已移至 category-common.js

function addCategoryToList(categoryName, categoryStatus, categoryImageFile = null) {
    // 检查是否为重复项
    if (isCategoryExists(categoryList, categoryName)) {
        console.log('Duplicate detected in batch add, skipping:', categoryName);
        return; // 跳过重复项，不添加到列表
    }

    // 添加到 categoryList 数组
    categoryList.push({
        categoryName: categoryName,
        categoryStatus: categoryStatus,
        categoryImageFile: categoryImageFile
    });

    // 重新渲染整个列表
    updateCategoryList();
    updateUI();

    // 显示分类值区域
    showCategoryValuesArea();
}

function showCategoryValuesArea() {
    // 隐藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 隐藏输入提示
    const categoryInputPrompt = document.getElementById('categoryInputPrompt');
    if (categoryInputPrompt) {
        categoryInputPrompt.style.display = 'none';
    }

    // 显示分类值区域
    const categoryValuesArea = document.getElementById('categoryValuesArea');
    if (categoryValuesArea) {
        categoryValuesArea.style.display = 'block';
    }

    // 更新分类名称显示
    updateCategoryNameDisplay();

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
    if (categoryList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 确认清除
    if (!confirm('Are you sure you want to clear all categories?')) {
        return;
    }

    // 清空数组
    categoryList = [];

    // 清空输入框
    const categoryNameInput = document.getElementById('category_name');
    if (categoryNameInput) {
        categoryNameInput.value = '';
    }

    // 重置状态选择
    const availableStatus = document.querySelector('input[name="category_status"][value="Available"]');
    if (availableStatus) {
        availableStatus.checked = true;
        selectStatusCard(availableStatus.closest('.status-card'));
    }

    // 更新UI
    updateCategoryList();
    updateUI();

    // 显示成功提示
    showAlert('All categories cleared successfully', 'success');

    // 隐藏所有区域
    hideAllAreas();

    // 更新UI
    updateUI();
}

function hideAllAreas() {
    // 隐藏分类值区域
    const categoryValuesArea = document.getElementById('categoryValuesArea');
    if (categoryValuesArea) {
        categoryValuesArea.style.display = 'none';
    }

    // 隐藏输入提示
    const categoryInputPrompt = document.getElementById('categoryInputPrompt');
    if (categoryInputPrompt) {
        categoryInputPrompt.style.display = 'none';
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
    // 更新分类范围显示
    updateCategoryRangeDisplay();

    // 显示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (configSummary) {
        configSummary.style.display = 'block';
    }
}

function updateCategoryNameDisplay() {
    const categoryNameSpan = document.getElementById('categoryName');
    if (categoryNameSpan) {
        if (categoryList.length > 0) {
            // 显示分类数量
            categoryNameSpan.textContent = `- ${categoryList.length} categories`;
        } else {
            categoryNameSpan.textContent = '';
        }
    }
}

function updateCategoryRangeDisplay() {
    const categoryNames = categoryList.map(item => item.categoryName);

    const selectedCategorySpan = document.getElementById('selectedCategory');
    if (selectedCategorySpan) {
        if (categoryNames.length === 0) {
            selectedCategorySpan.textContent = 'None';
        } else if (categoryNames.length === 1) {
            selectedCategorySpan.textContent = categoryNames[0];
        } else {
            // 按字母顺序排序
            const sortedNames = categoryNames.sort();
            const minCategory = sortedNames[0];
            const maxCategory = sortedNames[sortedNames.length - 1];
            selectedCategorySpan.textContent = `${minCategory} - ${maxCategory}`;
        }
    }
}

function updateUI() {
    // 更新分类值计数
    updateCategoryValuesCount();

    // 更新分类范围显示
    updateCategoryRangeDisplay();

    // 更新分类名称显示
    updateCategoryNameDisplay();

    // 更新配置摘要
    updateConfigSummary();
}

function updateCategoryValuesCount() {
    const count = categoryList.length;

    // 更新右侧计数徽章
    const countBadge = document.getElementById('categoryValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} categories`;
    }

    // 更新左侧计数文本
    const countText = document.getElementById('categoryCountText');
    if (countText) {
        if (count === 0) {
            countText.textContent = 'No categories added yet';
        } else if (count === 1) {
            countText.textContent = '1 category added';
        } else {
            countText.textContent = `${count} categories added`;
        }
    }
}

// selectStatusCard 函數已移至 category-common.js

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用

// 排序状态：true = 升序，false = 降序
let isAscending = false; // 默认降序（最新的在上面）

function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortCategories');

    // 更新图标
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortCategoryValuesList();
}

function sortCategoryValuesList() {
    const categoryValuesList = document.getElementById('categoryValuesList');
    const items = Array.from(categoryValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 获取分类名称并排序
    const categoryValues = items.map(item => ({
        element: item,
        value: item.querySelector('.item-value-text').textContent.trim()
    }));

    // 按字母顺序排序
    categoryValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    categoryValues.forEach(({ element }) => {
        categoryValuesList.appendChild(element);
    });
}

function addCommonCategories() {
    // Common categories
    const commonCategories = [
        'Electronics',
        'Clothing & Accessories',
        'Home & Garden',
        'Beauty & Personal Care',
        'Sports & Outdoors',
        'Food & Beverages',
        'Books & Stationery',
        'Baby & Kids',
        'Automotive',
        'Pet Supplies'
    ];

    addMultipleCategories(commonCategories);
}

function addFashionCategories() {
    // Fashion categories
    const fashionCategories = [
        'Men\'s Clothing',
        'Women\'s Clothing',
        'Kids\' Clothing',
        'Shoes',
        'Bags',
        'Watches',
        'Jewelry',
        'Eyewear',
        'Hats',
        'Scarves',
        'Underwear',
        'Socks'
    ];

    addMultipleCategories(fashionCategories);
}

function addMultipleCategories(categories) {
    let addedCount = 0;
    let skippedCount = 0;
    const selectedStatus = document.querySelector('input[name="category_status"]:checked');

    if (!selectedStatus) {
        showAlert('Please select category status first', 'warning');
        return;
    }

    categories.forEach(category => {
        if (!isCategoryExists(category)) {
            addCategoryToList(category, selectedStatus.value);
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 显示结果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} categories`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} categories, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All categories already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加分类，显示右边的表格
    if (addedCount > 0) {
        showCategoryValuesArea();
    }
}

// 圖片預覽相關函數已移至 category-common.js

// 表單提交處理已移至 initializeCategoryPage 的 events.formSubmit 中

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
