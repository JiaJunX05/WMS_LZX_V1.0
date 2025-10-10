// =============================================================================
// 產品創建頁面 JavaScript (Product Create Page JavaScript)
// 功能：圖片預覽、級聯選擇、SKU生成、狀態選擇、表單驗證
// =============================================================================

console.log('Product Create JS file loaded successfully!');

// =============================================================================
// 全局變量 (Global Variables)
// =============================================================================

let coverImageArea, coverImageInput, coverUploadPlaceholder, coverPreview, removeCoverBtn;
let addDetailImageBtn, detailImagesInput, detailImagesGrid;

// =============================================================================
// 頁面初始化 (Page Initialization)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Starting initialization...');

    try {
        // 初始化頁面
        initializePage();

        // 綁定事件
        bindEvents();

        // 初始化表單
        initializeForm();

        console.log('All initialization completed successfully');
    } catch (error) {
        console.error('Error during initialization:', error);
        alert('JavaScript initialization error: ' + error.message);
    }
});

function initializePage() {
    console.log('Product Create Page Initialized');

    // 設置初始值
    generateSKU();
    generateBarcode();
}

function initializeForm() {
    // 設置表單驗證
    const form = document.getElementById('product-form');
    if (!form) return;

    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
    });
}

// =============================================================================
// 事件綁定 (Event Binding)
// =============================================================================

function bindEvents() {
    // 初始化全局變量
    initializeGlobalVariables();

    // 綁定狀態卡片事件
    bindStatusCardEvents();

    // 綁定封面圖片事件
    bindCoverImageEvents();

    // 綁定詳細圖片事件
    bindDetailImageEvents();

    // 綁定SKU和Barcode生成事件
    bindSKUGenerationEvents();

    // 綁定級聯選擇事件
    bindCascadingSelectEvents();

    // 綁定表單提交事件
    bindFormSubmitEvent();

    // 初始化按鈕位置
    resetAddButtonToOriginalState();
    updateAddButtonPosition();
}

function initializeGlobalVariables() {
    coverImageArea = document.getElementById('cover-image-area');
    coverImageInput = document.getElementById('cover_image');
    coverUploadPlaceholder = document.getElementById('cover-upload-placeholder');
    coverPreview = document.getElementById('cover-preview');
    removeCoverBtn = document.getElementById('remove-cover-image');

    addDetailImageBtn = document.getElementById('add-detail-image');
    detailImagesInput = document.getElementById('detail_images');
    detailImagesGrid = document.getElementById('detail-images-grid');

    console.log('Detail image elements:', {
        addDetailImageBtn,
        detailImagesInput,
        detailImagesGrid
    });
}

function bindStatusCardEvents() {
    document.querySelectorAll('.status-card').forEach(card => {
        card.addEventListener('click', function() {
            const status = this.getAttribute('data-status');
            const radio = this.querySelector('input[type="radio"]');

            // 移除所有卡片的選中狀態
            document.querySelectorAll('.status-card').forEach(c => c.classList.remove('selected'));

            // 添加選中狀態到當前卡片
            this.classList.add('selected');

            // 選中對應的 radio button
            if (radio) {
                radio.checked = true;
            }
        });
    });
}

function bindCoverImageEvents() {
    if (coverImageArea && coverImageInput) {
        // 點擊上傳區域
        coverImageArea.addEventListener('click', function() {
            coverImageInput.click();
        });

        // 文件選擇事件
        coverImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleCoverImagePreview(file);
            }
        });

        // 拖拽上傳事件
        bindDragAndDropEvents();

        // 移除 Cover 圖片
        if (removeCoverBtn) {
            removeCoverBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                removeCoverImage();
            });
        }
    }
}

function bindDragAndDropEvents() {
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
            // 將文件設置到輸入框中
            coverImageInput.files = files;
            handleCoverImagePreview(files[0]);
        }
    });
}

function bindDetailImageEvents() {
    if (addDetailImageBtn && detailImagesInput) {
        // 點擊添加按鈕
        addDetailImageBtn.addEventListener('click', function() {
            detailImagesInput.click();
        });

        // 文件選擇事件
        detailImagesInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                handleDetailImagePreview(file);
            });
            // 清空 input 以便重複選擇
            e.target.value = '';
        });
    }
}

