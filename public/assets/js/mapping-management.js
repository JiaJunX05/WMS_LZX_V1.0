/**
 * Category Mapping Management JavaScript
 * 分類映射管理統一交互邏輯
 *
 * 功能模塊：
 * - Dashboard 頁面：搜索、篩選、分頁、CRUD 操作、狀態切換
 * - View 頁面：查看詳情、刪除操作、Update Modal
 * - Create Modal：批量創建、表單驗證、狀態管理
 * - Update Modal：編輯更新、表單提交
 * - 通用功能：API 請求、UI 更新、事件綁定、工具函數
 *
 * @author WMS Team
 * @version 3.0.0
 */

// =============================================================================
// 全局變量和狀態管理 (Global Variables and State Management)
// =============================================================================

// 全局變量防止重複請求
let isDeleting = false;

// =============================================================================
// API 請求函數 (API Request Functions)
// =============================================================================

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
    if (mappingData.mappings && Array.isArray(mappingData.mappings)) {
        mappingData.mappings.forEach((mapping, index) => {
            formData.append(`mappings[${index}][category_id]`, mapping.categoryId);
            formData.append(`mappings[${index}][subcategory_id]`, mapping.subcategoryId);
            formData.append(`mappings[${index}][mapping_status]`, mapping.status || 'Available');
        });
    } else {
        formData.append('category_id', mappingData.categoryId);
        formData.append('subcategory_id', mappingData.subcategoryId);
        formData.append('mapping_status', mappingData.status || 'Available');
    }

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
}

