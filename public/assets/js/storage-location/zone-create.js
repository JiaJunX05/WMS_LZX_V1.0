/**
 * Zone Create Page JavaScript
 * 区域创建页面交互逻辑
 *
 * 功能：
 * - 区域名称和位置输入和管理
 * - 状态管理
 * - 表单验证和提交
 * - 批量创建支持
 */

// 区域列表数组
let zoneList = [];

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeZoneCreate();
});

function initializeZoneCreate() {
    // 绑定事件监听器
    bindEvents();

    // 初始化状态
    updateUI();

    // 如果已有区域数据，显示区域列表
    if (zoneList.length > 0) {
        showZoneValuesArea();
    }
}

function bindEvents() {
    // 区域名称输入框回车事件
    const zoneNameInput = document.getElementById('zone_name');
    if (zoneNameInput) {
        zoneNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addZone();
            }
        });
    }

    // 添加区域按钮
    const addZoneBtn = document.getElementById('addZone');
    if (addZoneBtn) {
        addZoneBtn.addEventListener('click', addZone);
    }

    // 清除表单按钮
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 事件委托：删除区域按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            removeZone(index);
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
    const sortBtn = document.getElementById('sortZones');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 快速添加按钮
    const addCommonZonesBtn = document.getElementById('addCommonZones');
    if (addCommonZonesBtn) {
        addCommonZonesBtn.addEventListener('click', addCommonZones);
    }

    const addWarehouseZonesBtn = document.getElementById('addWarehouseZones');
    if (addWarehouseZonesBtn) {
        addWarehouseZonesBtn.addEventListener('click', addWarehouseZones);
    }

    // 图片上传预览
    const imageInput = document.getElementById('zone_image');
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

function addZone() {
    const zoneNameInput = document.getElementById('zone_name');
    const locationInput = document.getElementById('location');
    const zoneStatus = document.querySelector('input[name="zone_status"]:checked');

    const zoneName = zoneNameInput.value.trim();
    const location = locationInput.value.trim();

    // 验证输入
    if (!zoneName) {
        showAlert('Please enter zone name', 'warning');
        zoneNameInput.focus();
        return;
    }

    if (!location) {
        showAlert('Please enter zone location', 'warning');
        locationInput.focus();
        return;
    }

    if (!zoneStatus) {
        showAlert('Please select zone status', 'warning');
        return;
    }

    // 检查是否已存在
    if (isZoneExists(zoneName)) {
        showAlert(`Zone name "${zoneName}" already exists in the list`, 'error');
        highlightExistingZone(zoneName);
        zoneNameInput.focus();
        return;
    }

    // 获取当前图片文件
    const imageInput = document.getElementById('zone_image');
    let zoneImageFile = null;
    if (imageInput && imageInput.files && imageInput.files[0]) {
        zoneImageFile = imageInput.files[0];
    }

    // 添加到区域数组
    addZoneToArray(zoneName, location, zoneStatus.value, zoneImageFile);
    // 显示成功提示
    showAlert('Zone added successfully', 'success');
}

function addZoneToArray(zoneName, location, zoneStatus, zoneImageFile) {
    // 添加区域到数组
    const zoneData = {
        zoneName: zoneName,
        location: location,
        zoneStatus: zoneStatus,
        zoneImageFile: zoneImageFile // 存储文件对象而不是base64
    };

    zoneList.push(zoneData);

    // 更新UI
    updateZoneList();
    updateUI();

    // 显示右边的区域表格
    showZoneValuesArea();

    // 清空输入框
    const zoneNameInput = document.getElementById('zone_name');
    if (zoneNameInput) {
        zoneNameInput.value = '';
        zoneNameInput.focus();
    }

    // 清空图片（不显示消息）
    resetImageWithoutMessage();
}

function isZoneExists(zoneName) {
    return zoneList.some(item => item.zoneName.toLowerCase() === zoneName.toLowerCase());
}

function removeZone(index) {
    console.log('Removing zone at index:', index);
    console.log('Zone list before removal:', zoneList);

    if (index >= 0 && index < zoneList.length) {
        zoneList.splice(index, 1);
        console.log('Zone list after removal:', zoneList);
        updateZoneList();
        updateUI();
    } else {
        console.error('Invalid index:', index);
        showAlert('Error: Invalid zone index', 'error');
    }
}

