/**
 * Product Management JavaScript
 * 產品管理統一交互邏輯
 *
 * 功能模塊：
 * - Dashboard 頁面：產品列表展示、搜索、篩選、分頁
 * - View 頁面：查看詳情、刪除操作、Update Modal
 * - Create Modal：產品創建、表單驗證、圖片上傳、SKU/Barcode 生成
 * - Update Modal：編輯更新、表單提交、圖片管理
 * - 圖片處理：封面圖片、詳細圖片
 * - SKU 和 Barcode 生成
 * - 級聯選擇：分類、子分類、尺寸、區域、貨架
 * - 狀態管理
 * - 通用功能：API 請求、UI 更新、事件綁定、工具函數
 *
 * @author WMS Team
 * @version 3.0.0
 */

// =============================================================================
// 全局變量和狀態管理 (Global Variables and State Management)
// =============================================================================

// View 頁面相關變量
let currentImageIndex = 0;
let totalImages = 0;
let productImages = [];

// =============================================================================
// Dashboard 頁面功能 (Dashboard Page Functions)
// =============================================================================

/**
 * Product Dashboard 類
 * 產品儀表板頁面交互邏輯
 */
class ProductDashboard {
    constructor() {
        // 狀態管理
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

        // 初始化
        this.init();
    }

    // =============================================================================
    // 初始化模塊 (Initialization Module)
    // =============================================================================
    init() {
        // 傳遞路由信息到 JavaScript
        const container = document.getElementById('product-card-container');
        if (container) {
            window.productManagementRoute = container.dataset.url;
            window.viewProductUrl = container.dataset.viewUrl;
        }

        // 只在 Dashboard 頁面綁定事件和獲取數據
        if (container) {
            this.bindEvents();
            this.fetchProducts();
        }
    }

