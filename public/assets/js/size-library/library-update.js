/**
 * Library Update Page JavaScript
 * 尺碼庫更新頁面交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁面
    initializeLibraryUpdate();
});

function initializeLibraryUpdate() {
    // 使用通用初始化函數
    initializeLibraryPage({
        initializationCallback: function() {
            bindUpdateEvents();
        }
    });
}

function bindUpdateEvents() {
    // 表單提交
    const form = document.getElementById('updateSizeLibraryForm');
    if (form) {
        form.addEventListener('submit', handleUpdateFormSubmit);
    }

    // 類別變化時更新尺碼庫選項（如果有的話）
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', updateCategoryInfo);
    }
}

function getCurrentIdFromUrl() {
    // 從 URL 中提取 ID
    const path = window.location.pathname;
    const matches = path.match(/\/(\d+)\/(edit|update)/);
    return matches ? matches[1] : null;
}

function handleUpdateFormSubmit(e) {
    e.preventDefault();

    if (!validateLibraryForm()) {
        return;
    }

    const formData = new FormData(e.target);

    // 獲取當前頁面的 ID
    const currentId = window.currentSizeLibraryId || getCurrentIdFromUrl();
    if (!currentId) {
        showAlert('Unable to determine library ID', 'error');
        return;
    }

    updateLibrary(currentId, formData,
        function(data) {
            showAlert(data.message || 'Library updated successfully', 'success');
            setTimeout(() => {
                window.location.href = window.libraryManagementRoute;
            }, 1500);
        },
        function(error) {
            if (error.includes('already exists') || error.includes('size value')) {
                showAlert('This size value already exists for the selected category. Please choose a different size value.', 'warning');
            } else {
                showAlert(error || 'Failed to update library', 'error');
            }
        }
    );
}

// 模態框相關函數（用於類別模式）
function openUpdateModal(sizeId, sizeValue, sizeStatus) {
    const modal = document.getElementById('updateModal');
    if (!modal) {
        showAlert('Update modal not found', 'error');
        return;
    }

    // 填充表單數據
    document.getElementById('updateSizeId').value = sizeId;
    document.getElementById('updateSizeValue').value = sizeValue;
    document.getElementById('updateSizeStatus').value = sizeStatus;

    // 顯示模態框
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

function submitUpdateForm() {
    const form = document.getElementById('updateSizeForm');
    if (!form) {
        showAlert('Update form not found', 'error');
        return;
    }

    const formData = new FormData(form);
    const sizeId = formData.get('size_id');

    if (!sizeId) {
        showAlert('Size ID is required', 'error');
        return;
    }

    // 顯示加載狀態
    const submitButton = document.querySelector('#updateModal .btn-primary');
    if (submitButton) {
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Updating...';
        submitButton.disabled = true;
    }

    updateLibrary(sizeId, formData,
        function(data) {
            showAlert(data.message || 'Library updated successfully', 'success');
            // 關閉模態框
            const modal = bootstrap.Modal.getInstance(document.getElementById('updateModal'));
            if (modal) {
                modal.hide();
            }
            // 刷新頁面
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        },
        function(error) {
            if (error.includes('already exists') || error.includes('size value')) {
                showAlert('This size value already exists for the selected category. Please choose a different size value.', 'warning');
            } else {
                showAlert(error || 'Failed to update library', 'error');
            }
        }
    );

    // 恢復按鈕狀態
    setTimeout(() => {
        if (submitButton) {
            submitButton.innerHTML = '<i class="bi bi-check-circle me-1"></i>Update Size';
            submitButton.disabled = false;
        }
    }, 1000);
}

// 刪除尺碼庫函數（用於類別模式）
function deleteLibrary(sizeId, sizeValue) {
    if (!confirm(`Are you sure you want to delete size "${sizeValue}"?`)) {
        return;
    }

    // 防止重複請求
    if (window.isDeleting) {
        return;
    }

    window.isDeleting = true;

    // 顯示加載狀態
    const deleteButton = document.querySelector(`[onclick*="deleteLibrary(${sizeId}"]`);
    if (deleteButton) {
        if (deleteButton.disabled) {
            return;
        }

        const originalText = deleteButton.innerHTML;
        deleteButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Deleting...';
        deleteButton.disabled = true;
    }

    deleteLibrary(sizeId,
        function(data) {
            showAlert('Library deleted successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        },
        function(error) {
            showAlert(error || 'Failed to delete library', 'error');
        }
    );

    // 重置刪除狀態
    setTimeout(() => {
        window.isDeleting = false;

        if (deleteButton) {
            deleteButton.innerHTML = '<i class="bi bi-trash me-2"></i>Delete';
            deleteButton.disabled = false;
        }
    }, 1000);
}
