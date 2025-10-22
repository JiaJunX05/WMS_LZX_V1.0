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
    // 基本模組配置
    rack: {
        createImageInputId: 'rack_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    zone: {
        createImageInputId: 'zone_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    brand: {
        createImageInputId: 'brand_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    category: {
        createImageInputId: 'category_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    subcategory: {
        createImageInputId: 'subcategory_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    color: {
        createImageInputId: 'color_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    gender: {
        createImageInputId: 'gender_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },

    // 擴展模組配置
    library: {
        createImageInputId: 'library_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    template: {
        createImageInputId: 'template_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    mapping: {
        createImageInputId: 'mapping_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    location: {
        createImageInputId: 'location_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'preview-image',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },

    // 特殊模組配置
    product: {
        coverImageInputId: 'cover_image',
        coverImageUploadAreaId: 'cover-image-area',
        coverPreviewImageId: 'cover-preview',
        coverUploadPlaceholderId: 'cover-upload-placeholder',
        removeCoverBtnId: 'remove-cover-image',
        detailImagesInputId: 'detail_images',
        detailImagesGridId: 'detail-images-grid',
        addDetailImageBtnId: 'add-detail-image',
        updateCoverImageInputId: 'cover_image',
        updateDetailImagesInputId: 'detail_images',
        updateDetailImagesGridId: 'detail-images-grid'
    },
    auth: {
        userImageInputId: 'user_image',
        userImageUploadAreaId: 'user-image-area',
        userPreviewImageId: 'user-preview',
        userUploadPlaceholderId: 'user-upload-placeholder',
        removeUserImageBtnId: 'remove-user-image',
        updateUserImageInputId: 'user_image',
        updateUserPreviewContainerId: 'user-image-preview'
    }
};

/**
 * 獲取模組的圖片處理配置
 * @param {string} moduleName 模組名稱
 * @returns {Object} 配置對象
 */
function getImageConfig(moduleName) {
    return IMAGE_CONFIGS[moduleName] || IMAGE_CONFIGS.rack;
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
        removeBtn.innerHTML = '<i class="bi bi-trash"></i>';
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


// =============================================================================
// 产品图片特殊处理功能 (Product Image Special Functions)
// =============================================================================

/**
 * 处理产品封面图片预览
 * @param {File} file 图片文件
 */
function handleProductCoverImagePreview(file) {
    if (!file.type.startsWith('image/')) {
        if (typeof showAlert === 'function') {
            showAlert('Please select an image file', 'warning');
        } else {
            alert('Please select an image file');
        }
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const coverUploadPlaceholder = document.getElementById('cover-upload-placeholder');
        const coverPreview = document.getElementById('cover-preview');
        const removeCoverBtn = document.getElementById('remove-cover-image');

        // 隐藏上传提示
        if (coverUploadPlaceholder) {
            coverUploadPlaceholder.classList.add('d-none');
        }

        // 显示图片预览
        if (coverPreview) {
            coverPreview.src = e.target.result;
            coverPreview.classList.remove('d-none');
        }

        // 显示移除按钮
        if (removeCoverBtn) {
            removeCoverBtn.classList.remove('d-none');
        }

        // 显示成功提示
        if (typeof showAlert === 'function') {
            showAlert('Cover image added successfully', 'success');
        }
    };
    reader.readAsDataURL(file);
}

/**
 * 移除产品封面图片
 */
function removeProductCoverImage() {
    if (!confirm('Are you sure you want to remove this cover image?')) {
        return;
    }

    const coverImageInput = document.getElementById('cover_image');
    const coverPreview = document.getElementById('cover-preview');
    const removeCoverBtn = document.getElementById('remove-cover-image');
    const coverUploadPlaceholder = document.getElementById('cover-upload-placeholder');

    // 重置封面图片
    if (coverImageInput) coverImageInput.value = '';
    if (coverPreview) {
        coverPreview.src = '';
        coverPreview.classList.add('d-none');
    }
    if (removeCoverBtn) removeCoverBtn.classList.add('d-none');
    if (coverUploadPlaceholder) coverUploadPlaceholder.classList.remove('d-none');

    if (typeof showAlert === 'function') {
        showAlert('Cover image removed successfully', 'success');
    }
}

/**
 * 处理产品详细图片预览
 * @param {File} file 图片文件
 */
function handleProductDetailImagePreview(file) {
    if (!file.type.startsWith('image/')) {
        if (typeof showAlert === 'function') {
            showAlert('Please select an image file', 'warning');
        } else {
            alert('Please select an image file');
        }
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        // 创建图片项目
        const imageItem = document.createElement('div');
        imageItem.className = 'detail-image-item';

        // 创建图片元素
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = 'Detail Image';

        // 创建移除按钮
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="bi bi-trash"></i>';

        // 添加点击事件
        removeBtn.addEventListener('click', function() {
            removeProductDetailImage(this);
        });

        // 组装元素
        imageItem.appendChild(img);
        imageItem.appendChild(removeBtn);

        // 添加到网格中
        const detailImagesGrid = document.getElementById('detail-images-grid');
        if (detailImagesGrid) {
            detailImagesGrid.appendChild(imageItem);
            updateProductAddButtonPosition();

            // 显示成功提示
            if (typeof showAlert === 'function') {
                showAlert('Detail image added successfully', 'success');
            }
        }
    };
    reader.readAsDataURL(file);
}

/**
 * 移除产品详细图片
 * @param {HTMLElement} button 移除按钮元素
 */
function removeProductDetailImage(button) {
    if (!confirm('Are you sure you want to remove this detail image?')) {
        return;
    }

    const imageItem = button.closest('.detail-image-item');
    if (imageItem) {
        imageItem.remove();
        updateProductAddButtonPosition();

        if (typeof showAlert === 'function') {
            showAlert('Detail image removed successfully', 'success');
        }
    }
}

/**
 * 更新产品添加按钮位置
 */
function updateProductAddButtonPosition() {
    const detailImagesGrid = document.getElementById('detail-images-grid');
    const addDetailImageBtn = document.getElementById('add-detail-image');

    if (detailImagesGrid && addDetailImageBtn) {
        const imageItems = detailImagesGrid.querySelectorAll('.detail-image-item');
        const container = detailImagesGrid.parentNode;

        if (imageItems.length === 0) {
            resetProductAddButtonToOriginalState();
        } else {
            if (detailImagesGrid.contains(addDetailImageBtn)) {
                detailImagesGrid.removeChild(addDetailImageBtn);
            }
            if (container && !container.contains(addDetailImageBtn)) {
                container.appendChild(addDetailImageBtn);
            }
        }
    }
}

/**
 * 重置产品添加按钮到原始状态
 */
function resetProductAddButtonToOriginalState() {
    const addDetailImageBtn = document.getElementById('add-detail-image');

    if (addDetailImageBtn) {
        addDetailImageBtn.style.display = '';
        addDetailImageBtn.style.position = '';
        addDetailImageBtn.style.top = '';
        addDetailImageBtn.style.left = '';
        addDetailImageBtn.style.transform = '';
        addDetailImageBtn.style.margin = '';

        const container = document.querySelector('.detail-images-container');
        if (container && !container.contains(addDetailImageBtn)) {
            container.appendChild(addDetailImageBtn);
        }
    }
}

/**
 * 绑定产品图片事件
 */
function bindProductImageEvents() {
    // 封面图片事件
    const coverImageArea = document.getElementById('cover-image-area');
    const coverImageInput = document.getElementById('cover_image');
    const removeCoverBtn = document.getElementById('remove-cover-image');

    if (coverImageArea && coverImageInput) {
        coverImageArea.addEventListener('click', function() {
            coverImageInput.click();
        });

        coverImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleProductCoverImagePreview(file);
            }
        });

        if (removeCoverBtn) {
            removeCoverBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                removeProductCoverImage();
            });
        }

        // 拖拽上传
        setupProductDragAndDrop();
    }

    // 详细图片事件
    const addDetailImageBtn = document.getElementById('add-detail-image');
    const detailImagesInput = document.getElementById('detail_images');

    if (addDetailImageBtn && detailImagesInput) {
        addDetailImageBtn.addEventListener('click', function() {
            detailImagesInput.click();
        });

        detailImagesInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                handleProductDetailImagePreview(file);
            });
            e.target.value = '';
        });
    }
}

