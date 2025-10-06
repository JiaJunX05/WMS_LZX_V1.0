/**
 * Template View Page JavaScript
 * 尺碼模板查看頁面交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁面
    initializeTemplateView();
});

function initializeTemplateView() {
    // 綁定事件監聽器
    bindEvents();

    // 初始化狀態
    updateUI();
}

function bindEvents() {
    // 刪除按鈕事件
    const deleteButtons = document.querySelectorAll('[onclick*="deleteTemplate"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const templateId = this.getAttribute('onclick').match(/\d+/)[0];
            const sizeValue = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            deleteTemplate(templateId, sizeValue);
        });
    });
}

function updateUI() {
    // 更新統計信息
    updateStatistics();

    // 更新表格狀態
    updateTableStatus();
}

function updateStatistics() {
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

function updateTableStatus() {
    // 更新表格行的狀態
    const tableRows = document.querySelectorAll('.data-table tbody tr');
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

// 全局變量防止重複請求
let isDeleting = false;

// 刪除模板函數
function deleteTemplate(templateId, sizeValue) {
    if (!confirm(`Are you sure you want to delete template "${sizeValue}"?`)) {
        return;
    }

    // 防止重複請求
    if (isDeleting) {
        return;
    }

    isDeleting = true;

    // 顯示加載狀態
    const deleteButton = document.querySelector(`[onclick*="deleteTemplate(${templateId}"]`);
    if (deleteButton) {
        // 檢查按鈕是否已經被禁用（防止重複點擊）
        if (deleteButton.disabled) {
            return;
        }

        const originalText = deleteButton.innerHTML;
        deleteButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Deleting...';
        deleteButton.disabled = true;
    }

    // 使用通用刪除函數
    deleteTemplate(templateId,
        function(data) {
            showAlert('Template deleted successfully', 'success');

            // 刪除成功後，從頁面中移除該行
            const deletedRow = document.querySelector(`[onclick*="deleteTemplate(${templateId}"]`).closest('tr');
            if (deletedRow) {
                deletedRow.remove();
            }

            // 更新統計信息
            updateStatistics();

            // 檢查是否還有數據，如果沒有數據了才跳轉到列表頁面
            const remainingRows = document.querySelectorAll('.data-table tbody tr, .table tbody tr');
            if (remainingRows.length === 0) {
                setTimeout(() => {
                    window.location.href = window.templateManagementRoute;
                }, 1500);
            }
        },
        function(error) {
            showAlert(error || 'Failed to delete template', 'error');
        }
    );

    // 重置刪除狀態
    setTimeout(() => {
        isDeleting = false;

        // 恢復按鈕狀態
        if (deleteButton) {
            deleteButton.innerHTML = '<i class="bi bi-trash me-2"></i>Delete';
            deleteButton.disabled = false;
        }
    }, 1000);
}
