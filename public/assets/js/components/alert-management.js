/**
 * 统一的 Alert 系统
 * Unified Alert System
 *
 * 提供统一的提示消息样式和功能
 * 所有页面都可以使用这个统一的 alert 系统
 *
 * @author WMS Team
 * @version 3.0.0
 */

// 防止重复显示的机制
const alertHistory = {
    messages: new Set(),
    lastMessage: null,
    lastMessageTime: 0,
    DEBOUNCE_TIME: 1000 // 1秒内相同的消息不重复显示
};

/**
 * 检查消息是否有效且不重复
 * @param {string} message - 消息内容
 * @returns {boolean}
 */
function isValidMessage(message) {
    // 检查消息是否为空、null、undefined 或只包含空白字符
    if (!message || typeof message !== 'string' || message.trim() === '') {
        return false;
    }

    // 检查是否在防抖时间内重复
    const now = Date.now();
    const trimmedMessage = message.trim();

    if (alertHistory.lastMessage === trimmedMessage &&
        (now - alertHistory.lastMessageTime) < alertHistory.DEBOUNCE_TIME) {
        return false;
    }

    return true;
}

/**
 * 显示提示消息
 * @param {string} message - 提示消息内容
 * @param {string} type - 提示类型: 'success', 'info', 'warning', 'danger', 'error'
 * @param {Object} options - 配置选项
 */
function showAlert(message, type = 'info', options = {}) {
    // 验证消息有效性
    if (!isValidMessage(message)) {
        return;
    }

    const defaultOptions = {
        container: 'globalAlertContainer', // 默认使用全局容器
        duration: 4000,
        dismissible: true,
        animation: true,
        position: 'header' // 默认在header位置显示
    };

    const config = { ...defaultOptions, ...options };

    // 记录消息和时间，防止重复
    const trimmedMessage = message.trim();
    alertHistory.lastMessage = trimmedMessage;
    alertHistory.lastMessageTime = Date.now();

    // 清理历史记录（保留最近50条）
    if (alertHistory.messages.size > 50) {
        const firstMessage = Array.from(alertHistory.messages)[0];
        alertHistory.messages.delete(firstMessage);
    }
    alertHistory.messages.add(trimmedMessage);

    // 创建 alert 元素
    const alertElement = createAlertElement(trimmedMessage, type, config);

    // 根据位置选择显示方式
    if (config.position === 'header' || config.container === 'globalAlertContainer') {
        showGlobalAlert(alertElement);
    } else {
        // 显示内联 alert（兼容旧代码）
        showInlineAlert(alertElement, config.container);
    }

    // 自动隐藏
    if (config.duration > 0) {
        setTimeout(() => {
            hideAlert(alertElement, config.animation);
        }, config.duration);
    }
}

/**
 * 创建 alert 元素
 */
function createAlertElement(message, type, config) {
    const alertClass = getAlertClass(type);
    const iconClass = getIconClass(type);
    const dismissButton = config.dismissible ? `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>` : '';

    // 使用卡片样式让alert更美观
    const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade shadow-sm border-0 mb-2" role="alert" style="border-radius: 0.75rem;">
            <div class="d-flex align-items-center">
                <i class="bi ${iconClass} me-3 fs-5"></i>
                <div class="flex-grow-1">${message}</div>
                ${dismissButton}
            </div>
        </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = alertHtml.trim();
    const alertElement = div.firstChild;

    // 添加动画类
    alertElement.style.opacity = '0';
    alertElement.style.transform = 'translateY(-20px)';
    alertElement.style.transition = 'all 0.3s ease';

    return alertElement;
}

/**
 * 获取 alert 样式类
 */
function getAlertClass(type) {
    const classMap = {
        'success': 'alert-success',
        'info': 'alert-info',
        'warning': 'alert-warning',
        'danger': 'alert-danger',
        'error': 'alert-danger' // 'error' 映射到 'danger' 样式
    };
    return classMap[type] || 'alert-info';
}

/**
 * 获取图标类
 */