/**
 * 设置产品拖拽上传
 */
function setupProductDragAndDrop() {
    const coverImageArea = document.getElementById('cover-image-area');

    if (!coverImageArea) return;

    coverImageArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#696cff';
        this.style.backgroundColor = '#f0f0ff';
    });

    coverImageArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '#d9dee3';
        this.style.backgroundColor = '#f8f9fa';
    });

    coverImageArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#d9dee3';
        this.style.backgroundColor = '#f8f9fa';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const coverImageInput = document.getElementById('cover_image');
            if (coverImageInput) {
                coverImageInput.files = files;
                handleProductCoverImagePreview(files[0]);
            }
        }
    });
}

// =============================================================================
// 用戶圖片特殊處理功能 (User Image Special Functions)
// =============================================================================

/**
 * 處理用戶頭像預覽
 * @param {File} file 圖片文件
 */
function handleUserImagePreview(file) {
    if (!file.type.startsWith('image/')) {
        if (typeof showAlert === 'function') {
            showAlert('Please select an image file', 'warning');
        } else {
            alert('Please select an image file');
        }
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const userUploadPlaceholder = document.getElementById('user-upload-placeholder');
        const userPreview = document.getElementById('user-preview');
        const removeUserImageBtn = document.getElementById('remove-user-image');

        // 隱藏上傳提示
        if (userUploadPlaceholder) {
            userUploadPlaceholder.classList.add('d-none');
        }

        // 顯示圖片預覽
        if (userPreview) {
            userPreview.src = e.target.result;
            userPreview.classList.remove('d-none');
        }

        // 顯示移除按鈕
        if (removeUserImageBtn) {
            removeUserImageBtn.classList.remove('d-none');
        }

        // 顯示成功提示
        if (typeof showAlert === 'function') {
            showAlert('Profile image added successfully', 'success');
        }
    };
    reader.readAsDataURL(file);
}

