/**
 * Size Template Create Page JavaScript
 * 尺码模板创建页面交互逻辑
 */


document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializeTemplateCreate();
});

function initializeTemplateCreate() {
    // 绑定事件监听器
    bindEvents();

    // 绑定选择按钮事件
    bindSelectionButtons();

    // 初始化状态
    updateUI();
}

function bindEvents() {
    // 分类选择变化
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
    }

    // 性别选择变化
    const genderSelect = document.getElementById('gender_id');
    if (genderSelect) {
        genderSelect.addEventListener('change', handleGenderChange);
    }

    // 清除表单按钮
    const clearFormBtn = document.getElementById('clearForm');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }


    // Select All
    const selectAllBtn = document.getElementById('selectAllLibraries');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAllLibraries);
    }

    // 状态卡片选择
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        card.addEventListener('click', function() {
            selectStatusCard(this);
        });
    });

}

function handleCategoryChange() {
    updateConfigSummary();
    updateUI();
    loadAvailableSizeLibraries();
}

function handleGenderChange() {
    updateConfigSummary();
    updateUI();
    loadAvailableSizeLibraries();
}


function handleSizeLibraryChange() {
    updateConfigSummary();
    updateUI();
}

function loadAvailableSizeLibraries() {
    const categoryId = document.getElementById('category_id').value;
    const genderId = document.getElementById('gender_id').value;

    if (!categoryId || !genderId) {
        hideSizeLibraryCards();
        return;
    }

    // 显示加载状态
    showSizeLibraryLoading();

    // 发送 AJAX 请求获取可用的尺码库
    fetch(window.getAvailableSizeLibrariesUrl, {
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

function displaySizeLibraryCards(sizeLibraries) {
    const selectionArea = document.getElementById('sizeLibrarySelection');
    const container = document.getElementById('sizeLibraryCardsContainer');
    if (!selectionArea || !container) return;

    // 显示选择区域
    selectionArea.style.display = 'block';

    // 隐藏初始消息
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

    // 绑定卡片点击事件
    bindSizeLibraryCardEvents();
}

function hideSizeLibraryCards() {
    const selectionArea = document.getElementById('sizeLibrarySelection');
    if (selectionArea) {
        selectionArea.style.display = 'none';
    }

    // 显示初始消息
    const initialMessage = document.getElementById('initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'block';
    }
}

function bindSizeLibraryCardEvents() {
    const cards = document.querySelectorAll('.size-card');
    cards.forEach(card => {
        // 为复选框添加事件监听
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

function updateSelectionCounter() {
    const selectedCount = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]:checked').length;
    const counter = document.getElementById('selectionCounter');
    if (counter) {
        counter.textContent = `${selectedCount} selected`;
        counter.className = selectedCount > 0 ? 'badge bg-success' : 'badge bg-primary';
    }

    // 同时更新配置摘要
    updateConfigSummary();
}

function bindSelectionButtons() {
    // 全选按钮
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

    // 清除按钮
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

    // 获取选中的尺码库
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

    // 显示配置摘要
    const configSummary = document.getElementById('configSummary');
    if (categorySelect.value && genderSelect.value) {
        configSummary.style.display = 'block';

        // 更新选择信息
        const selectionInfo = document.getElementById('selectionInfo');
        if (selectionInfo) {
            selectionInfo.textContent = `(${categoryName} - ${genderName})`;
        }
    } else {
        configSummary.style.display = 'none';

        // 清空选择信息
        const selectionInfo = document.getElementById('selectionInfo');
        if (selectionInfo) {
            selectionInfo.textContent = '';
        }
    }
}

function clearForm() {
    // 清空选择
    document.getElementById('category_id').value = '';
    document.getElementById('gender_id').value = '';

    // 清空所有复选框
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

    // 显示/隐藏区域
    const initialMessage = document.getElementById('initial-message');
    const sizeLibrarySelection = document.getElementById('sizeLibrarySelection');

    // 检查是否有选择区域显示
    const isSelectionVisible = sizeLibrarySelection && sizeLibrarySelection.style.display !== 'none';

    if (isSelectionVisible) {
        // 如果选择区域已显示，隐藏初始消息
        initialMessage.style.display = 'none';
    } else {
        // 如果选择区域未显示，显示初始消息
        initialMessage.style.display = 'block';
    }
}

function selectStatusCard(card) {
    // 移除所有卡片的选中状态
    document.querySelectorAll('.status-card').forEach(c => {
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

// 表单提交前验证
document.getElementById('templateForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // 获取选中的尺码库
    const selectedCheckboxes = document.querySelectorAll('#sizeLibraryCardsContainer input[type="checkbox"]:checked');

    if (selectedCheckboxes.length === 0) {
        showAlert('Please select at least one size library', 'warning');
        return;
    }

    // 获取当前选择的 category 和 gender
    const categoryId = document.getElementById('category_id').value;
    const genderId = document.getElementById('gender_id').value;
    const templateStatus = document.querySelector('input[name="template_status"]:checked').value;

    // 准备提交数据
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

    // 添加模板数据
    selectedCheckboxes.forEach((checkbox, index) => {
        const libraryId = checkbox.value;

        formData.append(`templates[${index}][category_id]`, categoryId);
        formData.append(`templates[${index}][gender_id]`, genderId);
        formData.append(`templates[${index}][size_library_id]`, libraryId);
        formData.append(`templates[${index}][template_status]`, templateStatus);
    });

    // 提交数据
    fetch(window.createTemplateUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showAlert(data.message || 'Templates created successfully', 'success');
            // 创建成功后跳转到列表页面
            setTimeout(() => {
                window.location.href = window.templateManagementRoute;
            }, 1500);
        } else {
            showAlert(data.message || 'Failed to create templates', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error creating templates: ' + error.message, 'error');
    });
});

// showAlert 函数现在使用统一的 alert 系统
// 在页面加载时引入 alert-system.js 即可使用