function bindSKUGenerationEvents() {
    const regenerateSkuBtn = document.getElementById('regenerate-sku');
    const regenerateBarcodeBtn = document.getElementById('regenerate-barcode');
    const generateCodesBtn = document.getElementById('generate-codes-btn');

    if (regenerateSkuBtn) {
        regenerateSkuBtn.addEventListener('click', function() {
            generateSKU();
        });
    }

    if (regenerateBarcodeBtn) {
        regenerateBarcodeBtn.addEventListener('click', function() {
            generateBarcode();
        });
    }

    if (generateCodesBtn) {
        generateCodesBtn.addEventListener('click', function() {
            generateSKU();
            generateBarcode();
            showAlert('SKU and Barcode generated successfully!', 'success');
        });
    }
}

function bindCascadingSelectEvents() {
    // 分類選擇事件
    const categorySelect = document.querySelector('select[name="category_id"]');
    const subcategorySelect = document.querySelector('select[name="subcategory_id"]');

    if (categorySelect && subcategorySelect) {
        categorySelect.addEventListener('change', function() {
            const categoryId = this.value;
            updateSubcategoryOptions(categoryId, subcategorySelect);
        });
    }

    // Zone 選擇事件
    const zoneSelect = document.querySelector('select[name="zone_id"]');
    const rackSelect = document.querySelector('select[name="rack_id"]');

    if (zoneSelect && rackSelect) {
        zoneSelect.addEventListener('change', function() {
            const zoneId = this.value;
            updateRackOptions(zoneId, rackSelect);
        });
    }

    // Size 選擇事件 - 基於 Category 和 Subcategory
    const sizeSelect = document.querySelector('select[name="size_id"]');

    if (categorySelect && sizeSelect) {
        categorySelect.addEventListener('change', function() {
            const categoryId = this.value;
            updateSizeOptions(categoryId, null, sizeSelect);
        });
    }

    if (subcategorySelect && sizeSelect) {
        subcategorySelect.addEventListener('change', function() {
            const categoryId = categorySelect.value;
            const subcategoryId = this.value;
            updateSizeOptions(categoryId, subcategoryId, sizeSelect);
        });
    }
}

function bindFormSubmitEvent() {
    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// =============================================================================
// SKU和Barcode生成功能 (SKU & Barcode Generation)
// =============================================================================

function generateSKU() {
    const skuInput = document.getElementById('sku_code');
    if (skuInput) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

        skuInput.value = `PRD-${year}${month}${day}-${random}`;
        console.log('SKU generated:', skuInput.value);
    }
}

function generateBarcode() {
    const barcodeInput = document.getElementById('barcode_number');
    if (barcodeInput) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');

        barcodeInput.value = `PRD${year}${month}${day}${random}`;
        console.log('Barcode generated:', barcodeInput.value);
    }
}

// =============================================================================
// 圖片預覽功能 (Image Preview Functions)
// =============================================================================

function handleCoverImagePreview(file) {
    console.log('handleCoverImagePreview called with file:', file);

    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // 確保文件被設置到輸入框中
    const coverImageInput = document.getElementById('cover_image');
    if (coverImageInput) {
        // 創建一個新的 FileList 來設置文件
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        coverImageInput.files = dataTransfer.files;
        console.log('File set to input:', coverImageInput.files[0]);
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('FileReader loaded, elements:', {
            coverUploadPlaceholder,
            coverPreview,
            removeCoverBtn
        });

        // 隱藏上傳提示
        if (coverUploadPlaceholder) {
            coverUploadPlaceholder.classList.add('d-none');
            console.log('Hidden upload placeholder');
        }

        // 顯示圖片預覽
        if (coverPreview) {
            coverPreview.src = e.target.result;
            coverPreview.classList.remove('d-none');
            console.log('Showed cover preview');
        }

        // 顯示移除按鈕
        if (removeCoverBtn) {
            removeCoverBtn.classList.remove('d-none');
            console.log('Showed remove button');
        }
    };
    reader.readAsDataURL(file);
}

function removeCoverImage() {
    // 重置 Cover 圖片
    coverImageInput.value = '';
    coverPreview.src = '';
    coverPreview.classList.add('d-none');
    removeCoverBtn.classList.add('d-none');
    coverUploadPlaceholder.classList.remove('d-none');
}

