/**
 * Mapping View Page JavaScript
 * 映射查看頁面交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁面
    initializeMappingView();
});

function initializeMappingView() {
    // 綁定事件監聽器
    bindEvents();

    // 初始化狀態
    updateUI();
}

function bindEvents() {
    // 刪除按鈕事件
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

// 全局變量防止重複請求
let isDeleting = false;

// 刪除映射函數
function deleteMapping(mappingId, categoryName, subcategoryName) {
    if (!confirm(`Are you sure you want to delete mapping "${categoryName} - ${subcategoryName}"?`)) {
        return;
    }

    // 防止重複請求
    if (isDeleting) {
        return;
    }

    isDeleting = true;

    // 顯示加載狀態
    const deleteButton = document.querySelector(`[onclick*="deleteMapping(${mappingId}"]`);
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
    deleteMapping(mappingId,
        function(data) {
            showAlert('Mapping deleted successfully', 'success');

            // 刪除成功後，從頁面中移除該行
            const deletedRow = document.querySelector(`[onclick*="deleteMapping(${mappingId}"]`).closest('tr');
            if (deletedRow) {
                deletedRow.remove();
            }

            // 更新統計信息
            updateStatistics();

            // 檢查是否還有數據，如果沒有數據了才跳轉到列表頁面
            const remainingRows = document.querySelectorAll('tbody tr');
            if (remainingRows.length === 0) {
                setTimeout(() => {
                    window.location.href = window.mappingManagementRoute;
                }, 1500);
            }
        },
        function(error) {
            showAlert(error || 'Failed to delete mapping', 'error');
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
