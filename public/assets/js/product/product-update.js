// =============================================================================
// 产品更新页面 JavaScript (Product Update Page JavaScript)
// 功能：图片预览、级联选择、SKU生成、状态选择、现有图片删除
// =============================================================================

// 全局变量
let selectedFiles = []; // 存储选中的详细图片文件

// =============================================================================
// 页面初始化 (Page Initialization)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化Update页面功能...');

    // 1. 初始化封面图片预览功能
    initializeCoverImagePreview();

    // 2. 初始化详细图片预览功能
    initializeDetailImagePreview();

    // 3. 初始化级联选择功能（Zone/Rack, Category/Subcategory）
    initializeCascadingSelects();

    // 4. 初始化SKU和Barcode生成功能
    bindSKUGeneration();

    // 5. 初始化状态卡片选择功能
    setupStatusCardSelection();

    // 6. 初始化Update页面特殊功能（现有图片删除）
    initializeUpdatePageFeatures();
});

// =============================================================================
// 封面图片预览功能 (Cover Image Preview)
// =============================================================================

function initializeCoverImagePreview() {
    // 获取封面图片相关元素
    const previewIcon = document.querySelector('#preview-icon');      // 预览图标
    const coverImageInput = document.querySelector('#cover_image');   // 封面图片输入框
    const coverPreview = document.querySelector('#preview-image');    // 封面图片预览

    if (coverImageInput && coverPreview && previewIcon) {
        // 监听文件选择事件
        coverImageInput.addEventListener('change', () => {
            const file = coverImageInput.files[0];

            // 检查文件类型是否为图片
            if (file && file.type.startsWith('image/')) {
                // 显示预览图片，隐藏图标
                coverPreview.src = URL.createObjectURL(file);
                previewIcon.classList.add('d-none');
                coverPreview.classList.remove('d-none');
            } else {
                // 文件类型错误，显示警告
                alert('Please select a valid image file!');
                previewIcon.classList.remove('d-none');
                coverPreview.classList.add('d-none');
            }
        });
    }
}

// =============================================================================
// 详细图片预览功能 (Detail Image Preview)
// =============================================================================

function initializeDetailImagePreview() {
    // 获取详细图片相关元素
    const detailImageInput = document.getElementById('detail_image');        // 详细图片输入框
    const previewContainer = document.getElementById('image-preview-container'); // 预览容器

    if (detailImageInput && previewContainer) {
        // 监听文件选择事件
        detailImageInput.addEventListener('change', function () {
            // 将选中的文件转换为数组
            selectedFiles = Array.from(detailImageInput.files);

            // 限制最多上传 10 张图片
            if (selectedFiles.length > 10) {
                alert("You can only upload up to 10 images.");
                detailImageInput.value = "";
                previewContainer.innerHTML = "";
                selectedFiles = [];
                return;
            }

            // 清空之前的预览内容
            previewContainer.innerHTML = "";

            // 更新预览和文件列表
            updatePreview();
        });
    }
}

// =============================================================================
// 图片预览功能 (Image Preview Functions)
// =============================================================================

