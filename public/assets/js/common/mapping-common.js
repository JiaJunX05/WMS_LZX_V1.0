/**
 * Common Mapping Management JavaScript Functions
 * 通用映射管理交互邏輯
 */

/**
 * 狀態卡片選擇函數
 */
function selectStatusCard(card) {
    // 移除所有卡片的選中狀態
    document.querySelectorAll('.status-card').forEach(c => {
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
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            selectStatusCard(this);
        });
    });
}

/**
 * 驗證映射表單
 */
function validateMappingForm() {
    const categoryId = document.getElementById('category_id').value;
    const subcategoryId = document.getElementById('subcategory_id').value;

    if (!categoryId) {
        showAlert('Please select a category', 'warning');
        return false;
    }

    if (!subcategoryId) {
        showAlert('Please select a subcategory', 'warning');
        return false;
    }

    return true;
}

/**
 * 處理映射請求
 */
function handleMappingRequest(url, method, data, onSuccess, onError) {
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
            return response.json().then(data => {
                throw new Error(data.message || 'Server error');
            });
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
 * 創建映射
 */
function createMapping(mappingData, onSuccess, onError) {
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加映射數據
    mappingData.forEach((mapping, index) => {
        formData.append(`mappings[${index}][category_id]`, mapping.categoryId);
        formData.append(`mappings[${index}][subcategory_id]`, mapping.subcategoryId);
        formData.append(`mappings[${index}][mapping_status]`, mapping.status || 'Available');
    });

    handleMappingRequest(
        window.createMappingUrl,
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 更新映射
 */
function updateMapping(mappingId, formData, onSuccess, onError) {
    formData.append('_method', 'PUT');

    handleMappingRequest(
        window.updateMappingUrl.replace(':id', mappingId),
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 刪除映射
 */
function deleteMapping(mappingId, onSuccess, onError) {
    handleMappingRequest(
        window.deleteMappingUrl.replace(':id', mappingId),
        'DELETE',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置映射為可用
 */
function setMappingAvailable(mappingId, onSuccess, onError) {
    handleMappingRequest(
        window.availableMappingUrl.replace(':id', mappingId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置映射為不可用
 */
function setMappingUnavailable(mappingId, onSuccess, onError) {
    handleMappingRequest(
        window.unavailableMappingUrl.replace(':id', mappingId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 獲取映射狀態類別
 */
function getMappingStatusClass(status) {
    return status === 'Available' ? 'text-success' : 'text-danger';
}

/**
 * 檢查映射是否存在
 */
function isMappingExists(mappingList, categoryId, subcategoryId) {
    return mappingList.find(mapping =>
        mapping.categoryId === categoryId && mapping.subcategoryId === subcategoryId
    );
}

/**
 * 高亮顯示已存在的映射
 */
function highlightExistingMapping(element) {
    element.classList.add('border-danger', 'bg-danger-subtle');
    setTimeout(() => {
        element.classList.remove('border-danger', 'bg-danger-subtle');
    }, 3000);
}

/**
 * 更新配置摘要
 */
function updateConfigSummary() {
    const categorySelect = document.getElementById('category_id');
    const subcategorySelect = document.getElementById('subcategory_id');
    const configSummary = document.getElementById('configSummary');

    if (categorySelect && subcategorySelect && configSummary) {
        if (categorySelect.value && subcategorySelect.value) {
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
 * 處理子分類選擇變化
 */
function handleSubcategoryChange() {
    const subcategorySelect = document.getElementById('subcategory_id');
    if (subcategorySelect) {
        const selectedSubcategory = subcategorySelect.options[subcategorySelect.selectedIndex];
        const selectedSubcategoryDisplay = document.getElementById('selectedSubcategory');

        if (selectedSubcategoryDisplay) {
            selectedSubcategoryDisplay.textContent = selectedSubcategory.value ? selectedSubcategory.text : 'None';
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
 * 綁定映射事件
 */
function bindMappingEvents() {
    // 狀態卡片選擇
    setupStatusCardSelection();

    // 分類選擇變化
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
    }

    // 子分類選擇變化
    const subcategorySelect = document.getElementById('subcategory_id');
    if (subcategorySelect) {
        subcategorySelect.addEventListener('change', handleSubcategoryChange);
    }
}

/**
 * 初始化映射頁面
 */
function initializeMappingPage(config) {
    // 綁定事件監聽器
    bindMappingEvents();

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