    // =============================================================================
    // 事件綁定模塊 (Event Binding Module)
    // =============================================================================
    bindEvents() {
        // 搜索功能
        $('#search-input').on('keyup', (e) => {
            this.filters.search = $(e.target).val().trim();
            this.handleSearch();
        });

        // 分類篩選
        $(document).on('click', '.filter-option[data-category]', (e) => {
            e.preventDefault();
            this.selectCategory($(e.currentTarget));
        });

        // 子分類篩選
        $(document).on('change', '.filter-checkbox-input[data-subcategory]', () => {
            this.updateSubcategoryFilter();
            this.handleFilter();
        });

        // 品牌篩選
        $(document).on('change', '.filter-checkbox-input[data-brand]', () => {
            this.updateBrandFilter();
            this.handleFilter();
        });

        // 清除所有篩選
        $('#clear-filters').on('click', () => {
            this.clearFilters();
        });

        // 清除搜索按鈕
        $('#clear-search').on('click', () => {
            this.clearSearch();
        });

        // 分頁功能
        $('#pagination').on('click', '.pagination-btn', (e) => {
            e.preventDefault();
            const page = parseInt($(e.currentTarget).data('page'));
            this.fetchProducts(page);
        });

        $('#prev-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchProducts(this.currentPage - 1);
            }
        });

        $('#next-page').on('click', 'a', (e) => {
            e.preventDefault();
            if (!$(e.currentTarget).parent().hasClass('disabled')) {
                this.fetchProducts(this.currentPage + 1);
            }
        });
    }

    // =============================================================================
    // 數據請求模塊 (Data Request Module)
    // =============================================================================

    /**
     * 獲取搜索參數
     * @param {number} page 頁碼
     * @returns {Object} 搜索參數對象
     */
    getSearchParams(page = 1) {
        const params = {
            page: page,
            perPage: this.perPage,
            search: this.filters.search,
            category_id: this.filters.category,
            product_status: this.filters.status
        };

        // 添加子分類和品牌篩選（數組格式）
        if (this.filters.subcategory.length > 0) {
            params.subcategory_id = this.filters.subcategory;
        }
        if (this.filters.brand.length > 0) {
            params.brand_id = this.filters.brand;
        }

        return params;
    }

    /**
     * 獲取產品數據
     * @param {number} page 頁碼
     */
    async fetchProducts(page = 1) {
        this.currentPage = page;
        const params = this.getSearchParams(page);
        const apiRoute = window.productManagementRoute;

        try {
            const url = new URL(apiRoute, window.location.origin);
            Object.keys(params).forEach(key => {
                if (Array.isArray(params[key])) {
                    params[key].forEach(value => url.searchParams.append(`${key}[]`, value));
                } else {
                    url.searchParams.append(key, params[key]);
                }
            });

            const response = await fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.status}`);
            }

            const data = await response.json();

            if (data.data && data.data.length > 0) {
                this.renderProducts(data.data);
                this.updatePaginationInfo(data);
            } else {
                this.showNoResults();
            }
            this.updateResultsCount(data);
            this.generatePagination(data);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showAlert('Failed to load products, please try again', 'danger');
        }
    }

    /**
     * 處理搜索
     */
    handleSearch() {
        // 如果搜索為空，清除相關篩選
        if (this.filters.search === '') {
            $('.filter-list .filter-item').removeClass('active');
            const allCategoriesItem = $('.filter-list .filter-item[data-category=""]');
            if (allCategoriesItem.length > 0) {
                allCategoriesItem.addClass('active');
            } else {
                $('.filter-list .filter-item:first-child').addClass('active');
            }
            $('#filterSubcategory input:checked').prop('checked', false);
            $('#filterBrand input:checked').prop('checked', false);
            this.filters.category = '';
            this.filters.subcategory = [];
            this.filters.brand = [];
        }

        this.fetchProducts(1);
    }

    /**
     * 處理篩選
     */
    handleFilter() {
        this.fetchProducts(1);
    }

    /**
     * 選擇分類
     * @param {jQuery} item 分類元素
     */
    selectCategory(item) {
        const categoryId = item.data('category') || '';

        $('.filter-option[data-category]').removeClass('active');
        item.addClass('active');

        if (!categoryId) {
            $('.filter-checkbox-input[data-subcategory]:checked').prop('checked', false);
            $('.filter-checkbox-input[data-brand]:checked').prop('checked', false);
            this.filters.subcategory = [];
            this.filters.brand = [];
        }

        this.filters.category = categoryId;
        this.fetchProducts(1);
    }

    /**
     * 更新子分類篩選
     */
    updateSubcategoryFilter() {
        this.filters.subcategory = $('.filter-checkbox-input[data-subcategory]:checked')
            .map(function() {
                return $(this).data('subcategory');
            })
            .get();
    }

    /**
     * 更新品牌篩選
     */
    updateBrandFilter() {
        this.filters.brand = $('.filter-checkbox-input[data-brand]:checked')
            .map(function() {
                return $(this).data('brand');
            })
            .get();
    }

    /**
     * 清除所有篩選條件
     */
    clearFilters() {
        this.filters = {
            search: '',
            category: '',
            subcategory: [],
            brand: [],
            status: ''
        };

        $('#search-input').val('');
        $('.filter-option[data-category]').removeClass('active');
        $('.filter-option[data-category=""]').addClass('active');
        $('.filter-checkbox-input[data-subcategory]:checked').prop('checked', false);
        $('.filter-checkbox-input[data-brand]:checked').prop('checked', false);

        this.fetchProducts(1);
    }

    /**
     * 清除搜索
     */
    clearSearch() {
        this.filters.search = '';
        $('#search-input').val('');
        this.handleSearch();
    }

    /**
     * 更新結果計數顯示
     * @param {Object} response API響應數據
     */
    updateResultsCount(response) {
        const total = response.pagination?.total || 0;
        $('#results-count').text(`${total} records`);
    }

    // =============================================================================
    // 渲染模塊 (Rendering Module)
    // =============================================================================

    /**
     * 渲染產品列表
     * @param {Array} products 產品數據數組
     */
    renderProducts(products) {
        const container = $('#product-card-container');
        const html = products.map(product => this.createProductCard(product)).join('');
        container.html(html);

        // 隱藏空狀態
        $('#empty-state').addClass('d-none');
    }

    /**
     * 創建產品卡片
     * @param {Object} product 產品數據對象
     * @returns {string} 產品卡片HTML
     */
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
                        <h6 class="product-name" title="${product.name || 'N/A'}">
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

    /**
     * 顯示無結果
     */
    showNoResults() {
        $('#product-card-container').empty();
        $('#empty-state').removeClass('d-none');
        this.updatePaginationInfo({ pagination: { total: 0, from: 0, to: 0 } });
    }

    // =============================================================================
    // 分頁模塊 (Pagination Module)
    // =============================================================================

    /**
     * 更新分頁信息
     * @param {Object} response API響應數據
     */
    updatePaginationInfo(response) {
        const pagination = response.pagination || {};
        const start = pagination.from || ((pagination.current_page - 1) * pagination.per_page + 1);
        const end = pagination.to || Math.min(start + pagination.per_page - 1, pagination.total);

        $('#showing-start').text(pagination.total > 0 ? start : 0);
        $('#showing-end').text(end || 0);
        $('#total-count').text(pagination.total || 0);
    }

    /**
     * 生成分頁
     * @param {Object} data API響應數據
     */
    generatePagination(data) {
        $("#pagination li:not(#prev-page):not(#next-page)").remove();
        const pagination = data.pagination || {};
        if (!pagination.last_page) return;

        let paginationHTML = '';
        $('#prev-page').toggleClass('disabled', pagination.current_page <= 1);

        if (pagination.last_page > 7) {
            const startPage = Math.max(1, pagination.current_page - 2);
            const endPage = Math.min(pagination.last_page, pagination.current_page + 2);

            if (startPage > 1) {
                paginationHTML += `<li class="page-item"><a class="page-link pagination-btn" href="#" data-page="1">1</a></li>`;
                if (startPage > 2) {
                    paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `<li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                    <a class="page-link pagination-btn" href="#" data-page="${i}">${i}</a>
                </li>`;
            }

            if (endPage < pagination.last_page) {
                if (endPage < pagination.last_page - 1) {
                    paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
                paginationHTML += `<li class="page-item"><a class="page-link pagination-btn" href="#" data-page="${pagination.last_page}">${pagination.last_page}</a></li>`;
            }
        } else {
            for (let i = 1; i <= pagination.last_page; i++) {
                paginationHTML += `<li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                    <a class="page-link pagination-btn" href="#" data-page="${i}">${i}</a>
                </li>`;
            }
        }

        $('#next-page').toggleClass('disabled', pagination.current_page >= pagination.last_page);
        $('#prev-page').after(paginationHTML);
    }

    // =============================================================================
    // 產品操作模塊 (Product Operations Module)
    // =============================================================================

    /**
     * 編輯產品（打開更新彈窗）
     * @param {number} productId 產品ID
     */
    editProduct(productId) {
        // 產品編輯使用 Modal，直接調用全局函數
        if (typeof window.openUpdateProductModal === 'function') {
            window.openUpdateProductModal(productId);
        } else {
            // 如果 Modal 不可用，使用傳統頁面跳轉
            const editUrl = window.editProductUrl.replace(':id', productId);
            window.location.href = editUrl;
        }
    }

    /**
     * 刪除產品
     * @param {number} productId 產品ID
     */
    deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        fetch(window.deleteProductUrl.replace(':id', productId), {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
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
                this.showAlert(data.message || 'Product deleted successfully', 'success');

                // 檢查當前頁面是否還有數據
                const currentPageData = $('#product-card-container .product-card').length;

                // 如果當前頁面沒有數據且不是第一頁，則返回第一頁
                if (currentPageData <= 1 && this.currentPage > 1) {
                    this.fetchProducts(1);
                } else {
                    // 重新載入當前頁面的產品列表
                    this.fetchProducts(this.currentPage);
                }
            } else {
                this.showAlert(data.message || 'Failed to delete product', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to delete product', 'error');
        });
    }

    /**
     * 激活產品
     * @param {number} productId 產品ID
     */
    setAvailable(productId) {
        if (!confirm('Are you sure you want to activate this product?')) return;

        fetch(window.availableProductUrl.replace(':id', productId), {
            method: 'PATCH',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
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
                this.showAlert(data.message || 'Product has been set to available status', 'success');

                // 檢查當前頁面類型
                const isDashboardPage = document.getElementById('product-card-container') !== null;
                if (isDashboardPage) {
                    // Dashboard 頁面：重新載入產品列表
                    this.fetchProducts(this.currentPage);
                } else {
                    // View 頁面：刷新當前頁面
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            } else {
                this.showAlert(data.message || 'Failed to set product available', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set product available', 'error');
        });
    }

    /**
     * 停用產品
     * @param {number} productId 產品ID
     */
    setUnavailable(productId) {
        if (!confirm('Are you sure you want to deactivate this product?')) return;

        fetch(window.unavailableProductUrl.replace(':id', productId), {
            method: 'PATCH',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
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
                this.showAlert(data.message || 'Product has been set to unavailable status', 'success');

                // 檢查當前頁面類型
                const isDashboardPage = document.getElementById('product-card-container') !== null;
                if (isDashboardPage) {
                    // Dashboard 頁面：重新載入產品列表
                    this.fetchProducts(this.currentPage);
                } else {
                    // View 頁面：刷新當前頁面
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            } else {
                this.showAlert(data.message || 'Failed to set product unavailable', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Failed to set product unavailable', 'error');
        });
    }

    /**
     * 顯示提示信息
     * @param {string} message 提示信息
     * @param {string} type 提示類型
     */
    showAlert(message, type) {
        // 使用統一的 alert 系統（在 header 顯示）
        if (typeof window.showAlert === 'function') {
            window.showAlert(message, type);
        } else {
            // 備用實現 - 直接使用 globalAlertContainer
            const alertClass = type === 'danger' || type === 'error' ? 'alert-danger' : `alert-${type}`;
            const container = document.getElementById('globalAlertContainer');

            if (container) {
                // 清除現有 alert
                const existingAlerts = container.querySelectorAll('.alert');
                existingAlerts.forEach(alert => alert.remove());

                // 創建新 alert
                const alertHtml = `
                    <div class="alert ${alertClass} alert-dismissible fade show shadow-sm border-0" role="alert" style="border-radius: 0.75rem;">
                        <div class="d-flex align-items-center">
                            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'error' || type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} me-3 fs-5"></i>
                            <div class="flex-grow-1">${message}</div>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', alertHtml);

                // 自動消失
                setTimeout(() => {
                    const alertElement = container.querySelector('.alert');
                    if (alertElement) {
                        alertElement.style.opacity = '0';
                        setTimeout(() => alertElement.remove(), 300);
                    }
                }, 5000);
            } else {
                // 如果 globalAlertContainer 不存在，回退到頁面頂部
                console.warn('Global alert container not found. Using fallback.');
                const fallbackContainer = document.querySelector('.container-fluid') || document.querySelector('.container') || document.body;
                const alertHtml = `
                    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                        ${message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
                fallbackContainer.insertAdjacentHTML('afterbegin', alertHtml);
                setTimeout(() => {
                    const alertElement = fallbackContainer.querySelector('.alert');
                    if (alertElement) alertElement.remove();
                }, 5000);
            }
        }
    }
}

// =============================================================================
// View 頁面功能 (View Page Functions)
// =============================================================================

/**
 * 初始化產品查看頁面
 */
function initializeProductView() {
    // 初始化圖片數據
    initializeImageData();

    // 生成條形碼 - 等待 JsBarcode 庫加載完成
    waitForJsBarcode();

    // 綁定鍵盤事件
    bindKeyboardEvents();
}

/**
 * 初始化圖片數據
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
 * 綁定鍵盤事件
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
        }
    });
}

// =============================================================================
// 圖片切換功能 (Image Switching Functions)
// =============================================================================

/**
 * 切換主圖片
 * @param {string} imageSrc 圖片URL
 * @param {HTMLElement} thumbnailElement 縮略圖元素
 * @param {number} index 圖片索引
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
 * 上一張圖片
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
 * 下一張圖片
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
 * 更新圖片計數器
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
// 條形碼功能 (Barcode Functions)
// =============================================================================

/**
 * 等待 JsBarcode 庫加載完成
 */
function waitForJsBarcode() {
    let attempts = 0;
    const maxAttempts = 50; // 最多等待5秒 (50 * 100ms)

    function checkJsBarcode() {
        attempts++;

        if (typeof JsBarcode !== 'undefined') {
            generateBarcode();
        } else if (attempts < maxAttempts) {
            setTimeout(checkJsBarcode, 100);
        } else {
            console.error('JsBarcode library failed to load after maximum attempts');
        }
    }

    checkJsBarcode();
}

/**
 * 生成條形碼
 */
function generateBarcode() {
    try {
        // 檢查 JsBarcode 庫是否已加載
        if (typeof JsBarcode === 'undefined') {
            console.error('JsBarcode library not loaded');
            return;
        }

        const barcodeCanvas = document.getElementById('barcodeCanvas');
        const barcodeNumberElement = document.getElementById('barcode-number');
        const barcodeNumber = barcodeNumberElement?.textContent?.trim();

        if (barcodeCanvas && barcodeNumber) {
            JsBarcode(barcodeCanvas, barcodeNumber, {
                format: "CODE128",
                width: 2,
                height: 60,
                displayValue: false,
                background: "#ffffff",
                lineColor: "#000000",
            });
        } else {
            console.error('Missing elements: barcodeCanvas or barcodeNumber');
        }
    } catch (error) {
        console.error('Error in generateBarcode function:', error);
    }
}

/**
 * 複製條形碼
 * @param {string} barcodeNumber 條形碼號碼
 * @param {Event} event 觸發事件
 */
function copyBarcode(barcodeNumber, event) {
    // 防止重複觸發
    let isCopied = false;

    // 獲取觸發按鈕
    const btn = event ? event.target.closest('.btn') : null;

    function showSuccessMessage() {
        if (isCopied) return; // 防止重複顯示
        isCopied = true;

        if (typeof showAlert === 'function') {
            showAlert('Barcode copied to clipboard!', 'success');
        } else {
            const message = 'Barcode copied to clipboard!';
            if (typeof window.safeAlert === 'function') {
                window.safeAlert(message);
            } else if (message && message.trim()) {
                alert(message);
            }
        }

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

    function showErrorMessage(message) {
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return;
        }
        if (typeof showAlert === 'function') {
            showAlert(message, 'error');
        } else if (typeof window.safeAlert === 'function') {
            window.safeAlert(message);
        } else if (message && message.trim()) {
            alert(message);
        }
    }

    function fallbackCopyTextToClipboard(text) {
        if (isCopied) return; // 如果已經複製成功，不再執行 fallback

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
                if (!isCopied) {
                    fallbackCopyTextToClipboard(barcodeNumber);
                }
            });
        } else {
            if (!isCopied) {
                fallbackCopyTextToClipboard(barcodeNumber);
            }
        }
    }).catch(function(err) {
        if (!isCopied) {
            fallbackCopyTextToClipboard(barcodeNumber);
        }
    });
}

// =============================================================================
// SKU和Barcode生成功能 (SKU & Barcode Generation)
// =============================================================================

/**
 * 生成SKU代码
 */
function generateSKU() {
    // 自动检测当前上下文（标准页面、create modal 或 update modal）
    const skuInput = document.getElementById('update_sku_code') || document.getElementById('sku_code');
    if (skuInput) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

        skuInput.value = `PRD-${year}${month}${day}-${random}`;
        console.log('SKU generated:', skuInput.value);
        return skuInput.value;
    }
    return '';
}

/**
 * 生成Barcode代码 (用于表单输入)
 */
function generateBarcodeNumber() {
    // 自动检测当前上下文（标准页面、create modal 或 update modal）
    const barcodeInput = document.getElementById('update_barcode_number') || document.getElementById('barcode_number');
    if (barcodeInput) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');

        barcodeInput.value = `PRD${year}${month}${day}${random}`;
        console.log('Barcode generated:', barcodeInput.value);
        return barcodeInput.value;
    }
    return '';
}

/**
 * 生成新的SKU和条形码
 */
function generateNewCodes() {
    // 自动检测当前上下文（标准页面、create modal 或 update modal）
    let categorySelect, brandSelect, colorSelect, skuInput, barcodeInput;

    // 检测是否在 update modal 中
    if (document.getElementById('update_sku_code')) {
        categorySelect = document.getElementById('update_category_id');
        brandSelect = document.getElementById('update_brand_id');
        colorSelect = document.getElementById('update_color_id');
        skuInput = document.getElementById('update_sku_code');
        barcodeInput = document.getElementById('update_barcode_number');
    }
    // 检测是否在 create modal 或标准页面中
    else {
        categorySelect = document.getElementById('create_category_id') || document.querySelector('select[name="category_id"]');
        brandSelect = document.getElementById('create_brand_id') || document.querySelector('select[name="brand_id"]');
        colorSelect = document.getElementById('create_color_id') || document.querySelector('select[name="color_id"]');
        skuInput = document.getElementById('sku_code');
        barcodeInput = document.getElementById('barcode_number');
    }

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
    // 支持标准 ID 和 update 前缀的 ID
    const categorySelect = document.querySelector('#update_category_id') || document.querySelector('select[name="category_id"]');
    const subcategorySelect = document.querySelector('#update_subcategory_id') || document.querySelector('select[name="subcategory_id"]');
    const zoneSelect = document.querySelector('#update_zone_id') || document.querySelector('select[name="zone_id"]');
    const rackSelect = document.querySelector('#update_rack_id') || document.querySelector('select[name="rack_id"]');
    const sizeSelect = document.querySelector('#update_size_id') || document.querySelector('select[name="size_id"]');

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

    // Update页面或Update Modal特殊处理
    const isUpdatePage = window.location.pathname.includes('/edit/') || window.location.pathname.includes('/update/');
    const isUpdateModal = categorySelect && categorySelect.id && categorySelect.id.includes('update');

    if ((isUpdatePage || isUpdateModal) && rackSelect && subcategorySelect) {
        const selectedRackId = rackSelect.value;
        const selectedSubCategoryId = subcategorySelect.value;

        if (!zoneSelect || !zoneSelect.value) {
            if (isUpdateModal) {
                $('#update_rack_id').prop('disabled', true).empty().append('<option value="">Select Rack</option>');
            } else {
                resetRackSelect();
            }
        } else {
            loadRacks(zoneSelect.value, selectedRackId);
        }

        if (!categorySelect || !categorySelect.value) {
            if (isUpdateModal) {
                $('#update_subcategory_id').prop('disabled', true).empty().append('<option value="">Select Subcategory</option>');
                $('#update_size_id').prop('disabled', true).empty().append('<option value="">Select Size</option>');
            } else {
                resetSubCategorySelect();
                resetSizeSelect();
            }
        } else {
            loadSubcategories(categorySelect.value, selectedSubCategoryId);
            loadSizes(categorySelect.value, sizeSelect ? sizeSelect.value : null);
        }
    } else {
        if (isUpdateModal) {
            $('#update_rack_id').prop('disabled', true).empty().append('<option value="">Select Rack</option>');
            $('#update_subcategory_id').prop('disabled', true).empty().append('<option value="">Select Subcategory</option>');
            $('#update_size_id').prop('disabled', true).empty().append('<option value="">Select Size</option>');
        } else {
            resetRackSelect();
            resetSubCategorySelect();
            resetSizeSelect();
        }
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
        } else if (typeof window.safeAlert === 'function') {
            window.safeAlert(errorMessage);
        } else if (errorMessage && errorMessage.trim()) {
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
    // 支持标准 ID 和 update 前缀的 ID
    const errorDiv = document.getElementById('update-rack-capacity-error') || document.getElementById('rack-capacity-error');
    const errorText = document.getElementById('update-rack-capacity-error-text') || document.getElementById('rack-capacity-error-text');
    const rackSelect = document.querySelector('#update_rack_id') || document.querySelector('select[name="rack_id"]');

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
    // 支持标准 ID 和 update 前缀的 ID
    const errorDiv = document.getElementById('update-rack-capacity-error') || document.getElementById('rack-capacity-error');
    const rackSelect = document.querySelector('#update_rack_id') || document.querySelector('select[name="rack_id"]');

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
    // 支持标准 ID 和 update 前缀的 ID
    const rackSelect = document.querySelector('#update_rack_id') || document.querySelector('select[name="rack_id"]');
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

                    // 获取容量信息并显示在选项文本中
                    const capacityInfo = getRackCapacityInfo(rack.id);
                    const capacityText = capacityInfo ? ` (${capacityInfo.available}/${capacityInfo.capacity})` : '';
                    option.textContent = (rack.rack_number || rack.rack_name || 'Rack ' + rack.id).toUpperCase() + capacityText;

                    // 设置容量相关的 data 属性
                    if (capacityInfo) {
                        option.dataset.capacity = capacityInfo.capacity;
                        option.dataset.used = capacityInfo.used;
                        option.dataset.available = capacityInfo.available;
                    }

                    if (selectedId && parseInt(rack.id) === parseInt(selectedId)) {
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
    // 支持标准 ID 和 update 前缀的 ID
    const subCategorySelect = document.querySelector('#update_subcategory_id') || document.querySelector('select[name="subcategory_id"]');
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

                    if (selectedId && parseInt(subCategory.id) === parseInt(selectedId)) {
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
    // 支持标准 ID 和 update 前缀的 ID
    const sizeSelect = document.querySelector('#update_size_id') || document.querySelector('select[name="size_id"]');
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

                    if (selectedId && parseInt(size.id) === parseInt(selectedId)) {
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
    // 支持标准 ID 和 update 前缀的 ID
    const rackSelect = document.querySelector('#update_rack_id') || document.querySelector('select[name="rack_id"]');
    if (rackSelect) {
        rackSelect.innerHTML = '<option selected disabled value="">Select a rack</option>';
        rackSelect.disabled = true;
        hideRackCapacityError();
    }
}

/**
 * 重置子分类选择框
 */
function resetSubCategorySelect() {
    // 支持标准 ID 和 update 前缀的 ID
    const subCategorySelect = document.querySelector('#update_subcategory_id') || document.querySelector('select[name="subcategory_id"]');
    if (subCategorySelect) {
        subCategorySelect.innerHTML = '<option selected disabled value="">Select a SubCategory</option>';
        subCategorySelect.disabled = true;
    }
}

/**
 * 重置尺寸选择框
 */
function resetSizeSelect() {
    // 支持标准 ID 和 update 前缀的 ID
    const sizeSelect = document.querySelector('#update_size_id') || document.querySelector('select[name="size_id"]');
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
    // 自动检测当前上下文（标准页面、create modal 或 update modal）
    let regenerateSkuBtn, regenerateBarcodeBtn, generateCodesBtn;
    let categorySelect, brandSelect, colorSelect, skuInput;

    // 检测是否在 update modal 中
    if (document.getElementById('update_sku_code')) {
        regenerateSkuBtn = document.getElementById('update-regenerate-sku');
        regenerateBarcodeBtn = document.getElementById('update-regenerate-barcode');
        generateCodesBtn = document.getElementById('update-generate-codes-btn');
        categorySelect = document.getElementById('update_category_id');
        brandSelect = document.getElementById('update_brand_id');
        colorSelect = document.getElementById('update_color_id');
        skuInput = document.getElementById('update_sku_code');
    }
    // 检测是否在 create modal 或标准页面中（使用标准 ID）
    else {
        regenerateSkuBtn = document.getElementById('regenerate-sku');
        regenerateBarcodeBtn = document.getElementById('regenerate-barcode');
        generateCodesBtn = document.getElementById('generate-codes-btn');
        categorySelect = document.getElementById('create_category_id') || document.querySelector('select[name="category_id"]');
        brandSelect = document.getElementById('create_brand_id') || document.querySelector('select[name="brand_id"]');
        colorSelect = document.getElementById('create_color_id') || document.querySelector('select[name="color_id"]');
        skuInput = document.getElementById('sku_code');
    }

    // 绑定按钮事件（generateSKU 和 generateBarcodeNumber 函数会自动检测并设置值）
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
// Update Modal 图片删除功能 (Update Modal Image Removal)
// =============================================================================

/**
 * 切换图片删除状态（用于 Update Modal）
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
// Create Product Modal 功能 (Create Product Modal Functions)
// =============================================================================

/**
 * 初始化 Create Product Modal
 */
function initCreateProductModal() {
    const modal = document.getElementById('createProductModal');
    if (!modal) return;

    // Modal 打开时重置表单并初始化功能
    $(modal).on('show.bs.modal', function() {
        resetCreateProductModal();
        loadCreateProductModalData();

        // 初始化图片上传事件
        if (typeof bindProductImageEvents === 'function') {
            bindProductImageEvents();
        }

        // 初始化 SKU/Barcode 生成事件
        bindSKUGenerationEvents();

        // 初始化级联选择事件
        bindCascadingSelectEvents();

        // 生成初始 SKU 和 Barcode
        generateSKU();
        generateBarcodeNumber();
    });

    // Modal 关闭时清理
    $(modal).on('hidden.bs.modal', function() {
        resetCreateProductModal();
    });

    // 提交按钮事件
    $('#submitCreateProduct').on('click', function(e) {
        e.preventDefault();
        submitCreateProductModal();
    });
}

/**
 * 加载 Create Product Modal 所需数据
 */
function loadCreateProductModalData() {
    // 这里需要从服务器获取 categories, zones, brands, colors, sizes 等数据
    // 可以通过 AJAX 调用 create 路由获取，或者从 dashboard 页面传递
    // 暂时使用已有的 window 变量（如果存在）
    if (window.productModalData) {
        populateCreateProductSelects(window.productModalData);
    } else {
        // 如果没有预加载数据，可以通过 AJAX 获取
        fetch(window.createProductDataUrl || window.productManagementRoute + '/create-data', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateCreateProductSelects(data.data);
            }
        })
        .catch(error => {
            console.error('Error loading create product data:', error);
        });
    }
}

/**
 * 填充 Create Product Modal 的选择框
 */
function populateCreateProductSelects(data) {
    // 保存数据到全局变量，供级联选择使用
    if (data.locations) {
        window.locationsData = data.locations;
    }
    if (data.mappings) {
        window.mappingsData = data.mappings;
    }
    if (data.sizes) {
        window.sizesData = data.sizes;
    }
    if (data.rackCapacities) {
        window.rackCapacitiesData = data.rackCapacities;
    }

    // Zones
    if (data.zones) {
        const zoneSelect = $('#create_zone_id');
        zoneSelect.empty().append('<option value="">Select Zone</option>');
        data.zones.forEach(zone => {
            zoneSelect.append(`<option value="${zone.id}">${zone.zone_name}</option>`);
        });
    }

    // Categories
    if (data.categories) {
        const categorySelect = $('#create_category_id');
        categorySelect.empty().append('<option value="">Select Category</option>');
        data.categories.forEach(category => {
            categorySelect.append(`<option value="${category.id}">${category.category_name}</option>`);
        });
    }

    // Brands
    if (data.brands) {
        const brandSelect = $('#create_brand_id');
        brandSelect.empty().append('<option value="">Select Brand</option>');
        data.brands.forEach(brand => {
            brandSelect.append(`<option value="${brand.id}">${brand.brand_name}</option>`);
        });
    }

    // Colors
    if (data.colors) {
        const colorSelect = $('#create_color_id');
        colorSelect.empty().append('<option value="">Select Color</option>');
        data.colors.forEach(color => {
            colorSelect.append(`<option value="${color.id}">${color.color_name}</option>`);
        });
    }

    // Sizes - 不直接填充，因为需要根据 category 动态加载
    const sizeSelect = $('#create_size_id');
    if (sizeSelect) {
        sizeSelect.empty().append('<option value="">Select Size</option>');
        sizeSelect.prop('disabled', true);
    }
}

/**
 * 清除所有验证错误
 */
function clearProductValidationErrors() {
    const form = document.getElementById('createProductForm');
    if (!form) return;

    const inputs = form.querySelectorAll('.form-control, select');
    inputs.forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
        const feedback = input.parentElement.querySelector('.invalid-feedback') ||
                        input.closest('.col-12, .col-md-6, .col-md-4')?.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = '';
        }
    });
}

/**
 * 显示字段级验证错误
 */
function displayProductValidationErrors(errors) {
    // 清除之前的错误
    clearProductValidationErrors();

    // 为每个字段显示错误
    Object.keys(errors).forEach(field => {
        // 尝试多种可能的字段名格式
        let input = null;

        // 先尝试通过 id 查找（处理 create_xxx 格式）
        const fieldName = field.replace('create_', '');
        input = document.getElementById(`create_${fieldName}`) ||
                document.getElementById(fieldName) ||
                document.getElementById(field);

        // 如果通过 id 找不到，尝试通过 name 属性查找
        if (!input) {
            input = document.querySelector(`[name="${field}"]`) ||
                    document.querySelector(`[name="${fieldName}"]`);
        }

        if (input) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');

            // 显示错误消息 - 查找最近的 invalid-feedback
            let feedback = input.parentElement.querySelector('.invalid-feedback');
            if (!feedback) {
                // 尝试在父容器中查找
                const parentContainer = input.closest('.col-12, .col-md-6, .col-md-4, .mb-4');
                if (parentContainer) {
                    feedback = parentContainer.querySelector('.invalid-feedback');
                }
            }

            if (feedback) {
                feedback.textContent = errors[field][0] || `Please enter ${field}.`;
                feedback.style.display = 'block';
            } else {
                // 如果没有 invalid-feedback div，创建一个
                const feedbackDiv = document.createElement('div');
                feedbackDiv.className = 'invalid-feedback';
                feedbackDiv.textContent = errors[field][0] || `Please enter ${field}.`;
                feedbackDiv.style.display = 'block';

                // 添加到输入框的父容器中
                const parentContainer = input.closest('.col-12, .col-md-6, .col-md-4, .mb-4') || input.parentElement;
                if (parentContainer) {
                    parentContainer.appendChild(feedbackDiv);
                }
            }
        } else {
            console.warn(`Field not found for validation error: ${field}`);
        }
    });
}

/**
 * 重置 Create Product Modal
 */
function resetCreateProductModal() {
    // 清除验证错误
    clearProductValidationErrors();
    const form = document.getElementById('createProductForm');
    if (form) {
        form.reset();
    }

    // 重置封面图片
    const coverPreview = document.getElementById('cover-preview');
    const coverPlaceholder = document.getElementById('cover-upload-placeholder');
    const removeCoverBtn = document.getElementById('remove-cover-image');
    const coverInput = document.getElementById('cover_image');

    if (coverPreview) coverPreview.classList.add('d-none');
    if (coverPlaceholder) coverPlaceholder.classList.remove('d-none');
    if (removeCoverBtn) removeCoverBtn.classList.add('d-none');
    if (coverInput) coverInput.value = '';

    // 重置详细图片
    const detailGrid = document.getElementById('detail-images-grid');
    const detailInput = document.getElementById('detail_images');
    if (detailGrid) detailGrid.innerHTML = '';
    if (detailInput) detailInput.value = '';

    // 重置级联选择
    $('#create_rack_id').prop('disabled', true).empty().append('<option value="">Select Rack</option>');
    $('#create_subcategory_id').prop('disabled', true).empty().append('<option value="">Select Subcategory</option>');
    $('#create_size_id').prop('disabled', true).empty().append('<option value="">Select Size</option>');

    // 重置 SKU 和 Barcode
    const skuInput = document.getElementById('sku_code');
    const barcodeInput = document.getElementById('barcode_number');
    if (skuInput) skuInput.value = '';
    if (barcodeInput) barcodeInput.value = '';
}

/**
 * 提交 Create Product Modal
 */
function submitCreateProductModal() {
    const form = document.getElementById('createProductForm');
    const formData = new FormData(form);
    const submitBtn = document.getElementById('submitCreateProduct');

    // 在提交前启用 rack 和 subcategory 选择框
    const rackSelect = document.querySelector('#create_rack_id');
    if (rackSelect && rackSelect.disabled && rackSelect.value) {
        rackSelect.disabled = false;
    }

    const subcategorySelect = document.querySelector('#create_subcategory_id');
    if (subcategorySelect && subcategorySelect.disabled && subcategorySelect.value) {
        subcategorySelect.disabled = false;
    }

    // 显示载入状态
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<i class="bi bi-spinner-border spinner-border-sm me-2"></i>Creating...`;
    submitBtn.disabled = true;

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
        // 先检查响应状态
        if (!response.ok) {
            // 如果是 422 验证错误，返回错误数据
            if (response.status === 422) {
                return response.json().then(data => {
                    throw { status: 422, errors: data.errors || {}, message: data.message || 'Validation failed' };
                });
            }
            // 其他错误，尝试解析 JSON
            return response.json().then(data => {
                throw { status: response.status, message: data.message || 'Request failed' };
            }).catch(() => {
                throw { status: response.status, message: 'Request failed' };
            });
        }
        // 成功响应，解析 JSON
        return response.json();
    })
    .then(data => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (data.success) {
            if (typeof showAlert === 'function') {
                showAlert(data.message, 'success');
            }
            // 关闭 modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createProductModal'));
            if (modal) modal.hide();
            // 刷新页面或更新列表
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
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // 处理验证错误 (422)
        if (error.status === 422 && error.errors) {
            console.log('Displaying validation errors:', error.errors);
            displayProductValidationErrors(error.errors);
            if (typeof showAlert === 'function') {
                showAlert('Please fill in all required fields', 'warning');
            }
        } else {
            // 显示错误消息
            const errorMessage = error.message || 'An error occurred while creating the product';
            if (typeof showAlert === 'function') {
                showAlert(errorMessage, 'error');
            }
        }
    });
}