function getIconClass(type) {
    const iconMap = {
        'success': 'bi-check-circle-fill',
        'info': 'bi-info-circle-fill',
        'warning': 'bi-exclamation-triangle-fill',
        'danger': 'bi-exclamation-triangle-fill',
        'error': 'bi-exclamation-triangle-fill'
    };
    return iconMap[type] || 'bi-info-circle-fill';
}

/**
 * 显示全局 alert（在header位置）
 */
function showGlobalAlert(alertElement) {
    const container = document.getElementById('globalAlertContainer');

    if (!container) {
        // 如果全局容器不存在，回退到页面内联显示
        console.warn('Global alert container not found. Falling back to inline alert.');
        const fallbackContainer = document.getElementById('alertContainer');
        if (fallbackContainer) {
            showInlineAlert(alertElement, 'alertContainer');
        } else {
            console.error('No alert container found.');
        }
        return;
    }

    // 清除现有 alert
    const existingAlerts = container.querySelectorAll('.alert');
    existingAlerts.forEach(alert => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-20px)';
        setTimeout(() => alert.remove(), 300);
    });

    // 添加新 alert（延迟添加以确保动画效果）
    setTimeout(() => {
        container.appendChild(alertElement);
        // 触发显示动画
        setTimeout(() => {
            alertElement.classList.add('show');
            alertElement.style.opacity = '1';
            alertElement.style.transform = 'translateY(0)';
        }, 10);
    }, existingAlerts.length > 0 ? 300 : 0);
}

/**
 * 显示内联 alert
 */
function showInlineAlert(alertElement, containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.warn(`Alert container with ID '${containerId}' not found. Please ensure the container exists in your HTML.`);
        return;
    }

    // 清除现有 alert
    const existingAlerts = container.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    // 添加新 alert
    container.appendChild(alertElement);
}


/**
 * 隐藏 alert
 */
function hideAlert(alertElement, animation = true) {
    if (animation) {
        // 触发淡出动画
        alertElement.style.opacity = '0';
        alertElement.style.transform = 'translateY(-20px)';

        // 等待动画完成后移除
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.parentNode.removeChild(alertElement);
            }
        }, 300);
    } else {
        if (alertElement.parentNode) {
            alertElement.parentNode.removeChild(alertElement);
        }
    }
}

/**
 * 清除所有 alert
 */
function clearAllAlerts() {
    // 清除全局容器
    const globalContainer = document.getElementById('globalAlertContainer');
    if (globalContainer) {
        globalContainer.innerHTML = '';
    }

    // 清除页面内联容器（兼容旧代码）
    const inlineContainer = document.getElementById('alertContainer');
    if (inlineContainer) {
        inlineContainer.innerHTML = '';
    }
}

/**
 * 便捷方法：显示成功消息
 */
function showSuccess(message, options = {}) {
    showAlert(message, 'success', options);
}

/**
 * 便捷方法：显示错误消息
 */
function showError(message, options = {}) {
    showAlert(message, 'error', options);
}

/**
 * 便捷方法：显示警告消息
 */
function showWarning(message, options = {}) {
    showAlert(message, 'warning', options);
}

/**
 * 便捷方法：显示信息消息
 */
function showInfo(message, options = {}) {
    showAlert(message, 'info', options);
}

/**
 * 安全的 alert 包装函数（用于向后兼容）
 * 确保不会显示空内容或重复的 alert
 * @param {string} message - 消息内容
 */
function safeAlert(message) {
    // 验证消息有效性
    if (!message || typeof message !== 'string' || message.trim() === '') {
        return;
    }

    const trimmedMessage = message.trim();

    // 检查是否在防抖时间内重复
    const now = Date.now();
    if (alertHistory.lastMessage === trimmedMessage &&
        (now - alertHistory.lastMessageTime) < alertHistory.DEBOUNCE_TIME) {
        return;
    }

    // 记录消息
    alertHistory.lastMessage = trimmedMessage;
    alertHistory.lastMessageTime = now;

    // 显示 alert
    alert(trimmedMessage);
}

// 將函數暴露到全局 window 對象
window.showAlert = showAlert;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;
window.safeAlert = safeAlert;