// 更新详细图片预览 - 动态生成图片卡片
function updatePreview() {
    const previewContainer = document.getElementById('image-preview-container');
    if (!previewContainer) {
        return;
    }

    // 显示新图片容器
    previewContainer.style.display = 'block';

    // 清空现有内容，但保留标题
    const titleDiv = previewContainer.querySelector('.col-12');
    previewContainer.innerHTML = '';
    if (titleDiv) {
        previewContainer.appendChild(titleDiv);
    }

    // 遍历每个选中的文件
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();

        // 文件读取完成后的处理
        reader.onload = function (e) {
            // 创建Bootstrap列包装器
            const imgWrapper = document.createElement('div');
            imgWrapper.classList.add('col-3');

            // 创建图片卡片容器
            const imageCard = document.createElement('div');
            imageCard.classList.add('image-card', 'new-image-card');

            // 创建图片预览区域
            const imagePreview = document.createElement('div');
            imagePreview.classList.add('image-preview');

            // 创建图片元素
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = `New Image ${index + 1}`;
            img.classList.add('img-fluid');

            // 创建图片覆盖层
            const imageOverlay = document.createElement('div');
            imageOverlay.classList.add('image-overlay');

            // 创建图片序号标签
            const imageNumber = document.createElement('span');
            imageNumber.classList.add('image-number');
            imageNumber.textContent = index + 1;

            // 创建图片操作区域
            const imageActions = document.createElement('div');
            imageActions.classList.add('image-actions');

            // 创建删除按钮
            const removeButton = document.createElement('button');
            removeButton.classList.add('btn', 'btn-outline-danger', 'btn-sm', 'w-100');
            removeButton.innerHTML = '<i class="bi bi-trash me-1"></i><span class="d-none d-sm-inline">Remove</span>';

            // 删除按钮点击事件处理
            removeButton.onclick = function(e) {
                e.stopPropagation();

                // 添加删除动画效果
                imageCard.style.opacity = '0';
                imageCard.style.transform = 'scale(0.8)';

                setTimeout(() => {
                    // 从数组中删除文件
                    selectedFiles.splice(index, 1);

                    // 更新input的文件列表
                    const dataTransfer = new DataTransfer();
                    selectedFiles.forEach(file => dataTransfer.items.add(file));
                    const detailImageInput = document.getElementById('detail_image');
                    if (detailImageInput) {
                        detailImageInput.files = dataTransfer.files;
                    }

                    // 重新渲染预览
                    updatePreview();
                }, 300);
            };

            // 组装DOM元素结构
            imageOverlay.appendChild(imageNumber);
            imagePreview.appendChild(img);
            imagePreview.appendChild(imageOverlay);
            imageActions.appendChild(removeButton);
            imageCard.appendChild(imagePreview);
            imageCard.appendChild(imageActions);
            imgWrapper.appendChild(imageCard);

            // 添加到预览容器
            previewContainer.appendChild(imgWrapper);

            // 添加淡入动画效果
            imageCard.style.opacity = '0';
            imageCard.style.transform = 'scale(0.8)';
            imageCard.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                imageCard.style.opacity = '1';
                imageCard.style.transform = 'scale(1)';
            }, 50);
        };

        // 开始读取文件
        reader.readAsDataURL(file);
    });
}

// =============================================================================
// 级联选择功能 (Cascading Select Functions)
// =============================================================================

function initializeCascadingSelects() {
    // 获取级联选择相关元素
    const zoneSelect = document.getElementById('zone_id');           // 区域选择框
    const rackSelect = document.getElementById('rack_id');           // 货架选择框
    const categorySelect = document.getElementById('category_id');   // 分类选择框
    const subCategorySelect = document.getElementById('subcategory_id'); // 子分类选择框

    // 检查是否是update页面，如果是则加载现有值
    const isUpdatePage = window.location.pathname.includes('/edit/') || window.location.pathname.includes('/update/');

    if (isUpdatePage && rackSelect && subCategorySelect) {
        // Update页面：获取当前选中的值并初始化
        const selectedRackId = rackSelect.value;        // 当前选中的货架ID
        const selectedSubCategoryId = subCategorySelect.value; // 当前选中的子分类ID

        // 初始化时检查是否需要禁用 rack 和 subcategory
        if (!zoneSelect.value) {
            resetRackSelect(); // 重置货架选择框
        } else {
            loadRacks(zoneSelect.value, selectedRackId); // 加载货架选项
        }

        if (!categorySelect.value) {
            resetSubCategorySelect(); // 重置子分类选择框
        } else {
            loadSubcategories(categorySelect.value, selectedSubCategoryId); // 加载子分类选项
        }
    } else {
        // Create页面：重置选择框
        resetRackSelect();
        resetSubCategorySelect();
    }

    // 绑定区域选择变化事件
    if (zoneSelect) {
        zoneSelect.addEventListener('change', function() {
            const zoneId = this.value;
            if (!zoneId) {
                resetRackSelect(); // 清空区域时重置货架
                return;
            }
            loadRacks(zoneId); // 根据区域加载货架
        });
    }

    // 绑定分类选择变化事件
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const categoryId = this.value;
            if (!categoryId) {
                resetSubCategorySelect(); // 清空分类时重置子分类
                return;
            }
            loadSubcategories(categoryId); // 根据分类加载子分类
        });
    }

    // 表单提交处理
    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            // 在提交前启用rack选择框以确保值被提交
            if (rackSelect && rackSelect.disabled && rackSelect.value) {
                rackSelect.disabled = false;
            }
        });
    }
}

