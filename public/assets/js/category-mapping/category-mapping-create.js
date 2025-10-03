/**
 * Category Mapping Create Page JavaScript
 * 分类映射创建页面交互逻辑
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeMappingCreate();
});

function initializeMappingCreate() {
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

    // 子分类选择变化
    const subcategorySelect = document.getElementById('subcategory_id');
    if (subcategorySelect) {
        subcategorySelect.addEventListener('change', handleSubcategoryChange);
    }

    // 添加映射按钮
    const addMappingBtn = document.getElementById('addMapping');
    if (addMappingBtn) {
        addMappingBtn.addEventListener('click', addMapping);
    }

    // 清除表单按钮
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 状态卡片选择
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            selectStatusCard(this);
        });
    });

    // 排序按钮
    const sortBtn = document.getElementById('sortMappings');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 删除映射按钮事件委托
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));

            if (!isNaN(index)) {
                removeMapping(index);
            }
        }
    });
}

// 全局变量
let mappingList = [];
let isAscending = true;

// 处理分类选择变化
function handleCategoryChange() {
    const categorySelect = document.getElementById('category_id');
    const selectedCategory = categorySelect.options[categorySelect.selectedIndex];

    if (selectedCategory.value) {
        document.getElementById('selectedCategory').textContent = selectedCategory.text;
        updateConfigSummary();
    } else {
        document.getElementById('selectedCategory').textContent = 'None';
        updateConfigSummary();
    }

    updateUI();
}

// 处理子分类选择变化
function handleSubcategoryChange() {
    const subcategorySelect = document.getElementById('subcategory_id');
    const selectedSubcategory = subcategorySelect.options[subcategorySelect.selectedIndex];

    if (selectedSubcategory.value) {
        document.getElementById('selectedSubcategory').textContent = selectedSubcategory.text;
        updateConfigSummary();
    } else {
        document.getElementById('selectedSubcategory').textContent = 'None';
        updateConfigSummary();
    }

    updateUI();
}

// 更新配置摘要
function updateConfigSummary() {
    const categorySelect = document.getElementById('category_id');
    const subcategorySelect = document.getElementById('subcategory_id');
    const configSummary = document.getElementById('configSummary');

    if (categorySelect.value && subcategorySelect.value) {
        configSummary.style.display = 'block';
    } else {
        configSummary.style.display = 'none';
    }
}

// 添加映射
function addMapping() {
    const categoryId = document.getElementById('category_id').value;
    const subcategoryId = document.getElementById('subcategory_id').value;

    if (!categoryId || !subcategoryId) {
        showAlert('Please select both category and subcategory', 'warning');
        return;
    }

    // 检查是否已存在
    console.log('Checking for duplicates:', { categoryId, subcategoryId, mappingList });
    const existingMapping = mappingList.find(mapping =>
        mapping.categoryId === categoryId && mapping.subcategoryId === subcategoryId
    );
    console.log('Existing mapping found:', existingMapping);

    if (existingMapping) {
        console.log('Duplicate detected, showing alert');
        showAlert('This mapping combination already exists', 'error');
        return;
    }
    console.log('No duplicate found, adding mapping');

    // 获取名称
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

    // 清空选择
    document.getElementById('category_id').value = '';
    document.getElementById('subcategory_id').value = '';
    document.getElementById('selectedCategory').textContent = 'None';
    document.getElementById('selectedSubcategory').textContent = 'None';
    updateConfigSummary();

    showAlert('Mapping added successfully', 'success');
}

// 从列表中移除映射
function removeMapping(index) {
    console.log('Removing mapping at index:', index);
    console.log('Mapping list before removal:', mappingList);

    if (index >= 0 && index < mappingList.length) {
        mappingList.splice(index, 1);
        console.log('Mapping list after removal:', mappingList);
        updateMappingList();
        updateUI();
    } else {
        console.error('Invalid index:', index);
        showAlert('Error: Invalid mapping index', 'error');
    }
}

// 更新映射列表显示
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

// 更新UI状态
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

    // 更新添加按钮状态
    if (categoryId && subcategoryId) {
        addBtn.disabled = false;
        addBtn.classList.remove('btn-secondary');
        addBtn.classList.add('btn-primary');
    } else {
        addBtn.disabled = true;
        addBtn.classList.remove('btn-primary');
        addBtn.classList.add('btn-secondary');
    }

    // 更新映射计数
    const count = mappingList.length;
    if (mappingCount) {
        mappingCount.textContent = `${count} mapping${count !== 1 ? 's' : ''}`;
    }
    if (mappingCountText) {
        mappingCountText.textContent = count === 0 ? 'No mappings added yet' : `${count} mapping${count !== 1 ? 's' : ''} added`;
    }

    // 显示/隐藏区域
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

// 清除表单
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

// 选择状态卡片
function selectStatusCard(card) {
    // 移除所有选中状态
    document.querySelectorAll('.status-card').forEach(c => {
        c.classList.remove('selected');
    });

    // 添加选中状态
    card.classList.add('selected');

    // 更新单选按钮
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
    }
}

// 切换排序顺序
function toggleSortOrder() {
    isAscending = !isAscending;

    // 更新图标
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

    // 更新显示
    updateMappingList();

    showAlert(`Sorted ${isAscending ? 'ascending' : 'descending'}`, 'info');
}

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用

// 表单提交处理
document.getElementById('mappingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    if (mappingList.length === 0) {
        showAlert('Please add at least one mapping', 'warning');
        return;
    }

    // 获取状态
    const statusRadio = document.querySelector('input[name="mapping_status"]:checked');
    const status = statusRadio ? statusRadio.value : 'Available';

    // 提交前再次检查重复组合
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

    // 准备提交数据
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加映射数据
    mappingList.forEach((mapping, index) => {
        formData.append(`mappings[${index}][category_id]`, mapping.categoryId);
        formData.append(`mappings[${index}][subcategory_id]`, mapping.subcategoryId);
        formData.append(`mappings[${index}][mapping_status]`, status);
    });

    // 提交表单
    fetch(window.createMappingUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Server error');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showAlert(data.message, 'success');
            setTimeout(() => {
                window.location.href = window.mappingManagementRoute;
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to create mappings', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert(error.message || 'An error occurred while creating mappings', 'error');
    });
});

