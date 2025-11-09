/**
 * Location Management JavaScript
 * 位置管理統一交互邏輯
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
 * 處理位置請求
 */
function handleLocationRequest(url, method, data, onSuccess, onError) {
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
 * 創建位置
 */
function createLocation(locationData, onSuccess, onError) {
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加位置數據
    if (locationData.locations && Array.isArray(locationData.locations)) {
        locationData.locations.forEach((location, index) => {
            formData.append(`locations[${index}][zone_id]`, location.zoneId);
            formData.append(`locations[${index}][rack_id]`, location.rackId);
            formData.append(`locations[${index}][location_status]`, location.locationStatus);
        });
    } else {
        formData.append('zone_id', locationData.zoneId);
        formData.append('rack_id', locationData.rackId);
        formData.append('location_status', locationData.locationStatus);
    }

    handleLocationRequest(
        window.createLocationUrl,
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 更新位置
 */
function updateLocation(locationId, formData, onSuccess, onError) {
    formData.append('_method', 'PUT');

    handleLocationRequest(
        window.updateLocationUrl.replace(':id', locationId),
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 刪除位置
 */
function deleteLocation(locationId, onSuccess, onError) {
    handleLocationRequest(
        window.deleteLocationUrl.replace(':id', locationId),
        'DELETE',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置位置為可用
 */
function setLocationAvailable(locationId, onSuccess, onError) {
    handleLocationRequest(
        window.availableLocationUrl.replace(':id', locationId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置位置為不可用
 */
function setLocationUnavailable(locationId, onSuccess, onError) {
    handleLocationRequest(
        window.unavailableLocationUrl.replace(':id', locationId),
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
 * 初始化位置儀表板
 */
function initializeLocationDashboard() {
    // 檢查URL參數中的成功消息
    checkUrlParams();

    // 加載位置數據
    loadLocations();
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
 * 加載位置數據
 */
function loadLocations() {
    const url = window.locationManagementRoute;

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
            renderZoneCards(data.data);
            updateStatistics(data);
            updatePaginationInfoByZone(data.data, data.pagination);
        } else {
            if (typeof window.showAlert === 'function') {
                window.showAlert(data.message || 'Failed to load locations', 'error');
            } else {
                alert(data.message || 'Failed to load locations');
            }
        }
    })
    .catch(error => {
        console.error('Error loading locations:', error);
        if (typeof window.showAlert === 'function') {
            window.showAlert('Failed to load locations', 'error');
        } else {
            alert('Failed to load locations');
        }
    });
}

/**
 * 渲染區域卡片
 */
function renderZoneCards(locations) {
    const container = document.getElementById('dashboard-cards-container');
    const emptyState = document.getElementById('empty-state');

    if (!locations || locations.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }

    emptyState.classList.add('d-none');

    // 按區域分組
    const groupedByZone = groupByZone(locations);

    // 生成卡片HTML
    let cardsHTML = '';

    Object.keys(groupedByZone).forEach(zoneId => {
        const zoneData = groupedByZone[zoneId];
        const zone = zoneData.zone;
        const racks = zoneData.racks;

        // 確保zone數據存在
        if (zone && zone.zone_name) {
            cardsHTML += generateZoneCard(zone, racks);
        } else {
            console.warn(`Zone data missing for zone ID ${zoneId}:`, zone);
        }
    });

    container.innerHTML = cardsHTML;
}

/**
 * 按區域分組
 */
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

/**
 * 生成區域卡片
 */
function generateZoneCard(zone, racks) {
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
    const rackValuesHTML = racks.map((rack, index) => {
        const status = rack.location_status || 'Unavailable';

        return `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span class="fw-medium" style="cursor: pointer;" onclick="editLocation(${rack.location_id})" title="Click to edit location">${rack.rack_number}</span>
                <div class="d-flex align-items-center gap-4">
                    <span class="badge ${status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${status}
                    </span>
                    <button class="btn btn-sm ${status === 'Available' ? 'btn-outline-warning' : 'btn-outline-success'}"
                            title="${status === 'Available' ? 'Deactivate' : 'Activate'}"
                            onclick="${status === 'Available' ? 'setLocationUnavailable' : 'setLocationAvailable'}(${rack.location_id})">
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
                                <i class="bi bi-geo-alt-fill text-white fs-5"></i>
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

/**
 * 更新統計信息
 */
function updateStatistics(data) {
    // 更新頁面頂部的統計信息
    const totalLocationsElement = document.getElementById('total-locations');
    const availableZonesElement = document.getElementById('available-zones');
    const availableRacksElement = document.getElementById('available-racks');
    const locationGroupsElement = document.getElementById('location-groups');

    if (totalLocationsElement) {
        totalLocationsElement.textContent = data.total || 0;
    }

    if (availableZonesElement) {
        availableZonesElement.textContent = data.zones_count || 0;
    }

    if (availableRacksElement) {
        availableRacksElement.textContent = data.racks_count || 0;
    }

    if (locationGroupsElement) {
        // 按區域分組計算
        const groupedByZone = groupByZone(data.data || []);
        const zoneCount = Object.keys(groupedByZone).length;
        locationGroupsElement.textContent = zoneCount;
    }
}

/**
 * 更新分頁信息
 */
function updatePaginationInfoByZone(locations, pagination) {
    // 按區域分組計算
    const groupedByZone = groupByZone(locations);
    const zoneCount = Object.keys(groupedByZone).length;

    // 更新分頁信息顯示 - 添加 DOM 元素存在性檢查
    const showingStartEl = document.getElementById('showing-start');
    const showingEndEl = document.getElementById('showing-end');
    const totalCountEl = document.getElementById('total-count');

    if (showingStartEl) showingStartEl.textContent = 1;
    if (showingEndEl) showingEndEl.textContent = zoneCount;
    if (totalCountEl) totalCountEl.textContent = zoneCount;

    // 更新分頁按鈕狀態
    updatePaginationButtons(zoneCount);
}

/**
 * 更新分頁按鈕
 */
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
        if (prevBtn) prevBtn.classList.add('disabled');
        if (nextBtn) nextBtn.classList.add('disabled');
    } else {
        // 這裡可以根據需要實現真正的分頁邏輯
        // 目前顯示所有區域，所以按鈕保持禁用狀態
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
 * 初始化位置查看頁面
 */
function initializeLocationView() {
    // 綁定事件監聽器
    bindViewEvents();

    // 綁定 Update Modal 事件
    bindUpdateLocationModalEvents();

    // 初始化狀態
    updateViewUI();
}

/**
 * 綁定查看頁面事件
 */
function bindViewEvents() {
    // 刪除按鈕事件 - 使用事件委託，只監聽 Delete 按鈕
    document.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('button.btn-outline-danger[data-location-id][data-action="delete"]');
        if (deleteButton) {
            const locationId = deleteButton.getAttribute('data-location-id');
            deleteLocationFromView(locationId);
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
 * 從查看頁面刪除位置
 */
function deleteLocationFromView(locationId) {
    // 防止重複點擊
    if (isDeleting) {
        return;
    }

    isDeleting = true;

    if (!confirm('Are you sure you want to delete this location?')) {
        isDeleting = false;
        return;
    }

    // 直接發送 DELETE 請求
    const url = window.deleteLocationUrl.replace(':id', locationId);
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
                window.showAlert('Location deleted successfully', 'success');
            } else {
                alert('Location deleted successfully');
            }

            // 刪除成功後，從頁面中移除該行
            const deletedRow = document.querySelector(`[data-location-id="${locationId}"]`).closest('tr');
            if (deletedRow) {
                deletedRow.remove();
            }

            // 更新統計信息
            updateViewStatistics();

            // 檢查是否還有資料，如果沒有就跳轉回 index
            checkAndRedirectIfEmpty();
        } else {
            if (typeof window.showAlert === 'function') {
                window.showAlert('Failed to delete location', 'error');
            } else {
                alert('Failed to delete location');
            }
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
        if (typeof window.showAlert === 'function') {
            window.showAlert('Failed to delete location', 'error');
        } else {
            alert('Failed to delete location');
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

    // 如果沒有資料行了，直接跳轉回 index
    if (dataRows.length === 0) {
        setTimeout(() => {
            window.location.href = window.locationManagementRoute;
        }, 1000);
    }
}

// =============================================================================
// 位置操作函數 (Location Operations)
// =============================================================================

/**
 * 切換位置狀態
 */
function toggleLocationStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateLocationStatus(id, newStatus);
}

/**
 * 設置位置為可用
 */
function setLocationAvailable(id) {
    updateLocationStatus(id, 'Available');
}

/**
 * 設置位置為不可用
 */
function setLocationUnavailable(id) {
    updateLocationStatus(id, 'Unavailable');
}

/**
 * 更新單個位置狀態顯示（不重新加載所有數據）
 */
function updateSingleLocationStatusUI(locationId, newStatus) {
    // 找到包含該 location 的行（通過查找包含 locationId 的按鈕）
    const locationRows = document.querySelectorAll('.list-container > div');
    let targetRow = null;
    let zoneCard = null;

    locationRows.forEach(row => {
        const button = row.querySelector('button');
        if (button && button.getAttribute('onclick')) {
            const onclickAttr = button.getAttribute('onclick');
            // 檢查 onclick 是否包含該 locationId
            if (onclickAttr.includes(`(${locationId})`)) {
                targetRow = row;
                zoneCard = row.closest('.content-card');
            }
        }
    });

    if (!targetRow || !zoneCard) {
        // 如果找不到，則重新加載所有數據
        console.warn('Could not find location row, reloading all data');
        loadLocations();
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
            toggleButton.setAttribute('onclick', `setLocationUnavailable(${locationId})`);
        } else {
            toggleButton.className = 'btn btn-sm btn-outline-success';
            toggleButton.title = 'Activate';
            toggleButton.innerHTML = '<i class="bi bi-check-circle"></i>';
            toggleButton.setAttribute('onclick', `setLocationAvailable(${locationId})`);
        }
    }

    // 更新區域卡片中的統計數字
    const availableCountEl = zoneCard.querySelector('.col-6:first-child .h4');
    const unavailableCountEl = zoneCard.querySelector('.col-6:last-child .h4');

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
 * 更新位置狀態
 */
function updateLocationStatus(id, status) {
    const url = status === 'Available' ?
        window.availableLocationUrl.replace(':id', id) :
        window.unavailableLocationUrl.replace(':id', id);

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
            window.showAlert(`Location status updated to ${status.toLowerCase()} successfully!`, 'success');
            // 只更新單個位置狀態，不重新加載所有數據
            updateSingleLocationStatusUI(id, status);
        } else {
            if (typeof window.showAlert === 'function') {
                window.showAlert('Failed to update location status', 'error');
            } else {
                alert('Failed to update location status');
            }
        }
    })
    .catch(error => {
        console.error(`Error setting location to ${status.toLowerCase()}:`, error);
        if (typeof window.showAlert === 'function') {
            window.showAlert('Failed to update location status', 'error');
        } else {
            alert('Failed to update location status');
        }
    });
}

/**
 * 查看區域詳情
 */
function viewZoneDetails(zoneId) {
    // 跳轉到view頁面
    const url = window.viewLocationUrl.replace(':id', zoneId);
    window.location.href = url;
}

/**
 * 編輯位置（跳轉到 view 頁面）
 */
function editLocation(locationId) {
    const url = window.viewLocationUrl.replace(':id', locationId);
    window.location.href = url;
}

// =============================================================================
// Create Location Modal 功能 (Create Location Modal Functions)
// =============================================================================

/**
 * 初始化 Location Create Modal
 */
function initializeLocationCreateModal() {
    // 綁定 modal 事件
    bindLocationModalEvents();
}

/**
 * 綁定 Location Modal 事件
 */
function bindLocationModalEvents() {
    const modal = document.getElementById('createLocationModal');
    if (!modal) return;

    // Modal 打開時重置
    modal.addEventListener('show.bs.modal', function() {
        resetLocationModal();
    });

    // Zone 選擇變化
    const zoneSelect = document.getElementById('zone_id');
    if (zoneSelect) {
        zoneSelect.addEventListener('change', handleZoneSelectChange);
    }

    // Select All 按鈕
    const selectAllBtn = document.getElementById('selectAllRacksBtn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAllRacks);
    }

    // Clear All 按鈕
    const clearAllBtn = document.getElementById('clearAllRacksBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllRacks);
    }

    // 提交按鈕
    const submitBtn = document.getElementById('submitCreateLocationModal');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitLocationModal);
    }
}

/**
 * 處理 Zone 選擇變化
 */
function handleZoneSelectChange() {
    const zoneId = document.getElementById('zone_id').value;

    if (zoneId) {
        loadAvailableRacks();
    } else {
        hideRackCards();
    }
}

/**
 * 加載可用的 Racks
 */
function loadAvailableRacks() {
    // 顯示加載狀態
    showRackLoading();

    // 從全局變量獲取可用的 racks
    const racks = window.availableRacks || [];

    if (racks && racks.length > 0) {
        displayRackCards(racks);
    } else {
        hideRackCards();
        if (typeof window.showAlert === 'function') {
            window.showAlert('No available racks found', 'warning');
        } else {
            alert('No available racks found');
        }
    }
}

/**
 * 顯示 Rack 加載狀態
 */
function showRackLoading() {
    const selectionArea = document.getElementById('rackSelection');
    const container = document.getElementById('rackCardsContainer');

    if (selectionArea) {
        selectionArea.classList.remove('d-none');
    }

    if (container) {
        container.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading available racks...</p>
            </div>
        `;
    }

    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-rack-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }
}

/**
 * 顯示 Rack 卡片
 */
function displayRackCards(racks) {
    const selectionArea = document.getElementById('rackSelection');
    const container = document.getElementById('rackCardsContainer');
    if (!selectionArea || !container) return;

    // 顯示選擇區域
    selectionArea.classList.remove('d-none');

    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-rack-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }

    if (racks.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-exclamation-circle fs-1 text-muted mb-3"></i>
                <h6 class="text-muted">No Available Racks</h6>
                <p class="text-muted small">No racks found for the selected zone.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = racks.map(rack => `
        <div class="col-6 col-md-4 col-lg-3 mb-3">
            <div class="card rack-card h-100 border-2 border-light shadow-sm position-relative overflow-hidden"
                 data-rack-id="${rack.id}"
                 data-rack-number="${rack.rack_number}"
                 data-status="${rack.rack_status}"
                 style="cursor: pointer; transition: all 0.3s ease; border-radius: 12px;">
                <input type="checkbox" name="rack_ids[]" value="${rack.id}"
                       class="rack-checkbox position-absolute opacity-0"
                       id="rack_${rack.id}"
                       style="pointer-events: none;">
                <label for="rack_${rack.id}" class="card-body d-flex flex-column justify-content-center align-items-center text-center p-4"
                       style="cursor: pointer; min-height: 120px; position: relative;">
                    <div class="position-absolute top-0 end-0 m-2">
                        <i class="bi bi-check-circle-fill text-success fs-5 d-none rack-check-icon" style="text-shadow: 0 0 4px rgba(0,0,0,0.2);"></i>
                    </div>
                    <div class="rack-number fw-bold text-dark mb-2 fs-5">${rack.rack_number.toUpperCase()}</div>
                    <div class="rack-capacity text-muted small mb-3">
                        <i class="bi bi-boxes me-1"></i>Capacity: ${rack.capacity || 'N/A'}
                    </div>
                    <div class="rack-status badge ${rack.rack_status === 'Available' ? 'bg-success-subtle text-success border border-success border-opacity-25' : 'bg-danger-subtle text-danger border border-danger border-opacity-25'} px-3 py-2 rounded-pill">
                        <i class="bi ${rack.rack_status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${rack.rack_status}
                    </div>
                </label>
            </div>
        </div>
    `).join('');

    // 綁定卡片點擊事件
    bindRackCardEvents();

    // 更新選擇計數器
    updateRackSelectionCounter();
}

/**
 * 隱藏 Rack 卡片
 */
function hideRackCards() {
    const selectionArea = document.getElementById('rackSelection');
    if (selectionArea) {
        selectionArea.classList.add('d-none');
    }

    // 顯示初始消息
    const initialMessage = document.getElementById('initial-rack-message');
    if (initialMessage) {
        initialMessage.classList.remove('d-none');
    }

    // 重置計數器
    const counter = document.getElementById('rackSelectionCounter');
    if (counter) {
        counter.textContent = '0 selected';
        counter.className = 'badge bg-primary';
    }
}

/**
 * 綁定 Rack 卡片事件
 */
function bindRackCardEvents() {
    const cards = document.querySelectorAll('.rack-card');
    cards.forEach(card => {
        // 為複選框添加事件監聽
        const checkbox = card.querySelector('input[type="checkbox"]');
        const checkIcon = card.querySelector('.rack-check-icon');

        if (checkbox) {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    card.classList.add('border-success', 'bg-success-subtle');
                    card.classList.remove('border-light');
                    card.style.transform = 'scale(1.02)';
                    card.style.boxShadow = '0 4px 12px rgba(25, 135, 84, 0.3)';
                    if (checkIcon) {
                        checkIcon.classList.remove('d-none');
                    }
                } else {
                    card.classList.remove('border-success', 'bg-success-subtle');
                    card.classList.add('border-light');
                    card.style.transform = 'scale(1)';
                    card.style.boxShadow = '';
                    if (checkIcon) {
                        checkIcon.classList.add('d-none');
                    }
                }
                updateRackSelectionCounter();
            });
        }

        // 添加悬停效果
        card.addEventListener('mouseenter', function() {
            if (!checkbox.checked) {
                this.classList.add('border-primary');
                this.classList.remove('border-light');
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }
        });

        card.addEventListener('mouseleave', function() {
            if (!checkbox.checked) {
                this.classList.remove('border-primary');
                this.classList.add('border-light');
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '';
            }
        });
    });
}

/**
 * 更新 Rack 選擇計數器
 */
function updateRackSelectionCounter() {
    const selectedCount = document.querySelectorAll('#rackCardsContainer input[type="checkbox"]:checked').length;
    const counter = document.getElementById('rackSelectionCounter');
    const submitBtn = document.getElementById('submitCreateLocationModal');

    if (counter) {
        counter.textContent = `${selectedCount} selected`;

        if (selectedCount > 0) {
            counter.className = 'badge bg-success';
        } else {
            counter.className = 'badge bg-primary';
        }
    }

    // 更新提交按鈕狀態
    if (submitBtn) {
        submitBtn.disabled = selectedCount === 0;
    }
}

/**
 * 選擇所有 Racks
 */
function selectAllRacks() {
    const checkboxes = document.querySelectorAll('#rackCardsContainer input[type="checkbox"]');
    if (checkboxes.length === 0) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('No racks available to select', 'warning');
        } else {
            alert('No racks available to select');
        }
        return;
    }

    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        const card = checkbox.closest('.rack-card');
        const checkIcon = card?.querySelector('.rack-check-icon');
        if (card) {
            card.classList.add('border-success', 'bg-success-subtle');
            card.classList.remove('border-light');
            card.style.transform = 'scale(1.02)';
            card.style.boxShadow = '0 4px 12px rgba(25, 135, 84, 0.3)';
            if (checkIcon) {
                checkIcon.classList.remove('d-none');
            }
        }
    });
    updateRackSelectionCounter();

    // 顯示選擇提示
    const selectedCount = checkboxes.length;
    if (typeof window.showAlert === 'function') {
        window.showAlert(`${selectedCount} rack${selectedCount > 1 ? 's' : ''} selected`, 'success');
    } else {
        alert(`${selectedCount} rack${selectedCount > 1 ? 's' : ''} selected`);
    }
}

/**
 * 清除所有 Racks 選擇
 */
function clearAllRacks() {
    const checkboxes = document.querySelectorAll('#rackCardsContainer input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('No racks selected to clear', 'info');
        } else {
            alert('No racks selected to clear');
        }
        return;
    }

    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const card = checkbox.closest('.rack-card');
        const checkIcon = card?.querySelector('.rack-check-icon');
        if (card) {
            card.classList.remove('border-success', 'bg-success-subtle');
            card.classList.add('border-light');
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '';
            if (checkIcon) {
                checkIcon.classList.add('d-none');
            }
        }
    });
    updateRackSelectionCounter();

    // 顯示清除提示
    if (typeof window.showAlert === 'function') {
        window.showAlert('All selections cleared', 'info');
    } else {
        alert('All selections cleared');
    }
}

