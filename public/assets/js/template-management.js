/**
 * Template Management JavaScript
 * 尺碼模板管理統一交互邏輯
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

    const url = window.updateTemplateUrl.replace(':id', templateId);

    handleTemplateRequest(
        url,
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
 * 加載模板數據
 */
function loadTemplates() {
    const url = window.templateManagementRoute;

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
                window.showAlert(data.message || 'Failed to load templates', 'error');
            } else {
                alert(data.message || 'Failed to load templates');
            }
        }
    })
    .catch(error => {
        console.error('Error loading templates:', error);
        if (typeof window.showAlert === 'function') {
            window.showAlert('Failed to load templates', 'error');
        } else {
            alert('Failed to load templates');
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
        return;
    }

    emptyState.classList.add('d-none');

    // 按分類和性別分組
    const groupedByCategory = groupByCategory(groupedData);

    // 生成卡片HTML
    let cardsHTML = '';

    Object.keys(groupedByCategory).forEach(categoryKey => {
        const categoryData = groupedByCategory[categoryKey];
        const category = categoryData.category;
        const gender = categoryData.gender;
        const templates = categoryData.templates;

        // 確保category和gender數據存在
        if (category && category.category_name && gender) {
            cardsHTML += generateCategoryCard(category, gender, templates);
        } else {
            console.warn(`Category or gender data missing for key ${categoryKey}:`, category, gender);
        }
    });

    container.innerHTML = cardsHTML;
}

/**
 * 按分類和性別分組
 */
function groupByCategory(groupedData) {
    const grouped = {};

    groupedData.forEach(group => {
        const category = group.category;
        const gender = group.gender;
        const templates = group.templates || [];

        if (category && category.id && gender) {
            // 使用 categoryId_gender 作為 key
            const categoryKey = `${category.id}_${gender}`;

            if (!grouped[categoryKey]) {
                grouped[categoryKey] = {
                    category: category,
                    gender: gender,
                    templates: []
                };
            }

            // 添加 templates 數據
            if (Array.isArray(templates)) {
                templates.forEach(template => {
                    grouped[categoryKey].templates.push({
                        ...template,
                        id: template.id,
                        template_status: template.template_status || 'Available'
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

        return `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span class="fw-medium" style="cursor: pointer;" onclick="editTemplate(${template.id})" title="Click to edit template">${template.size_library?.size_value || 'N/A'}</span>
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
 * 更新統計信息
 */
function updateStatistics(data) {
    // 更新頁面頂部的統計信息
    const totalTemplatesEl = document.getElementById('total-templates');
    const activeTemplatesEl = document.getElementById('active-templates');
    const inactiveTemplatesEl = document.getElementById('inactive-templates');
    const templateGroupsEl = document.getElementById('template-groups');

    if (totalTemplatesEl) {
        totalTemplatesEl.textContent = data.pagination?.total || data.total_templates || data.total || 0;
    }

    // 計算可用和不可用的模板數量
    if (data.data && Array.isArray(data.data)) {
        let availableTemplates = 0;
        let unavailableTemplates = 0;

        data.data.forEach(group => {
            if (group.templates && Array.isArray(group.templates)) {
                group.templates.forEach(template => {
                    const status = template.template_status || 'Unavailable';
                    if (status === 'Available') {
                        availableTemplates++;
                    } else {
                        unavailableTemplates++;
                    }
                });
            }
        });

        if (activeTemplatesEl) {
            activeTemplatesEl.textContent = availableTemplates;
        }

        if (inactiveTemplatesEl) {
            inactiveTemplatesEl.textContent = unavailableTemplates;
        }
    }

    if (templateGroupsEl) {
        // 按分類和性別分組計算
        const groupedByCategory = groupByCategory(data.data || []);
        const groupCount = Object.keys(groupedByCategory).length;
        templateGroupsEl.textContent = groupCount;
    }
}

/**
 * 更新分頁信息
 */
function updatePaginationInfoByCategory(groupedData, pagination) {
    // 按分類和性別分組計算
    const groupedByCategory = groupByCategory(groupedData || []);
    const groupCount = Object.keys(groupedByCategory).length;

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

// =============================================================================
// View 頁面功能 (View Page Functions)
// =============================================================================

/**
 * 初始化模板查看頁面
 */
function initializeTemplateView() {
    // 綁定事件監聽器
    bindViewEvents();

    // 綁定 Update Modal 事件
    bindUpdateTemplateModalEvents();

    // 初始化狀態
    updateViewUI();
}

/**
 * 綁定查看頁面事件
 */
function bindViewEvents() {
    // 刪除按鈕事件 - 使用事件委託，只監聽 Delete 按鈕
    document.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('button[data-template-id][data-action="delete"]');
        if (deleteButton) {
            const templateId = deleteButton.getAttribute('data-template-id');
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
    .then(response => response.json())
    .then(data => {
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

    // 如果沒有資料行了，直接跳轉回 index
    if (dataRows.length === 0) {
        setTimeout(() => {
            window.location.href = window.templateManagementRoute;
        }, 1000);
    }
}

// =============================================================================
// 模板操作函數 (Template Operations)
// =============================================================================

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
 * 更新單個模板狀態顯示（不重新加載所有數據）
 */
function updateSingleTemplateStatusUI(templateId, newStatus) {
    // 找到包含該 template 的行（通過查找包含 templateId 的按鈕）
    const templateRows = document.querySelectorAll('.list-container > div');
    let targetRow = null;
    let categoryCard = null;

    templateRows.forEach(row => {
        const button = row.querySelector('button');
        if (button && button.getAttribute('onclick')) {
            const onclickAttr = button.getAttribute('onclick');
            // 檢查 onclick 是否包含該 templateId
            if (onclickAttr.includes(`(${templateId})`)) {
                targetRow = row;
                categoryCard = row.closest('.content-card');
            }
        }
    });

    if (!targetRow || !categoryCard) {
        // 如果找不到，則重新加載所有數據
        console.warn('Could not find template row, reloading all data');
        loadTemplates();
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
            toggleButton.setAttribute('onclick', `setTemplateUnavailable(${templateId})`);
        } else {
            toggleButton.className = 'btn btn-sm btn-outline-success';
            toggleButton.title = 'Activate';
            toggleButton.innerHTML = '<i class="bi bi-check-circle"></i>';
            toggleButton.setAttribute('onclick', `setTemplateAvailable(${templateId})`);
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
 * 更新模板狀態
 */
function updateTemplateStatus(id, status) {
    const url = status === 'Available' ?
        window.availableTemplateUrl.replace(':id', id) :
        window.unavailableTemplateUrl.replace(':id', id);

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
                window.showAlert(`Template status updated to ${status.toLowerCase()} successfully!`, 'success');
            } else {
                alert(`Template status updated to ${status.toLowerCase()} successfully!`);
            }
            // 只更新單個模板狀態，不重新加載所有數據
            updateSingleTemplateStatusUI(id, status);
        } else {
            if (typeof window.showAlert === 'function') {
                window.showAlert('Failed to update template status', 'error');
            } else {
                alert('Failed to update template status');
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
 * 查看分類詳情
 */
function viewCategoryDetails(categoryId, gender) {
    // 跳轉到view頁面
    const combinedId = `${categoryId}_${gender}`;
    const url = window.viewTemplateUrl.replace(':id', combinedId);
    window.location.href = url;
}

/**
 * 編輯模板（跳轉到 view 頁面）
 */
function editTemplate(templateId) {
    const url = window.viewTemplateUrl.replace(':id', templateId);
    window.location.href = url;
}

// =============================================================================
// Create Modal 功能 (Create Modal Functions)
// =============================================================================

/**
 * 初始化 Template Create Modal
 */
function initializeTemplateCreateModal() {
    // 綁定 modal 事件
    bindTemplateModalEvents();
    // 加載 Categories
    loadCategoriesForTemplateModal();
}

/**
 * 綁定 Template Modal 事件
 */
function bindTemplateModalEvents() {
    const modal = document.getElementById('createTemplateModal');
    if (!modal) return;

    // Modal 打開時重置
    modal.addEventListener('show.bs.modal', function() {
        resetTemplateModal();
        loadCategoriesForTemplateModal();
    });

    // Category 選擇變化
    const categorySelect = document.getElementById('create_category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategorySelectChangeForTemplateModal);
    }

    // Gender 選擇變化
    const genderSelect = document.getElementById('create_gender');
    if (genderSelect) {
        genderSelect.addEventListener('change', handleGenderSelectChangeForTemplateModal);
    }

    // Select All 按鈕
    const selectAllBtn = document.getElementById('selectAllSizeLibrariesBtn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAllSizeLibrariesForModal);
    }

    // Clear All 按鈕
    const clearAllBtn = document.getElementById('clearAllSizeLibrariesBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllSizeLibrariesForModal);
    }

    // 提交按鈕
    const submitBtn = document.getElementById('submitCreateTemplateModal');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitTemplateModal);
    }
}

/**
 * 加載 Categories 到 Template Modal
 */
function loadCategoriesForTemplateModal() {
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
 * 處理 Category 選擇變化（Modal）
 */
function handleCategorySelectChangeForTemplateModal() {
    const categoryId = document.getElementById('create_category_id').value;
    const gender = document.getElementById('create_gender').value;

    if (categoryId && gender) {
        loadAvailableSizeLibrariesForModal();
    } else {
        hideSizeLibraryCardsForModal();
    }
}

/**
 * 處理 Gender 選擇變化（Modal）
 */
function handleGenderSelectChangeForTemplateModal() {
    const categoryId = document.getElementById('create_category_id').value;
    const gender = document.getElementById('create_gender').value;

    if (categoryId && gender) {
        loadAvailableSizeLibrariesForModal();
    } else {
        hideSizeLibraryCardsForModal();
    }
}

/**
 * 加載可用的尺碼庫（Modal）
 */
function loadAvailableSizeLibrariesForModal() {
    const categoryId = document.getElementById('create_category_id').value;
    const gender = document.getElementById('create_gender').value;

    if (!categoryId || !gender) {
        hideSizeLibraryCardsForModal();
        return;
    }

    // 顯示加載狀態
    showSizeLibraryLoadingForModal();

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
            displaySizeLibraryCardsForModal(data.data);
        } else {
            if (typeof window.showAlert === 'function') {
                window.showAlert('Failed to load size libraries: ' + (data.message || 'Unknown error'), 'error');
            } else {
                alert('Failed to load size libraries: ' + (data.message || 'Unknown error'));
            }
            hideSizeLibraryCardsForModal();
        }
    })
    .catch(error => {
        console.error('Error loading size libraries:', error);
        if (typeof window.showAlert === 'function') {
            window.showAlert('Error loading size libraries: ' + error.message, 'error');
        } else {
            alert('Error loading size libraries: ' + error.message);
        }
        hideSizeLibraryCardsForModal();
    });
}

/**
 * 顯示尺碼庫加載狀態（Modal）
 */
function showSizeLibraryLoadingForModal() {
    const selectionArea = document.getElementById('sizeLibrarySelection');
    const container = document.getElementById('sizeLibraryCardsContainer');
    const initialMessage = document.getElementById('initial-size-library-message');

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

    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }
}

/**
 * 顯示尺碼庫卡片（Modal）
 */
function displaySizeLibraryCardsForModal(sizeLibraries) {
    const selectionArea = document.getElementById('sizeLibrarySelection');
    const container = document.getElementById('sizeLibraryCardsContainer');
    const initialMessage = document.getElementById('initial-size-library-message');
    if (!selectionArea || !container) return;

    // 顯示選擇區域
    selectionArea.classList.remove('d-none');

    // 隱藏初始消息
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
        updateSizeLibrarySelectionCounter();
        updateTemplateSubmitButton();
        return;
    }

    container.innerHTML = sizeLibraries.map(library => `
        <div class="col-md-3 col-sm-4 col-6 mb-3">
            <div class="card size-library-card h-100 border border-light position-relative"
                 data-size-library-id="${library.id}"
                 data-size-value="${library.size_value}"
                 data-status="${library.size_status}"
                 style="cursor: pointer; transition: all 0.3s ease;">
                <input type="checkbox" name="size_library_ids[]" value="${library.id}"
                       class="size-library-checkbox position-absolute opacity-0"
                       id="size_library_${library.id}"
                       style="pointer-events: none;">
                <div class="card-body d-flex flex-column justify-content-center align-items-center text-center p-4"
                     style="cursor: pointer; min-height: 80px; position: relative;">
                    <div class="size-value fw-bold text-dark mb-0 fs-5">${library.size_value.toUpperCase()}</div>
                </div>
            </div>
        </div>
    `).join('');

    // 綁定卡片點擊事件
    bindSizeLibraryCardEventsForModal();

    // 更新選擇計數器
    updateSizeLibrarySelectionCounter();
    updateTemplateSubmitButton();
}

/**
 * 綁定尺碼庫卡片事件（Modal）
 */
function bindSizeLibraryCardEventsForModal() {
    const cards = document.querySelectorAll('.size-library-card');
    cards.forEach(card => {
        const checkbox = card.querySelector('input[type="checkbox"]');

        // 直接點擊卡片切換選擇狀態（與 library 一致，無 check-icon）
        card.addEventListener('click', function(e) {
            // 防止點擊 checkbox 時觸發兩次
            if (e.target.tagName === 'INPUT') {
                return;
            }
            toggleSizeLibraryCardSelection(card, checkbox);
        });

        // 保持 checkbox 同步（當直接點擊 checkbox 時）
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
                updateSizeLibrarySelectionCounter();
                updateTemplateSubmitButton();
            });
        }

        // 添加悬停效果
        card.addEventListener('mouseenter', function() {
            const isSelected = checkbox && checkbox.checked;
            if (!isSelected) {
                this.classList.add('border-primary');
                this.classList.remove('border-light');
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }
        });

        card.addEventListener('mouseleave', function() {
            const isSelected = checkbox && checkbox.checked;
            if (!isSelected) {
                this.classList.remove('border-primary');
                this.classList.add('border-light');
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '';
            }
        });
    });
}

/**
 * 切換尺碼庫卡片選擇狀態（與 library 的 toggleSizeCardSelection 一致，無 check-icon）
 */
function toggleSizeLibraryCardSelection(card, checkbox) {
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

    updateSizeLibrarySelectionCounter();
    updateTemplateSubmitButton();
}

/**
 * 隱藏尺碼庫卡片（Modal）
 */
function hideSizeLibraryCardsForModal() {
    const selectionArea = document.getElementById('sizeLibrarySelection');
    const initialMessage = document.getElementById('initial-size-library-message');

    if (selectionArea) {
        selectionArea.classList.add('d-none');
    }

    if (initialMessage) {
        initialMessage.classList.remove('d-none');
    }

    // 重置計數器
    const counter = document.getElementById('sizeLibrarySelectionCounter');
    if (counter) {
        counter.textContent = '0 selected';
        counter.className = 'badge bg-primary';
    }

    updateTemplateSubmitButton();
}

/**
 * 更新尺碼庫選擇計數器（Modal）
 */
function updateSizeLibrarySelectionCounter() {
    const selectedCount = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]:checked').length;
    const counter = document.getElementById('sizeLibrarySelectionCounter');

    if (counter) {
        counter.textContent = `${selectedCount} selected`;

        if (selectedCount > 0) {
            counter.className = 'badge bg-success';
        } else {
            counter.className = 'badge bg-primary';
        }
    }
}

/**
 * 更新提交按鈕狀態（Modal）
 */
function updateTemplateSubmitButton() {
    const submitBtn = document.getElementById('submitCreateTemplateModal');
    if (submitBtn) {
        const selectedCount = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]:checked').length;
        submitBtn.disabled = selectedCount === 0;
    }
}

/**
 * 選擇所有尺碼庫（Modal）
 */
function selectAllSizeLibrariesForModal() {
    const checkboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]');
    if (checkboxes.length === 0) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('No size libraries available to select', 'warning');
        } else {
            alert('No size libraries available to select');
        }
        return;
    }

    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        const card = checkbox.closest('.size-library-card');
        if (card) {
            card.classList.add('border-success', 'bg-success-subtle');
            card.classList.remove('border-light');
            card.style.transform = 'scale(1.05)';
            card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        }
    });
    updateSizeLibrarySelectionCounter();
    updateTemplateSubmitButton();

    // 顯示選擇提示
    const selectedCount = checkboxes.length;
    if (typeof window.showAlert === 'function') {
        window.showAlert(`${selectedCount} size librar${selectedCount > 1 ? 'ies' : 'y'} selected`, 'success');
    } else {
        alert(`${selectedCount} size librar${selectedCount > 1 ? 'ies' : 'y'} selected`);
    }
}

/**
 * 清除所有尺碼庫選擇（Modal）
 */
function clearAllSizeLibrariesForModal() {
    const checkboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('No size libraries selected to clear', 'info');
        } else {
            alert('No size libraries selected to clear');
        }
        return;
    }

    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const card = checkbox.closest('.size-library-card');
        if (card) {
            card.classList.remove('border-success', 'bg-success-subtle');
            card.classList.add('border-light');
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '';
        }
    });
    updateSizeLibrarySelectionCounter();
    updateTemplateSubmitButton();

    // 顯示清除提示
    if (typeof window.showAlert === 'function') {
        window.showAlert('All selections cleared', 'info');
    } else {
        alert('All selections cleared');
    }
}

/**
 * 重置 Template Modal
 */
function resetTemplateModal() {
    // 重置表單
    const form = document.getElementById('createTemplateModalForm');
    if (form) {
        form.reset();
    }

    // 重置選擇
    const categorySelect = document.getElementById('create_category_id');
    const genderSelect = document.getElementById('create_gender');
    if (categorySelect) {
        categorySelect.value = '';
    }
    if (genderSelect) {
        genderSelect.value = '';
    }

    // 隱藏尺碼庫卡片
    hideSizeLibraryCardsForModal();

    // 清除所有選擇
    const checkboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const card = checkbox.closest('.size-library-card');
        if (card) {
            card.classList.remove('border-success', 'bg-success-subtle');
            card.classList.add('border-light');
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '';
        }
    });

    // 更新計數器
    const counter = document.getElementById('sizeLibrarySelectionCounter');
    if (counter) {
        counter.textContent = '0 selected';
        counter.className = 'badge bg-primary';
    }

    // 禁用提交按鈕
    const submitBtn = document.getElementById('submitCreateTemplateModal');
    if (submitBtn) {
        submitBtn.disabled = true;
    }
}

/**
 * 提交 Template Modal
 */
function submitTemplateModal() {
    const categoryId = document.getElementById('create_category_id').value;
    const gender = document.getElementById('create_gender').value;
    const selectedSizeLibraries = Array.from(document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]:checked'))
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

    if (!gender) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please select a gender first', 'warning');
        } else {
            alert('Please select a gender first');
        }
        return;
    }

    if (selectedSizeLibraries.length === 0) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please select at least one size library', 'warning');
        } else {
            alert('Please select at least one size library');
        }
        return;
    }

    // 準備數據
    const templates = selectedSizeLibraries.map(sizeLibraryId => ({
        categoryId: categoryId,
        gender: gender,
        sizeLibraryId: sizeLibraryId
    }));

    // 顯示加載狀態
    const submitBtn = document.getElementById('submitCreateTemplateModal');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Creating...';
    submitBtn.disabled = true;

    // 提交創建請求
    createTemplate({ templates },
        function(data) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(data.message || 'Templates created successfully', 'success');
            } else {
                alert(data.message || 'Templates created successfully');
            }

            // 關閉 modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createTemplateModal'));
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
                window.showAlert(error || 'Failed to create templates', 'error');
            } else {
                alert(error || 'Failed to create templates');
            }

            // 恢復按鈕狀態
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    );
}

// =============================================================================
// Update Modal 功能 (Update Modal Functions)
// =============================================================================

/**
 * 綁定 Update Template Modal 事件
 */
function bindUpdateTemplateModalEvents() {
    // 彈窗打開時初始化狀態卡片
    $('#updateTemplateModal').on('show.bs.modal', function() {
        if (typeof window.initializeStatusCardSelection === 'function') {
            window.initializeStatusCardSelection('template_status');
        }
    });

    // 彈窗關閉時清理表單
    $('#updateTemplateModal').on('hidden.bs.modal', function() {
        const form = document.getElementById('updateTemplateModalForm');
        if (form) {
            form.reset();
        }

        // 清空 select 選項
        $('#update_category_id').empty().append('<option value="">Select category</option>');
        $('#update_gender').val('');
        $('#update_size_library_id').empty().append('<option value="">Select size library</option>');

        // 手动清理 backdrop，确保 modal 完全关闭
        cleanupModalBackdrop();

        // 清空當前信息卡片
        $('#currentTemplateInfo').html('');

        // 重置狀態卡片（只清理 modal 內的）
        const modal = document.getElementById('updateTemplateModal');
        if (modal) {
            $(modal).find('input[name="template_status"]').prop('checked', false);
            $(modal).find('.status-card').removeClass('selected');
        }

        // 移除驗證類
        $('#updateTemplateModalForm').find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');

        // 清除隱藏的 template ID
        $('#updateTemplateModalForm').removeAttr('data-template-id');
    });
}

/**
 * 打開更新模板彈窗
 */
function openUpdateTemplateModal(templateId) {
    const url = window.editTemplateUrl.replace(':id', templateId);

    // 从按钮或表格行获取template数据（如果可用，用于快速填充）
    let updateButton = $(`button[onclick*="openUpdateTemplateModal(${templateId})"]`);
    if (updateButton.length === 0) {
        updateButton = $(`button[data-template-id="${templateId}"]`).first();
    }

    let templateData = null;

    if (updateButton.length > 0) {
        // 快速填充基本数据
        templateData = {
            id: templateId,
            category_id: updateButton.attr('data-category-id') || '',
            gender: updateButton.attr('data-gender') || '',
            size_library_id: updateButton.attr('data-size-library-id') || '',
            template_status: updateButton.attr('data-template-status') || 'Available',
            category_name: updateButton.attr('data-category-name') || '',
            size_value: updateButton.attr('data-size-value') || ''
        };
        populateTemplateModal(templateData);
    } else {
        // 如果找不到按钮，尝试从表格行获取
        const templateRow = $(`tr[data-template-id="${templateId}"]`);
        if (templateRow.length > 0) {
            templateData = {
                id: templateId,
                category_id: templateRow.attr('data-category-id') || '',
                gender: templateRow.attr('data-gender') || '',
                size_library_id: templateRow.attr('data-size-library-id') || '',
                template_status: templateRow.attr('data-template-status') || 'Available',
                category_name: templateRow.attr('data-category-name') || '',
                size_value: templateRow.attr('data-size-value') || ''
            };
            populateTemplateModal(templateData);
        }
    }

    // 从 API 获取完整template数据
    $.ajax({
        url: url,
        type: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        },
        success: (response) => {
            if (response.success && response.data) {
                populateTemplateModal(response.data);
            } else {
                if (typeof window.showAlert === 'function') {
                    window.showAlert(response.message || 'Failed to load template data', 'error');
                } else {
                    alert(response.message || 'Failed to load template data');
                }
            }
        },
        error: (xhr) => {
            let errorMessage = 'Failed to load template data';
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
 * 填充 Template Update Modal 的數據
 */
function populateTemplateModal(templateData) {
    // 設置隱藏的template ID（用於提交）
    const form = $('#updateTemplateModalForm');
    form.attr('data-template-id', templateData.id);

    // 更新當前Template信息卡片
    const currentInfo = `
        <div class="mb-1">
            <i class="bi bi-tag me-2 text-muted"></i>
            <span>Category: <strong>${templateData.category_name || 'N/A'}</strong></span>
        </div>
        <div class="mb-1">
            <i class="bi bi-person me-2 text-muted"></i>
            <span>Gender: <strong>${templateData.gender || 'N/A'}</strong></span>
        </div>
        <div class="mb-1">
            <i class="bi bi-rulers me-2 text-muted"></i>
            <span>Size Value: <strong>${templateData.size_value || 'N/A'}</strong></span>
        </div>
        <div class="mb-1">
            <i class="bi bi-shield-check me-2 text-muted"></i>
            <span>Status: <strong>${templateData.template_status || 'N/A'}</strong></span>
        </div>
    `;
    $('#currentTemplateInfo').html(currentInfo);

    // 填充 Category 選項
    const categorySelect = $('#update_category_id');
    categorySelect.empty();
    categorySelect.append('<option value="">Select category</option>');
    if (window.availableCategories && Array.isArray(window.availableCategories)) {
        window.availableCategories.forEach(category => {
            const selected = category.id == templateData.category_id ? 'selected' : '';
            categorySelect.append(`<option value="${category.id}" ${selected}>${category.category_name}</option>`);
        });
    }

    // 填充 Gender 選項
    const genderSelect = $('#update_gender');
    genderSelect.val(templateData.gender || '');

    // 填充 Size Library 選項（需要根據 category 和 gender 動態加載）
    const sizeLibrarySelect = $('#update_size_library_id');
    sizeLibrarySelect.empty();
    sizeLibrarySelect.append('<option value="">Loading...</option>');
    sizeLibrarySelect.prop('disabled', true);

    // 如果 category 和 gender 都有值，加載對應的 size libraries
    if (templateData.category_id && templateData.gender) {
        loadSizeLibrariesForUpdateModal(templateData.category_id, templateData.gender, templateData.size_library_id);
    } else {
        sizeLibrarySelect.empty().append('<option value="">Select category and gender first</option>');
        sizeLibrarySelect.prop('disabled', true);
    }

    // 設置狀態（交給 status-management 初始化後，直接設置單選值）
    const targetStatus = templateData.template_status === 'Unavailable' ? 'Unavailable' : 'Available';
    const radioSelector = targetStatus === 'Available' ? '#update_status_available' : '#update_status_unavailable';
    $(radioSelector).prop('checked', true);

    // 初始化状态卡片（在打开 modal 前）
    if (typeof window.initializeStatusCardSelection === 'function') {
        window.initializeStatusCardSelection('template_status');
    }

    // 綁定 Category 和 Gender 變化事件（動態加載 size libraries）
    categorySelect.off('change.updateModal').on('change.updateModal', function() {
        const categoryId = $(this).val();
        const gender = genderSelect.val();
        if (categoryId && gender) {
            loadSizeLibrariesForUpdateModal(categoryId, gender);
        } else {
            sizeLibrarySelect.empty().append('<option value="">Select category and gender first</option>');
            sizeLibrarySelect.prop('disabled', true);
        }
    });

    genderSelect.off('change.updateModal').on('change.updateModal', function() {
        const gender = $(this).val();
        const categoryId = categorySelect.val();
        if (categoryId && gender) {
            loadSizeLibrariesForUpdateModal(categoryId, gender);
        } else {
            sizeLibrarySelect.empty().append('<option value="">Select category and gender first</option>');
            sizeLibrarySelect.prop('disabled', true);
        }
    });

    // 打開彈窗
    const modal = new bootstrap.Modal(document.getElementById('updateTemplateModal'));
    modal.show();

    // 綁定提交事件（如果還沒綁定）
    if (!form.data('submit-bound')) {
        $('#submitUpdateTemplateModal').off('click').on('click', function() {
            submitUpdateTemplateModal();
        });
        form.data('submit-bound', true);
    }
}

/**
 * 為 Update Modal 加載 Size Libraries
 */
function loadSizeLibrariesForUpdateModal(categoryId, gender, selectedSizeLibraryId = null) {
    const sizeLibrarySelect = $('#update_size_library_id');
    sizeLibrarySelect.empty();
    sizeLibrarySelect.append('<option value="">Loading...</option>');
    sizeLibrarySelect.prop('disabled', true);

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
        sizeLibrarySelect.empty();
        if (data.success && data.data && data.data.length > 0) {
            sizeLibrarySelect.append('<option value="">Select size library</option>');
            data.data.forEach(library => {
                const selected = selectedSizeLibraryId && library.id == selectedSizeLibraryId ? 'selected' : '';
                sizeLibrarySelect.append(`<option value="${library.id}" ${selected}>${library.size_value}</option>`);
            });
            sizeLibrarySelect.prop('disabled', false);
        } else {
            sizeLibrarySelect.append('<option value="">No size libraries available</option>');
            sizeLibrarySelect.prop('disabled', true);
        }
    })
    .catch(error => {
        console.error('Error loading size libraries:', error);
        sizeLibrarySelect.empty().append('<option value="">Error loading size libraries</option>');
        sizeLibrarySelect.prop('disabled', true);
    });
}

/**
 * 提交更新模板彈窗
 */
function submitUpdateTemplateModal() {
    const form = $('#updateTemplateModalForm');
    const templateId = form.attr('data-template-id');

    if (!templateId) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Template ID not found', 'error');
        } else {
            alert('Template ID not found');
        }
        return;
    }

    // 驗證表單
    const categoryId = $('#update_category_id').val();
    const gender = $('#update_gender').val();
    const sizeLibraryId = $('#update_size_library_id').val();
    const status = $('input[name="template_status"]:checked').val();

    if (!categoryId || !gender || !sizeLibraryId || !status) {
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
    formData.append('gender', gender);
    formData.append('size_library_id', sizeLibraryId);
    formData.append('template_status', status);

    // 顯示加載狀態
    const submitBtn = $('#submitUpdateTemplateModal');
    const originalText = submitBtn.html();
    submitBtn.html('<i class="bi bi-hourglass-split me-2"></i>Updating...');
    submitBtn.prop('disabled', true);

    // 提交更新請求
    updateTemplate(templateId, formData,
        function(data) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(data.message || 'Template updated successfully', 'success');
            } else {
                alert(data.message || 'Template updated successfully');
            }

            // 關閉 modal
            const modalElement = document.getElementById('updateTemplateModal');
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
                window.showAlert(error || 'Failed to update template', 'error');
            } else {
                alert(error || 'Failed to update template');
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
    const createTemplateModal = document.getElementById('createTemplateModal');

    if (dashboardCardsContainer) {
        // Dashboard 頁面
        initializeTemplateDashboard();

        // 初始化 Create Template Modal（如果存在）
        if (createTemplateModal) {
            initializeTemplateCreateModal();
        }
    } else if (viewTable) {
        // View 頁面
        initializeTemplateView();

        // 初始化 Update Template Modal（如果存在）
        const updateTemplateModal = document.getElementById('updateTemplateModal');
        if (updateTemplateModal) {
            bindUpdateTemplateModalEvents();
        }
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
window.editTemplate = editTemplate;
window.setTemplateAvailable = setTemplateAvailable;
window.setTemplateUnavailable = setTemplateUnavailable;
window.viewCategoryDetails = viewCategoryDetails;
window.openUpdateTemplateModal = openUpdateTemplateModal;
window.submitUpdateTemplateModal = submitUpdateTemplateModal;
window.deleteTemplateFromView = deleteTemplateFromView;
