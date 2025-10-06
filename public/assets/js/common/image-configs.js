/**
 * WMS 圖片處理標準配置規範
 *
 * 統一的元素ID命名規範，確保所有模組使用一致的配置
 *
 * @author WMS Team
 * @version 1.0.0
 */

// =============================================================================
// 標準元素ID配置 (Standard Element ID Configuration)
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

/**
 * 為模組綁定圖片處理事件
 * @param {string} moduleName 模組名稱
 */
function bindModuleImageEvents(moduleName) {
    if (typeof window.ImageHandler !== 'undefined') {
        const config = getImageConfig(moduleName);
        window.ImageHandler.bindImageUploadEvents(config);
    } else {
        console.warn(`ImageHandler not loaded for module: ${moduleName}`);
    }
}

// =============================================================================
// 標準HTML結構規範 (Standard HTML Structure)
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
// 導出配置 (Export Configuration)
// =============================================================================

// 將配置添加到全局作用域
window.ImageConfigs = {
    IMAGE_CONFIGS,
    getImageConfig,
    bindModuleImageEvents,
    generateCreateImageHTML,
    generateUpdateImageHTML
};
