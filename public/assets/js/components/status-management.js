/**
 * 統一狀態卡片系統
 * 整合所有模組的狀態卡片選擇功能
 * 提供統一的狀態管理接口
 *
 * @author WMS Team
 * @version 3.0.0
 */

// =============================================================================
// 核心狀態卡片功能 (Core Status Card Functions)
// =============================================================================

/**
 * 狀態卡片選擇函數
 * @param {HTMLElement} card - 要選中的卡片元素
 * @param {string} fieldName - 字段名稱（如 'brand_status', 'category_status' 等）
 */
function selectStatusCard(card, fieldName) {
    // 移除所有卡片的選中狀態
    const allCards = document.querySelectorAll('.status-card');
    allCards.forEach(c => c.classList.remove('selected'));

    // 添加選中狀態到當前卡片
    card.classList.add('selected');

    // 更新對應的單選按鈕
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
    }
}

/**
 * 初始化狀態卡片選擇系統
 * @param {string} fieldName - 字段名稱（如 'brand_status', 'category_status' 等）
 */
function initializeStatusCardSelection(fieldName) {
    const statusCards = document.querySelectorAll('.status-card');
    const statusRadioInputs = document.querySelectorAll(`input[name="${fieldName}"]`);

    // 為每個狀態卡片添加點擊事件
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            selectStatusCard(this, fieldName);
        });
    });

    // 為單選按鈕添加變化事件
    statusRadioInputs.forEach(radio => {
        radio.addEventListener('change', function() {
            const card = this.closest('.status-card');
            if (card) {
                selectStatusCard(card, fieldName);
            }
        });
    });

    // 初始化選中狀態
    const checkedRadio = document.querySelector(`input[name="${fieldName}"]:checked`);
    if (checkedRadio) {
        const card = checkedRadio.closest('.status-card');
        if (card) {
            card.classList.add('selected');
        }
    }
}

// =============================================================================
// 模組特定初始化函數 (Module-Specific Initialization Functions)
// =============================================================================

/**
 * 品牌狀態卡片初始化
 */
function initializeBrandStatusCardSelection() {
    initializeStatusCardSelection('brand_status');
}

/**
 * 分類狀態卡片初始化
 */
function initializeCategoryStatusCardSelection() {
    initializeStatusCardSelection('category_status');
}

/**
 * 子分類狀態卡片初始化
 */
function initializeSubcategoryStatusCardSelection() {
    initializeStatusCardSelection('subcategory_status');
}

/**
 * 顏色狀態卡片初始化
 */
function initializeColorStatusCardSelection() {
    initializeStatusCardSelection('color_status');
}

/**
 * 性別狀態卡片初始化
 */
function initializeGenderStatusCardSelection() {
    initializeStatusCardSelection('gender_status');
}

/**
 * 尺碼庫狀態卡片初始化
 */
function initializeLibraryStatusCardSelection() {
    initializeStatusCardSelection('size_status');
}

/**
 * 模板狀態卡片初始化
 */
function initializeTemplateStatusCardSelection() {
    initializeStatusCardSelection('template_status');
}

/**
 * 貨架狀態卡片初始化
 */
function initializeRackStatusCardSelection() {
    initializeStatusCardSelection('rack_status');
}

/**
 * 映射狀態卡片初始化
 */
function initializeMappingStatusCardSelection() {
    initializeStatusCardSelection('mapping_status');
}

/**
 * 區域狀態卡片初始化
 */
function initializeZoneStatusCardSelection() {
    initializeStatusCardSelection('zone_status');
}

/**
 * 位置狀態卡片初始化
 */
function initializeLocationStatusCardSelection() {
    initializeStatusCardSelection('location_status');
}

/**
 * 产品狀態卡片初始化
 */
function initializeProductStatusCardSelection() {
    initializeStatusCardSelection('product_status');
}

/**
 * 用戶狀態卡片初始化
 */
function initializeAuthStatusCardSelection() {
    initializeStatusCardSelection('account_status');
}

// =============================================================================
// 狀態管理工具函數 (Status Management Utilities)
// =============================================================================

/**
 * 獲取狀態CSS類
 * @param {string} status 狀態
 * @returns {string} CSS類名
 */
