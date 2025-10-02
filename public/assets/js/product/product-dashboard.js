// =============================================================================
// Product Dashboard JavaScript
// 功能：产品列表展示、搜索、筛选、分页
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // 检查是否在dashboard页面
    if (document.getElementById('product-card-container')) {
        // 传递路由信息到 JavaScript (从dashboard.blade.php获取)
        window.productManagementRoute = document.getElementById('product-card-container').dataset.url;
        window.viewProductUrl = document.getElementById('product-card-container').dataset.viewUrl;

        const productManager = new ProductManagement();
        window.productManager = productManager; // 保存到全局变量
        productManager.init();
    }
});

class ProductManagement {
    constructor() {
        this.currentPage = 1;
        this.perPage = 16;
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

                // 如果搜索为空，重置筛选器
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

        // 分页按钮事件
        this.bindPaginationEvents();
    }

    selectCategory(item) {
        const categoryId = item.dataset.category || '';

        // 移除所有active类
        document.querySelectorAll('.filter-option[data-category]').forEach(el => {
            el.classList.remove('active');
        });

        // 添加active类到当前项
        item.classList.add('active');

        // 如果选择的是"All Categories"，清空子分类和品牌筛选
        if (!categoryId) {
            document.querySelectorAll('.filter-checkbox-input[data-subcategory]:checked').forEach(cb => cb.checked = false);
            document.querySelectorAll('.filter-checkbox-input[data-brand]:checked').forEach(cb => cb.checked = false);
            this.filters.subcategory = [];
            this.filters.brand = [];
        }

        // 更新筛选器
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
        // 重置搜索
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        // 重置分类
        document.querySelectorAll('.filter-option[data-category]').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector('.filter-option[data-category=""]').classList.add('active');

        // 重置子分类和品牌
        document.querySelectorAll('.filter-checkbox-input[data-subcategory]:checked').forEach(cb => cb.checked = false);
        document.querySelectorAll('.filter-checkbox-input[data-brand]:checked').forEach(cb => cb.checked = false);

        // 重置筛选器状态
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

    bindPaginationEvents() {
        const paginationElement = document.getElementById('pagination');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');

        // 分页按钮点击事件
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

        // 上一页按钮
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!prevPageBtn.classList.contains('disabled') && this.currentPage > 1) {
                    this.currentPage = this.currentPage - 1;
                    this.loadProducts();
                }
            });
        }

        // 下一页按钮
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

            // 处理数组参数
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
            this.showError('Failed to load products: ' + error.message);
        }
    }

    renderProducts() {
        const container = document.getElementById('product-card-container');
        const noResults = document.getElementById('no-results');

        if (!this.products || this.products.length === 0) {
            this.showNoResults();
            return;
        }

        noResults.style.display = 'none';
        container.style.display = 'flex'; // Ensure container is visible
        container.innerHTML = this.products.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        return `
            <div class="col-sm-6 col-md-4 col-lg-3">
                <div class="product-card h-100">
                    <div class="image-container">
                        ${product.cover_image ?
                            `<img src="/assets/images/products/${product.cover_image}"
                                  alt="Product Image"
                                  class="preview-image">` :
                            '<div class="no-image">No image available</div>'
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
        const noResults = document.getElementById('no-results');

        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-muted">
                    <i class="bi bi-search display-4"></i>
                    <h4 class="mt-3">No products found</h4>
                    <p class="mb-0">Try adjusting your search or filter criteria</p>
                </div>
            </div>
        `;
        noResults.style.display = 'block';
        container.style.display = 'block'; // Ensure container is visible even with no results
    }

    generatePagination(data) {
        const paginationElement = document.getElementById('pagination');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');

        if (!paginationElement || !prevPageBtn || !nextPageBtn) return;

        // 移除现有的分页按钮（除了prev和next）
        const existingPages = paginationElement.querySelectorAll('li:not(#prev-page):not(#next-page)');
        existingPages.forEach(page => page.remove());

        let paginationHTML = '';
        prevPageBtn.classList.toggle('disabled', data.current_page === 1);

        if (data.last_page > 7) {
            // Logic for displaying a limited number of pages with ellipses
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
        container.style.display = 'block';
        document.getElementById('no-results').style.display = 'none';
    }
}

// 全局函数，供其他脚本调用
function showAlert(message, type = 'success') {
    // 创建提示框
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // 插入到页面顶部
    const container = document.querySelector('.container-fluid');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);

        // 自动隐藏
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}
