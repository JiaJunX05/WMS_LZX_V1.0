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
    // 初始化页面
    initializeCategoryCreate();
});

function initializeCategoryCreate() {
    // 绑定事件监听器
    bindEvents();

    // 初始化状态
    updateUI();

    // 如果已有分类数据，显示分类区域
    if (categoryList.length > 0) {
        showCategoryValuesArea();
    }
}

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

    // 状态卡片选择
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            selectStatusCard(this);
        });
    });

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

    // 图片上传预览
    const imageInput = document.getElementById('category_image');
    const imageUploadArea = document.getElementById('imageUploadArea');

    if (imageInput && imageUploadArea) {
        console.log('Image upload elements found');

        imageInput.addEventListener('change', function(e) {
            console.log('Image input changed:', e.target.files);
            handleImagePreview(e);
        });

        // 点击上传区域触发文件选择
        imageUploadArea.addEventListener('click', function() {
            console.log('Image upload area clicked');
            imageInput.click();
        });

        // 拖拽上传支持
        imageUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            imageUploadArea.classList.add('dragover');
        });

        imageUploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            imageUploadArea.classList.remove('dragover');
        });

        imageUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            imageUploadArea.classList.remove('dragover');

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
    if (isCategoryExists(categoryName)) {
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

function isCategoryExists(categoryName) {
    return categoryList.some(item => item.categoryName.toLowerCase() === categoryName.toLowerCase());
}

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
        const isDuplicate = isCategoryExists(item.categoryName) &&
            categoryList.filter(i => i.categoryName.toLowerCase() === item.categoryName.toLowerCase()).length > 1;

        // 根据是否为重复项设置不同的样式
        const baseClasses = 'item-value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
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

function highlightExistingCategory(categoryName) {
    const existingValues = document.querySelectorAll('.item-value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.item-value-text').textContent.trim();
        if (value.toLowerCase() === categoryName.toLowerCase()) {
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

function addCategoryToList(categoryName, categoryStatus, categoryImageFile = null) {
    // 检查是否为重复项
    if (isCategoryExists(categoryName)) {
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
    const items = Array.from(categoryValuesList.querySelectorAll('.item-value-item'));

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

function handleImagePreview(event) {
    const file = event.target.files[0];
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
            const previewImage = document.getElementById('preview-image');
            const previewIcon = document.getElementById('preview-icon');
            const imageUploadArea = document.getElementById('imageUploadArea');
            const imageUploadContent = document.getElementById('imageUploadContent');

            if (previewImage && previewIcon && imageUploadArea && imageUploadContent) {
                previewImage.src = e.target.result;
                previewImage.classList.remove('d-none');
                previewIcon.classList.add('d-none');
                imageUploadArea.classList.add('has-image');

                // 添加删除按钮
                addImageRemoveButton();
            }
        };
        reader.readAsDataURL(file);
    }
}

function addImageRemoveButton() {
    const imageUploadArea = document.getElementById('imageUploadArea');
    const existingRemoveBtn = imageUploadArea.querySelector('.image-remove-btn');

    if (!existingRemoveBtn) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'image-remove-btn';
        removeBtn.innerHTML = '<i class="bi bi-x"></i>';
        removeBtn.title = 'Remove image';
        removeBtn.addEventListener('click', removeImage);
        imageUploadArea.appendChild(removeBtn);
    }
}

function removeImage() {
    const imageInput = document.getElementById('category_image');
    const previewImage = document.getElementById('preview-image');
    const previewIcon = document.getElementById('preview-icon');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageUploadContent = document.getElementById('imageUploadContent');
    const removeBtn = imageUploadArea.querySelector('.image-remove-btn');

    if (imageInput && previewImage && previewIcon && imageUploadArea && imageUploadContent) {
        // 重置文件输入
        imageInput.value = '';

        // 隐藏预览图片，显示上传图标
        previewImage.classList.add('d-none');
        previewIcon.classList.remove('d-none');
        imageUploadArea.classList.remove('has-image');

        // 移除删除按钮
        if (removeBtn) {
            removeBtn.remove();
        }

        showAlert('Image removed successfully', 'success');
    }
}

function resetImageWithoutMessage() {
    const imageInput = document.getElementById('category_image');
    const previewImage = document.getElementById('preview-image');
    const previewIcon = document.getElementById('preview-icon');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageUploadContent = document.getElementById('imageUploadContent');
    const removeBtn = imageUploadArea.querySelector('.image-remove-btn');

    if (imageInput && previewImage && previewIcon && imageUploadArea && imageUploadContent) {
        // 重置文件输入
        imageInput.value = '';

        // 隐藏预览图片，显示上传图标
        previewImage.classList.add('d-none');
        previewIcon.classList.remove('d-none');
        imageUploadArea.classList.remove('has-image');

        // 移除删除按钮
        if (removeBtn) {
            removeBtn.remove();
        }

        // 不显示任何消息
    }
}

// 表单提交前验证
document.getElementById('categoryForm').addEventListener('submit', function(e) {
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

    // 提交数据
    fetch(window.createCategoryUrl, {
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
            showAlert(data.message || 'Categories created successfully', 'success');

            // 延迟重定向到dashboard，让用户看到成功消息
            setTimeout(() => {
                window.location.href = window.categoryManagementRoute || '/admin/category-mapping/category';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to create categories', 'error');
        }
    })
    .catch(error => {
        showAlert('Error creating categories: ' + error.message, 'error');
    });
});

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