/**
 * 移除用戶頭像
 */
function removeUserImage() {
    if (!confirm('Are you sure you want to remove this profile image?')) {
        return;
    }

    const userImageInput = document.getElementById('user_image');
    const userPreview = document.getElementById('user-preview');
    const removeUserImageBtn = document.getElementById('remove-user-image');
    const userUploadPlaceholder = document.getElementById('user-upload-placeholder');

    // 重置用戶圖片
    if (userImageInput) userImageInput.value = '';
    if (userPreview) {
        userPreview.src = '';
        userPreview.classList.add('d-none');
    }
    if (removeUserImageBtn) removeUserImageBtn.classList.add('d-none');
    if (userUploadPlaceholder) userUploadPlaceholder.classList.remove('d-none');

    // 如果是更新页面，添加 remove_image 字段
    const form = document.querySelector('form[action*="update"]');
    if (form) {
        let removeImageInput = form.querySelector('input[name="remove_image"]');
        if (!removeImageInput) {
            removeImageInput = document.createElement('input');
            removeImageInput.type = 'hidden';
            removeImageInput.name = 'remove_image';
            form.appendChild(removeImageInput);
        }
        removeImageInput.value = '1';
    }

    if (typeof showAlert === 'function') {
        showAlert('Profile image removed successfully', 'success');
    }
}

/**
 * 綁定用戶圖片事件
 */
function bindUserImageEvents() {
    // 用戶頭像事件 - 使用 auth 配置中的 ID
    const userImageArea = document.getElementById('user-image-area');
    const userImageInput = document.getElementById('user_image');
    const removeUserImageBtn = document.getElementById('remove-user-image');

    if (userImageArea && userImageInput) {
        userImageArea.addEventListener('click', function() {
            userImageInput.click();
        });

        userImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleUserImagePreview(file);
            }
        });

        if (removeUserImageBtn) {
            removeUserImageBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                removeUserImage();
            });
        }

        // 拖拽上傳
        setupUserDragAndDrop();
    }
}

/**
 * 設置用戶拖拽上傳
 */
function setupUserDragAndDrop() {
    const userImageArea = document.getElementById('user-image-area');

    if (!userImageArea) return;

    userImageArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#696cff';
        this.style.backgroundColor = '#f0f0ff';
    });

    userImageArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '#d9dee3';
        this.style.backgroundColor = '#f8f9fa';
    });

    userImageArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#d9dee3';
        this.style.backgroundColor = '#f8f9fa';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const userImageInput = document.getElementById('user_image');
            if (userImageInput) {
                userImageInput.files = files;
                handleUserImagePreview(files[0]);
            }
        }
    });
}


// =============================================================================
// 核心圖片處理功能 (Core Image Processing Functions)
// =============================================================================

/**
 * 處理更新頁面圖片預覽（統一版本）
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
        const removeImageBtn = document.getElementById('removeImage');

        if (previewContainer) {
            previewContainer.innerHTML = `
                <img src="${e.target.result}" alt="Preview" id="preview-image"
                     class="preview-image">
                <div class="image-remove-btn" title="Remove image">
                    <i class="bi bi-trash"></i>
                </div>
            `;

            // 添加刪除按鈕事件
            const removeBtn = previewContainer.querySelector('.image-remove-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    removeUpdateImage();
                });
            }

            // 顯示移除圖片按鈕
            if (removeImageBtn) {
                removeImageBtn.style.display = 'block';
            }
        }
    };
    reader.readAsDataURL(file);
}

/**
 * 更新页面图片移除
 */
