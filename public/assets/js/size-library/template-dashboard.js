/**
 * Template Dashboard JavaScript
 * 尺碼模板儀表板交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeTemplateDashboard();
});

function initializeTemplateDashboard() {
    // 檢查URL參數中的成功消息
    checkUrlParams();

    // 加載尺碼模板數據
    loadTemplates();

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
        showAlert(decodeURIComponent(success), 'success');
        // 清除URL參數
        const url = new URL(window.location);
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url);
    }

    if (error) {
        showAlert(decodeURIComponent(error), 'danger');
        // 清除URL參數
        const url = new URL(window.location);
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url);
    }
}

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
        const gender = group.gender;
        const templates = group.templates;

        // 確保category和gender數據存在
        if (category && category.category_name && gender && gender.gender_name) {
            cardsHTML += generateCategoryCard(category, gender, templates);
        } else {
            console.warn(`Category or gender data missing:`, category, gender);
        }
    });

    container.innerHTML = cardsHTML;

    // 綁定卡片內的事件
    bindCardEvents();
}

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
    const genderName = gender ? gender.gender_name : 'Unknown Gender';
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
                    <button class="btn ${status === 'Available' ? 'btn-success' : 'btn-danger'} btn-sm"
                            onclick="toggleTemplateStatus(${template.id}, '${status}')"
                            style="padding: 0.25rem 0.75rem; font-weight: 600;">
                        ${status.toUpperCase()}
                    </button>
                    <button class="btn-action ${status === 'Available' ? 'unavailable' : 'available'}"
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
                                <i class="bi bi-tag-fill"></i>
                            </div>
                            <div>
                                <h5 class="card-title mb-0">${displayTitle}</h5>
                                <small class="text-muted">${totalCount} template values</small>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewCategoryDetails(${categoryId}, ${gender.id})">
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

function bindCardEvents() {
    // 卡片內的事件綁定 - 目前通過內聯事件處理
}

function toggleTemplateStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateTemplateStatus(id, newStatus);
}

function setTemplateAvailable(id) {
    setTemplateAvailable(id,
        function(data) {
            showSuccess(`Template status updated to available successfully!`);
            loadTemplates(); // 重新加載數據
        },
        function(error) {
            showError(`Failed to update template status to available`);
        }
    );
}

function setTemplateUnavailable(id) {
    setTemplateUnavailable(id,
        function(data) {
            showSuccess(`Template status updated to unavailable successfully!`);
            loadTemplates(); // 重新加載數據
        },
        function(error) {
            showError(`Failed to update template status to unavailable`);
        }
    );
}

function updateTemplateStatus(id, status) {
    console.log('Updating template status:', { id, status });

    // 顯示加載提示
    showAlert('Updating template status...', 'info');

    const updateFunction = status === 'Available' ? setTemplateAvailable : setTemplateUnavailable;
    updateFunction(id,
        function(data) {
            showSuccess(`Template status updated to ${status.toLowerCase()} successfully!`);
            loadTemplates(); // 重新加載數據
        },
        function(error) {
            showError(`Failed to update template status to ${status.toLowerCase()}`);
        }
    );
}

function bindSearchEvents() {
    // 搜索功能綁定 - 預留功能
}

function bindFilterEvents() {
    // 篩選功能綁定 - 預留功能
}

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

    // 更新統計數據 - 顯示分組數量
    document.getElementById('total-items').textContent = groupCount;
    document.getElementById('available-items').textContent = availableTemplates;
    document.getElementById('unavailable-items').textContent = unavailableTemplates;
    document.getElementById('total-groups').textContent = groupCount;
}

function updatePaginationInfo(pagination) {
    if (pagination) {
        document.getElementById('showing-start').textContent = pagination.from || 0;
        document.getElementById('showing-end').textContent = pagination.to || 0;
        document.getElementById('total-count').textContent = pagination.total || 0;
    }
}

function updatePaginationInfoByCategory(groupedData, pagination) {
    // 計算分組數量（category + gender 組合）
    const groupCount = groupedData.length;

    // 更新分頁信息顯示
    document.getElementById('showing-start').textContent = 1;
    document.getElementById('showing-end').textContent = groupCount;
    document.getElementById('total-count').textContent = groupCount;

    // 更新分頁按鈕狀態
    updatePaginationButtons(groupCount);
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

function viewCategoryDetails(categoryId, genderId) {
    // 跳轉到view頁面，傳遞category+gender組合ID
    const combinedId = `${categoryId}_${genderId}`;
    const url = window.viewTemplateUrl.replace(':id', combinedId);
    window.location.href = url;
}

function showError(message) {
    showAlert(message, 'danger');
}

function showSuccess(message) {
    // 顯示成功消息
    showAlert(message, 'success');
    console.log('Success:', message);
}
