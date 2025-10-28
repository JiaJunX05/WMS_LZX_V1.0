/**
 * 产品管理系统 JavaScript
 * Product Management System JavaScript
 *
 * 整合产品相关的所有功能：
 * - Dashboard 产品列表展示、搜索、筛选、分页
 * - Create 产品创建表单处理
 * - Update 产品更新表单处理
 * - View 产品查看和操作
 * - 图片处理（封面图片、详细图片）
 * - SKU 和 Barcode 生成
 * - 级联选择（分类、子分类、尺寸、区域、货架）
 * - 状态管理
 * - 表单验证
 *
 * @author WMS Team
 * @version 1.0.0
 */

// =============================================================================
// 全局变量 (Global Variables)
// =============================================================================

let currentImageIndex = 0;
let totalImages = 0;
let productImages = [];

// Product Create 相关变量
let coverImageArea, coverImageInput, coverUploadPlaceholder, coverPreview, removeCoverBtn;
let addDetailImageBtn, detailImagesInput, detailImagesGrid;

// =============================================================================
// 页面初始化 (Page Initialization)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Product Management JS loaded successfully!');

    try {
        // 检测当前页面类型并初始化相应功能
        detectPageTypeAndInitialize();
    } catch (error) {
        console.error('Error during initialization:', error);
        if (typeof showAlert === 'function') {
            showAlert('JavaScript initialization error: ' + error.message, 'error');
        } else {
            alert('JavaScript initialization error: ' + error.message);
        }
    }
});

/**
 * 检测页面类型并初始化相应功能
 */
function detectPageTypeAndInitialize() {
    // Dashboard 页面
    if (document.getElementById('product-card-container')) {
        console.log('Initializing Product Dashboard...');
        initializeProductDashboard();
    }

    // Create 页面
    if (document.getElementById('product-form') && window.location.pathname.includes('/create')) {
        console.log('Initializing Product Create...');
        initializeProductCreate();
    }

    // Update 页面
    if (document.getElementById('product-form') && (window.location.pathname.includes('/edit/') || window.location.pathname.includes('/update/'))) {
        console.log('Initializing Product Update...');
        initializeProductUpdate();
    }

    // View 页面
    const barcodeCanvas = document.getElementById('barcodeCanvas');
    const barcodeSection = document.querySelector('.barcode-section');
    console.log('barcodeCanvas element:', barcodeCanvas);
    console.log('barcodeSection element:', barcodeSection);

    if (barcodeCanvas || barcodeSection) {
        console.log('Initializing Product View...');
        initializeProductView();
    } else {
        console.log('Product View elements not found');
    }
}

// =============================================================================
// Dashboard 页面功能 (Dashboard Page Functions)
// =============================================================================

/**
 * 初始化产品 Dashboard
 */
function initializeProductDashboard() {
    // 传递路由信息到 JavaScript
    const container = document.getElementById('product-card-container');
    if (container) {
        window.productManagementRoute = container.dataset.url;
        window.viewProductUrl = container.dataset.viewUrl;
    }

    const productManager = new ProductManagement();
    window.productManager = productManager;
    productManager.init();
}

/**
 * 产品管理类
 */
class ProductManagement {
    constructor() {
        this.currentPage = 1;
        this.perPage = 10;
        this.products = [];
        this.filters = {
            search: '',
            category: '',
            subcategory: [],
            brand: [],
            status: ''
        };
    }

    init() {
        this.bindEvents();
        this.loadProducts();
    }