/**
 * 檢查URL參數
 */
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success) {
        const successMessage = decodeURIComponent(success);
        if (successMessage && successMessage.trim()) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(successMessage, 'success');
            } else if (typeof window.safeAlert === 'function') {
                window.safeAlert(successMessage);
            } else {
                alert(successMessage);
            }
        }
        // 清除URL參數
        const url = new URL(window.location);
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url);
    }

    if (error) {
        const errorMessage = decodeURIComponent(error);
        if (errorMessage && errorMessage.trim()) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(errorMessage, 'danger');
            } else if (typeof window.safeAlert === 'function') {
                window.safeAlert(errorMessage);
            } else {
                alert(errorMessage);
            }
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

    if (!mappings || mappings.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }

    emptyState.classList.add('d-none');

    // 按分類分組
    const groupedByCategory = groupByCategory(mappings);

    // 生成卡片HTML
    let cardsHTML = '';

    Object.keys(groupedByCategory).forEach(categoryId => {
        const categoryData = groupedByCategory[categoryId];
        const category = categoryData.category;
        const mappings = categoryData.mappings;

        // 確保category數據存在
        if (category && category.category_name) {
            cardsHTML += generateCategoryCard(category, mappings);
        } else {
            console.warn(`Category data missing for category ID ${categoryId}:`, category);
        }
    });

    container.innerHTML = cardsHTML;
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
    const mappingValuesHTML = mappings.map((mapping, index) => {
        const status = mapping.mapping_status || 'Unavailable';

        return `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span class="fw-medium" style="cursor: pointer;" onclick="editMapping(${mapping.mapping_id})" title="Click to edit mapping">${mapping.subcategory_name}</span>
                <div class="d-flex align-items-center gap-4">
                    <span class="badge ${status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${status}
                    </span>
                    <button class="btn btn-sm ${status === 'Available' ? 'btn-outline-warning' : 'btn-outline-success'}"
                            title="${status === 'Available' ? 'Deactivate' : 'Activate'}"
                            onclick="${status === 'Available' ? 'setMappingUnavailable' : 'setMappingAvailable'}(${mapping.mapping_id})">
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
                                <i class="bi bi-tags-fill text-white fs-5"></i>
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
    const totalMappingsElement = document.getElementById('total-mappings');
    const availableCategoriesElement = document.getElementById('available-categories');
    const availableSubcategoriesElement = document.getElementById('available-subcategories');
    const mappingGroupsElement = document.getElementById('mapping-groups');

    if (totalMappingsElement) {
        totalMappingsElement.textContent = data.total || 0;
    }

    if (availableCategoriesElement) {
        availableCategoriesElement.textContent = data.categories_count || 0;
    }

    if (availableSubcategoriesElement) {
        availableSubcategoriesElement.textContent = data.subcategories_count || 0;
    }

    if (mappingGroupsElement) {
        // 按分類分組計算
        const groupedByCategory = groupByCategory(data.data || []);
        const categoryCount = Object.keys(groupedByCategory).length;
        mappingGroupsElement.textContent = categoryCount;
    }
}

/**
 * 更新分頁信息
 */
function updatePaginationInfoByCategory(mappings, pagination) {
    // 按分類分組計算
    const groupedByCategory = groupByCategory(mappings);
    const categoryCount = Object.keys(groupedByCategory).length;

    // 更新分頁信息顯示 - 添加 DOM 元素存在性檢查
    const showingStartEl = document.getElementById('showing-start');
    const showingEndEl = document.getElementById('showing-end');
    const totalCountEl = document.getElementById('total-count');

    if (showingStartEl) showingStartEl.textContent = 1;
    if (showingEndEl) showingEndEl.textContent = categoryCount;
    if (totalCountEl) totalCountEl.textContent = categoryCount;

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
        if (prevBtn) prevBtn.classList.add('disabled');
        if (nextBtn) nextBtn.classList.add('disabled');
    } else {
        // 這裡可以根據需要實現真正的分頁邏輯
        // 目前顯示所有分類，所以按鈕保持禁用狀態
        if (prevBtn) prevBtn.classList.add('disabled');
        if (nextBtn) nextBtn.classList.add('disabled');
    }

    // 確保當前頁面始終顯示為活動狀態
    if (currentPageElement) {
        currentPageElement.classList.add('active');
        currentPageElement.classList.remove('disabled');
    }
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

    // 綁定 Update Modal 事件
    bindUpdateMappingModalEvents();

    // 初始化狀態
    updateViewUI();
}

/**
 * 綁定查看頁面事件
 */
function bindViewEvents() {
    // 刪除按鈕事件 - 使用事件委託，只監聽 Delete 按鈕
    document.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('button.btn-outline-danger[data-mapping-id][data-action="delete"]');
        if (deleteButton) {
            const mappingId = deleteButton.getAttribute('data-mapping-id');
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

    // 如果沒有資料行了，直接跳轉回 index
    if (dataRows.length === 0) {
        setTimeout(() => {
            window.location.href = window.mappingManagementRoute;
        }, 1000);
    }
}

// =============================================================================
// 映射操作函數 (Mapping Operations)
// =============================================================================

/**
 * 切換映射狀態
 */
function toggleMappingStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateMappingStatus(id, newStatus);
}

/**
 * 設置映射為可用
 */
function setMappingAvailable(id) {
    updateMappingStatus(id, 'Available');
}

/**
 * 設置映射為不可用
 */
function setMappingUnavailable(id) {
    updateMappingStatus(id, 'Unavailable');
}

/**
 * 更新單個映射狀態顯示（不重新加載所有數據）
 */
function updateSingleMappingStatusUI(mappingId, newStatus) {
    // 找到包含該 mapping 的行（通過查找包含 mappingId 的按鈕）
    const mappingRows = document.querySelectorAll('.list-container > div');
    let targetRow = null;
    let categoryCard = null;

    mappingRows.forEach(row => {
        const button = row.querySelector('button');
        if (button && button.getAttribute('onclick')) {
            const onclickAttr = button.getAttribute('onclick');
            // 檢查 onclick 是否包含該 mappingId
            if (onclickAttr.includes(`(${mappingId})`)) {
                targetRow = row;
                categoryCard = row.closest('.content-card');
            }
        }
    });

    if (!targetRow || !categoryCard) {
        // 如果找不到，則重新加載所有數據
        console.warn('Could not find mapping row, reloading all data');
        loadMappings();
        return;
    }

    // 更新 badge
    const badge = targetRow.querySelector('.badge');
    if (badge) {
        if (newStatus === 'Available') {
            badge.className = 'badge bg-success px-3 py-2';
            badge.innerHTML = '<i class="bi bi-check-circle me-1"></i>Available';
        } else {
            badge.className = 'badge bg-danger px-3 py-2';
            badge.innerHTML = '<i class="bi bi-x-circle me-1"></i>Unavailable';
        }
    }

    // 更新按鈕
    const toggleButton = targetRow.querySelector('button');
    if (toggleButton) {
        if (newStatus === 'Available') {
            toggleButton.className = 'btn btn-sm btn-outline-warning';
            toggleButton.title = 'Deactivate';
            toggleButton.innerHTML = '<i class="bi bi-slash-circle"></i>';
            toggleButton.setAttribute('onclick', `setMappingUnavailable(${mappingId})`);
        } else {
            toggleButton.className = 'btn btn-sm btn-outline-success';
            toggleButton.title = 'Activate';
            toggleButton.innerHTML = '<i class="bi bi-check-circle"></i>';
            toggleButton.setAttribute('onclick', `setMappingAvailable(${mappingId})`);
        }
    }

    // 更新分類卡片中的統計數字
    const availableCountEl = categoryCard.querySelector('.col-6:first-child .h4');
    const unavailableCountEl = categoryCard.querySelector('.col-6:last-child .h4');

    if (availableCountEl && unavailableCountEl) {
        let availableCount = parseInt(availableCountEl.textContent) || 0;
        let unavailableCount = parseInt(unavailableCountEl.textContent) || 0;

        if (newStatus === 'Available') {
            availableCount++;
            unavailableCount--;
        } else {
            availableCount--;
            unavailableCount++;
        }

        availableCountEl.textContent = availableCount;
        unavailableCountEl.textContent = unavailableCount;
    }
}

/**
 * 更新映射狀態
 */
function updateMappingStatus(id, status) {
    const url = status === 'Available' ?
        window.availableMappingUrl.replace(':id', id) :
        window.unavailableMappingUrl.replace(':id', id);

    fetch(url, {
        method: 'PATCH',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(`Mapping status updated to ${status.toLowerCase()} successfully!`, 'success');
            } else {
                alert(`Mapping status updated to ${status.toLowerCase()} successfully!`);
            }
            // 只更新單個映射狀態，不重新加載所有數據
            updateSingleMappingStatusUI(id, status);
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
 * 編輯映射（跳轉到 view 頁面）
 */
function editMapping(mappingId) {
    const url = window.viewCategoryMappingUrl.replace(':id', mappingId);
    window.location.href = url;
}

// =============================================================================
// Create Mapping Modal 功能 (Create Mapping Modal Functions)
// =============================================================================

/**
 * 初始化 Mapping Create Modal
 */
function initializeMappingCreateModal() {
    // 綁定 modal 事件
    bindMappingModalEvents();
}

/**
 * 綁定 Mapping Modal 事件
 */
function bindMappingModalEvents() {
    const modal = document.getElementById('createMappingModal');
    if (!modal) return;

    // Modal 打開時重置
    modal.addEventListener('show.bs.modal', function() {
        resetMappingModal();
    });

    // Category 選擇變化
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategorySelectChange);
    }

    // Select All 按鈕
    const selectAllBtn = document.getElementById('selectAllSubcategoriesBtn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAllSubcategories);
    }

    // Clear All 按鈕
    const clearAllBtn = document.getElementById('clearAllSubcategoriesBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllSubcategories);
    }

    // 提交按鈕
    const submitBtn = document.getElementById('submitCreateMappingModal');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitMappingModal);
    }
}

/**
 * 處理 Category 選擇變化
 */
function handleCategorySelectChange() {
    const categoryId = document.getElementById('category_id').value;

    if (categoryId) {
        loadAvailableSubcategories();
    } else {
        hideSubcategoryCards();
    }
}

/**
 * 加載可用的 Subcategories
 */
function loadAvailableSubcategories() {
    // 顯示加載狀態
    showSubcategoryLoading();

    // 從全局變量獲取可用的 subcategories
    const subcategories = window.availableSubcategories || [];

    if (subcategories && subcategories.length > 0) {
        displaySubcategoryCards(subcategories);
    } else {
        hideSubcategoryCards();
        if (typeof window.showAlert === 'function') {
            window.showAlert('No available subcategories found', 'warning');
        } else {
            alert('No available subcategories found');
        }
    }
}

/**
 * 顯示 Subcategory 加載狀態
 */
function showSubcategoryLoading() {
    const selectionArea = document.getElementById('subcategorySelection');
    const container = document.getElementById('subcategoryCardsContainer');

    if (selectionArea) {
        selectionArea.classList.remove('d-none');
    }

    if (container) {
        container.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading available subcategories...</p>
            </div>
        `;
    }

    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-subcategory-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }
}

