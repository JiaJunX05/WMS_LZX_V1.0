/**
 * Brand Create Page JavaScript
 * 品牌创建页面交互逻辑
 *
 * 功能：
 * - 品牌名称输入和管理
 * - 状态管理
 * - 表单验证和提交
 * - 批量创建支持
 *
 * @author WMS Team
 * @version 1.0.0
 */

// 品牌列表数组
let brandList = [];

document.addEventListener('DOMContentLoaded', function() {
    // 使用通用函數初始化品牌頁面
    initializeBrandPage({
        events: {
            formSubmit: function(e) {
                e.preventDefault();

                // 检查是否有品牌
                if (brandList.length === 0) {
                    showAlert('Please add at least one brand', 'warning');
                    return;
                }

                // 预提交重复检查
                const duplicates = [];
                const seen = new Set();
                for (const item of brandList) {
                    const combination = item.brandName.toLowerCase();
                    if (seen.has(combination)) {
                        duplicates.push(item.brandName);
                    } else {
                        seen.add(combination);
                    }
                }

                if (duplicates.length > 0) {
                    showAlert(`Duplicate brand names found: ${duplicates.join(', ')}. Please remove duplicates before submitting.`, 'error');
                    return;
                }

                // 准备提交数据
                const formData = new FormData();
                formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

                // 添加品牌数据
                brandList.forEach((item, index) => {
                    // 添加品牌文本数据
                    formData.append(`brands[${index}][brandName]`, item.brandName);
                    formData.append(`brands[${index}][brandStatus]`, item.brandStatus);

                    // 添加图片文件（如果有）
                    if (item.brandImageFile) {
                        formData.append(`images[${index}]`, item.brandImageFile);
                    }
                });

                // 使用通用函數提交
                createBrand(formData, {
                    url: window.createBrandUrl,
                    redirect: window.brandManagementRoute
                });
            }
        },
        onInit: function() {
            // 綁定特定事件
            bindEvents();

            // 初始化狀態
            updateUI();

            // 如果已有品牌數據，顯示品牌區域
            if (brandList.length > 0) {
                showBrandValuesArea();
            }
        }
    });
});

function bindEvents() {
    // 品牌名称输入框回车事件
    const brandNameInput = document.getElementById('brand_name');
    if (brandNameInput) {
        brandNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addBrand();
            }
        });
    }

    // 添加品牌按钮
    const addBrandBtn = document.getElementById('addBrand');
    if (addBrandBtn) {
        addBrandBtn.addEventListener('click', addBrand);
    }

    // 清除表单按钮
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：删除品牌按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            removeBrand(index);
        }
    });

    // 状态卡片选择 - 使用通用函数
    // initializeStatusCardSelection() 在 initializeBrandPage() 中调用

    // 排序按钮
    const sortBtn = document.getElementById('sortBrands');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 快速添加按钮
    const addCommonBrandsBtn = document.getElementById('addCommonBrands');
    if (addCommonBrandsBtn) {
        addCommonBrandsBtn.addEventListener('click', addCommonBrands);
    }

    const addFashionBrandsBtn = document.getElementById('addFashionBrands');
    if (addFashionBrandsBtn) {
        addFashionBrandsBtn.addEventListener('click', addFashionBrands);
    }

    // 图片上传预览 - 使用通用函数
    // bindBrandEvents() 在 initializeBrandPage() 中调用
}

function addBrand() {
    const brandNameInput = document.getElementById('brand_name');
    const brandStatus = document.querySelector('input[name="brand_status"]:checked');

    const brandName = brandNameInput.value.trim();

    // 验证输入
    if (!brandName) {
        showAlert('Please enter brand name', 'warning');
        brandNameInput.focus();
        return;
    }

    if (!brandStatus) {
        showAlert('Please select brand status', 'warning');
        return;
    }

    // 检查是否已存在
    if (isBrandExists(brandList, brandName)) {
        showAlert(`Brand name "${brandName}" already exists in the list`, 'error');
        highlightExistingBrand(brandName);
        brandNameInput.focus();
        return;
    }

    // 获取当前图片文件
    const imageInput = document.getElementById('brand_image');
    let brandImageFile = null;
    if (imageInput && imageInput.files && imageInput.files[0]) {
        brandImageFile = imageInput.files[0];
    }

    // 添加到品牌数组
    addBrandToArray(brandName, brandStatus.value, brandImageFile);
    // 显示成功提示
    showAlert('Brand added successfully', 'success');
}

