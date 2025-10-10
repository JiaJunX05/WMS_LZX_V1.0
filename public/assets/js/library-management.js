/**
 * Library Management JavaScript
 * 尺碼庫管理統一交互邏輯
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

// 尺碼值列表數組（用於 Create 頁面）
let sizeList = [];

// 排序狀態：true = 升序，false = 降序
let isAscending = false; // 默認降序（最新的在上面）

// 全局變量防止重複請求
let isDeleting = false;

// =============================================================================
// 通用功能模塊 (Common Functions Module)
// =============================================================================

/**
 * 驗證尺碼庫表單
 */
function validateLibraryForm() {
    const categoryId = document.getElementById('category_id').value;
    const sizeValue = document.getElementById('size_value') ? document.getElementById('size_value').value.trim() : '';

    if (!categoryId) {
        window.showAlert('Please select a category', 'warning');
        return false;
    }

    if (sizeValue && !sizeValue) {
        window.showAlert('Please enter size value', 'warning');
        return false;
    }

    return true;
}

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
    formData.append('category_id', libraryData.categoryId);

    // 添加尺碼值
    if (libraryData.sizeValues && Array.isArray(libraryData.sizeValues)) {
        libraryData.sizeValues.forEach(sizeValue => {
            formData.append('size_values[]', sizeValue);
        });
    } else if (libraryData.sizeValue) {
        formData.append('size_value', libraryData.sizeValue);
    }

    // 添加狀態
    if (libraryData.status) {
        formData.append('size_status', libraryData.status);
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

/**
 * 獲取尺碼庫狀態類別
 */
function getLibraryStatusClass(status) {
    return status === 'Available' ? 'text-success' : 'text-danger';
}

/**
 * 檢查尺碼值是否存在
 */
function isSizeValueExists(sizeList, sizeValue) {
    return sizeList.some(item => item.sizeValue.toLowerCase() === sizeValue.toLowerCase());
}

/**
 * 高亮顯示已存在的尺碼值
 */
function highlightExistingSizeValue(element) {
    const existingValues = document.querySelectorAll('.value-item');
    for (let item of existingValues) {
        const value = item.querySelector('.size-value-text').textContent.trim();
        if (value.toLowerCase() === element.value.toLowerCase()) {
            // 添加高亮樣式
            item.classList.add('duplicate-highlight');

            // 滾動到該元素
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 3秒後移除高亮
            setTimeout(() => {
                item.classList.remove('duplicate-highlight');
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
    const configSummary = document.getElementById('configSummary');

    if (categorySelect && configSummary) {
        if (categorySelect.value) {
            configSummary.style.display = 'block';
        } else {
            configSummary.style.display = 'none';
        }
    }

    // 更新尺碼值顯示
    updateSizeRangeDisplay();
}

/**
 * 處理分類選擇變化
 */
function handleCategoryChange() {
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        const selectedCategory = categorySelect.options[categorySelect.selectedIndex];
        const selectedCategoryDisplay = document.getElementById('selectedCategory');

        if (selectedCategoryDisplay) {
            selectedCategoryDisplay.textContent = selectedCategory.value ? selectedCategory.text : 'None';
        }

        updateConfigSummary();
    }
}

/**
 * 更新分類信息
 */
function updateCategoryInfo() {
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        const selectedOption = categorySelect.options[categorySelect.selectedIndex];
        const categoryName = selectedOption.text;
        const categoryDisplay = document.querySelector('#selectedCategory');

        if (categoryDisplay) {
            categoryDisplay.textContent = categoryName;
        }
    }
}

/**
 * 更新尺碼庫選項
 */
function updateSizeLibraryOptions() {
    const categoryId = document.getElementById('category_id').value;
    const genderId = document.getElementById('gender_id') ? document.getElementById('gender_id').value : null;
    const sizeLibrarySelect = document.getElementById('size_library_id');

    if (!sizeLibrarySelect) return;

    // 如果類別沒有選擇，清空尺碼庫選項
    if (!categoryId) {
        sizeLibrarySelect.innerHTML = '<option value="">Please select category first</option>';
        sizeLibrarySelect.disabled = true;
        return;
    }

    // 顯示加載狀態
    sizeLibrarySelect.innerHTML = '<option value="">Loading...</option>';
    sizeLibrarySelect.disabled = true;

    // 構建請求URL
    let url = window.availableSizeLibrariesUrl;
    if (genderId) {
        url += `?category_id=${categoryId}&gender_id=${genderId}`;
    } else {
        url += `?category_id=${categoryId}`;
    }

    fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data) {
            sizeLibrarySelect.innerHTML = '<option value="">Select size library</option>';
            data.data.forEach(library => {
                const option = document.createElement('option');
                option.value = library.id;
                option.textContent = library.size_value;
                sizeLibrarySelect.appendChild(option);
            });
            sizeLibrarySelect.disabled = false;
        } else {
            sizeLibrarySelect.innerHTML = '<option value="">No size libraries available</option>';
            sizeLibrarySelect.disabled = true;
        }
    })
    .catch(error => {
        console.error('Error loading size libraries:', error);
        sizeLibrarySelect.innerHTML = '<option value="">Error loading size libraries</option>';
        sizeLibrarySelect.disabled = true;
    });
}

