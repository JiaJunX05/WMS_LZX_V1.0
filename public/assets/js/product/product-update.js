// =============================================================================
// 產品更新頁面 JavaScript (Product Update Page JavaScript)
// 功能：圖片預覽、級聯選擇、SKU生成、狀態選擇、現有圖片刪除
// =============================================================================

console.log('Product Update JS file loaded successfully!');

// =============================================================================
// 全局變量 (Global Variables)
// =============================================================================

let selectedFiles = []; // 存儲選中的詳細圖片文件

// =============================================================================
// 頁面初始化 (Page Initialization)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Starting Update page initialization...');

    try {
        // 初始化頁面
        initializePage();

        // 綁定事件
        bindEvents();

        // 初始化表單
        initializeForm();

        // 初始化Update頁面特殊功能
        initializeUpdatePageFeatures();

        console.log('All Update page initialization completed successfully');
    } catch (error) {
        console.error('Error during Update page initialization:', error);
        alert('JavaScript initialization error: ' + error.message);
    }
});

function initializePage() {
    console.log('Product Update Page Initialized');

    // 確保 subcategory 選擇框在頁面載入時被啟用
    setTimeout(() => {
        const subcategorySelect = document.querySelector('select[name="subcategory_id"]');
        const categorySelect = document.querySelector('select[name="category_id"]');

        if (subcategorySelect && categorySelect && categorySelect.value) {
            console.log('Ensuring subcategory is enabled for category:', categorySelect.value);
            if (subcategorySelect.disabled) {
                console.log('Subcategory was disabled, enabling it');
                subcategorySelect.disabled = false;
            }
        }
    }, 100);
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
    // 綁定封面圖片事件
    bindCoverImageEvents();

    // 綁定詳細圖片事件
    bindDetailImageEvents();

    // 綁定級聯選擇事件
    bindCascadingSelectEvents();

    // 綁定SKU和Barcode生成事件
    bindSKUGenerationEvents();

    // 綁定狀態卡片事件
    bindStatusCardEvents();

    // 綁定表單提交事件
    bindFormSubmitEvent();

    // 初始化按鈕位置
    resetAddButtonToOriginalState();
    updateAddButtonPosition();
}

function bindCoverImageEvents() {
    // 獲取封面圖片相關元素
    const coverImageArea = document.getElementById('cover-image-area');
    const coverImageInput = document.getElementById('cover_image');
    const coverUploadPlaceholder = document.getElementById('cover-upload-placeholder');
    const coverPreview = document.getElementById('cover-preview');
    const removeCoverBtn = document.getElementById('remove-cover-image');

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
    const coverImageArea = document.getElementById('cover-image-area');
    const coverImageInput = document.getElementById('cover_image');

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
            coverImageInput.files = files;
            handleCoverImagePreview(files[0]);
        }
    });
}

function bindDetailImageEvents() {
    console.log('initializeDetailImagePreview called');

    // 獲取詳細圖片相關元素
    const addDetailImageBtn = document.getElementById('add-detail-image');
    const detailImagesInput = document.getElementById('detail_images');
    const detailImagesGrid = document.getElementById('detail-images-grid');

    console.log('Detail image elements found:', {
        addDetailImageBtn: !!addDetailImageBtn,
        detailImagesInput: !!detailImagesInput,
        detailImagesGrid: !!detailImagesGrid
    });

    if (addDetailImageBtn && detailImagesInput) {
        console.log('Binding detail image events...');

        // 點擊添加按鈕
        addDetailImageBtn.addEventListener('click', function() {
            console.log('Add detail image button clicked');
            detailImagesInput.click();
        });

        // 文件選擇事件
        detailImagesInput.addEventListener('change', function(e) {
            console.log('Detail images input changed, files:', e.target.files.length);
            const files = Array.from(e.target.files);
            files.forEach(file => {
                console.log('Processing file:', file.name);
                handleDetailImagePreview(file);
            });
            // 不要清空 input，保持文件以便提交
            // e.target.value = '';
        });

        console.log('Detail image events bound successfully');
    } else {
        console.error('Required elements not found for detail image preview');
    }
}

