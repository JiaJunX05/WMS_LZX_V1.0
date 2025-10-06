/**
 * Template Update Page JavaScript
 * 尺碼模板更新頁面交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁面
    initializeTemplateUpdate();
});

function initializeTemplateUpdate() {
    // 使用通用初始化函數
    initializeTemplatePage({
        initializationCallback: function() {
            bindUpdateEvents();
        }
    });
}

function bindUpdateEvents() {
    // 表單提交
    const form = document.getElementById('updateTemplateForm');
    if (form) {
        form.addEventListener('submit', handleUpdateFormSubmit);
    }

    // 類別變化時更新尺碼庫選項（如果有的話）
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', updateSizeLibraryOptions);
    }

    // 性別變化時更新尺碼庫選項（如果有的話）
    const genderSelect = document.getElementById('gender_id');
    if (genderSelect) {
        genderSelect.addEventListener('change', updateSizeLibraryOptions);
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

    if (!validateTemplateForm()) {
        return;
    }

    const formData = new FormData(e.target);

    // 獲取當前頁面的 ID
    const currentId = window.currentTemplateId || getCurrentIdFromUrl();
    if (!currentId) {
        showAlert('Unable to determine template ID', 'error');
        return;
    }

    updateTemplate(currentId, formData,
        function(data) {
            showAlert(data.message || 'Template updated successfully', 'success');
            setTimeout(() => {
                window.location.href = window.templateManagementRoute;
            }, 1500);
        },
        function(error) {
            if (error.includes('already exists') || error.includes('template')) {
                showAlert('This template combination already exists. Please select a different size library or modify category/gender.', 'warning');
            } else {
                showAlert(error || 'Failed to update template', 'error');
            }
        }
    );
}

function loadAllSizeLibraries() {
    const sizeLibrarySelect = document.getElementById('size_library_id');

    // 獲取所有可用的尺碼庫
    const url = window.availableSizeLibrariesUrl || window.getAvailableSizeLibrariesUrl;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
            category_id: 0, // 使用 0 表示獲取所有
            gender_id: 0
        })
    })
    .then(response => response.json())
    .then(data => {
        sizeLibrarySelect.innerHTML = '<option value="">Select size library</option>';

        if (data.success && data.data && data.data.length > 0) {
            data.data.forEach(sizeLibrary => {
                const option = document.createElement('option');
                option.value = sizeLibrary.id;
                option.textContent = sizeLibrary.size_value;
                sizeLibrarySelect.appendChild(option);
            });

            // 設置當前選中的值
            const currentValue = sizeLibrarySelect.getAttribute('data-current-value');
            if (currentValue) {
                sizeLibrarySelect.value = currentValue;
            }
        } else {
            sizeLibrarySelect.innerHTML = '<option value="">No size libraries available</option>';
        }

        sizeLibrarySelect.disabled = false;
    })
    .catch(error => {
        console.error('Error loading all size libraries:', error);
        sizeLibrarySelect.innerHTML = '<option value="">Error loading sizes</option>';
        sizeLibrarySelect.disabled = false;
    });
}
