/**
 * Location Management JavaScript
 * 位置管理統一交互邏輯
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

// 位置列表數組（用於 Create 頁面）
let locationList = [];

// 排序狀態：true = 升序，false = 降序
let isAscending = false; // 默認降序（最新的在上面）

// 全局變量防止重複請求
let isDeleting = false;
let isUpdating = false; // 防止重複提交更新表單
let updateFormBound = false; // 標記更新表單事件是否已綁定

// =============================================================================
// 通用功能模塊 (Common Functions Module)
// =============================================================================

/**
 * 驗證位置表單
 */
function validateLocationForm() {
    const zoneSelect = document.getElementById('zone_id');
    const rackSelect = document.getElementById('rack_id');

    if (!zoneSelect || !zoneSelect.value) {
        window.showAlert('Please select a zone first', 'warning');
        if (zoneSelect) zoneSelect.focus();
        return false;
    }

    if (!rackSelect || !rackSelect.value) {
        window.showAlert('Please select a rack first', 'warning');
        if (rackSelect) rackSelect.focus();
        return false;
    }

    return true;
}

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

/**
 * 獲取位置狀態類別
 */
function getLocationStatusClass(status) {
    return status === 'Available' ? 'available' : 'unavailable';
}

/**
 * 檢查位置組合是否已存在
 */
function isLocationExists(zoneId, rackId) {
    return locationList.some(location =>
        location.zoneId === zoneId && location.rackId === rackId
    );
}

/**
 * 高亮顯示列表中已存在的位置組合
 */
function highlightExistingLocation(zoneId, rackId) {
    // 高亮輸入框
    const zoneSelect = document.getElementById('zone_id');
    const rackSelect = document.getElementById('rack_id');

    if (zoneSelect) {
        const zoneGroup = zoneSelect.closest('.input-group');
        if (zoneGroup) {
            zoneGroup.classList.add('duplicate-highlight');
            setTimeout(() => {
                zoneGroup.classList.remove('duplicate-highlight');
            }, 3000);
        }
    }

    if (rackSelect) {
        const rackGroup = rackSelect.closest('.input-group');
        if (rackGroup) {
            rackGroup.classList.add('duplicate-highlight');
            setTimeout(() => {
                rackGroup.classList.remove('duplicate-highlight');
            }, 3000);
        }
    }

    // 高亮列表中的重複項
    const existingLocations = document.querySelectorAll('.value-item');
    for (let item of existingLocations) {
        const itemZoneId = item.getAttribute('data-zone-id');
        const itemRackId = item.getAttribute('data-rack-id');
        if (itemZoneId === zoneId.toString() && itemRackId === rackId.toString()) {
            // 添加高亮樣式
            item.classList.add('border-warning');

            // 滾動到該元素
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 3秒後移除高亮
            setTimeout(() => {
                item.classList.remove('border-warning');
            }, 3000);
            break;
        }
    }
}

/**
 * 更新配置摘要
 */
function updateConfigSummary() {
    const zoneSelect = document.getElementById('zone_id');
    const rackSelect = document.getElementById('rack_id');
    const selectedZone = zoneSelect.value;
    const selectedRack = rackSelect.value;

    if (selectedZone && selectedRack) {
        const zoneText = zoneSelect.options[zoneSelect.selectedIndex].text;
        const rackText = rackSelect.options[rackSelect.selectedIndex].text;

        // 更新配置摘要
        const selectedZoneSpan = document.getElementById('selectedZone');
        const selectedRackSpan = document.getElementById('selectedRack');
        if (selectedZoneSpan) {
            selectedZoneSpan.textContent = zoneText;
        }
        if (selectedRackSpan) {
            selectedRackSpan.textContent = rackText;
        }

        // 顯示配置摘要
        const configSummary = document.getElementById('configSummary');
        if (configSummary) {
            configSummary.classList.remove('d-none');
        }
    }
}

/**
 * 更新位置計數
 */
function updateLocationValuesCount() {
    const count = locationList.length;

    // 更新右側計數徽章
    const countBadge = document.getElementById('locationValuesCount');
    if (countBadge) {
        countBadge.textContent = `${count} locations`;
    }
}