/**
 * 設置狀態卡片選擇
 */
function setupStatusCardSelection() {
    // 調用統一的狀態卡片初始化函數
    if (typeof window.initializeLibraryStatusCardSelection === 'function') {
        window.initializeLibraryStatusCardSelection();
    }
}

/**
 * 綁定尺碼庫事件
 */
function bindLibraryEvents() {
    // 狀態卡片選擇
    setupStatusCardSelection();

    // 分類選擇變化
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
    }

    // 性別選擇變化（如果有）
    const genderSelect = document.getElementById('gender_id');
    if (genderSelect) {
        genderSelect.addEventListener('change', updateSizeLibraryOptions);
    }
}

/**
 * 初始化尺碼庫頁面
 */
function initializeLibraryPage(config) {
    // 綁定事件監聽器
    bindLibraryEvents();

    // 初始化狀態
    updateConfigSummary();

    // 執行初始化回調函數（如果有）
    if (config && config.initializationCallback && typeof config.initializationCallback === 'function') {
        config.initializationCallback();
    }
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

    // 加載尺碼庫數據
    loadLibraries();

    // 綁定搜索功能
    bindSearchEvents();

    // 綁定篩選功能
    bindFilterEvents();
}

function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success) {
        window.showAlert(decodeURIComponent(success), 'success');
        // 清除URL參數
        const url = new URL(window.location);
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url);
    }

    if (error) {
        window.showAlert(decodeURIComponent(error), 'danger');
        // 清除URL參數
        const url = new URL(window.location);
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url);
    }
}

function loadLibraries() {
    const url = window.sizeLibraryManagementRoute;
    console.log('Loading libraries from:', url);

    fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Received data:', data);
        if (data.success) {
            console.log('Data groups:', data.data);
            renderCategoryCards(data.data);
            updateStatistics(data.data);
            updatePaginationInfoByCategory(data.data, data.pagination);
        } else {
            console.error('API returned success: false', data);
            showError('Failed to load libraries');
        }
    })
    .catch(error => {
        console.error('Error loading libraries:', error);
        showError('Error loading libraries');
    });
}

