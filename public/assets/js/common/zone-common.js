/**
 * Zone Common JavaScript Functions
 * 區域管理通用交互邏輯
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
 * 驗證區域表單
 */
function validateZoneForm() {
    const zoneNameInput = document.getElementById('zone_name');
    const locationInput = document.getElementById('location');

    if (!zoneNameInput || !zoneNameInput.value.trim()) {
        showAlert('Please enter zone name', 'warning');
        if (zoneNameInput) zoneNameInput.focus();
        return false;
    }

    if (!locationInput || !locationInput.value.trim()) {
        showAlert('Please enter zone location', 'warning');
        if (locationInput) locationInput.focus();
        return false;
    }

    return true;
}

/**
 * 驗證區域更新表單（包含重複檢查）
 * @param {Object} formData 表單數據
 * @param {Object} options 選項
 * @returns {Promise<Object>} 驗證結果
 */
async function validateZoneUpdateForm(formData, options = {}) {
    const errors = [];
    const { currentId = null } = options;

    // 基本驗證
    if (!formData.zone_name || formData.zone_name.trim() === '') {
        errors.push('Zone name is required');
    }

    if (!formData.location || formData.location.trim() === '') {
        errors.push('Zone location is required');
    }

    if (!formData.zone_status || formData.zone_status === '') {
        errors.push('Zone status is required');
    }

    // 重複檢查（如果有區域名稱且不是當前記錄）
    if (formData.zone_name && formData.zone_name.trim() !== '' && currentId) {
        try {
            const exists = await checkZoneNameExists(formData.zone_name.trim(), currentId);
            if (exists) {
                errors.push('Zone name already exists');
            }
        } catch (error) {
            console.error('Error checking zone name:', error);
            errors.push('Unable to verify zone name uniqueness');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 檢查區域名稱是否存在（用於更新時的重複檢查）
 * @param {string} zoneName 區域名稱
 * @param {number} currentId 當前記錄ID
 * @returns {Promise<boolean>} 是否存在
 */
async function checkZoneNameExists(zoneName, currentId) {
    try {
        const response = await fetch('/admin/zones/check-name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                zone_name: zoneName,
                current_id: currentId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.exists || false;
    } catch (error) {
        console.error('Error checking zone name:', error);
        return false; // 發生錯誤時不阻止提交，讓服務器端處理
    }
}

/**
 * 處理區域請求
 */
function handleZoneRequest(url, method, data, onSuccess, onError) {
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
 * 創建區域
 */
function createZone(zoneData, onSuccess, onError) {
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加區域數據
    if (zoneData.zones && Array.isArray(zoneData.zones)) {
        zoneData.zones.forEach((zone, index) => {
            formData.append(`zones[${index}][zoneName]`, zone.zoneName);
            formData.append(`zones[${index}][location]`, zone.location);
            formData.append(`zones[${index}][zoneStatus]`, zone.zoneStatus);
            if (zone.zoneImageFile) {
                formData.append(`images[${index}]`, zone.zoneImageFile);
            }
        });
    } else {
        formData.append('zone_name', zoneData.zoneName);
        formData.append('location', zoneData.location);
        formData.append('zone_status', zoneData.zoneStatus);
        if (zoneData.zoneImageFile) {
            formData.append('zone_image', zoneData.zoneImageFile);
        }
    }

    handleZoneRequest(
        window.createZoneUrl,
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 更新區域
 */
function updateZone(zoneId, formData, onSuccess, onError) {
    formData.append('_method', 'PUT');

    handleZoneRequest(
        window.updateZoneUrl.replace(':id', zoneId),
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 刪除區域
 */
function deleteZone(zoneId, onSuccess, onError) {
    handleZoneRequest(
        window.deleteZoneUrl.replace(':id', zoneId),
        'DELETE',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置區域為可用
 */
function setZoneAvailable(zoneId, onSuccess, onError) {
    handleZoneRequest(
        window.availableZoneUrl.replace(':id', zoneId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置區域為不可用
 */
function setZoneUnavailable(zoneId, onSuccess, onError) {
    handleZoneRequest(
        window.unavailableZoneUrl.replace(':id', zoneId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 獲取區域狀態類別
 */
function getZoneStatusClass(status) {
    return status === 'Available' ? 'available' : 'unavailable';
}

/**
 * 檢查區域名稱是否已存在
 */
function isZoneExists(zoneName, zoneList) {
    return zoneList.some(item => item.zoneName.toLowerCase() === zoneName.toLowerCase());
}

/**
 * 高亮顯示列表中已存在的區域名稱
 */
function highlightExistingZone(zoneName) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.item-value-text').textContent.trim();
        if (value.toLowerCase() === zoneName.toLowerCase()) {
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
function updateConfigSummary(zoneList) {
    // 更新區域範圍顯示
    updateZoneRangeDisplay(zoneList);

    // 顯示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (configSummary) {
        configSummary.style.display = 'block';
    }
}

/**
 * 更新區域名稱顯示
 */
function updateZoneNameDisplay(zoneList) {
    const zoneNameSpan = document.getElementById('zoneName');
    if (zoneNameSpan) {
        if (zoneList.length > 0) {
            zoneNameSpan.textContent = `- ${zoneList.length} zones`;
        } else {
            zoneNameSpan.textContent = '';
        }
    }
}

/**
 * 更新區域範圍顯示
 */
function updateZoneRangeDisplay(zoneList) {
    const zoneNames = zoneList.map(item => item.zoneName);
    const selectedZoneSpan = document.getElementById('selectedZone');

    if (selectedZoneSpan) {
        if (zoneNames.length === 0) {
            selectedZoneSpan.textContent = 'None';
        } else if (zoneNames.length === 1) {
            selectedZoneSpan.textContent = zoneNames[0];
        } else {
            const sortedNames = zoneNames.sort();
            const minZone = sortedNames[0];
            const maxZone = sortedNames[sortedNames.length - 1];
            selectedZoneSpan.textContent = `${minZone} - ${maxZone}`;
        }
    }
}

/**
 * 更新區域值計數
 */
function updateZoneValuesCount(zoneList) {
    const count = zoneList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('zoneValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} zones`;
    }

    // 更新左側計數文本
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

/**
 * 更新UI（通用）
 */
function updateUI(zoneList = []) {
    updateZoneValuesCount(zoneList);
    updateZoneRangeDisplay(zoneList);
    updateZoneNameDisplay(zoneList);
    updateConfigSummary(zoneList);
}

/**
 * 顯示區域值區域
 */
function showZoneValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 隱藏輸入提示
    const zoneInputPrompt = document.getElementById('zoneInputPrompt');
    if (zoneInputPrompt) {
        zoneInputPrompt.style.display = 'none';
    }

    // 顯示區域值區域
    const zoneValuesArea = document.getElementById('zoneValuesArea');
    if (zoneValuesArea) {
        zoneValuesArea.style.display = 'block';
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
    // 隱藏區域值區域
    const zoneValuesArea = document.getElementById('zoneValuesArea');
    if (zoneValuesArea) {
        zoneValuesArea.style.display = 'none';
    }

    // 隱藏輸入提示
    const zoneInputPrompt = document.getElementById('zoneInputPrompt');
    if (zoneInputPrompt) {
        zoneInputPrompt.style.display = 'none';
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

// 圖片預覽處理函數已移至 image-handler.js

// 圖片預覽處理函數已移至 image-handler.js

// 圖片預覽處理函數已移至 image-handler.js

// 圖片管理函數已移至 image-handler.js

/**
 * 綁定區域事件
 */
function bindZoneEvents() {
    // 狀態卡片選擇
    setupStatusCardSelection();

    // Create 頁面事件綁定
    bindZoneCreateEvents();

    // 使用統一的圖片處理模組
    if (typeof window.ImageHandler !== 'undefined') {
        window.ImageHandler.bindImageUploadEvents({
            createImageInputId: 'zone_image',
            createImageUploadAreaId: 'imageUploadArea',
            updateImageInputId: 'input_image',
            updatePreviewContainerId: 'image-preview'
        });
    } else {
        // 備用實現（如果 image-handler.js 未加載）
        bindLegacyImageEvents();
    }
}

/**
 * 備用圖片事件綁定（向後兼容）
 */
function bindLegacyImageEvents() {
    // 直接使用統一的圖片處理模組
    if (typeof window.ImageHandler !== 'undefined') {
        window.ImageHandler.bindImageUploadEvents({
            createImageInputId: 'zone_image',
            createImageUploadAreaId: 'imageUploadArea',
            updateImageInputId: 'input_image',
            updatePreviewContainerId: 'image-preview'
        });
    } else {
        console.warn('ImageHandler not available, image functionality may not work properly');
    }
}

/**
 * 綁定區域創建頁面事件
 */
function bindZoneCreateEvents() {
    // 区域名称输入框回车事件
    const zoneNameInput = document.getElementById('zone_name');
    if (zoneNameInput) {
        zoneNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (window.addZone && typeof window.addZone === 'function') {
                    window.addZone();
                }
            }
        });
    }

    // 添加区域按钮
    const addZoneBtn = document.getElementById('addZone');
    if (addZoneBtn) {
        addZoneBtn.addEventListener('click', function() {
            if (window.addZone && typeof window.addZone === 'function') {
                window.addZone();
            }
        });
    }

    // 清除表单按钮
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', function() {
            if (window.clearForm && typeof window.clearForm === 'function') {
                window.clearForm();
            }
        });
    }

    // 事件委托：删除区域按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            if (window.removeZone && typeof window.removeZone === 'function') {
                window.removeZone(index);
            }
        }
    });

    // 排序按钮
    const sortBtn = document.getElementById('sortZones');
    if (sortBtn) {
        sortBtn.addEventListener('click', function() {
            if (window.toggleSortOrder && typeof window.toggleSortOrder === 'function') {
                window.toggleSortOrder();
            }
        });
    }

    // 快速添加按钮
    const addCommonZonesBtn = document.getElementById('addCommonZones');
    if (addCommonZonesBtn) {
        addCommonZonesBtn.addEventListener('click', function() {
            if (window.addCommonZones && typeof window.addCommonZones === 'function') {
                window.addCommonZones();
            }
        });
    }

    const addAdminZonesBtn = document.getElementById('addAdminZones');
    if (addAdminZonesBtn) {
        addAdminZonesBtn.addEventListener('click', function() {
            if (window.addAdminZones && typeof window.addAdminZones === 'function') {
                window.addAdminZones();
            }
        });
    }
}

/**
 * 初始化區域頁面
 */
function initializeZonePage(config) {
    // 綁定事件監聽器
    bindZoneEvents();

    // 初始化狀態
    if (config.zoneList) {
        updateUI(config.zoneList);
    }

    // 執行初始化回調函數（如果有）
    if (config && config.initializationCallback && typeof config.initializationCallback === 'function') {
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