// 加载货架选项 - 根据区域ID筛选货架
function loadRacks(zoneId, selectedId = null) {
    const rackSelect = document.getElementById('rack_id');
    if (!rackSelect) return;

    // 重置选择框
    rackSelect.innerHTML = '<option selected disabled value="">Select a rack</option>';
    rackSelect.disabled = true;

    // 检查是否有位置数据
    if (window.locationsData && window.locationsData.length > 0) {
        // 根据区域ID筛选位置数据
        const filteredLocations = window.locationsData.filter(location =>
            parseInt(location.zone_id) === parseInt(zoneId)
        );

        // 获取唯一的货架列表
        const uniqueRacks = [...new Map(filteredLocations.map(location =>
            [location.rack?.id, location.rack]
        )).values()];

        if (uniqueRacks.length > 0) {
            rackSelect.disabled = false;
            // 为每个货架创建选项
            uniqueRacks.forEach(rack => {
                if (rack && rack.id) {
                    const option = document.createElement('option');
                    option.value = rack.id;
                    option.text = (rack.rack_number || rack.rack_name || 'Rack ' + rack.id).toUpperCase();

                    // 如果这是当前选中的值，设置为选中
                    if (selectedId && rack.id == selectedId) {
                        option.selected = true;
                    }

                    rackSelect.appendChild(option);
                }
            });
        } else {
            resetRackSelect(); // 没有货架时重置
        }
    } else {
        resetRackSelect(); // 没有数据时重置
    }
}

// 加载子分类选项 - 根据分类ID筛选子分类
function loadSubcategories(categoryId, selectedId = null) {
    const subCategorySelect = document.getElementById('subcategory_id');
    if (!subCategorySelect) return;

    // 重置选择框
    subCategorySelect.innerHTML = '<option selected disabled value="">Select a SubCategory</option>';
    subCategorySelect.disabled = true;

    // 检查是否有映射数据
    if (window.mappingsData && window.mappingsData.length > 0) {
        // 根据分类ID筛选映射数据
        const filteredMappings = window.mappingsData.filter(mapping =>
            parseInt(mapping.category_id) === parseInt(categoryId)
        );

        // 获取唯一的子分类列表
        const uniqueSubCategories = [...new Map(filteredMappings.map(mapping =>
            [mapping.subcategory?.id, mapping.subcategory]
        )).values()];

        if (uniqueSubCategories.length > 0) {
            subCategorySelect.disabled = false;
            // 为每个子分类创建选项
            uniqueSubCategories.forEach(subCategory => {
                if (subCategory && subCategory.id) {
                    const option = document.createElement('option');
                    option.value = subCategory.id;
                    option.text = (subCategory.subcategory_name || 'Subcategory ' + subCategory.id).toUpperCase();

                    // 如果这是当前选中的值，设置为选中
                    if (selectedId && subCategory.id == selectedId) {
                        option.selected = true;
                    }

                    subCategorySelect.appendChild(option);
                }
            });
        } else {
            resetSubCategorySelect(); // 没有子分类时重置
        }
    }
}

// 重置货架选择框 - 清空选项并禁用
function resetRackSelect() {
    const rackSelect = document.getElementById('rack_id');
    if (rackSelect) {
        rackSelect.innerHTML = '<option selected disabled value="">Select a rack</option>';
        rackSelect.disabled = true;
    }
}

// 重置子分类选择框 - 清空选项并禁用
function resetSubCategorySelect() {
    const subCategorySelect = document.getElementById('subcategory_id');
    if (subCategorySelect) {
        subCategorySelect.innerHTML = '<option selected disabled value="">Select a SubCategory</option>';
        subCategorySelect.disabled = true;
    }
}


// =============================================================================
// SKU和Barcode生成功能 (SKU & Barcode Generation)
// =============================================================================

function bindSKUGeneration() {
    // 获取SKU生成相关元素
    const generateCodesBtn = document.getElementById('generate-codes-btn'); // 生成按钮
    const skuInput = document.getElementById('sku_code');                    // SKU输入框
    const barcodeInput = document.getElementById('barcode_number');         // 条形码输入框

    if (generateCodesBtn && skuInput && barcodeInput) {
        // 绑定生成按钮点击事件
        generateCodesBtn.addEventListener('click', function() {
            generateNewCodes();
        });

        // 当产品信息改变时，自动更新建议
        const categorySelect = document.getElementById('subcategory_id'); // 子分类选择框
        const brandSelect = document.getElementById('brand_id');           // 品牌选择框
        const colorSelect = document.getElementById('color_id');           // 颜色选择框

        // 为每个选择框绑定变化事件
        [categorySelect, brandSelect, colorSelect].forEach(select => {
            if (select) {
                select.addEventListener('change', function() {
                    // 如果SKU为空或是建议值，则自动生成新的
                    if (skuInput.value === '' || skuInput.value === '{{ $suggestedSKU ?? "" }}') {
                        generateNewCodes();
                    }
                });
            }
        });
    }
}

