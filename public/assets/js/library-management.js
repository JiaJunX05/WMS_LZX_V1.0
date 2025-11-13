/**
 * Library Management JavaScript
 * 尺碼庫管理統一交互邏輯
 *
 * 功能模塊：
 * - Dashboard 頁面：搜索、篩選、分頁、CRUD 操作、狀態切換
 * - View 頁面：查看詳情、刪除操作、Update Modal
 * - Create Modal：批量創建、表單驗證、狀態管理、單個創建
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

// 分頁相關變量
let currentPage = 1;
const itemsPerPage = 3; // 每頁顯示 3 個卡片
let allCategoryGroups = []; // 存儲所有分組數據

// =============================================================================
// API 請求函數 (API Request Functions)
// =============================================================================

/**
 * 處理尺碼庫請求
 */
function handleLibraryRequest(url, method, data, onSuccess, onError) {
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
 * 創建尺碼庫
 */
function createLibrary(libraryData, onSuccess, onError) {
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加尺碼庫數據
    if (libraryData.libraries && Array.isArray(libraryData.libraries)) {
        libraryData.libraries.forEach((library, index) => {
            formData.append(`libraries[${index}][category_id]`, library.categoryId);
            formData.append(`libraries[${index}][size_value]`, library.sizeValue);
            if (library.status) {
                formData.append(`libraries[${index}][size_status]`, library.status);
            }
        });
    } else {
        formData.append('category_id', libraryData.categoryId);
        if (libraryData.sizeValue) {
            formData.append('size_value', libraryData.sizeValue);
        }
        if (libraryData.status) {
            formData.append('size_status', libraryData.status);
        }
    }

    handleLibraryRequest(
        window.createSizeLibraryUrl,
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 更新尺碼庫
 */
function updateLibrary(libraryId, formData, onSuccess, onError) {
    formData.append('_method', 'PUT');

    handleLibraryRequest(
        window.updateSizeLibraryUrl.replace(':id', libraryId),
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 刪除尺碼庫
 */
function deleteLibrary(libraryId, onSuccess, onError) {
    handleLibraryRequest(
        window.deleteSizeLibraryUrl.replace(':id', libraryId),
        'DELETE',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置尺碼庫為可用
 */
function setLibraryAvailable(libraryId, onSuccess, onError) {
    handleLibraryRequest(
        window.availableSizeLibraryUrl.replace(':id', libraryId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置尺碼庫為不可用
 */
function setLibraryUnavailable(libraryId, onSuccess, onError) {
    handleLibraryRequest(
        window.unavailableSizeLibraryUrl.replace(':id', libraryId),
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
 * 初始化尺碼庫儀表板
 */
function initializeLibraryDashboard() {
    // 檢查URL參數中的成功消息
    checkUrlParams();

    // 綁定分頁按鈕事件
    bindPaginationEvents();

    // 加載尺碼庫數據
    loadLibraries();
}

/**
 * 綁定分頁按鈕事件
 */
function bindPaginationEvents() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            goToPreviousPage();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            goToNextPage();
        });
    }
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
 * 加載尺碼庫數據
 */
function loadLibraries() {
    const url = window.sizeLibraryManagementRoute;

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
                window.showAlert(data.message || 'Failed to load libraries', 'error');
            } else {
                alert(data.message || 'Failed to load libraries');
            }
        }
    })
    .catch(error => {
        console.error('Error loading libraries:', error);
        if (typeof window.showAlert === 'function') {
            window.showAlert('Failed to load libraries', 'error');
        } else {
            alert('Failed to load libraries');
        }
    });
}

/**
 * 渲染分類卡片
 */
function renderCategoryCards(groupedData) {
    const container = document.getElementById('dashboard-cards-container');
    const emptyState = document.getElementById('empty-state');

    if (!groupedData || groupedData.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('d-none');
        allCategoryGroups = [];
        updatePaginationInfoByCategory(groupedData, null);
        return;
    }

    emptyState.classList.add('d-none');

    // 按分類分組
    const groupedByCategory = groupByCategory(groupedData);

    // 將分組轉換為數組並存儲
    allCategoryGroups = Object.keys(groupedByCategory).map(categoryId => {
        const categoryData = groupedByCategory[categoryId];
        return {
            categoryId: categoryId,
            category: categoryData.category,
            libraries: categoryData.libraries
        };
    });

    // 渲染當前頁的卡片
    renderCurrentPage();
}

/**
 * 渲染當前頁的卡片
 */
function renderCurrentPage() {
    const container = document.getElementById('dashboard-cards-container');
    if (!container) return;

    // 計算當前頁的起始和結束索引
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageGroups = allCategoryGroups.slice(startIndex, endIndex);

    // 生成卡片HTML
    let cardsHTML = '';

    currentPageGroups.forEach(group => {
        const category = group.category;
        const libraries = group.libraries;

        // 確保category數據存在
        if (category && category.category_name) {
            cardsHTML += generateCategoryCard(category, libraries);
        } else {
            console.warn(`Category data missing for category ID ${group.categoryId}:`, category);
        }
    });

    container.innerHTML = cardsHTML;

    // 更新分頁信息
    updatePaginationInfo();
}

/**
 * 按分類分組
 */
function groupByCategory(groupedData) {
    const grouped = {};

    groupedData.forEach(group => {
        const category = group.category;
        if (category && category.id) {
            const categoryId = category.id;

            if (!grouped[categoryId]) {
                grouped[categoryId] = {
                    category: category,
                    libraries: []
                };
            }

            // 添加 libraries 數據
            if (group.libraries && Array.isArray(group.libraries)) {
                group.libraries.forEach(library => {
                    grouped[categoryId].libraries.push({
                        ...library,
                        id: library.id,
                        size_value: library.size_value,
                        size_status: library.size_status || 'Available'
                    });
                });
            }
        }
    });

    return grouped;
}

/**
 * 生成分類卡片
 */
function generateCategoryCard(category, libraries) {
    const availableCount = libraries.filter(library => {
        const status = library.size_status || 'Unavailable';
        return status === 'Available';
    }).length;
    const unavailableCount = libraries.filter(library => {
        const status = library.size_status || 'Unavailable';
        return status === 'Unavailable';
    }).length;
    const totalCount = libraries.length;

    // 確保category數據存在
    const categoryName = category ? category.category_name : 'Unknown Category';
    const categoryId = category ? category.id : 'unknown';

    // 生成尺碼值列表
    const sizeValuesHTML = libraries.map((library, index) => {
        const status = library.size_status || 'Unavailable';

        return `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span class="fw-medium" style="cursor: pointer;" onclick="editLibrary(${library.id})" title="Click to edit library">${library.size_value}</span>
                <div class="d-flex align-items-center gap-4">
                    <span class="badge ${status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${status}
                    </span>
                    <button class="btn btn-sm ${status === 'Available' ? 'btn-outline-warning' : 'btn-outline-success'}"
                            title="${status === 'Available' ? 'Deactivate' : 'Activate'}"
                            onclick="${status === 'Available' ? 'setLibraryUnavailable' : 'setLibraryAvailable'}(${library.id})">
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
                                <i class="bi bi-tag-fill text-white fs-5"></i>
                            </div>
                            <div>
                                <h5 class="card-title mb-0">${categoryName}</h5>
                                <small class="text-muted">${totalCount} size values</small>
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
                        ${sizeValuesHTML}
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
    const totalLibrariesElement = document.getElementById('total-libraries');
    const activeLibrariesElement = document.getElementById('active-libraries');
    const inactiveLibrariesElement = document.getElementById('inactive-libraries');
    const libraryGroupsElement = document.getElementById('library-groups');

    if (totalLibrariesElement) {
        totalLibrariesElement.textContent = data.pagination?.total || data.total_libraries || data.total || 0;
    }

    // 計算可用和不可用的尺碼庫數量
    if (data.data && Array.isArray(data.data)) {
        let availableLibraries = 0;
        let unavailableLibraries = 0;

        data.data.forEach(group => {
            if (group.libraries && Array.isArray(group.libraries)) {
                group.libraries.forEach(library => {
                    const status = library.size_status || 'Unavailable';
                    if (status === 'Available') {
                        availableLibraries++;
                    } else {
                        unavailableLibraries++;
                    }
                });
            }
        });

        if (activeLibrariesElement) {
            activeLibrariesElement.textContent = availableLibraries;
        }

        if (inactiveLibrariesElement) {
            inactiveLibrariesElement.textContent = unavailableLibraries;
        }
    }

    if (libraryGroupsElement) {
        // 按分類分組計算
        const groupedByCategory = groupByCategory(data.data || []);
        const categoryCount = Object.keys(groupedByCategory).length;
        libraryGroupsElement.textContent = categoryCount;
    }
}

/**
 * 按分類更新分頁信息
 */
function updatePaginationInfoByCategory(groupedData, pagination) {
    // 這個函數保留用於兼容性，實際分頁信息由 updatePaginationInfo 更新
    updatePaginationInfo();
}

/**
 * 更新分頁信息
 */
function updatePaginationInfo() {
    const totalCount = allCategoryGroups.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

    // 更新分頁信息顯示
    const showingStartEl = document.getElementById('showing-start');
    const showingEndEl = document.getElementById('showing-end');
    const totalCountEl = document.getElementById('total-count');

    if (showingStartEl) showingStartEl.textContent = totalCount > 0 ? startIndex + 1 : 0;
    if (showingEndEl) showingEndEl.textContent = endIndex;
    if (totalCountEl) totalCountEl.textContent = totalCount;

    // 更新分頁按鈕狀態
    updatePaginationButtons(totalCount);
}

/**
 * 更新分頁按鈕狀態
 */
function updatePaginationButtons(totalCount) {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const currentPageElement = document.getElementById('current-page');
    const pageNumberElement = document.getElementById('page-number');

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // 更新頁碼顯示
    if (pageNumberElement) {
        pageNumberElement.textContent = currentPage;
    }

    // 更新上一頁按鈕
    if (prevBtn) {
        if (currentPage <= 1) {
            prevBtn.classList.add('disabled');
        } else {
            prevBtn.classList.remove('disabled');
        }
    }

    // 更新下一頁按鈕
    if (nextBtn) {
        if (currentPage >= totalPages || totalPages === 0) {
            nextBtn.classList.add('disabled');
        } else {
            nextBtn.classList.remove('disabled');
        }
    }

    // 確保當前頁面始終顯示為活動狀態
    if (currentPageElement) {
        currentPageElement.classList.add('active');
        currentPageElement.classList.remove('disabled');
    }
}

/**
 * 切換到上一頁
 */
function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderCurrentPage();
    }
}

/**
 * 切換到下一頁
 */
function goToNextPage() {
    const totalPages = Math.ceil(allCategoryGroups.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderCurrentPage();
    }
}

// =============================================================================
// View 頁面功能 (View Page Functions)
// =============================================================================

/**
 * 初始化尺碼庫查看頁面
 */
function initializeLibraryView() {
    // 綁定事件監聽器
    bindViewEvents();

    // 綁定 Update Modal 事件
    bindUpdateLibraryModalEvents();

    // 初始化狀態
    updateViewUI();
}

/**
 * 綁定查看頁面事件
 */
function bindViewEvents() {
    // 刪除按鈕事件 - 使用事件委託，只監聽 Delete 按鈕
    document.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('button[data-size-library-id][data-action="delete"]');
        if (deleteButton) {
            const libraryId = deleteButton.getAttribute('data-size-library-id');
            deleteLibraryFromView(libraryId);
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
 * 更新表格序号
 */
function updateTableRowNumbers() {
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach((row, index) => {
        const numberCell = row.querySelector('td:first-child span');
        if (numberCell) {
            numberCell.textContent = index + 1;
        }
    });
}

/**
 * 從查看頁面刪除尺碼庫
 */
function deleteLibraryFromView(libraryId) {
    // 防止重複點擊
    if (isDeleting) {
        return;
    }

    isDeleting = true;

    if (!confirm('Are you sure you want to delete this size library?')) {
        isDeleting = false;
        return;
    }

    // 直接發送 DELETE 請求
    const url = window.deleteSizeLibraryUrl.replace(':id', libraryId);
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
                window.showAlert('Library deleted successfully', 'success');
            } else {
                alert('Library deleted successfully');
            }

            // 刪除成功後，從頁面中移除該行
            const deletedRow = document.querySelector(`[data-size-library-id="${libraryId}"]`).closest('tr');
            if (deletedRow) {
                deletedRow.remove();
            }

            // 更新表格序号
            updateTableRowNumbers();

            // 更新統計信息
            updateViewStatistics();

            // 檢查是否還有資料，如果沒有就跳轉回 index
            checkAndRedirectIfEmpty();
        } else {
            if (typeof window.showAlert === 'function') {
                window.showAlert('Failed to delete library', 'error');
            } else {
                alert('Failed to delete library');
            }
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
        if (typeof window.showAlert === 'function') {
            window.showAlert('Failed to delete library', 'error');
        } else {
            alert('Failed to delete library');
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
            window.location.href = window.sizeLibraryManagementRoute;
        }, 1000);
    }
}

// =============================================================================
// 尺碼庫操作函數 (Library Operations)
// =============================================================================

/**
 * 切換尺碼庫狀態
 */
function toggleLibraryStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateLibraryStatus(id, newStatus);
}

/**
 * 設置尺碼庫為可用
 */
function setLibraryAvailable(id) {
    updateLibraryStatus(id, 'Available');
}

/**
 * 設置尺碼庫為不可用
 */
function setLibraryUnavailable(id) {
    updateLibraryStatus(id, 'Unavailable');
}

/**
 * 更新單個尺碼庫狀態顯示（不重新加載所有數據）
 */
function updateSingleLibraryStatusUI(libraryId, newStatus) {
    // 找到包含該 library 的行（通過查找包含 libraryId 的按鈕）
    const libraryRows = document.querySelectorAll('.list-container > div');
    let targetRow = null;
    let categoryCard = null;

    libraryRows.forEach(row => {
        const button = row.querySelector('button');
        if (button && button.getAttribute('onclick')) {
            const onclickAttr = button.getAttribute('onclick');
            // 檢查 onclick 是否包含該 libraryId
            if (onclickAttr.includes(`(${libraryId})`)) {
                targetRow = row;
                categoryCard = row.closest('.content-card');
            }
        }
    });

    if (!targetRow || !categoryCard) {
        // 如果找不到，則重新加載所有數據
        console.warn('Could not find library row, reloading all data');
        loadLibraries();
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
            toggleButton.setAttribute('onclick', `setLibraryUnavailable(${libraryId})`);
        } else {
            toggleButton.className = 'btn btn-sm btn-outline-success';
            toggleButton.title = 'Activate';
            toggleButton.innerHTML = '<i class="bi bi-check-circle"></i>';
            toggleButton.setAttribute('onclick', `setLibraryAvailable(${libraryId})`);
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
 * 更新尺碼庫狀態
 */
function updateLibraryStatus(id, status) {
    const url = status === 'Available' ?
        window.availableSizeLibraryUrl.replace(':id', id) :
        window.unavailableSizeLibraryUrl.replace(':id', id);

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
                window.showAlert(`Library status updated to ${status.toLowerCase()} successfully!`, 'success');
        } else {
                alert(`Library status updated to ${status.toLowerCase()} successfully!`);
            }
            // 只更新單個尺碼庫狀態，不重新加載所有數據
            updateSingleLibraryStatusUI(id, status);
        } else {
            if (typeof window.showAlert === 'function') {
                window.showAlert('Failed to update library status', 'error');
            } else {
                alert('Failed to update library status');
            }
        }
    })
    .catch(error => {
        console.error(`Error setting library to ${status.toLowerCase()}:`, error);
        if (typeof window.showAlert === 'function') {
            window.showAlert('Failed to update library status', 'error');
        } else {
            alert('Failed to update library status');
        }
    });
}

/**
 * 查看分類詳情
 */
function viewCategoryDetails(categoryId) {
    // 跳轉到view頁面
    const url = window.viewSizeLibraryUrl.replace(':id', categoryId);
    window.location.href = url;
}

/**
 * 編輯尺碼庫（跳轉到 view 頁面）
 */
function editLibrary(libraryId) {
    const url = window.viewSizeLibraryUrl.replace(':id', libraryId);
    window.location.href = url;
}

// =============================================================================
// Create Modal 功能 (Create Modal Functions)
// =============================================================================

/**
 * 初始化 Library Create Modal
 */
function initializeLibraryCreateModal() {
    // 綁定 modal 事件
    bindLibraryModalEvents();
    // 加載 Categories
    loadCategoriesForModal();
}

/**
 * 綁定 Library Modal 事件
 */
function bindLibraryModalEvents() {
    const modal = document.getElementById('createLibraryModal');
    if (!modal) return;

    // Modal 打開時重置
    modal.addEventListener('show.bs.modal', function() {
        resetLibraryModal();
        loadCategoriesForModal();
    });

    // Category 選擇變化
    const categorySelect = document.getElementById('create_category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategorySelectChangeForModal);
    }

    // Size Type 選擇變化
    const sizeTypeSelect = document.getElementById('create_size_type');
    if (sizeTypeSelect) {
        sizeTypeSelect.addEventListener('change', handleSizeTypeSelectChange);
    }

    // Select All 按鈕
    const selectAllBtn = document.getElementById('selectAllSizesBtn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAllSizes);
    }

    // Clear All 按鈕
    const clearAllBtn = document.getElementById('clearAllSizesBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllSizes);
    }

    // Size Value 輸入框回車事件（直接創建）
    const sizeValueInput = document.getElementById('create_size_value');
    if (sizeValueInput) {
        sizeValueInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                createSingleSizeFromInput();
            }
        });
    }

    // 手動創建按鈕
    const createSingleSizeBtn = document.getElementById('createSingleSizeBtn');
    if (createSingleSizeBtn) {
        createSingleSizeBtn.addEventListener('click', createSingleSizeFromInput);
    }

    // 提交按鈕
    const submitBtn = document.getElementById('submitCreateLibraryModal');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitLibraryModal);
    }
}

/**
 * 加載 Categories 到 Modal
 */
function loadCategoriesForModal() {
    const categorySelect = document.getElementById('create_category_id');
    if (!categorySelect) return;

    // 使用從後端傳遞的 categories 數據（與 location/mapping 一致）
    if (window.availableCategories && Array.isArray(window.availableCategories)) {
        categorySelect.innerHTML = '<option value="">Select category</option>';
        window.availableCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.category_name;
            categorySelect.appendChild(option);
        });
    } else {
        console.error('Available categories not found. Make sure window.availableCategories is set in the dashboard view.');
        categorySelect.innerHTML = '<option value="">No categories available</option>';
        if (typeof window.showAlert === 'function') {
            window.showAlert('Failed to load categories', 'error');
        } else {
            alert('Failed to load categories');
        }
    }
}

/**
 * 處理 Category 選擇變化
 */
function handleCategorySelectChangeForModal() {
    const categoryId = document.getElementById('create_category_id').value;
    const sizeType = document.getElementById('create_size_type').value;

    if (categoryId && sizeType) {
        displaySizeCardsByType(sizeType);
        // 更新當前 category 的尺碼卡片選擇狀態
        updateSizeCardsSelection(categoryId);
    } else {
        hideSizeCards();
    }
}

/**
 * 處理 Size Type 選擇變化
 */
function handleSizeTypeSelectChange() {
    const categoryId = document.getElementById('create_category_id').value;
    const sizeType = document.getElementById('create_size_type').value;

    if (!categoryId) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please select a category first', 'warning');
                } else {
            alert('Please select a category first');
        }
        // 重置 size type 選擇
        document.getElementById('create_size_type').value = '';
        return;
    }

    if (sizeType) {
        displaySizeCardsByType(sizeType);
        // 更新當前 category 的尺碼卡片選擇狀態
        updateSizeCardsSelection(categoryId);
    } else {
        hideSizeCards();
    }
}

/**
 * 更新尺碼卡片選擇狀態（根據當前 category）
 * 注意：此函數在卡片生成後調用，確保所有卡片都有正確的 categoryId
 */
function updateSizeCardsSelection(categoryId) {
    if (!categoryId) return;

    // 只更新當前顯示的卡片（在 clothingSizesContainer 或 shoeSizesContainer 中）
    const clothingContainer = document.getElementById('clothingSizesContainer');
    const shoeContainer = document.getElementById('shoeSizesContainer');

    [clothingContainer, shoeContainer].forEach(container => {
        if (container) {
            container.querySelectorAll('.size-card').forEach(card => {
                // 更新 data-category-id 屬性
                card.dataset.categoryId = categoryId;
            });
        }
    });
}

/**
 * 根據類型顯示尺碼卡片
 */
function displaySizeCardsByType(sizeType) {
    const sizeSelection = document.getElementById('sizeSelection');
    const initialMessage = document.getElementById('initial-size-message');
    const clothingSection = document.getElementById('clothingSizesSection');
    const shoeSection = document.getElementById('shoeSizesSection');

    if (sizeSelection) {
        sizeSelection.classList.remove('d-none');
    }
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }

    // 根據類型顯示對應的尺碼
    if (sizeType === 'clothing') {
        // 顯示服裝尺碼
        if (clothingSection) {
            clothingSection.classList.remove('d-none');
        }
        if (shoeSection) {
            shoeSection.classList.add('d-none');
        }
        displayClothingSizes();
    } else if (sizeType === 'shoe') {
        // 顯示靴子尺碼
        if (clothingSection) {
            clothingSection.classList.add('d-none');
        }
        if (shoeSection) {
            shoeSection.classList.remove('d-none');
        }
        displayShoeSizes();
    }
}

/**
 * 顯示服裝尺碼卡片
 */
function displayClothingSizes() {
    const container = document.getElementById('clothingSizesContainer');
    if (!container) return;

    container.innerHTML = '';

    const clothingSizes = [
        'FREE SIZE',
        'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL',
        '3XL', '4XL', '5XL', '6XL', '7XL', '8XL'
    ];

    clothingSizes.forEach(size => {
        const card = createSizeCard(size, 'clothing');
        container.appendChild(card);
    });
}

/**
 * 顯示靴子尺碼卡片
 */
function displayShoeSizes() {
    const container = document.getElementById('shoeSizesContainer');
    if (!container) return;

    container.innerHTML = '';

    const shoeSizes = [
        'FREE SIZE',
        '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5',
        '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5',
        '12', '12.5', '13', '13.5', '14'
    ];

    shoeSizes.forEach(size => {
        const card = createSizeCard(size, 'shoe');
        container.appendChild(card);
    });
}

/**
 * 創建尺碼卡片
 */
function createSizeCard(size, type) {
    const categoryId = document.getElementById('create_category_id').value;
    const col = document.createElement('div');
    col.className = 'col-md-3 col-sm-4 col-6';

    const card = document.createElement('div');
    card.className = 'card h-100 border size-card border-light';
    card.dataset.size = size;
    card.dataset.type = type;
    if (categoryId) {
        card.dataset.categoryId = categoryId;
    }
    card.style.cursor = 'pointer';
    card.style.transition = 'all 0.3s ease';

    card.innerHTML = `
        <div class="card-body d-flex flex-column justify-content-center align-items-center text-center p-4"
             style="cursor: pointer; min-height: 80px; position: relative;">
            <div class="size-value fw-bold text-dark mb-0 fs-5">${size}</div>
        </div>
    `;

    // 點擊事件
    card.addEventListener('click', function() {
        toggleSizeCardSelection(card, size);
    });

    col.appendChild(card);
    return col;
}

/**
 * 切換尺碼卡片選擇狀態
 */
function toggleSizeCardSelection(card, size) {
    const categoryId = document.getElementById('create_category_id').value;
    if (!categoryId) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please select a category first', 'warning');
        } else {
            alert('Please select a category first');
        }
        return;
    }

    // 更新 data-category-id 屬性
    card.dataset.categoryId = categoryId;

    // 使用 DOM 狀態判斷是否已選擇（檢查是否有 border-success 類）
    // 注意：clothing 和 shoe 的尺碼可以同時選擇，因為它們都屬於同一個 category
    const isSelected = card.classList.contains('border-success');

    if (isSelected) {
        // 取消選擇
        card.classList.remove('border-success', 'bg-success-subtle');
        card.classList.add('border-light');
        card.style.transform = 'scale(1)';
        card.style.boxShadow = '';
    } else {
        // 選擇
        card.classList.remove('border-light');
        card.classList.add('border-success', 'bg-success-subtle');
        card.style.transform = 'scale(1.05)';
        card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    }

    // 強制更新 UI
    updateSizeSelectionCounter();
    updateSubmitButton();
}

/**
 * 隱藏尺碼卡片
 */
function hideSizeCards() {
    const sizeSelection = document.getElementById('sizeSelection');
    const initialMessage = document.getElementById('initial-size-message');
    const clothingSection = document.getElementById('clothingSizesSection');
    const shoeSection = document.getElementById('shoeSizesSection');

    if (sizeSelection) {
        sizeSelection.classList.add('d-none');
    }
    if (initialMessage) {
        initialMessage.classList.remove('d-none');
    }
    if (clothingSection) {
        clothingSection.classList.add('d-none');
    }
    if (shoeSection) {
        shoeSection.classList.add('d-none');
    }
}

/**
 * 獲取選中的尺碼（從 DOM 查詢）
 */
function getSelectedSizes() {
    const selectedCards = document.querySelectorAll('.size-card.border-success');
    const selectedSizes = [];

    selectedCards.forEach(card => {
        const size = card.dataset.size;
        const categoryId = card.dataset.categoryId;
        if (size && categoryId) {
            selectedSizes.push({
                sizeValue: size,
                categoryId: categoryId
            });
        }
    });

    return selectedSizes;
}

/**
 * 更新尺碼選擇計數器
 */
function updateSizeSelectionCounter() {
    const counter = document.getElementById('sizeSelectionCounter');
    if (counter) {
        const count = getSelectedSizes().length;
        counter.textContent = `${count} selected`;
        counter.className = count > 0 ? 'badge bg-success' : 'badge bg-primary';
    }
}

/**
 * 更新提交按鈕狀態
 */
function updateSubmitButton() {
    const submitBtn = document.getElementById('submitCreateLibraryModal');
    if (submitBtn) {
        const selectedCount = getSelectedSizes().length;
        submitBtn.disabled = selectedCount === 0;
    }
}

/**
 * 從輸入框直接創建單個尺碼
 */
function createSingleSizeFromInput() {
    const categoryId = document.getElementById('create_category_id').value;
    const sizeValue = document.getElementById('create_size_value').value.trim();

    // 驗證 Category（手動輸入時必需）
    if (!categoryId) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please select a category first', 'warning');
        } else {
            alert('Please select a category first');
        }
        const categorySelect = document.getElementById('create_category_id');
        if (categorySelect) {
            categorySelect.focus();
            categorySelect.classList.add('is-invalid');
            setTimeout(() => {
                categorySelect.classList.remove('is-invalid');
            }, 3000);
        }
        return;
    }

    // 驗證 Size Value（手動輸入時必需，不需要 Size Type）
    if (!sizeValue) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please enter a size value before creating', 'warning');
        } else {
            alert('Please enter a size value before creating');
        }
        // 聚焦到輸入框
        const sizeValueInput = document.getElementById('create_size_value');
        if (sizeValueInput) {
            sizeValueInput.focus();
            sizeValueInput.classList.add('is-invalid');
            setTimeout(() => {
                sizeValueInput.classList.remove('is-invalid');
            }, 3000);
        }
        return;
    }

    // 直接創建單個尺碼（不使用列表）
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
    formData.append('category_id', categoryId);
    formData.append('size_value', sizeValue);

    // 顯示加載狀態
    const sizeValueInput = document.getElementById('create_size_value');
    sizeValueInput.disabled = true;

    // 提交創建請求
    const storeUrl = window.storeSizeLibraryUrl || window.sizeLibraryManagementRoute.replace('/index', '/store');
    fetch(storeUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(data.message || 'Size library created successfully', 'success');
            } else {
                alert(data.message || 'Size library created successfully');
            }

            // 清空輸入框
            document.getElementById('create_size_value').value = '';
            sizeValueInput.disabled = false;
            sizeValueInput.focus();

            // 刷新頁面
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            throw new Error(data.message || 'Failed to create size library');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (typeof window.showAlert === 'function') {
            window.showAlert(error.message || 'Failed to create size library', 'error');
        } else {
            alert(error.message || 'Failed to create size library');
        }
        sizeValueInput.disabled = false;
    });
}

/**
 * 選擇所有尺碼卡片
 */
function selectAllSizes() {
    const categoryId = document.getElementById('create_category_id').value;
    const sizeType = document.getElementById('create_size_type').value;

    if (!categoryId) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please select a category first', 'warning');
        } else {
            alert('Please select a category first');
        }
        return;
    }

    if (!sizeType) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please select a size type first', 'warning');
        } else {
            alert('Please select a size type first');
        }
        return;
    }

    // 只選擇當前顯示的尺碼卡片（根據 sizeType）
    const containerId = sizeType === 'clothing' ? 'clothingSizesContainer' : 'shoeSizesContainer';
    const container = document.getElementById(containerId);
    if (!container) return;

    const allSizeCards = container.querySelectorAll('.size-card');
    let addedCount = 0;

    allSizeCards.forEach(card => {
        // 更新 data-category-id 屬性
        card.dataset.categoryId = categoryId;

        // 使用 DOM 狀態判斷是否已選擇
        const isSelected = card.classList.contains('border-success');

        if (!isSelected) {
            // 選擇卡片
            card.classList.remove('border-light');
            card.classList.add('border-success', 'bg-success-subtle');
            card.style.transform = 'scale(1.05)';
            card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            addedCount++;
        }
    });

    if (addedCount > 0) {
        updateSizeSelectionCounter();
        updateSubmitButton();
        if (typeof window.showAlert === 'function') {
            window.showAlert(`Added ${addedCount} size(s) to selection`, 'success');
        } else {
            alert(`Added ${addedCount} size(s) to selection`);
        }
    } else {
        if (typeof window.showAlert === 'function') {
            window.showAlert('All sizes are already selected', 'info');
        } else {
            alert('All sizes are already selected');
        }
    }
}

/**
 * 清除所有尺碼選擇
 */
function clearAllSizes() {
    const categoryId = document.getElementById('create_category_id').value;

    if (categoryId) {
        // 只清除當前 category 的選擇
        const beforeCount = getSelectedSizes().length;

        // 只更新當前 category 的卡片視覺狀態
        document.querySelectorAll('.size-card').forEach(card => {
            if (card.dataset.categoryId === categoryId) {
                card.classList.remove('border-success', 'bg-success-subtle');
                card.classList.add('border-light');
                card.style.transform = 'scale(1)';
                card.style.boxShadow = '';
            }
        });

        const afterCount = getSelectedSizes().length;
        const removedCount = beforeCount - afterCount;

        updateSizeSelectionCounter();
        updateSubmitButton();

        if (removedCount > 0) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(`Cleared ${removedCount} size(s) from selection`, 'info');
            } else {
                alert(`Cleared ${removedCount} size(s) from selection`);
            }
        } else {
            if (typeof window.showAlert === 'function') {
                window.showAlert('No sizes to clear', 'info');
            } else {
                alert('No sizes to clear');
            }
        }
    } else {
        // 如果沒有選擇 category，清除所有
        document.querySelectorAll('.size-card').forEach(card => {
            card.classList.remove('border-success', 'bg-success-subtle');
            card.classList.add('border-light');
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '';
        });
        updateSizeSelectionCounter();
        updateSubmitButton();
        if (typeof window.showAlert === 'function') {
            window.showAlert('All selections cleared', 'info');
        } else {
            alert('All selections cleared');
        }
    }
}

/**
 * 清除 Modal 表單
 */
function clearLibraryModalForm() {
    document.getElementById('create_category_id').value = '';
    document.getElementById('create_size_type').value = '';
    document.getElementById('create_size_value').value = '';

    // 清除所有卡片選擇
    document.querySelectorAll('.size-card').forEach(card => {
        card.classList.remove('border-success', 'bg-success-subtle');
        card.classList.add('border-light');
        card.style.transform = 'scale(1)';
        card.style.boxShadow = '';
        card.dataset.categoryId = '';
    });

    updateSizeSelectionCounter();
    updateSubmitButton();
    hideSizeCards();
}

/**
 * 重置 Library Modal
 */
function resetLibraryModal() {
    clearLibraryModalForm();
    // 確保按鈕初始狀態正確
    updateSubmitButton();
}

/**
 * 提交 Library Modal
 */
function submitLibraryModal() {
    const selectedSizes = getSelectedSizes();

    if (selectedSizes.length === 0) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please add at least one size value', 'warning');
        } else {
            alert('Please add at least one size value');
        }
        return;
    }

    // 按 category 分組
    const groupedByCategory = {};
    selectedSizes.forEach(item => {
        if (!groupedByCategory[item.categoryId]) {
            groupedByCategory[item.categoryId] = [];
        }
        groupedByCategory[item.categoryId].push(item.sizeValue);
    });

    // 準備數據 - 使用 libraries 格式（支持多個 category）
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    let index = 0;
    Object.keys(groupedByCategory).forEach(categoryId => {
        groupedByCategory[categoryId].forEach(sizeValue => {
            formData.append(`libraries[${index}][category_id]`, categoryId);
            formData.append(`libraries[${index}][size_value]`, sizeValue);
            index++;
        });
    });

    // 顯示加載狀態
    const submitBtn = document.getElementById('submitCreateLibraryModal');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Creating...';
    submitBtn.disabled = true;

    // 提交創建請求
    const storeUrl = window.storeSizeLibraryUrl || window.sizeLibraryManagementRoute.replace('/index', '/store');
    fetch(storeUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(data.message || 'Size libraries created successfully', 'success');
            } else {
                alert(data.message || 'Size libraries created successfully');
            }

            // 關閉 modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createLibraryModal'));
            if (modal) {
                modal.hide();
            }

            // 刷新頁面
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            throw new Error(data.message || 'Failed to create size libraries');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (typeof window.showAlert === 'function') {
            window.showAlert(error.message || 'Failed to create size libraries', 'error');
        } else {
            alert(error.message || 'Failed to create size libraries');
        }

        // 恢復按鈕狀態
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// =============================================================================
// Update Modal 功能 (Update Modal Functions)
// =============================================================================

/**
 * 綁定 Library Update Modal 事件
 */
function bindUpdateLibraryModalEvents() {
    const modal = document.getElementById('updateLibraryModal');
    if (!modal) return;

    // 提交按鈕
    const submitBtn = document.getElementById('submitUpdateLibraryModal');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitUpdateLibraryModal);
    }

    // Modal 關閉時清理
    modal.addEventListener('hidden.bs.modal', function() {
        const form = document.getElementById('updateLibraryModalForm');
        if (form) {
            form.reset();
            form.removeAttribute('data-size-library-id');
        }
        // 手动清理 backdrop，确保 modal 完全关闭
        cleanupModalBackdrop();
    });
}

/**
 * 打開更新尺碼庫彈窗
 */
function openUpdateLibraryModal(libraryId) {
    const url = window.editSizeLibraryUrl.replace(':id', libraryId);

    // 从按钮或表格行获取library数据（如果可用，用于快速填充）
    let updateButton = document.querySelector(`button[onclick*="openUpdateLibraryModal(${libraryId})"]`);
    if (!updateButton) {
        updateButton = document.querySelector(`button[data-size-library-id="${libraryId}"]`);
    }

    let libraryData = null;

    if (updateButton) {
        // 快速填充基本数据
        libraryData = {
            id: libraryId,
            category_id: updateButton.getAttribute('data-category-id') || '',
            size_value: updateButton.getAttribute('data-size-value') || '',
            size_status: updateButton.getAttribute('data-size-status') || 'Available',
            category_name: updateButton.getAttribute('data-category-name') || ''
        };
        populateLibraryModal(libraryData);
    } else {
        // 如果找不到按钮，尝试从表格行获取
        const libraryRow = document.querySelector(`tr[data-size-library-id="${libraryId}"]`);
        if (libraryRow) {
            libraryData = {
                id: libraryId,
                category_id: libraryRow.getAttribute('data-category-id') || '',
                size_value: libraryRow.getAttribute('data-size-value') || '',
                size_status: libraryRow.getAttribute('data-size-status') || 'Available',
                category_name: libraryRow.getAttribute('data-category-name') || ''
            };
            populateLibraryModal(libraryData);
        }
    }

    // 从 API 获取完整library数据
    $.ajax({
        url: url,
        type: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        },
        success: (response) => {
            if (response.success && response.data) {
                populateLibraryModal(response.data);
            } else {
                if (typeof window.showAlert === 'function') {
                    window.showAlert(response.message || 'Failed to load size library data', 'error');
                } else {
                    alert(response.message || 'Failed to load size library data');
                }
            }
        },
        error: (xhr) => {
            let errorMessage = 'Failed to load size library data';
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
 * 填充 Library Update Modal 的數據
 */
function populateLibraryModal(libraryData) {
    const form = document.getElementById('updateLibraryModalForm');
    if (!form) return;

    // 設置隱藏的 library ID（用於提交）
    form.setAttribute('data-size-library-id', libraryData.id);

    // 填充當前信息
    const currentInfo = document.getElementById('currentLibraryInfo');
    if (currentInfo) {
        currentInfo.innerHTML = `
            <div class="mb-1">
                <i class="bi bi-tag me-2 text-muted"></i>
                <span>Category: <strong>${libraryData.category_name || 'N/A'}</strong></span>
            </div>
            <div class="mb-1">
                <i class="bi bi-rulers me-2 text-muted"></i>
                <span>Size Value: <strong>${libraryData.size_value || 'N/A'}</strong></span>
            </div>
            <div>
                <i class="bi bi-shield-check me-2 text-muted"></i>
                <span>Status: <strong>${libraryData.size_status || 'N/A'}</strong></span>
            </div>
        `;
    }

    // 填充 Category 選擇
    const categorySelect = document.getElementById('update_category_id');
    if (categorySelect && window.availableCategories) {
        categorySelect.innerHTML = '<option value="">Select category</option>';
        window.availableCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.category_name;
            if (category.id == libraryData.category_id) {
                option.selected = true;
            }
            categorySelect.appendChild(option);
        });
    }

    // 填充 Size Value
    const sizeValueInput = document.getElementById('update_size_value');
    if (sizeValueInput) {
        sizeValueInput.value = libraryData.size_value || '';
    }

    // 設置 Status
    const targetStatus = libraryData.size_status === 'Unavailable' ? 'Unavailable' : 'Available';
    const radioSelector = targetStatus === 'Available' ? '#update_status_available' : '#update_status_unavailable';
    const statusRadio = document.querySelector(radioSelector);
    if (statusRadio) {
        statusRadio.checked = true;
    }

    // 初始化状态卡片
    if (typeof window.initializeStatusCardSelection === 'function') {
        window.initializeStatusCardSelection('size_status');
    }

    // 打開彈窗
    const modalElement = document.getElementById('updateLibraryModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

/**
 * 提交更新尺碼庫彈窗
 */
function submitUpdateLibraryModal() {
    const form = document.getElementById('updateLibraryModalForm');
    if (!form) return;

    const libraryId = form.getAttribute('data-size-library-id');
    if (!libraryId) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Size library ID not found', 'error');
        } else {
            alert('Size library ID not found');
        }
        return;
    }

    // 驗證表單
    const categoryId = document.getElementById('update_category_id').value;
    const sizeValue = document.getElementById('update_size_value').value.trim();
    const status = document.querySelector('input[name="size_status"]:checked')?.value;

    if (!categoryId || !sizeValue || !status) {
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
    formData.append('size_value', sizeValue);
    formData.append('size_status', status);

    // 顯示加載狀態
    const submitBtn = document.getElementById('submitUpdateLibraryModal');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Updating...';
    submitBtn.disabled = true;

    // 提交更新請求
    updateLibrary(libraryId, formData,
        function(data) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(data.message || 'Size library updated successfully', 'success');
            } else {
                alert(data.message || 'Size library updated successfully');
            }

            // 關閉 modal
            const modalElement = document.getElementById('updateLibraryModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                }
            }

            // 刷新頁面
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        },
        function(error) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(error || 'Failed to update size library', 'error');
            } else {
                alert(error || 'Failed to update size library');
            }

            // 恢復按鈕狀態
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
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
    const createLibraryModal = document.getElementById('createLibraryModal');

    if (dashboardCardsContainer) {
        // Dashboard 頁面
        initializeLibraryDashboard();

        // 初始化 Create Modal（如果存在）
        if (createLibraryModal) {
            initializeLibraryCreateModal();
        }
    } else if (viewTable) {
        // View 頁面
        initializeLibraryView();
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
window.editLibrary = editLibrary;
window.setLibraryAvailable = setLibraryAvailable;
window.setLibraryUnavailable = setLibraryUnavailable;
window.viewCategoryDetails = viewCategoryDetails;
window.openUpdateLibraryModal = openUpdateLibraryModal;
window.submitUpdateLibraryModal = submitUpdateLibraryModal;