// =============================================================================
// Update Product Modal 功能 (Update Product Modal Functions)
// =============================================================================

/**
 * 打開更新產品 Modal
 */
function openUpdateProductModal(productId) {
    const url = window.editProductUrl.replace(':id', productId);
    const modal = document.getElementById('updateProductModal');

    // 先加载数据，然后再显示 modal（避免闪烁）
    // 从 API 获取完整产品数据
    $.ajax({
        url: url,
        type: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        },
        success: (response) => {
            if (response.success && response.data) {
                // 先加载级联选择的数据，然后填充表单，最后显示 modal
                loadUpdateProductModalData().then(() => {
                    fillUpdateProductModal(response.data);
                    // 数据填充完成后再显示 modal
                    const bsModal = new bootstrap.Modal(modal);
                    bsModal.show();
                });
            } else {
                if (typeof showAlert === 'function') {
                    showAlert(response.message || 'Failed to load product data', 'error');
                } else {
                    alert(response.message || 'Failed to load product data');
                }
            }
        },
        error: (xhr) => {
            let errorMessage = 'Failed to load product data';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }
            if (typeof showAlert === 'function') {
                showAlert(errorMessage, 'error');
            } else {
                alert(errorMessage);
            }
        }
    });
}

/**
 * 填充更新产品 Modal 表单
 */
