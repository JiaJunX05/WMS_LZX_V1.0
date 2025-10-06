/**
 * Category Common JavaScript Functions
 * 分類管理通用函數庫
 *
 * 功能模塊：
 * - 分類CRUD操作
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
    const statusRadioInputs = document.querySelectorAll('input[name="category_status"]');

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
    const checkedRadio = document.querySelector('input[name="category_status"]:checked');
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

// 圖片預覽功能已移至 image-handler.js

// =============================================================================
// 表單驗證功能 (Form Validation)
// =============================================================================

/**
 * 驗證分類表單
 * @param {Object} formData 表單數據
 * @param {Object} options 驗證選項
 * @returns {Object} 驗證結果
 */
function validateCategoryForm(formData, options = {}) {
    const errors = [];
    const { requireStatus = true } = options;

    // 驗證分類名稱
    if (!formData.category_name || formData.category_name.trim() === '') {
        errors.push('Category name is required');
    }

    // 驗證狀態
    if (requireStatus && (!formData.category_status || formData.category_status === '')) {
        errors.push('Category status is required');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 驗證分類更新表單（包含重複檢查）
 * @param {Object} formData 表單數據
 * @param {Object} options 選項
 * @returns {Promise<Object>} 驗證結果
 */
async function validateCategoryUpdateForm(formData, options = {}) {
    const errors = [];
    const { requireStatus = true, currentId = null } = options;

    // 基本驗證
    if (!formData.category_name || formData.category_name.trim() === '') {
        errors.push('Category name is required');
    }

    if (requireStatus && (!formData.category_status || formData.category_status === '')) {
        errors.push('Category status is required');
    }

    // 重複檢查（如果有分類名稱且不是當前記錄）
    if (formData.category_name && formData.category_name.trim() !== '' && currentId) {
        try {
            const exists = await checkCategoryNameExists(formData.category_name.trim(), currentId);
            if (exists) {
                errors.push('Category name already exists');
            }
        } catch (error) {
            console.error('Error checking category name:', error);
            errors.push('Unable to verify category name uniqueness');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 檢查分類名稱是否存在（用於更新時的重複檢查）
 * @param {string} categoryName 分類名稱
 * @param {number} currentId 當前記錄ID
 * @returns {Promise<boolean>} 是否存在
 */
async function checkCategoryNameExists(categoryName, currentId) {
    try {
        const response = await fetch('/admin/categories/check-name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                category_name: categoryName,
                current_id: currentId
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.exists || false;
    } catch (error) {
        console.error('Error checking category name:', error);
        return false; // 發生錯誤時不阻止提交，讓服務器端處理
    }
}

// =============================================================================
// 分類操作功能 (Category Operations)
// =============================================================================

/**
 * 處理分類請求
 * @param {string} url 請求URL
 * @param {string} method HTTP方法
 * @param {Object} data 請求數據
 * @param {Object} options 選項
 */
function handleCategoryRequest(url, method, data, options = {}) {
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
 * 創建分類
 * @param {Object} categoryData 分類數據
 * @param {Object} options 選項
 */
function createCategory(categoryData, options = {}) {
    const url = options.url || window.createCategoryUrl;
    const method = 'POST';

    handleCategoryRequest(url, method, categoryData, {
        successMessage: 'Category created successfully',
        errorMessage: 'Failed to create category',
        redirect: window.categoryManagementRoute,
        ...options
    });
}

/**
 * 更新分類
 * @param {number} categoryId 分類ID
 * @param {Object} categoryData 分類數據
 * @param {Object} options 選項
 */
function updateCategory(categoryId, categoryData, options = {}) {
    const url = (options.url || window.updateCategoryUrl).replace(':id', categoryId);
    const method = 'POST';

    handleCategoryRequest(url, method, categoryData, {
        successMessage: 'Category updated successfully',
        errorMessage: 'Failed to update category',
        redirect: window.categoryManagementRoute,
        ...options
    });
}

/**
 * 刪除分類
 * @param {number} categoryId 分類ID
 * @param {Object} options 選項
 */
function deleteCategory(categoryId, options = {}) {
    const url = (options.url || window.deleteCategoryUrl).replace(':id', categoryId);
    const method = 'DELETE';

    if (!confirm('Are you sure you want to delete this category?')) {
        return;
    }

    handleCategoryRequest(url, method, null, {
        successMessage: 'Category deleted successfully',
        errorMessage: 'Failed to delete category',
        redirect: null,
        onSuccess: () => {
            // 重新加載頁面或刷新數據
            if (window.categoryDashboard && window.categoryDashboard.fetchCategories) {
                window.categoryDashboard.fetchCategories();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置分類可用
 * @param {number} categoryId 分類ID
 * @param {Object} options 選項
 */
function setCategoryAvailable(categoryId, options = {}) {
    const url = (options.url || window.availableCategoryUrl).replace(':id', categoryId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to activate this category?')) {
        return;
    }

    handleCategoryRequest(url, method, null, {
        successMessage: 'Category activated successfully',
        errorMessage: 'Failed to activate category',
        redirect: null,
        onSuccess: () => {
            if (window.categoryDashboard && window.categoryDashboard.fetchCategories) {
                window.categoryDashboard.fetchCategories();
            } else {
                window.location.reload();
            }
        },
        ...options
    });
}

/**
 * 設置分類不可用
 * @param {number} categoryId 分類ID
 * @param {Object} options 選項
 */
function setCategoryUnavailable(categoryId, options = {}) {
    const url = (options.url || window.unavailableCategoryUrl).replace(':id', categoryId);
    const method = 'PATCH';

    if (!confirm('Are you sure you want to deactivate this category?')) {
        return;
    }

    handleCategoryRequest(url, method, null, {
        successMessage: 'Category deactivated successfully',
        errorMessage: 'Failed to deactivate category',
        redirect: null,
        onSuccess: () => {
            if (window.categoryDashboard && window.categoryDashboard.fetchCategories) {
                window.categoryDashboard.fetchCategories();
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
 * 綁定分類相關事件
 * @param {Object} config 配置選項
 */
function bindCategoryEvents(config = {}) {
    const {
        statusCardSelector = '.status-card',
        removeItemSelector = '.remove-item',
        imageInputSelector = '#category_image',
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

            if (window.removeCategory && typeof window.removeCategory === 'function') {
                window.removeCategory(index);
            }
        });
    }

    // 使用統一的圖片處理模組
    if (typeof window.ImageHandler !== 'undefined') {
        window.ImageHandler.bindImageUploadEvents({
            createImageInputId: 'category_image',
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
            createImageInputId: 'category_image',
            createImageUploadAreaId: 'imageUploadArea',
            updateImageInputId: 'input_image',
            updatePreviewContainerId: 'image-preview'
        });
    } else {
        console.warn('ImageHandler not available, image functionality may not work properly');
    }
}

/**
 * 初始化分類頁面
 * @param {Object} config 配置選項
 */
function initializeCategoryPage(config = {}) {
    const {
        events = {},
        onInit = null
    } = config;

    // 綁定通用事件
    bindCategoryEvents();

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
                    const form = document.getElementById('categoryForm');
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
function getCategoryStatusClass(status) {
    const statusMap = {
        'Available': 'available',
        'Unavailable': 'unavailable'
    };
    return statusMap[status] || 'default';
}

/**
 * 檢查分類是否存在
 * @param {Array} categoryList 分類列表
 * @param {string} categoryName 分類名稱
 * @returns {boolean} 是否存在
 */
function isCategoryExists(categoryList, categoryName) {
    return categoryList.some(item => item.categoryName.toLowerCase() === categoryName.toLowerCase());
}

/**
 * 高亮現有分類
 * @param {string} categoryName 分類名稱
 */
function highlightExistingCategory(categoryName) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.item-value-text').textContent.trim();
        if (value.toLowerCase() === categoryName.toLowerCase()) {
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