function renderCategoryCards(groupedData) {
    const container = document.getElementById('dashboard-cards-container');
    const emptyState = document.getElementById('empty-state');

    if (!groupedData || groupedData.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // 生成卡片HTML
    let cardsHTML = '';

    groupedData.forEach(group => {
        const category = group.category;
        const libraries = group.libraries;

        // 確保category數據存在
        if (category && category.category_name) {
            cardsHTML += generateCategoryCard(category, libraries);
        } else {
            console.warn(`Category data missing:`, category);
        }
    });

    container.innerHTML = cardsHTML;

    // 綁定卡片內的事件
    bindCardEvents();
}

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
        const statusClass = getLibraryStatusClass(status);
        const statusIcon = status === 'Available' ? 'bi-check-circle' : 'bi-x-circle';

        return `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span class="fw-medium">${library.size_value}</span>
                <div class="d-flex align-items-center gap-4">
                    <button class="btn ${status === 'Available' ? 'btn-success' : 'btn-danger'} btn-sm"
                            onclick="toggleLibraryStatus(${library.id}, '${status}')"
                            style="padding: 0.25rem 0.75rem; font-weight: 600;">
                        ${status.toUpperCase()}
                    </button>
                    <button class="btn-action ${status === 'Available' ? 'unavailable' : 'available'}"
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
                                <i class="bi bi-tag-fill"></i>
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

function bindCardEvents() {
    // 卡片內的事件綁定
    console.log('Card events bound');
}

// 尺碼庫狀態操作函數

function toggleLibraryStatus(id, currentStatus) {
    // 切換尺碼庫狀態
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateLibraryStatus(id, newStatus);
}

function setLibraryAvailable(id) {
    // 設置尺碼庫為可用
    updateLibraryStatus(id, 'Available');
}

function setLibraryUnavailable(id) {
    // 設置尺碼庫為不可用
    updateLibraryStatus(id, 'Unavailable');
}

function updateLibraryStatus(id, status) {
    const url = status === 'Available' ?
        window.availableSizeLibraryUrl.replace(':id', id) :
        window.unavailableSizeLibraryUrl.replace(':id', id);

    console.log('Updating library status:', { id, status, url });

    // 顯示加載提示
    if (typeof window.showAlert === 'function') {
        window.showAlert('Updating library status...', 'info');
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
                window.showAlert(`Library status updated to ${status.toLowerCase()} successfully!`, 'success');
            } else {
                alert(`Library status updated to ${status.toLowerCase()} successfully!`);
            }
            loadLibraries(); // 重新加載數據
        } else {
            if (typeof window.showAlert === 'function') {
                window.showAlert(`Failed to update library status to ${status.toLowerCase()}`, 'error');
            } else {
                alert(`Failed to update library status to ${status.toLowerCase()}`);
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

function bindSearchEvents() {
    // 搜索功能綁定
    console.log('Search events bound');
}

function bindFilterEvents() {
    // 篩選功能綁定
    console.log('Filter events bound');
}

function updateStatistics(groupedData) {
    console.log('updateStatistics called with:', groupedData);

    // 計算統計數據
    let totalLibraries = 0;
    let availableLibraries = 0;
    let unavailableLibraries = 0;
    let categoryCount = groupedData.length;

    groupedData.forEach(group => {
        const libraries = group.libraries;
        totalLibraries += libraries.length;

        libraries.forEach(library => {
            const status = library.size_status || 'Unavailable';
            if (status === 'Available') {
                availableLibraries++;
            } else {
                unavailableLibraries++;
            }
        });
    });

    console.log('Calculated statistics:', {
        totalLibraries,
        availableLibraries,
        unavailableLibraries,
        categoryCount
    });

    // 更新統計數據
    document.getElementById('total-items').textContent = totalLibraries; // 總尺碼庫數量
    document.getElementById('available-items').textContent = availableLibraries;
    document.getElementById('unavailable-items').textContent = unavailableLibraries;
    document.getElementById('total-groups').textContent = categoryCount; // 總分類數量
}

function updatePaginationInfo(pagination) {
    if (pagination) {
        document.getElementById('showing-start').textContent = pagination.from || 0;
        document.getElementById('showing-end').textContent = pagination.to || 0;
        document.getElementById('total-count').textContent = pagination.total || 0;
    }
}

function updatePaginationInfoByCategory(groupedData, pagination) {
    const categoryCount = groupedData.length;

    // 更新分頁信息顯示
    document.getElementById('showing-start').textContent = 1;
    document.getElementById('showing-end').textContent = categoryCount;
    document.getElementById('total-count').textContent = categoryCount;

    // 更新分頁按鈕狀態
    updatePaginationButtons(categoryCount);
}

function updatePaginationButtons(categoryCount) {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const currentPageElement = document.getElementById('current-page');
    const pageNumberElement = document.getElementById('page-number');

    // 更新頁碼顯示
    if (pageNumberElement) {
        pageNumberElement.textContent = '1'; // 當前總是第1頁
    }

    // 如果只有一個類別或沒有類別，禁用分頁按鈕
    if (categoryCount <= 1) {
        prevBtn.classList.add('disabled');
        nextBtn.classList.add('disabled');
        // 不要給當前頁面元素添加disabled類，保持active狀態
        if (currentPageElement) {
            currentPageElement.classList.remove('disabled');
        }
    } else {
        // 這裡可以根據需要實現真正的分頁邏輯
        // 目前顯示所有類別，所以按鈕保持禁用狀態
        prevBtn.classList.add('disabled');
        nextBtn.classList.add('disabled');
        if (currentPageElement) {
            currentPageElement.classList.remove('disabled');
        }
    }
}

function viewCategoryDetails(categoryId) {
    // 跳轉到view頁面
    const url = window.viewSizeLibraryUrl.replace(':id', categoryId);
    window.location.href = url;
}

function showError(message) {
    window.showAlert(message, 'danger');
}

function showSuccess(message) {
    // 顯示成功消息
    window.showAlert(message, 'success');
    console.log('Success:', message);
}

// =============================================================================
// Create 頁面功能 (Create Page Functions)
// =============================================================================

/**
 * 初始化尺碼庫創建頁面
 */
function initializeLibraryCreate() {
    // 使用通用初始化函數
    initializeLibraryPage({
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
    // 尺碼值輸入框回車事件
    const sizeValueInput = document.getElementById('size_value');
    if (sizeValueInput) {
        sizeValueInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSizeValue();
            }
        });
    }

    // 添加尺碼值按鈕
    const addSizeValueBtn = document.getElementById('addSizeValue');
    if (addSizeValueBtn) {
        addSizeValueBtn.addEventListener('click', addSizeValue);
    }

    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 刪除尺碼值按鈕事件委託
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const button = e.target.closest('.remove-item');
            const index = parseInt(button.getAttribute('data-index'));

            if (!isNaN(index)) {
                removeSizeValue(index);
            }
        }
    });

    // 排序按鈕
    const sortBtn = document.getElementById('sortSizes');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 自動添加按鈕
    const addClothingSizesBtn = document.getElementById('addClothingSizes');
    if (addClothingSizesBtn) {
        addClothingSizesBtn.addEventListener('click', addClothingSizes);
    }

    const addShoeSizesBtn = document.getElementById('addShoeSizes');
    if (addShoeSizesBtn) {
        addShoeSizesBtn.addEventListener('click', addShoeSizes);
    }

    // 表單提交處理
    const form = document.getElementById('sizeLibraryForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// 添加尺碼值
function addSizeValue() {
    if (!validateLibraryForm()) {
        return;
    }

    const sizeValueInput = document.getElementById('size_value');
    const categorySelect = document.getElementById('category_id');

    const sizeValue = sizeValueInput.value.trim();
    const categoryId = categorySelect.value;

    // 檢查是否已存在
    if (isSizeValueExists(sizeList, sizeValue)) {
        window.showAlert(`Size value "${sizeValue}" already exists in the list`, 'error');
        highlightExistingSizeValue(sizeValueInput);
        sizeValueInput.focus();
        return;
    }

    // 添加尺碼值到數組
    sizeList.push({
        sizeValue: sizeValue,
        categoryId: categoryId
    });

    // 更新UI
    updateSizeList();
    updateUI();

    // 顯示配置摘要
    updateConfigSummary();

    // 顯示右邊的尺碼值表格
    showSizeValuesArea();

    // 清空輸入框
    sizeValueInput.value = '';
    sizeValueInput.focus();

    // 顯示成功提示
    window.showAlert('Size value added successfully', 'success');
}

// 從列表中移除尺碼值
function removeSizeValue(index) {
    if (index >= 0 && index < sizeList.length) {
        // 獲取要刪除的尺碼值信息
        const sizeToRemove = sizeList[index];

        // 確認刪除
        if (!confirm(`Are you sure you want to remove size value "${sizeToRemove.sizeValue}"?`)) {
            return;
        }

        sizeList.splice(index, 1);
        updateSizeList();

        // 如果沒有尺碼值了，隱藏區域
        if (sizeList.length === 0) {
            hideAllAreas();
        }

        updateUI();
        window.showAlert('Size value removed successfully', 'success');
    } else {
        window.showAlert('Failed to remove size value', 'error');
    }
}

// 更新尺碼值列表顯示
function updateSizeList() {
    const container = document.getElementById('sizeValuesList');
    if (!container) return;

    container.innerHTML = '';

    sizeList.forEach((item, index) => {
        const sizeItem = document.createElement('div');

        // 檢查是否為重複項
        const isDuplicate = isSizeValueExists(sizeList, item.sizeValue) &&
            sizeList.filter(i => i.sizeValue.toLowerCase() === item.sizeValue.toLowerCase()).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 rounded border';
        const duplicateClasses = isDuplicate ? 'duplicate-item bg-warning-subtle border-warning' : 'bg-light';

        sizeItem.className = `${baseClasses} ${duplicateClasses}`;

        sizeItem.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-2">
                    ${isDuplicate ? '⚠️' : (index + 1)}
                </span>
                <span class="size-value-text fw-medium">${item.sizeValue}</span>
                ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2">Duplicate</span>' : ''}
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                <i class="bi bi-trash me-1"></i>Remove
            </button>
        `;
        container.appendChild(sizeItem);
    });
}