function fillUpdateProductModal(data) {
    // 基本信息
    $('#update_product_name').val(data.name || '');
    $('#update_product_price').val(data.price || '');
    $('#update_product_quantity').val(data.quantity || '');
    $('#update_product_description').val(data.description || '');
    $('#update_sku_code').val(data.sku_code || '');
    $('#update_barcode_number').val(data.barcode_number || '');

    // 设置表单 action
    const updateUrl = window.updateProductUrl.replace(':id', data.id);
    $('#updateProductForm').attr('action', updateUrl);

    // 状态
    if (data.product_status === 'Available') {
        $('#update_status_available').prop('checked', true);
        $('.status-card[data-status="Available"]').addClass('selected');
        $('.status-card[data-status="Unavailable"]').removeClass('selected');
    } else {
        $('#update_status_unavailable').prop('checked', true);
        $('.status-card[data-status="Unavailable"]').addClass('selected');
        $('.status-card[data-status="Available"]').removeClass('selected');
    }

    // 级联选择：参考旧的 update 页面处理方式
    // 先设置父级选择框的值，然后调用 loadRacks/loadSubcategories/loadSizes 并传递 selectedId
    if (data.zone_id) {
        $('#update_zone_id').val(data.zone_id);
        // 直接调用 loadRacks 并传递 selectedId，这样会在加载选项时自动选中
        if (typeof loadRacks === 'function') {
            loadRacks(data.zone_id, data.rack_id);
        } else {
            // 如果 loadRacks 还没加载，触发 change 事件
            $('#update_zone_id').trigger('change');
            setTimeout(() => {
                if (data.rack_id) {
                    $('#update_rack_id').val(data.rack_id);
                }
            }, 500);
        }
    }

    if (data.category_id) {
        $('#update_category_id').val(data.category_id);
        // 直接调用 loadSubcategories 和 loadSizes 并传递 selectedId
        if (typeof loadSubcategories === 'function') {
            loadSubcategories(data.category_id, data.subcategory_id);
        } else {
            $('#update_category_id').trigger('change');
            setTimeout(() => {
                if (data.subcategory_id) {
                    $('#update_subcategory_id').val(data.subcategory_id).trigger('change');
                }
            }, 500);
        }

        if (typeof loadSizes === 'function') {
            loadSizes(data.category_id, data.size_id);
        } else {
            setTimeout(() => {
                if (data.size_id) {
                    $('#update_size_id').val(data.size_id);
                }
            }, 500);
        }
    }

    // 设置其他独立的选择框
    if (data.brand_id) {
        $('#update_brand_id').val(data.brand_id);
    }
    if (data.color_id) {
        $('#update_color_id').val(data.color_id);
    }
    if (data.gender) {
        $('#update_gender').val(data.gender);
    }

    // 封面图片
    if (data.cover_image) {
        const coverImagePath = '/assets/images/' + data.cover_image;
        $('#update-cover-preview').attr('src', coverImagePath).removeClass('d-none');
        $('#update-cover-upload-placeholder').addClass('d-none');
        $('#remove-update-cover-image').removeClass('d-none');
    } else {
        $('#update-cover-preview').addClass('d-none');
        $('#update-cover-upload-placeholder').removeClass('d-none');
        $('#remove-update-cover-image').addClass('d-none');
    }

    // 详细图片
    const detailImagesGrid = $('#update-detail-images-grid');
    detailImagesGrid.empty();
    if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
            const imageItem = $(`
                <div class="detail-image-item">
                    <img src="/assets/images/${image.detail_image}" alt="Detail Image">
                    <button type="button" class="remove-btn" onclick="toggleImageRemoval(this, ${image.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                    <input type="checkbox" name="remove_image[]" value="${image.id}" id="remove_image_${image.id}" class="d-none">
                </div>
            `);
            detailImagesGrid.append(imageItem);
        });
    }
}

