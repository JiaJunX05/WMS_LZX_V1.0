/**
 * Category Mapping Update Page JavaScript
 * 分类映射更新页面交互逻辑
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeMappingUpdate();
});

function initializeMappingUpdate() {
    // 使用通用初始化函数
    initializeUpdatePage({
        formId: 'updateMappingForm',
        updateUrl: window.updateMappingUrl,
        redirectRoute: window.mappingManagementRoute,
        successMessage: 'Mapping updated successfully',
        errorMessage: 'Failed to update mapping',
        warningMessage: 'This mapping combination already exists. Please choose different category and subcategory.',
        additionalSelectors: [
            {
                id: 'category_id',
                event: 'change',
                handler: updateCategoryInfo
            }
        ]
    });
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