    bindEvents() {
        // 搜索功能
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                const searchValue = e.target.value.trim();
                this.filters.search = searchValue;

                if (searchValue === '') {
                    document.querySelectorAll('.filter-list .filter-item').forEach(el => el.classList.remove('active'));
                    const allCategoriesItem = document.querySelector('.filter-list .filter-item[data-category=""]');
                    if (allCategoriesItem) {
                        allCategoriesItem.classList.add('active');
                    } else {
                        document.querySelector('.filter-list .filter-item:first-child').classList.add('active');
                    }
                    document.querySelectorAll('#filterSubcategory input:checked').forEach(cb => cb.checked = false);
                    document.querySelectorAll('#filterBrand input:checked').forEach(cb => cb.checked = false);
                    this.filters.category = '';
                    this.filters.subcategory = [];
                    this.filters.brand = [];
                }

                this.currentPage = 1;
                this.loadProducts();
            });
        }

        // 分类筛选
        const categoryItems = document.querySelectorAll('.filter-option[data-category]');
        categoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectCategory(item);
            });
        });

        // 子分类筛选
        const subcategoryCheckboxes = document.querySelectorAll('.filter-checkbox-input[data-subcategory]');
        subcategoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSubcategoryFilter();
                this.currentPage = 1;
                this.loadProducts();
            });
        });

        // 品牌筛选
        const brandCheckboxes = document.querySelectorAll('.filter-checkbox-input[data-brand]');
        brandCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateBrandFilter();
                this.currentPage = 1;
                this.loadProducts();
            });
        });

        // 清除所有筛选
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearAllFilters();
            });
        }

        // 清除搜索按钮
        const clearSearchBtn = document.getElementById('clear-search');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearSearch();
            });
        }

        // 分页按钮事件
        this.bindPaginationEvents();
    }

    selectCategory(item) {
        const categoryId = item.dataset.category || '';

        document.querySelectorAll('.filter-option[data-category]').forEach(el => {
            el.classList.remove('active');
        });

        item.classList.add('active');

        if (!categoryId) {
            document.querySelectorAll('.filter-checkbox-input[data-subcategory]:checked').forEach(cb => cb.checked = false);
            document.querySelectorAll('.filter-checkbox-input[data-brand]:checked').forEach(cb => cb.checked = false);
            this.filters.subcategory = [];
            this.filters.brand = [];
        }

        this.filters.category = categoryId;
        this.currentPage = 1;
        this.loadProducts();
    }

    updateSubcategoryFilter() {
        this.filters.subcategory = Array.from(document.querySelectorAll('.filter-checkbox-input[data-subcategory]:checked'))
            .map(cb => cb.dataset.subcategory);
    }

    updateBrandFilter() {
        this.filters.brand = Array.from(document.querySelectorAll('.filter-checkbox-input[data-brand]:checked'))
            .map(cb => cb.dataset.brand);
    }

    clearAllFilters() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        document.querySelectorAll('.filter-option[data-category]').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector('.filter-option[data-category=""]').classList.add('active');

        document.querySelectorAll('.filter-checkbox-input[data-subcategory]:checked').forEach(cb => cb.checked = false);
        document.querySelectorAll('.filter-checkbox-input[data-brand]:checked').forEach(cb => cb.checked = false);

        this.filters = {
            search: '',
            category: '',
            subcategory: [],
            brand: [],
            status: ''
        };

        this.currentPage = 1;
        this.loadProducts();
    }

    clearSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        this.filters.search = '';
        this.currentPage = 1;
        this.loadProducts();
    }

    bindPaginationEvents() {
        const paginationElement = document.getElementById('pagination');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');

        if (paginationElement) {
            paginationElement.addEventListener('click', (e) => {
                if (e.target.classList.contains('pagination-btn')) {
                    e.preventDefault();
                    const page = parseInt(e.target.dataset.page);
                    this.currentPage = page;
                    this.loadProducts();
                }
            });
        }

        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!prevPageBtn.classList.contains('disabled') && this.currentPage > 1) {
                    this.currentPage = this.currentPage - 1;
                    this.loadProducts();
                }
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!nextPageBtn.classList.contains('disabled')) {
                    this.currentPage = this.currentPage + 1;
                    this.loadProducts();
                }
            });
        }
    }

    async loadProducts() {
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                perPage: this.perPage,
                search: this.filters.search,
                category_id: this.filters.category,
                product_status: this.filters.status
            });

            this.filters.subcategory.forEach(id => params.append('subcategory_id[]', id));
            this.filters.brand.forEach(id => params.append('brand_id[]', id));

            const url = `${window.productManagementRoute}?${params}`;

            const response = await fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch products: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            this.products = data.data || [];

            this.renderProducts();
            this.updatePaginationInfo(data.pagination);
            this.generatePagination(data.pagination);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Failed to load products');
        }
    }

    renderProducts() {
        const container = document.getElementById('product-card-container');

        if (!this.products || this.products.length === 0) {
            this.showNoResults();
            return;
        }

        container.innerHTML = this.products.map(product => this.createProductCard(product)).join('');

        // 隱藏空狀態
        $('#empty-state').addClass('d-none');
    }

    createProductCard(product) {
        return `
            <div class="col-sm-6 col-md-4 col-lg-4">
                <div class="product-card h-100">
                    <div class="image-container">
                        ${product.cover_image ?
                            `<img src="/assets/images/${product.cover_image}"
                                  alt="Product Image"
                                  class="img-preview">` :
                            '<div class="img-placeholder w-100" style="height: 200px;"><i class="bi bi-image text-muted fs-1"></i></div>'
                        }
                    </div>

                    <div class="card-body">
                        <div class="sku-code">${product.sku_code || 'N/A'}</div>
                        <h6 class="product-name text-truncate" title="${product.name || 'N/A'}">
                            ${product.name ? product.name.toUpperCase() : 'N/A'}
                        </h6>
                    </div>

                    <div class="card-footer">
                        <a href="${window.viewProductUrl.replace(':id', product.id)}" class="btn btn-primary btn-sm w-100">
                            <i class="bi bi-eye me-1"></i>
                            <span>View Details</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    updatePaginationInfo(pagination) {
        const start = pagination.from || ((pagination.current_page - 1) * pagination.per_page + 1);
        const end = pagination.to || Math.min(start + pagination.per_page - 1, pagination.total);

        const showingStart = document.getElementById('showing-start');
        const showingEnd = document.getElementById('showing-end');
        const totalCount = document.getElementById('total-count');

        if (showingStart) showingStart.textContent = pagination.total > 0 ? start : 0;
        if (showingEnd) showingEnd.textContent = end || 0;
        if (totalCount) totalCount.textContent = pagination.total || 0;
    }

    showNoResults() {
        const container = document.getElementById('product-card-container');
        container.innerHTML = '';
        $('#empty-state').removeClass('d-none');
    }

    generatePagination(data) {
        const paginationElement = document.getElementById('pagination');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');

        if (!paginationElement || !prevPageBtn || !nextPageBtn) return;

        const existingPages = paginationElement.querySelectorAll('li:not(#prev-page):not(#next-page)');
        existingPages.forEach(page => page.remove());

        let paginationHTML = '';
        prevPageBtn.classList.toggle('disabled', data.current_page === 1);

        if (data.last_page > 7) {
            const startPage = Math.max(1, data.current_page - 2);
            const endPage = Math.min(data.last_page, data.current_page + 2);

            if (startPage > 1) {
                paginationHTML += `<li class="page-item"><a class="page-link pagination-btn" href="#" data-page="1">1</a></li>`;
                if (startPage > 2) {
                    paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `
                    <li class="page-item ${i === data.current_page ? 'active' : ''}">
                        <a class="page-link pagination-btn" href="#" data-page="${i}">${i}</a>
                    </li>`;
            }

            if (endPage < data.last_page) {
                if (endPage < data.last_page - 1) {
                    paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
                paginationHTML += `<li class="page-item"><a class="page-link pagination-btn" href="#" data-page="${data.last_page}">${data.last_page}</a></li>`;
            }
        } else {
            for (let i = 1; i <= data.last_page; i++) {
                paginationHTML += `
                    <li class="page-item ${i === data.current_page ? 'active' : ''}">
                        <a class="page-link pagination-btn" href="#" data-page="${i}">${i}</a>
                    </li>`;
            }
        }

        prevPageBtn.insertAdjacentHTML('afterend', paginationHTML);
        nextPageBtn.classList.toggle('disabled', data.current_page === data.last_page);
    }

    showError(message) {
        const container = document.getElementById('product-card-container');
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${message}
                </div>
            </div>
        `;
    }
}

