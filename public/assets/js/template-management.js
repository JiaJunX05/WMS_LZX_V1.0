/**
 * Template Management JavaScript
 * 尺碼模板管理統一交互邏輯
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

// 模板列表數組（用於 Create 頁面）
let templateList = [];

// 排序狀態：true = 升序，false = 降序
let isAscending = true; // 默認升序

// 全局變量防止重複請求
let isDeleting = false;
let isUpdating = false; // 防止重複提交更新表單
let updateFormBound = false; // 標記更新表單事件是否已綁定

// =============================================================================
// 通用功能模塊 (Common Functions Module)
// =============================================================================

/**
 * 驗證模板表單
 */
function validateTemplateForm() {
    const categoryId = document.getElementById('category_id').value;
    const gender = document.getElementById('gender').value;
    const sizeLibraryId = document.getElementById('size_library_id') ? document.getElementById('size_library_id').value : '';

    if (!categoryId) {
        window.showAlert('Please select a category', 'warning');
        return false;
    }

    if (!gender) {
        window.showAlert('Please select a gender', 'warning');
        return false;
    }

    if (sizeLibraryId && !sizeLibraryId) {
        window.showAlert('Please select a size library', 'warning');
        return false;
    }

    return true;
}

/**
 * 處理模板請求
 */
function handleTemplateRequest(url, method, data, onSuccess, onError) {
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
        return response.json().then(data => {
            if (!response.ok) {
                // 只显示主要错误信息，不显示详细列表
                let errorMessage = data.message || 'Server error';
                // 如果有多个错误，添加一个简短提示
                if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                    errorMessage = data.message || 'Some templates failed to create';
                }
                throw new Error(errorMessage);
            }
            return data;
        });
    })
    .then(data => {
        if (data.success) {
            if (onSuccess) onSuccess(data);
        } else {
            // 只显示主要错误信息，不显示详细列表
            let errorMessage = data.message || 'Operation failed';
            // 如果有多个错误，使用简短提示
            if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                errorMessage = data.message || 'Some templates failed to create';
            }
            if (onError) onError(errorMessage);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (onError) onError(error.message);
    });
}

/**
 * 創建模板
 */
