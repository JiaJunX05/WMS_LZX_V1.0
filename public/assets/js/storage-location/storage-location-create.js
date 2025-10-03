/**
 * Location Create Page JavaScript
 * 位置创建页面交互逻辑
 */

// 位置列表数组
let locationList = [];

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeLocationCreate();
});

function initializeLocationCreate() {
    // 绑定事件监听器
    bindEvents();

    // 初始化状态
    updateUI();
}

function bindEvents() {
    // 区域选择变化
    const zoneSelect = document.getElementById('zone_id');
    if (zoneSelect) {
        zoneSelect.addEventListener('change', handleZoneChange);
    }

    // 货架选择变化
    const rackSelect = document.getElementById('rack_id');
    if (rackSelect) {
        rackSelect.addEventListener('change', handleRackChange);
    }

    // 添加位置按钮
    const addLocationBtn = document.getElementById('addLocation');
    if (addLocationBtn) {
        addLocationBtn.addEventListener('click', addLocation);
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
    const sortBtn = document.getElementById('sortLocations');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

// 删除映射按钮事件委托
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));

            if (!isNaN(index)) {
                removeLocation(index);
            }
        }
    });
}

function handleZoneChange() {
    const zoneSelect = document.getElementById('zone_id');
    const selectedZone = zoneSelect.value;

    if (selectedZone) {
        // 显示位置输入提示
        showLocationInputPrompt();
        // 更新配置摘要
        updateConfigSummary();
    } else {
        // 隐藏所有相关区域
        hideAllAreas();
    }

    updateUI();
}

function handleRackChange() {
    const rackSelect = document.getElementById('rack_id');
    const selectedRack = rackSelect.value;

    if (selectedRack) {
        // 显示位置输入提示
        showLocationInputPrompt();
        // 更新配置摘要
        updateConfigSummary();
    } else {
        // 隐藏所有相关区域
        hideAllAreas();
    }

    updateUI();
}

function showLocationInputPrompt() {
    // 隐藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }
}

function addLocation() {
    const zoneSelect = document.getElementById('zone_id');
    const rackSelect = document.getElementById('rack_id');

    const zoneId = zoneSelect.value;
    const rackId = rackSelect.value;

    // 验证输入
    if (!zoneId) {
        showAlert('Please select a zone first', 'warning');
        zoneSelect.focus();
        return;
    }

    if (!rackId) {
        showAlert('Please select a rack first', 'warning');
        rackSelect.focus();
        return;
    }

    // 检查是否已存在
    console.log('Checking for duplicates:', { zoneId, rackId, locationList });
    if (isLocationExists(zoneId, rackId)) {
        console.log('Duplicate detected, showing alert');
        showAlert('This location combination already exists in the list', 'error');
        highlightExistingLocation(zoneId, rackId);
        return;
    }
    console.log('No duplicate found, adding location');

    // 添加位置到列表
    addLocationToList(zoneId, rackId);

    // 清空选择
    zoneSelect.value = '';
    rackSelect.value = '';
    document.getElementById('selectedZone').textContent = 'None';
    document.getElementById('selectedRack').textContent = 'None';
    updateConfigSummary();
    zoneSelect.focus();

    // 更新UI
    updateUI();

    // 显示成功添加的alert
    showAlert('Location added successfully', 'success');
}

function isLocationExists(zoneId, rackId) {
    return locationList.some(location =>
        location.zoneId === zoneId && location.rackId === rackId
    );
}

