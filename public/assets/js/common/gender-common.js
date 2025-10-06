/**
 * Gender Common JavaScript Functions
 * 性別管理通用函數庫
 *
 * 功能模塊：
 * - 性別CRUD操作
 * - 狀態管理
 * - 表單驗證和提交
 * - UI交互
 *
 * @author WMS Team
 * @version 1.0.0
 */

// =============================================================================
// 狀態卡片選擇功能 (Status Card Selection)
// =============================================================================

/**
 * 選擇狀態卡片
 * @param {HTMLElement} card 被點擊的狀態卡片
 */
function selectStatusCard(card) {
    // 移除所有卡片的選中狀態
    const allCards = document.querySelectorAll('.status-card');
    allCards.forEach(c => c.classList.remove('selected'));

    // 添加選中狀態到當前卡片
    card.classList.add('selected');

    // 更新對應的單選按鈕
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
    }
}

/**
 * 初始化狀態卡片選擇
 */
function initializeStatusCardSelection() {
    const statusCards = document.querySelectorAll('.status-card');
    const statusRadioInputs = document.querySelectorAll('input[name="gender_status"]');

    // 為每個狀態卡片添加點擊事件
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            selectStatusCard(this);
        });
    });

    // 為單選按鈕添加變化事件
    statusRadioInputs.forEach(radio => {
        radio.addEventListener('change', function() {
            const card = this.closest('.status-card');
            if (card) {
                selectStatusCard(card);
            }
        });
    });

    // 初始化選中狀態
    const checkedRadio = document.querySelector('input[name="gender_status"]:checked');
    if (checkedRadio) {
        const card = checkedRadio.closest('.status-card');
        if (card) {
            card.classList.add('selected');
        }
    }
}

// =============================================================================
// 表單驗證功能 (Form Validation)
// =============================================================================

/**
 * 驗證性別表單
 * @param {Object} formData 表單數據
 * @param {Object} options 驗證選項
 * @returns {Object} 驗證結果
 */
