@extends("layouts.app")

@section("title", "Stock Movement History")
@section("content")

<link rel="stylesheet" href="{{ asset('assets/css/common/dashboard-template.css') }}">

<style>
/* 实时筛选器样式 */
.form-label {
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
}

.form-select-sm, .form-control-sm {
    border-radius: 0.375rem;
    transition: all 0.2s ease-in-out;
}

.form-select-sm:focus, .form-control-sm:focus {
    border-color: #86b7fe;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.input-group .btn {
    border-color: #dee2e6;
}

.input-group .btn:hover {
    background-color: #f8f9fa;
    border-color: #dee2e6;
}

/* 活跃筛选器标签动画 */
#activeFilters {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.badge {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
}

/* 加载状态 */
.loading {
    opacity: 0.6;
    pointer-events: none;
}

/* 响应式优化 */
@media (max-width: 768px) {
    .col-lg-2, .col-lg-4 {
        margin-bottom: 1rem;
    }

    .form-label {
        font-size: 0.8rem;
    }
}
</style>

<div class="container-fluid py-4">
    <!-- Alert Messages -->
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if($errors->any())
        <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            @foreach ($errors->all() as $error)
                <div>{{ $error }}</div>
            @endforeach
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <!-- 页面标题和统计卡片 -->
    <div class="dashboard-header mb-4">
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center">
                            <div class="header-icon-wrapper me-4">
                                <i class="bi bi-clock-history"></i>
                            </div>
                            <div>
                                <h2 class="dashboard-title mb-1">Stock Movement History</h2>
                                <p class="dashboard-subtitle mb-0">Track and analyze all stock movements</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 text-end">
                        <!-- Export button removed -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 统计卡片 -->
    <div class="row mb-4" id="statisticsCards">
        <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-arrow-up-circle-fill text-success fs-2 mb-2"></i>
                    <h6 class="card-title text-muted">Total Stock In</h6>
                    <h4 class="text-success" id="totalStockIn">0</h4>
                </div>
            </div>
        </div>
        <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-arrow-down-circle-fill text-danger fs-2 mb-2"></i>
                    <h6 class="card-title text-muted">Total Stock Out</h6>
                    <h4 class="text-danger" id="totalStockOut">0</h4>
                </div>
            </div>
        </div>
        <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-graph-up text-primary fs-2 mb-2"></i>
                    <h6 class="card-title text-muted">Net Change</h6>
                    <h4 class="text-primary" id="netChange">0</h4>
                </div>
            </div>
        </div>
        <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-activity text-info fs-2 mb-2"></i>
                    <h6 class="card-title text-muted">Total Movements</h6>
                    <h4 class="text-info" id="totalMovements">0</h4>
                </div>
            </div>
        </div>
        <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-box-seam text-secondary fs-2 mb-2"></i>
                    <h6 class="card-title text-muted">Current Stock</h6>
                    <h4 class="text-secondary" id="currentTotalStock">0</h4>
                </div>
            </div>
        </div>
        <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div class="card border-0 shadow-sm">
                <div class="card-body text-center">
                    <i class="bi bi-exclamation-triangle-fill text-warning fs-2 mb-2"></i>
                    <h6 class="card-title text-muted">Low Stock Items</h6>
                    <h4 class="text-warning" id="lowStockCount">0</h4>
                </div>
            </div>
        </div>
    </div>

    <!-- 实时筛选器 -->
    <div class="card shadow-sm border-0 mb-4">
        <div class="card-body">
            <div class="row g-3 align-items-end">
                <div class="col-lg-4 col-md-6">
                    <label for="searchInput" class="form-label fw-medium text-muted mb-2">
                        <i class="bi bi-search me-1"></i>Search
                    </label>
                    <input type="text" class="form-control form-control-sm" id="searchInput" placeholder="Search by product name, SKU, barcode, or reference number...">
                </div>
                <div class="col-lg-2 col-md-3">
                    <label for="startDate" class="form-label fw-medium text-muted mb-2">
                        <i class="bi bi-calendar-range me-1"></i>From
                    </label>
                    <input type="date" class="form-control form-control-sm" id="startDate">
                </div>
                <div class="col-lg-2 col-md-3">
                    <label for="endDate" class="form-label fw-medium text-muted mb-2">
                        <i class="bi bi-calendar-range me-1"></i>To
                    </label>
                    <input type="date" class="form-control form-control-sm" id="endDate">
                </div>
                <div class="col-lg-2 col-md-6">
                    <label for="movementTypeFilter" class="form-label fw-medium text-muted mb-2">
                        <i class="bi bi-funnel me-1"></i>Filter
                    </label>
                    <select class="form-select form-select-sm" id="movementTypeFilter">
                        <option value="all">All Types</option>
                        <option value="stock_in">Stock In</option>
                        <option value="stock_out">Stock Out</option>
                    </select>
                </div>
                <div class="col-lg-2 col-md-6">
                    <button type="button" class="btn btn-outline-primary btn-sm w-100" id="clearAllFilters">
                        <i class="bi bi-arrow-clockwise me-1"></i>Reset
                    </button>
                </div>
            </div>

            <!-- 活跃筛选器标签 -->
            <div class="mt-3" id="activeFilters" style="display: none;">
                <div class="d-flex flex-wrap gap-2 align-items-center">
                    <small class="text-muted fw-medium">Active filters:</small>
                    <div id="filterTags"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- 数据表格 -->
    <div class="card shadow-sm border-0">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover" id="stockHistoryTable">
                    <thead class="table-light">
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Quantity</th>
                            <th>Before</th>
                            <th>After</th>
                            <th>Reason</th>
                            <th>User</th>
                            <th>Reference</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody id="stockHistoryTableBody">
                        <tr>
                            <td colspan="11" class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-2 text-muted">Loading stock history...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- 分页 -->
    <div class="d-flex justify-content-between align-items-center mt-4" style="display: flex !important;">
        <div class="pagination-info text-muted">
            Showing <span class="fw-medium" id="showing-start">0</span>
            to <span class="fw-medium" id="showing-end">0</span>
            of <span class="fw-medium" id="total-count">0</span> entries
        </div>
        <nav aria-label="Page navigation">
            <ul id="pagination" class="pagination pagination-sm mb-0">
                <li class="page-item disabled" id="prev-page">
                    <a class="page-link" href="#" aria-label="Previous">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                </li>
                <!-- Page numbers generated dynamically by JS -->
                <li class="page-item disabled" id="next-page">
                    <a class="page-link" href="#" aria-label="Next">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</div>