// 顯示尺碼值區域
function showSizeValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    // 隱藏輸入提示
    const sizeInputPrompt = document.getElementById('sizeInputPrompt');
    if (sizeInputPrompt) {
        sizeInputPrompt.style.display = 'none';
    }

    // 顯示尺碼值區域
    const sizeValuesArea = document.getElementById('sizeValuesArea');
    if (sizeValuesArea) {
        sizeValuesArea.style.display = 'block';
    }

    // 顯示提交按鈕
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.style.display = 'block';
    }
}

// 清除表單
function clearForm() {
    // 檢查是否有數據需要清除
    if (sizeList.length === 0) {
        window.showAlert('No data to clear', 'info');
        return;
    }

    // 確認清除
    if (!confirm('Are you sure you want to clear all size values?')) {
        return;
    }

    // 清空數組
    sizeList = [];

    // 清空輸入框
    const sizeValueInput = document.getElementById('size_value');
    if (sizeValueInput) {
        sizeValueInput.value = '';
    }

    // 重置分類選擇
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.value = '';
    }

    // 更新UI
    updateSizeList();
    updateUI();

    // 顯示成功提示
    window.showAlert('All size values cleared successfully', 'success');

    // 隱藏所有區域
    hideAllAreas();

    // 更新UI
    updateUI();
}

