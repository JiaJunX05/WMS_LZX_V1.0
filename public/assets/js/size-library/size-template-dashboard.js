/**
 * 尺码模板管理仪表板 JavaScript
 *
 * 功能：
 * - 按类别分组显示尺码模板
 * - 动态加载和更新统计数据
 * - 处理搜索和筛选
 * - 管理尺码模板状态
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeTemplateDashboard();
});

function initializeTemplateDashboard() {
    // 检查URL参数中的成功消息
    checkUrlParams();

    // 加载尺码模板数据
    loadTemplates();

    // 绑定搜索功能
    bindSearchEvents();

    // 绑定筛选功能
    bindFilterEvents();
}

function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success) {
        showAlert(decodeURIComponent(success), 'success');
        // 清除URL参数
        const url = new URL(window.location);
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url);
    }

    if (error) {
        showAlert(decodeURIComponent(error), 'danger');
        // 清除URL参数
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

        // 确保category和gender数据存在
        if (category && category.category_name && gender && gender.gender_name) {
            cardsHTML += generateCategoryCard(category, gender, templates);
        } else {
            console.warn(`Category or gender data missing:`, category, gender);
        }
    });

    container.innerHTML = cardsHTML;

    // 绑定卡片内的事件
    bindCardEvents();
}

// groupByCategory 函数已移除，分组现在在控制器中完成

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

    // 确保category和gender数据存在
    const categoryName = category ? category.category_name : 'Unknown Category';
    const categoryId = category ? category.id : 'unknown';
    const genderName = gender ? gender.gender_name : 'Unknown Gender';
    const displayTitle = `${categoryName} (${genderName})`;

    // 生成模板值列表

    // 直接使用原始数据，不进行排序
    const templateValuesHTML = templates.map((template, index) => {
        const status = template.template_status || 'Unavailable';
        const statusClass = status === 'Available' ? 'text-success' : 'text-danger';
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
    // 卡片内的事件绑定 - 目前通过内联事件处理
}

function toggleTemplateStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateTemplateStatus(id, newStatus);
}

function setTemplateAvailable(id) {
    updateTemplateStatus(id, 'Available');
}

function setTemplateUnavailable(id) {
    updateTemplateStatus(id, 'Unavailable');
}

function updateTemplateStatus(id, status) {
    const url = status === 'Available' ?
        window.availableTemplateUrl.replace(':id', id) :
        window.unavailableTemplateUrl.replace(':id', id);


    // 显示加载提示
    showAlert('Updating template status...', 'info');

    fetch(url, {
        method: 'PATCH',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showSuccess(`Template status updated to ${status.toLowerCase()} successfully!`);
            loadTemplates(); // 重新加载数据
        } else {
            showError(`Failed to update template status to ${status.toLowerCase()}`);
        }
    })
    .catch(error => {
        console.error(`Error setting template to ${status.toLowerCase()}:`, error);
        showError(`Error updating template status: ${error.message}`);
    });
}

function bindSearchEvents() {
    // 搜索功能绑定 - 预留功能
}

function bindFilterEvents() {
    // 筛选功能绑定 - 预留功能
}

function updateStatistics(groupedData) {
    // 计算分组数量（category + gender 组合）
    const groupCount = groupedData.length;

    // 计算所有模板的统计信息
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

    // 更新统计数据 - 显示分组数量
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
    // 计算分组数量（category + gender 组合）
    const groupCount = groupedData.length;

    // 更新分页信息显示
    document.getElementById('showing-start').textContent = 1;
    document.getElementById('showing-end').textContent = groupCount;
    document.getElementById('total-count').textContent = groupCount;

    // 更新分页按钮状态
    updatePaginationButtons(groupCount);
}

function updatePaginationButtons(categoryCount) {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const currentPageElement = document.getElementById('current-page');
    const pageNumberElement = document.getElementById('page-number');

    // 更新页码显示
    if (pageNumberElement) {
        pageNumberElement.textContent = '1'; // 当前总是第1页
    }

    // 如果只有一个类别或没有类别，禁用分页按钮
    if (categoryCount <= 1) {
        prevBtn.classList.add('disabled');
        nextBtn.classList.add('disabled');
        // 不要给当前页面元素添加disabled类，保持active状态
        if (currentPageElement) {
            currentPageElement.classList.remove('disabled');
        }
    } else {
        // 这里可以根据需要实现真正的分页逻辑
        // 目前显示所有类别，所以按钮保持禁用状态
        prevBtn.classList.add('disabled');
        nextBtn.classList.add('disabled');
        if (currentPageElement) {
            currentPageElement.classList.remove('disabled');
        }
    }
}

// 尺码模板操作函数

function setAllAvailable(categoryId) {
    // 设置该类别下所有模板为可用 - 预留功能
}

function setAllUnavailable(categoryId) {
    // 设置该类别下所有模板为不可用 - 预留功能
}

function viewCategoryDetails(categoryId, genderId) {
    // 跳转到view页面，传递category+gender组合ID
    const combinedId = `${categoryId}_${genderId}`;
    const url = window.viewTemplateUrl.replace(':id', combinedId);
    window.location.href = url;
}

// 工具函数

function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// showAlert, showSuccess, showError 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