/**
 * 初始化 Update Product Modal
 */
function initUpdateProductModal() {
    const modal = document.getElementById('updateProductModal');
    if (!modal) return;

    // Modal 打开时初始化功能
    $(modal).on('show.bs.modal', function() {
        // 初始化图片上传事件（使用 update 前缀的 ID）
        initUpdateModalImageSystem();

        // 初始化 SKU/Barcode 生成事件（使用 update 前缀的 ID）
        bindUpdateModalSKUGenerationEvents();

        // 如果数据还没有加载，则加载级联选择所需的数据
        // 注意：如果 openUpdateProductModal 已经加载了数据，这里就不需要重复加载
        if (!window.productModalData || !window.locationsData || !window.mappingsData || !window.sizesData) {
            loadUpdateProductModalData().then(() => {
                // 数据加载完成后再绑定级联选择事件
                bindCascadingSelectEvents();
            });
        } else {
            // 数据已经加载，直接绑定级联选择事件
            bindCascadingSelectEvents();
        }
    });

    // Modal 关闭时清理
    $(modal).on('hidden.bs.modal', function() {
        resetUpdateProductModal();
        // 手动清理 backdrop，确保 modal 完全关闭
        cleanupModalBackdrop();
    });

    // 提交按钮事件
    $('#submitUpdateProduct').on('click', function(e) {
        e.preventDefault();
        submitUpdateProductModal();
    });
}