<!-- Product Stock History Modal -->
<div class="modal fade" id="productHistoryModal" tabindex="-1">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="bi bi-clock-history me-2"></i>
                    Stock Movement History
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3" id="productInfo">
                    <!-- Product info will be loaded here -->
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Before</th>
                                <th>After</th>
                                <th>Reason</th>
                                <th>User</th>
                                <th>Reference</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody id="productHistoryTableBody">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    let currentFilters = {};

    // 初始化
    loadStockHistory();
    loadStatistics();

    // 确保分页容器始终可见
    const paginationContainer = document.querySelector('.d-flex.justify-content-between.align-items-center.mt-4');
    if (paginationContainer) {
        paginationContainer.style.display = 'flex';
    }

    // 实时筛选事件
    let filterTimeout;

    function applyFilters() {
        currentFilters = {
            movement_type: document.getElementById('movementTypeFilter').value,
            start_date: document.getElementById('startDate').value,
            end_date: document.getElementById('endDate').value,
            search: document.getElementById('searchInput').value
        };
        currentPage = 1;
        loadStockHistory();
        loadStatistics();
        updateActiveFilters();
    }

    function debouncedFilter() {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(applyFilters, 300); // 300ms延迟
    }

    // 为所有筛选器添加实时监听
    document.getElementById('movementTypeFilter').addEventListener('change', applyFilters);
    document.getElementById('startDate').addEventListener('change', applyFilters);
    document.getElementById('endDate').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', debouncedFilter);

    // 重置所有筛选器
    document.getElementById('clearAllFilters').addEventListener('click', function() {
        document.getElementById('movementTypeFilter').value = 'all';
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('searchInput').value = '';
        currentFilters = {};
        currentPage = 1;
        loadStockHistory();
        loadStatistics();
        updateActiveFilters();
    });


    // 加载库存历史
    function loadStockHistory() {
        const tableContainer = document.querySelector('.table-responsive');
        tableContainer.classList.add('loading');

        const params = new URLSearchParams({
            ...currentFilters,
            page: currentPage
        });

        fetch('{{ route("api.stock_history") }}?' + params.toString())
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    renderTable(data.movements || data.data);
                    updatePagination(data);
                } else {
                    showError('Failed to load stock history: ' + (data.message || 'Unknown error'));
                }
            })
            .catch(error => {
                showError('Failed to load stock history: ' + error.message);
            })
            .finally(() => {
                tableContainer.classList.remove('loading');
            });
    }

    // 加载统计数据
    function loadStatistics() {
        const params = new URLSearchParams({
            start_date: currentFilters.start_date || '',
            end_date: currentFilters.end_date || ''
        });

        fetch('{{ route("api.stock_statistics") }}?' + params.toString())
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateStatistics(data.statistics);
                }
            })
            .catch(error => {
                console.error('Statistics error:', error);
            });
    }

    // 渲染表格
    function renderTable(data) {
        const tbody = document.getElementById('stockHistoryTableBody');

        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center py-4">
                        <i class="bi bi-inbox fs-1 text-muted"></i>
                        <p class="mt-2 text-muted">No stock movements found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${formatDate(item.date)}</td>
                <td>
                    <span class="badge ${item.type === 'stock_in' ? 'bg-success' : 'bg-danger'}">
                        <i class="bi ${item.type === 'stock_in' ? 'bi-arrow-up' : 'bi-arrow-down'} me-1"></i>
                        ${item.type === 'stock_in' ? 'IN' : 'OUT'}
                    </span>
                </td>
                <td>
                    <a href="#" onclick="showProductHistory(${item.product_id || 0})" class="text-decoration-none">
                        ${item.product_name}
                    </a>
                </td>
                <td><code>${item.sku_code}</code></td>
                <td>
                    <span class="${item.quantity > 0 ? 'text-success' : 'text-danger'}">
                        ${item.quantity > 0 ? '+' : ''}${item.quantity}
                    </span>
                </td>
                <td>${item.previous_stock}</td>
                <td>${item.current_stock}</td>
                <td>
                    <span class="badge bg-secondary">${item.movement_reason}</span>
                </td>
                <td>${item.user_name}</td>
                <td>${item.reference_number || '-'}</td>
                <td>${item.notes ? `<small>${item.notes}</small>` : '-'}</td>
            </tr>
        `).join('');
    }

    // 更新统计数据
    function updateStatistics(stats) {
        document.getElementById('totalStockIn').textContent = stats.total_stock_in || 0;
        document.getElementById('totalStockOut').textContent = stats.total_stock_out || 0;
        document.getElementById('netChange').textContent = stats.net_change || 0;
        document.getElementById('totalMovements').textContent = stats.total_movements || 0;
        document.getElementById('currentTotalStock').textContent = stats.current_total_stock || 0;
        document.getElementById('lowStockCount').textContent = stats.low_stock_count || 0;
    }

    // 更新分页信息
    function updatePagination(response) {
        const pagination = response.pagination || {};
        document.getElementById('showing-start').textContent = pagination.from || 0;
        document.getElementById('showing-end').textContent = pagination.to || 0;
        document.getElementById('total-count').textContent = pagination.total || 0;

        generatePagination(response);
    }

    // 生成分页导航 - 使用与其他dashboard一致的逻辑
    function generatePagination(data) {
        // 清除现有页码（保留prev和next按钮）
        const paginationUl = document.getElementById('pagination');
        const existingPageNumbers = paginationUl.querySelectorAll('li:not(#prev-page):not(#next-page)');
        existingPageNumbers.forEach(el => el.remove());

        const pagination = data.pagination || {};
        if (!pagination.last_page) return;

        let paginationHTML = '';
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        // 更新prev按钮状态
        prevBtn.classList.toggle('disabled', pagination.current_page <= 1);

        // 生成页码逻辑（与其他dashboard一致）
        if (pagination.last_page > 7) {
            for (let i = 1; i <= pagination.last_page; i++) {
                if (i === 1 || i === pagination.last_page || (i >= pagination.current_page - 1 && i <= pagination.current_page + 1)) {
                    paginationHTML += `<li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                        <a class="page-link pagination-btn" href="#" data-page="${i}">${i}</a>
                    </li>`;

                    if ((i === 1 && pagination.current_page > 3) || (i === pagination.current_page + 1 && i < pagination.last_page - 1)) {
                        paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
                    }
                }
            }
        } else {
            for (let i = 1; i <= pagination.last_page; i++) {
                paginationHTML += `<li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                    <a class="page-link pagination-btn" href="#" data-page="${i}">${i}</a>
                </li>`;
            }
        }

        // 插入页码到next按钮之前
        nextBtn.insertAdjacentHTML('beforebegin', paginationHTML);

        // 更新next按钮状态
        nextBtn.classList.toggle('disabled', pagination.current_page >= pagination.last_page);

        // 绑定页码点击事件
        document.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.getAttribute('data-page'));
                if (page !== pagination.current_page) {
                    currentPage = page;
                    loadStockHistory();
                }
            });
        });

        // 绑定prev/next按钮事件
        prevBtn.onclick = (e) => {
            e.preventDefault();
            if (pagination.current_page > 1) {
                currentPage = pagination.current_page - 1;
                loadStockHistory();
            }
        };

        nextBtn.onclick = (e) => {
            e.preventDefault();
            if (pagination.current_page < pagination.last_page) {
                currentPage = pagination.current_page + 1;
                loadStockHistory();
            }
        };
    }

    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 显示错误
    function showError(message) {
        const tbody = document.getElementById('stockHistoryTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center py-4">
                    <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
                    <p class="mt-2 text-danger">${message}</p>
                </td>
            </tr>
        `;
    }

    // 更新活跃筛选器标签
    function updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('activeFilters');
        const filterTagsContainer = document.getElementById('filterTags');

        let tags = [];

        // 检查类型筛选
        const typeFilter = document.getElementById('movementTypeFilter').value;
        if (typeFilter !== 'all') {
            const typeText = typeFilter === 'stock_in' ? 'Stock In' : 'Stock Out';
            tags.push(`<span class="badge bg-primary me-1">${typeText}</span>`);
        }

        // 检查日期筛选
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        if (startDate || endDate) {
            let dateText = 'Date: ';
            if (startDate && endDate) {
                dateText += `${startDate} to ${endDate}`;
            } else if (startDate) {
                dateText += `from ${startDate}`;
            } else if (endDate) {
                dateText += `until ${endDate}`;
            }
            tags.push(`<span class="badge bg-info me-1">${dateText}</span>`);
        }

        // 检查搜索筛选
        const searchValue = document.getElementById('searchInput').value.trim();
        if (searchValue) {
            tags.push(`<span class="badge bg-success me-1">Search: "${searchValue}"</span>`);
        }

        // 显示或隐藏活跃筛选器区域
        if (tags.length > 0) {
            filterTagsContainer.innerHTML = tags.join('');
            activeFiltersContainer.style.display = 'block';
        } else {
            activeFiltersContainer.style.display = 'none';
        }
    }

    // 显示产品历史（全局函数）
    window.showProductHistory = function(productId) {
        // 实现产品特定历史记录的模态框
        console.log('Show history for product:', productId);
    };
});
</script>
@endsection