// =============================================================================
// Create 页面功能 (Create Page Functions)
// =============================================================================

/**
 * 初始化产品创建页面
 */
function initializeProductCreate() {
    // 绑定图片事件
    if (typeof bindProductImageEvents === 'function') {
        bindProductImageEvents();
    }

    // 绑定状态卡片事件
    if (typeof initializeProductStatusCardSelection === 'function') {
        initializeProductStatusCardSelection();
    }

    // 绑定级联选择事件
    bindCascadingSelectEvents();

    // 绑定SKU和Barcode生成事件
    bindSKUGenerationEvents();

    // 绑定表单提交事件
    bindFormSubmitEvent();

    // 初始化按钮位置
    if (typeof resetProductAddButtonToOriginalState === 'function') {
        resetProductAddButtonToOriginalState();
    }
    if (typeof updateProductAddButtonPosition === 'function') {
        updateProductAddButtonPosition();
    }

    // 生成初始SKU和Barcode
    generateSKU();
    generateBarcodeNumber();

    // 初始化表单验证
    initializeFormValidation();
}

// =============================================================================
// Update 页面功能 (Update Page Functions)
// =============================================================================

/**
 * 初始化产品更新页面
 */
function initializeProductUpdate() {
    // 绑定图片事件
    if (typeof bindProductImageEvents === 'function') {
        bindProductImageEvents();
    }

    // 绑定状态卡片事件
    if (typeof initializeProductStatusCardSelection === 'function') {
        initializeProductStatusCardSelection();
    }

    // 绑定级联选择事件
    bindCascadingSelectEvents();

    // 绑定SKU和Barcode生成事件
    bindSKUGenerationEvents();

    // 绑定表单提交事件
    bindFormSubmitEvent();

    // 初始化按钮位置
    if (typeof resetProductAddButtonToOriginalState === 'function') {
        resetProductAddButtonToOriginalState();
    }
    if (typeof updateProductAddButtonPosition === 'function') {
        updateProductAddButtonPosition();
    }

    // 初始化Update页面特殊功能
    initializeUpdatePageFeatures();

    // 初始化表单验证
    initializeFormValidation();

    // 确保 subcategory 选择框在页面加载时被启用
    setTimeout(() => {
        const subcategorySelect = document.querySelector('select[name="subcategory_id"]');
        const categorySelect = document.querySelector('select[name="category_id"]');

        if (subcategorySelect && categorySelect && categorySelect.value) {
            if (subcategorySelect.disabled) {
                subcategorySelect.disabled = false;
            }
        }
    }, 100);
}

// =============================================================================
// View 页面功能 (View Page Functions)
// =============================================================================

/**
 * 初始化产品查看页面
 */
function initializeProductView() {
    console.log('initializeProductView function called');

    // 初始化图片数据
    initializeImageData();

    // 生成条形码 - 等待 JsBarcode 库加载完成
    console.log('Waiting for JsBarcode library to load...');
    waitForJsBarcode();

    // 绑定键盘事件
    bindKeyboardEvents();

    // 绑定全屏事件
    bindFullscreenEvents();
}

/**
 * 初始化图片数据
 */
function initializeImageData() {
    const coverImage = document.querySelector('.main-image');
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');

    if (coverImage) {
        productImages.push(coverImage.src);
    }

    thumbnailItems.forEach(item => {
        const img = item.querySelector('img');
        if (img && !productImages.includes(img.src)) {
            productImages.push(img.src);
        }
    });

    totalImages = productImages.length;
}

/**
 * 绑定键盘事件
 */
function bindKeyboardEvents() {
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                previousImage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextImage();
                break;
            case 'Escape':
                e.preventDefault();
                closeFullscreen();
                break;
        }
    });
}

/**
 * 绑定全屏事件
 */
function bindFullscreenEvents() {
    document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement) {
            exitFullscreen();
        }
    });
}

// =============================================================================
// 图片切换功能 (Image Switching Functions)
// =============================================================================

/**
 * 切换主图片
 */
function switchMainImage(imageSrc, thumbnailElement, index) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }

    currentImageIndex = index;

    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.classList.remove('active');
    });
    thumbnailElement.classList.add('active');

    updateImageCounter();
}

/**
 * 上一张图片
 */
function previousImage() {
    if (totalImages <= 1) return;

    currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');

    if (thumbnailItems[currentImageIndex]) {
        const img = thumbnailItems[currentImageIndex].querySelector('img');
        if (img) {
            switchMainImage(img.src, thumbnailItems[currentImageIndex], currentImageIndex);
        }
    }
}

/**
 * 下一张图片
 */
function nextImage() {
    if (totalImages <= 1) return;

    currentImageIndex = (currentImageIndex + 1) % totalImages;
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');

    if (thumbnailItems[currentImageIndex]) {
        const img = thumbnailItems[currentImageIndex].querySelector('img');
        if (img) {
            switchMainImage(img.src, thumbnailItems[currentImageIndex], currentImageIndex);
        }
    }
}

