/**
 * Size Library Update Page JavaScript
 * 尺码库更新页面交互逻辑
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeLibraryUpdate();
});

function initializeLibraryUpdate() {
    // 绑定事件监听器
    bindEvents();

    // 初始化状态
    updateUI();
}

function bindEvents() {
    // 状态卡片选择 - 使用 label 包装，自动处理点击
    const statusCards = document.querySelectorAll('.status-card, .library-status-card');
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
    const form = document.getElementById('updateSizeLibraryForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // 类别变化时更新尺码库选项（如果有的话）
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', updateCategoryInfo);
    }
}

function selectStatusCard(card) {
    // 移除所有卡片的选中状态
    document.querySelectorAll('.status-card, .library-status-card').forEach(c => {
        c.classList.remove('selected');
    });

    // 添加选中状态到当前卡片
    card.classList.add('selected');

    // 更新对应的radio按钮
    const status = card.getAttribute('data-status');
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
    }
}

function updateUI() {
    // 更新UI状态
    updateStatistics();
}

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

function updateCategoryInfo() {
    // 更新类别信息显示
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        const selectedOption = categorySelect.options[categorySelect.selectedIndex];
        const categoryName = selectedOption.text;

        // 更新显示
        const categoryDisplay = document.querySelector('#selectedCategory');
        if (categoryDisplay) {
            categoryDisplay.textContent = categoryName;
        }
    }
}

function getCurrentIdFromUrl() {
    // 从 URL 中提取 ID
    const path = window.location.pathname;
    const matches = path.match(/\/(\d+)\/(edit|update)/);
    return matches ? matches[1] : null;
}

function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    formData.append('_method', 'PUT');

    // 获取当前页面的 ID
    const currentId = window.currentSizeLibraryId || getCurrentIdFromUrl();
    if (!currentId) {
        showAlert('Unable to determine size library ID', 'error');
        return;
    }

    const updateUrl = window.updateSizeLibraryUrl.replace(':id', currentId);

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
            showAlert(data.message || 'Size library updated successfully', 'success');
            setTimeout(() => {
                window.location.href = window.libraryManagementRoute;
            }, 1500);
        } else {
            showAlert(data.message || 'Failed to update size library', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (error.message.includes('already exists') || error.message.includes('size value')) {
            showAlert('This size value already exists for the selected category. Please choose a different size value.', 'warning');
        } else {
            showAlert('Error updating size library: ' + error.message, 'error');
        }
    });
}

// 模态框相关函数（用于类别模式）
function openUpdateModal(sizeId, sizeValue, sizeStatus) {
    const modal = document.getElementById('updateModal');
    if (!modal) {
        showAlert('Update modal not found', 'error');
        return;
    }

    // 填充表单数据
    document.getElementById('updateSizeId').value = sizeId;
    document.getElementById('updateSizeValue').value = sizeValue;
    document.getElementById('updateSizeStatus').value = sizeStatus;

    // 显示模态框
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

    const updateUrl = window.updateSizeLibraryUrl.replace(':id', sizeId);

    // 显示加载状态
    const submitButton = document.querySelector('#updateModal .btn-primary');
    if (submitButton) {
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Updating...';
        submitButton.disabled = true;
    }

    fetch(updateUrl, {
        method: 'POST',
        body: formData,
        headers: {
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
            showAlert(data.message || 'Size library updated successfully', 'success');
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('updateModal'));
            if (modal) {
                modal.hide();
            }
            // 刷新页面
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showAlert(data.message || 'Failed to update size library', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (error.message.includes('already exists') || error.message.includes('size value')) {
            showAlert('This size value already exists for the selected category. Please choose a different size value.', 'warning');
        } else {
            showAlert('Error updating size library: ' + error.message, 'error');
        }
    })
    .finally(() => {
        // 恢复按钮状态
        if (submitButton) {
            submitButton.innerHTML = '<i class="bi bi-check-circle me-1"></i>Update Size';
            submitButton.disabled = false;
        }
    });
}

// 删除尺码库函数（用于类别模式）
function deleteSize(sizeId, sizeValue) {
    if (!confirm(`Are you sure you want to delete size "${sizeValue}"?`)) {
        return;
    }

    // 防止重复请求
    if (window.isDeleting) {
        return;
    }

    window.isDeleting = true;

    // 显示加载状态
    const deleteButton = document.querySelector(`[onclick*="deleteSize(${sizeId}"]`);
    if (deleteButton) {
        if (deleteButton.disabled) {
            return;
        }

        const originalText = deleteButton.innerHTML;
        deleteButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Deleting...';
        deleteButton.disabled = true;
    }

    const deleteUrl = window.deleteSizeLibraryUrl.replace(':id', sizeId);

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

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            return response.text().then(text => {
                if (response.status === 200 || response.status === 302) {
                    return { success: true, message: 'Size library deleted successfully' };
                }
                throw new Error('Unexpected response format');
            });
        }
    })
    .then(data => {
        if (data.success) {
            showAlert('Size library deleted successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showAlert(data.message || 'Failed to delete size library', 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting size library:', error);
        if (error.message.includes('200') || error.message.includes('302')) {
            showAlert('Size library deleted successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showAlert('An error occurred while deleting the size library: ' + error.message, 'error');
        }
    })
    .finally(() => {
        window.isDeleting = false;

        if (deleteButton) {
            deleteButton.innerHTML = '<i class="bi bi-trash me-2"></i>Delete';
            deleteButton.disabled = false;
        }
    });
}

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
