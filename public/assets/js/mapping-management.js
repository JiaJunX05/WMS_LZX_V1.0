/**
 * Category Mapping Management JavaScript
 * 分類映射管理統一交互邏輯
 *
 * 功能模塊：
 * - Dashboard 頁面：搜索、篩選、分頁、CRUD 操作
 * - Create 頁面：批量創建、表單驗證、狀態管理
 * - Update 頁面：編輯更新、表單提交
 * - View 頁面：查看詳情、刪除操作
 * - 通用功能：API 請求、UI 更新、事件綁定
 *
 * @author WMS Team
 * @version 1.0.0
 */

// =============================================================================
// 全局變量和狀態管理 (Global Variables and State Management)
// =============================================================================

// 映射列表數組（用於 Create 頁面）
let mappingList = [];

// 排序狀態：true = 升序，false = 降序
let isAscending = true; // 默認升序

// 全局變量防止重複請求
let isDeleting = false;

// =============================================================================
// 通用功能模塊 (Common Functions Module)
// =============================================================================

/**
 * 驗證映射表單
 */
function validateMappingForm() {
    const categoryId = document.getElementById('category_id').value;
    const subcategoryId = document.getElementById('subcategory_id').value;

    if (!categoryId) {
        window.showAlert('Please select a category', 'warning');
        return false;
    }

    if (!subcategoryId) {
        window.showAlert('Please select a subcategory', 'warning');
        return false;
    }

    return true;
}

/**
 * 處理映射請求
 */