function getStatusClass(status) {
    const statusMap = {
        'Available': 'available',
        'Unavailable': 'unavailable',
        'Active': 'active',
        'Inactive': 'inactive'
    };
    return statusMap[status] || 'default';
}

/**
 * 格式化狀態顯示
 * @param {string} status 狀態
 * @returns {string} 格式化後的狀態HTML
 */
function formatStatus(status) {
    const statusMap = {
        'Available': { class: 'bg-success', icon: 'bi-check-circle' },
        'Unavailable': { class: 'bg-danger', icon: 'bi-x-circle' },
        'Active': { class: 'bg-primary', icon: 'bi-play-circle' },
        'Inactive': { class: 'bg-secondary', icon: 'bi-pause-circle' }
    };

    const statusInfo = statusMap[status] || { class: 'bg-secondary', icon: 'bi-question-circle' };

    return `<span class="badge ${statusInfo.class} px-3 py-2">
        <i class="bi ${statusInfo.icon} me-1"></i>${status}
    </span>`;
}

/**
 * 批量初始化所有模組的狀態卡片
 * @param {Array} modules 要初始化的模組列表
 */
function initializeAllStatusCards(modules = []) {
    const moduleInitializers = {
        'brand': initializeBrandStatusCardSelection,
        'category': initializeCategoryStatusCardSelection,
        'subcategory': initializeSubcategoryStatusCardSelection,
        'color': initializeColorStatusCardSelection,
        'gender': initializeGenderStatusCardSelection,
        'library': initializeLibraryStatusCardSelection,
        'template': initializeTemplateStatusCardSelection,
        'rack': initializeRackStatusCardSelection,
        'mapping': initializeMappingStatusCardSelection,
        'zone': initializeZoneStatusCardSelection,
        'location': initializeLocationStatusCardSelection,
        'product': initializeProductStatusCardSelection,
        'auth': initializeAuthStatusCardSelection
    };

    modules.forEach(module => {
        if (moduleInitializers[module]) {
            moduleInitializers[module]();
        }
    });
}

// =============================================================================
// 全局函數暴露 (Global Function Exposure)
// =============================================================================

// 核心函數
window.selectStatusCard = selectStatusCard;
window.initializeStatusCardSelection = initializeStatusCardSelection;

// 模組特定函數
window.initializeBrandStatusCardSelection = initializeBrandStatusCardSelection;
window.initializeCategoryStatusCardSelection = initializeCategoryStatusCardSelection;
window.initializeSubcategoryStatusCardSelection = initializeSubcategoryStatusCardSelection;
window.initializeColorStatusCardSelection = initializeColorStatusCardSelection;
window.initializeGenderStatusCardSelection = initializeGenderStatusCardSelection;
window.initializeLibraryStatusCardSelection = initializeLibraryStatusCardSelection;
window.initializeTemplateStatusCardSelection = initializeTemplateStatusCardSelection;
window.initializeRackStatusCardSelection = initializeRackStatusCardSelection;
window.initializeMappingStatusCardSelection = initializeMappingStatusCardSelection;
window.initializeZoneStatusCardSelection = initializeZoneStatusCardSelection;
window.initializeLocationStatusCardSelection = initializeLocationStatusCardSelection;
window.initializeProductStatusCardSelection = initializeProductStatusCardSelection;
window.initializeAuthStatusCardSelection = initializeAuthStatusCardSelection;

// 工具函數
window.getStatusClass = getStatusClass;
window.formatStatus = formatStatus;
window.initializeAllStatusCards = initializeAllStatusCards;

// 創建統一的狀態系統對象
window.StatusSystem = {
    // 核心功能
    selectStatusCard,
    initializeStatusCardSelection,

    // 模組初始化
    initializeBrandStatusCardSelection,
    initializeCategoryStatusCardSelection,
    initializeSubcategoryStatusCardSelection,
    initializeColorStatusCardSelection,
    initializeGenderStatusCardSelection,
    initializeLibraryStatusCardSelection,
    initializeTemplateStatusCardSelection,
    initializeRackStatusCardSelection,
    initializeMappingStatusCardSelection,
    initializeZoneStatusCardSelection,
    initializeLocationStatusCardSelection,
    initializeProductStatusCardSelection,
    initializeAuthStatusCardSelection,

    // 工具函數
    getStatusClass,
    formatStatus,
    initializeAllStatusCards
};