/**
 * 更新图片计数器
 */
function updateImageCounter() {
    const currentIndexElement = document.getElementById('currentImageIndex');
    const totalImagesElement = document.getElementById('totalImages');

    if (currentIndexElement) {
        currentIndexElement.textContent = currentImageIndex + 1;
    }
    if (totalImagesElement) {
        totalImagesElement.textContent = totalImages;
    }
}

// =============================================================================
// 图片查看功能 (Image Viewing Functions)
// =============================================================================

/**
 * 打开图片模态框
 */
function openImageModal(imageSrc) {
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        modalImage.src = imageSrc;
        const modal = new bootstrap.Modal(document.getElementById('imageModal'));
        modal.show();
    }
}

/**
 * 切换全屏
 */
function toggleFullscreen() {
    const mainImageWrapper = document.querySelector('.main-image-wrapper');
    if (!mainImageWrapper) return;

    if (!document.fullscreenElement) {
        enterFullscreen(mainImageWrapper);
    } else {
        exitFullscreen();
    }
}

/**
 * 进入全屏
 */
function enterFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

/**
 * 退出全屏
 */
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

/**
 * 关闭全屏
 */
function closeFullscreen() {
    exitFullscreen();
}

// =============================================================================
// 条形码功能 (Barcode Functions)
// =============================================================================

/**
 * 等待 JsBarcode 库加载完成
 */
function waitForJsBarcode() {
    let attempts = 0;
    const maxAttempts = 50; // 最多等待5秒 (50 * 100ms)

    function checkJsBarcode() {
        attempts++;
        console.log(`Checking JsBarcode library (attempt ${attempts}/${maxAttempts})...`);

        if (typeof JsBarcode !== 'undefined') {
            console.log('JsBarcode library loaded successfully!');
            console.log('About to call generateBarcode()...');
            generateBarcode();
            console.log('generateBarcode() call completed');
        } else if (attempts < maxAttempts) {
            console.log('JsBarcode not ready, retrying in 100ms...');
            setTimeout(checkJsBarcode, 100);
        } else {
            console.error('JsBarcode library failed to load after maximum attempts');
        }
    }

    checkJsBarcode();
}

/**
 * 生成条形码
 */
function generateBarcode() {
    try {
        console.log('generateBarcode function called');

        // 检查 JsBarcode 库是否已加载
        if (typeof JsBarcode === 'undefined') {
            console.error('JsBarcode library not loaded');
            return;
        }

        const barcodeCanvas = document.getElementById('barcodeCanvas');
        const barcodeNumberElement = document.getElementById('barcode-number');
        const barcodeNumber = barcodeNumberElement?.textContent?.trim();

        console.log('barcodeCanvas:', barcodeCanvas);
        console.log('barcodeNumber:', barcodeNumber);

        if (barcodeCanvas && barcodeNumber) {
            console.log('Generating barcode with number:', barcodeNumber);
            JsBarcode(barcodeCanvas, barcodeNumber, {
                format: "CODE128",
                width: 2,
                height: 60,
                displayValue: false,
                background: "#ffffff",
                lineColor: "#000000",
            });
            console.log('Barcode generated successfully');
        } else {
            console.error('Missing elements: barcodeCanvas or barcodeNumber');
        }
    } catch (error) {
        console.error('Error in generateBarcode function:', error);
    }
}

/**
 * 复制条形码
 */
function copyBarcode(barcodeNumber) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(barcodeNumber);
        return;
    }

    navigator.permissions.query({name: 'clipboard-write'}).then(function(result) {
        if (result.state === 'granted' || result.state === 'prompt') {
            navigator.clipboard.writeText(barcodeNumber).then(function() {
                showSuccessMessage();
            }).catch(function(err) {
                console.error('Clipboard API failed:', err);
                fallbackCopyTextToClipboard(barcodeNumber);
            });
        } else {
            fallbackCopyTextToClipboard(barcodeNumber);
        }
    }).catch(function(err) {
        fallbackCopyTextToClipboard(barcodeNumber);
    });

    function showSuccessMessage() {
        if (typeof showAlert === 'function') {
            showAlert('Barcode copied to clipboard!', 'success');
        } else {
            alert('Barcode copied to clipboard!');
        }

        const btn = event.target.closest('.btn');
        if (btn) {
            const originalIcon = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check"></i>';
            btn.classList.add('copied');

            setTimeout(() => {
                btn.innerHTML = originalIcon;
                btn.classList.remove('copied');
            }, 2000);
        }
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                showSuccessMessage();
            } else {
                showErrorMessage('Failed to copy barcode using fallback method');
            }
        } catch (err) {
            document.body.removeChild(textArea);
            console.error('Fallback copy failed:', err);
            showErrorMessage('Failed to copy barcode. Please try manually selecting and copying the text.');
        }
    }

    function showErrorMessage(message) {
        if (typeof showAlert === 'function') {
            showAlert(message, 'error');
        } else {
            alert(message);
        }
    }
}

// =============================================================================
// SKU和Barcode生成功能 (SKU & Barcode Generation)
// =============================================================================

/**
 * 生成SKU代码
 */
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

/**
 * 生成Barcode代码 (用于表单输入)
 */