/**
 * 更新UI（通用）
 */
function updateUI(locationList = []) {
    updateLocationValuesCount();
}

/**
 * 顯示位置區域
 */
function showLocationValuesArea() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }

    // 顯示位置值區域
    const locationValuesArea = document.getElementById('locationValuesArea');
    if (locationValuesArea) {
        locationValuesArea.classList.remove('d-none');
    }

    // 顯示提交按鈕
    const submitSection = document.getElementById('submitSection');
    if (submitSection) {
        submitSection.classList.remove('d-none');
    }
}

/**
 * 隱藏所有區域
 */
function hideAllAreas() {
    // 隱藏位置值區域
    const locationValuesArea = document.getElementById('locationValuesArea');
    if (locationValuesArea) {
        locationValuesArea.classList.add('d-none');
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
 * 設置狀態卡片選擇
 */
function setupStatusCardSelection() {
    // 調用統一的狀態卡片初始化函數
    if (typeof window.initializeLocationStatusCardSelection === 'function') {
        window.initializeLocationStatusCardSelection();
    }
}

/**
 * 綁定位置事件
 */
function bindLocationEvents() {
    // 狀態卡片選擇
    setupStatusCardSelection();

    // 區域選擇變化
    const zoneSelect = document.getElementById('zone_id');
    if (zoneSelect) {
        zoneSelect.addEventListener('change', handleZoneChange);
    }

    // 貨架選擇變化
    const rackSelect = document.getElementById('rack_id');
    if (rackSelect) {
        rackSelect.addEventListener('change', handleRackChange);
    }
}

/**
 * 處理區域變化
 */
function handleZoneChange() {
    // 只更新UI状态，不改变右侧面板
    updateUI();
}

/**
 * 處理貨架變化
 */
function handleRackChange() {
    // 只更新UI状态，不改变右侧面板
    updateUI();
}

/**
 * 顯示位置輸入提示
 */
function showLocationInputPrompt() {
    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.classList.add('d-none');
    }
}

/**
 * 初始化位置頁面
 */
function initializeLocationPage(config) {
    // 綁定事件監聽器
    bindLocationEvents();

    // 初始化狀態
    if (config.locationList) {
        updateUI(config.locationList);
    }

    // 執行初始化回調函數（如果有）
    if (config && config.initializationCallback && typeof config.initializationCallback === 'function') {
        config.initializationCallback();
    }
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
        window.showAlert(decodeURIComponent(success), 'success');
        // 清除URL參數
        const url = new URL(window.location);
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url);
    }

    if (error) {
        window.showAlert(decodeURIComponent(error), 'danger');
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
            window.showAlert(data.message || 'Failed to load locations', 'error');
        }
    })
    .catch(error => {
        console.error('Error loading locations:', error);
        showAlert('Failed to load locations', 'error');
    });
}

/**
 * 渲染區域卡片
 */
