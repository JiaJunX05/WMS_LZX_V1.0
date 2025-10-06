/**
 * Color Common JavaScript Functions
 * 顏色管理通用函數庫
 *
 * 功能模塊：
 * - 顏色CRUD操作
 * - 狀態管理
 * - 顏色預覽和轉換
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
    const statusRadioInputs = document.querySelectorAll('input[name="color_status"]');

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
    const checkedRadio = document.querySelector('input[name="color_status"]:checked');
    if (checkedRadio) {
        const card = checkedRadio.closest('.status-card');
        if (card) {
            card.classList.add('selected');
        }
    }
}

// =============================================================================
// 顏色預覽和轉換功能 (Color Preview and Conversion)
// =============================================================================

/**
 * 驗證顏色代碼格式
 * @param {string} colorCode 顏色代碼
 * @returns {boolean} 是否有效
 */
function isValidColorCode(colorCode) {
    // 移除#號進行驗證
    const cleanCode = colorCode.replace('#', '');
    // 驗證6位十六進制代碼
    return /^[0-9A-Fa-f]{6}$/.test(cleanCode);
}

/**
 * HEX轉RGB函數
 * @param {string} hex HEX顏色代碼
 * @returns {Object|null} RGB對象或null
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * 更新顏色預覽
 */
function updateColorPreview() {
    const colorHexInput = document.getElementById('color_hex');
    const colorPreview = document.getElementById('color-preview');
    const rgbInput = document.getElementById('color_rgb');

    if (colorHexInput && colorPreview) {
        const colorValue = colorHexInput.value.trim();
        if (colorValue && isValidColorCode(colorValue)) {
            const normalizedColor = colorValue.startsWith('#') ? colorValue : '#' + colorValue;
            colorPreview.style.backgroundColor = normalizedColor;
            colorPreview.style.display = 'block';

            // 自動生成RGB代碼
            if (rgbInput) {
                const rgb = hexToRgb(normalizedColor);
                if (rgb) {
                    rgbInput.value = `${rgb.r},${rgb.g},${rgb.b}`;
                }
            }
        } else {
            colorPreview.style.display = 'none';
        }
    }
}

/**
 * 設置顏色預覽
 */
function setupColorPreview() {
    const hexInput = document.getElementById('color_hex');
    const rgbInput = document.getElementById('color_rgb');
    const colorPreview = document.getElementById('color-preview');

    if (hexInput && colorPreview) {
        // 實時更新顏色預覽
        function updateColorPreviewRealTime() {
            const hexValue = hexInput.value;
            if (hexValue && /^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
                colorPreview.style.backgroundColor = hexValue;

                // 自動生成RGB代碼
                if (rgbInput) {
                    const rgb = hexToRgb(hexValue);
                    if (rgb) {
                        rgbInput.value = `${rgb.r},${rgb.g},${rgb.b}`;
                    }
                }
            }
        }

        // 監聽輸入變化
        hexInput.addEventListener('input', updateColorPreviewRealTime);

        // 初始化預覽
        updateColorPreviewRealTime();
    }
}

// =============================================================================
// 表單驗證功能 (Form Validation)
// =============================================================================

/**
 * 驗證顏色表單
 * @param {Object} formData 表單數據
 * @param {Object} options 驗證選項
 * @returns {Object} 驗證結果
 */
