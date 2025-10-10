/**
 * 统一的 Alert 系统
 * Unified Alert System
 *
 * 提供统一的提示消息样式和功能
 * 所有页面都可以使用这个统一的 alert 系统
 */

/**
 * 显示提示消息
 * @param {string} message - 提示消息内容
 * @param {string} type - 提示类型: 'success', 'info', 'warning', 'danger', 'error'
 * @param {Object} options - 配置选项
 */
function showAlert(message, type = 'info', options = {}) {
    const defaultOptions = {
        container: 'alertContainer',
        duration: 3000,
        dismissible: true,
        animation: true
    };

    const config = { ...defaultOptions, ...options };

    // 创建 alert 元素
    const alertElement = createAlertElement(message, type, config);

    // 显示内联 alert
    showInlineAlert(alertElement, config.container);

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

    const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="bi ${iconClass} me-2"></i>
            ${message}
            ${dismissButton}
        </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = alertHtml.trim();
    return div.firstChild;
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
        // 使用与 size template 相同的方式
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.parentNode.removeChild(alertElement);
            }
        }, 150);
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
    const container = document.getElementById('alertContainer');
    if (container) {
        container.innerHTML = '';
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

// 將函數暴露到全局 window 對象
window.showAlert = showAlert;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;
