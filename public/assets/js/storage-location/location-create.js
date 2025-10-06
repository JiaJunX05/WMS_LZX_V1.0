/**
 * Location Create Page JavaScript
 * 位置創建頁面交互邏輯
 */

// 位置列表數組
let locationList = [];

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁面
    initializeLocationCreate();
});

function initializeLocationCreate() {
    // 使用通用初始化函數
    initializeLocationPage({
        locationList: locationList,
        initializationCallback: function() {
            bindCreateEvents();
            updateUI(locationList);
        }
    });
}

function bindCreateEvents() {
    // 添加位置按鈕
    const addLocationBtn = document.getElementById('addLocation');
    if (addLocationBtn) {
        addLocationBtn.addEventListener('click', addLocation);
    }

    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 排序按鈕
    const sortBtn = document.getElementById('sortLocations');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 事件委托：刪除位置按鈕
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            if (!isNaN(index)) {
                removeLocation(index);
            }
        }
    });

    // 表單提交處理
    const form = document.getElementById('locationForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function addLocation() {
    const zoneSelect = document.getElementById('zone_id');
    const rackSelect = document.getElementById('rack_id');

    const zoneId = zoneSelect.value;
    const rackId = rackSelect.value;

    // 驗證輸入
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

    // 檢查是否已存在
    if (isLocationExists(zoneId, rackId, locationList)) {
        showAlert('This location combination already exists in the list', 'error');
        highlightExistingLocation(zoneId, rackId);
        return;
    }

    // 添加位置到列表
    addLocationToList(zoneId, rackId);

    // 清空選擇
    zoneSelect.value = '';
    rackSelect.value = '';
    document.getElementById('selectedZone').textContent = 'None';
    document.getElementById('selectedRack').textContent = 'None';
    updateConfigSummary();
    zoneSelect.focus();

    // 更新UI
    updateUI(locationList);

    // 顯示成功添加的alert
    showAlert('Location added successfully', 'success');
}

function addLocationToList(zoneId, rackId) {
    // 獲取區域和貨架信息
    const zoneSelect = document.getElementById('zone_id');
    const rackSelect = document.getElementById('rack_id');
    const zoneName = zoneSelect.options[zoneSelect.selectedIndex].text;
    const rackName = rackSelect.options[rackSelect.selectedIndex].text;

    // 添加到數組
    const location = {
        zoneId: zoneId,
        rackId: rackId,
        zoneName: zoneName,
        rackName: rackName
    };

    locationList.push(location);

    // 更新列表顯示
    updateLocationList();
    updateUI(locationList);
}

function removeLocation(index) {
    if (index >= 0 && index < locationList.length) {
        locationList.splice(index, 1);
        updateLocationList();
        updateUI(locationList);
        showAlert('Location removed', 'info');
    } else {
        showAlert('Error: Invalid location index', 'error');
    }
}

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

function clearForm() {
    if (locationList.length === 0) {
        showAlert('No locations to clear', 'info');
        return;
    }

    if (confirm('Are you sure you want to clear all locations?')) {
        // 清空選擇
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

        // 隱藏所有區域
        hideAllAreas();

        // 更新UI
        updateUI(locationList);
        showAlert('All locations cleared', 'info');
    }
}

// 排序狀態：true = 升序，false = 降序
let isAscending = false; // 默認降序（最新的在上面）

function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortLocations');

    // 更新圖標
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

    // 獲取位置信息並排序
    const locations = items.map(item => ({
        element: item,
        zoneName: item.querySelector('.zone-badge').textContent.trim(),
        rackName: item.querySelector('.rack-badge').textContent.trim()
    }));

    // 按區域和貨架名稱排序
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

// 表單提交處理
function handleFormSubmit(e) {
    e.preventDefault();

    if (locationList.length === 0) {
        showAlert('Please add at least one location', 'warning');
        return;
    }

    // 獲取狀態
    const statusRadio = document.querySelector('input[name="location_status"]:checked');
    const status = statusRadio ? statusRadio.value : 'Available';

    // 提交前再次檢查重複組合
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

    // 準備提交數據
    const locations = locationList.map(item => ({
        zoneId: item.zoneId,
        rackId: item.rackId,
        locationStatus: status
    }));

    // 使用通用創建函數
    createLocation({ locations },
        function(data) {
            showAlert(data.message || 'Locations created successfully', 'success');
            setTimeout(() => {
                window.location.href = window.locationManagementRoute || '/admin/storage-locations/location';
            }, 2000);
        },
        function(error) {
            showAlert(error || 'Error creating locations', 'error');
        }
    );
}