function handleMappingRequest(url, method, data, onSuccess, onError) {
    const headers = {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        'X-Requested-With': 'XMLHttpRequest'
    };

    // 如果不是 FormData，添加 Content-Type
    if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    fetch(url, {
        method: method,
        body: data,
        headers: headers
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Server error');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            if (onSuccess) onSuccess(data);
        } else {
            if (onError) onError(data.message || 'Operation failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (onError) onError(error.message);
    });
}

/**
 * 創建映射
 */
function createMapping(mappingData, onSuccess, onError) {
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加映射數據
    mappingData.forEach((mapping, index) => {
        formData.append(`mappings[${index}][category_id]`, mapping.categoryId);
        formData.append(`mappings[${index}][subcategory_id]`, mapping.subcategoryId);
        formData.append(`mappings[${index}][mapping_status]`, mapping.status || 'Available');
    });

    handleMappingRequest(
        window.createMappingUrl,
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 更新映射
 */
function updateMapping(mappingId, formData, onSuccess, onError) {
    formData.append('_method', 'PUT');

    handleMappingRequest(
        window.updateMappingUrl.replace(':id', mappingId),
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 刪除映射
 */
function deleteMapping(mappingId, onSuccess, onError) {
    handleMappingRequest(
        window.deleteMappingUrl.replace(':id', mappingId),
        'DELETE',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置映射為可用
 */
function setMappingAvailable(mappingId, onSuccess, onError) {
    handleMappingRequest(
        window.availableMappingUrl.replace(':id', mappingId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置映射為不可用
 */
function setMappingUnavailable(mappingId, onSuccess, onError) {
    handleMappingRequest(
        window.unavailableMappingUrl.replace(':id', mappingId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 獲取映射狀態類別
 */
function getMappingStatusClass(status) {
    return status === 'Available' ? 'text-success' : 'text-danger';
}

/**
 * 檢查映射是否存在
 */
function isMappingExists(categoryId, subcategoryId) {
    return mappingList.some(mapping =>
        mapping.categoryId === categoryId && mapping.subcategoryId === subcategoryId
    );
}

/**
 * 高亮顯示已存在的映射
 * @param {string} categoryId 分類ID
 * @param {string} subcategoryId 子分類ID
 */
function highlightExistingMapping(categoryId, subcategoryId) {
    // 高亮輸入框
    const categorySelect = document.getElementById('category_id');
    const subcategorySelect = document.getElementById('subcategory_id');

    if (categorySelect) {
        const categoryGroup = categorySelect.closest('.input-group');
        if (categoryGroup) {
            categoryGroup.classList.add('duplicate-highlight');
            setTimeout(() => {
                categoryGroup.classList.remove('duplicate-highlight');
            }, 3000);
        }
    }

    if (subcategorySelect) {
        const subcategoryGroup = subcategorySelect.closest('.input-group');
        if (subcategoryGroup) {
            subcategoryGroup.classList.add('duplicate-highlight');
            setTimeout(() => {
                subcategoryGroup.classList.remove('duplicate-highlight');
            }, 3000);
        }
    }

    // 高亮列表中的重複項
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const itemCategoryId = item.getAttribute('data-category-id');
        const itemSubcategoryId = item.getAttribute('data-subcategory-id');

        if (itemCategoryId === categoryId && itemSubcategoryId === subcategoryId) {
            // 添加高亮樣式
            item.classList.add('border-warning');

            // 滾動到該元素
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 3秒後移除高亮
            setTimeout(() => {
                item.classList.remove('border-warning');
            }, 3000);
            break;
        }
    }
}

/**
 * 更新配置摘要
 */
function updateConfigSummary() {
    const categorySelect = document.getElementById('category_id');
    const subcategorySelect = document.getElementById('subcategory_id');
    const configSummary = document.getElementById('configSummary');

    if (categorySelect && subcategorySelect && configSummary) {
        if (categorySelect.value && subcategorySelect.value) {
            configSummary.classList.remove('d-none');
        } else {
            configSummary.classList.add('d-none');
        }
    }
}

/**
 * 處理分類選擇變化
 */
function handleCategoryChange() {
    // 只更新UI状态，不改变右侧面板
    updateUI();
}

/**
 * 處理子分類選擇變化
 */
function handleSubcategoryChange() {
    // 只更新UI状态，不改变右侧面板
    updateUI();
}

/**
 * 更新映射計數
 */
function updateMappingValuesCount() {
    const count = mappingList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('mappingValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} mappings`;
    }
}

// =============================================================================
// Dashboard 頁面功能 (Dashboard Page Functions)
// =============================================================================

/**
 * 初始化映射儀表板
 */
function initializeMappingDashboard() {
    // 檢查URL參數中的成功消息
    checkUrlParams();

    // 加載映射數據
    loadMappings();

    // 綁定搜索功能
    bindSearchEvents();

    // 綁定篩選功能
    bindFilterEvents();
}

/**
 * 檢查URL參數
 */
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success) {
        if (typeof window.showAlert === 'function') {
            window.showAlert(decodeURIComponent(success), 'success');
        } else {
            alert(decodeURIComponent(success));
        }
        // 清除URL參數
        const url = new URL(window.location);
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url);
    }

    if (error) {
        if (typeof window.showAlert === 'function') {
            window.showAlert(decodeURIComponent(error), 'danger');
        } else {
            alert(decodeURIComponent(error));
        }
        // 清除URL參數
        const url = new URL(window.location);
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url);
    }
}

/**
 * 加載映射數據
 */
function loadMappings() {
    const url = window.categoryMappingManagementRoute;
    console.log('Loading mappings from:', url);

    fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received data:', data);
        if (data.success) {
            renderCategoryCards(data.data);
            updateStatistics(data);
            updatePaginationInfoByCategory(data.data, data.pagination);
        } else {
            if (typeof window.showAlert === 'function') {
                window.showAlert(data.message || 'Failed to load mappings', 'error');
            } else {
                alert(data.message || 'Failed to load mappings');
            }
        }
    })
    .catch(error => {
        console.error('Error loading mappings:', error);
        if (typeof window.showAlert === 'function') {
            window.showAlert('Failed to load mappings', 'error');
        } else {
            alert('Failed to load mappings');
        }
    });
}

/**
 * 渲染分類卡片
 */
function renderCategoryCards(mappings) {
    const container = document.getElementById('dashboard-cards-container');
    const emptyState = document.getElementById('empty-state');

    console.log('Mappings Data:', mappings);

    if (!mappings || mappings.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }

    emptyState.classList.add('d-none');

    // 按分類分組
    const groupedByCategory = groupByCategory(mappings);
    console.log('Grouped by Category:', groupedByCategory);

    // 生成卡片HTML
    let cardsHTML = '';

    Object.keys(groupedByCategory).forEach(categoryId => {
        const categoryData = groupedByCategory[categoryId];
        const category = categoryData.category;
        const mappings = categoryData.mappings;

        console.log(`Category ${categoryId}:`, category, mappings);

        // 確保category數據存在
        if (category && category.category_name) {
            cardsHTML += generateCategoryCard(category, mappings);
        } else {
            console.warn(`Category data missing for category ID ${categoryId}:`, category);
        }
    });

    container.innerHTML = cardsHTML;

    // 綁定卡片內的事件
    bindCardEvents();
}

/**
 * 按分類分組
 */
function groupByCategory(mappings) {
    const grouped = {};

    mappings.forEach(mapping => {
        // 檢查數據結構，可能 category 數據在 mapping.category 中
        const category = mapping.category || mapping;
        const categoryId = category.id || mapping.category_id;

        if (!grouped[categoryId]) {
            grouped[categoryId] = {
                category: category,
                mappings: []
            };
        }

        // 檢查 subcategory 數據
        if (mapping.subcategory) {
            grouped[categoryId].mappings.push({
                ...mapping.subcategory,
                mapping_id: mapping.id,
                mapping_status: mapping.mapping_status || 'Available'
            });
        } else if (mapping.subcategory_name) {
            // 如果 subcategory 數據直接在 mapping 中
            grouped[categoryId].mappings.push({
                id: mapping.id,
                subcategory_name: mapping.subcategory_name,
                subcategory_status: mapping.subcategory_status || 'Available',
                mapping_status: mapping.mapping_status || 'Available',
                mapping_id: mapping.id
            });
        }
    });

    return grouped;
}

/**
 * 生成分類卡片
 */
function generateCategoryCard(category, mappings) {
    console.log('Generating card for category:', category, 'mappings:', mappings);

    const availableCount = mappings.filter(mapping => {
        const status = mapping.mapping_status || 'Unavailable';
        return status === 'Available';
    }).length;
    const unavailableCount = mappings.filter(mapping => {
        const status = mapping.mapping_status || 'Unavailable';
        return status === 'Unavailable';
    }).length;
    const totalCount = mappings.length;

    // 確保category數據存在
    const categoryName = category ? (category.category_name || category.name) : 'Unknown Category';
    const categoryId = category ? category.id : 'unknown';

    // 生成映射列表
    console.log(`Generating mapping values for category ${categoryName}, total mappings: ${mappings.length}`);

    // 直接使用原始數據，不進行排序
    const mappingValuesHTML = mappings.map((mapping, index) => {
        const status = mapping.mapping_status || 'Unavailable';

        console.log(`Mapping ${index + 1}: ${mapping.subcategory_name}, Status: ${status}`);

        return `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span class="fw-medium" style="cursor: pointer;" onclick="editMapping(${mapping.mapping_id})" title="Click to edit mapping">${mapping.subcategory_name}</span>
                <div class="d-flex align-items-center gap-4">
                    <span class="badge ${status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${status}
                    </span>
                    <button class="btn btn-sm ${status === 'Available' ? 'btn-outline-warning' : 'btn-outline-success'}"
                            title="${status === 'Available' ? 'Deactivate' : 'Activate'}"
                            onclick="console.log('Button clicked, mapping.id:', ${mapping.mapping_id}, 'status:', '${status}'); ${status === 'Available' ? 'setMappingUnavailable' : 'setMappingAvailable'}(${mapping.mapping_id})">
                        <i class="bi ${status === 'Available' ? 'bi-slash-circle' : 'bi-check-circle'}"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="col-lg-6 col-xl-4">
            <div class="content-card h-100 shadow-sm border-0">
                <div class="card-header bg-light border-0">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <div class="content-icon me-3">
                                <i class="bi bi-tags-fill"></i>
                            </div>
                            <div>
                                <h5 class="card-title mb-0">${categoryName}</h5>
                                <small class="text-muted">${totalCount} mapping values</small>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewCategoryDetails(${categoryId})">
                            <i class="bi bi-eye me-2"></i>View Details
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-6">
                            <div class="text-center">
                                <div class="h4 text-success mb-0">${availableCount}</div>
                                <small class="text-muted">Available</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center">
                                <div class="h4 text-danger mb-0">${unavailableCount}</div>
                                <small class="text-muted">Unavailable</small>
                            </div>
                        </div>
                    </div>

                    <div class="list-container" style="max-height: 400px; overflow-y: auto; border: none; background: transparent;">
                        ${mappingValuesHTML}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 更新統計信息
 */
function updateStatistics(data) {
    // 更新頁面頂部的統計信息
    const totalItemsElement = document.getElementById('total-items');
    const availableItemsElement = document.getElementById('available-items');
    const unavailableItemsElement = document.getElementById('unavailable-items');
    const totalGroupsElement = document.getElementById('total-groups');

    if (totalItemsElement) {
        totalItemsElement.textContent = data.total || 0;
    }

    if (availableItemsElement) {
        availableItemsElement.textContent = data.categories_count || 0;
    }

    if (unavailableItemsElement) {
        unavailableItemsElement.textContent = data.subcategories_count || 0;
    }

    if (totalGroupsElement) {
        // 按分類分組計算
        const groupedByCategory = groupByCategory(data.data || []);
        const categoryCount = Object.keys(groupedByCategory).length;
        totalGroupsElement.textContent = categoryCount;
    }
}

/**
 * 更新分頁信息
 */
function updatePaginationInfoByCategory(mappings, pagination) {
    // 按分類分組計算
    const groupedByCategory = groupByCategory(mappings);
    const categoryCount = Object.keys(groupedByCategory).length;

    // 更新分頁信息顯示
    document.getElementById('showing-start').textContent = 1;
    document.getElementById('showing-end').textContent = categoryCount;
    document.getElementById('total-count').textContent = categoryCount;

    // 更新分頁按鈕狀態
    updatePaginationButtons(categoryCount);
}

/**
 * 更新分頁按鈕
 */
function updatePaginationButtons(categoryCount) {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const currentPageElement = document.getElementById('current-page');
    const pageNumberElement = document.getElementById('page-number');

    // 更新頁碼顯示
    if (pageNumberElement) {
        pageNumberElement.textContent = '1'; // 當前總是第1頁
    }

    // 如果只有一個分類或沒有分類，禁用分頁按鈕
    if (categoryCount <= 1) {
        prevBtn.classList.add('disabled');
        nextBtn.classList.add('disabled');
        if (currentPageElement) {
            currentPageElement.classList.add('disabled');
        }
    } else {
        // 這裡可以根據需要實現真正的分頁邏輯
        // 目前顯示所有分類，所以按鈕保持禁用狀態
        prevBtn.classList.add('disabled');
        nextBtn.classList.add('disabled');
        if (currentPageElement) {
            currentPageElement.classList.remove('disabled');
        }
    }
}

/**
 * 綁定搜索事件
 */
function bindSearchEvents() {
    // 如果有搜索框，綁定搜索事件
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            const searchTerm = this.value;
            filterMappings(searchTerm);
        }, 300));
    }
}

/**
 * 綁定篩選事件
 */
function bindFilterEvents() {
    // 如果有篩選器，綁定篩選事件
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyFilters();
        });
    });
}

/**
 * 篩選映射
 */
function filterMappings(searchTerm) {
    // 實現搜索功能
    console.log('Searching for:', searchTerm);
    const cards = document.querySelectorAll('.content-card');
    cards.forEach(card => {
        const categoryName = card.querySelector('.card-title').textContent.toLowerCase();
        const shouldShow = categoryName.includes(searchTerm.toLowerCase());
        card.classList.toggle('d-none', !shouldShow);
    });
}

/**
 * 應用篩選器
 */
function applyFilters() {
    // 實現篩選功能
    console.log('Applying filters');
    const filterValue = document.getElementById('filter-select').value;
    // 這裡可以添加具體的篩選邏輯
}

/**
 * 綁定卡片事件
 */
function bindCardEvents() {
    // 綁定狀態切換按鈕事件
    document.querySelectorAll('.status-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

// =============================================================================
// Create 頁面功能 (Create Page Functions)
// =============================================================================

/**
 * 初始化映射創建頁面
 */
function initializeMappingCreate() {
    // 使用通用初始化函數
    initializeMappingPage({
        initializationCallback: function() {
            bindCreateEvents();
            updateUI();
        }
    });
}

/**
 * 綁定創建頁面事件
 */
function bindCreateEvents() {
    // 添加映射按鈕
    const addMappingBtn = document.getElementById('addMapping');
    if (addMappingBtn) {
        addMappingBtn.addEventListener('click', addMapping);
    }

    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 排序按鈕
    const sortBtn = document.getElementById('sortMappings');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 選擇框 change 事件
    const categorySelect = document.getElementById('category_id');
    const subcategorySelect = document.getElementById('subcategory_id');

    if (categorySelect) {
        categorySelect.addEventListener('change', updateUI);
    }
    if (subcategorySelect) {
        subcategorySelect.addEventListener('change', updateUI);
    }

    // 刪除映射按鈕事件委託
    document.addEventListener('click', function(e) {
        if (e.target.closest('button[data-index]')) {
            const button = e.target.closest('button[data-index]');
            const index = parseInt(button.getAttribute('data-index'));
            if (!isNaN(index)) {
                removeMapping(index);
            }
        }
    });

    // 表單提交處理
    const form = document.getElementById('mappingForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

/**
 * 添加映射
 */
function addMapping() {
    if (!validateMappingForm()) {
        return;
    }

    const categoryId = document.getElementById('category_id').value;
    const subcategoryId = document.getElementById('subcategory_id').value;

    // 檢查是否已存在
    const existingMapping = isMappingExists(categoryId, subcategoryId);
    if (existingMapping) {
        window.showAlert('This mapping combination already exists', 'error');
        highlightExistingMapping(categoryId, subcategoryId);
        return;
    }

    // 添加映射到列表
    addMappingToList(categoryId, subcategoryId);

    // 清空選擇
    document.getElementById('category_id').value = '';
    document.getElementById('subcategory_id').value = '';
    document.getElementById('category_id').focus();

    // 顯示成功添加的alert
    window.showAlert('Mapping added successfully', 'success');
}

/**
 * 添加映射到列表
 */
function addMappingToList(categoryId, subcategoryId) {
    // 獲取分類和子分類信息
    const categorySelect = document.getElementById('category_id');
    const subcategorySelect = document.getElementById('subcategory_id');
    const categoryName = categorySelect.options[categorySelect.selectedIndex].text;
    const subcategoryName = subcategorySelect.options[subcategorySelect.selectedIndex].text;

    // 添加到數組
    const mapping = {
        categoryId: categoryId,
        subcategoryId: subcategoryId,
        categoryName: categoryName,
        subcategoryName: subcategoryName,
        status: 'Available' // 默認為 Available
    };

    mappingList.push(mapping);

    // 更新列表顯示
    updateMappingList();
    updateUI();

    // 顯示映射區域（第一次添加時）
    if (mappingList.length === 1) {
        showMappingValuesArea();
    }
}

/**
 * 從列表中移除映射
 */
function removeMapping(index) {
    if (index >= 0 && index < mappingList.length) {
        // 獲取要刪除的映射信息
        const mappingToRemove = mappingList[index];

        // 確認刪除
        if (!confirm(`Are you sure you want to remove mapping "${mappingToRemove.categoryName} - ${mappingToRemove.subcategoryName}"?`)) {
            return;
        }

        mappingList.splice(index, 1);
        updateMappingList();

        // 如果沒有映射了，隱藏區域
        if (mappingList.length === 0) {
            hideAllAreas();
        }

        updateUI();
        window.showAlert('Mapping removed successfully', 'success');
    } else {
        window.showAlert('Failed to remove mapping', 'error');
    }
}

/**
 * 更新映射列表顯示
 */
function updateMappingList() {
    const mappingListContainer = document.getElementById('mappingValuesList');

    if (mappingList.length === 0) {
        mappingListContainer.innerHTML = '';
        return;
    }

    let html = '';
    mappingList.forEach((mapping, index) => {
        // 檢查是否為重複項
        const isDuplicate = isMappingExists(mapping.categoryId, mapping.subcategoryId) &&
            mappingList.filter(i => i.categoryId === mapping.categoryId && i.subcategoryId === mapping.subcategoryId).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 bg-light rounded border fade-in';
        const duplicateClasses = isDuplicate ? 'border-warning' : '';

        html += `
            <div class="${baseClasses} ${duplicateClasses}" data-category-id="${mapping.categoryId}" data-subcategory-id="${mapping.subcategoryId}">
                <div class="d-flex align-items-center">
                    <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-3">${isDuplicate ? '⚠️' : (index + 1)}</span>
                    <i class="bi bi-link-45deg text-primary me-2"></i>
                    <div class="mapping-combination">
                        <span class="category-badge fw-bold text-dark">${mapping.categoryName}</span>
                        <span class="text-muted mx-2">-</span>
                        <span class="subcategory-badge fw-bold text-dark">${mapping.subcategoryName}</span>
                        ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2 mt-1">Duplicate</span>' : ''}
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger" data-index="${index}">
                    <i class="bi bi-trash me-1"></i>Remove
                </button>
            </div>
        `;
    });

    mappingListContainer.innerHTML = html;
}

/**
 * 排序映射值列表
 */
function sortMappingValuesList() {
    const mappingValuesList = document.getElementById('mappingValuesList');
    const items = Array.from(mappingValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取映射組合並排序
    const mappingValues = items.map(item => ({
        element: item,
        value: item.querySelector('.mapping-combination').textContent.trim()
    }));

    // 按字母順序排序
    mappingValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    mappingValues.forEach(({ element }) => {
        mappingValuesList.appendChild(element);
    });
}

/**
 * 顯示映射區域
 */
function showMappingValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }

    // 顯示映射值區域
    const mappingValuesArea = document.getElementById('mappingValuesArea');
    if (mappingValuesArea) {
        mappingValuesArea.classList.remove('d-none');
    }

    // 顯示提交按鈕
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.classList.remove('d-none');
    }
}

/**
 * 隱藏所有區域
 */
function hideAllAreas() {
    // 隱藏映射值區域
    const mappingValuesArea = document.getElementById('mappingValuesArea');
    if (mappingValuesArea) {
        mappingValuesArea.classList.add('d-none');
    }

    // 隱藏提交按鈕
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.classList.add('d-none');
    }

    // 顯示初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.classList.remove('d-none');
    }
}

/**
 * 更新UI狀態
 */
function updateUI() {
    // 更新映射計數
    updateMappingValuesCount();
}

/**
 * 清除表單
 */
function clearForm() {
    if (mappingList.length === 0) {
        window.showAlert('No mappings to clear', 'info');
        return;
    }

    if (confirm('Are you sure you want to clear all mappings?')) {
        // 清空選擇
        const categorySelect = document.getElementById('category_id');
        const subcategorySelect = document.getElementById('subcategory_id');
        if (categorySelect) {
            categorySelect.value = '';
        }
        if (subcategorySelect) {
            subcategorySelect.value = '';
        }

        // 清空映射列表
        mappingList = [];
        const mappingListElement = document.getElementById('mappingValuesList');
        if (mappingListElement) {
            mappingListElement.innerHTML = '';
        }

        // 隱藏所有區域
        hideAllAreas();

        // 更新UI
        updateUI();
        window.showAlert('All mappings cleared', 'info');
    }
}

/**
 * 切換排序順序
 */
function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortMappings');

    // 更新圖標
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortMappingList();
}

/**
 * 排序映射列表
 */
function sortMappingList() {
    const mappingListContainer = document.getElementById('mappingValuesList');
    const items = Array.from(mappingListContainer.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取映射信息並排序
    const mappings = items.map(item => ({
        element: item,
        categoryName: item.querySelector('.category-badge').textContent.trim(),
        subcategoryName: item.querySelector('.subcategory-badge').textContent.trim()
    }));

    // 按分類和子分類名稱排序
    mappings.sort((a, b) => {
        const aText = a.categoryName + ' - ' + a.subcategoryName;
        const bText = b.categoryName + ' - ' + b.subcategoryName;

        if (isAscending) {
            return aText.localeCompare(bText);
        } else {
            return bText.localeCompare(aText);
        }
    });

    // 重新排列DOM元素
    mappings.forEach(({ element }) => {
        mappingListContainer.appendChild(element);
    });
}

/**
 * 表單提交處理
 */
function handleFormSubmit(e) {
    e.preventDefault();

    if (mappingList.length === 0) {
        window.showAlert('Please add at least one mapping', 'warning');
        return;
    }

    // 獲取狀態（默認為 Available）
    const status = 'Available';

    // 提交前再次檢查重複組合
    const duplicates = [];
    const seen = new Set();

    for (let i = 0; i < mappingList.length; i++) {
        const mapping = mappingList[i];
        const combination = `${mapping.categoryId}-${mapping.subcategoryId}`;

        if (seen.has(combination)) {
            duplicates.push(`${mapping.categoryName} - ${mapping.subcategoryName}`);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        window.showAlert('Duplicate combinations found. Please remove duplicates before submitting.', 'error');
        return;
    }

    // 準備提交數據
    const mappingData = mappingList.map(mapping => ({
        ...mapping,
        status: status
    }));

    // 使用通用創建函數
    createMapping(mappingData,
        function(data) {
            window.showAlert(data.message, 'success');
            setTimeout(() => {
                window.location.href = window.mappingManagementRoute;
            }, 2000);
        },
        function(error) {
            window.showAlert(error || 'Some mappings failed to create', 'error');
        }
    );
}

// =============================================================================
// Update 頁面功能 (Update Page Functions)
// =============================================================================

/**
 * 初始化映射更新頁面
 */
function initializeMappingUpdate() {
    // 綁定事件
    bindEvents();

    // 初始化狀態卡片
    if (typeof window.initializeMappingStatusCardSelection === 'function') {
        window.initializeMappingStatusCardSelection();
    }
}

/**
 * 綁定更新頁面事件
 */
function bindEvents() {
    // 表單提交事件
    const form = document.getElementById('updateMappingForm');
    if (form) {
        form.addEventListener('submit', handleUpdateFormSubmit);
    }
}

/**
 * 更新頁面表單提交處理
 */
function handleUpdateFormSubmit(e) {
    e.preventDefault();

    // 獲取表單數據
    const formData = new FormData(e.target);

    // 獲取當前映射ID
    const mappingId = window.location.pathname.split('/').pop();

    // 使用通用函數提交
    handleMappingRequest(
        window.updateMappingUrl,
        'POST',
        formData,
        function(data) {
            window.showAlert('Mapping updated successfully', 'success');
            setTimeout(() => {
                window.location.href = window.mappingManagementRoute;
            }, 1500);
        },
        function(error) {
            window.showAlert(error || 'Failed to update mapping', 'error');
        }
    );

    return false; // 防止表單默認提交
}

// =============================================================================
// View 頁面功能 (View Page Functions)
// =============================================================================

/**
 * 初始化映射查看頁面
 */
function initializeMappingView() {
    // 綁定事件監聽器
    bindViewEvents();

    // 初始化狀態
    updateViewUI();
}

/**
 * 綁定查看頁面事件
 */
function bindViewEvents() {
    // 刪除按鈕事件 - 使用事件委託避免重複綁定
    document.addEventListener('click', function(e) {
        if (e.target.closest('button[data-mapping-id]')) {
            const button = e.target.closest('button[data-mapping-id]');
            const mappingId = button.getAttribute('data-mapping-id');
            deleteMappingFromView(mappingId);
        }
    });
}

/**
 * 更新查看頁面UI
 */
function updateViewUI() {
    // 更新統計信息
    updateViewStatistics();

    // 更新表格狀態
    updateTableStatus();
}

/**
 * 更新查看頁面統計信息
 */
function updateViewStatistics() {
    // 獲取可用和不可用的數量
    const availableCount = document.querySelectorAll('.badge.bg-success').length;
    const unavailableCount = document.querySelectorAll('.badge.bg-danger').length;

    // 更新統計顯示
    const availableElement = document.getElementById('availableCount');
    const unavailableElement = document.getElementById('unavailableCount');

    if (availableElement) {
        availableElement.textContent = availableCount;
    }

    if (unavailableElement) {
        unavailableElement.textContent = unavailableCount;
    }
}

/**
 * 更新表格狀態
 */
function updateTableStatus() {
    // 更新表格行的狀態
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach((row, index) => {
        // 添加懸停效果
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f9fafb';
        });

        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });
}

/**
 * 從查看頁面刪除映射
 */
function deleteMappingFromView(mappingId) {
    // 防止重複點擊
    if (isDeleting) {
        return;
    }

    isDeleting = true;

    if (!confirm('Are you sure you want to delete this mapping?')) {
        isDeleting = false;
        return;
    }

    // 直接發送 DELETE 請求
    const url = window.deleteMappingUrl.replace(':id', mappingId);
    fetch(url, {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (typeof window.showAlert === 'function') {
                window.showAlert('Mapping deleted successfully', 'success');
            } else {
                alert('Mapping deleted successfully');
            }

            // 刪除成功後，從頁面中移除該行
            const deletedRow = document.querySelector(`[data-mapping-id="${mappingId}"]`).closest('tr');
            if (deletedRow) {
                deletedRow.remove();
            }

            // 更新統計信息
            updateViewStatistics();

            // 檢查是否還有資料，如果沒有就跳轉回 index
            checkAndRedirectIfEmpty();
        } else {
            if (typeof window.showAlert === 'function') {
                window.showAlert('Failed to delete mapping', 'error');
            } else {
                alert('Failed to delete mapping');
            }
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
        if (typeof window.showAlert === 'function') {
            window.showAlert('Failed to delete mapping', 'error');
        } else {
            alert('Failed to delete mapping');
        }
    })
    .finally(() => {
        // 重置刪除狀態
        isDeleting = false;
    });
}

/**
 * 檢查並重定向
 */
function checkAndRedirectIfEmpty() {
    // 檢查表格中是否還有資料行
    const tableRows = document.querySelectorAll('tbody tr');
    const dataRows = Array.from(tableRows).filter(row => {
        // 排除空狀態行（如果有的話）
        return !row.querySelector('td[colspan]');
    });

    // 如果沒有資料行了，跳轉回 index
    if (dataRows.length === 0) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('All mappings have been deleted. Redirecting to mapping list...', 'info');
        } else {
            alert('All mappings have been deleted. Redirecting to mapping list...');
        }

        // 延遲跳轉，讓用戶看到提示信息
        setTimeout(() => {
            window.location.href = window.mappingManagementRoute;
        }, 1500);
    }
}

// =============================================================================
// 映射操作函數 (Mapping Operations)
// =============================================================================

/**
 * 切換映射狀態
 */
function toggleMappingStatus(id, currentStatus) {
    // 切換映射狀態
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateMappingStatus(id, newStatus);
}

/**
 * 設置映射為可用
 */
function setMappingAvailable(id) {
    // 設置映射為可用
    updateMappingStatus(id, 'Available');
}

/**
 * 設置映射為不可用
 */
function setMappingUnavailable(id) {
    // 設置映射為不可用
    updateMappingStatus(id, 'Unavailable');
}

/**
 * 更新映射狀態
 */
function updateMappingStatus(id, status) {
    const url = status === 'Available' ?
        window.availableMappingUrl.replace(':id', id) :
        window.unavailableMappingUrl.replace(':id', id);

    console.log('Updating mapping status:', { id, status, url });

    // 顯示加載提示
    if (typeof window.showAlert === 'function') {
        window.showAlert('Updating mapping status...', 'info');
    }

    fetch(url, {
        method: 'PATCH',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(`Mapping status updated to ${status.toLowerCase()} successfully!`, 'success');
            } else {
                alert(`Mapping status updated to ${status.toLowerCase()} successfully!`);
            }
            loadMappings(); // 重新加載數據
        } else {
            if (typeof window.showAlert === 'function') {
                window.showAlert(`Failed to update mapping status to ${status.toLowerCase()}`, 'error');
            } else {
                alert(`Failed to update mapping status to ${status.toLowerCase()}`);
            }
        }
    })
    .catch(error => {
        console.error(`Error setting mapping to ${status.toLowerCase()}:`, error);
        if (typeof window.showAlert === 'function') {
            window.showAlert('Failed to update mapping status', 'error');
        } else {
            alert('Failed to update mapping status');
        }
    });
}

/**
 * 查看分類詳情
 */
function viewCategoryDetails(categoryId) {
    // 跳轉到view頁面
    const url = window.viewCategoryMappingUrl.replace(':id', categoryId);
    window.location.href = url;
}

/**
 * 編輯分類映射
 */
function editCategoryMappings(categoryId) {
    const url = window.editCategoryMappingUrl.replace(':id', categoryId);
    window.location.href = url;
}

/**
 * 編輯映射
 */
function editMapping(mappingId) {
    // 跳轉到單個映射的edit頁面
    const url = window.editMappingUrl.replace(':id', mappingId);
    window.location.href = url;
}

// =============================================================================
// 事件綁定功能 (Event Binding Functions)
// =============================================================================

/**
 * 綁定映射事件
 */
function bindMappingEvents() {
    // 分類選擇變化
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
    }

    // 子分類選擇變化
    const subcategorySelect = document.getElementById('subcategory_id');
    if (subcategorySelect) {
        subcategorySelect.addEventListener('change', handleSubcategoryChange);
    }
}

/**
 * 初始化映射頁面
 */
function initializeMappingPage(config) {
    // 綁定事件監聽器
    bindMappingEvents();

    // 初始化狀態
    updateConfigSummary();

    // 執行初始化回調函數（如果有）
    if (config && config.initializationCallback && typeof config.initializationCallback === 'function') {
        config.initializationCallback();
    }
}

// =============================================================================
// 工具函數 (Utility Functions)
// =============================================================================


/**
 * 工具函數：防抖
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * 工具函數：節流
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 工具函數：轉義HTML
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (s) => map[s]);
}

/**
 * 工具函數：格式化日期
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'N/A';
    }
}

/**
 * 工具函數：格式化狀態
 */
function formatStatus(status) {
    const statusMap = {
        'Available': { class: 'bg-success', icon: 'bi-check-circle' },
        'Unavailable': { class: 'bg-danger', icon: 'bi-x-circle' }
    };

    const statusInfo = statusMap[status] || { class: 'bg-secondary', icon: 'bi-question-circle' };

    return `<span class="badge ${statusInfo.class} px-3 py-2">
        <i class="bi ${statusInfo.icon} me-1"></i>${status}
    </span>`;
}


// =============================================================================
// DOM 內容加載完成後的事件綁定 (DOM Content Loaded Event Binding)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // 檢查當前頁面類型並初始化相應功能
    const dashboardCardsContainer = document.getElementById('dashboard-cards-container');
    const mappingForm = document.getElementById('mappingForm');
    const updateMappingForm = document.getElementById('updateMappingForm');
    const viewTable = document.querySelector('table tbody');

    if (dashboardCardsContainer) {
        // Dashboard 頁面
        initializeMappingDashboard();
    } else if (mappingForm) {
        // Create 頁面
        initializeMappingCreate();
    } else if (updateMappingForm) {
        // Update 頁面
        initializeMappingUpdate();
    } else if (viewTable) {
        // View 頁面
        initializeMappingView();
    }
});

// =============================================================================
// 全局實例初始化 (Global Instance Initialization)
// =============================================================================

// 導出函數供全局使用
window.editCategoryMappings = editCategoryMappings;
window.editMapping = editMapping;
window.deleteMapping = deleteMapping;
window.toggleMappingStatus = toggleMappingStatus;
window.setMappingAvailable = setMappingAvailable;
window.setMappingUnavailable = setMappingUnavailable;
window.updateMappingStatus = updateMappingStatus;
window.viewCategoryDetails = viewCategoryDetails;