function bindCascadingSelectEvents() {
    console.log('initializeCascadingSelects called');

    // 獲取級聯選擇相關元素
    const zoneSelect = document.querySelector('select[name="zone_id"]');           // 區域選擇框
    const rackSelect = document.querySelector('select[name="rack_id"]');           // 貨架選擇框
    const categorySelect = document.querySelector('select[name="category_id"]');   // 分類選擇框
    const subCategorySelect = document.querySelector('select[name="subcategory_id"]'); // 子分類選擇框
    const sizeSelect = document.querySelector('select[name="size_id"]');           // 尺寸選擇框

    console.log('Elements found:', {
        zoneSelect: !!zoneSelect,
        rackSelect: !!rackSelect,
        categorySelect: !!categorySelect,
        subCategorySelect: !!subCategorySelect,
        sizeSelect: !!sizeSelect
    });

    // 檢查是否是update頁面，如果是則加載現有值
    const isUpdatePage = window.location.pathname.includes('/edit/') || window.location.pathname.includes('/update/');
    console.log('isUpdatePage:', isUpdatePage);

    if (isUpdatePage && rackSelect && subCategorySelect) {
        // Update頁面：獲取當前選中的值並初始化
        const selectedRackId = rackSelect.value;        // 當前選中的貨架ID
        const selectedSubCategoryId = subCategorySelect.value; // 當前選中的子分類ID

        console.log('Initial values:', {
            zoneValue: zoneSelect.value,
            rackValue: selectedRackId,
            categoryValue: categorySelect.value,
            subcategoryValue: selectedSubCategoryId,
            sizeValue: sizeSelect ? sizeSelect.value : 'N/A'
        });

        // 初始化時檢查是否需要禁用 rack 和 subcategory
        if (!zoneSelect.value) {
            resetRackSelect(); // 重置貨架選擇框
        } else {
            loadRacks(zoneSelect.value, selectedRackId); // 加載貨架選項
        }

        if (!categorySelect.value) {
            console.log('No category selected, resetting subcategory and size');
            resetSubCategorySelect(); // 重置子分類選擇框
            resetSizeSelect(); // 重置尺寸選擇框
        } else {
            console.log('Category selected, loading subcategories and sizes');
            loadSubcategories(categorySelect.value, selectedSubCategoryId); // 加載子分類選項
            loadSizes(categorySelect.value, sizeSelect ? sizeSelect.value : null); // 加載尺寸選項
        }
    } else {
        // Create頁面：重置選擇框
        resetRackSelect();
        resetSubCategorySelect();
        resetSizeSelect();
    }

    // 綁定區域選擇變化事件
    if (zoneSelect) {
        zoneSelect.addEventListener('change', function() {
            const zoneId = this.value;
            console.log('Zone changed to:', zoneId);
            if (!zoneId) {
                resetRackSelect(); // 清空區域時重置貨架
                return;
            }
            loadRacks(zoneId); // 根據區域加載貨架
        });
    }

    // 綁定分類選擇變化事件
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const categoryId = this.value;
            console.log('Category changed to:', categoryId);
            if (!categoryId) {
                resetSubCategorySelect(); // 清空分類時重置子分類
                resetSizeSelect(); // 清空分類時重置尺寸
                return;
            }
            loadSubcategories(categoryId); // 根據分類加載子分類
            loadSizes(categoryId); // 根據分類加載尺寸
        });
    }

    // 綁定子分類選擇變化事件（影響尺寸）
    if (subCategorySelect && sizeSelect) {
        subCategorySelect.addEventListener('change', function() {
            const categoryId = categorySelect.value;
            const subcategoryId = this.value;
            console.log('Subcategory changed to:', subcategoryId);
            if (categoryId) {
                loadSizes(categoryId, null); // 重新加載尺寸選項
            }
        });
    }
}