function handleDetailImagePreview(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        // 創建圖片項目
        const imageItem = document.createElement('div');
        imageItem.className = 'detail-image-item';

        // 創建圖片元素
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = 'Detail Image';

        // 創建移除按鈕
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="bi bi-trash"></i>';

        // 添加點擊事件
        removeBtn.addEventListener('click', function() {
            removeDetailImage(this);
        });

        // 組裝元素
        imageItem.appendChild(img);
        imageItem.appendChild(removeBtn);

        // 添加到網格中
        detailImagesGrid.appendChild(imageItem);

        // 更新添加按鈕位置
        updateAddButtonPosition();
    };
    reader.readAsDataURL(file);
}

function removeDetailImage(button) {
    // 添加確認對話框
    if (!confirm('Are you sure you want to remove this detail image?')) {
        return;
    }

    const imageItem = button.closest('.detail-image-item');
    if (imageItem) {
        imageItem.remove();
        updateAddButtonPosition();

        // 顯示成功提示
        showAlert('Detail image removed successfully', 'success');
    }
}

// =============================================================================
// 按鈕位置管理 (Button Position Management)
// =============================================================================

function resetAddButtonToOriginalState() {
    const addDetailImageBtn = document.getElementById('add-detail-image');

    if (addDetailImageBtn) {
        // 重置所有可能的樣式修改
        addDetailImageBtn.style.display = '';
        addDetailImageBtn.style.position = '';
        addDetailImageBtn.style.top = '';
        addDetailImageBtn.style.left = '';
        addDetailImageBtn.style.transform = '';
        addDetailImageBtn.style.margin = '';

        // 確保按鈕在正確的容器內
        const container = document.querySelector('.detail-images-container');
        if (container && !container.contains(addDetailImageBtn)) {
            container.appendChild(addDetailImageBtn);
        }

        console.log('Add button reset to original state');
    }
}

function updateAddButtonPosition() {
    const detailImagesGrid = document.getElementById('detail-images-grid');
    const addDetailImageBtn = document.getElementById('add-detail-image');

    if (detailImagesGrid && addDetailImageBtn) {
        // 計算實際的圖片項目數量
        const imageItems = detailImagesGrid.querySelectorAll('.detail-image-item');

        console.log('updateAddButtonPosition called, imageItems.length:', imageItems.length);

        // 確保按鈕始終可見
        addDetailImageBtn.style.display = 'flex';

        // 獲取原始容器（detail-images-container）
        const container = detailImagesGrid.parentNode;

        // 如果沒有圖片，恢復到原始狀態
        if (imageItems.length === 0) {
            console.log('No images, restoring to original state');
            resetAddButtonToOriginalState();
        } else {
            console.log('Has images, keeping button outside grid');
            // 如果有圖片，確保按鈕在網格外
            if (detailImagesGrid.contains(addDetailImageBtn)) {
                detailImagesGrid.removeChild(addDetailImageBtn);
            }
            // 確保按鈕在容器內
            if (container && !container.contains(addDetailImageBtn)) {
                container.appendChild(addDetailImageBtn);
            }
        }
    }
}

// =============================================================================
// 級聯選擇功能 (Cascading Select Functions)
// =============================================================================

function updateSubcategoryOptions(categoryId, subcategorySelect) {
    if (!categoryId) {
        subcategorySelect.disabled = true;
        subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
        return;
    }

    // 重置選擇框
    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
    subcategorySelect.disabled = true;

    // 檢查是否有映射數據
    if (window.mappingsData && window.mappingsData.length > 0) {
        // 根據分類ID篩選映射數據
        const filteredMappings = window.mappingsData.filter(mapping =>
            parseInt(mapping.category_id) === parseInt(categoryId)
        );

        // 獲取唯一的子分類列表
        const uniqueSubCategories = [...new Map(filteredMappings.map(mapping =>
            [mapping.subcategory?.id, mapping.subcategory]
        )).values()];

        if (uniqueSubCategories.length > 0) {
            subcategorySelect.disabled = false;
            // 為每個子分類創建選項
            uniqueSubCategories.forEach(subCategory => {
                if (subCategory && subCategory.id) {
                    const option = document.createElement('option');
                    option.value = subCategory.id;
                    option.textContent = subCategory.subcategory_name || 'Subcategory ' + subCategory.id;
                    subcategorySelect.appendChild(option);
                }
            });
        } else {
            subcategorySelect.innerHTML = '<option value="">No subcategories available</option>';
        }
    } else {
        subcategorySelect.innerHTML = '<option value="">No mapping data available</option>';
    }
}

