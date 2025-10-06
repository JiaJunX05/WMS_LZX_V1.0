/**
 * Location Common JavaScript Functions
 * 位置管理通用交互邏輯
 */

/**
 * 狀態卡片選擇函數
 */
function selectStatusCard(card) {
    // 移除所有卡片的選中狀態
    document.querySelectorAll('.status-card').forEach(c => {
        c.classList.remove('selected');
    });

    // 添加選中狀態到當前卡片
    card.classList.add('selected');

    // 更新對應的radio按鈕
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
    }
}

/**
 * 設置狀態卡片選擇事件
 */
function setupStatusCardSelection() {
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            selectStatusCard(this);
        });
    });
}

/**
 * 驗證位置表單
 */
function validateLocationForm() {
    const zoneSelect = document.getElementById('zone_id');
    const rackSelect = document.getElementById('rack_id');

    if (!zoneSelect || !zoneSelect.value) {
        showAlert('Please select a zone first', 'warning');
        if (zoneSelect) zoneSelect.focus();
        return false;
    }

    if (!rackSelect || !rackSelect.value) {
        showAlert('Please select a rack first', 'warning');
        if (rackSelect) rackSelect.focus();
        return false;
    }

    return true;
}

/**
 * 驗證位置更新表單（包含重複檢查）
 * @param {Object} formData 表單數據
 * @param {Object} options 選項
 * @returns {Promise<Object>} 驗證結果
 */