function bindSKUGenerationEvents() {
    // 獲取SKU生成相關元素
    const generateCodesBtn = document.getElementById('generate-codes-btn'); // 生成按鈕
    const skuInput = document.getElementById('sku_code');                    // SKU輸入框
    const barcodeInput = document.getElementById('barcode_number');         // 條形碼輸入框

    if (generateCodesBtn && skuInput && barcodeInput) {
        // 綁定生成按鈕點擊事件
        generateCodesBtn.addEventListener('click', function() {
            generateNewCodes();
        });

        // 當產品信息改變時，自動更新建議
        const categorySelect = document.getElementById('subcategory_id'); // 子分類選擇框
        const brandSelect = document.getElementById('brand_id');           // 品牌選擇框
        const colorSelect = document.getElementById('color_id');           // 顏色選擇框

        // 為每個選擇框綁定變化事件
        [categorySelect, brandSelect, colorSelect].forEach(select => {
            if (select) {
                select.addEventListener('change', function() {
                    // 如果SKU為空，則自動生成新的
                    if (skuInput.value === '') {
                        generateNewCodes();
                    }
                });
            }
        });
    }
}

function bindStatusCardEvents() {
    // 獲取狀態卡片和單選按鈕元素
    const statusCards = document.querySelectorAll('.status-card');                    // 狀態卡片
    const statusRadioInputs = document.querySelectorAll('input[name="product_status"]'); // 狀態單選按鈕

    // 為每個狀態卡片添加點擊事件
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除所有卡片的選中狀態
            statusCards.forEach(c => c.classList.remove('selected'));

            // 添加當前卡片的選中狀態
            this.classList.add('selected');

            // 選中對應的單選按鈕
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });

    // 為單選按鈕添加變化事件
    statusRadioInputs.forEach(radio => {
        radio.addEventListener('change', function() {
            // 移除所有卡片的選中狀態
            statusCards.forEach(c => c.classList.remove('selected'));

            // 添加對應卡片的選中狀態
            const card = this.closest('.status-card');
            if (card) {
                card.classList.add('selected');
            }
        });
    });

    // 初始化選中狀態 - 頁面加載時設置正確的選中狀態
    const checkedRadio = document.querySelector('input[name="product_status"]:checked');
    if (checkedRadio) {
        const card = checkedRadio.closest('.status-card');
        if (card) {
            card.classList.add('selected');
        }
    }
}

function bindFormSubmitEvent() {
    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// =============================================================================
// 圖片預覽功能 (Image Preview Functions)
// =============================================================================

// 處理封面圖片預覽
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
        const coverUploadPlaceholder = document.getElementById('cover-upload-placeholder');
        const coverPreview = document.getElementById('cover-preview');
        const removeCoverBtn = document.getElementById('remove-cover-image');

        // 隱藏上傳提示
        if (coverUploadPlaceholder) {
            coverUploadPlaceholder.classList.add('d-none');
        }

        // 顯示圖片預覽
        if (coverPreview) {
            coverPreview.src = e.target.result;
            coverPreview.classList.remove('d-none');
        }

        // 顯示移除按鈕
        if (removeCoverBtn) {
            removeCoverBtn.classList.remove('d-none');
        }
    };
    reader.readAsDataURL(file);
}

// 移除封面圖片
function removeCoverImage() {
    const coverImageInput = document.getElementById('cover_image');
    const coverPreview = document.getElementById('cover-preview');
    const removeCoverBtn = document.getElementById('remove-cover-image');
    const coverUploadPlaceholder = document.getElementById('cover-upload-placeholder');

    // 重置 Cover 圖片
    coverImageInput.value = '';
    coverPreview.src = '';
    coverPreview.classList.add('d-none');
    removeCoverBtn.classList.add('d-none');
    coverUploadPlaceholder.classList.remove('d-none');
}