function removeUpdateImage() {
    // 确认是否要移除图片
    if (!confirm('Are you sure you want to remove this image?')) {
        return;
    }

    const imageInput = document.getElementById('input_image');
    const previewContainer = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('removeImage');
    const form = document.querySelector('form[action*="update"]');

    if (imageInput && previewContainer && form) {
        // 重置文件输入
        imageInput.value = '';

        // 添加隐藏的 remove_image 参数到表单
        let removeImageInput = form.querySelector('input[name="remove_image"]');
        if (!removeImageInput) {
            removeImageInput = document.createElement('input');
            removeImageInput.type = 'hidden';
            removeImageInput.name = 'remove_image';
            form.appendChild(removeImageInput);
        }
        removeImageInput.value = '1';

        // 恢复原始内容
        const originalContent = previewContainer.getAttribute('data-original-content');
        if (originalContent) {
            previewContainer.innerHTML = originalContent;
        } else {
            // 如果没有原始内容，显示默认状态
            previewContainer.innerHTML = `
                <div class="text-center text-muted">
                    <i class="bi bi-image fs-1 mb-3 d-block"></i>
                    <p class="mb-0">No image uploaded</p>
                    <small>Upload an image to see preview</small>
                </div>
            `;
        }

        // 隐藏移除图片按钮
        if (removeImageBtn) {
            removeImageBtn.style.display = 'none';
        }

        showAlert('Image removed successfully', 'success');
    }
}

/**
 * 更新页面移除图片按钮处理
 */
function handleRemoveImageButton() {
    // 确认是否要移除图片
    if (!confirm('Are you sure you want to remove this image?')) {
        return;
    }

    const imageInput = document.getElementById('input_image');
    const previewContainer = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('removeImage');
    const form = document.querySelector('form[action*="update"]');

    if (imageInput && previewContainer && form) {
        // 重置文件输入
        imageInput.value = '';

        // 添加隐藏的 remove_image 参数到表单
        let removeImageInput = form.querySelector('input[name="remove_image"]');
        if (!removeImageInput) {
            removeImageInput = document.createElement('input');
            removeImageInput.type = 'hidden';
            removeImageInput.name = 'remove_image';
            form.appendChild(removeImageInput);
        }
        removeImageInput.value = '1';

        // 显示默认状态
        previewContainer.innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-image fs-1 mb-3 d-block"></i>
                <p class="mb-0">No image uploaded</p>
                <small>Upload an image to see preview</small>
            </div>
        `;

        // 更新 data-original-content 属性
        previewContainer.setAttribute('data-original-content', previewContainer.innerHTML);

        // 隐藏移除图片按钮
        if (removeImageBtn) {
            removeImageBtn.style.display = 'none';
        }

        showAlert('Image removed successfully', 'success');
    }
}

/**
 * Create 页面重置图片（不显示消息）
 * @param {string} moduleName 模块名称
 */
function resetImageWithoutMessage(moduleName) {
    console.log('resetImageWithoutMessage called for:', moduleName);
    if (typeof window.ImageSystem !== 'undefined' && window.ImageSystem.resetImage) {
        console.log('Calling window.ImageSystem.resetImage');
        window.ImageSystem.resetImage('imageUploadArea', {
            showMessage: false,
            imageInputId: `${moduleName}_image`,
            previewImageId: 'preview-image',
            previewIconId: 'preview-icon',
            imageUploadContentId: 'imageUploadContent'
        });
    } else {
        console.log('window.ImageSystem.resetImage not available');
    }
}

// =============================================================================
// 導出函數 (Export Functions)
// =============================================================================

// 主要圖片系統導出
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

// 向後兼容的函數別名
window.ImageHandler = window.ImageSystem;
window.ImageConfigs = window.ImageSystem;

// 產品圖片處理函數
window.handleProductCoverImagePreview = handleProductCoverImagePreview;
window.removeProductCoverImage = removeProductCoverImage;
window.handleProductDetailImagePreview = handleProductDetailImagePreview;
window.removeProductDetailImage = removeProductDetailImage;
window.updateProductAddButtonPosition = updateProductAddButtonPosition;
window.resetProductAddButtonToOriginalState = resetProductAddButtonToOriginalState;
window.bindProductImageEvents = bindProductImageEvents;
window.setupProductDragAndDrop = setupProductDragAndDrop;

// 用戶圖片處理函數
window.handleUserImagePreview = handleUserImagePreview;
window.removeUserImage = removeUserImage;
window.bindUserImageEvents = bindUserImageEvents;
window.setupUserDragAndDrop = setupUserDragAndDrop;

// 通用更新頁面圖片處理函數
window.handleUpdateImagePreview = handleUpdateImagePreview;
window.removeUpdateImage = removeUpdateImage;
window.handleRemoveImageButton = handleRemoveImageButton;
window.resetImageWithoutMessage = resetImageWithoutMessage;

// 向後兼容的函數別名
window.previewImage = showImagePreview;
window.handleImagePreview = handleCreateImagePreview;
window.previewUploadedImage = handleUpdateImagePreview;