function highlightExistingLocation(zoneId, rackId) {
    const existingLocations = document.querySelectorAll('.value-item');
    for (let item of existingLocations) {
        const itemZoneId = item.dataset.zoneId;
        const itemRackId = item.dataset.rackId;
        if (itemZoneId === zoneId && itemRackId === rackId) {
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

function addLocationToList(zoneId, rackId) {
    // 获取区域和货架信息
    const zoneSelect = document.getElementById('zone_id');
    const rackSelect = document.getElementById('rack_id');
    const zoneName = zoneSelect.options[zoneSelect.selectedIndex].text;
    const rackName = rackSelect.options[rackSelect.selectedIndex].text;

    // 添加到数组
    const location = {
        zoneId: zoneId,
        rackId: rackId,
        zoneName: zoneName,
        rackName: rackName
    };

    locationList.push(location);

    // 更新列表显示
    updateLocationList();
    updateUI();
}

// 从列表中移除位置
function removeLocation(index) {
    locationList.splice(index, 1);
    updateLocationList();
    updateUI();
    showAlert('Location removed', 'info');
}

// 更新位置列表显示
function updateLocationList() {
    const locationListContainer = document.getElementById('locationList');

    if (locationList.length === 0) {
        locationListContainer.innerHTML = '';
        return;
    }

    let html = '';
    locationList.forEach((location, index) => {
        html += `
            <div class="value-item d-flex align-items-center justify-content-between p-3 mb-2 bg-light rounded border fade-in" data-zone-id="${location.zoneId}" data-rack-id="${location.rackId}">
                <div class="d-flex align-items-center">
                    <i class="bi bi-geo-alt text-primary me-2"></i>
                    <div class="location-combination">
                        <span class="zone-badge">${location.zoneName}</span>
                        <span>-</span>
                        <span class="rack-badge">${location.rackName}</span>
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                    <i class="bi bi-trash me-1"></i>Remove
                </button>
            </div>
        `;
    });

    locationListContainer.innerHTML = html;
}

function showLocationArea() {
    // 显示位置区域
    const locationArea = document.getElementById('locationArea');
    if (locationArea) {
        locationArea.style.display = 'block';
    }

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
    if (locationList.length === 0) {
        showAlert('No locations to clear', 'info');
        return;
    }

    if (confirm('Are you sure you want to clear all locations?')) {
        // 清空选择
        const zoneSelect = document.getElementById('zone_id');
        const rackSelect = document.getElementById('rack_id');
        if (zoneSelect) {
            zoneSelect.value = '';
        }
        if (rackSelect) {
            rackSelect.value = '';
        }

        // 清空位置列表
        locationList = [];
        const locationListElement = document.getElementById('locationList');
        if (locationListElement) {
            locationListElement.innerHTML = '';
        }

        // 隐藏所有区域
        hideAllAreas();

        // 更新UI
        updateUI();
        showAlert('All locations cleared', 'info');
    }
}

function hideAllAreas() {
    // 隐藏位置区域
    const locationArea = document.getElementById('locationArea');
    if (locationArea) {
        locationArea.style.display = 'none';
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
    const zoneSelect = document.getElementById('zone_id');
    const rackSelect = document.getElementById('rack_id');
    const selectedZone = zoneSelect.value;
    const selectedRack = rackSelect.value;

    if (selectedZone && selectedRack) {
        const zoneText = zoneSelect.options[zoneSelect.selectedIndex].text;
        const rackText = rackSelect.options[rackSelect.selectedIndex].text;

        // 更新配置摘要
        const selectedZoneSpan = document.getElementById('selectedZone');
        const selectedRackSpan = document.getElementById('selectedRack');
        if (selectedZoneSpan) {
            selectedZoneSpan.textContent = zoneText;
        }
        if (selectedRackSpan) {
            selectedRackSpan.textContent = rackText;
        }

        // 显示配置摘要
        const configSummary = document.getElementById('configSummary');
        if (configSummary) {
            configSummary.style.display = 'block';
        }
    }
}

function updateUI() {
    const zoneId = document.getElementById('zone_id').value;
    const rackId = document.getElementById('rack_id').value;
    const addBtn = document.getElementById('addLocation');
    const initialMessage = document.getElementById('initial-message');
    const locationArea = document.getElementById('locationArea');
    const statusSelection = document.getElementById('statusSelection');
    const submitSection = document.getElementById('submitSection');
    const locationCount = document.getElementById('locationCount');
    const locationCountText = document.getElementById('locationCountText');

    // 更新添加按钮状态
    if (zoneId && rackId) {
        addBtn.disabled = false;
        addBtn.classList.remove('btn-secondary');
        addBtn.classList.add('btn-primary');
    } else {
        addBtn.disabled = true;
        addBtn.classList.remove('btn-primary');
        addBtn.classList.add('btn-secondary');
    }

    // 更新位置计数
    const count = locationList.length;
    if (locationCount) {
        locationCount.textContent = `${count} location${count !== 1 ? 's' : ''}`;
    }
    if (locationCountText) {
        locationCountText.textContent = count === 0 ? 'No locations added yet' : `${count} location${count !== 1 ? 's' : ''} added`;
    }

    // 显示/隐藏区域
    if (count > 0) {
        initialMessage.style.display = 'none';
        locationArea.style.display = 'block';
        statusSelection.style.display = 'block';
        submitSection.style.display = 'block';
    } else {
        initialMessage.style.display = 'block';
        locationArea.style.display = 'none';
        statusSelection.style.display = 'none';
        submitSection.style.display = 'none';
    }

    // 更新配置摘要
    updateConfigSummary();
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

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');

    // 如果找不到alertContainer，使用浏览器alert作为备用
    if (!alertContainer) {
        alert(message);
        return;
    }

    // 移除现有的alert
    const existingAlert = alertContainer.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertClass = type === 'success' ? 'alert-success' :
                      type === 'warning' ? 'alert-warning' :
                      type === 'danger' ? 'alert-danger' :
                      type === 'error' ? 'alert-danger' : 'alert-info';
    const iconClass = type === 'success' ? 'bi-check-circle-fill' :
                     type === 'warning' ? 'bi-exclamation-triangle-fill' :
                     type === 'danger' ? 'bi-exclamation-triangle-fill' :
                     type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';

    const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="bi ${iconClass} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    alertContainer.innerHTML = alertHtml;

    // 自动隐藏
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

// 表单提交前验证
document.getElementById('locationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    if (locationList.length === 0) {
        showAlert('Please add at least one location', 'warning');
        return;
    }

    // 获取状态
    const statusRadio = document.querySelector('input[name="location_status"]:checked');
    const status = statusRadio ? statusRadio.value : 'Available';

    // 提交前再次检查重复组合
    const duplicates = [];
    const seen = new Set();

    for (let i = 0; i < locationList.length; i++) {
        const location = locationList[i];
        const combination = `${location.zoneId}-${location.rackId}`;

        if (seen.has(combination)) {
            duplicates.push(`${location.zoneName} - ${location.rackName}`);
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

    // 添加位置数据
    locationList.forEach((location, index) => {
        formData.append(`locations[${index}][zone_id]`, location.zoneId);
        formData.append(`locations[${index}][rack_id]`, location.rackId);
        formData.append(`locations[${index}][location_status]`, status);
    });

    // 提交表单
    fetch(window.createLocationUrl, {
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
                window.location.href = window.locationManagementRoute;
            }, 2000);
        } else {
            showAlert(data.message || 'Failed to create locations', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert(error.message || 'An error occurred while creating locations', 'error');
    });
});

// 排序状态：true = 升序，false = 降序
let isAscending = false; // 默认降序（最新的在上面）

function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortLocations');

    // 更新图标
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortLocationList();
}

function sortLocationList() {
    const locationList = document.getElementById('locationList');
    const items = Array.from(locationList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 获取位置信息并排序
    const locations = items.map(item => ({
        element: item,
        zoneName: item.querySelector('.zone-badge').textContent.trim(),
        rackName: item.querySelector('.rack-badge').textContent.trim()
    }));

    // 按区域和货架名称排序
    locations.sort((a, b) => {
        const aText = a.zoneName + ' - ' + a.rackName;
        const bText = b.zoneName + ' - ' + b.rackName;

        if (isAscending) {
            return aText.localeCompare(bText);
        } else {
            return bText.localeCompare(aText);
        }
    });

    // 重新排列DOM元素
    locations.forEach(({ element }) => {
        locationList.appendChild(element);
    });
}


function addLocationsToForm() {
    const form = document.getElementById('locationForm');

    // 移除现有的隐藏输入
    const existingInputs = form.querySelectorAll('input[name^="locations"]');
    existingInputs.forEach(input => input.remove());

    // 添加新的隐藏输入
    locationList.forEach((location, index) => {
        const status = document.querySelector('input[name="location_status"]:checked').value;

        // 添加区域ID
        const zoneInput = document.createElement('input');
        zoneInput.type = 'hidden';
        zoneInput.name = `locations[${index}][zone_id]`;
        zoneInput.value = location.zoneId;
        form.appendChild(zoneInput);

        // 添加货架ID
        const rackInput = document.createElement('input');
        rackInput.type = 'hidden';
        rackInput.name = `locations[${index}][rack_id]`;
        rackInput.value = location.rackId;
        form.appendChild(rackInput);

        // 添加状态
        const statusInput = document.createElement('input');
        statusInput.type = 'hidden';
        statusInput.name = `locations[${index}][location_status]`;
        statusInput.value = status;
        form.appendChild(statusInput);
    });
}