function updateZoneList() {
    const container = document.getElementById('zoneValuesList');
    if (!container) return;

    container.innerHTML = '';

    zoneList.forEach((item, index) => {
        const zoneItem = document.createElement('div');

        // 检查是否为重复项
        const isDuplicate = isZoneExists(item.zoneName) &&
            zoneList.filter(i => i.zoneName.toLowerCase() === item.zoneName.toLowerCase()).length > 1;

        // 根据是否为重复项设置不同的样式
        const baseClasses = 'item-value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
        const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

        zoneItem.className = `${baseClasses} ${duplicateClasses}`;

        zoneItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                ${item.zoneImageFile ?
                    `<img src="${URL.createObjectURL(item.zoneImageFile)}" alt="${item.zoneName}" class="item-image me-2" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;">` :
                    '<div class="item-image-placeholder me-2" style="width: 32px; height: 32px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-geo-alt text-muted"></i></div>'
                }
                <div class="d-flex flex-column">
                    <span class="item-value-text fw-medium">${item.zoneName}</span>
                    <small class="text-muted">${item.location}</small>
                </div>
                ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;
        container.appendChild(zoneItem);
    });
}

function highlightExistingZone(zoneName) {
    const existingValues = document.querySelectorAll('.item-value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.item-value-text').textContent.trim();
        if (value.toLowerCase() === zoneName.toLowerCase()) {
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

function addZoneToList(zoneName, location, zoneStatus, zoneImageFile = null) {
    // 检查是否为重复项
    if (isZoneExists(zoneName)) {
        console.log('Duplicate detected in batch add, skipping:', zoneName);
        return; // 跳过重复项，不添加到列表
    }

    // 添加到 zoneList 数组
    zoneList.push({
        zoneName: zoneName,
        location: location,
        zoneStatus: zoneStatus,
        zoneImageFile: zoneImageFile
    });

    // 重新渲染整个列表
    updateZoneList();
    updateUI();

    // 显示区域值区域
    showZoneValuesArea();
}

function showZoneValuesArea() {
    // 隐藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 隐藏输入提示
    const zoneInputPrompt = document.getElementById('zoneInputPrompt');
    if (zoneInputPrompt) {
        zoneInputPrompt.style.display = 'none';
    }

    // 显示区域值区域
    const zoneValuesArea = document.getElementById('zoneValuesArea');
    if (zoneValuesArea) {
        zoneValuesArea.style.display = 'block';
    }

    // 更新区域名称显示
    updateZoneNameDisplay();

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
    if (zoneList.length === 0) {
        showAlert('No data to clear', 'info');
        return;
    }

    // 确认清除
    if (!confirm('Are you sure you want to clear all zones?')) {
        return;
    }

    // 清空数组
    zoneList = [];

    // 清空输入框
    const zoneNameInput = document.getElementById('zone_name');
    const locationInput = document.getElementById('location');
    if (zoneNameInput) {
        zoneNameInput.value = '';
    }
    if (locationInput) {
        locationInput.value = '';
    }

    // 重置状态选择
    const availableStatus = document.querySelector('input[name="zone_status"][value="Available"]');
    if (availableStatus) {
        availableStatus.checked = true;
        selectStatusCard(availableStatus.closest('.status-card'));
    }

    // 更新UI
    updateZoneList();
    updateUI();

    // 显示成功提示
    showAlert('All zones cleared successfully', 'success');

    // 隐藏所有区域
    hideAllAreas();

    // 更新UI
    updateUI();
}

function hideAllAreas() {
    // 隐藏区域值区域
    const zoneValuesArea = document.getElementById('zoneValuesArea');
    if (zoneValuesArea) {
        zoneValuesArea.style.display = 'none';
    }

    // 隐藏输入提示
    const zoneInputPrompt = document.getElementById('zoneInputPrompt');
    if (zoneInputPrompt) {
        zoneInputPrompt.style.display = 'none';
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
    // 更新区域范围显示
    updateZoneRangeDisplay();

    // 显示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (configSummary) {
        configSummary.style.display = 'block';
    }
}

function updateZoneNameDisplay() {
    const zoneNameSpan = document.getElementById('zoneName');
    if (zoneNameSpan) {
        if (zoneList.length > 0) {
            // 显示区域数量
            zoneNameSpan.textContent = `- ${zoneList.length} zones`;
        } else {
            zoneNameSpan.textContent = '';
        }
    }
}

function updateZoneRangeDisplay() {
    const zoneNames = zoneList.map(item => item.zoneName);

    const selectedZoneSpan = document.getElementById('selectedZone');
    if (selectedZoneSpan) {
        if (zoneNames.length === 0) {
            selectedZoneSpan.textContent = 'None';
        } else if (zoneNames.length === 1) {
            selectedZoneSpan.textContent = zoneNames[0];
        } else {
            // 按字母顺序排序
            const sortedNames = zoneNames.sort();
            const minZone = sortedNames[0];
            const maxZone = sortedNames[sortedNames.length - 1];
            selectedZoneSpan.textContent = `${minZone} - ${maxZone}`;
        }
    }
}

function updateUI() {
    // 更新区域值计数
    updateZoneValuesCount();

    // 更新区域范围显示
    updateZoneRangeDisplay();

    // 更新区域名称显示
    updateZoneNameDisplay();

    // 更新配置摘要
    updateConfigSummary();
}

function updateZoneValuesCount() {
    const count = zoneList.length;

    // 更新右侧计数徽章
    const countBadge = document.getElementById('zoneValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} zones`;
    }

    // 更新左侧计数文本
    const countText = document.getElementById('zoneCountText');
    if (countText) {
        if (count === 0) {
            countText.textContent = 'No zones added yet';
        } else if (count === 1) {
            countText.textContent = '1 zone added';
        } else {
            countText.textContent = `${count} zones added`;
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
    const sortBtn = document.getElementById('sortZones');

    // 更新图标
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortZoneValuesList();
}

function sortZoneValuesList() {
    const zoneValuesList = document.getElementById('zoneValuesList');
    const items = Array.from(zoneValuesList.querySelectorAll('.item-value-item'));

    if (items.length <= 1) return;

    // 获取区域名称并排序
    const zoneValues = items.map(item => ({
        element: item,
        value: item.querySelector('.item-value-text').textContent.trim()
    }));

    // 按字母顺序排序
    zoneValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    zoneValues.forEach(({ element }) => {
        zoneValuesList.appendChild(element);
    });
}

function addCommonZones() {
    // Common zones
    const commonZones = [
        'A Zone',
        'B Zone',
        'C Zone',
        'D Zone',
        'E Zone',
        'F Zone',
        'G Zone',
        'H Zone',
        'I Zone',
        'J Zone'
    ];

    addMultipleZones(commonZones);
}

function addWarehouseZones() {
    // Warehouse zones
    const warehouseZones = [
        'Receiving Zone',
        'Storage Zone A',
        'Storage Zone B',
        'Storage Zone C',
        'Picking Zone',
        'Packing Zone',
        'Shipping Zone',
        'Returns Zone',
        'Quality Control Zone',
        'Cold Storage Zone',
        'Hazardous Materials Zone',
        'Overflow Zone'
    ];

    addMultipleZones(warehouseZones);
}

function addMultipleZones(zones) {
    let addedCount = 0;
    let skippedCount = 0;
    const selectedStatus = document.querySelector('input[name="zone_status"]:checked');
    const locationInput = document.getElementById('location');
    const defaultLocation = locationInput.value.trim() || 'Warehouse';

    if (!selectedStatus) {
        showAlert('Please select zone status first', 'warning');
        return;
    }

    zones.forEach(zone => {
        if (!isZoneExists(zone)) {
            addZoneToList(zone, defaultLocation, selectedStatus.value);
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 显示结果
    if (addedCount > 0 && skippedCount === 0) {
        showAlert(`Successfully added ${addedCount} zones`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        showAlert(`Added ${addedCount} zones, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        showAlert('All zones already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加区域，显示右边的表格
    if (addedCount > 0) {
        showZoneValuesArea();
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
    const imageInput = document.getElementById('zone_image');
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
    const imageInput = document.getElementById('zone_image');
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
document.getElementById('zoneForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // 检查是否有区域
    if (zoneList.length === 0) {
        showAlert('Please add at least one zone', 'warning');
        return;
    }

    // 预提交重复检查
    const duplicates = [];
    const seen = new Set();
    for (const item of zoneList) {
        const combination = item.zoneName.toLowerCase();
        if (seen.has(combination)) {
            duplicates.push(item.zoneName);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        showAlert(`Duplicate zone names found: ${duplicates.join(', ')}. Please remove duplicates before submitting.`, 'error');
        return;
    }

    // 准备提交数据
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加区域数据
    zoneList.forEach((item, index) => {

        // 添加区域文本数据
        formData.append(`zones[${index}][zoneName]`, item.zoneName);
        formData.append(`zones[${index}][location]`, item.location);
        formData.append(`zones[${index}][zoneStatus]`, item.zoneStatus);

        // 添加图片文件（如果有）
        if (item.zoneImageFile) {
            formData.append(`images[${index}]`, item.zoneImageFile);
        }
    });

    // 提交数据
    fetch(window.createZoneUrl, {
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
            showAlert(data.message || 'Zones created successfully', 'success');

            // 延迟重定向到dashboard，让用户看到成功消息
            setTimeout(() => {
                window.location.href = window.zoneManagementRoute || '/admin/storage-locations/zone';
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to create zones', 'error');
        }
    })
    .catch(error => {
        showAlert('Error creating zones: ' + error.message, 'error');
    });
});

// ========================================
// Alert 系统 (Alert System)
// ========================================

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
