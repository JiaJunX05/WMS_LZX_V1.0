/**
 * Rack Common JavaScript Functions
 * 貨架管理通用交互邏輯
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
 * 驗證貨架表單
 */
function validateRackForm() {
    const rackNumberInput = document.getElementById('rack_number');
    const capacityInput = document.getElementById('capacity');

    if (!rackNumberInput || !rackNumberInput.value.trim()) {
        showAlert('Please enter rack number', 'warning');
        if (rackNumberInput) rackNumberInput.focus();
        return false;
    }

    if (capacityInput) {
        const capacity = capacityInput.value.trim();
        if (capacity && (isNaN(capacity) || parseInt(capacity) <= 0)) {
            showAlert('Please enter a valid capacity (positive number)', 'warning');
            capacityInput.focus();
            return false;
        }
    }

    return true;
}

/**
 * 驗證貨架更新表單（包含重複檢查）
 * @param {Object} formData 表單數據
 * @param {Object} options 選項
 * @returns {Promise<Object>} 驗證結果
 */
async function validateRackUpdateForm(formData, options = {}) {
    const errors = [];
    const { currentId = null } = options;

    // 基本驗證
    if (!formData.rack_number || formData.rack_number.trim() === '') {
        errors.push('Rack number is required');
    }

    if (formData.capacity && formData.capacity.trim() !== '') {
        const capacity = parseInt(formData.capacity);
        if (isNaN(capacity) || capacity <= 0) {
            errors.push('Please enter a valid capacity (positive number)');
        }
    }

    if (!formData.rack_status || formData.rack_status === '') {
        errors.push('Rack status is required');
    }

    // 重複檢查（如果有貨架編號且不是當前記錄）
    if (formData.rack_number && formData.rack_number.trim() !== '' && currentId) {
        try {
            const exists = await checkRackNumberExists(formData.rack_number.trim(), currentId);
            if (exists) {
                errors.push('Rack number already exists');
            }
        } catch (error) {
            console.error('Error checking rack number:', error);
            errors.push('Unable to verify rack number uniqueness');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 檢查貨架編號是否存在（用於更新時的重複檢查）
 * @param {string} rackNumber 貨架編號
 * @param {number} currentId 當前記錄ID
 * @returns {Promise<boolean>} 是否存在
 */
async function checkRackNumberExists(rackNumber, currentId) {
    try {
        const response = await fetch('/admin/racks/check-number', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                rack_number: rackNumber,
                current_id: currentId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.exists || false;
    } catch (error) {
        console.error('Error checking rack number:', error);
        return false; // 發生錯誤時不阻止提交，讓服務器端處理
    }
}

/**
 * 處理貨架請求
 */
function handleRackRequest(url, method, data, onSuccess, onError) {
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
 * 創建貨架
 */
function createRack(rackData, onSuccess, onError) {
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加貨架數據
    if (rackData.racks && Array.isArray(rackData.racks)) {
        rackData.racks.forEach((rack, index) => {
            formData.append(`racks[${index}][rackNumber]`, rack.rackNumber);
            formData.append(`racks[${index}][capacity]`, rack.capacity);
            formData.append(`racks[${index}][rackStatus]`, rack.rackStatus);
            if (rack.rackImageFile) {
                formData.append(`images[${index}]`, rack.rackImageFile);
            }
        });
    } else {
        formData.append('rack_number', rackData.rackNumber);
        formData.append('capacity', rackData.capacity);
        formData.append('rack_status', rackData.rackStatus);
        if (rackData.rackImageFile) {
            formData.append('rack_image', rackData.rackImageFile);
        }
    }

    handleRackRequest(
        window.createRackUrl,
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 更新貨架
 */
function updateRack(rackId, formData, onSuccess, onError) {
    formData.append('_method', 'PUT');

    handleRackRequest(
        window.updateRackUrl.replace(':id', rackId),
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 刪除貨架
 */
function deleteRack(rackId, onSuccess, onError) {
    handleRackRequest(
        window.deleteRackUrl.replace(':id', rackId),
        'DELETE',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置貨架為可用
 */
function setRackAvailable(rackId, onSuccess, onError) {
    handleRackRequest(
        window.availableRackUrl.replace(':id', rackId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置貨架為不可用
 */
function setRackUnavailable(rackId, onSuccess, onError) {
    handleRackRequest(
        window.unavailableRackUrl.replace(':id', rackId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 獲取貨架狀態類別
 */
function getRackStatusClass(status) {
    return status === 'Available' ? 'available' : 'unavailable';
}

/**
 * 檢查貨架編號是否已存在
 */
function isRackExists(rackNumber, rackList) {
    return rackList.some(item => item.rackNumber.toLowerCase() === rackNumber.toLowerCase());
}

/**
 * 高亮顯示列表中已存在的貨架編號
 */
function highlightExistingRack(rackNumber) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.item-value-text').textContent.trim();
        if (value.toLowerCase() === rackNumber.toLowerCase()) {
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
function updateConfigSummary(rackList) {
    // 更新貨架範圍顯示
    updateRackRangeDisplay(rackList);

    // 顯示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (configSummary) {
        configSummary.style.display = 'block';
    }
}

/**
 * 更新貨架名稱顯示
 */
function updateRackNameDisplay(rackList) {
    const rackNameSpan = document.getElementById('rackName');
    if (rackNameSpan) {
        if (rackList.length > 0) {
            rackNameSpan.textContent = `- ${rackList.length} racks`;
        } else {
            rackNameSpan.textContent = '';
        }
    }
}

/**
 * 更新貨架範圍顯示
 */
function updateRackRangeDisplay(rackList) {
    const rackNumbers = rackList.map(item => item.rackNumber);
    const selectedRackSpan = document.getElementById('selectedRack');

    if (selectedRackSpan) {
        if (rackNumbers.length === 0) {
            selectedRackSpan.textContent = 'None';
        } else if (rackNumbers.length === 1) {
            selectedRackSpan.textContent = rackNumbers[0];
        } else {
            const sortedNumbers = rackNumbers.sort();
            const minRack = sortedNumbers[0];
            const maxRack = sortedNumbers[sortedNumbers.length - 1];
            selectedRackSpan.textContent = `${minRack} - ${maxRack}`;
        }
    }
}

/**
 * 更新貨架值計數
 */
function updateRackValuesCount(rackList) {
    const count = rackList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('rackValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} racks`;
    }

    // 更新左側計數文本
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

/**
 * 更新UI（通用）
 */
function updateUI(rackList = []) {
    updateRackValuesCount(rackList);
    updateRackRangeDisplay(rackList);
    updateRackNameDisplay(rackList);
    updateConfigSummary(rackList);
}

/**
 * 顯示貨架值區域
 */
function showRackValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 隱藏輸入提示
    const rackInputPrompt = document.getElementById('rackInputPrompt');
    if (rackInputPrompt) {
        rackInputPrompt.style.display = 'none';
    }

    // 顯示貨架值區域
    const rackValuesArea = document.getElementById('rackValuesArea');
    if (rackValuesArea) {
        rackValuesArea.style.display = 'block';
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
    // 隱藏貨架值區域
    const rackValuesArea = document.getElementById('rackValuesArea');
    if (rackValuesArea) {
        rackValuesArea.style.display = 'none';
    }

    // 隱藏輸入提示
    const rackInputPrompt = document.getElementById('rackInputPrompt');
    if (rackInputPrompt) {
        rackInputPrompt.style.display = 'none';
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

// 圖片管理函數已移至 image-handler.js

/**
 * 綁定貨架事件
 */
function bindRackEvents() {
    // 狀態卡片選擇
    setupStatusCardSelection();

    // Create 頁面事件綁定
    bindRackCreateEvents();

    // 使用統一的圖片處理模組
    if (typeof window.ImageHandler !== 'undefined') {
        window.ImageHandler.bindImageUploadEvents({
            createImageInputId: 'rack_image',
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
            createImageInputId: 'rack_image',
            createImageUploadAreaId: 'imageUploadArea',
            updateImageInputId: 'input_image',
            updatePreviewContainerId: 'image-preview'
        });
    } else {
        console.warn('ImageHandler not available, image functionality may not work properly');
    }
}

/**
 * 綁定貨架創建頁面事件
 */
function bindRackCreateEvents() {
    // 货架编号输入框回车事件
    const rackNumberInput = document.getElementById('rack_number');
    if (rackNumberInput) {
        rackNumberInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (window.addRack && typeof window.addRack === 'function') {
                    window.addRack();
                }
            }
        });
    }

    // 添加货架按钮
    const addRackBtn = document.getElementById('addRack');
    if (addRackBtn) {
        addRackBtn.addEventListener('click', function() {
            if (window.addRack && typeof window.addRack === 'function') {
                window.addRack();
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

    // 事件委托：删除货架按钮
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));
            if (window.removeRack && typeof window.removeRack === 'function') {
                window.removeRack(index);
            }
        }
    });

    // 排序按钮
    const sortBtn = document.getElementById('sortRacks');
    if (sortBtn) {
        sortBtn.addEventListener('click', function() {
            if (window.toggleSortOrder && typeof window.toggleSortOrder === 'function') {
                window.toggleSortOrder();
            }
        });
    }

    // 快速添加按钮
    const addCommonRacksBtn = document.getElementById('addCommonRacks');
    if (addCommonRacksBtn) {
        addCommonRacksBtn.addEventListener('click', function() {
            if (window.addCommonRacks && typeof window.addCommonRacks === 'function') {
                window.addCommonRacks();
            }
        });
    }

    const addAdminRacksBtn = document.getElementById('addAdminRacks');
    if (addAdminRacksBtn) {
        addAdminRacksBtn.addEventListener('click', function() {
            if (window.addAdminRacks && typeof window.addAdminRacks === 'function') {
                window.addAdminRacks();
            }
        });
    }
}

/**
 * 初始化貨架頁面
 */
function initializeRackPage(config) {
    // 綁定事件監聽器
    bindRackEvents();

    // 初始化狀態
    if (config.rackList) {
        updateUI(config.rackList);
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
