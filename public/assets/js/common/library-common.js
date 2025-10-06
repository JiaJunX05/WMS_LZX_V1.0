/**
 * Common Library Management JavaScript Functions
 * 通用尺碼庫管理交互邏輯
 */

/**
 * 狀態卡片選擇函數
 */
function selectStatusCard(card) {
    // 移除所有卡片的選中狀態
    document.querySelectorAll('.status-card, .library-status-card').forEach(c => {
        c.classList.remove('selected');
    });

    // 添加選中狀態到當前卡片
    card.classList.add('selected');

    // 更新對應的radio按鈕
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
    }
}

/**
 * 設置狀態卡片選擇事件
 */
function setupStatusCardSelection() {
    const statusCards = document.querySelectorAll('.status-card, .library-status-card');
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            selectStatusCard(this);
        });
    });
}

/**
 * 驗證尺碼庫表單
 */
function validateLibraryForm() {
    const categoryId = document.getElementById('category_id').value;
    const sizeValue = document.getElementById('size_value') ? document.getElementById('size_value').value.trim() : '';

    if (!categoryId) {
        showAlert('Please select a category', 'warning');
        return false;
    }

    if (sizeValue && !sizeValue) {
        showAlert('Please enter size value', 'warning');
        return false;
    }

    return true;
}

/**
 * 處理尺碼庫請求
 */
function handleLibraryRequest(url, method, data, onSuccess, onError) {
    fetch(url, {
        method: method,
        body: data,
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
            if (onSuccess) onSuccess(data);
        } else {
            if (onError) onError(data.message || 'Operation failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (onError) onError(error.message);
    });
}

/**
 * 創建尺碼庫
 */
function createLibrary(libraryData, onSuccess, onError) {
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
    formData.append('category_id', libraryData.categoryId);

    // 添加尺碼值
    if (libraryData.sizeValues && Array.isArray(libraryData.sizeValues)) {
        libraryData.sizeValues.forEach(sizeValue => {
            formData.append('size_values[]', sizeValue);
        });
    } else if (libraryData.sizeValue) {
        formData.append('size_value', libraryData.sizeValue);
    }

    // 添加狀態
    if (libraryData.status) {
        formData.append('size_status', libraryData.status);
    }

    handleLibraryRequest(
        window.createSizeLibraryUrl,
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 更新尺碼庫
 */
function updateLibrary(libraryId, formData, onSuccess, onError) {
    formData.append('_method', 'PUT');

    handleLibraryRequest(
        window.updateSizeLibraryUrl.replace(':id', libraryId),
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 刪除尺碼庫
 */
function deleteLibrary(libraryId, onSuccess, onError) {
    handleLibraryRequest(
        window.deleteSizeLibraryUrl.replace(':id', libraryId),
        'DELETE',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置尺碼庫為可用
 */
function setLibraryAvailable(libraryId, onSuccess, onError) {
    handleLibraryRequest(
        window.availableSizeLibraryUrl.replace(':id', libraryId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置尺碼庫為不可用
 */
function setLibraryUnavailable(libraryId, onSuccess, onError) {
    handleLibraryRequest(
        window.unavailableSizeLibraryUrl.replace(':id', libraryId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 獲取尺碼庫狀態類別
 */
function getLibraryStatusClass(status) {
    return status === 'Available' ? 'text-success' : 'text-danger';
}

/**
 * 檢查尺碼值是否存在
 */
function isSizeValueExists(sizeList, sizeValue) {
    return sizeList.some(item => item.sizeValue.toLowerCase() === sizeValue.toLowerCase());
}

/**
 * 高亮顯示已存在的尺碼值
 */
function highlightExistingSizeValue(element) {
    element.classList.add('duplicate-highlight');
    setTimeout(() => {
        element.classList.remove('duplicate-highlight');
    }, 3000);
}

/**
 * 更新配置摘要
 */
function updateConfigSummary() {
    const categorySelect = document.getElementById('category_id');
    const configSummary = document.getElementById('configSummary');

    if (categorySelect && configSummary) {
        if (categorySelect.value) {
            configSummary.style.display = 'block';
        } else {
            configSummary.style.display = 'none';
        }
    }
}

/**
 * 處理分類選擇變化
 */
function handleCategoryChange() {
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        const selectedCategory = categorySelect.options[categorySelect.selectedIndex];
        const selectedCategoryDisplay = document.getElementById('selectedCategory');

        if (selectedCategoryDisplay) {
            selectedCategoryDisplay.textContent = selectedCategory.value ? selectedCategory.text : 'None';
        }

        updateConfigSummary();
    }
}

/**
 * 更新分類信息
 */
function updateCategoryInfo() {
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        const selectedOption = categorySelect.options[categorySelect.selectedIndex];
        const categoryName = selectedOption.text;
        const categoryDisplay = document.querySelector('#selectedCategory');

        if (categoryDisplay) {
            categoryDisplay.textContent = categoryName;
        }
    }
}

/**
 * 更新尺碼庫選項
 */
function updateSizeLibraryOptions() {
    const categoryId = document.getElementById('category_id').value;
    const genderId = document.getElementById('gender_id') ? document.getElementById('gender_id').value : null;
    const sizeLibrarySelect = document.getElementById('size_library_id');

    if (!sizeLibrarySelect) return;

    // 如果類別沒有選擇，清空尺碼庫選項
    if (!categoryId) {
        sizeLibrarySelect.innerHTML = '<option value="">Please select category first</option>';
        sizeLibrarySelect.disabled = true;
        return;
    }

    // 顯示加載狀態
    sizeLibrarySelect.innerHTML = '<option value="">Loading...</option>';
    sizeLibrarySelect.disabled = true;

    // 構建請求URL
    let url = window.availableSizeLibrariesUrl;
    if (genderId) {
        url += `?category_id=${categoryId}&gender_id=${genderId}`;
    } else {
        url += `?category_id=${categoryId}`;
    }

    fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data) {
            sizeLibrarySelect.innerHTML = '<option value="">Select size library</option>';
            data.data.forEach(library => {
                const option = document.createElement('option');
                option.value = library.id;
                option.textContent = library.size_value;
                sizeLibrarySelect.appendChild(option);
            });
            sizeLibrarySelect.disabled = false;
        } else {
            sizeLibrarySelect.innerHTML = '<option value="">No size libraries available</option>';
            sizeLibrarySelect.disabled = true;
        }
    })
    .catch(error => {
        console.error('Error loading size libraries:', error);
        sizeLibrarySelect.innerHTML = '<option value="">Error loading size libraries</option>';
        sizeLibrarySelect.disabled = true;
    });
}

/**
 * 綁定尺碼庫事件
 */
function bindLibraryEvents() {
    // 狀態卡片選擇
    setupStatusCardSelection();

    // 分類選擇變化
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
    }

    // 性別選擇變化（如果有）
    const genderSelect = document.getElementById('gender_id');
    if (genderSelect) {
        genderSelect.addEventListener('change', updateSizeLibraryOptions);
    }
}

/**
 * 初始化尺碼庫頁面
 */
function initializeLibraryPage(config) {
    // 綁定事件監聽器
    bindLibraryEvents();

    // 初始化狀態
    updateConfigSummary();

    // 執行初始化回調函數（如果有）
    if (config && config.initializationCallback && typeof config.initializationCallback === 'function') {
        config.initializationCallback();
    }
}

/**
 * 工具函數：防抖
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * 工具函數：節流
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 工具函數：轉義HTML
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (s) => map[s]);
}

/**
 * 工具函數：格式化日期
 */
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

/**
 * 工具函數：格式化狀態
 */
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
