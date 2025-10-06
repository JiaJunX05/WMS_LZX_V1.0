/**
 * Template Create Page JavaScript
 * 尺碼模板創建頁面交互邏輯
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化頁面
    initializeTemplateCreate();
});

function initializeTemplateCreate() {
    // 使用通用初始化函數
    initializeTemplatePage({
        initializationCallback: function() {
            bindCreateEvents();
            updateUI();
        }
    });
}

function bindCreateEvents() {
    // 清除表單按鈕
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // Select All
    const selectAllBtn = document.getElementById('selectAllLibraries');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAllLibraries);
    }

    // 綁定選擇按鈕事件
    bindSelectionButtons();

    // 表單提交處理
    const form = document.getElementById('templateForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function bindSelectionButtons() {
    // 全選按鈕
    const selectAllBtn = document.getElementById('selectAllBtn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
                checkbox.closest('.size-card').classList.add('selected');
            });
            updateSelectionCounter();
        });
    }

    // 清除按鈕
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.closest('.size-card').classList.remove('selected');
            });
            updateSelectionCounter();
        });
    }
}

function updateConfigSummary() {
    const categorySelect = document.getElementById('category_id');
    const genderSelect = document.getElementById('gender_id');

    const categoryName = categorySelect.options[categorySelect.selectedIndex]?.text || 'None';
    const genderName = genderSelect.options[genderSelect.selectedIndex]?.text || 'None';

    // 獲取選中的尺碼庫
    const selectedCheckboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]:checked');
    let sizeLibraryText = 'None';

    if (selectedCheckboxes.length > 0) {
        const selectedSizes = Array.from(selectedCheckboxes).map(checkbox => {
            return checkbox.closest('.size-card').getAttribute('data-size-value');
        });
        if (selectedSizes.length === 1) {
            sizeLibraryText = selectedSizes[0];
        } else {
            sizeLibraryText = `${selectedSizes.length} templates`;
        }
    }

    document.getElementById('selectedCategory').textContent = categoryName;
    document.getElementById('selectedGender').textContent = genderName;
    document.getElementById('selectedSizeLibrary').textContent = sizeLibraryText;

    // 顯示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (categorySelect.value && genderSelect.value) {
        configSummary.style.display = 'block';

        // 更新選擇信息
        const selectionInfo = document.getElementById('selectionInfo');
        if (selectionInfo) {
            selectionInfo.textContent = `(${categoryName} - ${genderName})`;
        }
    } else {
        configSummary.style.display = 'none';

        // 清空選擇信息
        const selectionInfo = document.getElementById('selectionInfo');
        if (selectionInfo) {
            selectionInfo.textContent = '';
        }
    }
}

function clearForm() {
    // 清空選擇
    document.getElementById('category_id').value = '';
    document.getElementById('gender_id').value = '';

    // 清空所有複選框
    const checkboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('.size-card').classList.remove('selected');
    });

    // 更新UI
    updateUI();
    updateConfigSummary();
    hideSizeLibraryCards();

    showAlert('Form cleared successfully', 'success');
}

function selectAllLibraries() {
    const checkboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]');
    if (!checkboxes.length) {
        showAlert('No size libraries to select. Please choose category and gender first.', 'info');
        return;
    }

    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        checkbox.closest('.size-card').classList.add('selected');
    });

    updateSelectionCounter();
    showAlert('All size libraries selected', 'success');
}

function updateUI() {
    const categoryId = document.getElementById('category_id').value;
    const genderId = document.getElementById('gender_id').value;

    // 顯示/隱藏區域
    const initialMessage = document.getElementById('initial-message');
    const sizeLibrarySelection = document.getElementById('sizeLibrarySelection');

    // 檢查是否有選擇區域顯示
    const isSelectionVisible = sizeLibrarySelection && sizeLibrarySelection.style.display !== 'none';

    if (isSelectionVisible) {
        // 如果選擇區域已顯示，隱藏初始消息
        initialMessage.style.display = 'none';
    } else {
        // 如果選擇區域未顯示，顯示初始消息
        initialMessage.style.display = 'block';
    }
}

// 表單提交處理
function handleFormSubmit(e) {
    e.preventDefault();

    // 獲取選中的尺碼庫
    const selectedCheckboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]:checked');

    if (selectedCheckboxes.length === 0) {
        showAlert('Please select at least one size library', 'warning');
        return;
    }

    // 獲取當前選擇的 category 和 gender
    const categoryId = document.getElementById('category_id').value;
    const genderId = document.getElementById('gender_id').value;
    const templateStatus = document.querySelector('input[name="template_status"]:checked').value;

    // 準備提交數據
    const templates = Array.from(selectedCheckboxes).map((checkbox, index) => ({
        categoryId: categoryId,
        genderId: genderId,
        sizeLibraryId: checkbox.value,
        templateStatus: templateStatus
    }));

    // 使用通用創建函數
    createTemplate({ templates },
        function(data) {
            showAlert(data.message || 'Templates created successfully', 'success');
            setTimeout(() => {
                window.location.href = window.templateManagementRoute;
            }, 1500);
        },
        function(error) {
            showAlert(error || 'Error creating templates', 'error');
        }
    );
}