/**
 * 顯示 Subcategory 卡片
 */
function displaySubcategoryCards(subcategories) {
    const selectionArea = document.getElementById('subcategorySelection');
    const container = document.getElementById('subcategoryCardsContainer');
    if (!selectionArea || !container) return;

    // 顯示選擇區域
    selectionArea.classList.remove('d-none');

    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-subcategory-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }

    if (subcategories.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-exclamation-circle fs-1 text-muted mb-3"></i>
                <h6 class="text-muted">No Available Subcategories</h6>
                <p class="text-muted small">No subcategories found for the selected category.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = subcategories.map(subcategory => `
        <div class="col-md-3 col-sm-4 col-6 mb-3">
            <div class="card subcategory-card h-100 border border-light position-relative"
                 data-subcategory-id="${subcategory.id}"
                 data-subcategory-name="${subcategory.subcategory_name}"
                 data-status="${subcategory.subcategory_status}"
                 style="cursor: pointer; transition: all 0.3s ease;">
                <input type="checkbox" name="subcategory_ids[]" value="${subcategory.id}"
                       class="subcategory-checkbox position-absolute opacity-0"
                       id="subcategory_${subcategory.id}"
                       style="pointer-events: none;">
                <div class="card-body d-flex flex-column justify-content-center align-items-center text-center p-4"
                     style="cursor: pointer; min-height: 80px; position: relative;">
                    <div class="size-value fw-bold text-dark mb-0 fs-5">${subcategory.subcategory_name.toUpperCase()}</div>
                </div>
            </div>
        </div>
    `).join('');

    // 綁定卡片點擊事件
    bindSubcategoryCardEvents();

    // 更新選擇計數器
    updateSubcategorySelectionCounter();
}