/**
 * 重置 Location Modal
 */
function resetLocationModal() {
    // 重置表單
    const form = document.getElementById('createLocationModalForm');
    if (form) {
        form.reset();
    }

    // 重置 Zone 選擇
    const zoneSelect = document.getElementById('zone_id');
    if (zoneSelect) {
        zoneSelect.value = '';
    }

    // 隱藏 Rack 卡片
    hideRackCards();

    // 清除所有選擇
    const checkboxes = document.querySelectorAll('#rackCardsContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const card = checkbox.closest('.rack-card');
        const checkIcon = card?.querySelector('.rack-check-icon');
        if (card) {
            card.classList.remove('border-success', 'bg-success-subtle');
            card.classList.add('border-light');
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '';
            if (checkIcon) {
                checkIcon.classList.add('d-none');
            }
        }
    });

    // 更新計數器
    const counter = document.getElementById('rackSelectionCounter');
    if (counter) {
        counter.textContent = '0 selected';
        counter.className = 'badge bg-primary';
    }

    // 禁用提交按鈕
    const submitBtn = document.getElementById('submitCreateLocationModal');
    if (submitBtn) {
        submitBtn.disabled = true;
    }
}

/**
 * 提交 Location Modal
 */
function submitLocationModal() {
    const zoneId = document.getElementById('zone_id').value;
    const selectedRacks = Array.from(document.querySelectorAll('#rackCardsContainer input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    // 驗證
    if (!zoneId) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please select a zone first', 'warning');
        } else {
            alert('Please select a zone first');
        }
        return;
    }

    if (selectedRacks.length === 0) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Please select at least one rack', 'warning');
        } else {
            alert('Please select at least one rack');
        }
        return;
    }

    // 準備數據
    const locations = selectedRacks.map(rackId => ({
        zoneId: zoneId,
        rackId: rackId,
        locationStatus: 'Available'
    }));

    // 顯示加載狀態
    const submitBtn = document.getElementById('submitCreateLocationModal');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Creating...';
    submitBtn.disabled = true;

    // 提交創建請求
    createLocation({ locations },
        function(data) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(data.message || 'Locations created successfully', 'success');
            } else {
                alert(data.message || 'Locations created successfully');
            }

            // 關閉 modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createLocationModal'));
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
                window.showAlert(error || 'Failed to create locations', 'error');
            } else {
                alert(error || 'Failed to create locations');
            }

            // 恢復按鈕狀態
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    );
}

