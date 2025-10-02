/**
 * Size Template Update Page JavaScript
 * 尺码模板更新页面交互逻辑
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeTemplateUpdate();
});

function initializeTemplateUpdate() {
    // 使用通用初始化函数
    initializeUpdatePage({
        formId: 'updateTemplateForm',
        updateUrl: window.updateTemplateUrl,
        redirectRoute: window.templateManagementRoute,
        successMessage: 'Template updated successfully',
        errorMessage: 'Failed to update template',
        warningMessage: 'This template combination already exists. Please select a different size library or modify category/gender.',
        additionalSelectors: [
            {
                id: 'category_id',
                event: 'change',
                handler: updateSizeLibraryOptions
            },
            {
                id: 'gender_id',
                event: 'change',
                handler: updateSizeLibraryOptions
            }
        ],
        initializationCallback: updateSizeLibraryOptions
    });
}

function updateSizeLibraryOptions() {
    const categoryId = document.getElementById('category_id').value;
    const genderId = document.getElementById('gender_id').value;
    const sizeLibrarySelect = document.getElementById('size_library_id');

    // 如果类别或性别没有选择，清空尺码库选项
    if (!categoryId || !genderId) {
        sizeLibrarySelect.innerHTML = '<option value="">Please select both category and gender first</option>';
        sizeLibrarySelect.disabled = true;
        return;
    }

    // 显示加载状态
    sizeLibrarySelect.innerHTML = '<option value="">Loading...</option>';
    sizeLibrarySelect.disabled = true;

    // 获取可用的尺码库
    fetch(window.availableSizeLibrariesUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
            category_id: categoryId,
            gender_id: genderId
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

            // 设置当前选中的值
            const currentValue = sizeLibrarySelect.getAttribute('data-current-value');
            if (currentValue) {
                sizeLibrarySelect.value = currentValue;
            }
        } else {
            // 如果没有数据，显示所有可用的尺码库
            sizeLibrarySelect.innerHTML = '<option value="">Loading all available sizes...</option>';
            loadAllSizeLibraries();
        }

        sizeLibrarySelect.disabled = false;
    })
    .catch(error => {
        console.error('Error loading size libraries:', error);
        sizeLibrarySelect.innerHTML = '<option value="">Error loading sizes</option>';
        sizeLibrarySelect.disabled = false;
    });
}

function loadAllSizeLibraries() {
    const sizeLibrarySelect = document.getElementById('size_library_id');

    // 获取所有可用的尺码库
    fetch(window.availableSizeLibrariesUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
            category_id: 0, // 使用 0 表示获取所有
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

            // 设置当前选中的值
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


// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