/**
 * 隱藏 Subcategory 卡片
 */
function hideSubcategoryCards() {
    const selectionArea = document.getElementById('subcategorySelection');
    if (selectionArea) {
        selectionArea.classList.add('d-none');
    }

    // 顯示初始消息
    const initialMessage = document.getElementById('initial-subcategory-message');
    if (initialMessage) {
        initialMessage.classList.remove('d-none');
    }

    // 重置計數器
    const counter = document.getElementById('subcategorySelectionCounter');
    if (counter) {
        counter.textContent = '0 selected';
        counter.className = 'badge bg-primary';
    }
}

/**
 * 綁定 Subcategory 卡片事件
 */
function bindSubcategoryCardEvents() {
    const cards = document.querySelectorAll('.subcategory-card');
    cards.forEach(card => {
        // 為複選框添加事件監聽
        const checkbox = card.querySelector('input[type="checkbox"]');

        // 直接點擊卡片切換選擇狀態（與 library 一致）
        card.addEventListener('click', function(e) {
            // 防止點擊 checkbox 時觸發兩次
            if (e.target.tagName === 'INPUT') {
                return;
            }
            toggleSubcategoryCardSelection(card, checkbox);
        });

        if (checkbox) {
            checkbox.addEventListener('change', function() {
                const isSelected = this.checked;
                if (isSelected) {
                    card.classList.add('border-success', 'bg-success-subtle');
                    card.classList.remove('border-light');
                    card.style.transform = 'scale(1.05)';
                    card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                } else {
                    card.classList.remove('border-success', 'bg-success-subtle');
                    card.classList.add('border-light');
                    card.style.transform = 'scale(1)';
                    card.style.boxShadow = '';
                }
                updateSubcategorySelectionCounter();
            });
        }

        // 添加悬停效果
        card.addEventListener('mouseenter', function() {
            if (!checkbox.checked) {
                this.classList.add('border-primary');
                this.classList.remove('border-light');
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }
        });

        card.addEventListener('mouseleave', function() {
            if (!checkbox.checked) {
                this.classList.remove('border-primary');
                this.classList.add('border-light');
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '';
            }
        });
    });
}

