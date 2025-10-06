/**
 * Library Dashboard JavaScript
 * 尺碼庫儀表板交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Library Dashboard JavaScript loaded');
    initializeLibraryDashboard();
});

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

function loadLibraries() {
    const url = window.sizeLibraryManagementRoute;
    console.log('Loading libraries from:', url);

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
    setLibraryAvailable(id,
        function(data) {
            showSuccess(`Library status updated to available successfully!`);
            loadLibraries(); // 重新加載數據
        },
        function(error) {
            showError(`Failed to update library status to available`);
        }
    );
}

function setLibraryUnavailable(id) {
    // 設置尺碼庫為不可用
    setLibraryUnavailable(id,
        function(data) {
            showSuccess(`Library status updated to unavailable successfully!`);
            loadLibraries(); // 重新加載數據
        },
        function(error) {
            showError(`Failed to update library status to unavailable`);
        }
    );
}

function updateLibraryStatus(id, status) {
    console.log('Updating library status:', { id, status });

    // 顯示加載提示
    showAlert('Updating library status...', 'info');

    const updateFunction = status === 'Available' ? setLibraryAvailable : setLibraryUnavailable;
    updateFunction(id,
        function(data) {
            showSuccess(`Library status updated to ${status.toLowerCase()} successfully!`);
            loadLibraries(); // 重新加載數據
        },
        function(error) {
            showError(`Failed to update library status to ${status.toLowerCase()}`);
        }
    );
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

    // 更新統計數據
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
    showAlert(message, 'danger');
}

function showSuccess(message) {
    // 顯示成功消息
    showAlert(message, 'success');
    console.log('Success:', message);
}