function validateColorForm(formData, options = {}) {
    const errors = [];
    const { requireHex = true, requireStatus = true } = options;

    // 驗證顏色名稱
    if (!formData.color_name || formData.color_name.trim() === '') {
        errors.push('Color name is required');
    }

    // 驗證顏色代碼
    if (requireHex && (!formData.color_hex || formData.color_hex.trim() === '')) {
        errors.push('Color code is required');
    }

    // 驗證顏色代碼格式
    if (formData.color_hex && !isValidColorCode(formData.color_hex)) {
        errors.push('Please enter a valid color code (e.g., #FF0000 or FF0000)');
    }

    // 驗證狀態
    if (requireStatus && (!formData.color_status || formData.color_status === '')) {
        errors.push('Color status is required');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 驗證顏色更新表單（包含重複檢查）
 * @param {Object} formData 表單數據
 * @param {Object} options 選項
 * @returns {Promise<Object>} 驗證結果
 */
async function validateColorUpdateForm(formData, options = {}) {
    const errors = [];
    const { requireHex = true, requireStatus = true, currentId = null } = options;

    // 基本驗證
    if (!formData.color_name || formData.color_name.trim() === '') {
        errors.push('Color name is required');
    }

    if (requireHex && (!formData.color_hex || formData.color_hex.trim() === '')) {
        errors.push('Color code is required');
    }

    if (formData.color_hex && !isValidColorCode(formData.color_hex)) {
        errors.push('Please enter a valid color code (e.g., #FF0000 or FF0000)');
    }

    if (requireStatus && (!formData.color_status || formData.color_status === '')) {
        errors.push('Color status is required');
    }

    // 重複檢查（如果有顏色名稱且不是當前記錄）
    if (formData.color_name && formData.color_name.trim() !== '' && currentId) {
        try {
            const exists = await checkColorNameExists(formData.color_name.trim(), currentId);
            if (exists) {
                errors.push('Color name already exists');
            }
        } catch (error) {
            console.error('Error checking color name:', error);
            errors.push('Unable to verify color name uniqueness');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 檢查顏色名稱是否存在（用於更新時的重複檢查）
 * @param {string} colorName 顏色名稱
 * @param {number} currentId 當前記錄ID
 * @returns {Promise<boolean>} 是否存在
 */
async function checkColorNameExists(colorName, currentId) {
    try {
        const response = await fetch('/admin/colors/check-name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                color_name: colorName,
                current_id: currentId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.exists || false;
    } catch (error) {
        console.error('Error checking color name:', error);
        return false; // 發生錯誤時不阻止提交，讓服務器端處理
    }
}

// =============================================================================
// 顏色操作功能 (Color Operations)
// =============================================================================

/**
 * 處理顏色請求
 * @param {string} url 請求URL
 * @param {string} method HTTP方法
 * @param {Object} data 請求數據
 * @param {Object} options 選項
 */
function handleColorRequest(url, method, data, options = {}) {
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
 * 創建顏色
 * @param {Object} colorData 顏色數據
 * @param {Object} options 選項
 */
function createColor(colorData, options = {}) {
    const url = options.url || window.createColorUrl;
    const method = 'POST';

    handleColorRequest(url, method, colorData, {
        successMessage: 'Color created successfully',
        errorMessage: 'Failed to create color',
        redirect: window.colorManagementRoute,
        ...options
    });
}

/**
 * 更新顏色
 * @param {number} colorId 顏色ID
 * @param {Object} colorData 顏色數據
 * @param {Object} options 選項
 */
function updateColor(colorId, colorData, options = {}) {
    const url = (options.url || window.updateColorUrl).replace(':id', colorId);
    const method = 'POST';

    handleColorRequest(url, method, colorData, {
        successMessage: 'Color updated successfully',
        errorMessage: 'Failed to update color',
        redirect: window.colorManagementRoute,
        ...options
    });
}

/**
 * 刪除顏色
 * @param {number} colorId 顏色ID
 * @param {Object} options 選項
 */
function deleteColor(colorId, options = {}) {
    const url = (options.url || window.deleteColorUrl).replace(':id', colorId);
    const method = 'DELETE';

    if (!confirm('Are you sure you want to delete this color?')) {
        return;
    }

    handleColorRequest(url, method, null, {
        successMessage: 'Color deleted successfully',
        errorMessage: 'Failed to delete color',
        redirect: null,
        onSuccess: () => {
            // 重新加載頁面或刷新數據
            if (window.colorDashboard && window.colorDashboard.fetchColors) {
                window.colorDashboard.fetchColors();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置顏色可用
 * @param {number} colorId 顏色ID
 * @param {Object} options 選項
 */
function setColorAvailable(colorId, options = {}) {
    const url = (options.url || window.availableColorUrl).replace(':id', colorId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to activate this color?')) {
        return;
    }

    handleColorRequest(url, method, null, {
        successMessage: 'Color activated successfully',
        errorMessage: 'Failed to activate color',
        redirect: null,
        onSuccess: () => {
            if (window.colorDashboard && window.colorDashboard.fetchColors) {
                window.colorDashboard.fetchColors();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置顏色不可用
 * @param {number} colorId 顏色ID
 * @param {Object} options 選項
 */
function setColorUnavailable(colorId, options = {}) {
    const url = (options.url || window.unavailableColorUrl).replace(':id', colorId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to deactivate this color?')) {
        return;
    }

    handleColorRequest(url, method, null, {
        successMessage: 'Color deactivated successfully',
        errorMessage: 'Failed to deactivate color',
        redirect: null,
        onSuccess: () => {
            if (window.colorDashboard && window.colorDashboard.fetchColors) {
                window.colorDashboard.fetchColors();
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
 * 綁定顏色相關事件
 * @param {Object} config 配置選項
 */
function bindColorEvents(config = {}) {
    const {
        statusCardSelector = '.status-card',
        colorHexInputSelector = '#color_hex',
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

    // 顏色代碼輸入實時預覽
    if (colorHexInputSelector) {
        const colorHexInput = document.querySelector(colorHexInputSelector);
        if (colorHexInput) {
            colorHexInput.addEventListener('input', function() {
                updateColorPreview();
            });
        }
    }

    // 移除項目事件（用於創建頁面）
    if (removeItemSelector) {
        $(document).on('click', removeItemSelector, function(e) {
            const button = $(e.currentTarget);
            const index = parseInt(button.data('index'));

            if (window.removeColor && typeof window.removeColor === 'function') {
                window.removeColor(index);
            }
        });
    }
}

/**
 * 初始化顏色頁面
 * @param {Object} config 配置選項
 */
function initializeColorPage(config = {}) {
    const {
        events = {},
        onInit = null
    } = config;

    // 綁定通用事件
    bindColorEvents();

    // 初始化狀態卡片選擇
    initializeStatusCardSelection();

    // 初始化顏色預覽
    setupColorPreview();

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
                    const form = document.getElementById('colorForm');
                    if (form) {
                        form.addEventListener('submit', handler);
                    }
                    break;
                case 'colorHexChange':
                    const colorHexInput = document.getElementById('color_hex');
                    if (colorHexInput) {
                        colorHexInput.addEventListener('input', handler);
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
function getColorStatusClass(status) {
    const statusMap = {
        'Available': 'available',
        'Unavailable': 'unavailable'
    };
    return statusMap[status] || 'default';
}

/**
 * 檢查顏色是否存在
 * @param {Array} colorList 顏色列表
 * @param {string} colorName 顏色名稱
 * @returns {boolean} 是否存在
 */
function isColorExists(colorList, colorName) {
    return colorList.some(item => item.colorName.toLowerCase() === colorName.toLowerCase());
}

/**
 * 高亮現有顏色
 * @param {string} colorName 顏色名稱
 */
function highlightExistingColor(colorName) {
    const existingValues = document.querySelectorAll('.item-value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.item-value-text').textContent.trim();
        if (value.toLowerCase() === colorName.toLowerCase()) {
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

/**
 * 標準化顏色代碼
 * @param {string} colorHex 顏色代碼
 * @returns {string} 標準化的顏色代碼
 */
function normalizeColorHex(colorHex) {
    return colorHex.startsWith('#') ? colorHex : '#' + colorHex;
}