/**
 * 初始化 Update Modal 图片系统
 */
function initUpdateModalImageSystem() {
    // 封面图片事件
    const coverImageArea = document.getElementById('update-cover-image-area');
    const coverImageInput = document.getElementById('update_cover_image');
    const removeCoverBtn = document.getElementById('remove-update-cover-image');

    if (coverImageArea && coverImageInput) {
        // 移除旧的事件监听器
        const newCoverImageArea = coverImageArea.cloneNode(true);
        coverImageArea.parentNode.replaceChild(newCoverImageArea, coverImageArea);
        const newCoverImageInput = coverImageInput.cloneNode(true);
        coverImageInput.parentNode.replaceChild(newCoverImageInput, coverImageInput);

        // 重新获取元素
        const updatedCoverImageArea = document.getElementById('update-cover-image-area');
        const updatedCoverImageInput = document.getElementById('update_cover_image');
        const updatedRemoveCoverBtn = document.getElementById('remove-update-cover-image');

        updatedCoverImageArea.addEventListener('click', function() {
            updatedCoverImageInput.click();
        });

        updatedCoverImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleUpdateModalCoverImagePreview(file);
            }
        });

        if (updatedRemoveCoverBtn) {
            updatedRemoveCoverBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                removeUpdateModalCoverImage();
            });
        }
    }

    // 详细图片事件
    const addDetailImageBtn = document.getElementById('add-update-detail-image');
    const detailImagesInput = document.getElementById('update_detail_images');

    if (addDetailImageBtn && detailImagesInput) {
        addDetailImageBtn.addEventListener('click', function() {
            detailImagesInput.click();
        });

        detailImagesInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                handleUpdateModalDetailImagePreview(file);
            });
        });
    }
}

