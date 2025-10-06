/**
 * Subcategory Common JavaScript Functions
 * 子分類管理通用函數庫
 *
 * 功能模塊：
 * - 子分類CRUD操作
 * - 狀態管理
 * - 圖片預覽和上傳
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
    const statusRadioInputs = document.querySelectorAll('input[name="subcategory_status"]');

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
    const checkedRadio = document.querySelector('input[name="subcategory_status"]:checked');
    if (checkedRadio) {
        const card = checkedRadio.closest('.status-card');
        if (card) {
            card.classList.add('selected');
        }
    }
}

// =============================================================================
// 圖片預覽和上傳功能 (Image Preview and Upload)
// =============================================================================

/**
 * 處理圖片預覽
 * @param {Event} event 文件選擇事件
 */
// 圖片預覽處理函數已移至 image-handler.js

// 圖片預覽處理函數已移至 image-handler.js

// 圖片管理函數已移至 image-handler.js

// 圖片預覽功能已移至 image-handler.js

// =============================================================================
// 表單驗證功能 (Form Validation)
// =============================================================================

/**
 * 驗證子分類表單
 * @param {Object} formData 表單數據
 * @param {Object} options 驗證選項
 * @returns {Object} 驗證結果
 */
function validateSubcategoryForm(formData, options = {}) {
    const errors = [];
    const { requireStatus = true } = options;

    // 驗證子分類名稱
    if (!formData.subcategory_name || formData.subcategory_name.trim() === '') {
        errors.push('Subcategory name is required');
    }

    // 驗證狀態
    if (requireStatus && (!formData.subcategory_status || formData.subcategory_status === '')) {
        errors.push('Subcategory status is required');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 驗證子分類更新表單（包含重複檢查）
 * @param {Object} formData 表單數據
 * @param {Object} options 選項
 * @returns {Promise<Object>} 驗證結果
 */
async function validateSubcategoryUpdateForm(formData, options = {}) {
    const errors = [];
    const { requireStatus = true, currentId = null } = options;

    // 基本驗證
    if (!formData.subcategory_name || formData.subcategory_name.trim() === '') {
        errors.push('Subcategory name is required');
    }

    if (requireStatus && (!formData.subcategory_status || formData.subcategory_status === '')) {
        errors.push('Subcategory status is required');
    }

    // 重複檢查（如果有子分類名稱且不是當前記錄）
    if (formData.subcategory_name && formData.subcategory_name.trim() !== '' && currentId) {
        try {
            const exists = await checkSubcategoryNameExists(formData.subcategory_name.trim(), currentId);
            if (exists) {
                errors.push('Subcategory name already exists');
            }
        } catch (error) {
            console.error('Error checking subcategory name:', error);
            errors.push('Unable to verify subcategory name uniqueness');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 檢查子分類名稱是否存在（用於更新時的重複檢查）
 * @param {string} subcategoryName 子分類名稱
 * @param {number} currentId 當前記錄ID
 * @returns {Promise<boolean>} 是否存在
 */
async function checkSubcategoryNameExists(subcategoryName, currentId) {
    try {
        const response = await fetch('/admin/subcategories/check-name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                subcategory_name: subcategoryName,
                current_id: currentId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.exists || false;
    } catch (error) {
        console.error('Error checking subcategory name:', error);
        return false; // 發生錯誤時不阻止提交，讓服務器端處理
    }
}

// =============================================================================
// 子分類操作功能 (Subcategory Operations)
// =============================================================================

/**
 * 處理子分類請求
 * @param {string} url 請求URL
 * @param {string} method HTTP方法
 * @param {Object} data 請求數據
 * @param {Object} options 選項
 */
function handleSubcategoryRequest(url, method, data, options = {}) {
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
 * 創建子分類
 * @param {Object} subcategoryData 子分類數據
 * @param {Object} options 選項
 */
function createSubcategory(subcategoryData, options = {}) {
    const url = options.url || window.createSubcategoryUrl;
    const method = 'POST';

    handleSubcategoryRequest(url, method, subcategoryData, {
        successMessage: 'Subcategory created successfully',
        errorMessage: 'Failed to create subcategory',
        redirect: window.subcategoryManagementRoute,
        ...options
    });
}

/**
 * 更新子分類
 * @param {number} subcategoryId 子分類ID
 * @param {Object} subcategoryData 子分類數據
 * @param {Object} options 選項
 */
function updateSubcategory(subcategoryId, subcategoryData, options = {}) {
    const url = (options.url || window.updateSubcategoryUrl).replace(':id', subcategoryId);
    const method = 'POST';

    handleSubcategoryRequest(url, method, subcategoryData, {
        successMessage: 'Subcategory updated successfully',
        errorMessage: 'Failed to update subcategory',
        redirect: window.subcategoryManagementRoute,
        ...options
    });
}

/**
 * 刪除子分類
 * @param {number} subcategoryId 子分類ID
 * @param {Object} options 選項
 */
function deleteSubcategory(subcategoryId, options = {}) {
    const url = (options.url || window.deleteSubcategoryUrl).replace(':id', subcategoryId);
    const method = 'DELETE';

    if (!confirm('Are you sure you want to delete this subcategory?')) {
        return;
    }

    handleSubcategoryRequest(url, method, null, {
        successMessage: 'Subcategory deleted successfully',
        errorMessage: 'Failed to delete subcategory',
        redirect: null,
        onSuccess: () => {
            // 重新加載頁面或刷新數據
            if (window.subcategoryDashboard && window.subcategoryDashboard.fetchSubcategories) {
                window.subcategoryDashboard.fetchSubcategories();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置子分類可用
 * @param {number} subcategoryId 子分類ID
 * @param {Object} options 選項
 */
function setSubcategoryAvailable(subcategoryId, options = {}) {
    const url = (options.url || window.availableSubcategoryUrl).replace(':id', subcategoryId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to activate this subcategory?')) {
        return;
    }

    handleSubcategoryRequest(url, method, null, {
        successMessage: 'Subcategory activated successfully',
        errorMessage: 'Failed to activate subcategory',
        redirect: null,
        onSuccess: () => {
            if (window.subcategoryDashboard && window.subcategoryDashboard.fetchSubcategories) {
                window.subcategoryDashboard.fetchSubcategories();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置子分類不可用
 * @param {number} subcategoryId 子分類ID
 * @param {Object} options 選項
 */
function setSubcategoryUnavailable(subcategoryId, options = {}) {
    const url = (options.url || window.unavailableSubcategoryUrl).replace(':id', subcategoryId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to deactivate this subcategory?')) {
        return;
    }

    handleSubcategoryRequest(url, method, null, {
        successMessage: 'Subcategory deactivated successfully',
        errorMessage: 'Failed to deactivate subcategory',
        redirect: null,
        onSuccess: () => {
            if (window.subcategoryDashboard && window.subcategoryDashboard.fetchSubcategories) {
                window.subcategoryDashboard.fetchSubcategories();
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
 * 綁定子分類相關事件
 * @param {Object} config 配置選項
 */
function bindSubcategoryEvents(config = {}) {
    const {
        statusCardSelector = '.status-card',
        removeItemSelector = '.remove-item',
        imageInputSelector = '#subcategory_image',
        imageUploadAreaSelector = '#imageUploadArea'
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

            if (window.removeSubcategory && typeof window.removeSubcategory === 'function') {
                window.removeSubcategory(index);
            }
        });
    }

    // 使用統一的圖片處理模組
    if (typeof window.ImageHandler !== 'undefined') {
        window.ImageHandler.bindImageUploadEvents({
            createImageInputId: 'subcategory_image',
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
            createImageInputId: 'subcategory_image',
            createImageUploadAreaId: 'imageUploadArea',
            updateImageInputId: 'input_image',
            updatePreviewContainerId: 'image-preview'
        });
    } else {
        console.warn('ImageHandler not available, image functionality may not work properly');
    }
}

/**
 * 初始化子分類頁面
 * @param {Object} config 配置選項
 */
function initializeSubcategoryPage(config = {}) {
    const {
        events = {},
        onInit = null
    } = config;

    // 綁定通用事件
    bindSubcategoryEvents();

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
                    const form = document.getElementById('subcategoryForm');
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
function getSubcategoryStatusClass(status) {
    const statusMap = {
        'Available': 'available',
        'Unavailable': 'unavailable'
    };
    return statusMap[status] || 'default';
}

/**
 * 檢查子分類是否存在
 * @param {Array} subcategoryList 子分類列表
 * @param {string} subcategoryName 子分類名稱
 * @returns {boolean} 是否存在
 */
function isSubcategoryExists(subcategoryList, subcategoryName) {
    // 检查列表中是否有多个相同的子分类名称
    const count = subcategoryList.filter(item => item.subcategoryName.toLowerCase() === subcategoryName.toLowerCase()).length;
    return count > 1; // 如果有超过1个，说明有重复
}

/**
 * 高亮現有子分類
 * @param {string} subcategoryName 子分類名稱
 */
function highlightExistingSubcategory(subcategoryName) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.item-value-text').textContent.trim();
        if (value.toLowerCase() === subcategoryName.toLowerCase()) {
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