/**
 * 切換 Subcategory 卡片選擇狀態（與 library 的 toggleSizeCardSelection 一致）
 */
function toggleSubcategoryCardSelection(card, checkbox) {
    if (!checkbox) return;

    const isSelected = checkbox.checked;

    if (isSelected) {
        // 取消選擇
        checkbox.checked = false;
        card.classList.remove('border-success', 'bg-success-subtle');
        card.classList.add('border-light');
        card.style.transform = 'scale(1)';
        card.style.boxShadow = '';
    } else {
        // 選擇
        checkbox.checked = true;
        card.classList.remove('border-light');
        card.classList.add('border-success', 'bg-success-subtle');
        card.style.transform = 'scale(1.05)';
        card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    }

    updateSubcategorySelectionCounter();
}

/**
 * 更新 Subcategory 選擇計數器
 */
function updateSubcategorySelectionCounter() {
    const selectedCount = document.querySelectorAll('#subcategoryCardsContainer input[type="checkbox"]:checked').length;
    const counter = document.getElementById('subcategorySelectionCounter');
    const submitBtn = document.getElementById('submitCreateMappingModal');

    if (counter) {
        counter.textContent = `${selectedCount} selected`;

        if (selectedCount > 0) {
            counter.className = 'badge bg-success';
        } else {
            counter.className = 'badge bg-primary';
        }
    }

    // 更新提交按鈕狀態
    if (submitBtn) {
        submitBtn.disabled = selectedCount === 0;
    }
}

/**
 * 選擇所有 Subcategories
 */
function selectAllSubcategories() {
    const checkboxes = document.querySelectorAll('#subcategoryCardsContainer input[type="checkbox"]');
    if (checkboxes.length === 0) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('No subcategories available to select', 'warning');
        } else {
            alert('No subcategories available to select');
        }
        return;
    }

    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        const card = checkbox.closest('.subcategory-card');
        if (card) {
            card.classList.add('border-success', 'bg-success-subtle');
            card.classList.remove('border-light');
            card.style.transform = 'scale(1.05)';
            card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        }
    });
    updateSubcategorySelectionCounter();

    // 顯示選擇提示
    const selectedCount = checkboxes.length;
    if (typeof window.showAlert === 'function') {
        window.showAlert(`${selectedCount} subcategory${selectedCount > 1 ? 'ies' : ''} selected`, 'success');
    } else {
        alert(`${selectedCount} subcategory${selectedCount > 1 ? 'ies' : ''} selected`);
    }
}

/**
 * 清除所有 Subcategories 選擇
 */
function clearAllSubcategories() {
    const checkboxes = document.querySelectorAll('#subcategoryCardsContainer input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('No subcategories selected to clear', 'info');
        } else {
            alert('No subcategories selected to clear');
        }
        return;
    }

    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const card = checkbox.closest('.subcategory-card');
        if (card) {
            card.classList.remove('border-success', 'bg-success-subtle');
            card.classList.add('border-light');
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '';
        }
    });
    updateSubcategorySelectionCounter();

    // 顯示清除提示
    if (typeof window.showAlert === 'function') {
        window.showAlert('All selections cleared', 'info');
    } else {
        alert('All selections cleared');
    }
}