/**
 * 处理 Update Modal 封面图片预览
 */
function handleUpdateModalCoverImagePreview(file) {
    if (typeof validateImageFile === 'function' && !validateImageFile(file)) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('update-cover-preview');
        const placeholder = document.getElementById('update-cover-upload-placeholder');
        const removeBtn = document.getElementById('remove-update-cover-image');

        if (preview) {
            preview.src = e.target.result;
            preview.classList.remove('d-none');
        }
        if (placeholder) {
            placeholder.classList.add('d-none');
        }
        if (removeBtn) {
            removeBtn.classList.remove('d-none');
        }
    };
    reader.readAsDataURL(file);
}

/**
 * 移除 Update Modal 封面图片
 */
function removeUpdateModalCoverImage() {
    const preview = document.getElementById('update-cover-preview');
    const placeholder = document.getElementById('update-cover-upload-placeholder');
    const removeBtn = document.getElementById('remove-update-cover-image');
    const input = document.getElementById('update_cover_image');
    const removeInput = document.getElementById('update_remove_cover_image');

    if (preview) {
        preview.src = '';
        preview.classList.add('d-none');
    }
    if (placeholder) {
        placeholder.classList.remove('d-none');
    }
    if (removeBtn) {
        removeBtn.classList.add('d-none');
    }
    if (input) {
        input.value = '';
    }
    if (removeInput) {
        removeInput.value = '1';
    }
}

/**
 * 处理 Update Modal 详细图片预览
 */
function handleUpdateModalDetailImagePreview(file) {
    if (typeof validateImageFile === 'function' && !validateImageFile(file)) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const grid = document.getElementById('update-detail-images-grid');
        if (!grid) return;

        const imageItem = document.createElement('div');
        imageItem.className = 'detail-image-item';
        imageItem.innerHTML = `
            <img src="${e.target.result}" alt="Detail Image">
            <button type="button" class="remove-btn" onclick="removeUpdateModalDetailImage(this)">
                <i class="bi bi-trash"></i>
            </button>
        `;
        grid.appendChild(imageItem);
    };
    reader.readAsDataURL(file);
}

/**
 * 移除 Update Modal 详细图片
 */
function removeUpdateModalDetailImage(btn) {
    if (btn && btn.closest('.detail-image-item')) {
        btn.closest('.detail-image-item').remove();
    }
}

/**
 * 绑定 Update Modal SKU/Barcode 生成事件
 */
function bindUpdateModalSKUGenerationEvents() {
    const regenerateSkuBtn = document.getElementById('update-regenerate-sku');
    const regenerateBarcodeBtn = document.getElementById('update-regenerate-barcode');
    const generateCodesBtn = document.getElementById('update-generate-codes-btn');
    const skuInput = document.getElementById('update_sku_code');
    const barcodeInput = document.getElementById('update_barcode_number');

    if (regenerateSkuBtn && skuInput) {
        regenerateSkuBtn.addEventListener('click', function() {
            if (typeof generateSKU === 'function') {
                const newSKU = generateSKU();
                skuInput.value = newSKU;
            }
        });
    }

    if (regenerateBarcodeBtn && barcodeInput) {
        regenerateBarcodeBtn.addEventListener('click', function() {
            if (typeof generateBarcodeNumber === 'function') {
                const newBarcode = generateBarcodeNumber();
                barcodeInput.value = newBarcode;
            }
        });
    }

    if (generateCodesBtn && skuInput && barcodeInput) {
        generateCodesBtn.addEventListener('click', function() {
            if (typeof generateSKU === 'function' && typeof generateBarcodeNumber === 'function') {
                const newSKU = generateSKU();
                const newBarcode = generateBarcodeNumber();
                skuInput.value = newSKU;
                barcodeInput.value = newBarcode;
                if (typeof showAlert === 'function') {
                    showAlert('SKU and Barcode generated successfully!', 'success');
                }
            }
        });
    }
}

/**
 * 加载 Update Product Modal 所需数据
 */
function loadUpdateProductModalData() {
    return new Promise((resolve, reject) => {
        // 如果已经有预加载的数据，直接使用
        if (window.productModalData) {
            populateUpdateProductSelects(window.productModalData);
            // 等待 DOM 更新完成
            setTimeout(() => resolve(), 100);
        } else {
            // 如果没有预加载数据，可以通过 AJAX 获取
            fetch(window.createProductDataUrl || window.productManagementRoute + '/create-data', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    populateUpdateProductSelects(data.data);
                    // 等待 DOM 更新完成
                    setTimeout(() => resolve(), 100);
                } else {
                    reject(new Error('Failed to load data'));
                }
            })
            .catch(error => {
                console.error('Error loading update product data:', error);
                reject(error);
            });
        }
    });
}

/**
 * 填充 Update Product Modal 的选择框
 */