function renderZoneCards(locations) {
    const container = document.getElementById('dashboard-cards-container');
    const emptyState = document.getElementById('empty-state');

    console.log('Locations Data:', locations);

    if (!locations || locations.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }

    emptyState.classList.add('d-none');

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

        console.log(`Rack ${index + 1}: ${rack.rack_number}, Status: ${status}`);

        return `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                <span class="fw-medium" style="cursor: pointer;" onclick="editLocation(${rack.location_id})" title="Click to edit location">${rack.rack_number}</span>
                <div class="d-flex align-items-center gap-4">
                    <span class="badge ${status === 'Available' ? 'bg-success' : 'bg-danger'} px-3 py-2">
                        <i class="bi ${status === 'Available' ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${status}
                    </span>
                    <button class="btn btn-sm ${status === 'Available' ? 'btn-outline-warning' : 'btn-outline-success'}"
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

/**
 * 綁定搜索事件
 */
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

/**
 * 綁定篩選事件
 */
function bindFilterEvents() {
    // 如果有篩選器，綁定篩選事件
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyFilters();
        });
    });
}

/**
 * 篩選位置
 */
function filterLocations(searchTerm) {
    // 實現搜索功能
    console.log('Searching for:', searchTerm);
    const cards = document.querySelectorAll('.content-card');
    cards.forEach(card => {
        const zoneName = card.querySelector('.card-title').textContent.toLowerCase();
        const shouldShow = zoneName.includes(searchTerm.toLowerCase());
        card.classList.toggle('d-none', !shouldShow);
    });
}

/**
 * 應用篩選器
 */
function applyFilters() {
    // 實現篩選功能
    console.log('Applying filters');
    const filterValue = document.getElementById('filter-select').value;
    // 這裡可以添加具體的篩選邏輯
}

/**
 * 綁定卡片事件
 */
function bindCardEvents() {
    // 綁定狀態切換按鈕事件
    document.querySelectorAll('.status-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

// =============================================================================
// Create 頁面功能 (Create Page Functions)
// =============================================================================

/**
 * 初始化位置創建頁面
 */
function initializeLocationCreate() {
    // 使用通用初始化函數
    initializeLocationPage({
        locationList: locationList,
        initializationCallback: function() {
            bindCreateEvents();
            updateUI(locationList);
        }
    });
}

/**
 * 綁定創建頁面事件
 */
function bindCreateEvents() {
    // 添加位置按鈕
    const addLocationBtn = document.getElementById('addLocation');
    if (addLocationBtn) {
        addLocationBtn.addEventListener('click', addLocation);
    }

    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // 排序按鈕
    const sortBtn = document.getElementById('sortLocations');
    if (sortBtn) {
        sortBtn.addEventListener('click', toggleSortOrder);
    }

    // 事件委托：刪除位置按鈕
    document.addEventListener('click', function(e) {
        if (e.target.closest('button[data-index]')) {
            const button = e.target.closest('button[data-index]');
            const index = parseInt(button.getAttribute('data-index'));
            if (!isNaN(index)) {
                removeLocation(index);
            }
        }
    });

    // 表單提交處理
    const form = document.getElementById('locationForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

/**
 * 添加位置
 */
function addLocation() {
    if (!validateLocationForm()) {
        return;
    }

    const zoneSelect = document.getElementById('zone_id');
    const rackSelect = document.getElementById('rack_id');

    const zoneId = zoneSelect.value;
    const rackId = rackSelect.value;

    // 檢查是否已存在
    if (isLocationExists(zoneId, rackId)) {
        window.showAlert('This location combination already exists in the list', 'error');
        highlightExistingLocation(zoneId, rackId);
        return;
    }

    // 添加位置到列表
    addLocationToList(zoneId, rackId);

    // 清空選擇
    zoneSelect.value = '';
    rackSelect.value = '';
    zoneSelect.focus();

    // 顯示成功添加的alert
    window.showAlert('Location added successfully', 'success');
}

/**
 * 添加位置到列表
 */
function addLocationToList(zoneId, rackId) {
    // 獲取區域和貨架信息
    const zoneSelect = document.getElementById('zone_id');
    const rackSelect = document.getElementById('rack_id');
    const zoneName = zoneSelect.options[zoneSelect.selectedIndex].text;
    const rackName = rackSelect.options[rackSelect.selectedIndex].text;

    // 添加到數組
    const location = {
        zoneId: zoneId,
        rackId: rackId,
        zoneName: zoneName,
        rackName: rackName
    };

    locationList.push(location);

    // 更新列表顯示
    updateLocationList();
    updateUI(locationList);

    // 顯示位置區域（第一次添加時）
    if (locationList.length === 1) {
        showLocationValuesArea();
    }
}

/**
 * 從列表中移除位置
 */
function removeLocation(index) {
    if (index >= 0 && index < locationList.length) {
        // 獲取要刪除的位置信息
        const locationToRemove = locationList[index];

        // 確認刪除
        if (!confirm(`Are you sure you want to remove location "${locationToRemove.zoneName} - ${locationToRemove.rackName}"?`)) {
            return;
        }

        locationList.splice(index, 1);
        updateLocationList();

        // 如果沒有位置了，隱藏區域
        if (locationList.length === 0) {
            hideAllAreas();
        }

        updateUI(locationList);
        window.showAlert('Location removed successfully', 'success');
    } else {
        window.showAlert('Failed to remove location', 'error');
    }
}

/**
 * 更新位置列表顯示
 */
function updateLocationList() {
    const locationListContainer = document.getElementById('locationValuesList');

    if (locationList.length === 0) {
        locationListContainer.innerHTML = '';
        return;
    }

    let html = '';
    locationList.forEach((location, index) => {
        const locationId = `location-${location.zoneId}-${location.rackId}`;

        // 檢查是否為重複項
        const isDuplicate = isLocationExists(location.zoneId, location.rackId) &&
            locationList.filter(i => i.zoneId === location.zoneId && i.rackId === location.rackId).length > 1;

        // 根據是否為重複項設置不同的樣式
        const baseClasses = 'value-item d-flex align-items-center justify-content-between p-3 mb-2 bg-light rounded border fade-in';
        const duplicateClasses = isDuplicate ? 'border-warning' : '';

        html += `
            <div class="${baseClasses} ${duplicateClasses}" data-zone-id="${location.zoneId}" data-rack-id="${location.rackId}" data-location-id="${locationId}">
                <div class="d-flex align-items-center">
                    <span class="badge ${isDuplicate ? 'bg-warning text-dark' : 'bg-primary'} me-3">${isDuplicate ? '⚠️' : (index + 1)}</span>
                    <i class="bi bi-geo-alt text-primary me-2"></i>
                    <div class="location-combination">
                        <span class="zone-badge fw-bold text-dark">${location.zoneName}</span>
                        <span class="text-muted mx-2">-</span>
                        <span class="rack-badge fw-bold text-dark">${location.rackName}</span>
                        ${isDuplicate ? '<span class="badge bg-warning text-dark ms-2 mt-1">Duplicate</span>' : ''}
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger" data-index="${index}">
                    <i class="bi bi-trash me-1"></i>Remove
                </button>
            </div>
        `;
    });

    locationListContainer.innerHTML = html;
}

/**
 * 排序位置值列表
 */
function sortLocationValuesList() {
    const locationValuesList = document.getElementById('locationValuesList');
    const items = Array.from(locationValuesList.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取位置組合並排序
    const locationValues = items.map(item => ({
        element: item,
        value: item.querySelector('.location-combination').textContent.trim()
    }));

    // 按字母順序排序
    locationValues.sort((a, b) => {
        if (isAscending) {
            return a.value.localeCompare(b.value);
        } else {
            return b.value.localeCompare(a.value);
        }
    });

    // 重新排列DOM元素
    locationValues.forEach(({ element }) => {
        locationValuesList.appendChild(element);
    });
}

/**
 * 清除表單
 */
function clearForm() {
    if (locationList.length === 0) {
        window.showAlert('No locations to clear', 'info');
        return;
    }

    if (confirm('Are you sure you want to clear all locations?')) {
        // 清空選擇
        const zoneSelect = document.getElementById('zone_id');
        const rackSelect = document.getElementById('rack_id');
        if (zoneSelect) {
            zoneSelect.value = '';
        }
        if (rackSelect) {
            rackSelect.value = '';
        }

        // 清空位置列表
        locationList = [];
        const locationListElement = document.getElementById('locationValuesList');
        if (locationListElement) {
            locationListElement.innerHTML = '';
        }

        // 隱藏所有區域
        hideAllAreas();

        // 更新UI
        updateUI(locationList);
        window.showAlert('All locations cleared', 'info');
    }
}

/**
 * 切換排序順序
 */
function toggleSortOrder() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    const sortBtn = document.getElementById('sortLocations');

    // 更新圖標
    if (isAscending) {
        sortIcon.className = 'bi bi-sort-up';
        sortBtn.title = 'Sort ascending (A-Z)';
    } else {
        sortIcon.className = 'bi bi-sort-down';
        sortBtn.title = 'Sort descending (Z-A)';
    }

    // 重新排序列表
    sortLocationList();
}

/**
 * 排序位置列表
 */
function sortLocationList() {
    const locationListContainer = document.getElementById('locationValuesList');
    const items = Array.from(locationListContainer.querySelectorAll('.value-item'));

    if (items.length <= 1) return;

    // 獲取位置信息並排序
    const locations = items.map(item => ({
        element: item,
        zoneName: item.querySelector('.zone-badge').textContent.trim(),
        rackName: item.querySelector('.rack-badge').textContent.trim()
    }));

    // 按區域和貨架名稱排序
    locations.sort((a, b) => {
        const aText = a.zoneName + ' - ' + a.rackName;
        const bText = b.zoneName + ' - ' + b.rackName;

        if (isAscending) {
            return aText.localeCompare(bText);
        } else {
            return bText.localeCompare(aText);
        }
    });

    // 重新排列DOM元素
    locations.forEach(({ element }) => {
        locationListContainer.appendChild(element);
    });
}

/**
 * 表單提交處理
 */
function handleFormSubmit(e) {
    e.preventDefault();

    if (locationList.length === 0) {
        window.showAlert('Please add at least one location', 'warning');
        return;
    }

    // 獲取狀態
    const statusRadio = document.querySelector('input[name="location_status"]:checked');
    const status = statusRadio ? statusRadio.value : 'Available';

    // 提交前再次檢查重複組合
    const duplicates = [];
    const seen = new Set();

    for (let i = 0; i < locationList.length; i++) {
        const location = locationList[i];
        const combination = `${location.zoneId}-${location.rackId}`;

        if (seen.has(combination)) {
            duplicates.push(`${location.zoneName} - ${location.rackName}`);
        } else {
            seen.add(combination);
        }
    }

    if (duplicates.length > 0) {
        window.showAlert('Duplicate combinations found. Please remove duplicates before submitting.', 'error');
        return;
    }

    // 準備提交數據
    const locations = locationList.map(item => ({
        zoneId: item.zoneId,
        rackId: item.rackId,
        locationStatus: status
    }));

    // 使用通用創建函數
    createLocation({ locations },
        function(data) {
            window.showAlert(data.message || 'Locations created successfully', 'success');
            setTimeout(() => {
                window.location.href = window.locationManagementRoute || '/admin/storage-locations/location';
            }, 2000);
        },
        function(error) {
            // 简化错误信息，类似 mapping 页面
            if (error && error.includes('Some locations failed to create')) {
                window.showAlert('Some locations failed to create', 'error');
            } else {
                window.showAlert(error || 'Failed to create locations', 'error');
            }
        }
    );
}

// =============================================================================
// Update 頁面功能 (Update Page Functions)
// =============================================================================

/**
 * 初始化位置更新頁面
 */
function initializeLocationUpdate() {
    // 綁定事件
    bindEvents();
}

/**
 * 綁定更新頁面事件
 */
function bindEvents() {
    // 表單提交事件 - 確保只綁定一次
    if (!updateFormBound) {
        const form = document.getElementById('updateLocationForm');
        if (form) {
            form.addEventListener('submit', handleUpdateFormSubmit);
            updateFormBound = true; // 標記已綁定
        }
    }

    // 區域選擇變化事件 - 使用 once 選項確保只觸發一次，或檢查是否已綁定
    const zoneSelect = document.getElementById('zone_id');
    if (zoneSelect && !zoneSelect.hasAttribute('data-change-bound')) {
        zoneSelect.addEventListener('change', updateZoneInfo);
        zoneSelect.setAttribute('data-change-bound', 'true');
    }

    // 綁定狀態卡片事件
    setupStatusCardSelection();
}

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

    // 獲取當前位置ID
    const locationId = window.location.pathname.split('/').pop();

    // 使用通用函數提交
    handleLocationRequest(
        window.updateLocationUrl,
        'POST',
        formData,
        function(data) {
            // 使用後端返回的消息，如果沒有則使用默認消息
            const message = data.message || 'Location updated successfully';
            window.showAlert(message, 'success');
            setTimeout(() => {
                window.location.href = window.locationManagementRoute;
            }, 1500);
        },
        function(error) {
            isUpdating = false; // 錯誤時重置標誌
            showAlert('Failed to update location', 'error');
        }
    );

    return false; // 防止表單默認提交
}

/**
 * 更新區域信息
 */
function updateZoneInfo() {
    // 更新區域信息顯示
    const zoneSelect = document.getElementById('zone_id');
    if (zoneSelect) {
        const selectedOption = zoneSelect.options[zoneSelect.selectedIndex];
        const zoneName = selectedOption.text;

        // 更新顯示
        const zoneDisplay = document.querySelector('#selectedZone');
        if (zoneDisplay) {
            zoneDisplay.textContent = zoneName;
        }
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

    // 初始化狀態
    updateViewUI();
}

/**
 * 綁定查看頁面事件
 */
function bindViewEvents() {
    // 刪除按鈕事件 - 使用事件委託避免重複綁定
    document.addEventListener('click', function(e) {
        if (e.target.closest('button[data-location-id]')) {
            const button = e.target.closest('button[data-location-id]');
            const locationId = button.getAttribute('data-location-id');
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
            window.showAlert('Location deleted successfully', 'success');

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
            showAlert('Failed to delete location', 'error');
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
        showAlert('Failed to delete location', 'error');
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

    // 如果沒有資料行了，跳轉回 index
    if (dataRows.length === 0) {
        window.showAlert('All locations have been deleted. Redirecting to location list...', 'info');

        // 延遲跳轉，讓用戶看到提示信息
        setTimeout(() => {
            window.location.href = window.locationManagementRoute;
        }, 1500);
    }
}

// =============================================================================
// 位置操作函數 (Location Operations)
// =============================================================================

/**
 * 切換位置狀態
 */
function toggleLocationStatus(id, currentStatus) {
    // 切換位置狀態
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    updateLocationStatus(id, newStatus);
}

/**
 * 設置位置為可用
 */
function setLocationAvailable(id) {
    // 設置位置為可用
    updateLocationStatus(id, 'Available');
}

/**
 * 設置位置為不可用
 */
function setLocationUnavailable(id) {
    // 設置位置為不可用
    updateLocationStatus(id, 'Unavailable');
}

/**
 * 更新位置狀態
 */
function updateLocationStatus(id, status) {
    const url = status === 'Available' ?
        window.availableLocationUrl.replace(':id', id) :
        window.unavailableLocationUrl.replace(':id', id);

    console.log('Updating location status:', { id, status, url });

    // 顯示加載提示
    window.showAlert('Updating location status...', 'info');

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
            window.showAlert(`Location status updated to ${status.toLowerCase()} successfully!`, 'success');
            loadLocations(); // 重新加載數據
        } else {
            showAlert('Failed to update location status', 'error');
        }
    })
    .catch(error => {
        console.error(`Error setting location to ${status.toLowerCase()}:`, error);
        showAlert('Failed to update location status', 'error');
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
 * 編輯位置
 */
function editLocation(locationId) {
    // 跳轉到單個位置的edit頁面
    const url = window.editLocationUrl.replace(':id', locationId);
    window.location.href = url;
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
    const locationForm = document.getElementById('locationForm');
    const updateLocationForm = document.getElementById('updateLocationForm');
    const viewTable = document.querySelector('table tbody');

    if (dashboardCardsContainer) {
        // Dashboard 頁面
        initializeLocationDashboard();
    } else if (locationForm) {
        // Create 頁面
        initializeLocationCreate();
    } else if (updateLocationForm) {
        // Update 頁面
        initializeLocationUpdate();
    } else if (viewTable) {
        // View 頁面
        initializeLocationView();
    }
});

// =============================================================================
// 全局實例初始化 (Global Instance Initialization)
// =============================================================================

// 導出函數供全局使用
window.editLocation = editLocation;
window.deleteLocation = deleteLocation;
window.toggleLocationStatus = toggleLocationStatus;
window.setLocationAvailable = setLocationAvailable;
window.setLocationUnavailable = setLocationUnavailable;
window.updateLocationStatus = updateLocationStatus;
window.viewZoneDetails = viewZoneDetails;
