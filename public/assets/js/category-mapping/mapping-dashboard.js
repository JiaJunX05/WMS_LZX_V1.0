/**
 * Mapping Dashboard JavaScript
 * 映射管理儀表板交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Mapping Dashboard JavaScript loaded');
    initializeMappingDashboard();
});

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
            showError(data.message || 'Failed to load mappings');
        }
    })
    .catch(error => {
        console.error('Error loading mappings:', error);
        showError('Error loading mappings: ' + error.message);
    });
}

function renderCategoryCards(mappings) {
    const container = document.getElementById('dashboard-cards-container');
    const emptyState = document.getElementById('empty-state');

    console.log('Mappings Data:', mappings);

    if (!mappings || mappings.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

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
        const statusClass = getMappingStatusClass(status);
        const statusIcon = status === 'Available' ? 'bi-check-circle' : 'bi-x-circle';

        console.log(`Mapping ${index + 1}: ${mapping.subcategory_name}, Status: ${status}`);

        return `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span class="fw-medium" style="cursor: pointer;" onclick="editMapping(${mapping.mapping_id})" title="Click to edit mapping">${mapping.subcategory_name}</span>
                <div class="d-flex align-items-center gap-4">
                    <button class="btn ${status === 'Available' ? 'btn-success' : 'btn-danger'} btn-sm"
                            onclick="toggleMappingStatus(${mapping.mapping_id}, '${status}')"
                            style="padding: 0.25rem 0.75rem; font-weight: 600;">
                        ${status.toUpperCase()}
                    </button>
                    <button class="btn-action ${status === 'Available' ? 'unavailable' : 'available'}"
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

// 映射操作函數

function toggleMappingStatus(id, currentStatus) {
    // 切換映射狀態
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateMappingStatus(id, newStatus);
}

function setMappingAvailable(id) {
    // 設置映射為可用
    setMappingAvailable(id,
        function(data) {
            showSuccess(`Mapping status updated to available successfully!`);
            loadMappings(); // 重新加載數據
        },
        function(error) {
            showError(`Failed to update mapping status to available`);
        }
    );
}

function setMappingUnavailable(id) {
    // 設置映射為不可用
    setMappingUnavailable(id,
        function(data) {
            showSuccess(`Mapping status updated to unavailable successfully!`);
            loadMappings(); // 重新加載數據
        },
        function(error) {
            showError(`Failed to update mapping status to unavailable`);
        }
    );
}

function updateMappingStatus(id, status) {
    console.log('Updating mapping status:', { id, status });

    // 顯示加載提示
    showAlert('Updating mapping status...', 'info');

    const updateFunction = status === 'Available' ? setMappingAvailable : setMappingUnavailable;
    updateFunction(id,
        function(data) {
            showSuccess(`Mapping status updated to ${status.toLowerCase()} successfully!`);
            loadMappings(); // 重新加載數據
        },
        function(error) {
            showError(`Failed to update mapping status to ${status.toLowerCase()}`);
        }
    );
}

function bindCardEvents() {
    // 綁定狀態切換按鈕事件
    document.querySelectorAll('.status-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

function viewCategoryDetails(categoryId) {
    // 跳轉到view頁面
    const url = window.viewCategoryMappingUrl.replace(':id', categoryId);
    window.location.href = url;
}

function editCategoryMappings(categoryId) {
    const url = window.editCategoryMappingUrl.replace(':id', categoryId);
    window.location.href = url;
}

function editMapping(mappingId) {
    // 跳轉到單個映射的edit頁面
    const url = window.editMappingUrl.replace(':id', mappingId);
    window.location.href = url;
}

function deleteMapping(mappingId, subcategoryName) {
    if (!confirm(`Are you sure you want to delete the mapping for "${subcategoryName}"?`)) {
        return;
    }

    deleteMapping(mappingId,
        function(data) {
            showSuccess('Mapping deleted successfully!');
            loadMappings(); // 重新加載數據
        },
        function(error) {
            showError('Failed to delete mapping: ' + error);
        }
    );
}

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

function bindFilterEvents() {
    // 如果有篩選器，綁定篩選事件
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyFilters();
        });
    });
}

function filterMappings(searchTerm) {
    // 實現搜索功能
    console.log('Searching for:', searchTerm);
    const cards = document.querySelectorAll('.content-card');
    cards.forEach(card => {
        const categoryName = card.querySelector('.card-title').textContent.toLowerCase();
        const shouldShow = categoryName.includes(searchTerm.toLowerCase());
        card.style.display = shouldShow ? 'block' : 'none';
    });
}

function applyFilters() {
    // 實現篩選功能
    console.log('Applying filters');
    const filterValue = document.getElementById('filter-select').value;
    // 這裡可以添加具體的篩選邏輯
}

function showError(message) {
    showAlert(message, 'danger');
}

function showSuccess(message) {
    // 顯示成功消息
    showAlert(message, 'success');
    console.log('Success:', message);
}

// 導出函數供全局使用
window.editCategoryMappings = editCategoryMappings;
window.editMapping = editMapping;
window.deleteMapping = deleteMapping;
window.toggleMappingStatus = toggleMappingStatus;
window.setMappingAvailable = setMappingAvailable;
window.setMappingUnavailable = setMappingUnavailable;
window.updateMappingStatus = updateMappingStatus;
window.viewCategoryDetails = viewCategoryDetails;