/**
 * 重置 Mapping Modal
 */
function resetMappingModal() {
    // 重置表單
    const form = document.getElementById('createMappingModalForm');
    if (form) {
        form.reset();
    }

    // 重置 Category 選擇
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.value = '';
    }

    // 隱藏 Subcategory 卡片
    hideSubcategoryCards();

    // 清除所有選擇
    const checkboxes = document.querySelectorAll('#subcategoryCardsContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const card = checkbox.closest('.subcategory-card');
        if (card) {
            card.classList.remove('border-success', 'bg-success-subtle');
            card.classList.add('border-light');
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '';
        }
    });

    // 更新計數器
    const counter = document.getElementById('subcategorySelectionCounter');
    if (counter) {
        counter.textContent = '0 selected';
        counter.className = 'badge bg-primary';
    }

    // 禁用提交按鈕
    const submitBtn = document.getElementById('submitCreateMappingModal');
    if (submitBtn) {
        submitBtn.disabled = true;
    }
}

/**
 * 提交 Mapping Modal
 */
function submitMappingModal() {
    const categoryId = document.getElementById('category_id').value;
    const selectedSubcategories = Array.from(document.querySelectorAll('#subcategoryCardsContainer input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    // 驗證
    if (!categoryId) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please select a category first', 'warning');
        } else {
            alert('Please select a category first');
        }
        return;
    }

    if (selectedSubcategories.length === 0) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please select at least one subcategory', 'warning');
        } else {
            alert('Please select at least one subcategory');
        }
        return;
    }

    // 準備數據
    const mappings = selectedSubcategories.map(subcategoryId => ({
        categoryId: categoryId,
        subcategoryId: subcategoryId,
        status: 'Available'
    }));

    // 顯示加載狀態
    const submitBtn = document.getElementById('submitCreateMappingModal');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Creating...';
    submitBtn.disabled = true;

    // 提交創建請求
    createMapping({mappings},
        function(data) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(data.message || 'Mappings created successfully', 'success');
            } else {
                alert(data.message || 'Mappings created successfully');
            }

            // 關閉 modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createMappingModal'));
            if (modal) {
                modal.hide();
            }

            // 刷新頁面
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        },
        function(error) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(error || 'Failed to create mappings', 'error');
            } else {
                alert(error || 'Failed to create mappings');
            }

            // 恢復按鈕狀態
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    );
}

// =============================================================================
// Update Mapping Modal 功能 (Update Mapping Modal Functions)
// =============================================================================

/**
 * 綁定 Update Mapping Modal 事件
 */
function bindUpdateMappingModalEvents() {
    // 彈窗打開時初始化狀態卡片
    $('#updateMappingModal').on('show.bs.modal', function() {
        if (typeof window.initializeStatusCardSelection === 'function') {
            window.initializeStatusCardSelection('mapping_status');
        }
    });

    // 彈窗關閉時清理表單
    $('#updateMappingModal').on('hidden.bs.modal', function() {
        const form = document.getElementById('updateMappingModalForm');
        if (form) {
            form.reset();
        }

        // 清空 select 選項
        $('#update_category_id').empty().append('<option value="">Select category</option>');
        $('#update_subcategory_id').empty().append('<option value="">Select subcategory</option>');

        // 手动清理 backdrop，确保 modal 完全关闭
        cleanupModalBackdrop();

        // 清空當前信息卡片
        $('#currentMappingInfo').html('');

        // 重置狀態卡片（只清理 modal 內的）
        const modal = document.getElementById('updateMappingModal');
        if (modal) {
            $(modal).find('input[name="mapping_status"]').prop('checked', false);
            $(modal).find('.status-card').removeClass('selected');
        }

        // 移除驗證類
        $('#updateMappingModalForm').find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');

        // 清除隱藏的 mapping ID
        $('#updateMappingModalForm').removeAttr('data-mapping-id');
    });
}

/**
 * 打開更新映射彈窗
 */