// 處理詳細圖片預覽
function handleDetailImagePreview(file) {
    console.log('handleDetailImagePreview called with file:', file.name, file.type);

    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('FileReader loaded, creating image preview...');

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
        const detailImagesGrid = document.getElementById('detail-images-grid');
        if (detailImagesGrid) {
            detailImagesGrid.appendChild(imageItem);
            console.log('Image item added to grid');
        } else {
            console.error('detail-images-grid not found!');
        }

        // 更新添加按鈕位置
        updateAddButtonPosition();
    };
    reader.readAsDataURL(file);
}

// 移除詳細圖片
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
        if (typeof showAlert === 'function') {
            showAlert('Detail image removed successfully', 'success');
        }
    }
}

// =============================================================================
// 按鈕位置管理 (Button Position Management)
// =============================================================================

// 更新添加按鈕位置
function updateAddButtonPosition() {
    const detailImagesGrid = document.getElementById('detail-images-grid');
    const addDetailImageBtn = document.getElementById('add-detail-image');

    if (detailImagesGrid && addDetailImageBtn) {
        // 計算實際的圖片項目數量
        const imageItems = detailImagesGrid.querySelectorAll('.detail-image-item');

        // 確保按鈕始終可見
        addDetailImageBtn.style.display = 'flex';

        // 獲取原始容器（detail-images-container）
        const container = detailImagesGrid.parentNode;

        // 如果沒有圖片，恢復到原始狀態
        if (imageItems.length === 0) {
            resetAddButtonToOriginalState();
        } else {
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

// 重置添加按鈕到原始狀態
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
    }
}

// =============================================================================
// 級聯選擇功能 (Cascading Select Functions)
// =============================================================================

// 加載貨架選項 - 根據區域ID篩選貨架
function loadRacks(zoneId, selectedId = null) {
    const rackSelect = document.querySelector('select[name="rack_id"]');
    if (!rackSelect) return;

    // 重置選擇框
    rackSelect.innerHTML = '<option selected disabled value="">Select a rack</option>';
    rackSelect.disabled = true;

    // 檢查是否有位置數據
    if (window.locationsData && window.locationsData.length > 0) {
        // 根據區域ID篩選位置數據
        const filteredLocations = window.locationsData.filter(location =>
            parseInt(location.zone_id) === parseInt(zoneId)
        );

        // 獲取唯一的貨架列表
        const uniqueRacks = [...new Map(filteredLocations.map(location =>
            [location.rack?.id, location.rack]
        )).values()];

        if (uniqueRacks.length > 0) {
            rackSelect.disabled = false;
            // 為每個貨架創建選項
            uniqueRacks.forEach(rack => {
                if (rack && rack.id) {
                    const option = document.createElement('option');
                    option.value = rack.id;
                    option.text = (rack.rack_number || rack.rack_name || 'Rack ' + rack.id).toUpperCase();

                    // 如果這是當前選中的值，設置為選中
                    if (selectedId && rack.id == selectedId) {
                        option.selected = true;
                    }

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

// 加載子分類選項 - 根據分類ID篩選子分類
function loadSubcategories(categoryId, selectedId = null) {
    console.log('loadSubcategories called with categoryId:', categoryId, 'selectedId:', selectedId);

    const subCategorySelect = document.querySelector('select[name="subcategory_id"]');
    if (!subCategorySelect) {
        console.error('subcategory select not found');
        return;
    }

    // 重置選擇框
    subCategorySelect.innerHTML = '<option selected disabled value="">Select a SubCategory</option>';
    subCategorySelect.disabled = true;

    // 檢查是否有映射數據
    console.log('window.mappingsData:', window.mappingsData);
    if (window.mappingsData && window.mappingsData.length > 0) {
        // 根據分類ID篩選映射數據
        const filteredMappings = window.mappingsData.filter(mapping =>
            parseInt(mapping.category_id) === parseInt(categoryId)
        );

        console.log('filteredMappings for categoryId', categoryId, ':', filteredMappings);

        // 獲取唯一的子分類列表
        const uniqueSubCategories = [...new Map(filteredMappings.map(mapping =>
            [mapping.subcategory?.id, mapping.subcategory]
        )).values()];

        console.log('uniqueSubCategories:', uniqueSubCategories);

        if (uniqueSubCategories.length > 0) {
            subCategorySelect.disabled = false;
            // 為每個子分類創建選項
            uniqueSubCategories.forEach(subCategory => {
                if (subCategory && subCategory.id) {
                    const option = document.createElement('option');
                    option.value = subCategory.id;
                    option.text = (subCategory.subcategory_name || 'Subcategory ' + subCategory.id).toUpperCase();

                    // 如果這是當前選中的值，設置為選中
                    if (selectedId && subCategory.id == selectedId) {
                        option.selected = true;
                    }

                    subCategorySelect.appendChild(option);
                }
            });
            console.log('Subcategories loaded successfully');
        } else {
            console.log('No subcategories found for categoryId:', categoryId);
            subCategorySelect.innerHTML = '<option value="">No subcategories available</option>';
        }
    } else {
        console.log('No mappingsData available');
        subCategorySelect.innerHTML = '<option value="">No mapping data available</option>';
    }
}

// 重置貨架選擇框 - 清空選項並禁用
function resetRackSelect() {
    const rackSelect = document.querySelector('select[name="rack_id"]');
    if (rackSelect) {
        rackSelect.innerHTML = '<option selected disabled value="">Select a rack</option>';
        rackSelect.disabled = true;
    }
}

// 重置子分類選擇框 - 清空選項並禁用
function resetSubCategorySelect() {
    const subCategorySelect = document.querySelector('select[name="subcategory_id"]');
    if (subCategorySelect) {
        subCategorySelect.innerHTML = '<option selected disabled value="">Select a SubCategory</option>';
        subCategorySelect.disabled = true;
    }
}

// 重置尺寸選擇框 - 清空選項並禁用
function resetSizeSelect() {
    const sizeSelect = document.querySelector('select[name="size_id"]');
    if (sizeSelect) {
        sizeSelect.innerHTML = '<option selected disabled value="">Select Size</option>';
        sizeSelect.disabled = true;
    }
}

// 加載尺寸選項 - 根據分類ID篩選尺寸
function loadSizes(categoryId, selectedId = null) {
    console.log('loadSizes called with categoryId:', categoryId, 'selectedId:', selectedId);

    const sizeSelect = document.querySelector('select[name="size_id"]');
    if (!sizeSelect) {
        console.error('size select not found');
        return;
    }

    if (!categoryId) {
        sizeSelect.disabled = true;
        sizeSelect.innerHTML = '<option value="">Select Size</option>';
        return;
    }

    // 重置選擇框
    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    sizeSelect.disabled = true;

    // 檢查是否有尺寸數據
    console.log('window.sizesData:', window.sizesData);
    if (window.sizesData && window.sizesData.length > 0) {
        // 根據分類ID篩選尺寸數據
        const filteredSizes = window.sizesData.filter(size =>
            parseInt(size.category_id) === parseInt(categoryId) && size.size_status === 'Available'
        );

        console.log('filteredSizes for categoryId', categoryId, ':', filteredSizes);

        if (filteredSizes.length > 0) {
            sizeSelect.disabled = false;
            // 為每個尺寸創建選項
            filteredSizes.forEach(size => {
                if (size && size.id) {
                    const option = document.createElement('option');
                    option.value = size.id;
                    option.textContent = size.size_value || 'Size ' + size.id;

                    // 如果這是當前選中的值，設置為選中
                    if (selectedId && size.id == selectedId) {
                        option.selected = true;
                    }

                    sizeSelect.appendChild(option);
                }
            });
            console.log('Sizes loaded successfully');
        } else {
            console.log('No sizes found for categoryId:', categoryId);
            sizeSelect.innerHTML = '<option value="">No sizes available</option>';
        }
    } else {
        console.log('No sizesData available');
        sizeSelect.innerHTML = '<option value="">No size data available</option>';
    }
}

// =============================================================================
// SKU和Barcode生成功能 (SKU & Barcode Generation)
// =============================================================================

// 生成新的SKU和條形碼
function generateNewCodes() {
    // 獲取產品信息選擇框
    const categorySelect = document.getElementById('subcategory_id'); // 子分類
    const brandSelect = document.getElementById('brand_id');           // 品牌
    const colorSelect = document.getElementById('color_id');           // 顏色
    const skuInput = document.getElementById('sku_code');             // SKU輸入框
    const barcodeInput = document.getElementById('barcode_number');   // 條形碼輸入框

    if (!skuInput || !barcodeInput) return;

    // 獲取當前選擇的值
    const categoryId = categorySelect ? categorySelect.value : '';
    const brandId = brandSelect ? brandSelect.value : '';
    const colorId = colorSelect ? colorSelect.value : '';

    // 生成基於當前日期的SKU
    const dateCode = new Date().toISOString().slice(2, 8).replace(/-/g, ''); // 日期代碼
    const randomCode = Math.random().toString(36).substr(2, 4).toUpperCase(); // 隨機代碼
    const sequenceNumber = Math.floor(Math.random() * 9999) + 1;              // 序列號

    let newSKU = '';
    // 如果有完整的產品信息，生成智能SKU
    if (categoryId && brandId && colorId) {
        newSKU = generateSmartSKU(categoryId, brandId, colorId, dateCode);
    } else {
        // 否則生成基礎SKU
        newSKU = `PRD-${dateCode}-${randomCode}-${sequenceNumber.toString().padStart(3, '0')}`;
    }

    // 基於SKU生成條形碼
    const newBarcode = generateBarcodeFromSKU(newSKU);

    // 更新輸入框的值
    skuInput.value = newSKU;
    barcodeInput.value = newBarcode;

    // 添加生成動畫效果
    [skuInput, barcodeInput].forEach(input => {
        input.style.backgroundColor = '#e8f5e8'; // 綠色背景
        setTimeout(() => {
            input.style.backgroundColor = ''; // 恢復原背景
        }, 1000);
    });
}

// 生成智能SKU - 基於產品信息生成更智能的SKU
function generateSmartSKU(categoryId, brandId, colorId, dateCode) {
    const randomCode = Math.random().toString(36).substr(2, 3).toUpperCase(); // 3位隨機碼
    const sequenceNumber = Math.floor(Math.random() * 999) + 1;              // 3位序列號
    return `PRD-${dateCode}-${randomCode}-${sequenceNumber.toString().padStart(3, '0')}`;
}

// 基於SKU生成條形碼號碼 - 確保條形碼長度為13位
function generateBarcodeFromSKU(sku) {
    const baseNumber = sku.replace(/-/g, '');                    // 移除SKU中的連字符
    const timestamp = Date.now().toString().slice(-6);           // 時間戳後6位
    const randomSuffix = Math.floor(Math.random() * 999) + 100; // 3位隨機後綴

    let barcode = baseNumber + timestamp + randomSuffix;

    // 確保條形碼長度為13位
    if (barcode.length > 13) {
        barcode = barcode.substring(0, 13); // 截取前13位
    } else if (barcode.length < 13) {
        barcode = barcode.padStart(13, '0'); // 前面補0到13位
    }

    return barcode;
}

// =============================================================================
// Update頁面特殊功能 (Update Page Features)
// =============================================================================

// 切換圖片刪除狀態（使用 checkbox）
function toggleImageRemoval(button, imageId) {
    const checkbox = document.getElementById(`remove_image_${imageId}`);
    const imageItem = button.closest('.detail-image-item');

    if (!checkbox) {
        console.error('Checkbox not found for image ID:', imageId);
        return;
    }

    // 切換 checkbox 狀態
    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
        // 標記為刪除
        if (!confirm('Are you sure you want to remove this detail image?')) {
            checkbox.checked = false;
            return;
        }

        // 添加視覺標記
        imageItem.style.opacity = '0.5';
        imageItem.style.border = '2px solid #dc3545';
        imageItem.style.backgroundColor = '#f8d7da';

        // 修改按鈕樣式
        button.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i>';
        button.title = 'Click to restore image';
        button.classList.remove('btn-outline-danger');
        button.classList.add('btn-outline-success');

        // 顯示成功消息
        if (typeof showAlert === 'function') {
            showAlert('Detail image marked for removal', 'warning');
        }
    } else {
        // 取消刪除標記
        imageItem.style.opacity = '';
        imageItem.style.border = '';
        imageItem.style.backgroundColor = '';

        // 恢復按鈕樣式
        button.innerHTML = '<i class="bi bi-trash"></i>';
        button.title = 'Click to remove image';
        button.classList.remove('btn-outline-success');
        button.classList.add('btn-outline-danger');

        // 顯示成功消息
        if (typeof showAlert === 'function') {
            showAlert('Detail image restoration cancelled', 'info');
        }
    }
}

// 初始化Update頁面特殊功能
function initializeUpdatePageFeatures() {
    // 將toggleImageRemoval函數暴露到全局作用域，以便HTML可以調用
    window.toggleImageRemoval = toggleImageRemoval;
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
    console.log('Update form submitting...');

    // 阻止默認提交行為，使用 AJAX 提交
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // 在提交前啟用 rack 和 subcategory 選擇框以確保值被提交
    const rackSelect = document.querySelector('select[name="rack_id"]');
    if (rackSelect && rackSelect.disabled && rackSelect.value) {
        rackSelect.disabled = false;
    }

    const subcategorySelect = document.querySelector('select[name="subcategory_id"]');
    if (subcategorySelect && subcategorySelect.disabled && subcategorySelect.value) {
        console.log('Enabling subcategory select before submit');
        subcategorySelect.disabled = false;
    }

    // 檢查要刪除的圖片（checkbox）
    const removeImageCheckboxes = form.querySelectorAll('input[name="remove_image[]"]:checked');
    console.log('Images marked for removal:', removeImageCheckboxes.length);
    removeImageCheckboxes.forEach(checkbox => {
        console.log('Will remove image ID:', checkbox.value);
    });

    // 檢查新上傳的圖片
    const detailImageInput = document.getElementById('detail_images');
    if (detailImageInput && detailImageInput.files.length > 0) {
        console.log('New images to upload:', detailImageInput.files.length);
        console.log('Detail image input name:', detailImageInput.name);
        console.log('Detail image files:', Array.from(detailImageInput.files).map(f => f.name));
    } else {
        console.log('No new images to upload');
    }

    // 檢查 subcategory 選擇框狀態
    if (subcategorySelect) {
        console.log('Subcategory select status:', {
            disabled: subcategorySelect.disabled,
            value: subcategorySelect.value,
            selectedIndex: subcategorySelect.selectedIndex
        });
    }

    // 顯示載入狀態
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-spinner-border spinner-border-sm me-2"></i>Updating...';
    submitBtn.disabled = true;

    // 創建 FormData
    const formData = new FormData(form);

    // 調試 FormData 內容
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
            console.log(`${key}: ${value}`);
        }
    }

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
        showAlert('An error occurred while updating the product', 'error');
    });
}

// =============================================================================
// 注意事項 (Notes)
// =============================================================================

// 移除重複的 showAlert 函數，使用 alert-system.js 中的統一函數