// 隱藏所有區域
function hideAllAreas() {
    // 隱藏尺碼值區域
    const sizeValuesArea = document.getElementById('sizeValuesArea');
    if (sizeValuesArea) {
        sizeValuesArea.style.display = 'none';
    }

    // 隱藏輸入提示
    const sizeInputPrompt = document.getElementById('sizeInputPrompt');
    if (sizeInputPrompt) {
        sizeInputPrompt.style.display = 'none';
    }

    // 隱藏提交按鈕
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.style.display = 'none';
    }

    // 顯示初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'block';
    }
}

// 更新UI狀態
function updateUI() {
    // 更新尺碼值計數
    updateSizeValuesCount();

    // 更新尺碼範圍顯示
    updateSizeRangeDisplay();

    // 更新配置摘要
    updateConfigSummary();
}

// 更新尺碼值計數
function updateSizeValuesCount() {
    const count = sizeList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('sizeValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} values`;
    }

    // 更新左側計數文本
    const countText = document.getElementById('sizeCountText');
    if (countText) {
        if (count === 0) {
            countText.textContent = 'No size values added yet';
        } else if (count === 1) {
            countText.textContent = '1 size value added';
        } else {
            countText.textContent = `${count} size values added`;
        }
    }
}

// 更新尺碼範圍顯示
function updateSizeRangeDisplay() {
    const sizeValues = sizeList.map(item => item.sizeValue);

    const selectedSizeSpan = document.getElementById('selectedSize');
    if (selectedSizeSpan) {
        if (sizeValues.length === 0) {
            selectedSizeSpan.textContent = 'None';
        } else if (sizeValues.length === 1) {
            selectedSizeSpan.textContent = sizeValues[0];
        } else {
            // 嘗試按數字排序
            const numericValues = sizeValues.filter(val => !isNaN(val)).map(val => parseFloat(val)).sort((a, b) => a - b);
            const textValues = sizeValues.filter(val => isNaN(val));

            if (numericValues.length > 0) {
                const min = Math.min(...numericValues);
                const max = Math.max(...numericValues);
                selectedSizeSpan.textContent = `${min} - ${max}`;
            } else {
                // 如果都是文本，按字母順序排序
                const sortedTextValues = textValues.sort();
                const minSize = sortedTextValues[0];
                const maxSize = sortedTextValues[sortedTextValues.length - 1];

                // 特殊處理：如果包含 FREE SIZE 等，顯示更合理的範圍
                if (minSize === 'FREE SIZE' || minSize === 'ONE SIZE' || minSize === 'OS') {
                    selectedSizeSpan.textContent = minSize;
                } else {
                    selectedSizeSpan.textContent = `${minSize} - ${maxSize}`;
                }
            }
        }
    }
}

