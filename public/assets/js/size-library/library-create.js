/**
 * Library Create Page JavaScript
 * 尺碼庫創建頁面交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁面
    initializeLibraryCreate();
});

function initializeLibraryCreate() {
    // 使用通用初始化函數
    initializeLibraryPage({
        initializationCallback: function() {
            bindCreateEvents();
            updateUI();
        }
    });
}

function bindCreateEvents() {
    // 尺碼值輸入框回車事件
    const sizeValueInput = document.getElementById('size_value');
    if (sizeValueInput) {
        sizeValueInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSizeValue();
            }
        });
    }

    // 添加尺碼值按鈕
    const addSizeValueBtn = document.getElementById('addSizeValue');
    if (addSizeValueBtn) {
        addSizeValueBtn.addEventListener('click', addSizeValue);
    }

    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 刪除尺碼值按鈕事件委託
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));

            if (!isNaN(index)) {
                removeSizeValue(index);
            }
        }
    });

    // 排序按鈕
    const sortBtn = document.getElementById('sortSizes');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 自動添加按鈕
    const addClothingSizesBtn = document.getElementById('addClothingSizes');
    if (addClothingSizesBtn) {
        addClothingSizesBtn.addEventListener('click', addClothingSizes);
    }

    const addShoeSizesBtn = document.getElementById('addShoeSizes');
    if (addShoeSizesBtn) {
        addShoeSizesBtn.addEventListener('click', addShoeSizes);
    }

    // 表單提交處理
    const form = document.getElementById('sizeLibraryForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// 全局變量
let sizeList = [];
let isAscending = false; // 默認降序（最新的在上面）

// 添加尺碼值
function addSizeValue() {
    if (!validateLibraryForm()) {
        return;
    }

    const sizeValueInput = document.getElementById('size_value');
    const categorySelect = document.getElementById('category_id');

    const sizeValue = sizeValueInput.value.trim();
    const categoryId = categorySelect.value;

    // 檢查是否已存在
    if (isSizeValueExists(sizeList, sizeValue)) {
        showAlert(`Size value "${sizeValue}" already exists in the list`, 'error');
        highlightExistingSizeValue(sizeValueInput);
        sizeValueInput.focus();
        return;
    }

    // 添加尺碼值到數組
    sizeList.push({
        sizeValue: sizeValue,
        categoryId: categoryId
    });

    // 更新UI
    updateSizeList();
    updateUI();

    // 顯示配置摘要
    updateConfigSummary();

    // 顯示右邊的尺碼值表格
    showSizeValuesArea();

    // 清空輸入框
    sizeValueInput.value = '';
    sizeValueInput.focus();

    // 顯示成功提示
    showAlert('Size value added successfully', 'success');
}

// 從列表中移除尺碼值
function removeSizeValue(index) {
    sizeList.splice(index, 1);
    updateSizeList();
    updateUI();
}

// 更新尺碼值列表顯示
function updateSizeList() {
    const container = document.getElementById('sizeValuesList');
    if (!container) return;

    container.innerHTML = '';

    sizeList.forEach((item, index) => {
        const sizeItem = document.createElement('div');

        // 檢查是否為重複項
        const isDuplicate = isSizeValueExists(sizeList, item.sizeValue) &&
            sizeList.filter(i => i.sizeValue.toLowerCase() === item.sizeValue.toLowerCase()).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
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
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;
        container.appendChild(sizeItem);
    });
}

// 高亮顯示已存在的尺碼值
function highlightExistingSizeValue(element) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.size-value-text').textContent.trim();
        if (value.toLowerCase() === element.value.toLowerCase()) {
            // 添加高亮樣式
            item.classList.add('duplicate-highlight');

            // 滾動到該元素
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 3秒後移除高亮
            setTimeout(() => {
                item.classList.remove('duplicate-highlight');
            }, 3000);
            break;
        }
    }
}

// 顯示尺碼值區域
function showSizeValuesArea() {
    // 隱藏輸入提示
    const sizeInputPrompt = document.getElementById('sizeInputPrompt');
    if (sizeInputPrompt) {
        sizeInputPrompt.style.display = 'none';
    }

    // 顯示尺碼值區域
    const sizeValuesArea = document.getElementById('sizeValuesArea');
    if (sizeValuesArea) {
        sizeValuesArea.style.display = 'block';
    }

    // 顯示狀態選擇
    const statusSelection = document.getElementById('statusSelection');
    if (statusSelection) {
        statusSelection.style.display = 'block';
    }

    // 顯示提交按鈕
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.style.display = 'block';
    }
}

// 清除表單
function clearForm() {
    // 檢查是否有數據需要清除
    if (sizeList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 確認清除
    if (!confirm('Are you sure you want to clear all size values?')) {
        return;
    }

    // 清空數組
    sizeList = [];

    // 清空輸入框
    const sizeValueInput = document.getElementById('size_value');
    if (sizeValueInput) {
        sizeValueInput.value = '';
    }

    // 重置分類選擇
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.value = '';
    }

    // 更新UI
    updateSizeList();
    updateUI();

    // 顯示成功提示
    showAlert('All size values cleared successfully', 'success');

    // 隱藏所有區域
    hideAllAreas();

    // 更新UI
    updateUI();
}

// 隱藏所有區域
function hideAllAreas() {
    // 隱藏尺碼值區域
    const sizeValuesArea = document.getElementById('sizeValuesArea');
    if (sizeValuesArea) {
        sizeValuesArea.style.display = 'none';
    }

    // 隱藏輸入提示
    const sizeInputPrompt = document.getElementById('sizeInputPrompt');
    if (sizeInputPrompt) {
        sizeInputPrompt.style.display = 'none';
    }

    // 隱藏狀態選擇
    const statusSelection = document.getElementById('statusSelection');
    if (statusSelection) {
        statusSelection.style.display = 'none';
    }

    // 隱藏提交按鈕
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.style.display = 'none';
    }

    // 顯示初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'block';
    }
}

// 更新UI狀態
function updateUI() {
    // 更新尺碼值計數
    updateSizeValuesCount();

    // 更新尺碼範圍顯示
    updateSizeRangeDisplay();

    // 更新配置摘要
    updateConfigSummary();
}

// 更新尺碼值計數
function updateSizeValuesCount() {
    const count = sizeList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('sizeValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} values`;
    }

    // 更新左側計數文本
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

// 更新尺碼範圍顯示
function updateSizeRangeDisplay() {
    const sizeValues = sizeList.map(item => item.sizeValue);

    const selectedSizeSpan = document.getElementById('selectedSize');
    if (selectedSizeSpan) {
        if (sizeValues.length === 0) {
            selectedSizeSpan.textContent = 'None';
        } else if (sizeValues.length === 1) {
            selectedSizeSpan.textContent = sizeValues[0];
        } else {
            // 嘗試按數字排序
            const numericValues = sizeValues.filter(val => !isNaN(val)).map(val => parseFloat(val)).sort((a, b) => a - b);
            const textValues = sizeValues.filter(val => isNaN(val));

            if (numericValues.length > 0) {
                const min = Math.min(...numericValues);
                const max = Math.max(...numericValues);
                selectedSizeSpan.textContent = `${min} - ${max}`;
            } else {
                // 如果都是文本，按字母順序排序
                const sortedTextValues = textValues.sort();
                const minSize = sortedTextValues[0];
                const maxSize = sortedTextValues[sortedTextValues.length - 1];

                // 特殊處理：如果包含 FREE SIZE 等，顯示更合理的範圍
                if (minSize === 'FREE SIZE' || minSize === 'ONE SIZE' || minSize === 'OS') {
                    selectedSizeSpan.textContent = minSize;
                } else {
                    selectedSizeSpan.textContent = `${minSize} - ${maxSize}`;
                }
            }
        }
    }
}

// 切換排序順序
function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortSizes');

    // 更新圖標
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

// 排序尺碼值列表
function sortSizeValuesList() {
    const sizeValuesList = document.getElementById('sizeValuesList');
    const items = Array.from(sizeValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取尺碼值並排序
    const sizeValues = items.map(item => ({
        element: item,
        value: item.querySelector('.size-value-text').textContent.trim()
    }));

    // 按字母順序排序（簡單排序）
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

// 添加服裝尺碼
function addClothingSizes() {
    const categorySelect = document.getElementById('category_id');
    const selectedCategory = categorySelect.value;

    if (!selectedCategory) {
        showAlert('Please select a category first', 'warning');
        categorySelect.focus();
        return;
    }

    // 服裝尺碼：XXS 到 8XL + FREE SIZE
    const clothingSizes = [
        'FREE SIZE',
        'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL',
        '3XL', '4XL', '5XL', '6XL', '7XL', '8XL'
    ];

    addMultipleSizes(clothingSizes);
}

// 添加鞋子尺碼
function addShoeSizes() {
    const categorySelect = document.getElementById('category_id');
    const selectedCategory = categorySelect.value;

    if (!selectedCategory) {
        showAlert('Please select a category first', 'warning');
        categorySelect.focus();
        return;
    }

    // 鞋子尺碼：4-14 整碼和半碼 + FREE SIZE
    const shoeSizes = [
        'FREE SIZE',
        '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5',
        '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5',
        '12', '12.5', '13', '13.5', '14'
    ];

    addMultipleSizes(shoeSizes);
}

// 添加多個尺碼
function addMultipleSizes(sizes) {
    let addedCount = 0;
    let skippedCount = 0;

    sizes.forEach(size => {
        if (!isSizeValueExists(sizeList, size)) {
            addSizeValueToList(size);
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 顯示結果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} size values`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} size values, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All size values already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加尺碼值，顯示右邊的表格
    if (addedCount > 0) {
        showSizeValuesArea();
    }
}

// 添加尺碼值到列表
function addSizeValueToList(sizeValue) {
    const categorySelect = document.getElementById('category_id');
    const categoryId = categorySelect.value;

    // 檢查是否為重複項
    if (isSizeValueExists(sizeList, sizeValue)) {
        return; // 跳過重複項，不添加到列表
    }

    // 添加到 sizeList 數組
    sizeList.push({
        sizeValue: sizeValue,
        categoryId: categoryId
    });

    // 重新渲染整個列表
    updateSizeList();
    updateUI();

    // 顯示尺碼值區域
    showSizeValuesArea();
}

// 表單提交處理
function handleFormSubmit(e) {
    e.preventDefault();

    // 檢查是否有尺碼值
    if (sizeList.length === 0) {
        showAlert('Please add at least one size value', 'warning');
        return;
    }

    // 預提交重複檢查
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

    // 準備提交數據
    const libraryData = {
        categoryId: document.getElementById('category_id').value,
        sizeValues: sizeList.map(item => item.sizeValue),
        status: document.querySelector('input[name="size_status"]:checked')?.value || 'Available'
    };

    // 使用通用創建函數
    createLibrary(libraryData,
        function(data) {
            showAlert(data.message || 'Size library created successfully', 'success');
            setTimeout(() => {
                window.location.href = window.sizeLibraryManagementRoute || '/admin/sizes/library';
            }, 2000);
        },
        function(error) {
            showAlert(error || 'Error creating size library', 'error');
        }
    );
}