function createTemplate(templateData, onSuccess, onError) {
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加模板數據
    if (templateData.templates && Array.isArray(templateData.templates)) {
        templateData.templates.forEach((template, index) => {
            formData.append(`templates[${index}][category_id]`, template.categoryId);
            formData.append(`templates[${index}][gender]`, template.gender);
            formData.append(`templates[${index}][size_library_id]`, template.sizeLibraryId);
            formData.append(`templates[${index}][template_status]`, template.templateStatus || 'Available');
        });
    } else {
        formData.append('category_id', templateData.categoryId);
        formData.append('gender', templateData.gender);
        formData.append('size_library_id', templateData.sizeLibraryId);
        formData.append('template_status', templateData.templateStatus || 'Available');
    }

    handleTemplateRequest(
        window.createTemplateUrl,
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 更新模板
 */
function updateTemplate(templateId, formData, onSuccess, onError) {
    formData.append('_method', 'PUT');

    handleTemplateRequest(
        window.updateTemplateUrl, // 直接使用，不需要替換 ID
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 刪除模板
 */
function deleteTemplate(templateId, onSuccess, onError) {
    handleTemplateRequest(
        window.deleteTemplateUrl.replace(':id', templateId),
        'DELETE',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置模板為可用
 */
function setTemplateAvailable(templateId, onSuccess, onError) {
    handleTemplateRequest(
        window.availableTemplateUrl.replace(':id', templateId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置模板為不可用
 */
function setTemplateUnavailable(templateId, onSuccess, onError) {
    handleTemplateRequest(
        window.unavailableTemplateUrl.replace(':id', templateId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 獲取模板狀態類別
 */
function getTemplateStatusClass(status) {
    return status === 'Available' ? 'text-success' : 'text-danger';
}

/**
 * 更新配置摘要
 */
function updateConfigSummary() {
    // 配置摘要已移除，此函数保留为空以避免错误
}

/**
 * 處理分類選擇變化
 */
function handleCategoryChange() {
    updateUI();
    loadAvailableSizeLibraries();
}

/**
 * 處理性別選擇變化
 */
function handleGenderChange() {
    updateUI();
    loadAvailableSizeLibraries();
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
 * 更新性別信息
 */
function updateGenderInfo() {
    const genderSelect = document.getElementById('gender');
    if (genderSelect) {
        const selectedOption = genderSelect.options[genderSelect.selectedIndex];
        const genderName = selectedOption.text;
        const genderDisplay = document.querySelector('#selectedGender');

        if (genderDisplay) {
            genderDisplay.textContent = genderName;
        }
    }
}

/**
 * 更新尺碼庫選項
 */
function updateSizeLibraryOptions() {
    const categoryId = document.getElementById('category_id').value;
    const gender = document.getElementById('gender').value;
    const sizeLibrarySelect = document.getElementById('size_library_id');

    if (!sizeLibrarySelect) return;

    // 如果類別或性別沒有選擇，清空尺碼庫選項
    if (!categoryId || !gender) {
        sizeLibrarySelect.innerHTML = '<option value="">Please select both category and gender first</option>';
        sizeLibrarySelect.disabled = true;
        return;
    }

    // 顯示加載狀態
    sizeLibrarySelect.innerHTML = '<option value="">Loading...</option>';
    sizeLibrarySelect.disabled = true;

    // 構建請求URL
    const url = window.availableSizeLibrariesUrl || window.getAvailableSizeLibrariesUrl;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
            category_id: categoryId,
            gender: gender
        })
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
 * 加載可用的尺碼庫
 */
function loadAvailableSizeLibraries() {
    const categoryId = document.getElementById('category_id').value;
    const gender = document.getElementById('gender').value;

    if (!categoryId || !gender) {
        hideSizeLibraryCards();
        return;
    }

    // 顯示加載狀態
    showSizeLibraryLoading();

    // 發送 AJAX 請求獲取可用的尺碼庫
    const url = window.getAvailableSizeLibrariesUrl || window.availableSizeLibrariesUrl;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
            category_id: categoryId,
            gender: gender
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displaySizeLibraryCards(data.data);
        } else {
            window.showAlert('Failed to load size libraries: ' + (data.message || 'Unknown error'), 'error');
            hideSizeLibraryCards();
        }
    })
    .catch(error => {
        console.error('Error loading size libraries:', error);
        window.showAlert('Error loading size libraries: ' + error.message, 'error');
        hideSizeLibraryCards();
    });
}

/**
 * 顯示尺碼庫加載狀態
 */
function showSizeLibraryLoading() {
    const selectionArea = document.getElementById('sizeLibrarySelection');
    const container = document.getElementById('sizeLibraryCardsContainer');

    if (selectionArea) {
        selectionArea.classList.remove('d-none');
    }

    if (container) {
        container.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading available size libraries...</p>
            </div>
        `;
    }

    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }
}

/**
 * 顯示尺碼庫卡片
 */
function displaySizeLibraryCards(sizeLibraries) {
    const selectionArea = document.getElementById('sizeLibrarySelection');
    const container = document.getElementById('sizeLibraryCardsContainer');
    if (!selectionArea || !container) return;

    // 顯示選擇區域
    selectionArea.classList.remove('d-none');

    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }

    if (sizeLibraries.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-exclamation-circle fs-1 text-muted mb-3"></i>
                <h6 class="text-muted">No Available Size Libraries</h6>
                <p class="text-muted small">No size libraries found for the selected category and gender combination.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = sizeLibraries.map(library => `
        <div class="col-6 col-md-4 col-lg-3 mb-3">
            <div class="card size-card h-100 border-2 border-light shadow-sm"
                 data-size-value="${library.size_value}"
                 data-library-id="${library.id}"
                 data-status="${library.size_status}"
                 style="cursor: pointer; transition: all 0.3s ease;">
                <input type="checkbox" name="size_library_ids[]" value="${library.id}"
                       class="size-checkbox position-absolute opacity-0"
                       id="size_${library.id}"
                       style="pointer-events: none;">
                <label for="size_${library.id}" class="card-body d-flex flex-column justify-content-center align-items-center text-center p-3"
                       style="cursor: pointer; min-height: 80px;">
                    <div class="size-value fw-bold text-dark mb-2">${library.size_value}</div>
                    <div class="size-status badge ${library.size_status === 'Available' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} px-2 py-1 rounded-pill small">
                        ${library.size_status}
                    </div>
                </label>
            </div>
        </div>
    `).join('');

    // 綁定卡片點擊事件
    bindSizeLibraryCardEvents();

    // 顯示提交按鈕
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.classList.remove('d-none');
    }
}

/**
 * 隱藏尺碼庫卡片
 */
function hideSizeLibraryCards() {
    const selectionArea = document.getElementById('sizeLibrarySelection');
    if (selectionArea) {
        selectionArea.classList.add('d-none');
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
 * 綁定尺碼庫卡片事件
 */
function bindSizeLibraryCardEvents() {
    const cards = document.querySelectorAll('.size-card');
    cards.forEach(card => {
        // 為複選框添加事件監聽
        const checkbox = card.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    card.classList.add('border-success', 'bg-success-subtle');
                    card.classList.remove('border-light');
                } else {
                    card.classList.remove('border-success', 'bg-success-subtle');
                    card.classList.add('border-light');
                }
                updateSelectionCounter();
            });
        }

        // 添加悬停效果
        card.addEventListener('mouseenter', function() {
            if (!checkbox.checked) {
                this.classList.add('border-primary');
                this.classList.remove('border-light');
            }
        });

        card.addEventListener('mouseleave', function() {
            if (!checkbox.checked) {
                this.classList.remove('border-primary');
                this.classList.add('border-light');
            }
        });
    });
}

/**
 * 更新選擇計數器
 */
function updateSelectionCounter() {
    const selectedCount = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]:checked').length;
    const counter = document.getElementById('selectionCounter');
    if (counter) {
        counter.textContent = `${selectedCount} selected`;

        // 檢查是否超過限制
        const MAX_TEMPLATES = 20;
        if (selectedCount > MAX_TEMPLATES) {
            counter.className = 'badge bg-danger';
            counter.textContent = `${selectedCount} selected (Max: ${MAX_TEMPLATES})`;
        } else if (selectedCount > 0) {
            counter.className = 'badge bg-success';
        } else {
            counter.className = 'badge bg-primary';
        }
    }

    // 配置摘要已移除
}

/**
 * 設置狀態卡片選擇
 */
function setupStatusCardSelection() {
    // 調用統一的狀態卡片初始化函數
    if (typeof window.initializeTemplateStatusCardSelection === 'function') {
        window.initializeTemplateStatusCardSelection();
    }
}

/**
 * 綁定模板事件
 */
function bindTemplateEvents() {
    // 狀態卡片選擇
    setupStatusCardSelection();

    // 分類選擇變化
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
    }

    // 性別選擇變化
    const genderSelect = document.getElementById('gender');
    if (genderSelect) {
        genderSelect.addEventListener('change', handleGenderChange);
    }
}

/**
 * 初始化模板頁面
 */
function initializeTemplatePage(config) {
    // 綁定事件監聽器
    bindTemplateEvents();

    // 執行初始化回調函數（如果有）
    if (config && config.initializationCallback && typeof config.initializationCallback === 'function') {
        config.initializationCallback();
    }
}

// =============================================================================
// Dashboard 頁面功能 (Dashboard Page Functions)
// =============================================================================

/**
 * 初始化模板儀表板
 */
function initializeTemplateDashboard() {
    // 檢查URL參數中的成功消息
    checkUrlParams();

    // 加載模板數據
    loadTemplates();

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
 * 加載模板數據
 */
function loadTemplates() {
    const url = window.templateManagementRoute;

    fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
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
            updateStatistics(data.data);
            updatePaginationInfoByCategory(data.data, data.pagination);
        } else {
            console.error('API returned success: false', data);
            showError('Failed to load templates: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error loading templates:', error);
        showError('Error loading templates: ' + error.message);
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
        return;
    }

    emptyState.classList.add('d-none');

    // 生成卡片HTML
    let cardsHTML = '';

    groupedData.forEach(group => {
        const category = group.category;
        const gender = group.gender;
        const templates = group.templates;

        // 確保category和gender數據存在
        if (category && category.category_name && gender) {
            cardsHTML += generateCategoryCard(category, gender, templates);
        } else {
            console.warn(`Category or gender data missing:`, category, gender);
        }
    });

    container.innerHTML = cardsHTML;

    // 綁定卡片內的事件
    bindCardEvents();
}

/**
 * 生成分類卡片
 */
function generateCategoryCard(category, gender, templates) {
    const availableCount = templates.filter(template => {
        const status = template.template_status || 'Unavailable';
        return status === 'Available';
    }).length;
    const unavailableCount = templates.filter(template => {
        const status = template.template_status || 'Unavailable';
        return status === 'Unavailable';
    }).length;
    const totalCount = templates.length;

    // 確保category和gender數據存在
    const categoryName = category ? category.category_name : 'Unknown Category';
    const categoryId = category ? category.id : 'unknown';
    // gender 现在是字符串值，不是对象
    const genderName = typeof gender === 'string' ? gender : (gender && gender.gender_name ? gender.gender_name : 'Unknown Gender');
    const displayTitle = `${categoryName} (${genderName})`;

    // 生成模板值列表
    const templateValuesHTML = templates.map((template, index) => {
        const status = template.template_status || 'Unavailable';
        const statusClass = getTemplateStatusClass(status);
        const statusIcon = status === 'Available' ? 'bi-check-circle' : 'bi-x-circle';

        return `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span class="fw-medium">${template.size_library?.size_value || 'N/A'}</span>
                <div class="d-flex align-items-center gap-4">
                    <span class="badge ${status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${status}
                    </span>
                    <button class="btn btn-sm ${status === 'Available' ? 'btn-outline-warning' : 'btn-outline-success'}"
                            title="${status === 'Available' ? 'Deactivate' : 'Activate'}"
                            onclick="${status === 'Available' ? 'setTemplateUnavailable' : 'setTemplateAvailable'}(${template.id})">
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
                                <h5 class="card-title mb-0">${displayTitle}</h5>
                                <small class="text-muted">${totalCount} template values</small>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewCategoryDetails(${categoryId}, '${gender}')">
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
                        ${templateValuesHTML}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 綁定卡片事件
 */
function bindCardEvents() {
    // 卡片內的事件綁定 - 目前通過內聯事件處理
}

/**
 * 切換模板狀態
 */
function toggleTemplateStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateTemplateStatus(id, newStatus);
}

/**
 * 設置模板為可用
 */
function setTemplateAvailable(id) {
    updateTemplateStatus(id, 'Available');
}

/**
 * 設置模板為不可用
 */
function setTemplateUnavailable(id) {
    updateTemplateStatus(id, 'Unavailable');
}

/**
 * 更新模板狀態
 */
function updateTemplateStatus(id, status) {
    console.log('Updating template status:', { id, status });

    const url = status === 'Available' ?
        window.availableTemplateUrl.replace(':id', id) :
        window.unavailableTemplateUrl.replace(':id', id);

    console.log('Template status update URL:', url);

    // 顯示加載提示
    if (typeof window.showAlert === 'function') {
        window.showAlert('Updating template status...', 'info');
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
                window.showAlert(`Template status updated to ${status.toLowerCase()} successfully!`, 'success');
            } else {
                alert(`Template status updated to ${status.toLowerCase()} successfully!`);
            }
            loadTemplates(); // 重新加載數據
        } else {
            if (typeof window.showAlert === 'function') {
                window.showAlert(`Failed to update template status to ${status.toLowerCase()}`, 'error');
            } else {
                alert(`Failed to update template status to ${status.toLowerCase()}`);
            }
        }
    })
        .catch(error => {
            console.error(`Error setting template to ${status.toLowerCase()}:`, error);
            if (typeof window.showAlert === 'function') {
                window.showAlert('Failed to update template status', 'error');
            } else {
                alert('Failed to update template status');
            }
        });
}

/**
 * 綁定搜索事件
 */
function bindSearchEvents() {
    // 搜索功能綁定 - 預留功能
}

/**
 * 綁定篩選事件
 */
function bindFilterEvents() {
    // 篩選功能綁定 - 預留功能
}

/**
 * 更新統計信息
 */
function updateStatistics(groupedData) {
    // 計算分組數量（category + gender 組合）
    const groupCount = groupedData.length;

    // 計算所有模板的統計信息
    let totalTemplates = 0;
    let availableTemplates = 0;
    let unavailableTemplates = 0;

    groupedData.forEach(group => {
        group.templates.forEach(template => {
            totalTemplates++;
            const status = template.template_status || 'Unavailable';
            if (status === 'Available') {
                availableTemplates++;
            } else {
                unavailableTemplates++;
            }
        });
    });

    // 更新統計數據 - 顯示模板總數而不是分組數量
    // 添加 DOM 元素存在性檢查
    const totalTemplatesEl = document.getElementById('total-templates');
    const activeTemplatesEl = document.getElementById('active-templates');
    const inactiveTemplatesEl = document.getElementById('inactive-templates');
    const templateGroupsEl = document.getElementById('template-groups');

    if (totalTemplatesEl) totalTemplatesEl.textContent = totalTemplates;
    if (activeTemplatesEl) activeTemplatesEl.textContent = availableTemplates;
    if (inactiveTemplatesEl) inactiveTemplatesEl.textContent = unavailableTemplates;
    if (templateGroupsEl) templateGroupsEl.textContent = groupCount;
}

/**
 * 更新分頁信息
 */
function updatePaginationInfoByCategory(groupedData, pagination) {
    // 計算分組數量（category + gender 組合）
    const groupCount = groupedData.length;

    // 更新分頁信息顯示 - 添加 DOM 元素存在性檢查
    const showingStartEl = document.getElementById('showing-start');
    const showingEndEl = document.getElementById('showing-end');
    const totalCountEl = document.getElementById('total-count');

    if (showingStartEl) showingStartEl.textContent = 1;
    if (showingEndEl) showingEndEl.textContent = groupCount;
    if (totalCountEl) totalCountEl.textContent = groupCount;

    // 更新分頁按鈕狀態
    updatePaginationButtons(groupCount);
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

    // 如果只有一個類別或沒有類別，禁用分頁按鈕
    if (categoryCount <= 1) {
        if (prevBtn) prevBtn.classList.add('disabled');
        if (nextBtn) nextBtn.classList.add('disabled');
    } else {
        // 這裡可以根據需要實現真正的分頁邏輯
        // 目前顯示所有類別，所以按鈕保持禁用狀態
        if (prevBtn) prevBtn.classList.add('disabled');
        if (nextBtn) nextBtn.classList.add('disabled');
    }

    // 確保當前頁面始終顯示為活動狀態
    if (currentPageElement) {
        currentPageElement.classList.add('active');
        currentPageElement.classList.remove('disabled');
    }
}

/**
 * 查看分類詳情
 */
function viewCategoryDetails(categoryId, gender) {
    // 跳轉到view頁面，傳遞category+gender組合ID (gender 现在是字符串值)
    const combinedId = `${categoryId}_${gender}`;
    const url = window.viewTemplateUrl.replace(':id', combinedId);
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
 * 初始化模板創建頁面
 */
function initializeTemplateCreate() {
    // 使用通用初始化函數
    initializeTemplatePage({
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
    // 綁定選擇按鈕事件
    bindSelectionButtons();

    // 表單提交處理
    const form = document.getElementById('templateForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

/**
 * 綁定選擇按鈕事件
 */
function bindSelectionButtons() {
    // 全選按鈕
    const selectAllBtn = document.getElementById('selectAllBtn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAllLibraries);
    }

    // 清除按鈕 - 使用 clearForm 函数
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearForm);
    }
}

/**
 * 更新配置摘要
 */
function updateConfigSummary() {
    // 配置摘要已移除，此函数保留为空以避免错误
}

/**
 * 清除表單
 */
function clearForm() {
    // 檢查是否有數據需要清除
    const categoryId = document.getElementById('category_id').value;
    const gender = document.getElementById('gender').value;
    const selectedCheckboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]:checked');

    // 如果沒有任何選擇，顯示提示
    if (!categoryId && !gender && selectedCheckboxes.length === 0) {
        window.showAlert('No data to clear', 'info');
        return;
    }

    // 添加確認對話框
    if (!confirm('Are you sure you want to clear all selections? This action cannot be undone.')) {
        return;
    }

    // 清空選擇
    document.getElementById('category_id').value = '';
    document.getElementById('gender').value = '';

    // 清空所有複選框
    const checkboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const card = checkbox.closest('.size-card');
        card.classList.remove('border-success', 'bg-success-subtle');
        card.classList.add('border-light');
    });

    // 更新UI
    updateUI();
    hideSizeLibraryCards();

    window.showAlert('Form cleared successfully', 'success');
}

/**
 * 選擇所有尺碼庫
 */
function selectAllLibraries() {
    const checkboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]');
    if (!checkboxes.length) {
        window.showAlert('No size libraries to select. Please choose category and gender first.', 'info');
        return;
    }

    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        const card = checkbox.closest('.size-card');
        card.classList.add('border-success', 'bg-success-subtle');
        card.classList.remove('border-light');
    });

    updateSelectionCounter();
    window.showAlert('All size libraries selected', 'success');
}

/**
 * 更新UI狀態
 */
function updateUI() {
    const categoryId = document.getElementById('category_id').value;
    const gender = document.getElementById('gender').value;

    // 顯示/隱藏區域
    const initialMessage = document.getElementById('initial-message');
    const sizeLibrarySelection = document.getElementById('sizeLibrarySelection');
    const submitSection = document.getElementById('submitSection');

    // 檢查是否有選擇區域顯示
    const isSelectionVisible = sizeLibrarySelection && !sizeLibrarySelection.classList.contains('d-none');

    if (isSelectionVisible) {
        // 如果選擇區域已顯示，隱藏初始消息
        initialMessage.classList.add('d-none');
        // 顯示提交按鈕
        if (submitSection) {
            submitSection.classList.remove('d-none');
        }
    } else {
        // 如果選擇區域未顯示，顯示初始消息
        initialMessage.classList.remove('d-none');
        // 隱藏提交按鈕
        if (submitSection) {
            submitSection.classList.add('d-none');
        }
    }
}

/**
 * 表單提交處理
 */
function handleFormSubmit(e) {
    e.preventDefault();

    // 獲取選中的尺碼庫
    const selectedCheckboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]:checked');

    if (selectedCheckboxes.length === 0) {
        window.showAlert('Please select at least one size library', 'warning');
        return;
    }

    // 檢查是否超過限制
    const MAX_TEMPLATES = 20;
    if (selectedCheckboxes.length > MAX_TEMPLATES) {
        window.showAlert(`Cannot create more than ${MAX_TEMPLATES} templates at once. Please select fewer templates.`, 'warning');
        return;
    }

    // 獲取當前選擇的 category 和 gender
    const categoryId = document.getElementById('category_id').value;
    const gender = document.getElementById('gender').value;
    const templateStatus = 'Available'; // 默認為 Available

    // 準備提交數據
    const templates = Array.from(selectedCheckboxes).map((checkbox, index) => ({
        categoryId: categoryId,
        gender: gender,
        sizeLibraryId: checkbox.value,
        templateStatus: templateStatus
    }));

    // 使用通用創建函數
    createTemplate({ templates },
        function(data) {
            window.showAlert(data.message || 'Templates created successfully', 'success');
            setTimeout(() => {
                window.location.href = window.templateManagementRoute;
            }, 1500);
        },
        function(error) {
            window.showAlert(error || 'Error creating templates', 'error');
        }
    );
}

// =============================================================================
// Update 頁面功能 (Update Page Functions)
// =============================================================================

/**
 * 初始化模板更新頁面
 */
function initializeTemplateUpdate() {
    // 使用通用初始化函數
    initializeTemplatePage({
        initializationCallback: function() {
            bindUpdateEvents();
        }
    });
}

/**
 * 綁定更新頁面事件
 */
function bindUpdateEvents() {
    // 表單提交 - 確保只綁定一次
    if (!updateFormBound) {
        const form = document.getElementById('updateTemplateForm');
        if (form) {
            form.addEventListener('submit', handleUpdateFormSubmit);
            updateFormBound = true; // 標記已綁定
        }
    }

    // 類別變化時更新尺碼庫選項（如果有的話）
    const categorySelect = document.getElementById('category_id');
    if (categorySelect && !categorySelect.hasAttribute('data-change-bound')) {
        categorySelect.addEventListener('change', updateSizeLibraryOptions);
        categorySelect.setAttribute('data-change-bound', 'true');
    }

    // 性別變化時更新尺碼庫選項（如果有的話）
    const genderSelect = document.getElementById('gender');
    if (genderSelect && !genderSelect.hasAttribute('data-change-bound')) {
        genderSelect.addEventListener('change', updateSizeLibraryOptions);
        genderSelect.setAttribute('data-change-bound', 'true');
    }
}

/**
 * 獲取當前ID
 */


/**
 * 更新頁面表單提交處理
 */
function handleUpdateFormSubmit(e) {
    e.preventDefault();

    // 防止重複提交
    if (isUpdating) {
        return false;
    }

    // 設置提交標誌
    isUpdating = true;

    // 獲取表單數據
    const formData = new FormData(e.target);

    // 獲取當前模板ID
    const templateId = window.location.pathname.split('/').pop();

    // 使用通用函數提交
    handleTemplateRequest(
        window.updateTemplateUrl,
        'POST',
        formData,
        function(data) {
            // 使用後端返回的消息，如果沒有則使用默認消息
            const message = data.message || 'Template updated successfully';
            window.showAlert(message, 'success');
            setTimeout(() => {
                window.location.href = window.templateManagementRoute;
            }, 1500);
        },
        function(error) {
            isUpdating = false; // 錯誤時重置標誌
            window.showAlert(error || 'Failed to update template', 'error');
        }
    );

    return false; // 防止表單默認提交
}

// =============================================================================
// View 頁面功能 (View Page Functions)
// =============================================================================

/**
 * 初始化模板查看頁面
 */
function initializeTemplateView() {
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
        if (e.target.closest('button[data-template-id]')) {
            const button = e.target.closest('button[data-template-id]');
            const templateId = button.getAttribute('data-template-id');
            deleteTemplateFromView(templateId);
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
    const tableRows = document.querySelectorAll('.data-table tbody tr');
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
 * 從查看頁面刪除模板
 */
function deleteTemplateFromView(templateId) {
    // 防止重複點擊
    if (isDeleting) {
        return;
    }

    isDeleting = true;

    if (!confirm('Are you sure you want to delete this template?')) {
        isDeleting = false;
        return;
    }

    // 直接發送 DELETE 請求
    const url = window.deleteTemplateUrl.replace(':id', templateId);
    fetch(url, {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        console.log('Delete response:', response);
        return response.json();
    })
    .then(data => {
        console.log('Delete data:', data);
        if (data.success) {
            if (typeof window.showAlert === 'function') {
                window.showAlert('Template deleted successfully', 'success');
            } else {
                alert('Template deleted successfully');
            }

            // 刪除成功後，從頁面中移除該行
            const deletedRow = document.querySelector(`[data-template-id="${templateId}"]`).closest('tr');
            if (deletedRow) {
                deletedRow.remove();
            }

            // 更新統計信息
            updateViewStatistics();

            // 檢查是否還有資料，如果沒有就跳轉回 index
            checkAndRedirectIfEmpty();
        } else {
            console.error('Delete failed:', data);
            if (typeof window.showAlert === 'function') {
                window.showAlert('Failed to delete template', 'error');
            } else {
                alert('Failed to delete template');
            }
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
        if (typeof window.showAlert === 'function') {
            window.showAlert('Failed to delete template', 'error');
        } else {
            alert('Failed to delete template');
        }
    })
    .finally(() => {
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
            window.showAlert('All templates have been deleted. Redirecting to template list...', 'info');
        } else {
            alert('All templates have been deleted. Redirecting to template list...');
        }

        // 延遲跳轉，讓用戶看到提示信息
        setTimeout(() => {
            window.location.href = window.templateManagementRoute;
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
    const templateForm = document.getElementById('templateForm');
    const updateTemplateForm = document.getElementById('updateTemplateForm');
    const viewTable = document.querySelector('table tbody');

    if (dashboardCardsContainer) {
        // Dashboard 頁面
        initializeTemplateDashboard();
    } else if (templateForm) {
        // Create 頁面
        initializeTemplateCreate();
    } else if (updateTemplateForm) {
        // Update 頁面
        initializeTemplateUpdate();
    } else if (viewTable) {
        // View 頁面
        initializeTemplateView();
    }
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

// 導出主要函數到全局作用域
window.toggleTemplateStatus = toggleTemplateStatus;
window.setTemplateAvailable = setTemplateAvailable;
window.setTemplateUnavailable = setTemplateUnavailable;
window.updateTemplateStatus = updateTemplateStatus;
window.viewCategoryDetails = viewCategoryDetails;
window.clearForm = clearForm;
window.selectAllLibraries = selectAllLibraries;
window.deleteTemplateFromView = deleteTemplateFromView;