// 生成新的SKU和条形码
function generateNewCodes() {
    // 获取产品信息选择框
    const categorySelect = document.getElementById('subcategory_id'); // 子分类
    const brandSelect = document.getElementById('brand_id');           // 品牌
    const colorSelect = document.getElementById('color_id');           // 颜色
    const skuInput = document.getElementById('sku_code');             // SKU输入框
    const barcodeInput = document.getElementById('barcode_number');   // 条形码输入框

    if (!skuInput || !barcodeInput) return;

    // 获取当前选择的值
    const categoryId = categorySelect ? categorySelect.value : '';
    const brandId = brandSelect ? brandSelect.value : '';
    const colorId = colorSelect ? colorSelect.value : '';

    // 生成基于当前日期的SKU
    const dateCode = new Date().toISOString().slice(2, 8).replace(/-/g, ''); // 日期代码
    const randomCode = Math.random().toString(36).substr(2, 4).toUpperCase(); // 随机代码
    const sequenceNumber = Math.floor(Math.random() * 9999) + 1;              // 序列号

    let newSKU = '';
    // 如果有完整的产品信息，生成智能SKU
    if (categoryId && brandId && colorId) {
        newSKU = generateSmartSKU(categoryId, brandId, colorId, dateCode);
    } else {
        // 否则生成基础SKU
        newSKU = `PRD-${dateCode}-${randomCode}-${sequenceNumber.toString().padStart(3, '0')}`;
    }

    // 基于SKU生成条形码
    const newBarcode = generateBarcodeFromSKU(newSKU);

    // 更新输入框的值
    skuInput.value = newSKU;
    barcodeInput.value = newBarcode;

    // 添加生成动画效果
    [skuInput, barcodeInput].forEach(input => {
        input.style.backgroundColor = '#e8f5e8'; // 绿色背景
        setTimeout(() => {
            input.style.backgroundColor = ''; // 恢复原背景
        }, 1000);
    });
}

// 生成智能SKU - 基于产品信息生成更智能的SKU
function generateSmartSKU(categoryId, brandId, colorId, dateCode) {
    const randomCode = Math.random().toString(36).substr(2, 3).toUpperCase(); // 3位随机码
    const sequenceNumber = Math.floor(Math.random() * 999) + 1;              // 3位序列号
    return `PRD-${dateCode}-${randomCode}-${sequenceNumber.toString().padStart(3, '0')}`;
}

// 基于SKU生成条形码号码 - 确保条形码长度为13位
function generateBarcodeFromSKU(sku) {
    const baseNumber = sku.replace(/-/g, '');                    // 移除SKU中的连字符
    const timestamp = Date.now().toString().slice(-6);           // 时间戳后6位
    const randomSuffix = Math.floor(Math.random() * 999) + 100; // 3位随机后缀

    let barcode = baseNumber + timestamp + randomSuffix;

    // 确保条形码长度为13位
    if (barcode.length > 13) {
        barcode = barcode.substring(0, 13); // 截取前13位
    } else if (barcode.length < 13) {
        barcode = barcode.padStart(13, '0'); // 前面补0到13位
    }

    return barcode;
}

// =============================================================================
// 状态选择功能 (Status Selection)
// =============================================================================

function setupStatusCardSelection() {
    // 获取状态卡片和单选按钮元素
    const statusCards = document.querySelectorAll('.status-card');                    // 状态卡片
    const statusRadioInputs = document.querySelectorAll('input[name="product_status"]'); // 状态单选按钮

    // 为每个状态卡片添加点击事件
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除所有卡片的选中状态
            statusCards.forEach(c => c.classList.remove('selected'));

            // 添加当前卡片的选中状态
            this.classList.add('selected');

            // 选中对应的单选按钮
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });

    // 为单选按钮添加变化事件
    statusRadioInputs.forEach(radio => {
        radio.addEventListener('change', function() {
            // 移除所有卡片的选中状态
            statusCards.forEach(c => c.classList.remove('selected'));

            // 添加对应卡片的选中状态
            const card = this.closest('.status-card');
            if (card) {
                card.classList.add('selected');
            }
        });
    });

    // 初始化选中状态 - 页面加载时设置正确的选中状态
    const checkedRadio = document.querySelector('input[name="product_status"]:checked');
    if (checkedRadio) {
        const card = checkedRadio.closest('.status-card');
        if (card) {
            card.classList.add('selected');
        }
    }
}

// =============================================================================
// Update页面特殊功能 (Update Page Features)
// =============================================================================

// 删除现有图片的函数 - 切换checkbox状态来标记删除
function removeExistingImage(button, imageId) {
    // 获取对应的删除checkbox
    const checkbox = document.getElementById(`remove_image_${imageId}`);

    if (checkbox) {
        // 切换checkbox状态（标记删除/取消删除）
        checkbox.checked = !checkbox.checked;
    }
}

// 初始化Update页面特殊功能
function initializeUpdatePageFeatures() {
    // 将removeExistingImage函数暴露到全局作用域，以便HTML可以调用
    window.removeExistingImage = removeExistingImage;
}
