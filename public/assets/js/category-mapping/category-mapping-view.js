/**
 * Category Mapping View Page JavaScript
 * 分类映射查看页面交互逻辑
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeMappingView();
});

function initializeMappingView() {
    // 绑定事件监听器
    bindEvents();

    // 初始化状态
    updateUI();
}

function bindEvents() {
    // 删除按钮事件
    const deleteButtons = document.querySelectorAll('[onclick*="deleteMapping"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const mappingId = this.getAttribute('onclick').match(/\d+/)[0];
            const categoryName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            const subcategoryName = this.getAttribute('onclick').match(/'([^']+)'/)[2];
            deleteMapping(mappingId, categoryName, subcategoryName);
        });
    });
}

function updateUI() {
    // 更新统计信息
    updateStatistics();

    // 更新表格状态
    updateTableStatus();
}

function updateStatistics() {
    // 获取可用和不可用的数量
    const availableCount = document.querySelectorAll('.badge.bg-success').length;
    const unavailableCount = document.querySelectorAll('.badge.bg-danger').length;

    // 更新统计显示
    const availableElement = document.getElementById('availableCount');
    const unavailableElement = document.getElementById('unavailableCount');

    if (availableElement) {
        availableElement.textContent = availableCount;
    }

    if (unavailableElement) {
        unavailableElement.textContent = unavailableCount;
    }
}

function updateTableStatus() {
    // 更新表格行的状态
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach((row, index) => {
        // 添加悬停效果
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f9fafb';
        });

        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
    });
}

// 全局变量防止重复请求
let isDeleting = false;

// 删除映射函数
function deleteMapping(mappingId, categoryName, subcategoryName) {
    if (!confirm(`Are you sure you want to delete mapping "${categoryName} - ${subcategoryName}"?`)) {
        return;
    }

    // 防止重复请求
    if (isDeleting) {
        return;
    }

    isDeleting = true;

    // 显示加载状态
    const deleteButton = document.querySelector(`[onclick*="deleteMapping(${mappingId}"]`);
    if (deleteButton) {
        // 检查按钮是否已经被禁用（防止重复点击）
        if (deleteButton.disabled) {
            return;
        }

        const originalText = deleteButton.innerHTML;
        deleteButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Deleting...';
        deleteButton.disabled = true;
    }

    // 发送删除请求
    const deleteUrl = window.deleteMappingUrl.replace(':id', mappingId);

    // 验证 URL 是否正确生成
    if (deleteUrl.includes(':id')) {
        showAlert('Error: Invalid delete URL', 'error');
        return;
    }

    if (!deleteUrl.includes('/delete')) {
        showAlert('Error: Invalid delete URL format', 'error');
        return;
    }

    fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 检查响应内容类型
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            // 如果不是 JSON，尝试解析为文本
            return response.text().then(text => {
                // 如果响应是重定向或成功页面，认为删除成功
                if (response.status === 200 || response.status === 302) {
                    return { success: true, message: 'Mapping deleted successfully' };
                }
                throw new Error('Unexpected response format');
            });
        }
    })
    .then(data => {
        if (data.success) {
            showAlert('Mapping deleted successfully', 'success');

            // 删除成功后，从页面中移除该行
            const deletedRow = document.querySelector(`[onclick*="deleteMapping(${mappingId}"]`).closest('tr');
            if (deletedRow) {
                deletedRow.remove();
            }

            // 更新统计信息
            updateStatistics();

            // 检查是否还有数据，如果没有数据了才跳转到列表页面
            const remainingRows = document.querySelectorAll('tbody tr');
            if (remainingRows.length === 0) {
                setTimeout(() => {
                    window.location.href = window.mappingManagementRoute;
                }, 1500);
            }
        } else {
            showAlert(data.message || 'Failed to delete mapping', 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting mapping:', error);
        // 如果状态码是 200 或 302，可能删除成功了
        if (error.message.includes('200') || error.message.includes('302')) {
            showAlert('Mapping deleted successfully', 'success');

            // 删除成功后，从页面中移除该行
            const deletedRow = document.querySelector(`[onclick*="deleteMapping(${mappingId}"]`).closest('tr');
            if (deletedRow) {
                deletedRow.remove();
            }

            // 更新统计信息
            updateStatistics();

            // 检查是否还有数据，如果没有数据了才跳转到列表页面
            const remainingRows = document.querySelectorAll('tbody tr');
            if (remainingRows.length === 0) {
                setTimeout(() => {
                    window.location.href = window.mappingManagementRoute;
                }, 1500);
            }
        } else {
            showAlert('An error occurred while deleting the mapping: ' + error.message, 'error');
        }
    })
    .finally(() => {
        // 重置删除状态
        isDeleting = false;

        // 恢复按钮状态
        if (deleteButton) {
            deleteButton.innerHTML = '<i class="bi bi-trash me-2"></i>Delete';
            deleteButton.disabled = false;
        }
    });
}

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用

// 工具函数
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