function addBrandToArray(brandName, brandStatus, brandImageFile) {
    // 添加品牌到数组
    const brandData = {
        brandName: brandName,
        brandStatus: brandStatus,
        brandImageFile: brandImageFile // 存储文件对象而不是base64
    };

    brandList.push(brandData);

    // 更新UI
    updateBrandList();
    updateUI();

    // 显示右边的品牌表格
    showBrandValuesArea();

    // 清空输入框
    const brandNameInput = document.getElementById('brand_name');
    if (brandNameInput) {
        brandNameInput.value = '';
        brandNameInput.focus();
    }

    // 清空图片（不显示消息）
    resetImageWithoutMessage();
}

// isBrandExists 函數已移至 brand-common.js

function removeBrand(index) {
    console.log('Removing brand at index:', index);
    console.log('Brand list before removal:', brandList);

    if (index >= 0 && index < brandList.length) {
        brandList.splice(index, 1);
        console.log('Brand list after removal:', brandList);
        updateBrandList();
        updateUI();
    } else {
        console.error('Invalid index:', index);
        showAlert('Error: Invalid brand index', 'error');
    }
}

function updateBrandList() {
    const container = document.getElementById('brandValuesList');
    if (!container) return;

    container.innerHTML = '';

    brandList.forEach((item, index) => {
        const brandItem = document.createElement('div');

        // 检查是否为重复项
        const isDuplicate = isBrandExists(brandList, item.brandName) &&
            brandList.filter(i => i.brandName.toLowerCase() === item.brandName.toLowerCase()).length > 1;

        // 根据是否为重复项设置不同的样式
        const baseClasses = 'item-value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
        const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

        brandItem.className = `${baseClasses} ${duplicateClasses}`;

        brandItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                ${item.brandImageFile ?
                    `<img src="${URL.createObjectURL(item.brandImageFile)}" alt="${item.brandName}" class="item-image me-2" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;">` :
                    '<div class="item-image-placeholder me-2" style="width: 32px; height: 32px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-tag text-muted"></i></div>'
                }
                <span class="item-value-text fw-medium">${item.brandName}</span>
                ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;
        container.appendChild(brandItem);
    });
}

// highlightExistingBrand 函數已移至 brand-common.js

function addBrandToList(brandName, brandStatus, brandImageFile = null) {
    // 检查是否为重复项
    if (isBrandExists(brandList, brandName)) {
        console.log('Duplicate detected in batch add, skipping:', brandName);
        return; // 跳过重复项，不添加到列表
    }

    // 添加到 brandList 数组
    brandList.push({
        brandName: brandName,
        brandStatus: brandStatus,
        brandImageFile: brandImageFile
    });

    // 重新渲染整个列表
    updateBrandList();
    updateUI();

    // 显示品牌值区域
    showBrandValuesArea();
}