function generateBarcodeNumber() {
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

/**
 * 生成新的SKU和条形码
 */
function generateNewCodes() {
    const categorySelect = document.getElementById('subcategory_id');
    const brandSelect = document.getElementById('brand_id');
    const colorSelect = document.getElementById('color_id');
    const skuInput = document.getElementById('sku_code');
    const barcodeInput = document.getElementById('barcode_number');

    if (!skuInput || !barcodeInput) return;

    const categoryId = categorySelect ? categorySelect.value : '';
    const brandId = brandSelect ? brandSelect.value : '';
    const colorId = colorSelect ? colorSelect.value : '';

    const dateCode = new Date().toISOString().slice(2, 8).replace(/-/g, '');
    const randomCode = Math.random().toString(36).substr(2, 4).toUpperCase();
    const sequenceNumber = Math.floor(Math.random() * 9999) + 1;

    let newSKU = '';
    if (categoryId && brandId && colorId) {
        newSKU = generateSmartSKU(categoryId, brandId, colorId, dateCode);
    } else {
        newSKU = `PRD-${dateCode}-${randomCode}-${sequenceNumber.toString().padStart(3, '0')}`;
    }

    const newBarcode = generateBarcodeFromSKU(newSKU);

    skuInput.value = newSKU;
    barcodeInput.value = newBarcode;

    [skuInput, barcodeInput].forEach(input => {
        input.style.backgroundColor = '#e8f5e8';
        setTimeout(() => {
            input.style.backgroundColor = '';
        }, 1000);
    });
}

/**
 * 生成智能SKU
 */
function generateSmartSKU(categoryId, brandId, colorId, dateCode) {
    const randomCode = Math.random().toString(36).substr(2, 3).toUpperCase();
    const sequenceNumber = Math.floor(Math.random() * 999) + 1;
    return `PRD-${dateCode}-${randomCode}-${sequenceNumber.toString().padStart(3, '0')}`;
}

/**
 * 基于SKU生成条形码号码
 */
function generateBarcodeFromSKU(sku) {
    const baseNumber = sku.replace(/-/g, '');
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(Math.random() * 999) + 100;

    let barcode = baseNumber + timestamp + randomSuffix;

    if (barcode.length > 13) {
        barcode = barcode.substring(0, 13);
    } else if (barcode.length < 13) {
        barcode = barcode.padStart(13, '0');
    }

    return barcode;
}

// =============================================================================
// 级联选择功能 (Cascading Select Functions)
// =============================================================================

/**
 * 绑定级联选择事件
 */
function bindCascadingSelectEvents() {
    const categorySelect = document.querySelector('select[name="category_id"]');
    const subcategorySelect = document.querySelector('select[name="subcategory_id"]');
    const zoneSelect = document.querySelector('select[name="zone_id"]');
    const rackSelect = document.querySelector('select[name="rack_id"]');
    const sizeSelect = document.querySelector('select[name="size_id"]');

    // 分类选择事件
    if (categorySelect && subcategorySelect) {
        categorySelect.addEventListener('change', function() {
            const categoryId = this.value;
            updateSubcategoryOptions(categoryId, subcategorySelect);
        });
    }

    // Zone 选择事件
    if (zoneSelect && rackSelect) {
        zoneSelect.addEventListener('change', function() {
            const zoneId = this.value;
            updateRackOptions(zoneId, rackSelect);
        });
    }

    // Rack 选择事件 - 检查容量
    if (rackSelect) {
        rackSelect.addEventListener('change', function() {
            const rackId = this.value;
            checkRackCapacity(rackId);
        });
    }

    // Size 选择事件
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

    // Update页面特殊处理
    const isUpdatePage = window.location.pathname.includes('/edit/') || window.location.pathname.includes('/update/');
    if (isUpdatePage && rackSelect && subcategorySelect) {
        const selectedRackId = rackSelect.value;
        const selectedSubCategoryId = subcategorySelect.value;

        if (!zoneSelect.value) {
            resetRackSelect();
        } else {
            loadRacks(zoneSelect.value, selectedRackId);
        }

        if (!categorySelect.value) {
            resetSubCategorySelect();
            resetSizeSelect();
        } else {
            loadSubcategories(categorySelect.value, selectedSubCategoryId);
            loadSizes(categorySelect.value, sizeSelect ? sizeSelect.value : null);
        }
    } else {
        resetRackSelect();
        resetSubCategorySelect();
        resetSizeSelect();
    }
}

/**
 * 更新子分类选项
 */
function updateSubcategoryOptions(categoryId, subcategorySelect) {
    if (!categoryId) {
        subcategorySelect.disabled = true;
        subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
        return;
    }

    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
    subcategorySelect.disabled = true;

    if (window.mappingsData && window.mappingsData.length > 0) {
        const filteredMappings = window.mappingsData.filter(mapping =>
            parseInt(mapping.category_id) === parseInt(categoryId)
        );

        const uniqueSubCategories = [...new Map(filteredMappings.map(mapping =>
            [mapping.subcategory?.id, mapping.subcategory]
        )).values()];

        if (uniqueSubCategories.length > 0) {
            subcategorySelect.disabled = false;
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

/**
 * 更新货架选项
 */
function updateRackOptions(zoneId, rackSelect) {
    if (!zoneId) {
        rackSelect.disabled = true;
        rackSelect.innerHTML = '<option value="">Select Rack</option>';
        hideRackCapacityError();
        return;
    }

    rackSelect.innerHTML = '<option value="">Select Rack</option>';
    rackSelect.disabled = true;
    hideRackCapacityError();

    if (window.locationsData && window.locationsData.length > 0) {
        const filteredLocations = window.locationsData.filter(location =>
            parseInt(location.zone_id) === parseInt(zoneId) && location.location_status === 'Available'
        );

        if (filteredLocations.length > 0) {
            rackSelect.disabled = false;
            filteredLocations.forEach(location => {
                if (location.rack && location.rack.id) {
                    const option = document.createElement('option');
                    option.value = location.rack.id;

                    // 添加容量信息到选项文本
                    const capacityInfo = getRackCapacityInfo(location.rack.id);
                    const capacityText = capacityInfo ? ` (${capacityInfo.available}/${capacityInfo.capacity})` : '';
                    option.textContent = (location.rack.rack_number || 'Rack ' + location.rack.id) + capacityText;

                    // 添加数据属性
                    if (capacityInfo) {
                        option.dataset.capacity = capacityInfo.capacity;
                        option.dataset.used = capacityInfo.used;
                        option.dataset.available = capacityInfo.available;
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

/**
 * 检查货架容量
 */
function checkRackCapacity(rackId) {
    if (!rackId) {
        hideRackCapacityError();
        return;
    }

    const capacityInfo = getRackCapacityInfo(rackId);
    if (!capacityInfo) {
        hideRackCapacityError();
        return;
    }

    // 检查是否有可用空间
    if (capacityInfo.available <= 0) {
        const errorMessage = `Rack capacity is full! Available space: ${capacityInfo.available} positions`;
        showRackCapacityError(errorMessage);

        // 显示alert提示
        if (typeof showAlert === 'function') {
            showAlert(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
    } else {
        hideRackCapacityError();

        // 显示成功提示（可选）
        if (capacityInfo.available <= 5) {
            const warningMessage = `Rack capacity is low! Available space: ${capacityInfo.available} positions`;
            if (typeof showAlert === 'function') {
                showAlert(warningMessage, 'warning');
            }
        }
    }
}

/**
 * 获取货架容量信息
 */
function getRackCapacityInfo(rackId) {
    if (!window.rackCapacitiesData || !rackId) {
        return null;
    }

    return window.rackCapacitiesData[rackId] || null;
}

/**
 * 显示货架容量错误
 */
function showRackCapacityError(message) {
    const errorDiv = document.getElementById('rack-capacity-error');
    const errorText = document.getElementById('rack-capacity-error-text');
    const rackSelect = document.querySelector('select[name="rack_id"]');

    if (errorDiv && errorText && rackSelect) {
        errorText.textContent = message;
        errorDiv.classList.remove('d-none');
        rackSelect.classList.add('is-invalid');
    }
}

/**
 * 隐藏货架容量错误
 */
function hideRackCapacityError() {
    const errorDiv = document.getElementById('rack-capacity-error');
    const rackSelect = document.querySelector('select[name="rack_id"]');

    if (errorDiv && rackSelect) {
        errorDiv.classList.add('d-none');
        rackSelect.classList.remove('is-invalid');
    }
}

/**
 * 更新尺寸选项
 */
function updateSizeOptions(categoryId, subcategoryId, sizeSelect) {
    if (!categoryId) {
        sizeSelect.disabled = true;
        sizeSelect.innerHTML = '<option value="">Select Size</option>';
        return;
    }

    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    sizeSelect.disabled = true;

    if (window.sizesData && window.sizesData.length > 0) {
        const filteredSizes = window.sizesData.filter(size =>
            parseInt(size.category_id) === parseInt(categoryId) && size.size_status === 'Available'
        );

        if (filteredSizes.length > 0) {
            sizeSelect.disabled = false;
            filteredSizes.forEach(size => {
                if (size && size.id) {
                    const option = document.createElement('option');
                    option.value = size.id;
                    option.textContent = size.size_value || 'Size ' + size.id;
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

/**
 * 加载货架选项
 */
function loadRacks(zoneId, selectedId = null) {
    const rackSelect = document.querySelector('select[name="rack_id"]');
    if (!rackSelect) return;

    rackSelect.innerHTML = '<option selected disabled value="">Select a rack</option>';
    rackSelect.disabled = true;

    if (window.locationsData && window.locationsData.length > 0) {
        const filteredLocations = window.locationsData.filter(location =>
            parseInt(location.zone_id) === parseInt(zoneId)
        );

        const uniqueRacks = [...new Map(filteredLocations.map(location =>
            [location.rack?.id, location.rack]
        )).values()];

        if (uniqueRacks.length > 0) {
            rackSelect.disabled = false;
            uniqueRacks.forEach(rack => {
                if (rack && rack.id) {
                    const option = document.createElement('option');
                    option.value = rack.id;
                    option.text = (rack.rack_number || rack.rack_name || 'Rack ' + rack.id).toUpperCase();

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

/**
 * 加载子分类选项
 */
function loadSubcategories(categoryId, selectedId = null) {
    const subCategorySelect = document.querySelector('select[name="subcategory_id"]');
    if (!subCategorySelect) return;

    subCategorySelect.innerHTML = '<option selected disabled value="">Select a SubCategory</option>';
    subCategorySelect.disabled = true;

    if (window.mappingsData && window.mappingsData.length > 0) {
        const filteredMappings = window.mappingsData.filter(mapping =>
            parseInt(mapping.category_id) === parseInt(categoryId)
        );

        const uniqueSubCategories = [...new Map(filteredMappings.map(mapping =>
            [mapping.subcategory?.id, mapping.subcategory]
        )).values()];

        if (uniqueSubCategories.length > 0) {
            subCategorySelect.disabled = false;
            uniqueSubCategories.forEach(subCategory => {
                if (subCategory && subCategory.id) {
                    const option = document.createElement('option');
                    option.value = subCategory.id;
                    option.text = (subCategory.subcategory_name || 'Subcategory ' + subCategory.id).toUpperCase();

                    if (selectedId && subCategory.id == selectedId) {
                        option.selected = true;
                    }

                    subCategorySelect.appendChild(option);
                }
            });
        } else {
            subCategorySelect.innerHTML = '<option value="">No subcategories available</option>';
        }
    } else {
        subCategorySelect.innerHTML = '<option value="">No mapping data available</option>';
    }
}

/**
 * 加载尺寸选项
 */
function loadSizes(categoryId, selectedId = null) {
    const sizeSelect = document.querySelector('select[name="size_id"]');
    if (!sizeSelect) return;

    if (!categoryId) {
        sizeSelect.disabled = true;
        sizeSelect.innerHTML = '<option value="">Select Size</option>';
        return;
    }

    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    sizeSelect.disabled = true;

    if (window.sizesData && window.sizesData.length > 0) {
        const filteredSizes = window.sizesData.filter(size =>
            parseInt(size.category_id) === parseInt(categoryId) && size.size_status === 'Available'
        );

        if (filteredSizes.length > 0) {
            sizeSelect.disabled = false;
            filteredSizes.forEach(size => {
                if (size && size.id) {
                    const option = document.createElement('option');
                    option.value = size.id;
                    option.textContent = size.size_value || 'Size ' + size.id;

                    if (selectedId && size.id == selectedId) {
                        option.selected = true;
                    }

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

/**
 * 重置货架选择框
 */
function resetRackSelect() {
    const rackSelect = document.querySelector('select[name="rack_id"]');
    if (rackSelect) {
        rackSelect.innerHTML = '<option selected disabled value="">Select a rack</option>';
        rackSelect.disabled = true;
    }
}

/**
 * 重置子分类选择框
 */
function resetSubCategorySelect() {
    const subCategorySelect = document.querySelector('select[name="subcategory_id"]');
    if (subCategorySelect) {
        subCategorySelect.innerHTML = '<option selected disabled value="">Select a SubCategory</option>';
        subCategorySelect.disabled = true;
    }
}

/**
 * 重置尺寸选择框
 */
function resetSizeSelect() {
    const sizeSelect = document.querySelector('select[name="size_id"]');
    if (sizeSelect) {
        sizeSelect.innerHTML = '<option selected disabled value="">Select Size</option>';
        sizeSelect.disabled = true;
    }
}

// =============================================================================
// SKU生成事件绑定 (SKU Generation Event Binding)
// =============================================================================

/**
 * 绑定SKU生成事件
 */
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
            generateBarcodeNumber();
        });
    }

    if (generateCodesBtn) {
        generateCodesBtn.addEventListener('click', function() {
            generateSKU();
            generateBarcodeNumber();
            if (typeof showAlert === 'function') {
                showAlert('SKU and Barcode generated successfully!', 'success');
            }
        });
    }

    // 当产品信息改变时，自动更新建议
    const categorySelect = document.getElementById('subcategory_id');
    const brandSelect = document.getElementById('brand_id');
    const colorSelect = document.getElementById('color_id');
    const skuInput = document.getElementById('sku_code');

    [categorySelect, brandSelect, colorSelect].forEach(select => {
        if (select) {
            select.addEventListener('change', function() {
                if (skuInput && skuInput.value === '') {
                    generateNewCodes();
                }
            });
        }
    });
}

// =============================================================================
// 表单验证功能 (Form Validation)
// =============================================================================

/**
 * 初始化表单验证
 */
function initializeFormValidation() {
    const form = document.getElementById('product-form');
    if (!form) return;

    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
    });
}

/**
 * 验证字段
 */
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

/**
 * 显示字段错误
 */
function showFieldError(field, message) {
    let errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

/**
 * 隐藏字段错误
 */
function hideFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// =============================================================================
// 表单提交处理 (Form Submit Handler)
// =============================================================================

/**
 * 绑定表单提交事件
 */
function bindFormSubmitEvent() {
    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

/**
 * 处理表单提交
 */
function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    // 在提交前启用 rack 和 subcategory 选择框
    const rackSelect = document.querySelector('select[name="rack_id"]');
    if (rackSelect && rackSelect.disabled && rackSelect.value) {
        rackSelect.disabled = false;
    }

    const subcategorySelect = document.querySelector('select[name="subcategory_id"]');
    if (subcategorySelect && subcategorySelect.disabled && subcategorySelect.value) {
        subcategorySelect.disabled = false;
    }

    // 显示载入状态
    const originalText = submitBtn.innerHTML;
    const isUpdate = window.location.pathname.includes('/edit/') || window.location.pathname.includes('/update/');
    submitBtn.innerHTML = `<i class="bi bi-spinner-border spinner-border-sm me-2"></i>${isUpdate ? 'Updating...' : 'Creating...'}`;
    submitBtn.disabled = true;

    // 创建 FormData
    const formData = new FormData(form);

    // 发送 AJAX 请求
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
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            return response.text().then(text => {
                throw new Error('Server returned HTML instead of JSON. Check if AJAX request is properly detected.');
            });
        }
    })
    .then(data => {
        // 恢复按钮状态
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (data.success) {
            if (typeof showAlert === 'function') {
                showAlert(data.message, 'success');
            }
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 1500);
        } else {
            if (typeof showAlert === 'function') {
                showAlert(data.message, 'error');
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // 恢复按钮状态
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        if (typeof showAlert === 'function') {
            showAlert('An error occurred while processing the request', 'error');
        }
    });
}

// =============================================================================
// Update页面特殊功能 (Update Page Features)
// =============================================================================

/**
 * 初始化Update页面特殊功能
 */
function initializeUpdatePageFeatures() {
    // 将toggleImageRemoval函数暴露到全局作用域
    window.toggleImageRemoval = toggleImageRemoval;
}

/**
 * 切换图片删除状态
 */
function toggleImageRemoval(button, imageId) {
    const checkbox = document.getElementById(`remove_image_${imageId}`);
    const imageItem = button.closest('.detail-image-item');

    if (!checkbox) {
        console.error('Checkbox not found for image ID:', imageId);
        return;
    }

    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
        if (!confirm('Are you sure you want to remove this detail image?')) {
            checkbox.checked = false;
            return;
        }

        imageItem.style.opacity = '0.5';
        imageItem.style.border = '2px solid #dc3545';
        imageItem.style.backgroundColor = '#f8d7da';

        button.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i>';
        button.title = 'Click to restore image';
        button.classList.remove('btn-outline-danger');
        button.classList.add('btn-outline-success');

        if (typeof showAlert === 'function') {
            showAlert('Detail image marked for removal', 'warning');
        }
    } else {
        imageItem.style.opacity = '';
        imageItem.style.border = '';
        imageItem.style.backgroundColor = '';

        button.innerHTML = '<i class="bi bi-trash"></i>';
        button.title = 'Click to remove image';
        button.classList.remove('btn-outline-success');
        button.classList.add('btn-outline-danger');

        if (typeof showAlert === 'function') {
            showAlert('Detail image restoration cancelled', 'info');
        }
    }
}

// =============================================================================
// 产品操作功能 (Product Operations)
// =============================================================================

/**
 * 编辑产品
 */
function editProduct(productId) {
    const editUrl = window.editProductUrl.replace(':id', productId);
    window.location.href = editUrl;
}

/**
 * 删除产品
 */
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        const deleteUrl = window.deleteProductUrl.replace(':id', productId);

        fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (typeof showAlert === 'function') {
                    showAlert(data.message, 'success');
                }
                setTimeout(() => {
                    window.location.href = window.productIndexUrl || '/products';
                }, 1500);
            } else {
                if (typeof showAlert === 'function') {
                    showAlert(data.message, 'error');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (typeof showAlert === 'function') {
                showAlert('An error occurred while deleting the product', 'error');
            }
        });
    }
}

/**
 * 设置产品为可用
 */
function setAvailable(productId) {
    const availableUrl = window.availableProductUrl.replace(':id', productId);

    fetch(availableUrl, {
        method: 'PATCH',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            if (typeof showAlert === 'function') {
                showAlert(data.message, 'success');
            }
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            if (typeof showAlert === 'function') {
                showAlert(data.message, 'error');
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (typeof showAlert === 'function') {
            showAlert('An error occurred while updating the product status', 'error');
        }
    });
}

/**
 * 设置产品为不可用
 */
function setUnavailable(productId) {
    const unavailableUrl = window.unavailableProductUrl.replace(':id', productId);

    fetch(unavailableUrl, {
        method: 'PATCH',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            if (typeof showAlert === 'function') {
                showAlert(data.message, 'success');
            }
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            if (typeof showAlert === 'function') {
                showAlert(data.message, 'error');
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (typeof showAlert === 'function') {
            showAlert('An error occurred while updating the product status', 'error');
        }
    });
}

// =============================================================================
// 向后兼容性函数 (Backward Compatibility Functions)
// =============================================================================

// 为了向后兼容，保留旧的函数名
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.activateProduct = setAvailable;
window.deactivateProduct = setUnavailable;

// 图片切换函数
window.switchMainImage = switchMainImage;
window.previousImage = previousImage;
window.nextImage = nextImage;
window.updateImageCounter = updateImageCounter;

// 图片查看函数
window.openImageModal = openImageModal;
window.toggleFullscreen = toggleFullscreen;
window.enterFullscreen = enterFullscreen;
window.exitFullscreen = exitFullscreen;
window.closeFullscreen = closeFullscreen;

// 条形码函数
window.generateBarcode = generateBarcode;
window.copyBarcode = copyBarcode;

// SKU生成函数
window.generateSKU = generateSKU;
window.generateBarcodeNumber = generateBarcodeNumber;
window.generateNewCodes = generateNewCodes;
window.generateSmartSKU = generateSmartSKU;
window.generateBarcodeFromSKU = generateBarcodeFromSKU;

// 级联选择函数
window.updateSubcategoryOptions = updateSubcategoryOptions;
window.updateRackOptions = updateRackOptions;
window.updateSizeOptions = updateSizeOptions;
window.loadRacks = loadRacks;
window.loadSubcategories = loadSubcategories;
window.loadSizes = loadSizes;
window.resetRackSelect = resetRackSelect;
window.resetSubCategorySelect = resetSubCategorySelect;
window.resetSizeSelect = resetSizeSelect;

// Update页面特殊函数
window.toggleImageRemoval = toggleImageRemoval;

// 产品操作函数
window.setAvailable = setAvailable;
window.setUnavailable = setUnavailable;

// =============================================================================
// 注意事项 (Notes)
// =============================================================================

/**
 * 此文件整合了所有产品相关的 JavaScript 功能
 * 包括 Dashboard、Create、Update、View 页面的所有功能
 *
 * 依赖的外部系统：
 * - alert-system.js: 统一的提示消息系统
 * - image-system.js: 图片处理系统（包含产品特殊处理）
 * - status-system.js: 状态卡片系统
 *
 * 功能模块：
 * 1. Dashboard: 产品列表展示、搜索、筛选、分页
 * 2. Create: 产品创建表单处理、图片上传、SKU生成
 * 3. Update: 产品更新表单处理、图片管理、级联选择
 * 4. View: 产品查看、图片切换、条形码生成、产品操作
 * 5. 图片处理: 封面图片、详细图片、拖拽上传
 * 6. 级联选择: 分类、子分类、尺寸、区域、货架
 * 7. 状态管理: 产品状态卡片选择
 * 8. 表单验证: 字段验证和错误显示
 * 9. 产品操作: 编辑、删除、设置状态
 */

