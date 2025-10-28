/**
 * 統一角色管理系統
 * 整合所有模組的角色卡片選擇功能
 * 提供統一的角色管理接口
 *
 * @author WMS Team
 * @version 1.0.0
 */

// =============================================================================
// 核心角色卡片功能 (Core Role Card Functions)
// =============================================================================

/**
 * 角色卡片選擇函數
 * @param {HTMLElement} card - 要選中的卡片元素
 * @param {string} fieldName - 字段名稱（如 'account_role' 等）
 */
function selectRoleCard(card, fieldName) {
    // 移除所有卡片的選中狀態
    const allCards = document.querySelectorAll('.role-card');
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
 * 初始化角色卡片選擇系統
 * @param {string} fieldName - 字段名稱（如 'account_role' 等）
 */
function initializeRoleCardSelection(fieldName) {
    const roleCards = document.querySelectorAll('.role-card');
    const roleRadioInputs = document.querySelectorAll(`input[name="${fieldName}"]`);

    // 為每個角色卡片添加點擊事件
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            selectRoleCard(this, fieldName);
        });
    });

    // 為單選按鈕添加變化事件
    roleRadioInputs.forEach(radio => {
        radio.addEventListener('change', function() {
            const card = this.closest('.role-card');
            if (card) {
                selectRoleCard(card, fieldName);
            }
        });
    });

    // 初始化選中狀態
    const checkedRadio = document.querySelector(`input[name="${fieldName}"]:checked`);
    if (checkedRadio) {
        const card = checkedRadio.closest('.role-card');
        if (card) {
            card.classList.add('selected');
        }
    }
}

// =============================================================================
// 模組特定初始化函數 (Module-Specific Initialization Functions)
// =============================================================================

/**
 * 賬戶角色卡片初始化
 */
function initializeAuthRoleCardSelection() {
    initializeRoleCardSelection('account_role');
}

/**
 * 用戶角色卡片初始化
 */
function initializeUserRoleCardSelection() {
    initializeRoleCardSelection('user_role');
}

// =============================================================================
// 角色管理工具函數 (Role Management Utilities)
// =============================================================================

/**
 * 獲取角色CSS類
 * @param {string} role 角色
 * @returns {string} CSS類名
 */
function getRoleClass(role) {
    const roleMap = {
        'Staff': 'staff',
        'Admin': 'admin',
        'SuperAdmin': 'super-admin'
    };
    return roleMap[role] || 'default';
}

/**
 * 格式化角色顯示
 * @param {string} role 角色
 * @returns {string} 格式化後的角色HTML
 */
function formatRole(role) {
    const roleMap = {
        'Staff': { class: 'bg-success', icon: 'bi-person-badge' },
        'Admin': { class: 'bg-warning', icon: 'bi-shield-check' },
        'SuperAdmin': { class: 'bg-danger', icon: 'bi-person-fill-gear' }
    };

    const roleInfo = roleMap[role] || { class: 'bg-secondary', icon: 'bi-question-circle' };

    return `<span class="badge ${roleInfo.class} px-3 py-2">
        <i class="bi ${roleInfo.icon} me-1"></i>${role}
    </span>`;
}

/**
 * 批量初始化所有模組的角色卡片
 * @param {Array} modules 要初始化的模組列表
 */
function initializeAllRoleCards(modules = []) {
    const moduleInitializers = {
        'auth': initializeAuthRoleCardSelection,
        'user': initializeUserRoleCardSelection
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
window.selectRoleCard = selectRoleCard;
window.initializeRoleCardSelection = initializeRoleCardSelection;

// 模組特定函數
window.initializeAuthRoleCardSelection = initializeAuthRoleCardSelection;
window.initializeUserRoleCardSelection = initializeUserRoleCardSelection;

// 工具函數
window.getRoleClass = getRoleClass;
window.formatRole = formatRole;
window.initializeAllRoleCards = initializeAllRoleCards;

// 創建統一的角色系統對象
window.RoleSystem = {
    // 核心功能
    selectRoleCard,
    initializeRoleCardSelection,

    // 模組初始化
    initializeAuthRoleCardSelection,
    initializeUserRoleCardSelection,

    // 工具函數
    getRoleClass,
    formatRole,
    initializeAllRoleCards
};