function showBrandValuesArea() {
    // 隐藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 隐藏输入提示
    const brandInputPrompt = document.getElementById('brandInputPrompt');
    if (brandInputPrompt) {
        brandInputPrompt.style.display = 'none';
    }

    // 显示品牌值区域
    const brandValuesArea = document.getElementById('brandValuesArea');
    if (brandValuesArea) {
        brandValuesArea.style.display = 'block';
    }

    // 更新品牌名称显示
    updateBrandNameDisplay();

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
    if (brandList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 确认清除
    if (!confirm('Are you sure you want to clear all brands?')) {
        return;
    }

    // 清空数组
    brandList = [];

    // 清空输入框
    const brandNameInput = document.getElementById('brand_name');
    if (brandNameInput) {
        brandNameInput.value = '';
    }

    // 重置状态选择
    const availableStatus = document.querySelector('input[name="brand_status"][value="Available"]');
    if (availableStatus) {
        availableStatus.checked = true;
        selectStatusCard(availableStatus.closest('.status-card'));
    }

    // 更新UI
    updateBrandList();
    updateUI();

    // 显示成功提示
    showAlert('All brands cleared successfully', 'success');

    // 隐藏所有区域
    hideAllAreas();

    // 更新UI
    updateUI();
}

function hideAllAreas() {
    // 隐藏品牌值区域
    const brandValuesArea = document.getElementById('brandValuesArea');
    if (brandValuesArea) {
        brandValuesArea.style.display = 'none';
    }

    // 隐藏输入提示
    const brandInputPrompt = document.getElementById('brandInputPrompt');
    if (brandInputPrompt) {
        brandInputPrompt.style.display = 'none';
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
    // 更新品牌范围显示
    updateBrandRangeDisplay();

    // 显示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (configSummary) {
        configSummary.style.display = 'block';
    }
}

function updateBrandNameDisplay() {
    const brandNameSpan = document.getElementById('brandName');
    if (brandNameSpan) {
        if (brandList.length > 0) {
            // 显示品牌数量
            brandNameSpan.textContent = `- ${brandList.length} brands`;
        } else {
            brandNameSpan.textContent = '';
        }
    }
}

function updateBrandRangeDisplay() {
    const brandNames = brandList.map(item => item.brandName);

    const selectedBrandSpan = document.getElementById('selectedBrand');
    if (selectedBrandSpan) {
        if (brandNames.length === 0) {
            selectedBrandSpan.textContent = 'None';
        } else if (brandNames.length === 1) {
            selectedBrandSpan.textContent = brandNames[0];
        } else {
            // 按字母顺序排序
            const sortedNames = brandNames.sort();
            const minBrand = sortedNames[0];
            const maxBrand = sortedNames[sortedNames.length - 1];
            selectedBrandSpan.textContent = `${minBrand} - ${maxBrand}`;
        }
    }
}

function updateUI() {
    // 更新品牌值计数
    updateBrandValuesCount();

    // 更新品牌范围显示
    updateBrandRangeDisplay();

    // 更新品牌名称显示
    updateBrandNameDisplay();

    // 更新配置摘要
    updateConfigSummary();
}

function updateBrandValuesCount() {
    const count = brandList.length;

    // 更新右侧计数徽章
    const countBadge = document.getElementById('brandValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} brands`;
    }

    // 更新左侧计数文本
    const countText = document.getElementById('brandCountText');
    if (countText) {
        if (count === 0) {
            countText.textContent = 'No brands added yet';
        } else if (count === 1) {
            countText.textContent = '1 brand added';
        } else {
            countText.textContent = `${count} brands added`;
        }
    }
}

// selectStatusCard 函數已移至 brand-common.js

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用

// 排序状态：true = 升序，false = 降序
let isAscending = false; // 默认降序（最新的在上面）

function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortBrands');

    // 更新图标
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortBrandValuesList();
}

function sortBrandValuesList() {
    const brandValuesList = document.getElementById('brandValuesList');
    const items = Array.from(brandValuesList.querySelectorAll('.item-value-item'));

    if (items.length <= 1) return;

    // 获取品牌名称并排序
    const brandValues = items.map(item => ({
        element: item,
        value: item.querySelector('.item-value-text').textContent.trim()
    }));

    // 按字母顺序排序
    brandValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    brandValues.forEach(({ element }) => {
        brandValuesList.appendChild(element);
    });
}

function addCommonBrands() {
    // Common brands
    const commonBrands = [
        'Nike',
        'Adidas',
        'Puma',
        'Under Armour',
        'New Balance',
        'Reebok',
        'Converse',
        'Vans',
        'Skechers',
        'ASICS'
    ];

    addMultipleBrands(commonBrands);
}

function addFashionBrands() {
    // Fashion brands
    const fashionBrands = [
        'Zara',
        'H&M',
        'Uniqlo',
        'Gap',
        'Forever 21',
        'Topshop',
        'Mango',
        'COS',
        'Massimo Dutti',
        'Bershka'
    ];

    addMultipleBrands(fashionBrands);
}

function addMultipleBrands(brands) {
    let addedCount = 0;
    let skippedCount = 0;
    const selectedStatus = document.querySelector('input[name="brand_status"]:checked');

    if (!selectedStatus) {
        showAlert('Please select brand status first', 'warning');
        return;
    }

    brands.forEach(brand => {
        if (!isBrandExists(brand)) {
            addBrandToList(brand, selectedStatus.value);
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 显示结果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} brands`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} brands, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All brands already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加品牌，显示右边的表格
    if (addedCount > 0) {
        showBrandValuesArea();
    }
}

// 圖片處理函數已移至 brand-common.js
// handleImagePreview, addImageRemoveButton, removeImage, resetImageWithoutMessage

// 表單提交處理已移至 initializeBrandPage 的 events.formSubmit 中

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
