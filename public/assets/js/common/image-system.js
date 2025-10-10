/**
 * 統一圖片處理系統
 * 整合圖片處理功能和配置管理
 *
 * 功能模塊：
 * - 圖片上傳驗證
 * - 圖片預覽（Create、Update、Dashboard）
 * - 圖片刪除和重置
 * - 拖拽上傳支持
 * - 模組配置管理
 * - 標準HTML結構生成
 *
 * @author WMS Team
 * @version 1.0.0
 */

// =============================================================================
// 模組配置管理 (Module Configuration Management)
// =============================================================================

/**
 * 各模組的標準圖片處理配置
 */
const IMAGE_CONFIGS = {
    // 貨架管理 (Rack Management)
    rack: {
        createImageInputId: 'rack_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },

    // 區域管理 (Zone Management)
    zone: {
        createImageInputId: 'zone_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },

    // 品牌管理 (Brand Management)
    brand: {
        createImageInputId: 'brand_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },

    // 分類管理 (Category Management)
    category: {
        createImageInputId: 'category_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },

    // 子分類管理 (Subcategory Management)
    subcategory: {
        createImageInputId: 'subcategory_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },

    // 顏色管理 (Color Management)
    color: {
        createImageInputId: 'color_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },

    // 性別管理 (Gender Management)
    gender: {
        createImageInputId: 'gender_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },

    // 尺碼庫管理 (Library Management)
    library: {
        createImageInputId: 'library_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },

    // 模板管理 (Template Management)
    template: {
        createImageInputId: 'template_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },

    // 映射管理 (Mapping Management)
    mapping: {
        createImageInputId: 'mapping_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },

    // 位置管理 (Location Management)
    location: {
        createImageInputId: 'location_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    }
};

/**
 * 獲取模組的圖片處理配置
 * @param {string} moduleName 模組名稱
 * @returns {Object} 配置對象
 */
function getImageConfig(moduleName) {
    return IMAGE_CONFIGS[moduleName] || IMAGE_CONFIGS.rack; // 默認使用 rack 配置
}

// =============================================================================
// 圖片驗證功能 (Image Validation)
// =============================================================================

/**
 * 驗證圖片文件
 * @param {File} file 圖片文件
 * @returns {Object} 驗證結果
 */
function validateImageFile(file) {
    const errors = [];

    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
        errors.push('Please select a valid image file');
    }

    // 檢查文件大小 (5MB限制)
    if (file.size > 5 * 1024 * 1024) {
        errors.push('Image size must be less than 5MB');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// =============================================================================
// 圖片預覽功能 (Image Preview)
// =============================================================================

/**
 * 圖片預覽處理 - 用於 Create 頁面
 * @param {Event} event 文件選擇事件
 * @param {Object} options 配置選項
 */
function handleCreateImagePreview(event, options = {}) {
    const {
        imageInputId = 'image_input',
        previewImageId = 'preview-image',
        previewIconId = 'preview-icon',
        imageUploadAreaId = 'imageUploadArea',
        imageUploadContentId = 'imageUploadContent'
    } = options;

    const file = event.target.files[0];
    if (!file) return;

    // 驗證文件
    const validation = validateImageFile(file);
    if (!validation.isValid) {
        if (typeof showAlert === 'function') {
            showAlert(validation.errors.join(', '), 'warning');
        } else {
            alert(validation.errors.join(', '));
        }
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImage = document.getElementById(previewImageId);
        const previewIcon = document.getElementById(previewIconId);
        const imageUploadArea = document.getElementById(imageUploadAreaId);
        const imageUploadContent = document.getElementById(imageUploadContentId);

        if (previewImage && previewIcon && imageUploadArea && imageUploadContent) {
            previewImage.src = e.target.result;
            previewImage.classList.remove('d-none');
            previewIcon.classList.add('d-none');
            imageUploadArea.classList.add('has-image');

            // 添加刪除按鈕
            addImageRemoveButton(imageUploadAreaId, {
                imageInputId: imageInputId,
                previewImageId: previewImageId,
                previewIconId: previewIconId,
                imageUploadContentId: imageUploadContentId
            });
        }
    };
    reader.readAsDataURL(file);
}

/**
 * 圖片預覽處理 - 用於 Update 頁面
 * @param {Event} event 文件選擇事件
 * @param {Object} options 配置選項
 */
function handleUpdateImagePreview(event, options = {}) {
    const {
        previewContainerId = 'image-preview'
    } = options;

    const file = event.target.files[0];
    if (!file) return;

    // 驗證文件
    const validation = validateImageFile(file);
    if (!validation.isValid) {
        if (typeof showAlert === 'function') {
            showAlert(validation.errors.join(', '), 'warning');
        } else {
            alert(validation.errors.join(', '));
        }
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const previewContainer = document.getElementById(previewContainerId);
        if (previewContainer) {
            previewContainer.innerHTML = `
                <img src="${e.target.result}" alt="Preview" id="preview-image"
                     class="img-fluid rounded-3" style="max-width: 100%; max-height: 280px; object-fit: contain;">
            `;
        }
    };
    reader.readAsDataURL(file);
}

/**
 * 圖片預覽 - 用於 Dashboard 頁面的模態框顯示
 * @param {string} src 圖片源路徑
 */
function showImagePreview(src) {
    const previewImageElement = document.getElementById('previewImage');
    const modalElement = document.getElementById('imagePreviewModal');

    if (previewImageElement && modalElement) {
        previewImageElement.src = src;
        new bootstrap.Modal(modalElement).show();
    }
}

// =============================================================================
// 圖片管理功能 (Image Management)
// =============================================================================

/**
 * 添加圖片刪除按鈕
 * @param {string} imageUploadAreaId 上傳區域ID
 */
function addImageRemoveButton(imageUploadAreaId = 'imageUploadArea', options = {}) {
    const imageUploadArea = document.getElementById(imageUploadAreaId);
    const existingRemoveBtn = imageUploadArea?.querySelector('.image-remove-btn');

    if (!existingRemoveBtn && imageUploadArea) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'image-remove-btn';
        removeBtn.innerHTML = '<i class="bi bi-x"></i>';
        removeBtn.title = 'Remove image';
        removeBtn.addEventListener('click', () => removeImage(imageUploadAreaId, options));
        imageUploadArea.appendChild(removeBtn);
    }
}

/**
 * 移除圖片
 * @param {string} imageUploadAreaId 上傳區域ID
 * @param {Object} options 配置選項
 */
function removeImage(imageUploadAreaId = 'imageUploadArea', options = {}) {
    const {
        imageInputId = 'image_input',
        previewImageId = 'preview-image',
        previewIconId = 'preview-icon',
        imageUploadContentId = 'imageUploadContent',
        showMessage = true,
        confirmRemove = true
    } = options;

    // 確認是否要移除圖片
    if (confirmRemove && !confirm('Are you sure you want to remove this image?')) {
        return;
    }

    const imageInput = document.getElementById(imageInputId);
    const previewImage = document.getElementById(previewImageId);
    const previewIcon = document.getElementById(previewIconId);
    const imageUploadArea = document.getElementById(imageUploadAreaId);
    const imageUploadContent = document.getElementById(imageUploadContentId);
    const removeBtn = imageUploadArea?.querySelector('.image-remove-btn');

    if (imageInput && previewImage && previewIcon && imageUploadArea && imageUploadContent) {
        // 重置文件輸入
        imageInput.value = '';

        // 隱藏預覽圖片，顯示上傳圖標
        previewImage.classList.add('d-none');
        previewIcon.classList.remove('d-none');
        imageUploadArea.classList.remove('has-image');

        // 移除刪除按鈕
        if (removeBtn) {
            removeBtn.remove();
        }

        if (showMessage) {
            if (typeof showAlert === 'function') {
                showAlert('Image removed successfully', 'success');
            } else {
                alert('Image removed successfully');
            }
        }
    }
}

/**
 * 重置圖片（不顯示消息）
 * @param {string} imageUploadAreaId 上傳區域ID
 * @param {Object} options 配置選項
 */
function resetImage(imageUploadAreaId = 'imageUploadArea', options = {}) {
    removeImage(imageUploadAreaId, { ...options, showMessage: false, confirmRemove: false });
}

// =============================================================================
// 拖拽上傳功能 (Drag & Drop Upload)
// =============================================================================

/**
 * 設置拖拽上傳支持
 * @param {string} imageUploadAreaId 上傳區域ID
 * @param {string} imageInputId 文件輸入ID
 * @param {Function} previewHandler 預覽處理函數
 */
function setupDragAndDrop(imageUploadAreaId, imageInputId, previewHandler) {
    const imageUploadArea = document.getElementById(imageUploadAreaId);
    const imageInput = document.getElementById(imageInputId);

    if (!imageUploadArea || !imageInput) return;

    // 拖拽進入
    imageUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        imageUploadArea.classList.add('dragover');
    });

    // 拖拽離開
    imageUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        imageUploadArea.classList.remove('dragover');
    });

    // 拖拽放下
    imageUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        imageUploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            imageInput.files = files;
            previewHandler({ target: imageInput });
        }
    });
}

// =============================================================================
// 事件綁定功能 (Event Binding)
// =============================================================================

/**
 * 綁定圖片上傳事件
 * @param {Object} options 配置選項
 */
function bindImageUploadEvents(options = {}) {
    const {
        // Create 頁面配置
        createImageInputId = 'image_input',
        createImageUploadAreaId = 'imageUploadArea',

        // Update 頁面配置
        updateImageInputId = 'input_image',
        updatePreviewContainerId = 'image-preview',

        // 預覽處理函數
        onCreatePreview = handleCreateImagePreview,
        onUpdatePreview = handleUpdateImagePreview
    } = options;

    // Create 頁面事件綁定
    const createImageInput = document.getElementById(createImageInputId);
    const createImageUploadArea = document.getElementById(createImageUploadAreaId);

    if (createImageInput && createImageUploadArea) {
        createImageInput.addEventListener('change', (e) => onCreatePreview(e, {
            imageInputId: createImageInputId,
            imageUploadAreaId: createImageUploadAreaId
        }));

        // 點擊上傳區域觸發文件選擇
        createImageUploadArea.addEventListener('click', function(e) {
            // 只檢查是否點擊了移除按鈕
            if (e.target.closest('.image-remove-btn')) {
                return; // 不觸發文件選擇
            }
            createImageInput.click();
        });

        // 設置拖拽上傳
        setupDragAndDrop(createImageUploadAreaId, createImageInputId, onCreatePreview);
    }

    // Update 頁面事件綁定
    const updateImageInput = document.getElementById(updateImageInputId);
    if (updateImageInput) {
        updateImageInput.addEventListener('change', (e) => onUpdatePreview(e, {
            previewContainerId: updatePreviewContainerId
        }));
    }
}

/**
 * 為模組綁定圖片處理事件
 * @param {string} moduleName 模組名稱
 */
function bindModuleImageEvents(moduleName) {
    const config = getImageConfig(moduleName);
    bindImageUploadEvents(config);
}

// =============================================================================
// HTML結構生成功能 (HTML Structure Generation)
// =============================================================================

/**
 * Create 頁面的標準圖片上傳HTML結構
 * @param {string} moduleName 模組名稱
 * @returns {string} HTML字符串
 */
function generateCreateImageHTML(moduleName) {
    const config = getImageConfig(moduleName);

    return `
        <div class="image-upload-section">
            <div id="${config.createImageUploadAreaId}" class="image-upload-area">
                <div id="${config.createImageUploadContentId}" class="image-upload-content">
                    <img id="${config.createPreviewImageId}" src="" alt="Preview" class="preview-image d-none">
                    <div id="${config.createPreviewIconId}" class="upload-icon">
                        <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                        <p class="mt-2 mb-0">Click or drag to upload image</p>
                        <small class="text-muted">Max 5MB, JPG/PNG/GIF</small>
                    </div>
                </div>
            </div>
            <input type="file" id="${config.createImageInputId}" name="${config.createImageInputId}"
                   accept="image/*" class="d-none">
        </div>
    `;
}

/**
 * Update 頁面的標準圖片預覽HTML結構
 * @param {string} moduleName 模組名稱
 * @param {string} currentImageSrc 當前圖片源（可選）
 * @returns {string} HTML字符串
 */
function generateUpdateImageHTML(moduleName, currentImageSrc = null) {
    const config = getImageConfig(moduleName);

    if (currentImageSrc) {
        return `
            <div id="${config.updatePreviewContainerId}" class="preview-container">
                <img src="${currentImageSrc}" alt="Current Image"
                     class="img-fluid rounded-3" style="max-width: 100%; max-height: 280px; object-fit: contain;">
            </div>
            <input type="file" id="${config.updateImageInputId}" name="${config.updateImageInputId}"
                   accept="image/*" class="form-control mt-2">
        `;
    } else {
        return `
            <div id="${config.updatePreviewContainerId}" class="preview-container"
                 data-original-content='<div class="text-center text-muted"><i class="bi bi-image fs-1 mb-3 d-block"></i><p class="mb-0">No image uploaded</p><small>Upload an image to see preview</small></div>'>
                <div class="text-center text-muted">
                    <i class="bi bi-image fs-1 mb-3 d-block"></i>
                    <p class="mb-0">No image uploaded</p>
                    <small>Upload an image to see preview</small>
                </div>
            </div>
            <input type="file" id="${config.updateImageInputId}" name="${config.updateImageInputId}"
                   accept="image/*" class="form-control mt-2">
        `;
    }
}

// =============================================================================
// 工具函數 (Utility Functions)
// =============================================================================

/**
 * 生成圖片預覽HTML
 * @param {string} src 圖片源
 * @param {Object} options 配置選項
 * @returns {string} HTML字符串
 */
function generateImagePreviewHTML(src, options = {}) {
    const {
        alt = 'Preview',
        className = 'img-fluid rounded-3',
        style = 'max-width: 100%; max-height: 280px; object-fit: contain;',
        id = 'preview-image'
    } = options;

    return `<img src="${src}" alt="${alt}" id="${id}" class="${className}" style="${style}">`;
}

/**
 * 生成無圖片顯示HTML
 * @param {Object} options 配置選項
 * @returns {string} HTML字符串
 */
function generateNoImageHTML(options = {}) {
    const {
        iconClass = 'bi bi-image fs-1 mb-3 d-block',
        title = 'No image uploaded',
        subtitle = 'Upload an image to see preview',
        containerClass = 'text-center text-muted'
    } = options;

    return `
        <div class="${containerClass}">
            <i class="${iconClass}"></i>
            <p class="mb-0">${title}</p>
            <small>${subtitle}</small>
        </div>
    `;
}

// =============================================================================
// 導出函數 (Export Functions)
// =============================================================================

// 將函數添加到全局作用域，以便其他文件使用
window.ImageSystem = {
    // 配置管理
    IMAGE_CONFIGS,
    getImageConfig,
    bindModuleImageEvents,

    // 驗證
    validateImageFile,

    // 預覽
    handleCreateImagePreview,
    handleUpdateImagePreview,
    showImagePreview,

    // 管理
    addImageRemoveButton,
    removeImage,
    resetImage,

    // 拖拽
    setupDragAndDrop,

    // 事件綁定
    bindImageUploadEvents,

    // HTML生成
    generateCreateImageHTML,
    generateUpdateImageHTML,

    // 工具
    generateImagePreviewHTML,
    generateNoImageHTML
};

// 為了向後兼容，也將主要函數添加到全局作用域
window.ImageHandler = window.ImageSystem;
window.ImageConfigs = window.ImageSystem;

// 向後兼容的函數別名
window.previewImage = showImagePreview;
window.handleImagePreview = handleCreateImagePreview;
window.previewUploadedImage = handleUpdateImagePreview;
