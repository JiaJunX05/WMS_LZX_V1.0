/**
 * Brand Common JavaScript Functions
 * 品牌管理通用函數庫
 *
 * 功能模塊：
 * - 品牌CRUD操作
 * - 狀態管理
 * - 圖片處理
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
    const statusRadioInputs = document.querySelectorAll('input[name="brand_status"]');

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
    const checkedRadio = document.querySelector('input[name="brand_status"]:checked');
    if (checkedRadio) {
        const card = checkedRadio.closest('.status-card');
        if (card) {
            card.classList.add('selected');
        }
    }
}

// =============================================================================
// 圖片處理功能 (Image Handling)
// =============================================================================

// 圖片預覽處理函數已移至 image-handler.js

// 圖片預覽處理函數已移至 image-handler.js

// 圖片管理函數已移至 image-handler.js

// 圖片管理函數已移至 image-handler.js

// 圖片預覽功能已移至 image-handler.js

// =============================================================================
// 表單驗證功能 (Form Validation)
// =============================================================================

/**
 * 驗證品牌表單
 * @param {Object} formData 表單數據
 * @param {Object} options 驗證選項
 * @returns {Object} 驗證結果
 */
function validateBrandForm(formData, options = {}) {
    const errors = [];
    const { requireImage = false, requireStatus = true, checkDuplicate = false, currentId = null } = options;

    // 驗證品牌名稱
    if (!formData.brand_name || formData.brand_name.trim() === '') {
        errors.push('Brand name is required');
    }

    // 驗證狀態
    if (requireStatus && (!formData.brand_status || formData.brand_status === '')) {
        errors.push('Brand status is required');
    }

    // 驗證圖片（如果需要）
    if (requireImage && (!formData.brand_image || formData.brand_image === '')) {
        errors.push('Brand image is required');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 驗證品牌更新表單（包含重複檢查）
 * @param {Object} formData 表單數據
 * @param {Object} options 選項
 * @returns {Promise<Object>} 驗證結果
 */
async function validateBrandUpdateForm(formData, options = {}) {
    const errors = [];
    const { requireImage = false, requireStatus = true, currentId = null } = options;

    // 基本驗證
    if (!formData.brand_name || formData.brand_name.trim() === '') {
        errors.push('Brand name is required');
    }

    if (requireStatus && (!formData.brand_status || formData.brand_status === '')) {
        errors.push('Brand status is required');
    }

    if (requireImage && (!formData.brand_image || formData.brand_image === '')) {
        errors.push('Brand image is required');
    }

    // 重複檢查（如果有品牌名稱且不是當前記錄）
    if (formData.brand_name && formData.brand_name.trim() !== '' && currentId) {
        try {
            const exists = await checkBrandNameExists(formData.brand_name.trim(), currentId);
            if (exists) {
                errors.push('Brand name already exists');
            }
        } catch (error) {
            console.error('Error checking brand name:', error);
            errors.push('Unable to verify brand name uniqueness');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 檢查品牌名稱是否存在（用於更新時的重複檢查）
 * @param {string} brandName 品牌名稱
 * @param {number} currentId 當前記錄ID
 * @returns {Promise<boolean>} 是否存在
 */
async function checkBrandNameExists(brandName, currentId) {
    try {
        const response = await fetch('/admin/brands/check-name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                brand_name: brandName,
                current_id: currentId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.exists || false;
    } catch (error) {
        console.error('Error checking brand name:', error);
        return false; // 發生錯誤時不阻止提交，讓服務器端處理
    }
}

// =============================================================================
// 品牌操作功能 (Brand Operations)
// =============================================================================

/**
 * 處理品牌請求
 * @param {string} url 請求URL
 * @param {string} method HTTP方法
 * @param {Object} data 請求數據
 * @param {Object} options 選項
 */
function handleBrandRequest(url, method, data, options = {}) {
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
 * 創建品牌
 * @param {Object} brandData 品牌數據
 * @param {Object} options 選項
 */
function createBrand(brandData, options = {}) {
    const url = options.url || window.createBrandUrl;
    const method = 'POST';

    handleBrandRequest(url, method, brandData, {
        successMessage: 'Brand created successfully',
        errorMessage: 'Failed to create brand',
        redirect: window.brandManagementRoute,
        ...options
    });
}

/**
 * 更新品牌
 * @param {number} brandId 品牌ID
 * @param {Object} brandData 品牌數據
 * @param {Object} options 選項
 */
function updateBrand(brandId, brandData, options = {}) {
    const url = (options.url || window.updateBrandUrl).replace(':id', brandId);
    const method = 'POST';

    handleBrandRequest(url, method, brandData, {
        successMessage: 'Brand updated successfully',
        errorMessage: 'Failed to update brand',
        redirect: window.brandManagementRoute,
        ...options
    });
}

/**
 * 刪除品牌
 * @param {number} brandId 品牌ID
 * @param {Object} options 選項
 */
function deleteBrand(brandId, options = {}) {
    const url = (options.url || window.deleteBrandUrl).replace(':id', brandId);
    const method = 'DELETE';

    if (!confirm('Are you sure you want to delete this brand?')) {
        return;
    }

    handleBrandRequest(url, method, null, {
        successMessage: 'Brand deleted successfully',
        errorMessage: 'Failed to delete brand',
        redirect: null,
        onSuccess: () => {
            // 重新加載頁面或刷新數據
            if (window.brandDashboard && window.brandDashboard.fetchBrands) {
                window.brandDashboard.fetchBrands();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置品牌可用
 * @param {number} brandId 品牌ID
 * @param {Object} options 選項
 */
function setBrandAvailable(brandId, options = {}) {
    const url = (options.url || window.availableBrandUrl).replace(':id', brandId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to activate this brand?')) {
        return;
    }

    handleBrandRequest(url, method, null, {
        successMessage: 'Brand activated successfully',
        errorMessage: 'Failed to activate brand',
        redirect: null,
        onSuccess: () => {
            if (window.brandDashboard && window.brandDashboard.fetchBrands) {
                window.brandDashboard.fetchBrands();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置品牌不可用
 * @param {number} brandId 品牌ID
 * @param {Object} options 選項
 */
function setBrandUnavailable(brandId, options = {}) {
    const url = (options.url || window.unavailableBrandUrl).replace(':id', brandId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to deactivate this brand?')) {
        return;
    }

    handleBrandRequest(url, method, null, {
        successMessage: 'Brand deactivated successfully',
        errorMessage: 'Failed to deactivate brand',
        redirect: null,
        onSuccess: () => {
            if (window.brandDashboard && window.brandDashboard.fetchBrands) {
                window.brandDashboard.fetchBrands();
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
 * 綁定品牌相關事件
 * @param {Object} config 配置選項
 */
function bindBrandEvents(config = {}) {
    const {
        statusCardSelector = '.status-card',
        imageInputSelector = '#brand_image',
        imageUploadAreaSelector = '#imageUploadArea',
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

    // 使用統一的圖片處理模組
    if (typeof window.ImageHandler !== 'undefined') {
        window.ImageHandler.bindImageUploadEvents({
            createImageInputId: 'brand_image',
            createImageUploadAreaId: 'imageUploadArea',
            updateImageInputId: 'input_image',
            updatePreviewContainerId: 'image-preview'
        });
    } else {
        // 備用實現（如果 image-handler.js 未加載）
        bindLegacyImageEvents();
    }

    // 移除項目事件（用於創建頁面）
    if (removeItemSelector) {
        $(document).on('click', removeItemSelector, function(e) {
            const button = $(e.currentTarget);
            const index = parseInt(button.data('index'));

            if (window.removeBrand && typeof window.removeBrand === 'function') {
                window.removeBrand(index);
            }
        });
    }

}

/**
 * 備用圖片事件綁定（向後兼容）
 */
function bindLegacyImageEvents() {
    // 直接使用統一的圖片處理模組
    if (typeof window.ImageHandler !== 'undefined') {
        window.ImageHandler.bindImageUploadEvents({
            createImageInputId: 'brand_image',
            createImageUploadAreaId: 'imageUploadArea',
            updateImageInputId: 'input_image',
            updatePreviewContainerId: 'image-preview'
        });
    } else {
        console.warn('ImageHandler not available, image functionality may not work properly');
    }
}

/**
 * 初始化品牌頁面
 * @param {Object} config 配置選項
 */
function initializeBrandPage(config = {}) {
    const {
        events = {},
        onInit = null
    } = config;

    // 綁定通用事件
    bindBrandEvents();

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
                    const form = document.getElementById('brandForm');
                    if (form) {
                        form.addEventListener('submit', handler);
                    }
                    break;
                case 'imageChange':
                    const imageInput = document.getElementById('brand_image');
                    if (imageInput) {
                        imageInput.addEventListener('change', handler);
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
function getBrandStatusClass(status) {
    const statusMap = {
        'Available': 'available',
        'Unavailable': 'unavailable'
    };
    return statusMap[status] || 'default';
}

/**
 * 檢查品牌是否存在
 * @param {Array} brandList 品牌列表
 * @param {string} brandName 品牌名稱
 * @returns {boolean} 是否存在
 */
function isBrandExists(brandList, brandName) {
    return brandList.some(item => item.brandName.toLowerCase() === brandName.toLowerCase());
}

/**
 * 高亮現有品牌
 * @param {string} brandName 品牌名稱
 */
function highlightExistingBrand(brandName) {
    const existingValues = document.querySelectorAll('.item-value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.item-value-text').textContent.trim();
        if (value.toLowerCase() === brandName.toLowerCase()) {
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