function validateGenderForm(formData, options = {}) {
    const errors = [];
    const { requireStatus = true } = options;

    // 驗證性別名稱
    if (!formData.gender_name || formData.gender_name.trim() === '') {
        errors.push('Gender name is required');
    }

    // 驗證狀態
    if (requireStatus && (!formData.gender_status || formData.gender_status === '')) {
        errors.push('Gender status is required');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 驗證性別更新表單（包含重複檢查）
 * @param {Object} formData 表單數據
 * @param {Object} options 選項
 * @returns {Promise<Object>} 驗證結果
 */
async function validateGenderUpdateForm(formData, options = {}) {
    const errors = [];
    const { requireStatus = true, currentId = null } = options;

    // 基本驗證
    if (!formData.gender_name || formData.gender_name.trim() === '') {
        errors.push('Gender name is required');
    }

    if (requireStatus && (!formData.gender_status || formData.gender_status === '')) {
        errors.push('Gender status is required');
    }

    // 重複檢查（如果有性別名稱且不是當前記錄）
    if (formData.gender_name && formData.gender_name.trim() !== '' && currentId) {
        try {
            const exists = await checkGenderNameExists(formData.gender_name.trim(), currentId);
            if (exists) {
                errors.push('Gender name already exists');
            }
        } catch (error) {
            console.error('Error checking gender name:', error);
            errors.push('Unable to verify gender name uniqueness');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 檢查性別名稱是否存在（用於更新時的重複檢查）
 * @param {string} genderName 性別名稱
 * @param {number} currentId 當前記錄ID
 * @returns {Promise<boolean>} 是否存在
 */
async function checkGenderNameExists(genderName, currentId) {
    try {
        const response = await fetch('/admin/genders/check-name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                gender_name: genderName,
                current_id: currentId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.exists || false;
    } catch (error) {
        console.error('Error checking gender name:', error);
        return false; // 發生錯誤時不阻止提交，讓服務器端處理
    }
}

// =============================================================================
// 性別操作功能 (Gender Operations)
// =============================================================================

/**
 * 處理性別請求
 * @param {string} url 請求URL
 * @param {string} method HTTP方法
 * @param {Object} data 請求數據
 * @param {Object} options 選項
 */
function handleGenderRequest(url, method, data, options = {}) {
    const {
        successMessage = 'Operation completed successfully',
        errorMessage = 'Operation failed',
        redirect = null,
        onSuccess = null,
        onError = null
    } = options;

    const requestOptions = {
        method: method,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
    };

    // 添加數據到請求
    if (data) {
        if (data instanceof FormData) {
            requestOptions.body = data;
        } else {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(data);
        }
    }

    fetch(url, requestOptions)
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
                showAlert(data.message || successMessage, 'success');

                if (onSuccess) {
                    onSuccess(data);
                }

                if (redirect) {
                    setTimeout(() => {
                        window.location.href = redirect;
                    }, 2000);
                }
            } else {
                showAlert(data.message || errorMessage, 'error');
                if (onError) {
                    onError(data);
                }
            }
        })
        .catch(error => {
            showAlert('Error: ' + error.message, 'error');
            if (onError) {
                onError(error);
            }
        });
}

/**
 * 創建性別
 * @param {Object} genderData 性別數據
 * @param {Object} options 選項
 */
function createGender(genderData, options = {}) {
    const url = options.url || window.createGenderUrl;
    const method = 'POST';

    handleGenderRequest(url, method, genderData, {
        successMessage: 'Gender created successfully',
        errorMessage: 'Failed to create gender',
        redirect: window.genderManagementRoute,
        ...options
    });
}

/**
 * 更新性別
 * @param {number} genderId 性別ID
 * @param {Object} genderData 性別數據
 * @param {Object} options 選項
 */
function updateGender(genderId, genderData, options = {}) {
    const url = (options.url || window.updateGenderUrl).replace(':id', genderId);
    const method = 'POST';

    handleGenderRequest(url, method, genderData, {
        successMessage: 'Gender updated successfully',
        errorMessage: 'Failed to update gender',
        redirect: window.genderManagementRoute,
        ...options
    });
}

/**
 * 刪除性別
 * @param {number} genderId 性別ID
 * @param {Object} options 選項
 */
function deleteGender(genderId, options = {}) {
    const url = (options.url || window.deleteGenderUrl).replace(':id', genderId);
    const method = 'DELETE';

    if (!confirm('Are you sure you want to delete this gender?')) {
        return;
    }

    handleGenderRequest(url, method, null, {
        successMessage: 'Gender deleted successfully',
        errorMessage: 'Failed to delete gender',
        redirect: null,
        onSuccess: () => {
            // 重新加載頁面或刷新數據
            if (window.genderDashboard && window.genderDashboard.fetchGenders) {
                window.genderDashboard.fetchGenders();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置性別可用
 * @param {number} genderId 性別ID
 * @param {Object} options 選項
 */
function setGenderAvailable(genderId, options = {}) {
    const url = (options.url || window.availableGenderUrl).replace(':id', genderId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to activate this gender?')) {
        return;
    }

    handleGenderRequest(url, method, null, {
        successMessage: 'Gender activated successfully',
        errorMessage: 'Failed to activate gender',
        redirect: null,
        onSuccess: () => {
            if (window.genderDashboard && window.genderDashboard.fetchGenders) {
                window.genderDashboard.fetchGenders();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置性別不可用
 * @param {number} genderId 性別ID
 * @param {Object} options 選項
 */
function setGenderUnavailable(genderId, options = {}) {
    const url = (options.url || window.unavailableGenderUrl).replace(':id', genderId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to deactivate this gender?')) {
        return;
    }

    handleGenderRequest(url, method, null, {
        successMessage: 'Gender deactivated successfully',
        errorMessage: 'Failed to deactivate gender',
        redirect: null,
        onSuccess: () => {
            if (window.genderDashboard && window.genderDashboard.fetchGenders) {
                window.genderDashboard.fetchGenders();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

// =============================================================================
// 事件綁定功能 (Event Binding)
// =============================================================================

/**
 * 綁定性別相關事件
 * @param {Object} config 配置選項
 */
function bindGenderEvents(config = {}) {
    const {
        statusCardSelector = '.status-card',
        removeItemSelector = '.remove-item'
    } = config;

    // 狀態卡片選擇事件
    if (statusCardSelector) {
        $(document).on('click', statusCardSelector, function(e) {
            if (!$(e.target).is('input[type="radio"]')) {
                selectStatusCard(this);
            }
        });
    }

    // 移除項目事件（用於創建頁面）
    if (removeItemSelector) {
        $(document).on('click', removeItemSelector, function(e) {
            const button = $(e.currentTarget);
            const index = parseInt(button.data('index'));

            if (window.removeGender && typeof window.removeGender === 'function') {
                window.removeGender(index);
            }
        });
    }
}

/**
 * 初始化性別頁面
 * @param {Object} config 配置選項
 */
function initializeGenderPage(config = {}) {
    const {
        events = {},
        onInit = null
    } = config;

    // 綁定通用事件
    bindGenderEvents();

    // 初始化狀態卡片選擇
    initializeStatusCardSelection();

    // 執行自定義初始化
    if (onInit) {
        onInit();
    }

    // 綁定自定義事件
    Object.keys(events).forEach(eventName => {
        const handler = events[eventName];
        if (typeof handler === 'function') {
            // 根據事件名稱綁定到相應元素
            switch (eventName) {
                case 'formSubmit':
                    const form = document.getElementById('genderForm');
                    if (form) {
                        form.addEventListener('submit', handler);
                    }
                    break;
                default:
                    console.warn(`Unknown event: ${eventName}`);
            }
        }
    });
}

// =============================================================================
// 工具函數 (Utility Functions)
// =============================================================================

/**
 * 獲取狀態CSS類
 * @param {string} status 狀態
 * @returns {string} CSS類名
 */
function getGenderStatusClass(status) {
    const statusMap = {
        'Available': 'available',
        'Unavailable': 'unavailable'
    };
    return statusMap[status] || 'default';
}

/**
 * 檢查性別是否存在
 * @param {Array} genderList 性別列表
 * @param {string} genderName 性別名稱
 * @returns {boolean} 是否存在
 */
function isGenderExists(genderList, genderName) {
    return genderList.some(item => item.genderName.toLowerCase() === genderName.toLowerCase());
}

/**
 * 高亮現有性別
 * @param {string} genderName 性別名稱
 */
function highlightExistingGender(genderName) {
    const existingValues = document.querySelectorAll('.item-value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.item-value-text').textContent.trim();
        if (value.toLowerCase() === genderName.toLowerCase()) {
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