function openUpdateMappingModal(mappingId) {
    const url = window.editMappingUrl.replace(':id', mappingId);

    // 从按钮或表格行获取mapping数据（如果可用，用于快速填充）
    let updateButton = $(`button[onclick*="openUpdateMappingModal(${mappingId})"]`);
    if (updateButton.length === 0) {
        updateButton = $(`button[data-mapping-id="${mappingId}"]`).first();
    }

    let mappingData = null;

    if (updateButton.length > 0) {
        // 快速填充基本数据
        mappingData = {
            id: mappingId,
            category_id: updateButton.attr('data-category-id') || '',
            subcategory_id: updateButton.attr('data-subcategory-id') || '',
            mapping_status: updateButton.attr('data-mapping-status') || 'Available',
            category_name: updateButton.attr('data-category-name') || '',
            subcategory_name: updateButton.attr('data-subcategory-name') || ''
        };
        populateMappingModal(mappingData);
    } else {
        // 如果找不到按钮，尝试从表格行获取
        const mappingRow = $(`tr[data-mapping-id="${mappingId}"]`);
        if (mappingRow.length > 0) {
            mappingData = {
                id: mappingId,
                category_id: mappingRow.attr('data-category-id') || '',
                subcategory_id: mappingRow.attr('data-subcategory-id') || '',
                mapping_status: mappingRow.attr('data-mapping-status') || 'Available',
                category_name: mappingRow.attr('data-category-name') || '',
                subcategory_name: mappingRow.attr('data-subcategory-name') || ''
            };
            populateMappingModal(mappingData);
        }
    }

    // 从 API 获取完整mapping数据
    $.ajax({
        url: url,
        type: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        },
        success: (response) => {
            if (response.success && response.data) {
                populateMappingModal(response.data);
            } else {
                if (typeof window.showAlert === 'function') {
                    window.showAlert(response.message || 'Failed to load mapping data', 'error');
                } else {
                    alert(response.message || 'Failed to load mapping data');
                }
            }
        },
        error: (xhr) => {
            let errorMessage = 'Failed to load mapping data';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }
            if (typeof window.showAlert === 'function') {
                window.showAlert(errorMessage, 'error');
            } else {
                alert(errorMessage);
            }
        }
    });
}

/**
 * 填充 Mapping Update Modal 的數據
 */
function populateMappingModal(mappingData) {

    // 設置隱藏的mapping ID（用於提交）
    const form = $('#updateMappingModalForm');
    form.attr('data-mapping-id', mappingData.id);

    // 更新當前Mapping信息卡片
    const currentInfo = `
        <div class="mb-1">
            <i class="bi bi-tag me-2 text-muted"></i>
            <span>Category: <strong>${mappingData.category_name || 'N/A'}</strong></span>
        </div>
        <div class="mb-1">
            <i class="bi bi-tags me-2 text-muted"></i>
            <span>Subcategory: <strong>${mappingData.subcategory_name || 'N/A'}</strong></span>
        </div>
        <div class="mb-1">
            <i class="bi bi-shield-check me-2 text-muted"></i>
            <span>Status: <strong>${mappingData.mapping_status || 'N/A'}</strong></span>
        </div>
    `;
    $('#currentMappingInfo').html(currentInfo);

    // 填充 Category 選項
    const categorySelect = $('#update_category_id');
    categorySelect.empty();
    categorySelect.append('<option value="">Select category</option>');
    if (window.availableCategories && Array.isArray(window.availableCategories)) {
        window.availableCategories.forEach(category => {
            const selected = category.id == mappingData.category_id ? 'selected' : '';
            categorySelect.append(`<option value="${category.id}" ${selected}>${category.category_name}</option>`);
        });
    }

    // 填充 Subcategory 選項
    const subcategorySelect = $('#update_subcategory_id');
    subcategorySelect.empty();
    subcategorySelect.append('<option value="">Select subcategory</option>');
    if (window.availableSubcategories && Array.isArray(window.availableSubcategories)) {
        window.availableSubcategories.forEach(subcategory => {
            const selected = subcategory.id == mappingData.subcategory_id ? 'selected' : '';
            subcategorySelect.append(`<option value="${subcategory.id}" ${selected}>${subcategory.subcategory_name}</option>`);
        });
    }

    // 設置狀態（交給 status-management 初始化後，直接設置單選值）
    const targetStatus = mappingData.mapping_status === 'Unavailable' ? 'Unavailable' : 'Available';
    const radioSelector = targetStatus === 'Available' ? '#update_status_available' : '#update_status_unavailable';
    $(radioSelector).prop('checked', true);

    // 初始化状态卡片（在打开 modal 前）
    if (typeof window.initializeStatusCardSelection === 'function') {
        window.initializeStatusCardSelection('mapping_status');
    }

    // 打開彈窗
    const modal = new bootstrap.Modal(document.getElementById('updateMappingModal'));
    modal.show();

    // 綁定提交事件（如果還沒綁定）
    if (!form.data('submit-bound')) {
        $('#submitUpdateMappingModal').off('click').on('click', function() {
            submitUpdateMappingModal();
        });
        form.data('submit-bound', true);
    }
}

