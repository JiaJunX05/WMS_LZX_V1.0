/**
 * Common Update Page JavaScript Functions
 * 通用更新页面交互逻辑
 */

/**
 * 通用状态卡片选择函数
 */
function selectStatusCard(card) {
    // 移除所有卡片的选中状态
    document.querySelectorAll('.status-card').forEach(c => {
        c.classList.remove('selected');
    });

    // 添加选中状态到当前卡片
    card.classList.add('selected');

    // 更新对应的radio按钮
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
    }
}

/**
 * 通用表单提交处理函数
 * @param {Event} e - 表单提交事件
 * @param {string} updateUrl - 更新URL
 * @param {string} redirectRoute - 重定向路由
 * @param {string} successMessage - 成功消息
 * @param {string} errorMessage - 错误消息
 * @param {string} warningMessage - 警告消息
 */
function handleUpdateFormSubmit(e, updateUrl, redirectRoute, successMessage, errorMessage, warningMessage) {
    e.preventDefault();

    const formData = new FormData(e.target);
    formData.append('_method', 'PUT');

    fetch(updateUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 422) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Validation failed');
                });
            }
            throw new Error(`Network response was not ok (${response.status})`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showAlert(data.message || successMessage, 'success');
            setTimeout(() => {
                window.location.href = redirectRoute;
            }, 1500);
        } else {
            showAlert(data.message || errorMessage, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (error.message.includes('already exists') || error.message.includes('combination')) {
            showAlert(warningMessage, 'warning');
        } else {
            showAlert(errorMessage + ': ' + error.message, 'error');
        }
    });
}

/**
 * 通用UI更新函数
 */
function updateUI() {
    // 更新统计信息
    updateStatistics();
}

/**
 * 通用统计信息更新函数
 */
function updateStatistics() {
    // 更新统计信息
    const availableCount = document.querySelectorAll('.badge.bg-success').length;
    const unavailableCount = document.querySelectorAll('.badge.bg-danger').length;

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
 * 通用事件绑定函数
 * @param {string} formId - 表单ID
 * @param {string} updateUrl - 更新URL
 * @param {string} redirectRoute - 重定向路由
 * @param {string} successMessage - 成功消息
 * @param {string} errorMessage - 错误消息
 * @param {string} warningMessage - 警告消息
 * @param {Array} additionalSelectors - 额外的选择器配置
 */
function bindUpdateEvents(formId, updateUrl, redirectRoute, successMessage, errorMessage, warningMessage, additionalSelectors = []) {
    // 状态卡片选择 - 使用 label 包装，自动处理点击
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        // 监听 radio 按钮变化
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
            radio.addEventListener('change', function() {
                selectStatusCard(card);
            });
        }
    });

    // 表单提交
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', function(e) {
            handleUpdateFormSubmit(e, updateUrl, redirectRoute, successMessage, errorMessage, warningMessage);
        });
    }

    // 绑定额外的选择器事件
    additionalSelectors.forEach(selector => {
        const element = document.getElementById(selector.id);
        if (element && selector.event && selector.handler) {
            element.addEventListener(selector.event, selector.handler);
        }
    });
}

/**
 * 通用初始化函数
 * @param {Object} config - 配置对象
 * @param {string} config.formId - 表单ID
 * @param {string} config.updateUrl - 更新URL
 * @param {string} config.redirectRoute - 重定向路由
 * @param {string} config.successMessage - 成功消息
 * @param {string} config.errorMessage - 错误消息
 * @param {string} config.warningMessage - 警告消息
 * @param {Array} config.additionalSelectors - 额外的选择器配置
 * @param {Function} config.initializationCallback - 初始化回调函数
 */
function initializeUpdatePage(config) {
    // 绑定事件监听器
    bindUpdateEvents(
        config.formId,
        config.updateUrl,
        config.redirectRoute,
        config.successMessage,
        config.errorMessage,
        config.warningMessage,
        config.additionalSelectors || []
    );

    // 初始化状态
    updateUI();

    // 执行初始化回调函数（如果有）
    if (config.initializationCallback && typeof config.initializationCallback === 'function') {
        config.initializationCallback();
    }
}
