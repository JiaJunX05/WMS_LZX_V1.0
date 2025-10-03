/**
 * Rack Create Page JavaScript
 * 货架创建页面交互逻辑
 *
 * 功能：
 * - 货架编号和容量输入和管理
 * - 状态管理
 * - 表单验证和提交
 * - 批量创建支持
 */

// 货架列表数组
let rackList = [];

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeRackCreate();
});

function initializeRackCreate() {
    // 绑定事件监听器
    bindEvents();

    // 初始化状态
    updateUI();

    // 如果已有货架数据，显示货架列表
    if (rackList.length > 0) {
        showRackValuesArea();
    }
}

function bindEvents() {
    // 货架编号输入框回车事件
    const rackNumberInput = document.getElementById('rack_number');
    if (rackNumberInput) {
        rackNumberInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addRack();
            }
        });
    }

    // 添加货架按钮
    const addRackBtn = document.getElementById('addRack');
    if (addRackBtn) {
        addRackBtn.addEventListener('click', addRack);
    }

    // 清除表单按钮
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：删除货架按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            removeRack(index);
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
    const sortBtn = document.getElementById('sortRacks');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 快速添加按钮
    const addCommonRacksBtn = document.getElementById('addCommonRacks');
    if (addCommonRacksBtn) {
        addCommonRacksBtn.addEventListener('click', addCommonRacks);
    }

    const addWarehouseRacksBtn = document.getElementById('addWarehouseRacks');
    if (addWarehouseRacksBtn) {
        addWarehouseRacksBtn.addEventListener('click', addWarehouseRacks);
    }

    // 图片上传预览
    const imageInput = document.getElementById('rack_image');
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

function addRack() {
    const rackNumberInput = document.getElementById('rack_number');
    const capacityInput = document.getElementById('capacity');
    const rackStatus = document.querySelector('input[name="rack_status"]:checked');

    const rackNumber = rackNumberInput.value.trim();
    const capacity = capacityInput.value.trim() || '50'; // 默认容量50

    // 验证输入
    if (!rackNumber) {
        showAlert('Please enter rack number', 'warning');
        rackNumberInput.focus();
        return;
    }

    if (!rackStatus) {
        showAlert('Please select rack status', 'warning');
        return;
    }

    // 检查是否已存在
    if (isRackExists(rackNumber)) {
        showAlert(`Rack number "${rackNumber}" already exists in the list`, 'error');
        highlightExistingRack(rackNumber);
        rackNumberInput.focus();
        return;
    }

    // 获取当前图片文件
    const imageInput = document.getElementById('rack_image');
    let rackImageFile = null;
    if (imageInput && imageInput.files && imageInput.files[0]) {
        rackImageFile = imageInput.files[0];
    }

    // 添加到货架数组
    addRackToArray(rackNumber, capacity, rackStatus.value, rackImageFile);
    // 显示成功提示
    showAlert('Rack added successfully', 'success');
}

function addRackToArray(rackNumber, capacity, rackStatus, rackImageFile) {
    // 添加货架到数组
    const rackData = {
        rackNumber: rackNumber,
        capacity: capacity,
        rackStatus: rackStatus,
        rackImageFile: rackImageFile // 存储文件对象而不是base64
    };

    rackList.push(rackData);

    // 更新UI
    updateRackList();
    updateUI();

    // 显示右边的货架表格
    showRackValuesArea();

    // 清空输入框
    const rackNumberInput = document.getElementById('rack_number');
    if (rackNumberInput) {
        rackNumberInput.value = '';
        rackNumberInput.focus();
    }

    // 清空图片（不显示消息）
    resetImageWithoutMessage();
}

function isRackExists(rackNumber) {
    return rackList.some(item => item.rackNumber.toLowerCase() === rackNumber.toLowerCase());
}

function removeRack(index) {
    console.log('Removing rack at index:', index);
    console.log('Rack list before removal:', rackList);

    if (index >= 0 && index < rackList.length) {
        rackList.splice(index, 1);
        console.log('Rack list after removal:', rackList);
        updateRackList();
        updateUI();
    } else {
        console.error('Invalid index:', index);
        showAlert('Error: Invalid rack index', 'error');
    }
}