function populateUpdateProductSelects(data) {
    // 保存数据到全局变量，供级联选择使用
    if (data.locations) {
        window.locationsData = data.locations;
    }
    if (data.mappings) {
        window.mappingsData = data.mappings;
    }
    if (data.sizes) {
        window.sizesData = data.sizes;
    }
    if (data.rackCapacities) {
        window.rackCapacitiesData = data.rackCapacities;
    }

    // Zones
    if (data.zones) {
        const zoneSelect = $('#update_zone_id');
        zoneSelect.empty().append('<option value="">Select Zone</option>');
        data.zones.forEach(zone => {
            zoneSelect.append(`<option value="${zone.id}">${zone.zone_name}</option>`);
        });
    }

    // Categories
    if (data.categories) {
        const categorySelect = $('#update_category_id');
        categorySelect.empty().append('<option value="">Select Category</option>');
        data.categories.forEach(category => {
            categorySelect.append(`<option value="${category.id}">${category.category_name}</option>`);
        });
    }

    // Brands
    if (data.brands) {
        const brandSelect = $('#update_brand_id');
        brandSelect.empty().append('<option value="">Select Brand</option>');
        data.brands.forEach(brand => {
            brandSelect.append(`<option value="${brand.id}">${brand.brand_name}</option>`);
        });
    }

    // Colors
    if (data.colors) {
        const colorSelect = $('#update_color_id');
        colorSelect.empty().append('<option value="">Select Color</option>');
        data.colors.forEach(color => {
            colorSelect.append(`<option value="${color.id}">${color.color_name}</option>`);
        });
    }
}

/**
 * 重置 Update Product Modal
 */
function resetUpdateProductModal() {
    const form = document.getElementById('updateProductForm');
    if (form) {
        form.reset();
    }

    // 重置封面图片
    const coverPreview = document.getElementById('update-cover-preview');
    const coverPlaceholder = document.getElementById('update-cover-upload-placeholder');
    const removeCoverBtn = document.getElementById('remove-update-cover-image');
    const coverInput = document.getElementById('update_cover_image');
    const removeCoverInput = document.getElementById('update_remove_cover_image');

    if (coverPreview) {
        coverPreview.src = '';
        coverPreview.classList.add('d-none');
    }
    if (coverPlaceholder) {
        coverPlaceholder.classList.remove('d-none');
    }
    if (removeCoverBtn) {
        removeCoverBtn.classList.add('d-none');
    }
    if (coverInput) {
        coverInput.value = '';
    }
    if (removeCoverInput) {
        removeCoverInput.value = '0';
    }

    // 重置详细图片
    const detailGrid = document.getElementById('update-detail-images-grid');
    const detailInput = document.getElementById('update_detail_images');
    if (detailGrid) {
        detailGrid.innerHTML = '';
    }
    if (detailInput) {
        detailInput.value = '';
    }

    // 重置级联选择
    $('#update_rack_id').prop('disabled', true).empty().append('<option value="">Select Rack</option>');
    $('#update_subcategory_id').prop('disabled', true).empty().append('<option value="">Select Subcategory</option>');
    $('#update_size_id').prop('disabled', true).empty().append('<option value="">Select Size</option>');
}

/**
 * 提交 Update Product Modal
 */
function submitUpdateProductModal() {
    const form = document.getElementById('updateProductForm');
    const formData = new FormData(form);
    const submitBtn = document.getElementById('submitUpdateProduct');

    // 在提交前启用 rack 和 subcategory 选择框
    const rackSelect = document.querySelector('#update_rack_id');
    if (rackSelect && rackSelect.disabled && rackSelect.value) {
        rackSelect.disabled = false;
    }

    const subcategorySelect = document.querySelector('#update_subcategory_id');
    if (subcategorySelect && subcategorySelect.disabled && subcategorySelect.value) {
        subcategorySelect.disabled = false;
    }

    // 显示载入状态
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<i class="bi bi-spinner-border spinner-border-sm me-2"></i>Updating...`;
    submitBtn.disabled = true;

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
            'X-HTTP-Method-Override': 'PUT'
        }
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (data.success) {
            if (typeof showAlert === 'function') {
                showAlert(data.message, 'success');
            }
            // 关闭 modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('updateProductModal'));
            if (modal) modal.hide();
            // 刷新页面或更新列表
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
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        if (typeof showAlert === 'function') {
            showAlert('An error occurred while updating the product', 'error');
        }
    });
}

// 为了向后兼容，保留旧的函数名（这些函数在全局实例初始化时导出）

// 图片切换函数
window.switchMainImage = switchMainImage;
window.previousImage = previousImage;
window.nextImage = nextImage;
window.updateImageCounter = updateImageCounter;

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

// =============================================================================
// 全局實例初始化 (Global Instance Initialization)
// =============================================================================

let productDashboard;

$(document).ready(function() {
    // Dashboard 頁面初始化
    if ($("#product-card-container").length > 0) {
        productDashboard = new ProductDashboard();

        // 導出方法到全局作用域
        window.editProduct = (productId) => productDashboard.editProduct(productId);
        window.deleteProduct = (productId) => productDashboard.deleteProduct(productId);
        window.setAvailable = (productId) => productDashboard.setAvailable(productId);
        window.setUnavailable = (productId) => productDashboard.setUnavailable(productId);
        window.setProductAvailable = (productId) => productDashboard.setAvailable(productId);
        window.setProductUnavailable = (productId) => productDashboard.setUnavailable(productId);
        window.activateProduct = (productId) => productDashboard.setAvailable(productId);
        window.deactivateProduct = (productId) => productDashboard.setUnavailable(productId);
        window.productManager = productDashboard;
    }

    // View 頁面初始化
    const barcodeCanvas = document.getElementById('barcodeCanvas');
    const barcodeSection = document.querySelector('.barcode-section');
    if (barcodeCanvas || barcodeSection) {
        initializeProductView();

        // 初始化 Update Modal
        if ($("#updateProductModal").length > 0) {
            initUpdateProductModal();
        }

        // 為 View 頁面導出操作函數（如果 Dashboard 實例不存在，創建臨時實例）
        if (!productDashboard) {
            // 創建臨時的 Dashboard 實例用於操作函數
            // 注意：這會觸發 fetchProducts，但 View 頁面沒有產品列表容器，所以會失敗但不影響功能
            productDashboard = new ProductDashboard();
        }

        // 導出方法到全局作用域（View 頁面使用）
        if (!window.setAvailable || !window.setUnavailable) {
            window.editProduct = (productId) => productDashboard.editProduct(productId);
            window.deleteProduct = (productId) => productDashboard.deleteProduct(productId);
            window.setAvailable = (productId) => productDashboard.setAvailable(productId);
            window.setUnavailable = (productId) => productDashboard.setUnavailable(productId);
            window.setProductAvailable = (productId) => productDashboard.setAvailable(productId);
            window.setProductUnavailable = (productId) => productDashboard.setUnavailable(productId);
            window.activateProduct = (productId) => productDashboard.setAvailable(productId);
            window.deactivateProduct = (productId) => productDashboard.setUnavailable(productId);
        }
    }

    // Dashboard 頁面 - 初始化 Create Modal
    if ($("#createProductModal").length > 0) {
        initCreateProductModal();
    }

    // View 或 Dashboard 頁面 - 初始化 Update Modal
    if ($("#updateProductModal").length > 0) {
        initUpdateProductModal();
    }
});

/**
 * 清理 modal backdrop
 */
function cleanupModalBackdrop() {
    // 移除所有 modal backdrop
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    // 移除 body 上的 modal 相关类
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