// =============================================================================
// Update Location Modal 功能 (Update Location Modal Functions)
// =============================================================================

/**
 * 綁定 Update Location Modal 事件
 */
function bindUpdateLocationModalEvents() {
    // 彈窗打開時初始化狀態卡片
    $('#updateLocationModal').on('show.bs.modal', function() {
        if (typeof window.initializeStatusCardSelection === 'function') {
            window.initializeStatusCardSelection('location_status');
        }
    });

    // 彈窗關閉時清理表單
    $('#updateLocationModal').on('hidden.bs.modal', function() {
        const form = document.getElementById('updateLocationModalForm');
        if (form) {
            form.reset();
        }

        // 清空 select 選項
        $('#update_zone_id').empty().append('<option value="">Select zone</option>');
        $('#update_rack_id').empty().append('<option value="">Select rack</option>');

        // 清空當前信息卡片
        $('#currentLocationInfo').html('');

        // 重置狀態卡片（只清理 modal 內的）
        const modal = document.getElementById('updateLocationModal');
        if (modal) {
            $(modal).find('input[name="location_status"]').prop('checked', false);
            $(modal).find('.status-card').removeClass('selected');
        }

        // 移除驗證類
        $('#updateLocationModalForm').find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');

        // 清除隱藏的 location ID
        $('#updateLocationModalForm').removeAttr('data-location-id');
    });
}

