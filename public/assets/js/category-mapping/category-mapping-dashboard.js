/**
 * 分类映射管理仪表板 JavaScript
 *
 * 功能：
 * - 按分类分组显示映射
 * - 动态加载和更新统计数据
 * - 处理搜索和筛选
 * - 管理映射状态
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Category Mapping Dashboard JavaScript loaded');
    initializeCategoryMappingDashboard();
});

function initializeCategoryMappingDashboard() {
    // 检查URL参数中的成功消息
    checkUrlParams();

    // 加载映射数据
    loadCategoryMappings();

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

function loadCategoryMappings() {
    const url = window.categoryMappingManagementRoute;
    console.log('Loading category mappings from:', url);

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
            showError(data.message || 'Failed to load category mappings');
        }
    })
    .catch(error => {
        console.error('Error loading category mappings:', error);
        showError('Error loading category mappings: ' + error.message);
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

    // 按分类分组
    const groupedByCategory = groupByCategory(mappings);
    console.log('Grouped by Category:', groupedByCategory);

    // 生成卡片HTML
    let cardsHTML = '';

    Object.keys(groupedByCategory).forEach(categoryId => {
        const categoryData = groupedByCategory[categoryId];
        const category = categoryData.category;
        const mappings = categoryData.mappings;

        console.log(`Category ${categoryId}:`, category, mappings);

        // 确保category数据存在
        if (category && category.category_name) {
            cardsHTML += generateCategoryCard(category, mappings);
        } else {
            console.warn(`Category data missing for category ID ${categoryId}:`, category);
        }
    });

    container.innerHTML = cardsHTML;

    // 绑定卡片内的事件
    bindCardEvents();
}

function groupByCategory(mappings) {
    const grouped = {};

    mappings.forEach(mapping => {
        // 检查数据结构，可能 category 数据在 mapping.category 中
        const category = mapping.category || mapping;
        const categoryId = category.id || mapping.category_id;

        if (!grouped[categoryId]) {
            grouped[categoryId] = {
                category: category,
                mappings: []
            };
        }

        // 检查 subcategory 数据
        if (mapping.subcategory) {
            grouped[categoryId].mappings.push({
                ...mapping.subcategory,
                mapping_id: mapping.id,
                mapping_status: mapping.mapping_status || 'Available'
            });
        } else if (mapping.subcategory_name) {
            // 如果 subcategory 数据直接在 mapping 中
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

    // 确保category数据存在
    const categoryName = category ? (category.category_name || category.name) : 'Unknown Category';
    const categoryId = category ? category.id : 'unknown';

    // 生成映射列表
    console.log(`Generating mapping values for category ${categoryName}, total mappings: ${mappings.length}`);

    // 直接使用原始数据，不进行排序
    const mappingValuesHTML = mappings.map((mapping, index) => {
        const status = mapping.mapping_status || 'Unavailable';
        const statusClass = status === 'Available' ? 'text-success' : 'text-danger';
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

// 映射操作函数

function toggleMappingStatus(id, currentStatus) {
    // 切换映射状态
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateMappingStatus(id, newStatus);
}

function setMappingAvailable(id) {
    // 设置映射为可用
    updateMappingStatus(id, 'Available');
}

function setMappingUnavailable(id) {
    // 设置映射为不可用
    updateMappingStatus(id, 'Unavailable');
}

function updateMappingStatus(id, status) {
    const url = status === 'Available' ?
        window.availableMappingUrl.replace(':id', id) :
        window.unavailableMappingUrl.replace(':id', id);

    console.log('Updating mapping status:', { id, status, url });

    // 显示加载提示
    showAlert('Updating mapping status...', 'info');

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
            showSuccess(`Mapping status updated to ${status.toLowerCase()} successfully!`);
            loadCategoryMappings(); // 重新加载数据
        } else {
            showError(`Failed to update mapping status to ${status.toLowerCase()}`);
        }
    })
    .catch(error => {
        console.error(`Error setting mapping to ${status.toLowerCase()}:`, error);
        showError(`Error updating mapping status: ${error.message}`);
    });
}

function bindCardEvents() {
    // 绑定状态切换按钮事件
    document.querySelectorAll('.status-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

function viewCategoryDetails(categoryId) {
    // 跳转到view页面
    const url = window.viewCategoryMappingUrl.replace(':id', categoryId);
    window.location.href = url;
}

function editCategoryMappings(categoryId) {
    const url = window.editCategoryMappingUrl.replace(':id', categoryId);
    window.location.href = url;
}

function editMapping(mappingId) {
    // 跳转到单个映射的edit页面
    const url = window.editMappingUrl.replace(':id', mappingId);
    window.location.href = url;
}

function deleteMapping(mappingId, subcategoryName) {
    if (!confirm(`Are you sure you want to delete the mapping for "${subcategoryName}"?`)) {
        return;
    }

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
            showSuccess('Mapping deleted successfully!');
            loadCategoryMappings(); // 重新加载数据
        } else {
            showError('Failed to delete mapping: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting mapping:', error);
        showError('Error deleting mapping: ' + error.message);
    });
}

function updateStatistics(data) {
    // 更新页面顶部的统计信息
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
        // 按分类分组计算
        const groupedByCategory = groupByCategory(data.data || []);
        const categoryCount = Object.keys(groupedByCategory).length;
        totalGroupsElement.textContent = categoryCount;
    }
}

function updatePaginationInfoByCategory(mappings, pagination) {
    // 按分类分组计算
    const groupedByCategory = groupByCategory(mappings);
    const categoryCount = Object.keys(groupedByCategory).length;

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

    // 如果只有一个分类或没有分类，禁用分页按钮
    if (categoryCount <= 1) {
        prevBtn.classList.add('disabled');
        nextBtn.classList.add('disabled');
        if (currentPageElement) {
            currentPageElement.classList.add('disabled');
        }
    } else {
        // 这里可以根据需要实现真正的分页逻辑
        // 目前显示所有分类，所以按钮保持禁用状态
        prevBtn.classList.add('disabled');
        nextBtn.classList.add('disabled');
        if (currentPageElement) {
            currentPageElement.classList.remove('disabled');
        }
    }
}

function bindSearchEvents() {
    // 如果有搜索框，绑定搜索事件
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            const searchTerm = this.value;
            filterMappings(searchTerm);
        }, 300));
    }
}

function bindFilterEvents() {
    // 如果有筛选器，绑定筛选事件
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyFilters();
        });
    });
}

function filterMappings(searchTerm) {
    // 实现搜索功能
    console.log('Searching for:', searchTerm);
    const cards = document.querySelectorAll('.content-card');
    cards.forEach(card => {
        const categoryName = card.querySelector('.card-title').textContent.toLowerCase();
        const shouldShow = categoryName.includes(searchTerm.toLowerCase());
        card.style.display = shouldShow ? 'block' : 'none';
    });
}

function applyFilters() {
    // 实现筛选功能
    console.log('Applying filters');
    const filterValue = document.getElementById('filter-select').value;
    // 这里可以添加具体的筛选逻辑
}

function showError(message) {
    showAlert(message, 'danger');
}

function showSuccess(message) {
    // 显示成功消息
    showAlert(message, 'success');
    console.log('Success:', message);
}

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用

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

// 防抖函数
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

// 节流函数
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

// 导出函数供全局使用
window.editCategoryMappings = editCategoryMappings;
window.editMapping = editMapping;
window.deleteMapping = deleteMapping;
window.toggleMappingStatus = toggleMappingStatus;
window.setMappingAvailable = setMappingAvailable;
window.setMappingUnavailable = setMappingUnavailable;
window.updateMappingStatus = updateMappingStatus;
window.viewCategoryDetails = viewCategoryDetails;