async function validateLocationUpdateForm(formData, options = {}) {
    const errors = [];
    const { currentId = null } = options;

    // 基本驗證
    if (!formData.zone_id || formData.zone_id === '') {
        errors.push('Zone selection is required');
    }

    if (!formData.rack_id || formData.rack_id === '') {
        errors.push('Rack selection is required');
    }

    if (!formData.location_status || formData.location_status === '') {
        errors.push('Location status is required');
    }

    // 重複檢查（如果有區域和貨架組合且不是當前記錄）
    if (formData.zone_id && formData.rack_id && currentId) {
        try {
            const exists = await checkLocationCombinationExists(formData.zone_id, formData.rack_id, currentId);
            if (exists) {
                errors.push('This location combination already exists');
            }
        } catch (error) {
            console.error('Error checking location combination:', error);
            errors.push('Unable to verify location combination uniqueness');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 檢查位置組合是否存在（用於更新時的重複檢查）
 * @param {string} zoneId 區域ID
 * @param {string} rackId 貨架ID
 * @param {number} currentId 當前記錄ID
 * @returns {Promise<boolean>} 是否存在
 */
async function checkLocationCombinationExists(zoneId, rackId, currentId) {
    try {
        const response = await fetch('/admin/locations/check-combination', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                zone_id: zoneId,
                rack_id: rackId,
                current_id: currentId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.exists || false;
    } catch (error) {
        console.error('Error checking location combination:', error);
        return false; // 發生錯誤時不阻止提交，讓服務器端處理
    }
}

/**
 * 處理位置請求
 */
function handleLocationRequest(url, method, data, onSuccess, onError) {
    fetch(url, {
        method: method,
        body: data,
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 422) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Validation failed');
                });
            }
            throw new Error(`Network response was not ok (${response.status})`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            if (onSuccess) onSuccess(data);
        } else {
            if (onError) onError(data.message || 'Operation failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (onError) onError(error.message);
    });
}

/**
 * 創建位置
 */
function createLocation(locationData, onSuccess, onError) {
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加位置數據
    if (locationData.locations && Array.isArray(locationData.locations)) {
        locationData.locations.forEach((location, index) => {
            formData.append(`locations[${index}][zone_id]`, location.zoneId);
            formData.append(`locations[${index}][rack_id]`, location.rackId);
            formData.append(`locations[${index}][location_status]`, location.locationStatus);
        });
    } else {
        formData.append('zone_id', locationData.zoneId);
        formData.append('rack_id', locationData.rackId);
        formData.append('location_status', locationData.locationStatus);
    }

    handleLocationRequest(
        window.createLocationUrl,
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 更新位置
 */
function updateLocation(locationId, formData, onSuccess, onError) {
    formData.append('_method', 'PUT');

    handleLocationRequest(
        window.updateLocationUrl.replace(':id', locationId),
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 刪除位置
 */
function deleteLocation(locationId, onSuccess, onError) {
    handleLocationRequest(
        window.deleteLocationUrl.replace(':id', locationId),
        'DELETE',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置位置為可用
 */
function setLocationAvailable(locationId, onSuccess, onError) {
    handleLocationRequest(
        window.availableLocationUrl.replace(':id', locationId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置位置為不可用
 */
function setLocationUnavailable(locationId, onSuccess, onError) {
    handleLocationRequest(
        window.unavailableLocationUrl.replace(':id', locationId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 獲取位置狀態類別
 */
function getLocationStatusClass(status) {
    return status === 'Available' ? 'available' : 'unavailable';
}

/**
 * 檢查位置組合是否已存在
 */
function isLocationExists(zoneId, rackId, locationList) {
    return locationList.some(location =>
        location.zoneId === zoneId && location.rackId === rackId
    );
}

/**
 * 高亮顯示列表中已存在的位置組合
 */
function highlightExistingLocation(zoneId, rackId) {
    const existingLocations = document.querySelectorAll('.value-item');
    for (let item of existingLocations) {
        const itemZoneId = item.dataset.zoneId;
        const itemRackId = item.dataset.rackId;
        if (itemZoneId === zoneId && itemRackId === rackId) {
            item.classList.add('duplicate-highlight');
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                item.classList.remove('duplicate-highlight');
            }, 3000);
            break;
        }
    }
}

/**
 * 更新配置摘要
 */
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

        // 顯示配置摘要
        const configSummary = document.getElementById('configSummary');
        if (configSummary) {
            configSummary.style.display = 'block';
        }
    }
}

/**
 * 更新位置計數
 */
function updateLocationCount(locationList) {
    const count = locationList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('locationCount');
    if (countBadge) {
        countBadge.textContent = `${count} location${count !== 1 ? 's' : ''}`;
    }

    // 更新左側計數文本
    const countText = document.getElementById('locationCountText');
    if (countText) {
        countText.textContent = count === 0 ? 'No locations added yet' : `${count} location${count !== 1 ? 's' : ''} added`;
    }
}

/**
 * 更新UI（通用）
 */
function updateUI(locationList = []) {
    updateLocationCount(locationList);
    updateConfigSummary();
}

/**
 * 顯示位置區域
 */
function showLocationArea() {
    // 顯示位置區域
    const locationArea = document.getElementById('locationArea');
    if (locationArea) {
        locationArea.style.display = 'block';
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

/**
 * 隱藏所有區域
 */
function hideAllAreas() {
    // 隱藏位置區域
    const locationArea = document.getElementById('locationArea');
    if (locationArea) {
        locationArea.style.display = 'none';
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

/**
 * 綁定位置事件
 */
function bindLocationEvents() {
    // 狀態卡片選擇
    setupStatusCardSelection();

    // 區域選擇變化
    const zoneSelect = document.getElementById('zone_id');
    if (zoneSelect) {
        zoneSelect.addEventListener('change', handleZoneChange);
    }

    // 貨架選擇變化
    const rackSelect = document.getElementById('rack_id');
    if (rackSelect) {
        rackSelect.addEventListener('change', handleRackChange);
    }
}

/**
 * 處理區域變化
 */
function handleZoneChange() {
    const zoneSelect = document.getElementById('zone_id');
    const selectedZone = zoneSelect.value;

    if (selectedZone) {
        // 顯示位置輸入提示
        showLocationInputPrompt();
        // 更新配置摘要
        updateConfigSummary();
    } else {
        // 隱藏所有相關區域
        hideAllAreas();
    }

    updateUI();
}

/**
 * 處理貨架變化
 */
function handleRackChange() {
    const rackSelect = document.getElementById('rack_id');
    const selectedRack = rackSelect.value;

    if (selectedRack) {
        // 顯示位置輸入提示
        showLocationInputPrompt();
        // 更新配置摘要
        updateConfigSummary();
    } else {
        // 隱藏所有相關區域
        hideAllAreas();
    }

    updateUI();
}

/**
 * 顯示位置輸入提示
 */
function showLocationInputPrompt() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }
}

/**
 * 初始化位置頁面
 */
function initializeLocationPage(config) {
    // 綁定事件監聽器
    bindLocationEvents();

    // 初始化狀態
    if (config.locationList) {
        updateUI(config.locationList);
    }

    // 執行初始化回調函數（如果有）
    if (config && config.initializationCallback && typeof config.initializationCallback === 'function') {
        config.initializationCallback();
    }
}

/**
 * 通用表單提交處理函數
 */
function handleUpdateFormSubmit(e, updateUrl, redirectRoute, successMessage, errorMessage, warningMessage) {
    e.preventDefault();

    const formData = new FormData(e.target);
    formData.append('_method', 'PUT');

    fetch(updateUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 422) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Validation failed');
                });
            }
            throw new Error(`Network response was not ok (${response.status})`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showAlert(data.message || successMessage, 'success');
            setTimeout(() => {
                window.location.href = redirectRoute;
            }, 1500);
        } else {
            showAlert(data.message || errorMessage, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (error.message.includes('already exists') || error.message.includes('combination')) {
            showAlert(warningMessage, 'warning');
        } else {
            showAlert(errorMessage + ': ' + error.message, 'error');
        }
    });
}

/**
 * 通用事件綁定函數
 */
function bindUpdateEvents(formId, updateUrl, redirectRoute, successMessage, errorMessage, warningMessage, additionalSelectors = []) {
    // 狀態卡片選擇
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
            radio.addEventListener('change', function() {
                selectStatusCard(card);
            });
        }
    });

    // 表單提交
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', function(e) {
            handleUpdateFormSubmit(e, updateUrl, redirectRoute, successMessage, errorMessage, warningMessage);
        });
    }

    // 綁定額外的選擇器事件
    additionalSelectors.forEach(selector => {
        const element = document.getElementById(selector.id);
        if (element && selector.event && selector.handler) {
            element.addEventListener(selector.event, selector.handler);
        }
    });
}

/**
 * 通用初始化函數
 */
function initializeUpdatePage(config) {
    // 綁定事件監聽器
    bindUpdateEvents(
        config.formId,
        config.updateUrl,
        config.redirectRoute,
        config.successMessage,
        config.errorMessage,
        config.warningMessage,
        config.additionalSelectors || []
    );

    // 初始化狀態
    updateUI();

    // 執行初始化回調函數（如果有）
    if (config.initializationCallback && typeof config.initializationCallback === 'function') {
        config.initializationCallback();
    }
}

/**
 * 工具函數：防抖
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * 工具函數：節流
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 工具函數：轉義HTML
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (s) => map[s]);
}

/**
 * 工具函數：格式化日期
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'N/A';
    }
}

/**
 * 工具函數：格式化狀態
 */
function formatStatus(status) {
    const statusMap = {
        'Available': { class: 'bg-success', icon: 'bi-check-circle' },
        'Unavailable': { class: 'bg-danger', icon: 'bi-x-circle' }
    };

    const statusInfo = statusMap[status] || { class: 'bg-secondary', icon: 'bi-question-circle' };

    return `<span class="badge ${statusInfo.class} px-3 py-2">
        <i class="bi ${statusInfo.icon} me-1"></i>${status}
    </span>`;
}