// 切換排序順序
function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortSizes');

    // 更新圖標
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortSizeValuesList();
}

// 排序尺碼值列表
function sortSizeValuesList() {
    const sizeValuesList = document.getElementById('sizeValuesList');
    const items = Array.from(sizeValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取尺碼值並排序
    const sizeValues = items.map(item => ({
        element: item,
        value: item.querySelector('.size-value-text').textContent.trim()
    }));

    // 按字母順序排序（簡單排序）
    sizeValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    sizeValues.forEach(({ element }) => {
        sizeValuesList.appendChild(element);
    });
}

// 添加服裝尺碼
function addClothingSizes() {
    const categorySelect = document.getElementById('category_id');
    const selectedCategory = categorySelect.value;

    if (!selectedCategory) {
        window.showAlert('Please select a category first', 'warning');
        categorySelect.focus();
        return;
    }

    // 服裝尺碼：XXS 到 8XL + FREE SIZE
    const clothingSizes = [
        'FREE SIZE',
        'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL',
        '3XL', '4XL', '5XL', '6XL', '7XL', '8XL'
    ];

    addMultipleSizes(clothingSizes);
}

// 添加鞋子尺碼
function addShoeSizes() {
    const categorySelect = document.getElementById('category_id');
    const selectedCategory = categorySelect.value;

    if (!selectedCategory) {
        window.showAlert('Please select a category first', 'warning');
        categorySelect.focus();
        return;
    }

    // 鞋子尺碼：4-14 整碼和半碼 + FREE SIZE
    const shoeSizes = [
        'FREE SIZE',
        '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5',
        '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5',
        '12', '12.5', '13', '13.5', '14'
    ];

    addMultipleSizes(shoeSizes);
}

// 添加多個尺碼
function addMultipleSizes(sizes) {
    let addedCount = 0;
    let skippedCount = 0;

    sizes.forEach(size => {
        if (!isSizeValueExists(sizeList, size)) {
            addSizeValueToList(size);
            addedCount++;
        } else {
            skippedCount++;
        }
    });

    // 顯示結果
    if (addedCount > 0 && skippedCount === 0) {
        window.showAlert(`Successfully added ${addedCount} size values`, 'success');
    } else if (addedCount > 0 && skippedCount > 0) {
        window.showAlert(`Added ${addedCount} size values, ${skippedCount} already existed`, 'info');
    } else if (skippedCount > 0) {
        window.showAlert('All size values already exist in the list', 'warning');
    }

    // 更新UI
    updateUI();

    // 如果有添加尺碼值，顯示右邊的表格
    if (addedCount > 0) {
        showSizeValuesArea();
    }
}

// 添加尺碼值到列表
function addSizeValueToList(sizeValue) {
    const categorySelect = document.getElementById('category_id');
    const categoryId = categorySelect.value;

    // 檢查是否為重複項
    if (isSizeValueExists(sizeList, sizeValue)) {
        return; // 跳過重複項，不添加到列表
    }

    // 添加到 sizeList 數組
    sizeList.push({
        sizeValue: sizeValue,
        categoryId: categoryId
    });

    // 重新渲染整個列表
    updateSizeList();
    updateUI();

    // 顯示尺碼值區域
    showSizeValuesArea();
}

// 表單提交處理
function handleFormSubmit(e) {
    e.preventDefault();

    // 檢查是否有尺碼值
    if (sizeList.length === 0) {
        window.showAlert('Please add at least one size value', 'warning');
        return;
    }

    // 預提交重複檢查
    const duplicates = [];
    const seen = new Set();
    for (const item of sizeList) {
        const combination = item.sizeValue.toLowerCase();
        if (seen.has(combination)) {
            duplicates.push(item.sizeValue);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        window.showAlert('Duplicate size values found. Please remove duplicates before submitting.', 'error');
        return;
    }

    // 準備提交數據
    const libraryData = {
        categoryId: document.getElementById('category_id').value,
        sizeValues: sizeList.map(item => item.sizeValue),
        status: 'Available' // 默認為 Available
    };

    // 使用通用創建函數
    createLibrary(libraryData,
        function(data) {
            window.showAlert(data.message || 'Size library created successfully', 'success');
            setTimeout(() => {
                window.location.href = window.sizeLibraryManagementRoute || '/admin/sizes/library';
            }, 2000);
        },
        function(error) {
            window.showAlert(error || 'Some size libraries failed to create', 'error');
        }
    );
}

// =============================================================================
// Update 頁面功能 (Update Page Functions)
// =============================================================================

/**
 * 初始化尺碼庫更新頁面
 */
function initializeLibraryUpdate() {
    // 綁定事件
    bindEvents();

    // 初始化狀態卡片
    if (typeof window.initializeLibraryStatusCardSelection === 'function') {
        window.initializeLibraryStatusCardSelection();
    }
}

function bindEvents() {
    // 表單提交事件
    const form = document.getElementById('updateSizeLibraryForm');
    if (form) {
        form.addEventListener('submit', handleUpdateFormSubmit);
    }
}



function handleUpdateFormSubmit(e) {
    e.preventDefault();

    // 獲取表單數據
    const formData = new FormData(e.target);

    // 添加 _method: 'PUT' 用於 Laravel 路由識別
    formData.append('_method', 'PUT');

    // 獲取當前尺碼庫ID
    const libraryId = window.location.pathname.split('/').pop();

    // 使用通用函數提交
    handleLibraryRequest(
        window.updateSizeLibraryUrl,
        'POST',
        formData,
        function(data) {
            window.showAlert('Library updated successfully', 'success');
            setTimeout(() => {
                window.location.href = window.sizeLibraryManagementRoute;
            }, 1500);
        },
        function(error) {
            window.showAlert(error || 'Failed to update library', 'error');
        }
    );

    return false; // 防止表單默認提交
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

    // 初始化狀態
    updateUI();
}

function bindViewEvents() {
    // 刪除按鈕事件 - 使用事件委託避免重複綁定
    document.addEventListener('click', function(e) {
        if (e.target.closest('button[data-library-id]')) {
            const button = e.target.closest('button[data-library-id]');
            const libraryId = button.getAttribute('data-library-id');
            deleteLibraryFromView(libraryId);
        }
    });
}

function updateUI() {
    // 更新統計信息
    updateViewStatistics();

    // 更新表格狀態
    updateTableStatus();
}

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

function updateTableStatus() {
    // 更新表格狀態顯示
    console.log('Table status updated');
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
            const deletedRow = document.querySelector(`[data-library-id="${libraryId}"]`).closest('tr');
            if (deletedRow) {
                deletedRow.remove();
            }

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

    // 如果沒有資料行了，跳轉回 index
    if (dataRows.length === 0) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('All size libraries have been deleted. Redirecting to library list...', 'info');
        } else {
            alert('All size libraries have been deleted. Redirecting to library list...');
        }

        // 延遲跳轉，讓用戶看到提示信息
        setTimeout(() => {
            window.location.href = window.sizeLibraryManagementRoute;
        }, 1500);
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
    const libraryForm = document.getElementById('sizeLibraryForm');
    const updateLibraryForm = document.getElementById('updateSizeLibraryForm');
    const viewTable = document.querySelector('table tbody');

    if (dashboardCardsContainer) {
        // Dashboard 頁面
        initializeLibraryDashboard();
    } else if (libraryForm) {
        // Create 頁面
        initializeLibraryCreate();
    } else if (updateLibraryForm) {
        // Update 頁面
        initializeLibraryUpdate();
    } else if (viewTable) {
        // View 頁面
        initializeLibraryView();
    }
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

// 導出主要函數到全局作用域
window.toggleLibraryStatus = toggleLibraryStatus;
window.setLibraryAvailable = setLibraryAvailable;
window.setLibraryUnavailable = setLibraryUnavailable;
window.updateLibraryStatus = updateLibraryStatus;
window.viewCategoryDetails = viewCategoryDetails;
window.addSizeValue = addSizeValue;
window.removeSizeValue = removeSizeValue;
window.clearForm = clearForm;
window.toggleSortOrder = toggleSortOrder;
window.addClothingSizes = addClothingSizes;
window.addShoeSizes = addShoeSizes;
window.deleteLibraryFromView = deleteLibraryFromView;