/**
 * 打開更新位置彈窗
 */
function openUpdateLocationModal(locationId) {
    const url = window.editLocationUrl.replace(':id', locationId);

    // 从按钮或表格行获取location数据（如果可用，用于快速填充）
    let updateButton = $(`button[onclick*="openUpdateLocationModal(${locationId})"]`);
    if (updateButton.length === 0) {
        updateButton = $(`button[data-location-id="${locationId}"]`).first();
    }

    let locationData = null;

    if (updateButton.length > 0) {
        // 快速填充基本数据
        locationData = {
            id: locationId,
            zone_id: updateButton.attr('data-zone-id') || '',
            rack_id: updateButton.attr('data-rack-id') || '',
            location_status: updateButton.attr('data-location-status') || 'Available',
            zone_name: updateButton.attr('data-zone-name') || '',
            rack_number: updateButton.attr('data-rack-number') || ''
        };
        populateLocationModal(locationData);
    } else {
        // 如果找不到按钮，尝试从表格行获取
        const locationRow = $(`tr[data-location-id="${locationId}"]`);
        if (locationRow.length > 0) {
            locationData = {
                id: locationId,
                zone_id: locationRow.attr('data-zone-id') || '',
                rack_id: locationRow.attr('data-rack-id') || '',
                location_status: locationRow.attr('data-location-status') || 'Available',
                zone_name: locationRow.attr('data-zone-name') || '',
                rack_number: locationRow.attr('data-rack-number') || ''
            };
            populateLocationModal(locationData);
        }
    }

    // 从 API 获取完整location数据
    $.ajax({
        url: url,
        type: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        },
        success: (response) => {
            if (response.success && response.data) {
                populateLocationModal(response.data);
            } else {
                if (typeof window.showAlert === 'function') {
                    window.showAlert(response.message || 'Failed to load location data', 'error');
                } else {
                    alert(response.message || 'Failed to load location data');
                }
            }
        },
        error: (xhr) => {
            let errorMessage = 'Failed to load location data';
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
 * 填充 Location Update Modal 的數據
 */
function populateLocationModal(locationData) {

    // 設置隱藏的location ID（用於提交）
    const form = $('#updateLocationModalForm');
    form.attr('data-location-id', locationData.id);

    // 更新當前Location信息卡片
    const currentInfo = `
        <div class="mb-1">
            <i class="bi bi-geo-alt me-2 text-muted"></i>
            <span>Zone: <strong>${locationData.zone_name || 'N/A'}</strong></span>
        </div>
        <div class="mb-1">
            <i class="bi bi-box-seam me-2 text-muted"></i>
            <span>Rack: <strong>${locationData.rack_number || 'N/A'}</strong></span>
        </div>
        <div class="mb-1">
            <i class="bi bi-shield-check me-2 text-muted"></i>
            <span>Status: <strong>${locationData.location_status || 'N/A'}</strong></span>
        </div>
    `;
    $('#currentLocationInfo').html(currentInfo);

    // 填充 Zone 選項
    const zoneSelect = $('#update_zone_id');
    zoneSelect.empty();
    zoneSelect.append('<option value="">Select zone</option>');
    if (window.availableZones && Array.isArray(window.availableZones)) {
        window.availableZones.forEach(zone => {
            const selected = zone.id == locationData.zone_id ? 'selected' : '';
            zoneSelect.append(`<option value="${zone.id}" ${selected}>${zone.zone_name}</option>`);
        });
    }

    // 填充 Rack 選項
    const rackSelect = $('#update_rack_id');
    rackSelect.empty();
    rackSelect.append('<option value="">Select rack</option>');
    if (window.availableRacks && Array.isArray(window.availableRacks)) {
        window.availableRacks.forEach(rack => {
            const selected = rack.id == locationData.rack_id ? 'selected' : '';
            rackSelect.append(`<option value="${rack.id}" ${selected}>${rack.rack_number}</option>`);
        });
    }

    // 設置狀態（交給 status-management 初始化後，直接設置單選值）
    const targetStatus = locationData.location_status === 'Unavailable' ? 'Unavailable' : 'Available';
    const radioSelector = targetStatus === 'Available' ? '#update_status_available' : '#update_status_unavailable';
    $(radioSelector).prop('checked', true);

    // 初始化状态卡片（在打开 modal 前）
    if (typeof window.initializeStatusCardSelection === 'function') {
        window.initializeStatusCardSelection('location_status');
    }

    // 打開彈窗
    const modal = new bootstrap.Modal(document.getElementById('updateLocationModal'));
    modal.show();

    // 綁定提交事件（如果還沒綁定）
    if (!form.data('submit-bound')) {
        $('#submitUpdateLocationModal').off('click').on('click', function() {
            submitUpdateLocationModal();
        });
        form.data('submit-bound', true);
    }
}

/**
 * 提交更新位置彈窗
 */
function submitUpdateLocationModal() {
    const form = $('#updateLocationModalForm');
    const locationId = form.attr('data-location-id');

    if (!locationId) {
        if (typeof window.showAlert === 'function') {
            window.showAlert('Location ID not found', 'error');
        } else {
            alert('Location ID not found');
        }
        return;
    }

    // 驗證表單
    const zoneId = $('#update_zone_id').val();
    const rackId = $('#update_rack_id').val();
    const status = $('input[name="location_status"]:checked').val();

    if (!zoneId || !rackId || !status) {
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
    formData.append('zone_id', zoneId);
    formData.append('rack_id', rackId);
    formData.append('location_status', status);

    // 顯示加載狀態
    const submitBtn = $('#submitUpdateLocationModal');
    const originalText = submitBtn.html();
    submitBtn.html('<i class="bi bi-hourglass-split me-2"></i>Updating...');
    submitBtn.prop('disabled', true);

    // 提交更新請求
    updateLocation(locationId, formData,
        function(data) {
            if (typeof window.showAlert === 'function') {
                window.showAlert(data.message || 'Location updated successfully', 'success');
            } else {
                alert(data.message || 'Location updated successfully');
            }

            // 關閉 modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('updateLocationModal'));
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
                window.showAlert(error || 'Failed to update location', 'error');
            } else {
                alert(error || 'Failed to update location');
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
    const createLocationModal = document.getElementById('createLocationModal');

    if (dashboardCardsContainer) {
        // Dashboard 頁面
        initializeLocationDashboard();

        // 初始化 Create Location Modal
        if (createLocationModal) {
            initializeLocationCreateModal();
        }
    } else if (viewTable) {
        // View 頁面
        initializeLocationView();
    }
});

// =============================================================================
// 全局函數導出 (Global Function Exports)
// =============================================================================

// 導出主要函數到全局作用域（用於 HTML onclick 屬性）
window.editLocation = editLocation;
window.setLocationAvailable = setLocationAvailable;
window.setLocationUnavailable = setLocationUnavailable;
window.viewZoneDetails = viewZoneDetails;
window.openUpdateLocationModal = openUpdateLocationModal;
window.submitUpdateLocationModal = submitUpdateLocationModal;
