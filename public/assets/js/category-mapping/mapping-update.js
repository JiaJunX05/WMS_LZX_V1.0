/**
 * Mapping Update Page JavaScript
 * 映射更新頁面交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁面
    initializeMappingUpdate();
});

function initializeMappingUpdate() {
    // 使用通用初始化函數
    initializeMappingPage({
        initializationCallback: function() {
            bindUpdateEvents();
        }
    });
}

function bindUpdateEvents() {
    // 表單提交
    const form = document.getElementById('updateMappingForm');
    if (form) {
        form.addEventListener('submit', handleUpdateFormSubmit);
    }
}

function handleUpdateFormSubmit(e) {
    e.preventDefault();

    if (!validateMappingForm()) {
        return;
    }

    const formData = new FormData(e.target);
    const mappingId = formData.get('mapping_id') || window.mappingId;

    updateMapping(mappingId, formData,
        function(data) {
            showAlert(data.message || 'Mapping updated successfully', 'success');
            setTimeout(() => {
                window.location.href = window.mappingManagementRoute;
            }, 1500);
        },
        function(error) {
            if (error.includes('already exists') || error.includes('combination')) {
                showAlert('This mapping combination already exists. Please choose different category and subcategory.', 'warning');
            } else {
                showAlert(error || 'Failed to update mapping', 'error');
            }
        }
    );
}