/**
 * 提交更新映射彈窗
 */
function submitUpdateMappingModal() {
    const form = $('#updateMappingModalForm');
    const mappingId = form.attr('data-mapping-id');

    if (!mappingId) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Mapping ID not found', 'error');
        } else {
            alert('Mapping ID not found');
        }
        return;
    }

    // 驗證表單
    const categoryId = $('#update_category_id').val();
    const subcategoryId = $('#update_subcategory_id').val();
    const status = $('input[name="mapping_status"]:checked').val();

    if (!categoryId || !subcategoryId || !status) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please fill in all required fields', 'warning');
        } else {
            alert('Please fill in all required fields');
        }
        return;
    }

    // 準備表單數據
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
    formData.append('_method', 'PUT');
    formData.append('category_id', categoryId);
    formData.append('subcategory_id', subcategoryId);
    formData.append('mapping_status', status);

    // 顯示加載狀態
    const submitBtn = $('#submitUpdateMappingModal');
    const originalText = submitBtn.html();
    submitBtn.html('<i class="bi bi-hourglass-split me-2"></i>Updating...');
    submitBtn.prop('disabled', true);

    // 提交更新請求
    updateMapping(mappingId, formData,
        function(data) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(data.message || 'Mapping updated successfully', 'success');
            } else {
                alert(data.message || 'Mapping updated successfully');
            }

            // 關閉 modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('updateMappingModal'));
            if (modal) {
                modal.hide();
            }

            // 刷新頁面
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        },
        function(error) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(error || 'Failed to update mapping', 'error');
            } else {
                alert(error || 'Failed to update mapping');
            }

            // 恢復按鈕狀態
            submitBtn.html(originalText);
            submitBtn.prop('disabled', false);
        }
    );
}

// =============================================================================
// DOM 內容加載完成後的事件綁定 (DOM Content Loaded Event Binding)
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // 檢查當前頁面類型並初始化相應功能
    const dashboardCardsContainer = document.getElementById('dashboard-cards-container');
    const viewTable = document.querySelector('table tbody');
    const createMappingModal = document.getElementById('createMappingModal');

    if (dashboardCardsContainer) {
        // Dashboard 頁面
        initializeMappingDashboard();

        // 初始化 Create Mapping Modal
        if (createMappingModal) {
            initializeMappingCreateModal();
        }
    } else if (viewTable) {
        // View 頁面
        initializeMappingView();
    }
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

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

// 導出主要函數到全局作用域（用於 HTML onclick 屬性）
window.editMapping = editMapping;
window.setMappingAvailable = setMappingAvailable;
window.setMappingUnavailable = setMappingUnavailable;
window.viewCategoryDetails = viewCategoryDetails;
window.openUpdateMappingModal = openUpdateMappingModal;
window.submitUpdateMappingModal = submitUpdateMappingModal;