function updateRackList() {
    const container = document.getElementById('rackValuesList');
    if (!container) return;

    container.innerHTML = '';

    rackList.forEach((item, index) => {
        const rackItem = document.createElement('div');

        // 检查是否为重复项
        const isDuplicate = isRackExists(item.rackNumber) &&
            rackList.filter(i => i.rackNumber.toLowerCase() === item.rackNumber.toLowerCase()).length > 1;

        // 根据是否为重复项设置不同的样式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
        const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

        rackItem.className = `${baseClasses} ${duplicateClasses}`;

        rackItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                ${item.rackImageFile ?
                    `<img src="${URL.createObjectURL(item.rackImageFile)}" alt="${item.rackNumber}" class="item-image me-2" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;">` :
                    '<div class="item-image-placeholder me-2" style="width: 32px; height: 32px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-box text-muted"></i></div>'
                }
                <div class="d-flex flex-column">
                    <span class="item-value-text fw-medium">${item.rackNumber}</span>
                    <small class="text-muted">Capacity: ${item.capacity} items</small>
                </div>
                ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;
        container.appendChild(rackItem);
    });
}

function highlightExistingRack(rackNumber) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.item-value-text').textContent.trim();
        if (value.toLowerCase() === rackNumber.toLowerCase()) {
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

function addRackToList(rackNumber, capacity, rackStatus, rackImageFile = null) {
    // 检查是否为重复项
    if (isRackExists(rackNumber)) {
        console.log('Duplicate detected in batch add, skipping:', rackNumber);
        return; // 跳过重复项，不添加到列表
    }

    // 添加到 rackList 数组
    rackList.push({
        rackNumber: rackNumber,
        capacity: capacity,
        rackStatus: rackStatus,
        rackImageFile: rackImageFile
    });

    // 重新渲染整个列表
    updateRackList();
    updateUI();

    // 显示货架值区域
    showRackValuesArea();
}

function showRackValuesArea() {
    // 隐藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 隐藏输入提示
    const rackInputPrompt = document.getElementById('rackInputPrompt');
    if (rackInputPrompt) {
        rackInputPrompt.style.display = 'none';
    }

    // 显示货架值区域
    const rackValuesArea = document.getElementById('rackValuesArea');
    if (rackValuesArea) {
        rackValuesArea.style.display = 'block';
    }

    // 更新货架名称显示
    updateRackNameDisplay();

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
    if (rackList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 确认清除
    if (!confirm('Are you sure you want to clear all racks?')) {
        return;
    }

    // 清空数组
    rackList = [];

    // 清空输入框
    const rackNumberInput = document.getElementById('rack_number');
    const capacityInput = document.getElementById('capacity');
    if (rackNumberInput) {
        rackNumberInput.value = '';
    }
    if (capacityInput) {
        capacityInput.value = '';
    }

    // 重置状态选择
    const availableStatus = document.querySelector('input[name="rack_status"][value="Available"]');
    if (availableStatus) {
        availableStatus.checked = true;
        selectStatusCard(availableStatus.closest('.status-card'));
    }

    // 更新UI
    updateRackList();
    updateUI();

    // 显示成功提示
    showAlert('All racks cleared successfully', 'success');

    // 隐藏所有区域
    hideAllAreas();

    // 更新UI
    updateUI();
}

function hideAllAreas() {
    // 隐藏货架值区域
    const rackValuesArea = document.getElementById('rackValuesArea');
    if (rackValuesArea) {
        rackValuesArea.style.display = 'none';
    }

    // 隐藏输入提示
    const rackInputPrompt = document.getElementById('rackInputPrompt');
    if (rackInputPrompt) {
        rackInputPrompt.style.display = 'none';
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
    // 更新货架范围显示
    updateRackRangeDisplay();

    // 显示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (configSummary) {
        configSummary.style.display = 'block';
    }
}

function updateRackNameDisplay() {
    const rackNameSpan = document.getElementById('rackName');
    if (rackNameSpan) {
        if (rackList.length > 0) {
            // 显示货架数量
            rackNameSpan.textContent = `- ${rackList.length} racks`;
        } else {
            rackNameSpan.textContent = '';
        }
    }
}

function updateRackRangeDisplay() {
    const rackNumbers = rackList.map(item => item.rackNumber);

    const selectedRackSpan = document.getElementById('selectedRack');
    if (selectedRackSpan) {
        if (rackNumbers.length === 0) {
            selectedRackSpan.textContent = 'None';
        } else if (rackNumbers.length === 1) {
            selectedRackSpan.textContent = rackNumbers[0];
        } else {
            // 按字母顺序排序
            const sortedNumbers = rackNumbers.sort();
            const minRack = sortedNumbers[0];
            const maxRack = sortedNumbers[sortedNumbers.length - 1];
            selectedRackSpan.textContent = `${minRack} - ${maxRack}`;
        }
    }
}

function updateUI() {
    // 更新货架值计数
    updateRackValuesCount();

    // 更新货架范围显示
    updateRackRangeDisplay();

    // 更新货架名称显示
    updateRackNameDisplay();

    // 更新配置摘要
    updateConfigSummary();
}

function updateRackValuesCount() {
    const count = rackList.length;

    // 更新右侧计数徽章
    const countBadge = document.getElementById('rackValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} racks`;
    }

    // 更新左侧计数文本
    const countText = document.getElementById('rackCountText');
    if (countText) {
        if (count === 0) {
            countText.textContent = 'No racks added yet';
        } else if (count === 1) {
            countText.textContent = '1 rack added';
        } else {
            countText.textContent = `${count} racks added`;
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
    const sortBtn = document.getElementById('sortRacks');

    // 更新图标
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortRackValuesList();
}

function sortRackValuesList() {
    const rackValuesList = document.getElementById('rackValuesList');
    const items = Array.from(rackValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 获取货架编号并排序
    const rackValues = items.map(item => ({
        element: item,
        value: item.querySelector('.item-value-text').textContent.trim()
    }));

    // 按字母顺序排序
    rackValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    rackValues.forEach(({ element }) => {
        rackValuesList.appendChild(element);
    });
}

function addCommonRacks() {
    // Common racks
    const commonRacks = [
        'R001', 'R002', 'R003', 'R004', 'R005',
        'R006', 'R007', 'R008', 'R009', 'R010',
        'R011', 'R012', 'R013', 'R014', 'R015',
        'R016', 'R017', 'R018', 'R019', 'R020'
    ];

    addMultipleRacks(commonRacks);
}

function addWarehouseRacks() {
    // Warehouse racks
    const warehouseRacks = [
        'A01', 'A02', 'A03', 'A04', 'A05',
        'B01', 'B02', 'B03', 'B04', 'B05',
        'C01', 'C02', 'C03', 'C04', 'C05',
        'D01', 'D02', 'D03', 'D04', 'D05',
        'E01', 'E02', 'E03', 'E04', 'E05',
        'F01', 'F02', 'F03', 'F04', 'F05'
    ];

    addMultipleRacks(warehouseRacks);
}

function addMultipleRacks(racks) {
    let addedCount = 0;
    let skippedCount = 0;
    const selectedStatus = document.querySelector('input[name="rack_status"]:checked');
    const capacityInput = document.getElementById('capacity');
    const defaultCapacity = capacityInput.value.trim() || '50';

    if (!selectedStatus) {
        showAlert('Please select rack status first', 'warning');
        return;
    }

    racks.forEach(rack => {
        if (!isRackExists(rack)) {
            addRackToList(rack, defaultCapacity, selectedStatus.value);
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 显示结果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} racks`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} racks, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All racks already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加货架，显示右边的表格
    if (addedCount > 0) {
        showRackValuesArea();
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
    const imageInput = document.getElementById('rack_image');
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
    const imageInput = document.getElementById('rack_image');
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
document.getElementById('rackForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // 检查是否有货架
    if (rackList.length === 0) {
        showAlert('Please add at least one rack', 'warning');
        return;
    }

    // 预提交重复检查
    const duplicates = [];
    const seen = new Set();
    for (const item of rackList) {
        const combination = item.rackNumber.toLowerCase();
        if (seen.has(combination)) {
            duplicates.push(item.rackNumber);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        showAlert(`Duplicate rack numbers found: ${duplicates.join(', ')}. Please remove duplicates before submitting.`, 'error');
        return;
    }

    // 准备提交数据
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加货架数据
    rackList.forEach((item, index) => {

        // 添加货架文本数据
        formData.append(`racks[${index}][rackNumber]`, item.rackNumber);
        formData.append(`racks[${index}][capacity]`, item.capacity);
        formData.append(`racks[${index}][rackStatus]`, item.rackStatus);

        // 添加图片文件（如果有）
        if (item.rackImageFile) {
            formData.append(`images[${index}]`, item.rackImageFile);
        }
    });

    // 提交数据
    fetch(window.createRackUrl, {
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
            showAlert(data.message || 'Racks created successfully', 'success');

            // 延迟重定向到dashboard，让用户看到成功消息
            setTimeout(() => {
                window.location.href = window.rackManagementRoute || '/admin/storage-locations/rack';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to create racks', 'error');
        }
    })
    .catch(error => {
        showAlert('Error creating racks: ' + error.message, 'error');
    });
});

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
