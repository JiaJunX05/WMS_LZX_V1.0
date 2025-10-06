/**
 * Location Dashboard JavaScript
 * 位置儀表板交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Location Dashboard JavaScript loaded');
    initializeLocationDashboard();
});

function initializeLocationDashboard() {
    // 檢查URL參數中的成功消息
    checkUrlParams();

    // 加載位置數據
    loadLocations();

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

function loadLocations() {
    const url = window.locationManagementRoute;
    console.log('Loading locations from:', url);

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
            renderZoneCards(data.data);
            updateStatistics(data);
            updatePaginationInfoByZone(data.data, data.pagination);
        } else {
            showError('Failed to load locations');
        }
    })
    .catch(error => {
        console.error('Error loading locations:', error);
        showError('Error loading locations');
    });
}

function renderZoneCards(locations) {
    const container = document.getElementById('dashboard-cards-container');
    const emptyState = document.getElementById('empty-state');

    console.log('Locations Data:', locations);

    if (!locations || locations.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // 按區域分組
    const groupedByZone = groupByZone(locations);
    console.log('Grouped by Zone:', groupedByZone);

    // 生成卡片HTML
    let cardsHTML = '';

    Object.keys(groupedByZone).forEach(zoneId => {
        const zoneData = groupedByZone[zoneId];
        const zone = zoneData.zone;
        const racks = zoneData.racks;

        console.log(`Zone ${zoneId}:`, zone, racks);

        // 確保zone數據存在
        if (zone && zone.zone_name) {
            cardsHTML += generateZoneCard(zone, racks);
        } else {
            console.warn(`Zone data missing for zone ID ${zoneId}:`, zone);
        }
    });

    container.innerHTML = cardsHTML;

    // 綁定卡片內的事件
    bindCardEvents();
}

function groupByZone(locations) {
    const grouped = {};

    locations.forEach(location => {
        // 檢查數據結構，可能 zone 數據在 location.zone 中
        const zone = location.zone || location;
        const zoneId = zone.id || location.zone_id;

        if (!grouped[zoneId]) {
            grouped[zoneId] = {
                zone: zone,
                racks: []
            };
        }

        // 檢查 rack 數據
        if (location.rack) {
            grouped[zoneId].racks.push({
                ...location.rack,
                location_id: location.id,
                location_status: location.location_status || 'Available'
            });
        } else if (location.rack_number) {
            // 如果 rack 數據直接在 location 中
            grouped[zoneId].racks.push({
                id: location.id,
                rack_number: location.rack_number,
                rack_status: location.rack_status || 'Available',
                location_status: location.location_status || 'Available',
                capacity: location.capacity,
                location_id: location.id
            });
        }
    });

    return grouped;
}

function generateZoneCard(zone, racks) {
    console.log('Generating card for zone:', zone, 'racks:', racks);

    const availableCount = racks.filter(rack => {
        const status = rack.location_status || 'Unavailable';
        return status === 'Available';
    }).length;
    const unavailableCount = racks.filter(rack => {
        const status = rack.location_status || 'Unavailable';
        return status === 'Unavailable';
    }).length;
    const totalCount = racks.length;

    // 確保zone數據存在
    const zoneName = zone ? (zone.zone_name || zone.name) : 'Unknown Zone';
    const zoneId = zone ? zone.id : 'unknown';

    // 生成貨架值列表
    console.log(`Generating rack values for zone ${zoneName}, total racks: ${racks.length}`);

    // 直接使用原始數據，不進行排序
    const rackValuesHTML = racks.map((rack, index) => {
        const status = rack.location_status || 'Unavailable';
        const statusClass = status === 'Available' ? 'text-success' : 'text-danger';
        const statusIcon = status === 'Available' ? 'bi-check-circle' : 'bi-x-circle';

        console.log(`Rack ${index + 1}: ${rack.rack_number}, Status: ${status}`);

        return `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span class="fw-medium" style="cursor: pointer;" onclick="editLocation(${rack.location_id})" title="Click to edit location">${rack.rack_number}</span>
                <div class="d-flex align-items-center gap-4">
                    <button class="btn ${status === 'Available' ? 'btn-success' : 'btn-danger'} btn-sm"
                            onclick="toggleLocationStatus(${rack.location_id}, '${status}')"
                            style="padding: 0.25rem 0.75rem; font-weight: 600;">
                        ${status.toUpperCase()}
                    </button>
                    <button class="btn-action ${status === 'Available' ? 'unavailable' : 'available'}"
                            title="${status === 'Available' ? 'Deactivate' : 'Activate'}"
                            onclick="console.log('Button clicked, location.id:', ${rack.location_id}, 'status:', '${status}'); ${status === 'Available' ? 'setLocationUnavailable' : 'setLocationAvailable'}(${rack.location_id})">
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
                                <i class="bi bi-geo-alt-fill"></i>
                            </div>
                            <div>
                                <h5 class="card-title mb-0">${zoneName}</h5>
                                <small class="text-muted">${totalCount} rack values</small>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewZoneDetails(${zoneId})">
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
                        ${rackValuesHTML}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 貨架操作函數

function toggleLocationStatus(id, currentStatus) {
    // 切換位置狀態
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateLocationStatus(id, newStatus);
}

function setLocationAvailable(id) {
    // 設置位置為可用
    updateLocationStatus(id, 'Available');
}

function setLocationUnavailable(id) {
    // 設置位置為不可用
    updateLocationStatus(id, 'Unavailable');
}

function updateLocationStatus(id, status) {
    const url = status === 'Available' ?
        window.availableLocationUrl.replace(':id', id) :
        window.unavailableLocationUrl.replace(':id', id);

    console.log('Updating location status:', { id, status, url });

    // 顯示加載提示
    showAlert('Updating location status...', 'info');

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
            showSuccess(`Location status updated to ${status.toLowerCase()} successfully!`);
            loadLocations(); // 重新加載數據
        } else {
            showError(`Failed to update location status to ${status.toLowerCase()}`);
        }
    })
    .catch(error => {
        console.error(`Error setting location to ${status.toLowerCase()}:`, error);
        showError(`Error updating location status: ${error.message}`);
    });
}

function bindCardEvents() {
    // 綁定狀態切換按鈕事件
    document.querySelectorAll('.status-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

function viewZoneDetails(zoneId) {
    // 跳轉到view頁面
    const url = window.viewLocationUrl.replace(':id', zoneId);
    window.location.href = url;
}

function editLocation(locationId) {
    // 跳轉到單個位置的edit頁面
    const url = window.editLocationUrl.replace(':id', locationId);
    window.location.href = url;
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
        availableItemsElement.textContent = data.zones_count || 0;
    }

    if (unavailableItemsElement) {
        unavailableItemsElement.textContent = data.racks_count || 0;
    }

    if (totalGroupsElement) {
        // 按區域分組計算
        const groupedByZone = groupByZone(data.data || []);
        const zoneCount = Object.keys(groupedByZone).length;
        totalGroupsElement.textContent = zoneCount;
    }
}

function updatePaginationInfoByZone(locations, pagination) {
    // 按區域分組計算
    const groupedByZone = groupByZone(locations);
    const zoneCount = Object.keys(groupedByZone).length;

    // 更新分頁信息顯示
    document.getElementById('showing-start').textContent = 1;
    document.getElementById('showing-end').textContent = zoneCount;
    document.getElementById('total-count').textContent = zoneCount;

    // 更新分頁按鈕狀態
    updatePaginationButtons(zoneCount);
}

function updatePaginationButtons(zoneCount) {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const currentPageElement = document.getElementById('current-page');
    const pageNumberElement = document.getElementById('page-number');

    // 更新頁碼顯示
    if (pageNumberElement) {
        pageNumberElement.textContent = '1'; // 當前總是第1頁
    }

    // 如果只有一個區域或沒有區域，禁用分頁按鈕
    if (zoneCount <= 1) {
        prevBtn.classList.add('disabled');
        nextBtn.classList.add('disabled');
        if (currentPageElement) {
            currentPageElement.classList.add('disabled');
        }
    } else {
        // 這裡可以根據需要實現真正的分頁邏輯
        // 目前顯示所有區域，所以按鈕保持禁用狀態
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
            filterLocations(searchTerm);
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

function filterLocations(searchTerm) {
    // 實現搜索功能
    console.log('Searching for:', searchTerm);
    // 這裡可以添加搜索邏輯
}

function applyFilters() {
    // 實現篩選功能
    console.log('Applying filters');
    // 這裡可以添加篩選邏輯
}

function showError(message) {
    showAlert(message, 'danger');
}

function showSuccess(message) {
    // 顯示成功消息
    showAlert(message, 'success');
    console.log('Success:', message);
}

function showAlert(message, type = 'info') {
    // 檢查是否有 alertContainer，如果沒有則創建一個
    let alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.className = 'position-fixed';
        alertContainer.style.cssText = 'top: 20px; right: 20px; z-index: 9999;';
        document.body.appendChild(alertContainer);
    }

    // 移除現有的alert
    const existingAlert = alertContainer.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertClass = type === 'success' ? 'alert-success' :
                      type === 'warning' ? 'alert-warning' :
                      type === 'danger' ? 'alert-danger' : 'alert-info';
    const iconClass = type === 'success' ? 'bi-check-circle-fill' :
                     type === 'warning' ? 'bi-exclamation-triangle-fill' :
                     type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';

    const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="bi ${iconClass} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    alertContainer.innerHTML = alertHtml;

    // 3秒后自動隱藏
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 3000);
}
