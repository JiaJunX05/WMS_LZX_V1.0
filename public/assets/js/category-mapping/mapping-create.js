/**
 * Mapping Create Page JavaScript
 * 映射創建頁面交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁面
    initializeMappingCreate();
});

function initializeMappingCreate() {
    // 使用通用初始化函數
    initializeMappingPage({
        initializationCallback: function() {
            bindCreateEvents();
            updateUI();
        }
    });
}

function bindCreateEvents() {
    // 添加映射按鈕
    const addMappingBtn = document.getElementById('addMapping');
    if (addMappingBtn) {
        addMappingBtn.addEventListener('click', addMapping);
    }

    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 排序按鈕
    const sortBtn = document.getElementById('sortMappings');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 刪除映射按鈕事件委託
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));

            if (!isNaN(index)) {
                removeMapping(index);
            }
        }
    });

    // 表單提交處理
    const form = document.getElementById('mappingForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// 全局變量
let mappingList = [];
let isAscending = true;

// 添加映射
function addMapping() {
    if (!validateMappingForm()) {
        return;
    }

    const categoryId = document.getElementById('category_id').value;
    const subcategoryId = document.getElementById('subcategory_id').value;

    // 檢查是否已存在
    const existingMapping = isMappingExists(mappingList, categoryId, subcategoryId);
    if (existingMapping) {
        showAlert('This mapping combination already exists', 'error');
        return;
    }

    // 獲取名稱
    const categorySelect = document.getElementById('category_id');
    const subcategorySelect = document.getElementById('subcategory_id');
    const categoryName = categorySelect.options[categorySelect.selectedIndex].text;
    const subcategoryName = subcategorySelect.options[subcategorySelect.selectedIndex].text;

    // 添加到列表
    const mapping = {
        categoryId: categoryId,
        subcategoryId: subcategoryId,
        categoryName: categoryName,
        subcategoryName: subcategoryName
    };

    mappingList.push(mapping);

    // 更新UI
    updateMappingList();
    updateUI();

    // 清空選擇
    document.getElementById('category_id').value = '';
    document.getElementById('subcategory_id').value = '';
    document.getElementById('selectedCategory').textContent = 'None';
    document.getElementById('selectedSubcategory').textContent = 'None';
    updateConfigSummary();

    showAlert('Mapping added successfully', 'success');
}

// 從列表中移除映射
function removeMapping(index) {
    if (index >= 0 && index < mappingList.length) {
        mappingList.splice(index, 1);
        updateMappingList();
        updateUI();
    } else {
        showAlert('Error: Invalid mapping index', 'error');
    }
}

// 更新映射列表顯示
function updateMappingList() {
    const mappingListContainer = document.getElementById('mappingList');

    if (mappingList.length === 0) {
        mappingListContainer.innerHTML = '';
        return;
    }

    let html = '';
    mappingList.forEach((mapping, index) => {
        html += `
            <div class="value-item d-flex align-items-center justify-content-between p-3 mb-2 bg-light rounded border fade-in" data-category-id="${mapping.categoryId}" data-subcategory-id="${mapping.subcategoryId}">
                <div class="d-flex align-items-center">
                    <i class="bi bi-link-45deg text-primary me-2"></i>
                    <div class="mapping-combination">
                        <span class="category-badge">${mapping.categoryName}</span>
                        <span>-</span>
                        <span class="subcategory-badge">${mapping.subcategoryName}</span>
                    </div>
                </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
            </div>
        `;
    });

    mappingListContainer.innerHTML = html;
}

// 更新UI狀態
function updateUI() {
    const categoryId = document.getElementById('category_id').value;
    const subcategoryId = document.getElementById('subcategory_id').value;
    const addBtn = document.getElementById('addMapping');
    const initialMessage = document.getElementById('initial-message');
    const mappingArea = document.getElementById('mappingArea');
    const statusSelection = document.getElementById('statusSelection');
    const submitSection = document.getElementById('submitSection');
    const mappingCount = document.getElementById('mappingCount');
    const mappingCountText = document.getElementById('mappingCountText');

    // 更新添加按鈕狀態
    if (categoryId && subcategoryId) {
        addBtn.disabled = false;
        addBtn.classList.remove('btn-secondary');
        addBtn.classList.add('btn-primary');
    } else {
        addBtn.disabled = true;
        addBtn.classList.remove('btn-primary');
        addBtn.classList.add('btn-secondary');
    }

    // 更新映射計數
    const count = mappingList.length;
    if (mappingCount) {
        mappingCount.textContent = `${count} mapping${count !== 1 ? 's' : ''}`;
    }
    if (mappingCountText) {
        mappingCountText.textContent = count === 0 ? 'No mappings added yet' : `${count} mapping${count !== 1 ? 's' : ''} added`;
    }

    // 顯示/隱藏區域
    if (count > 0) {
        initialMessage.style.display = 'none';
        mappingArea.style.display = 'block';
        statusSelection.style.display = 'block';
        submitSection.style.display = 'block';
    } else {
        initialMessage.style.display = 'block';
        mappingArea.style.display = 'none';
        statusSelection.style.display = 'none';
        submitSection.style.display = 'none';
    }
}

// 清除表單
function clearForm() {
    if (mappingList.length === 0) {
        showAlert('No mappings to clear', 'info');
        return;
    }

    if (confirm('Are you sure you want to clear all mappings?')) {
        mappingList = [];
        updateMappingList();
        updateUI();
        showAlert('All mappings cleared', 'info');
    }
}

// 切換排序順序
function toggleSortOrder() {
    isAscending = !isAscending;

    // 更新圖標
    const sortIcon = document.getElementById('sortIcon');
    if (sortIcon) {
        sortIcon.className = isAscending ? 'bi bi-sort-down' : 'bi bi-sort-up';
    }

    // 排序映射列表
    mappingList.sort((a, b) => {
        const aText = `${a.categoryName} - ${a.subcategoryName}`;
        const bText = `${b.categoryName} - ${b.subcategoryName}`;

        if (isAscending) {
            return aText.localeCompare(bText);
        } else {
            return bText.localeCompare(aText);
        }
    });

    // 更新顯示
    updateMappingList();

    showAlert(`Sorted ${isAscending ? 'ascending' : 'descending'}`, 'info');
}

// 表單提交處理
function handleFormSubmit(e) {
    e.preventDefault();

    if (mappingList.length === 0) {
        showAlert('Please add at least one mapping', 'warning');
        return;
    }

    // 獲取狀態
    const statusRadio = document.querySelector('input[name="mapping_status"]:checked');
    const status = statusRadio ? statusRadio.value : 'Available';

    // 提交前再次檢查重複組合
    const duplicates = [];
    const seen = new Set();

    for (let i = 0; i < mappingList.length; i++) {
        const mapping = mappingList[i];
        const combination = `${mapping.categoryId}-${mapping.subcategoryId}`;

        if (seen.has(combination)) {
            duplicates.push(`${mapping.categoryName} - ${mapping.subcategoryName}`);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        showAlert(`Duplicate combinations found: ${duplicates.join(', ')}. Please remove duplicates before submitting.`, 'error');
        return;
    }

    // 準備提交數據
    const mappingData = mappingList.map(mapping => ({
        ...mapping,
        status: status
    }));

    // 使用通用創建函數
    createMapping(mappingData,
        function(data) {
            showAlert(data.message, 'success');
            setTimeout(() => {
                window.location.href = window.mappingManagementRoute;
            }, 2000);
        },
        function(error) {
            showAlert(error || 'An error occurred while creating mappings', 'error');
        }
    );
}