function updateRackOptions(zoneId, rackSelect) {
    if (!zoneId) {
        rackSelect.disabled = true;
        rackSelect.innerHTML = '<option value="">Select Rack</option>';
        return;
    }

    // 重置選擇框
    rackSelect.innerHTML = '<option value="">Select Rack</option>';
    rackSelect.disabled = true;

    // 檢查是否有位置數據
    if (window.locationsData && window.locationsData.length > 0) {
        // 根據區域ID篩選位置數據，獲取對應的貨架
        const filteredLocations = window.locationsData.filter(location =>
            parseInt(location.zone_id) === parseInt(zoneId) && location.location_status === 'Available'
        );

        if (filteredLocations.length > 0) {
            rackSelect.disabled = false;
            // 為每個位置創建貨架選項
            filteredLocations.forEach(location => {
                if (location.rack && location.rack.id) {
                    const option = document.createElement('option');
                    option.value = location.rack.id;
                    option.textContent = location.rack.rack_number || 'Rack ' + location.rack.id;
                    rackSelect.appendChild(option);
                }
            });
        } else {
            rackSelect.innerHTML = '<option value="">No racks available</option>';
        }
    } else {
        rackSelect.innerHTML = '<option value="">No location data available</option>';
    }
}

function updateSizeOptions(categoryId, subcategoryId, sizeSelect) {
    if (!categoryId) {
        sizeSelect.disabled = true;
        sizeSelect.innerHTML = '<option value="">Select Size</option>';
        return;
    }

    // 重置選擇框
    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    sizeSelect.disabled = true;

    // 檢查是否有尺寸數據
    if (window.sizesData && window.sizesData.length > 0) {
        // 根據分類ID篩選尺寸數據
        let filteredSizes = window.sizesData.filter(size =>
            parseInt(size.category_id) === parseInt(categoryId) && size.size_status === 'Available'
        );

        // SizeLibrary 沒有 subcategory_id 字段，所以不需要進一步篩選

        if (filteredSizes.length > 0) {
            sizeSelect.disabled = false;
            // 為每個尺寸創建選項
            filteredSizes.forEach(size => {
                if (size && size.id) {
                    const option = document.createElement('option');
                    option.value = size.id;
                    option.textContent = size.size_value || 'Size ' + size.id; // 使用 size_value 而不是 size_name
                    sizeSelect.appendChild(option);
                }
            });
        } else {
            sizeSelect.innerHTML = '<option value="">No sizes available</option>';
        }
    } else {
        sizeSelect.innerHTML = '<option value="">No size data available</option>';
    }
}

// =============================================================================
// 表單驗證功能 (Form Validation)
// =============================================================================

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();

    if (field.hasAttribute('required') && !value) {
        field.classList.add('is-invalid');
        showFieldError(field, 'This field is required');
                } else {
        field.classList.remove('is-invalid');
        hideFieldError(field);
    }
}

function showFieldError(field, message) {
    let errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function hideFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// =============================================================================
// 表單提交處理 (Form Submit Handler)
// =============================================================================

function handleFormSubmit(e) {
    console.log('Form submitting...');

    // 阻止默認提交行為，使用 AJAX 提交
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // 顯示載入狀態
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-spinner-border spinner-border-sm me-2"></i>Creating...';
    submitBtn.disabled = true;

    // 創建 FormData
    const formData = new FormData(form);

    // 發送 AJAX 請求
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        // 檢查響應類型
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);

        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            // 如果不是 JSON，讀取為文本
            return response.text().then(text => {
                console.error('Expected JSON but got:', text.substring(0, 200));
                throw new Error('Server returned HTML instead of JSON. Check if AJAX request is properly detected.');
            });
        }
    })
    .then(data => {
        // 恢復按鈕狀態
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (data.success) {
            showAlert(data.message, 'success');
            // 延遲跳轉
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 1500);
    } else {
            showAlert(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // 恢復按鈕狀態
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showAlert('An error occurred while creating the product', 'error');
    });
}

// =============================================================================
// 注意事項 (Notes)
// =============================================================================

// 移除重複的 showAlert 函數，使用 alert-system.js 中的統一函數
