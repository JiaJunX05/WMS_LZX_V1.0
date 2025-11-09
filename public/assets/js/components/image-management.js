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
 * @version 3.0.0
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
        createPreviewImageId: 'img-preview',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    zone: {
        createImageInputId: 'zone_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'img-preview',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    brand: {
        createImageInputId: 'brand_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'img-preview',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    category: {
        createImageInputId: 'category_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'img-preview',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    subcategory: {
        createImageInputId: 'subcategory_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'img-preview',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    color: {
        createImageInputId: 'color_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'img-preview',
        createPreviewIconId: 'preview-icon',
        createImageUploadContentId: 'imageUploadContent',
        updateImageInputId: 'input_image',
        updatePreviewContainerId: 'image-preview'
    },
    gender: {
        createImageInputId: 'gender_image',
        createImageUploadAreaId: 'imageUploadArea',
        createPreviewImageId: 'img-preview',
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
 * 統一的圖片預覽處理函數（支持 Create 和 Update 模式）
 * @param {Event} event 文件選擇事件
 * @param {Object} options 配置選項
 */
function handleImagePreview(event, options = {}) {
    const {
        // Create 模式配置
        imageInputId = 'image_input',
        previewImageId = 'img-preview',
        previewIconId = 'preview-icon',
        imageUploadAreaId = 'imageUploadArea',
        imageUploadContentId = 'imageUploadContent',
        // Update 模式配置
        previewContainerId = null,
        // 模式判斷：如果提供了 previewContainerId，則為 Update 模式
        mode = previewContainerId ? 'update' : 'create'
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
        if (mode === 'update' && previewContainerId) {
            // Update 模式：使用 previewContainer
            const previewContainer = document.getElementById(previewContainerId);
            const removeImageBtn = document.getElementById('removeImage');

            if (previewContainer) {
                // 保存原始内容（如果有）
                const originalContent = previewContainer.getAttribute('data-original-content') || previewContainer.innerHTML;
                if (!previewContainer.getAttribute('data-original-content')) {
                    previewContainer.setAttribute('data-original-content', originalContent);
                }

                // 检查是否在 updateZoneModal 中，使用正确的图片 ID
                const isInUpdateModal = previewContainer.closest('#updateZoneModal');
                const previewImageId = isInUpdateModal ? 'preview-image' : 'img-preview';

                // 先保存 imageUploadContent 和 removeImageBtn 的引用（如果存在）
                const imageUploadContent = isInUpdateModal ? document.getElementById('imageUploadContent') : null;
                const staticRemoveBtn = isInUpdateModal ? document.getElementById('removeImage') : null;

                // 保存原始 HTML 结构（如果还没有保存）
                if (!previewContainer.getAttribute('data-original-content')) {
                    const originalHTML = previewContainer.innerHTML;
                    previewContainer.setAttribute('data-original-content', originalHTML);
                }

                // 替换 previewContainer 的内容为图片（但保留 removeImage 按钮在容器外部）
                // 注意：removeImage 按钮在 previewContainer 内部，所以会被删除
                // 我们需要在替换后重新添加按钮
                previewContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" id="${previewImageId}"
                         class="img-preview w-100"
                         style="height: auto; max-height: 200px; object-fit: contain;">
                `;

                // 隐藏 imageUploadContent（如果存在且没有被删除）
                if (imageUploadContent && isInUpdateModal && document.body.contains(imageUploadContent)) {
                    imageUploadContent.classList.add('d-none');
                    imageUploadContent.style.display = 'none';
                }

                // 在 Update Zone Modal 中，显示静态移除按钮并绑定事件
                if (isInUpdateModal) {
                    // 重新获取 removeImage 按钮（可能被 innerHTML 替换了）
                    let removeBtn = previewContainer.querySelector('#removeImage');

                    // 如果按钮不存在，创建一个新的
                    if (!removeBtn) {
                        removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.className = 'img-remove-btn';
                        removeBtn.id = 'removeImage';
                        removeBtn.title = 'Remove image';
                        removeBtn.innerHTML = '<i class="bi bi-trash"></i>';
                        previewContainer.appendChild(removeBtn);
                    }

                    // 重新绑定事件（因为按钮可能被 innerHTML 替换导致事件丢失）
                    // 先克隆按钮移除旧事件
                    const newRemoveBtn = removeBtn.cloneNode(true);
                    removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);
                    removeBtn = newRemoveBtn;

                    // 绑定新事件
                    removeBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();

                        if (!confirm('Are you sure you want to remove this image?')) {
                            return;
                        }

                        const modal = document.getElementById('updateZoneModal');
                        const imageInput = modal?.querySelector('#input_image');
                        const previewContainer = modal?.querySelector('#image-preview');
                        const removeImageInput = modal?.querySelector('#remove_image');

                        if (imageInput && previewContainer) {
                            // 重置文件输入
                            imageInput.value = '';

                            // 设置 remove_image 标记
                            if (removeImageInput) {
                                removeImageInput.value = '1';
                            }

                            // 恢复占位符（显示 imageUploadContent，隐藏图片）
                            const originalContent = previewContainer.getAttribute('data-original-content');
                            if (originalContent) {
                                previewContainer.innerHTML = originalContent;
                            }

                            // 隐藏 remove 按钮
                            const btn = previewContainer.querySelector('#removeImage');
                            if (btn) {
                                btn.classList.add('d-none');
                            }

                            // 显示成功提示
                            if (typeof window.showAlert === 'function') {
                                window.showAlert('Image removed successfully', 'success');
                            }
                        }
                    });

                    // 显示按钮
                    removeBtn.classList.remove('d-none');
                    removeBtn.style.display = 'block';
                } else if (!isInUpdateModal) {
                    // 在普通 Update 页面中，创建动态移除按钮
                    const removeBtn = document.createElement('div');
                    removeBtn.className = 'img-remove-btn';
                    removeBtn.title = 'Remove image';
                    removeBtn.innerHTML = '<i class="bi bi-trash"></i>';
                    removeBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        removeImage(previewContainerId, { mode: 'update', imageInputId: imageInputId || 'input_image' });
                    });
                    previewContainer.appendChild(removeBtn);
                }

                // 顯示成功提示
                if (typeof showAlert === 'function') {
                    showAlert('Image uploaded successfully', 'success');
                }
            } else {
                console.warn('Update modal image preview: previewContainer not found', previewContainerId);
            }
        } else {
            // Create 模式：使用 imageUploadArea
            const imageUploadArea = document.getElementById(imageUploadAreaId);
            if (!imageUploadArea) return;

            // 在 imageUploadArea 的父容器（可能是 modal）內查找其他元素
            const container = imageUploadArea.closest('.modal') || imageUploadArea.closest('form') || document;

            // 先查找 previewImage（在 imageUploadArea 内部，与 imageUploadContent 同级）
            let previewImage = imageUploadArea.querySelector(`#${previewImageId}`);
            if (!previewImage) {
                previewImage = container.querySelector(`#${previewImageId}`);
            }

            // 查找 imageUploadContent（在 imageUploadArea 内部）
            let imageUploadContent = imageUploadArea.querySelector(`#${imageUploadContentId}`);
            if (!imageUploadContent) {
                imageUploadContent = container.querySelector(`#${imageUploadContentId}`);
            }

            // 查找 previewIcon（在 imageUploadContent 内部）
            let previewIcon = null;
            if (imageUploadContent) {
                previewIcon = imageUploadContent.querySelector(`#${previewIconId}`);
            }
            if (!previewIcon) {
                previewIcon = container.querySelector(`#${previewIconId}`);
            }

            if (previewImage && imageUploadArea && imageUploadContent) {
                // 显示图片
                previewImage.src = e.target.result;
                previewImage.classList.remove('d-none');
                previewImage.style.display = 'block';

                // 隐藏占位符
                imageUploadContent.style.display = 'none';
                imageUploadContent.classList.add('d-none');

                imageUploadArea.classList.add('has-image');

                // 添加删除按钮（如果还没有）
                addImageRemoveButton(imageUploadAreaId, {
                    imageInputId: imageInputId,
                    previewImageId: previewImageId,
                    previewIconId: previewIconId,
                    imageUploadContentId: imageUploadContentId,
                    mode: 'create'
                });

                // 显示成功提示
                if (typeof showAlert === 'function') {
                    showAlert('Image uploaded successfully', 'success');
                }
            }
        }
    };
    reader.readAsDataURL(file);
}

/**
 * 圖片預覽處理 - 用於 Create 頁面（向後兼容）
 * @param {Event} event 文件選擇事件
 * @param {Object} options 配置選項
 */
function handleCreateImagePreview(event, options = {}) {
    handleImagePreview(event, { ...options, mode: 'create' });
}

/**
 * 圖片預覽處理 - 用於 Update 頁面（向後兼容）
 * @param {Event} event 文件選擇事件
 * @param {Object} options 配置選項
 */
function handleUpdateImagePreview(event, options = {}) {
    handleImagePreview(event, { ...options, mode: 'update' });
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
    const existingRemoveBtn = imageUploadArea?.querySelector('.img-remove-btn');

    if (!existingRemoveBtn && imageUploadArea) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'img-remove-btn';
        removeBtn.innerHTML = '<i class="bi bi-trash"></i>';
        removeBtn.title = 'Remove image';
        removeBtn.addEventListener('click', () => removeImage(imageUploadAreaId, options));
        imageUploadArea.appendChild(removeBtn);
    }
}

/**
 * 統一的圖片移除函數（支持 Create 和 Update 模式）
 * @param {string} containerId 容器ID（Create: imageUploadAreaId, Update: previewContainerId）
 * @param {Object} options 配置選項
 */
function removeImage(containerId = 'imageUploadArea', options = {}) {
    // 先提取 mode，因為它可能影響其他默認值
    const mode = options.mode || (options.previewContainerId ? 'update' : 'create');

    const {
        // Create 模式配置
        imageInputId = 'image_input',
        previewImageId = 'img-preview',
        previewIconId = 'preview-icon',
        imageUploadContentId = 'imageUploadContent',
        // Update 模式配置
        previewContainerId = null,
        showMessage = true,
        confirmRemove = true
    } = options;

    // 確認是否要移除圖片
    if (confirmRemove && !confirm('Are you sure you want to remove this image?')) {
        return;
    }

    if (mode === 'update') {
        // Update 模式處理
        const previewContainer = document.getElementById(previewContainerId || containerId);
        const imageInput = document.getElementById(imageInputId || 'input_image');
        const removeImageBtn = document.getElementById('removeImage');

        // 檢查是否在 modal 中
        const isInModal = previewContainer && previewContainer.closest('#updateZoneModal');
        const form = isInModal
            ? document.getElementById('updateZoneModalForm')
            : document.querySelector('form[action*="update"]');

        if (imageInput && previewContainer) {
            // 重置文件輸入
            imageInput.value = '';

            // 添加隱藏的 remove_image 參數到表單
            let removeImageInput = null;
            if (form) {
                removeImageInput = form.querySelector('input[name="remove_image"]');
                if (!removeImageInput) {
                    removeImageInput = document.createElement('input');
                    removeImageInput.type = 'hidden';
                    removeImageInput.name = 'remove_image';
                    form.appendChild(removeImageInput);
                }
                removeImageInput.value = '1';
            } else if (isInModal) {
                // 如果在 modal 中但找不到 form，直接查找 remove_image input
                removeImageInput = document.getElementById('remove_image');
                if (removeImageInput) {
                    removeImageInput.value = '1';
                }
            }

            // 恢復原始內容
            const originalContent = previewContainer.getAttribute('data-original-content');
            if (originalContent) {
                previewContainer.innerHTML = originalContent;
            } else {
                // 如果沒有原始內容，顯示默認狀態
                const imageUploadContent = document.getElementById('imageUploadContent');
                if (imageUploadContent) {
                    previewContainer.innerHTML = `
                        <div class="upload-placeholder" id="imageUploadContent">
                            <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                            <h5 class="mt-3">Click to upload image</h5>
                            <p class="text-muted">Supports JPG, PNG, GIF formats</p>
                        </div>
                        <img id="preview-image" class="img-preview d-none" alt="Preview">
                        <button type="button" class="img-remove-btn d-none" id="removeImage" title="Remove image">
                            <i class="bi bi-trash"></i>
                        </button>
                    `;
                } else {
                    previewContainer.innerHTML = `
                        <div class="text-center text-muted">
                            <i class="bi bi-image fs-1 mb-3 d-block"></i>
                            <p class="mb-0">No image uploaded</p>
                            <small>Upload an image to see preview</small>
                        </div>
                    `;
                }
            }

            // 隱藏移除圖片按鈕
            if (removeImageBtn) {
                removeImageBtn.classList.add('d-none');
            }

            if (showMessage) {
                if (typeof showAlert === 'function') {
                    showAlert('Image removed successfully', 'success');
                } else {
                    alert('Image removed successfully');
                }
            }
        }
    } else {
        // Create 模式處理
        const imageUploadArea = document.getElementById(containerId);
        if (!imageUploadArea) return;

        // 在 imageUploadArea 的父容器（可能是 modal）內查找其他元素
        const container = imageUploadArea.closest('.modal') || imageUploadArea.closest('form') || document;
        const imageInput = container.querySelector(`#${imageInputId}`);
        const previewImage = container.querySelector(`#${previewImageId}`);
        const previewIcon = container.querySelector(`#${previewIconId}`);
        const imageUploadContent = container.querySelector(`#${imageUploadContentId}`);
        const removeBtn = imageUploadArea.querySelector('.img-remove-btn');

        if (imageInput && previewImage && imageUploadArea && imageUploadContent) {
            // 重置文件輸入
            imageInput.value = '';

            // 隐藏图片，显示占位符
            previewImage.classList.add('d-none');
            previewImage.style.display = 'none';
            imageUploadContent.classList.remove('d-none');
            imageUploadContent.style.display = '';
            imageUploadArea.classList.remove('has-image');

            // 移除删除按钮
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
}

/**
 * 更新頁面圖片移除（向後兼容）
 */
function removeUpdateImage() {
    const previewContainer = document.getElementById('image-preview');
    const containerId = previewContainer ? 'image-preview' : 'imageUploadArea';
    removeImage(containerId, { mode: 'update', imageInputId: 'input_image' });
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
        createPreviewImageId = 'img-preview',
        createPreviewIconId = 'preview-icon',
        createImageUploadContentId = 'imageUploadContent',

        // Update 頁面配置
        updateImageInputId = 'input_image',
        updatePreviewContainerId = 'image-preview',

    // 預覽處理函數（統一使用 handleImagePreview）
    onCreatePreview = handleImagePreview,
    onUpdatePreview = handleImagePreview
    } = options;

    // Create 頁面事件綁定
    const createImageInput = document.getElementById(createImageInputId);
    const createImageUploadArea = document.getElementById(createImageUploadAreaId);

    if (createImageInput && createImageUploadArea) {
        // 檢查是否已經綁定過（通過數據屬性標記）
        const bindKey = `image-events-bound-${createImageInputId}`;
        if (createImageInput.getAttribute(`data-${bindKey}`)) {
            // 已經綁定過，先移除舊的事件監聽器
            // 通過克隆元素來移除所有事件（這是最可靠的方法）
            const areaContent = createImageUploadArea.innerHTML;
            const newArea = createImageUploadArea.cloneNode(true);
            createImageUploadArea.parentNode.replaceChild(newArea, createImageUploadArea);
            newArea.innerHTML = areaContent;

            // 重新獲取元素引用
            const freshImageInput = document.getElementById(createImageInputId);
            const freshImageUploadArea = document.getElementById(createImageUploadAreaId);

            // 綁定新的事件監聽器（使用統一的 handleImagePreview）
            freshImageInput.addEventListener('change', (e) => onCreatePreview(e, {
                imageInputId: createImageInputId,
                imageUploadAreaId: createImageUploadAreaId,
                previewImageId: createPreviewImageId,
                previewIconId: createPreviewIconId,
                imageUploadContentId: createImageUploadContentId,
                mode: 'create'
            }));

            // 點擊上傳區域觸發文件選擇
            freshImageUploadArea.addEventListener('click', function(e) {
                // 只檢查是否點擊了移除按鈕
                if (e.target.closest('.img-remove-btn')) {
                    return; // 不觸發文件選擇
                }
                freshImageInput.click();
            });

            // 設置拖拽上傳
            setupDragAndDrop(createImageUploadAreaId, createImageInputId, onCreatePreview);

            // 標記已綁定
            freshImageInput.setAttribute(`data-${bindKey}`, 'true');
        } else {
            // 首次綁定（使用統一的 handleImagePreview）
            createImageInput.addEventListener('change', (e) => onCreatePreview(e, {
                imageInputId: createImageInputId,
                imageUploadAreaId: createImageUploadAreaId,
                previewImageId: createPreviewImageId,
                previewIconId: createPreviewIconId,
                imageUploadContentId: createImageUploadContentId,
                mode: 'create'
            }));

            // 點擊上傳區域觸發文件選擇
            createImageUploadArea.addEventListener('click', function(e) {
                // 只檢查是否點擊了移除按鈕
                if (e.target.closest('.img-remove-btn')) {
                    return; // 不觸發文件選擇
                }
                createImageInput.click();
            });

            // 設置拖拽上傳
            setupDragAndDrop(createImageUploadAreaId, createImageInputId, onCreatePreview);

            // 標記已綁定
            createImageInput.setAttribute(`data-${bindKey}`, 'true');
        }
    }

    // Update 頁面事件綁定
    const updateImageInput = document.getElementById(updateImageInputId);
    if (updateImageInput) {
        // 檢查是否已經綁定過（通過數據屬性標記）
        const bindKey = `image-events-bound-${updateImageInputId}`;
        if (updateImageInput.getAttribute(`data-${bindKey}`)) {
            // 已經綁定過，先移除舊的事件監聽器
            // 通過克隆元素來移除所有事件
            const newInput = updateImageInput.cloneNode(true);
            updateImageInput.parentNode.replaceChild(newInput, updateImageInput);

            // 重新獲取元素引用
            const freshUpdateInput = document.getElementById(updateImageInputId);

            freshUpdateInput.addEventListener('change', (e) => onUpdatePreview(e, {
                previewContainerId: updatePreviewContainerId,
                imageInputId: updateImageInputId,
                mode: 'update'
            }));

            // 標記已綁定
            freshUpdateInput.setAttribute(`data-${bindKey}`, 'true');
        } else {
            // 首次綁定（使用統一的 handleImagePreview）
            updateImageInput.addEventListener('change', (e) => onUpdatePreview(e, {
                previewContainerId: updatePreviewContainerId,
                imageInputId: updateImageInputId,
                mode: 'update'
            }));

            // 標記已綁定
            updateImageInput.setAttribute(`data-${bindKey}`, 'true');
        }
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
            <div id="${config.createImageUploadAreaId}" class="img-upload-area">
                <div id="${config.createImageUploadContentId}" class="img-upload-content">
                    <img id="${config.createPreviewImageId}" src="" alt="Preview" class="img-preview d-none">
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
        id = 'img-preview'
    } = options;

    return `<img src="${src}" alt="${alt}" id="${id}" class="img-preview" style="${style}">`;
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
        addDetailImageBtn.classList.remove('d-none');
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
            // 不要清空input的值，让文件能够被提交
            // e.target.value = '';
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
            removeImageBtn.classList.add('d-none');
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
            previewImageId: 'img-preview',
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

    // 預覽（統一函數）
    handleImagePreview,
    handleCreateImagePreview, // 向後兼容
    handleUpdateImagePreview, // 向後兼容
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
    generateNoImageHTML,

    // 通用更新頁面圖片處理函數
    handleUpdateImagePreview,
    removeUpdateImage,
    handleRemoveImageButton,
    resetImageWithoutMessage
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

// 向後兼容的函數別名
window.previewImage = showImagePreview;
// 注意：不要覆盖 handleImagePreview，因为它会被其他代码调用
// window.handleImagePreview = handleCreateImagePreview; // 已移除，避免递归调用
window.previewUploadedImage = handleUpdateImagePreview;
