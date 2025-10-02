/**
 * Size Library Dashboard JavaScript
 * 尺码库仪表板交互逻辑
 *
 * 功能：
 * - 按类别分组显示尺码库
 * - 动态加载和更新统计数据
 * - 处理搜索和筛选
 * - 管理尺码库状态
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Size Library Dashboard JavaScript loaded');
    initializeSizeLibraryDashboard();
});

function initializeSizeLibraryDashboard() {
    // 检查URL参数中的成功消息
    checkUrlParams();

    // 加载尺码库数据
    loadSizeLibraries();

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

function loadSizeLibraries() {
    const url = window.sizeLibraryManagementRoute;
    console.log('Loading size libraries from:', url);

    fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderCategoryCards(data.data);
            updateStatistics(data.data);
            updatePaginationInfoByCategory(data.data, data.pagination);
        } else {
            showError('Failed to load size libraries');
        }
    })
    .catch(error => {
        console.error('Error loading size libraries:', error);
        showError('Error loading size libraries');
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

        // 确保category数据存在
        if (category && category.category_name) {
            cardsHTML += generateCategoryCard(category, libraries);
        } else {
            console.warn(`Category data missing:`, category);
        }
    });

    container.innerHTML = cardsHTML;

    // 绑定卡片内的事件
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

    // 确保category数据存在
    const categoryName = category ? category.category_name : 'Unknown Category';
    const categoryId = category ? category.id : 'unknown';

    // 生成尺码值列表 - 匹配 SizeTemplate 结构
    const sizeValuesHTML = libraries.map((library, index) => {
        const status = library.size_status || 'Unavailable';
        const statusClass = status === 'Available' ? 'text-success' : 'text-danger';
        const statusIcon = status === 'Available' ? 'bi-check-circle' : 'bi-x-circle';

        return `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span class="fw-medium">${library.size_value}</span>
                <div class="d-flex align-items-center gap-4">
                    <button class="btn ${status === 'Available' ? 'btn-success' : 'btn-danger'} btn-sm"
                            onclick="toggleSizeStatus(${library.id}, '${status}')"
                            style="padding: 0.25rem 0.75rem; font-weight: 600;">
                        ${status.toUpperCase()}
                    </button>
                    <button class="btn-action ${status === 'Available' ? 'unavailable' : 'available'}"
                            title="${status === 'Available' ? 'Deactivate' : 'Activate'}"
                            onclick="${status === 'Available' ? 'setSizeUnavailable' : 'setSizeAvailable'}(${library.id})">
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
    // 卡片内的事件绑定
    console.log('Card events bound');
}

// 尺码库状态操作函数

function toggleSizeStatus(id, currentStatus) {
    // 切换尺码库状态
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateSizeStatus(id, newStatus);
}

function setSizeAvailable(id) {
    // 设置尺码库为可用
    updateSizeStatus(id, 'Available');
}

function setSizeUnavailable(id) {
    // 设置尺码库为不可用
    updateSizeStatus(id, 'Unavailable');
}

function updateSizeStatus(id, status) {
    const url = status === 'Available' ?
        window.availableSizeLibraryUrl.replace(':id', id) :
        window.unavailableSizeLibraryUrl.replace(':id', id);

    console.log('Updating size library status:', { id, status, url });

    // 显示加载提示
    showAlert('Updating size library status...', 'info');

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
            showSuccess(`Size library status updated to ${status.toLowerCase()} successfully!`);
            loadSizeLibraries(); // 重新加载数据
        } else {
            showError(`Failed to update size library status to ${status.toLowerCase()}`);
        }
    })
    .catch(error => {
        console.error(`Error setting size library to ${status.toLowerCase()}:`, error);
        showError(`Error updating size library status: ${error.message}`);
    });
}

function bindSearchEvents() {
    // 搜索功能绑定
    console.log('Search events bound');
}

function bindFilterEvents() {
    // 筛选功能绑定
    console.log('Filter events bound');
}

function updateStatistics(groupedData) {
    // 计算统计数据
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

    // 更新统计数据
    document.getElementById('total-items').textContent = categoryCount;
    document.getElementById('available-items').textContent = availableLibraries;
    document.getElementById('unavailable-items').textContent = unavailableLibraries;
    document.getElementById('total-groups').textContent = categoryCount;
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

    // 更新分页信息显示
    document.getElementById('showing-start').textContent = 1;
    document.getElementById('showing-end').textContent = categoryCount;
    document.getElementById('total-count').textContent = categoryCount;

    // 更新分页按钮状态
    updatePaginationButtons(categoryCount);
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

// 尺码库操作函数

function toggleSizeStatus(id, currentStatus) {
    // 切换尺码状态
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateSizeStatus(id, newStatus);
}

function setSizeAvailable(id) {
    // 设置尺码为可用
    updateSizeStatus(id, 'Available');
}

function setSizeUnavailable(id) {
    // 设置尺码为不可用
    updateSizeStatus(id, 'Unavailable');
}

function updateSizeStatus(id, status) {
    const url = status === 'Available' ?
        window.availableSizeLibraryUrl.replace(':id', id) :
        window.unavailableSizeLibraryUrl.replace(':id', id);

    console.log('Updating size status:', { id, status, url });

    // 显示加载提示
    showAlert('Updating size status...', 'info');

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
            showSuccess(`Size status updated to ${status.toLowerCase()} successfully!`);
            loadSizeLibraries(); // 重新加载数据
        } else {
            showError(`Failed to update size status to ${status.toLowerCase()}`);
        }
    })
    .catch(error => {
        console.error(`Error setting size library to ${status.toLowerCase()}:`, error);
        showError(`Error updating size status: ${error.message}`);
    });
}

function setAllAvailable(categoryId) {
    // 设置该类别下所有尺码为可用
    console.log('Set all available for category:', categoryId);
}

function setAllUnavailable(categoryId) {
    // 设置该类别下所有尺码为不可用
    console.log('Set all unavailable for category:', categoryId);
}


function viewCategoryDetails(categoryId) {
    // 跳转到view页面
    const url = window.viewSizeLibraryUrl.replace(':id', categoryId);
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
