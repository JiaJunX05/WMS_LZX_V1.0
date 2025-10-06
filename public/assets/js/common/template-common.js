/**
 * Common Template Management JavaScript Functions
 * 通用尺碼模板管理交互邏輯
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
 * 驗證模板表單
 */
function validateTemplateForm() {
    const categoryId = document.getElementById('category_id').value;
    const genderId = document.getElementById('gender_id').value;
    const sizeLibraryId = document.getElementById('size_library_id') ? document.getElementById('size_library_id').value : '';

    if (!categoryId) {
        showAlert('Please select a category', 'warning');
        return false;
    }

    if (!genderId) {
        showAlert('Please select a gender', 'warning');
        return false;
    }

    if (sizeLibraryId && !sizeLibraryId) {
        showAlert('Please select a size library', 'warning');
        return false;
    }

    return true;
}

/**
 * 處理模板請求
 */
function handleTemplateRequest(url, method, data, onSuccess, onError) {
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
 * 創建模板
 */
function createTemplate(templateData, onSuccess, onError) {
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加模板數據
    if (templateData.templates && Array.isArray(templateData.templates)) {
        templateData.templates.forEach((template, index) => {
            formData.append(`templates[${index}][category_id]`, template.categoryId);
            formData.append(`templates[${index}][gender_id]`, template.genderId);
            formData.append(`templates[${index}][size_library_id]`, template.sizeLibraryId);
            formData.append(`templates[${index}][template_status]`, template.templateStatus);
        });
    } else {
        formData.append('category_id', templateData.categoryId);
        formData.append('gender_id', templateData.genderId);
        formData.append('size_library_id', templateData.sizeLibraryId);
        formData.append('template_status', templateData.templateStatus);
    }

    handleTemplateRequest(
        window.createTemplateUrl,
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 更新模板
 */
function updateTemplate(templateId, formData, onSuccess, onError) {
    formData.append('_method', 'PUT');

    handleTemplateRequest(
        window.updateTemplateUrl.replace(':id', templateId),
        'POST',
        formData,
        onSuccess,
        onError
    );
}

/**
 * 刪除模板
 */
function deleteTemplate(templateId, onSuccess, onError) {
    handleTemplateRequest(
        window.deleteTemplateUrl.replace(':id', templateId),
        'DELETE',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置模板為可用
 */
function setTemplateAvailable(templateId, onSuccess, onError) {
    handleTemplateRequest(
        window.availableTemplateUrl.replace(':id', templateId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 設置模板為不可用
 */
function setTemplateUnavailable(templateId, onSuccess, onError) {
    handleTemplateRequest(
        window.unavailableTemplateUrl.replace(':id', templateId),
        'PATCH',
        null,
        onSuccess,
        onError
    );
}

/**
 * 獲取模板狀態類別
 */
function getTemplateStatusClass(status) {
    return status === 'Available' ? 'text-success' : 'text-danger';
}

/**
 * 更新配置摘要
 */
function updateConfigSummary() {
    const categorySelect = document.getElementById('category_id');
    const genderSelect = document.getElementById('gender_id');
    const configSummary = document.getElementById('configSummary');

    if (categorySelect && genderSelect && configSummary) {
        if (categorySelect.value && genderSelect.value) {
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
    updateConfigSummary();
    updateUI();
    loadAvailableSizeLibraries();
}

/**
 * 處理性別選擇變化
 */
function handleGenderChange() {
    updateConfigSummary();
    updateUI();
    loadAvailableSizeLibraries();
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
 * 更新性別信息
 */
function updateGenderInfo() {
    const genderSelect = document.getElementById('gender_id');
    if (genderSelect) {
        const selectedOption = genderSelect.options[genderSelect.selectedIndex];
        const genderName = selectedOption.text;
        const genderDisplay = document.querySelector('#selectedGender');

        if (genderDisplay) {
            genderDisplay.textContent = genderName;
        }
    }
}

/**
 * 更新尺碼庫選項
 */
function updateSizeLibraryOptions() {
    const categoryId = document.getElementById('category_id').value;
    const genderId = document.getElementById('gender_id').value;
    const sizeLibrarySelect = document.getElementById('size_library_id');

    if (!sizeLibrarySelect) return;

    // 如果類別或性別沒有選擇，清空尺碼庫選項
    if (!categoryId || !genderId) {
        sizeLibrarySelect.innerHTML = '<option value="">Please select both category and gender first</option>';
        sizeLibrarySelect.disabled = true;
        return;
    }

    // 顯示加載狀態
    sizeLibrarySelect.innerHTML = '<option value="">Loading...</option>';
    sizeLibrarySelect.disabled = true;

    // 構建請求URL
    const url = window.availableSizeLibrariesUrl || window.getAvailableSizeLibrariesUrl;

    fetch(url, {
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
 * 加載可用的尺碼庫
 */
function loadAvailableSizeLibraries() {
    const categoryId = document.getElementById('category_id').value;
    const genderId = document.getElementById('gender_id').value;

    if (!categoryId || !genderId) {
        hideSizeLibraryCards();
        return;
    }

    // 顯示加載狀態
    showSizeLibraryLoading();

    // 發送 AJAX 請求獲取可用的尺碼庫
    const url = window.getAvailableSizeLibrariesUrl || window.availableSizeLibrariesUrl;

    fetch(url, {
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
        if (data.success) {
            displaySizeLibraryCards(data.data);
        } else {
            showAlert('Failed to load size libraries: ' + (data.message || 'Unknown error'), 'error');
            hideSizeLibraryCards();
        }
    })
    .catch(error => {
        console.error('Error loading size libraries:', error);
        showAlert('Error loading size libraries: ' + error.message, 'error');
        hideSizeLibraryCards();
    });
}

/**
 * 顯示尺碼庫加載狀態
 */
function showSizeLibraryLoading() {
    const container = document.getElementById('sizeLibraryCardsContainer');
    if (container) {
        container.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading available size libraries...</p>
            </div>
        `;
    }
}

/**
 * 顯示尺碼庫卡片
 */
function displaySizeLibraryCards(sizeLibraries) {
    const selectionArea = document.getElementById('sizeLibrarySelection');
    const container = document.getElementById('sizeLibraryCardsContainer');
    if (!selectionArea || !container) return;

    // 顯示選擇區域
    selectionArea.style.display = 'block';

    // 隱藏初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'none';
    }

    if (sizeLibraries.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-exclamation-circle fs-1 text-muted mb-3"></i>
                <h6 class="text-muted">No Available Size Libraries</h6>
                <p class="text-muted small">No size libraries found for the selected category and gender combination.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="sizes-grid">
            ${sizeLibraries.map(library => `
                <div class="size-card" data-size-value="${library.size_value}" data-library-id="${library.id}" data-status="${library.size_status}">
                    <input type="checkbox" name="size_library_ids[]" value="${library.id}" class="size-checkbox" id="size_${library.id}">
                    <label for="size_${library.id}" class="size-label">
                        <div class="size-value">${library.size_value}</div>
                        <div class="size-status">${library.size_status}</div>
                    </label>
                </div>
            `).join('')}
        </div>
    `;

    // 綁定卡片點擊事件
    bindSizeLibraryCardEvents();
}

/**
 * 隱藏尺碼庫卡片
 */
function hideSizeLibraryCards() {
    const selectionArea = document.getElementById('sizeLibrarySelection');
    if (selectionArea) {
        selectionArea.style.display = 'none';
    }

    // 顯示初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'block';
    }
}

/**
 * 綁定尺碼庫卡片事件
 */
function bindSizeLibraryCardEvents() {
    const cards = document.querySelectorAll('.size-card');
    cards.forEach(card => {
        // 為複選框添加事件監聽
        const checkbox = card.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
                updateSelectionCounter();
            });
        }
    });
}

/**
 * 更新選擇計數器
 */
function updateSelectionCounter() {
    const selectedCount = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]:checked').length;
    const counter = document.getElementById('selectionCounter');
    if (counter) {
        counter.textContent = `${selectedCount} selected`;
        counter.className = selectedCount > 0 ? 'badge bg-success' : 'badge bg-primary';
    }

    // 同時更新配置摘要
    updateConfigSummary();
}

/**
 * 綁定模板事件
 */
function bindTemplateEvents() {
    // 狀態卡片選擇
    setupStatusCardSelection();

    // 分類選擇變化
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
    }

    // 性別選擇變化
    const genderSelect = document.getElementById('gender_id');
    if (genderSelect) {
        genderSelect.addEventListener('change', handleGenderChange);
    }
}

/**
 * 初始化模板頁面
 */
function initializeTemplatePage(config) {
    // 綁定事件監聽器
    bindTemplateEvents();

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
